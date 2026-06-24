"""
Auto-indexing pipeline for transcripts and content
Automatically indexes new content into vector store for RAG
"""

import asyncio
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from .database import SessionLocal
from .models import Transcript, Project
from .models_phase2 import Evidence, Analysis
from .models_phase3 import VectorStore
from .embeddings import VectorStoreService
from .config import settings


class AutoIndexingService:
    """
    Service for automatic indexing of new content into vector store
    """

    def __init__(self, db: Session = None):
        self.db = db or SessionLocal()
        self.vector_service = VectorStoreService(self.db)
        self.batch_size = 10
        self.check_interval = 60  # Check every 60 seconds

    async def index_transcript(self, transcript_id: str) -> int:
        """Index a single transcript"""
        transcript = self.db.query(Transcript).filter_by(id=transcript_id).first()
        if not transcript:
            print(f"Transcript {transcript_id} not found")
            return 0

        # Check if already indexed
        existing = self.db.query(VectorStore).filter_by(
            source_type='transcript',
            source_id=transcript_id
        ).first()

        if existing:
            print(f"Transcript {transcript_id} already indexed")
            return 0

        try:
            chunks_created = await self.vector_service.index_transcript(transcript_id)
            print(f"✓ Indexed transcript {transcript_id}: {chunks_created} chunks created")
            return chunks_created
        except Exception as e:
            print(f"✗ Error indexing transcript {transcript_id}: {e}")
            return 0

    async def index_evidence(self, evidence_id: str) -> int:
        """Index a single piece of evidence"""
        evidence = self.db.query(Evidence).filter_by(id=evidence_id).first()
        if not evidence:
            print(f"Evidence {evidence_id} not found")
            return 0

        # Check if already indexed
        existing = self.db.query(VectorStore).filter_by(
            source_type='evidence',
            source_id=evidence_id
        ).first()

        if existing:
            print(f"Evidence {evidence_id} already indexed")
            return 0

        try:
            chunks_created = await self.vector_service.index_evidence(evidence_id)
            print(f"✓ Indexed evidence {evidence_id}: {chunks_created} chunks created")
            return chunks_created
        except Exception as e:
            print(f"✗ Error indexing evidence {evidence_id}: {e}")
            return 0

    async def find_unindexed_transcripts(self, limit: int = 10) -> List[str]:
        """Find transcripts that haven't been indexed yet"""

        # Get all transcript IDs
        all_transcripts = self.db.query(Transcript.id).all()
        all_transcript_ids = [t[0] for t in all_transcripts]

        # Get indexed transcript IDs
        indexed_transcripts = self.db.query(VectorStore.source_id).filter(
            VectorStore.source_type == 'transcript'
        ).distinct().all()
        indexed_transcript_ids = [t[0] for t in indexed_transcripts]

        # Find unindexed
        unindexed_ids = [
            tid for tid in all_transcript_ids
            if tid not in indexed_transcript_ids
        ]

        return unindexed_ids[:limit]

    async def find_unindexed_evidence(self, limit: int = 10) -> List[str]:
        """Find evidence that hasn't been indexed yet"""

        # Get all evidence IDs
        all_evidence = self.db.query(Evidence.id).all()
        all_evidence_ids = [e[0] for e in all_evidence]

        # Get indexed evidence IDs
        indexed_evidence = self.db.query(VectorStore.source_id).filter(
            VectorStore.source_type == 'evidence'
        ).distinct().all()
        indexed_evidence_ids = [e[0] for e in indexed_evidence]

        # Find unindexed
        unindexed_ids = [
            eid for eid in all_evidence_ids
            if eid not in indexed_evidence_ids
        ]

        return unindexed_ids[:limit]

    async def index_recent_content(self, hours: int = 24) -> dict:
        """Index content created in the last N hours"""

        since = datetime.utcnow() - timedelta(hours=hours)
        stats = {
            'transcripts': 0,
            'evidence': 0,
            'chunks_created': 0
        }

        # Find recent transcripts
        recent_transcripts = self.db.query(Transcript).filter(
            Transcript.created_at >= since
        ).all()

        for transcript in recent_transcripts:
            chunks = await self.index_transcript(transcript.id)
            if chunks > 0:
                stats['transcripts'] += 1
                stats['chunks_created'] += chunks

        # Find recent evidence
        recent_evidence = self.db.query(Evidence).filter(
            Evidence.created_at >= since
        ).all()

        for evidence in recent_evidence:
            chunks = await self.index_evidence(evidence.id)
            if chunks > 0:
                stats['evidence'] += 1
                stats['chunks_created'] += chunks

        return stats

    async def run_indexing_pipeline(self) -> dict:
        """Run the full indexing pipeline"""

        print("🚀 Starting auto-indexing pipeline...")
        stats = {
            'transcripts': 0,
            'evidence': 0,
            'chunks_created': 0,
            'errors': 0
        }

        # Index unindexed transcripts
        unindexed_transcripts = await self.find_unindexed_transcripts(self.batch_size)
        print(f"Found {len(unindexed_transcripts)} unindexed transcripts")

        for transcript_id in unindexed_transcripts:
            try:
                chunks = await self.index_transcript(transcript_id)
                if chunks > 0:
                    stats['transcripts'] += 1
                    stats['chunks_created'] += chunks
            except Exception as e:
                print(f"Error indexing transcript {transcript_id}: {e}")
                stats['errors'] += 1

        # Index unindexed evidence
        unindexed_evidence = await self.find_unindexed_evidence(self.batch_size)
        print(f"Found {len(unindexed_evidence)} unindexed evidence items")

        for evidence_id in unindexed_evidence:
            try:
                chunks = await self.index_evidence(evidence_id)
                if chunks > 0:
                    stats['evidence'] += 1
                    stats['chunks_created'] += chunks
            except Exception as e:
                print(f"Error indexing evidence {evidence_id}: {e}")
                stats['errors'] += 1

        print(f"✅ Indexing complete: {stats}")
        return stats

    async def continuous_indexing(self):
        """Run continuous indexing in the background"""

        print("🔄 Starting continuous auto-indexing service...")

        while True:
            try:
                # Run indexing pipeline
                stats = await self.run_indexing_pipeline()

                # If nothing was indexed, wait longer
                if stats['chunks_created'] == 0:
                    await asyncio.sleep(self.check_interval * 5)  # Wait 5x longer
                else:
                    await asyncio.sleep(self.check_interval)

            except Exception as e:
                print(f"Error in continuous indexing: {e}")
                await asyncio.sleep(self.check_interval)

    def get_indexing_stats(self) -> dict:
        """Get current indexing statistics"""

        # Total items
        total_transcripts = self.db.query(Transcript).count()
        total_evidence = self.db.query(Evidence).count()

        # Indexed items
        indexed_transcripts = self.db.query(VectorStore.source_id).filter(
            VectorStore.source_type == 'transcript'
        ).distinct().count()

        indexed_evidence = self.db.query(VectorStore.source_id).filter(
            VectorStore.source_type == 'evidence'
        ).distinct().count()

        # Total chunks
        total_chunks = self.db.query(VectorStore).count()

        # Chunks by type
        chunks_by_type = {}
        type_stats = self.db.query(
            VectorStore.source_type,
            self.db.func.count(VectorStore.id)
        ).group_by(VectorStore.source_type).all()

        for source_type, count in type_stats:
            chunks_by_type[source_type] = count

        return {
            'total': {
                'transcripts': total_transcripts,
                'evidence': total_evidence
            },
            'indexed': {
                'transcripts': indexed_transcripts,
                'evidence': indexed_evidence
            },
            'coverage': {
                'transcripts': f"{(indexed_transcripts/total_transcripts*100):.1f}%" if total_transcripts > 0 else "N/A",
                'evidence': f"{(indexed_evidence/total_evidence*100):.1f}%" if total_evidence > 0 else "N/A"
            },
            'total_chunks': total_chunks,
            'chunks_by_type': chunks_by_type
        }


# Background task for auto-indexing (can be run with Celery or as a separate process)
async def run_auto_indexing():
    """Main entry point for auto-indexing service"""
    service = AutoIndexingService()
    await service.continuous_indexing()


if __name__ == "__main__":
    # Run as standalone service
    print("Starting Auto-Indexing Service...")
    asyncio.run(run_auto_indexing())