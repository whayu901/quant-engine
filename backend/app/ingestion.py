"""
Phase 1: Ingestion module for various data sources
"""

import json
import io
from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
from openpyxl import load_workbook
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from .models import Project, Transcript, TranscriptSegment
from .models import _uid


class XLSXParser:
    """Parser for Excel files containing open-ended survey responses"""

    @staticmethod
    async def parse_openends(
        file: UploadFile,
        project_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Parse Excel file with open-ended responses.
        Expected format: columns for respondent_id, question, response, [metadata columns]
        """
        try:
            # Read Excel file
            contents = await file.read()
            df = pd.read_excel(io.BytesIO(contents))

            # Validate required columns
            required_cols = ['respondent_id', 'response']
            if not all(col in df.columns for col in required_cols):
                raise HTTPException(
                    status_code=400,
                    detail=f"Excel must have columns: {required_cols}"
                )

            # Get question column or use default
            question_col = 'question' if 'question' in df.columns else None

            # Process responses
            responses = []
            for _, row in df.iterrows():
                resp = {
                    'respondent_id': str(row['respondent_id']),
                    'response': str(row['response']),
                    'question': str(row[question_col]) if question_col else 'Open-ended response',
                    'metadata': {}
                }

                # Add any additional columns as metadata
                for col in df.columns:
                    if col not in ['respondent_id', 'response', 'question']:
                        resp['metadata'][col] = str(row[col]) if pd.notna(row[col]) else None

                responses.append(resp)

            # Create transcript from responses
            transcript = Transcript(
                id=_uid(),
                org_id=db.query(Project).filter_by(id=project_id).first().org_id,
                project_id=project_id,
                title=f"Open-ends Import - {file.filename}",
                language="auto",  # Will detect from content
                transcription_status="completed",
                source_type="xlsx_import",
                created_at=datetime.utcnow()
            )
            db.add(transcript)

            # Create segments from responses
            for idx, resp in enumerate(responses):
                segment = TranscriptSegment(
                    id=_uid(),
                    transcript_id=transcript.id,
                    speaker=resp['respondent_id'],
                    text=resp['response'],
                    segment_index=idx,
                    metadata=json.dumps({
                        'question': resp['question'],
                        **resp['metadata']
                    })
                )
                db.add(segment)

            db.commit()

            return {
                'status': 'success',
                'transcript_id': transcript.id,
                'responses_imported': len(responses),
                'questions': list(set(r['question'] for r in responses))
            }

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))


class TranscriptEditor:
    """Handle transcript corrections and updates"""

    @staticmethod
    async def correct_segment(
        segment_id: str,
        corrected_text: str,
        db: Session
    ) -> Dict[str, Any]:
        """Correct/edit a transcript segment"""
        segment = db.query(TranscriptSegment).filter_by(id=segment_id).first()

        if not segment:
            raise HTTPException(status_code=404, detail="Segment not found")

        # Store original text in metadata
        metadata = json.loads(segment.metadata or '{}')
        if 'original_text' not in metadata:
            metadata['original_text'] = segment.text
        metadata['last_edited'] = datetime.utcnow().isoformat()

        # Update segment
        segment.text = corrected_text
        segment.metadata = json.dumps(metadata)

        db.commit()

        return {
            'status': 'success',
            'segment_id': segment_id,
            'updated_text': corrected_text
        }


class TranscriptTranslator:
    """Handle transcript translation"""

    @staticmethod
    async def translate_transcript(
        transcript_id: str,
        target_language: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Translate entire transcript to target language.
        For Phase 1, this is a mock implementation.
        """
        transcript = db.query(Transcript).filter_by(id=transcript_id).first()

        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")

        # Mock translation - in production, use actual translation service
        segments = db.query(TranscriptSegment).filter_by(
            transcript_id=transcript_id
        ).order_by(TranscriptSegment.segment_index).all()

        translated_count = 0
        for segment in segments:
            metadata = json.loads(segment.metadata or '{}')

            # Store original text
            if 'original_text' not in metadata:
                metadata['original_text'] = segment.text

            # Mock translation (in prod: use Google Translate or similar)
            if target_language == 'en' and transcript.language in ['id', 'ms', 'th']:
                # Simulate translation
                metadata['translated_to'] = target_language
                metadata['translation_timestamp'] = datetime.utcnow().isoformat()
                segment.metadata = json.dumps(metadata)
                translated_count += 1

        # Update transcript language
        transcript.language = f"{transcript.language}->{target_language}"
        db.commit()

        return {
            'status': 'success',
            'transcript_id': transcript_id,
            'segments_translated': translated_count,
            'target_language': target_language
        }


class WhatsAppImporter:
    """Import WhatsApp chat exports for diary studies"""

    @staticmethod
    async def import_chat(
        file: UploadFile,
        project_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Import WhatsApp chat export.
        Supports the standard WhatsApp export format.
        """
        try:
            contents = await file.read()
            text = contents.decode('utf-8')

            # Parse WhatsApp format: [date, time] sender: message
            messages = []
            current_msg = None

            for line in text.split('\n'):
                # Check if line starts with timestamp
                if line and '[' in line[:20]:
                    # Save previous message
                    if current_msg:
                        messages.append(current_msg)

                    # Parse new message
                    parts = line.split(']', 1)
                    if len(parts) == 2:
                        timestamp_str = parts[0].strip('[')
                        rest = parts[1].strip()

                        if ':' in rest:
                            sender_end = rest.index(':')
                            sender = rest[:sender_end].strip()
                            message = rest[sender_end + 1:].strip()

                            current_msg = {
                                'timestamp': timestamp_str,
                                'sender': sender,
                                'message': message
                            }
                elif current_msg:
                    # Continuation of previous message
                    current_msg['message'] += '\n' + line

            # Add last message
            if current_msg:
                messages.append(current_msg)

            # Create transcript
            transcript = Transcript(
                id=_uid(),
                org_id=db.query(Project).filter_by(id=project_id).first().org_id,
                project_id=project_id,
                title=f"WhatsApp Import - {file.filename}",
                language="auto",
                transcription_status="completed",
                source_type="whatsapp_import",
                created_at=datetime.utcnow()
            )
            db.add(transcript)

            # Create segments from messages
            for idx, msg in enumerate(messages):
                segment = TranscriptSegment(
                    id=_uid(),
                    transcript_id=transcript.id,
                    speaker=msg['sender'],
                    text=msg['message'],
                    segment_index=idx,
                    metadata=json.dumps({
                        'timestamp': msg['timestamp'],
                        'source': 'whatsapp'
                    })
                )
                db.add(segment)

            db.commit()

            return {
                'status': 'success',
                'transcript_id': transcript.id,
                'messages_imported': len(messages),
                'participants': list(set(m['sender'] for m in messages))
            }

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))