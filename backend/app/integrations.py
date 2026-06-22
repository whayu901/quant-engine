"""
Phase 1: Integrations Framework
Pluggable importers for various qualitative research platforms
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import httpx
from sqlalchemy.orm import Session

from .models import Project, Transcript, TranscriptSegment
from .models_phase1 import Integration, ImportJob, CommunityThread
from .models import _uid


class BaseImporter(ABC):
    """Base class for all data importers"""

    def __init__(self, integration: Integration, db: Session):
        self.integration = integration
        self.config = json.loads(integration.config) if integration.config else {}
        self.db = db

    @abstractmethod
    async def test_connection(self) -> bool:
        """Test if the integration is properly configured"""
        pass

    @abstractmethod
    async def import_data(
        self,
        project_id: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Import data from the source"""
        pass

    @abstractmethod
    def get_import_options(self) -> Dict[str, Any]:
        """Get available import options for this integration"""
        pass


class GenericJSONImporter(BaseImporter):
    """
    Generic importer for CoLoop-style JSON format
    Expected format:
    {
        "sessions": [
            {
                "id": "session-id",
                "title": "Session Title",
                "participants": ["P1", "P2"],
                "segments": [
                    {
                        "speaker": "P1",
                        "text": "...",
                        "start_time": 0,
                        "end_time": 10
                    }
                ]
            }
        ]
    }
    """

    async def test_connection(self) -> bool:
        return True  # No external connection needed

    async def import_data(
        self,
        project_id: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Import from JSON file or data"""
        if not params or 'data' not in params:
            raise ValueError("JSON data required in params")

        data = params['data']
        if isinstance(data, str):
            data = json.loads(data)

        imported_count = 0
        for session in data.get('sessions', []):
            # Create transcript
            transcript = Transcript(
                id=_uid(),
                org_id=self.db.query(Project).filter_by(id=project_id).first().org_id,
                project_id=project_id,
                title=session.get('title', 'Imported Session'),
                language=session.get('language', 'auto'),
                transcription_status='completed',
                source_type='json_import',
                metadata=json.dumps({
                    'import_id': session.get('id'),
                    'participants': session.get('participants', [])
                })
            )
            self.db.add(transcript)

            # Create segments
            for idx, seg in enumerate(session.get('segments', [])):
                segment = TranscriptSegment(
                    id=_uid(),
                    transcript_id=transcript.id,
                    speaker=seg.get('speaker', 'Unknown'),
                    text=seg.get('text', ''),
                    start_time=seg.get('start_time'),
                    end_time=seg.get('end_time'),
                    segment_index=idx,
                    metadata=json.dumps(seg.get('metadata', {}))
                )
                self.db.add(segment)

            imported_count += 1

        self.db.commit()
        return {'sessions_imported': imported_count}

    def get_import_options(self) -> Dict[str, Any]:
        return {
            'accepts': ['json'],
            'format': 'CoLoop JSON format',
            'max_size_mb': 50
        }


class DscoutImporter(BaseImporter):
    """Importer for Dscout diary studies"""

    async def test_connection(self) -> bool:
        """Test Dscout API connection"""
        if 'api_key' not in self.config:
            return False

        # Mock test - in production, make actual API call
        return True

    async def import_data(
        self,
        project_id: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Import Dscout mission data"""
        # Mock implementation
        # In production, fetch from Dscout API

        # Create community thread for diary entries
        thread = CommunityThread(
            id=_uid(),
            project_id=project_id,
            source='dscout',
            topic='Diary Study Import',
            posts=json.dumps([
                {
                    'author': 'Participant 1',
                    'timestamp': datetime.utcnow().isoformat(),
                    'text': 'Day 1: Started tracking my shopping habits today...',
                    'attachments': []
                },
                {
                    'author': 'Participant 2',
                    'timestamp': datetime.utcnow().isoformat(),
                    'text': 'Day 1: I noticed I check e-commerce apps multiple times...',
                    'attachments': []
                }
            ])
        )
        self.db.add(thread)
        self.db.commit()

        return {'threads_imported': 1, 'posts_imported': 2}

    def get_import_options(self) -> Dict[str, Any]:
        return {
            'requires_auth': True,
            'auth_type': 'api_key',
            'import_types': ['diary', 'mission', 'scout_responses']
        }


class DiscussIOImporter(BaseImporter):
    """Importer for Discuss.io recordings"""

    async def test_connection(self) -> bool:
        """Test Discuss.io API connection"""
        if 'api_token' not in self.config:
            return False

        # Mock test
        return True

    async def import_data(
        self,
        project_id: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Import Discuss.io session recordings"""
        # Mock implementation
        # In production, fetch recordings and transcripts from API

        return {'sessions_imported': 0, 'error': 'Not implemented'}

    def get_import_options(self) -> Dict[str, Any]:
        return {
            'requires_auth': True,
            'auth_type': 'oauth',
            'import_types': ['recordings', 'transcripts', 'highlights']
        }


class OneDriveImporter(BaseImporter):
    """Importer for OneDrive/SharePoint files"""

    async def test_connection(self) -> bool:
        """Test OneDrive connection"""
        if 'access_token' not in self.config:
            return False

        # Mock test - in production, validate token with Graph API
        return True

    async def import_data(
        self,
        project_id: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Import files from OneDrive"""
        # Mock implementation
        # In production, use Microsoft Graph API to fetch files

        folder_path = params.get('folder_path', '/QualitativeResearch')

        return {
            'files_imported': 0,
            'folder': folder_path,
            'error': 'Not implemented'
        }

    def get_import_options(self) -> Dict[str, Any]:
        return {
            'requires_auth': True,
            'auth_type': 'oauth2',
            'file_types': ['docx', 'xlsx', 'txt', 'mp3', 'mp4'],
            'supports_folders': True
        }


class IntegrationManager:
    """Manages all integrations and import jobs"""

    # Registry of available importers
    IMPORTERS = {
        'generic_json': GenericJSONImporter,
        'dscout': DscoutImporter,
        'discussio': DiscussIOImporter,
        'onedrive': OneDriveImporter,
        # Add more importers as needed
    }

    def __init__(self, db: Session):
        self.db = db

    async def create_integration(
        self,
        org_id: str,
        kind: str,
        name: str,
        config: Dict[str, Any]
    ) -> Integration:
        """Create a new integration"""
        if kind not in self.IMPORTERS:
            raise ValueError(f"Unknown integration type: {kind}")

        integration = Integration(
            id=_uid(),
            org_id=org_id,
            kind=kind,
            name=name,
            config=json.dumps(config),
            is_active=True
        )
        self.db.add(integration)
        self.db.commit()

        # Test connection
        importer = self.IMPORTERS[kind](integration, self.db)
        if not await importer.test_connection():
            integration.is_active = False
            self.db.commit()
            raise ValueError("Failed to connect to integration")

        return integration

    async def run_import(
        self,
        integration_id: str,
        project_id: str,
        params: Optional[Dict[str, Any]] = None
    ) -> ImportJob:
        """Run an import job"""
        integration = self.db.query(Integration).filter_by(id=integration_id).first()
        if not integration:
            raise ValueError("Integration not found")

        if not integration.is_active:
            raise ValueError("Integration is not active")

        # Create import job
        job = ImportJob(
            id=_uid(),
            org_id=integration.org_id,
            project_id=project_id,
            integration_id=integration_id,
            source=integration.kind,
            status='running',
            started_at=datetime.utcnow()
        )
        self.db.add(job)
        self.db.commit()

        try:
            # Run import
            importer = self.IMPORTERS[integration.kind](integration, self.db)
            result = await importer.import_data(project_id, params)

            # Update job
            job.status = 'completed'
            job.completed_at = datetime.utcnow()
            job.result_summary = json.dumps(result)
            self.db.commit()

        except Exception as e:
            job.status = 'failed'
            job.error = str(e)
            job.completed_at = datetime.utcnow()
            self.db.commit()
            raise

        return job

    def get_available_integrations(self) -> List[Dict[str, Any]]:
        """Get list of available integration types"""
        return [
            {
                'kind': kind,
                'name': importer.__name__.replace('Importer', ''),
                'options': importer(None, None).get_import_options()
                if hasattr(importer, 'get_import_options') else {}
            }
            for kind, importer in self.IMPORTERS.items()
        ]