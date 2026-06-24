"""
Pytest configuration and fixtures for Qual Engine tests.
This module provides:
- Database fixtures (in-memory SQLite)
- FastAPI test client
- Model factories for generating test data
- Authentication fixtures
"""

import os
import pytest
import uuid
from datetime import datetime, timedelta
from typing import Generator
from pathlib import Path

# SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# FastAPI
from fastapi.testclient import TestClient

# App imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
from app.database import Base, get_db
from app.models import Org, User, Project, Transcript, MediaAsset, Analysis, Theme, Verbatim, Implication, TranscriptSegment, UsageRecord
from app import security, schemas


# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

@pytest.fixture(scope="session")
def db_engine():
    """Create an in-memory SQLite database for testing."""
    # Use in-memory SQLite for speed
    database_url = "sqlite:///:memory:"
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False},
        echo=False  # Set to True for SQL debugging
    )

    # Create all tables
    Base.metadata.create_all(bind=engine)

    yield engine

    # Cleanup
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def SessionLocalTest(db_engine):
    """Create a session factory for testing."""
    return sessionmaker(autocommit=False, autoflush=False, bind=db_engine)


@pytest.fixture
def db(SessionLocalTest) -> Generator[Session, None, None]:
    """Provide a database session for each test."""
    connection = SessionLocalTest.kw['bind'].connect()
    transaction = connection.begin()
    session = SessionLocalTest(bind=connection)

    yield session

    session.rollback()
    transaction.rollback()
    connection.close()


@pytest.fixture
def override_get_db(db):
    """Override the get_db dependency for FastAPI."""
    def _override():
        yield db

    return _override


@pytest.fixture
def client(override_get_db):
    """Provide a FastAPI TestClient with mocked database."""
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    # Clear overrides
    app.dependency_overrides.clear()


# ============================================================================
# MODEL FACTORIES
# ============================================================================

class OrgFactory:
    """Factory for creating test Org instances."""

    @staticmethod
    def create(db: Session, **kwargs) -> Org:
        """Create and persist an org."""
        data = {
            "name": f"Test Org {uuid.uuid4().hex[:8]}",
            "plan": "free",
        }
        data.update(kwargs)

        org = Org(**data)
        db.add(org)
        db.commit()
        db.refresh(org)
        return org

    @staticmethod
    def build(**kwargs) -> dict:
        """Build org data without persisting."""
        data = {
            "name": f"Test Org {uuid.uuid4().hex[:8]}",
            "plan": "free",
        }
        data.update(kwargs)
        return data


class UserFactory:
    """Factory for creating test User instances."""

    @staticmethod
    def create(db: Session, org: Org = None, **kwargs) -> User:
        """Create and persist a user."""
        if not org:
            org = OrgFactory.create(db)

        email = kwargs.pop("email", f"user{uuid.uuid4().hex[:6]}@test.com")
        password = kwargs.pop("password", "testpass123")

        data = {
            "org_id": org.id,
            "email": email,
            "name": f"Test User {uuid.uuid4().hex[:8]}",
            "hashed_password": security.hash_pw(password),
            "role": "researcher",
            "is_active": True,
        }
        data.update(kwargs)

        user = User(**data)
        db.add(user)
        db.commit()
        db.refresh(user)

        # Store plain password for testing
        user._password = password

        return user

    @staticmethod
    def build(org_id: str = None, **kwargs) -> dict:
        """Build user data without persisting."""
        email = kwargs.pop("email", f"user{uuid.uuid4().hex[:6]}@test.com")
        password = kwargs.pop("password", "testpass123")

        data = {
            "org_id": org_id or uuid.uuid4().hex,
            "email": email,
            "name": f"Test User {uuid.uuid4().hex[:8]}",
            "hashed_password": security.hash_pw(password),
            "role": "researcher",
            "is_active": True,
        }
        data.update(kwargs)
        return data


class ProjectFactory:
    """Factory for creating test Project instances."""

    @staticmethod
    def create(db: Session, org: Org = None, created_by: User = None, **kwargs) -> Project:
        """Create and persist a project."""
        if not org:
            org = OrgFactory.create(db)
        if not created_by:
            created_by = UserFactory.create(db, org=org)

        data = {
            "org_id": org.id,
            "name": f"Test Project {uuid.uuid4().hex[:8]}",
            "description": "Test project description",
            "status": "active",
            "created_by": created_by.id,
        }
        data.update(kwargs)

        project = Project(**data)
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def build(org_id: str = None, **kwargs) -> dict:
        """Build project data without persisting."""
        data = {
            "org_id": org_id or uuid.uuid4().hex,
            "name": f"Test Project {uuid.uuid4().hex[:8]}",
            "description": "Test project description",
            "status": "active",
            "created_by": uuid.uuid4().hex,
        }
        data.update(kwargs)
        return data


class TranscriptFactory:
    """Factory for creating test Transcript instances."""

    @staticmethod
    def create(db: Session, project: Project = None, org: Org = None, **kwargs) -> Transcript:
        """Create and persist a transcript."""
        if not project:
            if not org:
                org = OrgFactory.create(db)
            project = ProjectFactory.create(db, org=org)

        data = {
            "org_id": project.org_id,
            "project_id": project.id,
            "title": f"Test Transcript {uuid.uuid4().hex[:8]}",
            "method": "FGD",
            "content": "Sample transcript content for testing purposes.",
            "language": "en",
            "transcription_status": "done",
        }
        data.update(kwargs)

        transcript = Transcript(**data)
        db.add(transcript)
        db.commit()
        db.refresh(transcript)
        return transcript

    @staticmethod
    def build(org_id: str = None, project_id: str = None, **kwargs) -> dict:
        """Build transcript data without persisting."""
        data = {
            "org_id": org_id or uuid.uuid4().hex,
            "project_id": project_id or uuid.uuid4().hex,
            "title": f"Test Transcript {uuid.uuid4().hex[:8]}",
            "method": "FGD",
            "content": "Sample transcript content for testing purposes.",
            "language": "en",
            "transcription_status": "done",
        }
        data.update(kwargs)
        return data


class TranscriptSegmentFactory:
    """Factory for creating test TranscriptSegment instances."""

    @staticmethod
    def create(db: Session, transcript: Transcript = None, **kwargs) -> TranscriptSegment:
        """Create and persist a transcript segment."""
        if not transcript:
            transcript = TranscriptFactory.create(db)

        data = {
            "transcript_id": transcript.id,
            "idx": 0,
            "speaker": "Speaker 1",
            "start_sec": 0.0,
            "end_sec": 5.0,
            "text": "This is a test segment.",
        }
        data.update(kwargs)

        segment = TranscriptSegment(**data)
        db.add(segment)
        db.commit()
        db.refresh(segment)
        return segment

    @staticmethod
    def build(transcript_id: str = None, idx: int = 0, **kwargs) -> dict:
        """Build segment data without persisting."""
        data = {
            "transcript_id": transcript_id or uuid.uuid4().hex,
            "idx": idx,
            "speaker": "Speaker 1",
            "start_sec": 0.0,
            "end_sec": 5.0,
            "text": "This is a test segment.",
        }
        data.update(kwargs)
        return data


class AnalysisFactory:
    """Factory for creating test Analysis instances."""

    @staticmethod
    def create(db: Session, transcript: Transcript = None, **kwargs) -> Analysis:
        """Create and persist an analysis."""
        if not transcript:
            transcript = TranscriptFactory.create(db)

        data = {
            "org_id": transcript.org_id,
            "transcript_id": transcript.id,
            "status": "done",
            "topline": "This is a test topline.",
            "respondent_count": 5,
            "input_tokens": 1000,
            "output_tokens": 500,
            "completed_at": datetime.utcnow(),
        }
        data.update(kwargs)

        analysis = Analysis(**data)
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis

    @staticmethod
    def build(org_id: str = None, transcript_id: str = None, **kwargs) -> dict:
        """Build analysis data without persisting."""
        data = {
            "org_id": org_id or uuid.uuid4().hex,
            "transcript_id": transcript_id or uuid.uuid4().hex,
            "status": "done",
            "topline": "This is a test topline.",
            "respondent_count": 5,
            "input_tokens": 1000,
            "output_tokens": 500,
            "completed_at": datetime.utcnow(),
        }
        data.update(kwargs)
        return data


class ThemeFactory:
    """Factory for creating test Theme instances."""

    @staticmethod
    def create(db: Session, analysis: Analysis = None, **kwargs) -> Theme:
        """Create and persist a theme."""
        if not analysis:
            analysis = AnalysisFactory.create(db)

        data = {
            "analysis_id": analysis.id,
            "name": f"Test Theme {uuid.uuid4().hex[:8]}",
            "description": "A test theme description.",
            "prevalence": "high",
            "sentiment": "positive",
            "order_idx": 0,
        }
        data.update(kwargs)

        theme = Theme(**data)
        db.add(theme)
        db.commit()
        db.refresh(theme)
        return theme

    @staticmethod
    def build(analysis_id: str = None, **kwargs) -> dict:
        """Build theme data without persisting."""
        data = {
            "analysis_id": analysis_id or uuid.uuid4().hex,
            "name": f"Test Theme {uuid.uuid4().hex[:8]}",
            "description": "A test theme description.",
            "prevalence": "high",
            "sentiment": "positive",
            "order_idx": 0,
        }
        data.update(kwargs)
        return data


class VerbatimFactory:
    """Factory for creating test Verbatim instances."""

    @staticmethod
    def create(db: Session, theme: Theme = None, **kwargs) -> Verbatim:
        """Create and persist a verbatim."""
        if not theme:
            theme = ThemeFactory.create(db)

        data = {
            "theme_id": theme.id,
            "quote": 'This is a test quote from a respondent.',
            "speaker": "Respondent 1",
        }
        data.update(kwargs)

        verbatim = Verbatim(**data)
        db.add(verbatim)
        db.commit()
        db.refresh(verbatim)
        return verbatim


class ImplicationFactory:
    """Factory for creating test Implication instances."""

    @staticmethod
    def create(db: Session, analysis: Analysis = None, **kwargs) -> Implication:
        """Create and persist an implication."""
        if not analysis:
            analysis = AnalysisFactory.create(db)

        data = {
            "analysis_id": analysis.id,
            "text": "This finding suggests that...",
            "order_idx": 0,
        }
        data.update(kwargs)

        implication = Implication(**data)
        db.add(implication)
        db.commit()
        db.refresh(implication)
        return implication


class MediaAssetFactory:
    """Factory for creating test MediaAsset instances."""

    @staticmethod
    def create(db: Session, project: Project = None, org: Org = None, **kwargs) -> MediaAsset:
        """Create and persist a media asset."""
        if not project:
            if not org:
                org = OrgFactory.create(db)
            project = ProjectFactory.create(db, org=org)

        data = {
            "org_id": project.org_id,
            "project_id": project.id,
            "filename": f"test_media_{uuid.uuid4().hex[:8]}.mp3",
            "content_type": "audio/mpeg",
            "kind": "audio",
            "storage_key": f"media/test/{uuid.uuid4().hex}.mp3",
            "duration_sec": 300.0,
        }
        data.update(kwargs)

        media = MediaAsset(**data)
        db.add(media)
        db.commit()
        db.refresh(media)
        return media


# ============================================================================
# FIXTURE FACTORIES
# ============================================================================

@pytest.fixture
def org_factory():
    """Provide OrgFactory for tests."""
    return OrgFactory


@pytest.fixture
def user_factory():
    """Provide UserFactory for tests."""
    return UserFactory


@pytest.fixture
def project_factory():
    """Provide ProjectFactory for tests."""
    return ProjectFactory


@pytest.fixture
def transcript_factory():
    """Provide TranscriptFactory for tests."""
    return TranscriptFactory


@pytest.fixture
def segment_factory():
    """Provide TranscriptSegmentFactory for tests."""
    return TranscriptSegmentFactory


@pytest.fixture
def analysis_factory():
    """Provide AnalysisFactory for tests."""
    return AnalysisFactory


@pytest.fixture
def theme_factory():
    """Provide ThemeFactory for tests."""
    return ThemeFactory


@pytest.fixture
def verbatim_factory():
    """Provide VerbatimFactory for tests."""
    return VerbatimFactory


@pytest.fixture
def implication_factory():
    """Provide ImplicationFactory for tests."""
    return ImplicationFactory


@pytest.fixture
def media_factory():
    """Provide MediaAssetFactory for tests."""
    return MediaAssetFactory


# ============================================================================
# AUTHENTICATION FIXTURES
# ============================================================================

@pytest.fixture
def test_org(db):
    """Create a test organization."""
    return OrgFactory.create(db, name="Test Organization")


@pytest.fixture
def test_admin_user(db, test_org):
    """Create an admin user."""
    return UserFactory.create(
        db,
        org=test_org,
        email="admin@test.com",
        role="admin",
        password="adminpass123"
    )


@pytest.fixture
def test_researcher_user(db, test_org):
    """Create a researcher user."""
    return UserFactory.create(
        db,
        org=test_org,
        email="researcher@test.com",
        role="researcher",
        password="researchpass123"
    )


@pytest.fixture
def test_viewer_user(db, test_org):
    """Create a viewer user."""
    return UserFactory.create(
        db,
        org=test_org,
        email="viewer@test.com",
        role="viewer",
        password="viewerpass123"
    )


@pytest.fixture
def admin_token(test_admin_user):
    """Generate an auth token for the admin user."""
    return security.create_token(test_admin_user.id)


@pytest.fixture
def researcher_token(test_researcher_user):
    """Generate an auth token for the researcher user."""
    return security.create_token(test_researcher_user.id)


@pytest.fixture
def viewer_token(test_viewer_user):
    """Generate an auth token for the viewer user."""
    return security.create_token(test_viewer_user.id)


@pytest.fixture
def admin_headers(admin_token):
    """HTTP headers with admin auth token."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def researcher_headers(researcher_token):
    """HTTP headers with researcher auth token."""
    return {"Authorization": f"Bearer {researcher_token}"}


@pytest.fixture
def viewer_headers(viewer_token):
    """HTTP headers with viewer auth token."""
    return {"Authorization": f"Bearer {viewer_token}"}


# ============================================================================
# DATA FIXTURES
# ============================================================================

@pytest.fixture
def test_project(db, test_org, test_admin_user):
    """Create a test project."""
    return ProjectFactory.create(
        db,
        org=test_org,
        created_by=test_admin_user,
        name="Test Project"
    )


@pytest.fixture
def test_transcript(db, test_project, test_org):
    """Create a test transcript."""
    return TranscriptFactory.create(
        db,
        project=test_project,
        org=test_org,
        title="Test Transcript"
    )


@pytest.fixture
def test_analysis(db, test_transcript):
    """Create a test analysis."""
    return AnalysisFactory.create(
        db,
        transcript=test_transcript
    )


@pytest.fixture
def test_theme(db, test_analysis):
    """Create a test theme."""
    return ThemeFactory.create(
        db,
        analysis=test_analysis,
        name="Test Theme"
    )


@pytest.fixture
def test_verbatim(db, test_theme):
    """Create a test verbatim."""
    return VerbatimFactory.create(
        db,
        theme=test_theme,
        quote="Test verbatim quote"
    )


@pytest.fixture
def test_media(db, test_project, test_org):
    """Create a test media asset."""
    return MediaAssetFactory.create(
        db,
        project=test_project,
        org=test_org
    )
