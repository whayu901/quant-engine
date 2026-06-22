"""
Phase 1: Live Recorder integration (Recall.ai mock for dev)
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from enum import Enum

from sqlalchemy.orm import Session
from fastapi import HTTPException


class RecordingPlatform(str, Enum):
    ZOOM = "zoom"
    GOOGLE_MEET = "meet"
    MS_TEAMS = "teams"
    WEBEX = "webex"


class RecordingStatus(str, Enum):
    SCHEDULED = "scheduled"
    JOINING = "joining"
    RECORDING = "recording"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class RecallAIClient:
    """
    Mock Recall.ai client for development.
    In production, this would integrate with actual Recall.ai API
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or "mock-recall-ai-key"
        self.base_url = "https://api.recall.ai/v2"  # Mock URL

    async def create_bot(
        self,
        meeting_url: str,
        bot_name: str = "Qual Engine Recorder"
    ) -> Dict[str, Any]:
        """Create a recording bot for a meeting"""
        # Mock implementation
        bot_id = f"bot_{uuid.uuid4().hex[:8]}"

        # Simulate API response
        return {
            "id": bot_id,
            "bot_name": bot_name,
            "meeting_url": meeting_url,
            "status": "created",
            "created_at": datetime.utcnow().isoformat()
        }

    async def get_bot_status(self, bot_id: str) -> Dict[str, Any]:
        """Get status of a recording bot"""
        # Mock implementation - simulate different statuses
        import random

        statuses = ["joining", "in_meeting", "recording", "done", "error"]
        mock_status = random.choice(statuses)

        return {
            "id": bot_id,
            "status": mock_status,
            "recording_url": f"https://storage.recall.ai/{bot_id}/recording.mp4" if mock_status == "done" else None,
            "transcript_url": f"https://storage.recall.ai/{bot_id}/transcript.json" if mock_status == "done" else None,
            "duration_seconds": 1800 if mock_status == "done" else None
        }

    async def get_recording(self, bot_id: str) -> bytes:
        """Download recording file (mock)"""
        # In production, download actual file
        # For mock, return empty bytes
        return b"mock-recording-data"

    async def get_transcript(self, bot_id: str) -> Dict[str, Any]:
        """Get meeting transcript (mock)"""
        # Mock transcript data
        return {
            "meeting_id": bot_id,
            "duration_seconds": 1800,
            "participants": [
                {"name": "Moderator", "id": "p1"},
                {"name": "Participant 1", "id": "p2"},
                {"name": "Participant 2", "id": "p3"}
            ],
            "transcript": [
                {
                    "speaker": "Moderator",
                    "start_time": 0,
                    "end_time": 15,
                    "text": "Welcome everyone to today's focus group discussion about online shopping habits."
                },
                {
                    "speaker": "Participant 1",
                    "start_time": 15,
                    "end_time": 45,
                    "text": "Thank you for having me. I'm excited to share my experiences with e-commerce in Indonesia."
                },
                {
                    "speaker": "Participant 2",
                    "start_time": 45,
                    "end_time": 75,
                    "text": "Yes, same here. I think online shopping has really changed during the pandemic."
                }
            ]
        }


class LiveRecorder:
    """Manages live recording sessions"""

    def __init__(self, db: Session):
        self.db = db
        self.recall_client = RecallAIClient()

    async def schedule_recording(
        self,
        project_id: str,
        meeting_url: str,
        platform: RecordingPlatform,
        scheduled_at: datetime,
        bot_name: Optional[str] = None
    ) -> str:
        """Schedule a recording session"""
        from .models_phase1 import RecordingSession

        # Create recording session
        session = RecordingSession(
            project_id=project_id,
            platform=platform.value,
            meeting_url=meeting_url,
            status=RecordingStatus.SCHEDULED.value,
            scheduled_at=scheduled_at
        )
        self.db.add(session)
        self.db.commit()

        # If scheduled time is within 5 minutes, start bot immediately
        if scheduled_at <= datetime.utcnow() + timedelta(minutes=5):
            await self.start_recording(session.id, bot_name)

        return session.id

    async def start_recording(
        self,
        session_id: str,
        bot_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Start recording a session"""
        from .models_phase1 import RecordingSession

        session = self.db.query(RecordingSession).filter_by(id=session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Recording session not found")

        # Create bot via Recall.ai
        bot_response = await self.recall_client.create_bot(
            meeting_url=session.meeting_url,
            bot_name=bot_name or "Qual Engine Recorder"
        )

        # Update session
        session.status = RecordingStatus.JOINING.value
        session.started_at = datetime.utcnow()
        # Store bot_id in metadata or add field
        self.db.commit()

        # Start background task to monitor recording
        asyncio.create_task(self._monitor_recording(session_id, bot_response["id"]))

        return {
            "session_id": session_id,
            "status": session.status,
            "bot_id": bot_response["id"]
        }

    async def _monitor_recording(self, session_id: str, bot_id: str):
        """Background task to monitor recording progress"""
        from .models_phase1 import RecordingSession
        from .models import MediaAsset, Transcript, TranscriptSegment

        while True:
            await asyncio.sleep(10)  # Check every 10 seconds

            # Get bot status
            status = await self.recall_client.get_bot_status(bot_id)

            # Update session status
            session = self.db.query(RecordingSession).filter_by(id=session_id).first()
            if not session:
                break

            if status["status"] == "in_meeting":
                session.status = RecordingStatus.RECORDING.value
            elif status["status"] == "done":
                session.status = RecordingStatus.PROCESSING.value
                self.db.commit()

                # Process recording and transcript
                try:
                    # Get transcript
                    transcript_data = await self.recall_client.get_transcript(bot_id)

                    # Create media asset
                    media = MediaAsset(
                        org_id=session.project.org_id,
                        project_id=session.project_id,
                        filename=f"recording_{bot_id}.mp4",
                        media_type="video",
                        duration_seconds=transcript_data["duration_seconds"],
                        storage_key=f"recordings/{bot_id}/video.mp4"
                    )
                    self.db.add(media)

                    # Create transcript
                    transcript = Transcript(
                        org_id=session.project.org_id,
                        project_id=session.project_id,
                        title=f"Live Recording - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                        language="auto",
                        source_media_id=media.id,
                        transcription_status="completed"
                    )
                    self.db.add(transcript)

                    # Create segments
                    for idx, seg in enumerate(transcript_data["transcript"]):
                        segment = TranscriptSegment(
                            transcript_id=transcript.id,
                            speaker=seg["speaker"],
                            start_time=seg["start_time"],
                            end_time=seg["end_time"],
                            text=seg["text"],
                            segment_index=idx
                        )
                        self.db.add(segment)

                    # Update session
                    session.status = RecordingStatus.COMPLETED.value
                    session.completed_at = datetime.utcnow()
                    session.media_id = media.id
                    self.db.commit()

                except Exception as e:
                    session.status = RecordingStatus.FAILED.value
                    session.error_message = str(e)
                    self.db.commit()

                break

            elif status["status"] == "error":
                session.status = RecordingStatus.FAILED.value
                session.error_message = "Bot failed to join meeting"
                self.db.commit()
                break

            self.db.commit()

    async def get_recording_status(self, session_id: str) -> Dict[str, Any]:
        """Get status of a recording session"""
        from .models_phase1 import RecordingSession

        session = self.db.query(RecordingSession).filter_by(id=session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Recording session not found")

        return {
            "session_id": session.id,
            "status": session.status,
            "platform": session.platform,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "media_id": session.media_id,
            "error": session.error_message
        }