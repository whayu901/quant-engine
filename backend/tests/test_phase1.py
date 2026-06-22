"""
Phase 1 Tests: Ingestion & Transcription Enhancements
"""

import pytest
import json
import io
from datetime import datetime, timedelta
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))

from app.ingestion import XLSXParser, TranscriptEditor, TranscriptTranslator, WhatsAppImporter
from app.live_recorder import LiveRecorder, RecordingPlatform
from app.integrations import IntegrationManager, GenericJSONImporter


class TestPhase1Ingestion:
    """Test Phase 1 ingestion features"""

    def test_xlsx_parser_exists(self):
        """Test that XLSX parser is implemented"""
        assert hasattr(XLSXParser, 'parse_openends')

    def test_transcript_editor_exists(self):
        """Test that transcript editor is implemented"""
        assert hasattr(TranscriptEditor, 'correct_segment')

    def test_transcript_translator_exists(self):
        """Test that transcript translator is implemented"""
        assert hasattr(TranscriptTranslator, 'translate_transcript')

    def test_whatsapp_importer_exists(self):
        """Test that WhatsApp importer is implemented"""
        assert hasattr(WhatsAppImporter, 'import_chat')


class TestLiveRecorder:
    """Test Live Recorder functionality"""

    def test_live_recorder_class_exists(self):
        """Test that LiveRecorder class is implemented"""
        from app.live_recorder import LiveRecorder
        assert LiveRecorder is not None

    def test_recording_platforms(self):
        """Test that recording platforms are defined"""
        from app.live_recorder import RecordingPlatform

        assert RecordingPlatform.ZOOM.value == "zoom"
        assert RecordingPlatform.GOOGLE_MEET.value == "meet"
        assert RecordingPlatform.MS_TEAMS.value == "teams"
        assert RecordingPlatform.WEBEX.value == "webex"

    def test_recall_ai_client_mock(self):
        """Test that Recall.ai mock client exists"""
        from app.live_recorder import RecallAIClient

        client = RecallAIClient()
        assert client.api_key == "mock-recall-ai-key"

    async def test_create_bot_mock(self):
        """Test creating a mock recording bot"""
        from app.live_recorder import RecallAIClient

        client = RecallAIClient()
        result = await client.create_bot(
            meeting_url="https://zoom.us/j/123456789",
            bot_name="Test Bot"
        )

        assert "id" in result
        assert result["bot_name"] == "Test Bot"
        assert result["meeting_url"] == "https://zoom.us/j/123456789"


class TestIntegrationsFramework:
    """Test integrations framework"""

    def test_integration_manager_exists(self):
        """Test that IntegrationManager is implemented"""
        from app.integrations import IntegrationManager
        assert IntegrationManager is not None

    def test_base_importer_interface(self):
        """Test that BaseImporter defines required methods"""
        from app.integrations import BaseImporter

        assert hasattr(BaseImporter, 'test_connection')
        assert hasattr(BaseImporter, 'import_data')
        assert hasattr(BaseImporter, 'get_import_options')

    def test_generic_json_importer(self):
        """Test that generic JSON importer is available"""
        from app.integrations import GenericJSONImporter
        assert GenericJSONImporter is not None

    def test_available_importers(self):
        """Test that required importers are registered"""
        from app.integrations import IntegrationManager

        expected_importers = [
            'generic_json',
            'dscout',
            'discussio',
            'onedrive'
        ]

        for importer in expected_importers:
            assert importer in IntegrationManager.IMPORTERS


class TestPhase1Models:
    """Test Phase 1 database models"""

    def test_recording_session_model(self):
        """Test RecordingSession model exists"""
        from app.models_phase1 import RecordingSession

        assert hasattr(RecordingSession, 'project_id')
        assert hasattr(RecordingSession, 'platform')
        assert hasattr(RecordingSession, 'meeting_url')
        assert hasattr(RecordingSession, 'status')

    def test_integration_model(self):
        """Test Integration model exists"""
        from app.models_phase1 import Integration

        assert hasattr(Integration, 'org_id')
        assert hasattr(Integration, 'kind')
        assert hasattr(Integration, 'config')

    def test_import_job_model(self):
        """Test ImportJob model exists"""
        from app.models_phase1 import ImportJob

        assert hasattr(ImportJob, 'project_id')
        assert hasattr(ImportJob, 'integration_id')
        assert hasattr(ImportJob, 'status')

    def test_market_model(self):
        """Test Market model for multi-market studies"""
        from app.models_phase1 import Market

        assert hasattr(Market, 'project_id')
        assert hasattr(Market, 'country')
        assert hasattr(Market, 'language')

    def test_community_thread_model(self):
        """Test CommunityThread model for online qual"""
        from app.models_phase1 import CommunityThread

        assert hasattr(CommunityThread, 'project_id')
        assert hasattr(CommunityThread, 'source')
        assert hasattr(CommunityThread, 'posts')


class TestPhase1Endpoints:
    """Test Phase 1 API endpoints"""

    def test_ingestion_router_exists(self):
        """Test that ingestion router is implemented"""
        from app.routers.ingestion import router
        assert router is not None

    def test_xlsx_upload_endpoint(self):
        """Test XLSX upload endpoint is defined"""
        from app.routers.ingestion import upload_xlsx_openends
        assert upload_xlsx_openends is not None

    def test_whatsapp_upload_endpoint(self):
        """Test WhatsApp upload endpoint is defined"""
        from app.routers.ingestion import upload_whatsapp_chat
        assert upload_whatsapp_chat is not None

    def test_transcript_correction_endpoint(self):
        """Test transcript correction endpoint is defined"""
        from app.routers.ingestion import correct_transcript_segment
        assert correct_transcript_segment is not None

    def test_transcript_translation_endpoint(self):
        """Test transcript translation endpoint is defined"""
        from app.routers.ingestion import translate_transcript
        assert translate_transcript is not None

    def test_project_brief_endpoint(self):
        """Test project brief update endpoint is defined"""
        from app.routers.ingestion import update_project_brief
        assert update_project_brief is not None


class TestPhase1Integration:
    """Test Phase 1 integration with existing system"""

    def test_models_import(self):
        """Test that new models can be imported"""
        try:
            from app.models_phase1 import (
                RecordingSession, Integration, ImportJob,
                Market, CommunityThread
            )
            assert True
        except ImportError:
            assert False, "Failed to import Phase 1 models"

    def test_sea_extensions(self):
        """Test SEA-specific extensions are defined"""
        from app.models_phase1 import extend_org_model, extend_project_model

        # Functions should exist even if not yet applied
        assert extend_org_model is not None
        assert extend_project_model is not None

    def test_wave_support(self):
        """Test additional waves support for longitudinal studies"""
        from app.models_phase1 import extend_transcript_model
        assert extend_transcript_model is not None


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])