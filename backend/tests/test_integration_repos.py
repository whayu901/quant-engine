"""
Integration tests for repository/database operations.
Tests actual database interactions, relationships, and data integrity.
"""

import pytest
from sqlalchemy.orm import Session
from datetime import datetime

from app import models


@pytest.mark.integration
@pytest.mark.db
class TestOrgRepository:
    """Test Org model and database operations."""

    def test_create_org(self, db: Session, org_factory):
        """Test creating an organization."""
        org = org_factory.create(db, name="Test Company")

        assert org.id is not None
        assert org.name == "Test Company"
        assert org.plan == "free"
        assert org.created_at is not None

    def test_org_has_users_relationship(self, db: Session, test_org, test_admin_user):
        """Test that org has users relationship."""
        assert len(test_org.users) == 1
        assert test_org.users[0].id == test_admin_user.id

    def test_org_has_projects_relationship(self, db: Session, test_org, test_project):
        """Test that org has projects relationship."""
        assert len(test_org.projects) == 1
        assert test_org.projects[0].id == test_project.id

    def test_delete_org_cascades_to_users(self, db: Session, org_factory, user_factory):
        """Test that deleting org deletes its users."""
        org = org_factory.create(db)
        user = user_factory.create(db, org=org)
        user_id = user.id

        db.delete(org)
        db.commit()

        # User should be deleted with org
        deleted_user = db.get(models.User, user_id)
        assert deleted_user is None

    def test_delete_org_cascades_to_projects(self, db: Session, org_factory, project_factory):
        """Test that deleting org deletes its projects."""
        org = org_factory.create(db)
        project = project_factory.create(db, org=org)
        project_id = project.id

        db.delete(org)
        db.commit()

        # Project should be deleted with org
        deleted_project = db.get(models.Project, project_id)
        assert deleted_project is None

    def test_query_org_by_id(self, db: Session, test_org):
        """Test querying org by ID."""
        found = db.get(models.Org, test_org.id)
        assert found.id == test_org.id
        assert found.name == test_org.name

    def test_query_org_by_name(self, db: Session, test_org):
        """Test querying org by name."""
        found = db.query(models.Org).filter_by(name=test_org.name).first()
        assert found.id == test_org.id

    def test_update_org_plan(self, db: Session, test_org):
        """Test updating org plan."""
        test_org.plan = "pro"
        db.commit()
        db.refresh(test_org)

        assert test_org.plan == "pro"

    def test_org_created_at_timestamp(self, db: Session, org_factory):
        """Test that org gets created_at timestamp."""
        org = org_factory.create(db)
        assert isinstance(org.created_at, datetime)
        assert org.created_at <= datetime.utcnow()


@pytest.mark.integration
@pytest.mark.db
class TestUserRepository:
    """Test User model and database operations."""

    def test_create_user(self, db: Session, test_org, user_factory):
        """Test creating a user."""
        user = user_factory.create(
            db,
            org=test_org,
            email="newuser@test.com",
            role="researcher"
        )

        assert user.id is not None
        assert user.email == "newuser@test.com"
        assert user.org_id == test_org.id
        assert user.role == "researcher"
        assert user.is_active is True

    def test_user_password_hashing(self, db: Session, test_user):
        """Test that user password is hashed."""
        # Password should be hashed, not plaintext
        assert test_user.hashed_password != "plainpassword"
        assert len(test_user.hashed_password) > 0

    def test_query_user_by_email(self, db: Session, test_user):
        """Test querying user by email."""
        found = db.query(models.User).filter_by(email=test_user.email).first()
        assert found.id == test_user.id

    def test_query_user_by_org(self, db: Session, test_org, test_admin_user):
        """Test querying users by org."""
        users = db.query(models.User).filter_by(org_id=test_org.id).all()
        assert len(users) >= 1
        assert any(u.id == test_admin_user.id for u in users)

    def test_update_user_role(self, db: Session, test_user):
        """Test updating user role."""
        test_user.role = "admin"
        db.commit()
        db.refresh(test_user)

        assert test_user.role == "admin"

    def test_deactivate_user(self, db: Session, test_user):
        """Test deactivating a user."""
        test_user.is_active = False
        db.commit()
        db.refresh(test_user)

        assert test_user.is_active is False

    def test_update_last_login(self, db: Session, test_user):
        """Test updating last login timestamp."""
        login_time = datetime.utcnow()
        test_user.last_login = login_time
        db.commit()
        db.refresh(test_user)

        assert test_user.last_login is not None
        # Allow small time difference
        assert abs((test_user.last_login - login_time).total_seconds()) < 1

    def test_user_belongs_to_org(self, db: Session, test_user, test_org):
        """Test user-org relationship."""
        assert test_user.org_id == test_org.id
        assert test_user.org.id == test_org.id

    def test_email_uniqueness_constraint(self, db: Session, test_org, user_factory):
        """Test that email uniqueness is enforced."""
        email = "duplicate@test.com"
        user1 = user_factory.create(db, org=test_org, email=email)

        # Try to create another with same email - should fail
        try:
            user2 = user_factory.create(db, org=test_org, email=email)
            pytest.fail("Should not allow duplicate email")
        except Exception:
            # Expected - integrity constraint violation
            db.rollback()


@pytest.mark.integration
@pytest.mark.db
class TestProjectRepository:
    """Test Project model and database operations."""

    def test_create_project(self, db: Session, test_project):
        """Test creating a project."""
        assert test_project.id is not None
        assert test_project.name == "Test Project"
        assert test_project.status == "active"

    def test_project_belongs_to_org(self, db: Session, test_project, test_org):
        """Test project-org relationship."""
        assert test_project.org_id == test_org.id

    def test_project_created_by_user(self, db: Session, test_project, test_admin_user):
        """Test project's created_by field."""
        assert test_project.created_by == test_admin_user.id

    def test_query_projects_by_org(self, db: Session, test_org, project_factory):
        """Test querying projects by org."""
        project_factory.create(db, org=test_org)
        projects = db.query(models.Project).filter_by(org_id=test_org.id).all()

        assert len(projects) >= 1

    def test_project_status_values(self, db: Session, org_factory, project_factory):
        """Test that project can have different statuses."""
        org = org_factory.create(db)

        p_active = project_factory.create(db, org=org, status="active")
        p_archived = project_factory.create(db, org=org, status="archived")

        assert p_active.status == "active"
        assert p_archived.status == "archived"

    def test_update_project_status(self, db: Session, test_project):
        """Test updating project status."""
        test_project.status = "archived"
        db.commit()
        db.refresh(test_project)

        assert test_project.status == "archived"

    def test_update_project_description(self, db: Session, test_project):
        """Test updating project description."""
        new_desc = "Updated description"
        test_project.description = new_desc
        db.commit()
        db.refresh(test_project)

        assert test_project.description == new_desc

    def test_delete_project_cascades_to_transcripts(self, db: Session, test_project, transcript_factory):
        """Test that deleting project deletes its transcripts."""
        transcript = transcript_factory.create(db, project=test_project)
        transcript_id = transcript.id

        db.delete(test_project)
        db.commit()

        deleted = db.get(models.Transcript, transcript_id)
        assert deleted is None


@pytest.mark.integration
@pytest.mark.db
class TestTranscriptRepository:
    """Test Transcript model and database operations."""

    def test_create_transcript(self, db: Session, test_transcript):
        """Test creating a transcript."""
        assert test_transcript.id is not None
        assert test_transcript.title == "Test Transcript"
        assert test_transcript.method == "FGD"
        assert test_transcript.content is not None

    def test_transcript_belongs_to_project(self, db: Session, test_transcript, test_project):
        """Test transcript-project relationship."""
        assert test_transcript.project_id == test_project.id

    def test_transcript_belongs_to_org(self, db: Session, test_transcript, test_org):
        """Test transcript-org relationship."""
        assert test_transcript.org_id == test_org.id

    def test_transcript_transcription_status(self, db: Session, transcript_factory, test_project):
        """Test transcript transcription status."""
        t1 = transcript_factory.create(db, project=test_project, transcription_status="ready")
        t2 = transcript_factory.create(db, project=test_project, transcription_status="pending")
        t3 = transcript_factory.create(db, project=test_project, transcription_status="done")

        assert t1.transcription_status == "ready"
        assert t2.transcription_status == "pending"
        assert t3.transcription_status == "done"

    def test_transcript_segments_relationship(self, db: Session, test_transcript, segment_factory):
        """Test transcript-segments relationship."""
        seg1 = segment_factory.create(db, transcript=test_transcript, idx=0)
        seg2 = segment_factory.create(db, transcript=test_transcript, idx=1)

        # Refresh to load relationship
        db.refresh(test_transcript)

        assert len(test_transcript.segments) == 2
        assert test_transcript.segments[0].id == seg1.id
        assert test_transcript.segments[1].id == seg2.id

    def test_delete_transcript_cascades_to_segments(self, db: Session, test_transcript, segment_factory):
        """Test that deleting transcript deletes its segments."""
        segment = segment_factory.create(db, transcript=test_transcript)
        segment_id = segment.id

        db.delete(test_transcript)
        db.commit()

        deleted = db.get(models.TranscriptSegment, segment_id)
        assert deleted is None

    def test_update_transcript_language(self, db: Session, test_transcript):
        """Test updating transcript language."""
        test_transcript.language = "id"  # Indonesian
        db.commit()
        db.refresh(test_transcript)

        assert test_transcript.language == "id"


@pytest.mark.integration
@pytest.mark.db
class TestAnalysisRepository:
    """Test Analysis model and database operations."""

    def test_create_analysis(self, db: Session, test_analysis):
        """Test creating an analysis."""
        assert test_analysis.id is not None
        assert test_analysis.status == "done"
        assert test_analysis.respondent_count == 5

    def test_analysis_belongs_to_transcript(self, db: Session, test_analysis, test_transcript):
        """Test analysis-transcript relationship."""
        assert test_analysis.transcript_id == test_transcript.id

    def test_analysis_belongs_to_org(self, db: Session, test_analysis, test_org):
        """Test analysis-org relationship."""
        assert test_analysis.org_id == test_org.id

    def test_analysis_status_values(self, db: Session, test_transcript, analysis_factory):
        """Test different analysis status values."""
        a1 = analysis_factory.create(db, transcript=test_transcript, status="pending")
        a2 = analysis_factory.create(db, transcript=test_transcript, status="running")
        a3 = analysis_factory.create(db, transcript=test_transcript, status="done")

        assert a1.status == "pending"
        assert a2.status == "running"
        assert a3.status == "done"

    def test_analysis_themes_relationship(self, db: Session, test_analysis, theme_factory):
        """Test analysis-themes relationship."""
        theme1 = theme_factory.create(db, analysis=test_analysis)
        theme2 = theme_factory.create(db, analysis=test_analysis)

        db.refresh(test_analysis)

        assert len(test_analysis.themes) == 2

    def test_analysis_implications_relationship(self, db: Session, test_analysis, implication_factory):
        """Test analysis-implications relationship."""
        imp1 = implication_factory.create(db, analysis=test_analysis)
        imp2 = implication_factory.create(db, analysis=test_analysis)

        db.refresh(test_analysis)

        assert len(test_analysis.implications) == 2

    def test_update_analysis_status(self, db: Session, test_analysis):
        """Test updating analysis status."""
        test_analysis.status = "error"
        test_analysis.error = "Processing failed"
        db.commit()
        db.refresh(test_analysis)

        assert test_analysis.status == "error"
        assert test_analysis.error == "Processing failed"

    def test_analysis_token_counts(self, db: Session, test_analysis):
        """Test token usage tracking."""
        assert test_analysis.input_tokens == 1000
        assert test_analysis.output_tokens == 500


@pytest.mark.integration
@pytest.mark.db
class TestThemeRepository:
    """Test Theme model and database operations."""

    def test_create_theme(self, db: Session, test_theme):
        """Test creating a theme."""
        assert test_theme.id is not None
        assert test_theme.name == "Test Theme"

    def test_theme_belongs_to_analysis(self, db: Session, test_theme, test_analysis):
        """Test theme-analysis relationship."""
        assert test_theme.analysis_id == test_analysis.id

    def test_theme_verbatims_relationship(self, db: Session, test_theme, verbatim_factory):
        """Test theme-verbatims relationship."""
        v1 = verbatim_factory.create(db, theme=test_theme)
        v2 = verbatim_factory.create(db, theme=test_theme)

        db.refresh(test_theme)

        assert len(test_theme.verbatims) == 2

    def test_update_theme_prevalence(self, db: Session, test_theme):
        """Test updating theme prevalence."""
        test_theme.prevalence = "medium"
        db.commit()
        db.refresh(test_theme)

        assert test_theme.prevalence == "medium"

    def test_theme_ordering(self, db: Session, test_analysis, theme_factory):
        """Test theme order index."""
        t1 = theme_factory.create(db, analysis=test_analysis, order_idx=0)
        t2 = theme_factory.create(db, analysis=test_analysis, order_idx=1)

        assert t1.order_idx == 0
        assert t2.order_idx == 1


@pytest.mark.integration
@pytest.mark.db
class TestVerbatimRepository:
    """Test Verbatim model and database operations."""

    def test_create_verbatim(self, db: Session, test_verbatim):
        """Test creating a verbatim."""
        assert test_verbatim.id is not None
        assert test_verbatim.quote is not None
        assert test_verbatim.speaker is not None

    def test_verbatim_belongs_to_theme(self, db: Session, test_verbatim, test_theme):
        """Test verbatim-theme relationship."""
        assert test_verbatim.theme_id == test_theme.id


@pytest.mark.integration
@pytest.mark.db
class TestMediaAssetRepository:
    """Test MediaAsset model and database operations."""

    def test_create_media_asset(self, db: Session, test_media):
        """Test creating a media asset."""
        assert test_media.id is not None
        assert test_media.filename is not None
        assert test_media.kind == "audio"

    def test_media_asset_belongs_to_project(self, db: Session, test_media, test_project):
        """Test media-project relationship."""
        assert test_media.project_id == test_project.id

    def test_media_asset_duration(self, db: Session, test_media):
        """Test media duration tracking."""
        assert test_media.duration_sec == 300.0


@pytest.mark.integration
@pytest.mark.db
class TestUsageRecordRepository:
    """Test UsageRecord model and database operations."""

    def test_create_usage_record(self, db: Session, test_org, analysis_factory):
        """Test creating a usage record."""
        analysis = analysis_factory.create(db)

        record = models.UsageRecord(
            org_id=test_org.id,
            analysis_id=analysis.id,
            kind="analysis",
            input_tokens=1000,
            output_tokens=500
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        assert record.id is not None
        assert record.input_tokens == 1000
        assert record.output_tokens == 500

    def test_usage_record_belongs_to_org(self, db: Session, test_org):
        """Test usage record org relationship."""
        record = models.UsageRecord(
            org_id=test_org.id,
            kind="analysis",
            input_tokens=100,
            output_tokens=50
        )
        db.add(record)
        db.commit()

        assert record.org_id == test_org.id
