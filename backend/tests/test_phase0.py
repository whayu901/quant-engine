"""
Phase 0 Tests: Scaffold validation
Tests for Alembic setup, SEA defaults, seed data, and docker configuration
"""

import pytest
import sys
from pathlib import Path

# Add parent to path
sys.path.append(str(Path(__file__).parent.parent))

from app.config import settings
from app.database import SessionLocal, engine
from app.models import Base, Org, User, Project, Transcript
from sqlalchemy import inspect


class TestPhase0Scaffold:
    """Test Phase 0 scaffold requirements"""

    def test_alembic_configured(self):
        """Test that Alembic is properly configured"""
        alembic_ini = Path(__file__).parent.parent / "alembic.ini"
        assert alembic_ini.exists(), "alembic.ini file should exist"

        alembic_dir = Path(__file__).parent.parent / "alembic"
        assert alembic_dir.exists(), "alembic directory should exist"
        assert (alembic_dir / "env.py").exists(), "alembic/env.py should exist"
        assert (alembic_dir / "versions").exists(), "alembic/versions directory should exist"

    def test_sea_defaults_configured(self):
        """Test that SEA defaults are properly configured in settings"""
        # Test data region defaults
        assert settings.default_data_region == "ap-southeast-1"
        assert "ap-southeast-1" in settings.supported_data_regions
        assert "ap-southeast-3" in settings.supported_data_regions

        # Test SEA languages
        assert "id" in settings.supported_languages
        assert settings.supported_languages["id"] == "Bahasa Indonesia"
        assert "id-en" in settings.supported_languages  # Code-mixed support
        assert "fil-en" in settings.supported_languages  # Taglish
        assert "en-sg" in settings.supported_languages  # Singlish

        # Test currencies
        assert "IDR" in settings.supported_currencies
        assert "SGD" in settings.supported_currencies
        assert "MYR" in settings.supported_currencies
        assert "THB" in settings.supported_currencies
        assert "VND" in settings.supported_currencies
        assert "PHP" in settings.supported_currencies

        # Test ASR routing
        assert settings.asr_language_routing["id"] == "deepgram"
        assert settings.asr_language_routing["default"] == "whisper_local"

    def test_database_models_exist(self):
        """Test that all required models are defined"""
        # Get all table names from Base metadata
        tables = Base.metadata.tables.keys()

        required_tables = [
            "orgs",
            "users",
            "projects",
            "media_assets",
            "transcripts",
            "transcript_segments",
            "analyses",
            "themes",
            "verbatims",
            "implications",
            "usage_records"
        ]

        for table in required_tables:
            assert table in tables, f"Table '{table}' should be defined in models"

    def test_seed_script_exists(self):
        """Test that seed script exists"""
        seed_script = Path(__file__).parent.parent / "seed.py"
        assert seed_script.exists(), "seed.py script should exist"

    def test_docker_compose_configured(self):
        """Test docker-compose.yml configuration"""
        docker_compose = Path(__file__).parent.parent.parent / "docker-compose.yml"
        assert docker_compose.exists(), "docker-compose.yml should exist"

        with open(docker_compose, 'r') as f:
            content = f.read()

        # Check for required services
        assert "db:" in content, "PostgreSQL service should be configured"
        assert "redis:" in content, "Redis service should be configured"
        assert "minio:" in content, "MinIO service should be configured"
        assert "backend:" in content, "Backend service should be configured"
        assert "worker:" in content, "Worker service should be configured"
        assert "frontend:" in content, "Frontend service should be configured"

        # Check for health checks
        assert "healthcheck:" in content, "Services should have health checks"

        # Check for SEA region configuration
        assert "ap-southeast" in content or "S3_REGION" in content

    def test_env_example_configured(self):
        """Test .env.example has proper defaults"""
        env_example = Path(__file__).parent.parent.parent / ".env.example"
        assert env_example.exists(), ".env.example should exist"

        with open(env_example, 'r') as f:
            content = f.read()

        # Check for SEA region defaults
        assert "ap-southeast-1" in content, "SEA region should be configured"
        assert "DATABASE_URL=postgresql" in content, "PostgreSQL URL should be configured"
        assert "REDIS_URL=redis://" in content, "Redis URL should be configured"
        assert "STORAGE_BACKEND=" in content, "Storage backend should be configured"
        assert "TRANSCRIPTION_PROVIDER=" in content, "Transcription provider should be configured"


class TestDatabaseSetup:
    """Test database setup and seed data"""

    @pytest.fixture
    def db(self):
        """Provide database session"""
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def test_database_tables_created(self):
        """Test that database tables can be created"""
        inspector = inspect(engine)
        tables = inspector.get_table_names()

        # If tables don't exist, this means migrations haven't been run
        # This is OK for the test - we're just checking the setup
        if not tables:
            pytest.skip("Database tables not created yet - run migrations first")

        expected_tables = ["orgs", "users", "projects", "transcripts"]
        for table in expected_tables:
            assert table in tables, f"Table {table} should exist"

    def test_seed_data_structure(self, db):
        """Test that seed data has proper structure (if exists)"""
        # Check if seed data exists
        demo_org = db.query(Org).filter_by(id="demo-org-001").first()

        if not demo_org:
            pytest.skip("Seed data not loaded - run seed.py first")

        # Test org has SEA configuration
        assert demo_org.country == "ID"
        assert demo_org.currency == "IDR"
        assert demo_org.data_region == "ap-southeast-3"

        # Test users exist
        admin = db.query(User).filter_by(email="admin@demo.com").first()
        assert admin is not None
        assert admin.role == "admin"

        # Test project exists
        project = db.query(Project).filter_by(id="demo-project-001").first()
        assert project is not None
        assert "Indonesia" in project.name or "Consumer" in project.name

        # Test transcript with code-mixed language
        transcript = db.query(Transcript).filter_by(id="demo-transcript-001").first()
        if transcript:
            assert transcript.language == "id-en"  # Indonesian-English code-mixed


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])