"""
Phase 5: Module D - Clips and Reels Tests
"""

import pytest
import json
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import uuid

from app.main import app
from app.database import Base, get_db
from app.models import User, Org, Project, Transcript, TranscriptSegment, MediaAsset
from app.models_phase5 import Clip, Reel, ReelItem, ClipTemplate, ShareLink
from app.security import hash_password

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_phase5.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture
def test_db():
    """Create a test database session"""
    db = TestingSessionLocal()
    try:
        # Clear existing data
        db.query(ShareLink).delete()
        db.query(ReelItem).delete()
        db.query(Reel).delete()
        db.query(Clip).delete()
        db.query(ClipTemplate).delete()
        db.query(TranscriptSegment).delete()
        db.query(Transcript).delete()
        db.query(MediaAsset).delete()
        db.query(Project).delete()
        db.query(User).delete()
        db.query(Org).delete()
        db.commit()

        yield db
    finally:
        db.close()


@pytest.fixture
def test_data(test_db):
    """Create test data"""
    # Create organization
    org = Org(
        id=str(uuid.uuid4()),
        name="Test Org",
        plan="pro",
        country="ID",
        currency="IDR",
        data_region="ap-southeast-3"
    )
    test_db.add(org)

    # Create user
    user = User(
        id=str(uuid.uuid4()),
        email="test@example.com",
        hashed_password=hash_password("password"),
        full_name="Test User",
        role="researcher",
        org_id=org.id
    )
    test_db.add(user)

    # Create project
    project = Project(
        id=str(uuid.uuid4()),
        name="Test Project",
        description="Test project for clips and reels",
        org_id=org.id,
        created_by=user.id
    )
    test_db.add(project)

    # Create media asset
    media_asset = MediaAsset(
        id=str(uuid.uuid4()),
        filename="test_video.mp4",
        file_type="video/mp4",
        file_size=1024000,
        storage_key="test/video.mp4",
        org_id=org.id
    )
    test_db.add(media_asset)

    # Create transcript
    transcript = Transcript(
        id=str(uuid.uuid4()),
        title="Test Interview",
        content="Full transcript content...",
        project_id=project.id,
        org_id=org.id,
        source_media_id=media_asset.id
    )
    test_db.add(transcript)

    # Create transcript segments
    for i in range(5):
        segment = TranscriptSegment(
            id=str(uuid.uuid4()),
            transcript_id=transcript.id,
            speaker=f"Speaker {i % 2 + 1}",
            text=f"This is segment {i}. It contains important insights.",
            start_sec=i * 10.0,
            end_sec=(i + 1) * 10.0,
            segment_idx=i
        )
        test_db.add(segment)

    test_db.commit()

    return {
        "org": org,
        "user": user,
        "project": project,
        "transcript": transcript,
        "media_asset": media_asset
    }


@pytest.fixture
def auth_headers(test_data):
    """Get authentication headers"""
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "password"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestClipsAPI:
    """Test Clips endpoints"""

    def test_create_clip(self, test_data, auth_headers):
        """Test creating a clip"""
        response = client.post(
            f"/api/v1/projects/{test_data['project'].id}/clips",
            headers=auth_headers,
            json={
                "transcript_id": test_data["transcript"].id,
                "name": "Test Clip",
                "description": "A test clip",
                "start_time": 5.0,
                "end_time": 15.0,
                "tags": ["test", "highlight"]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Clip"
        assert data["duration"] == 10.0
        assert data["status"] == "pending"
        assert len(data["tags"]) == 2

    def test_list_clips(self, test_data, auth_headers, test_db):
        """Test listing clips"""
        # Create test clips
        for i in range(3):
            clip = Clip(
                id=str(uuid.uuid4()),
                org_id=test_data["org"].id,
                project_id=test_data["project"].id,
                transcript_id=test_data["transcript"].id,
                name=f"Clip {i}",
                start_time=i * 10.0,
                end_time=(i + 1) * 10.0,
                duration=10.0,
                status="ready",
                created_by=test_data["user"].id
            )
            test_db.add(clip)
        test_db.commit()

        response = client.get(
            f"/api/v1/projects/{test_data['project'].id}/clips",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert all(clip["status"] == "ready" for clip in data)

    def test_update_clip(self, test_data, auth_headers, test_db):
        """Test updating a clip"""
        # Create a clip
        clip = Clip(
            id=str(uuid.uuid4()),
            org_id=test_data["org"].id,
            project_id=test_data["project"].id,
            transcript_id=test_data["transcript"].id,
            name="Original Name",
            start_time=0,
            end_time=10,
            duration=10,
            status="ready",
            created_by=test_data["user"].id
        )
        test_db.add(clip)
        test_db.commit()

        response = client.put(
            f"/api/v1/clips/{clip.id}",
            headers=auth_headers,
            json={
                "name": "Updated Name",
                "description": "Updated description",
                "tags": ["updated", "test"]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["description"] == "Updated description"
        assert "updated" in data["tags"]

    def test_delete_clip(self, test_data, auth_headers, test_db):
        """Test deleting a clip"""
        # Create a clip
        clip = Clip(
            id=str(uuid.uuid4()),
            org_id=test_data["org"].id,
            project_id=test_data["project"].id,
            transcript_id=test_data["transcript"].id,
            name="To Delete",
            start_time=0,
            end_time=10,
            duration=10,
            status="ready",
            created_by=test_data["user"].id
        )
        test_db.add(clip)
        test_db.commit()

        response = client.delete(
            f"/api/v1/clips/{clip.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        assert test_db.query(Clip).filter(Clip.id == clip.id).first() is None


class TestReelsAPI:
    """Test Reels endpoints"""

    def test_create_reel(self, test_data, auth_headers):
        """Test creating a reel"""
        response = client.post(
            f"/api/v1/projects/{test_data['project'].id}/reels",
            headers=auth_headers,
            json={
                "name": "Test Reel",
                "description": "A test highlight reel",
                "purpose": "highlight",
                "transition_style": "fade",
                "transition_duration": 0.5,
                "resolution": "1080p",
                "aspect_ratio": "16:9",
                "format": "mp4"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Reel"
        assert data["purpose"] == "highlight"
        assert data["status"] == "draft"
        assert data["resolution"] == "1080p"

    def test_add_clip_to_reel(self, test_data, auth_headers, test_db):
        """Test adding clips to a reel"""
        # Create a clip
        clip = Clip(
            id=str(uuid.uuid4()),
            org_id=test_data["org"].id,
            project_id=test_data["project"].id,
            transcript_id=test_data["transcript"].id,
            name="Test Clip",
            start_time=0,
            end_time=10,
            duration=10,
            status="ready",
            created_by=test_data["user"].id
        )
        test_db.add(clip)

        # Create a reel
        reel = Reel(
            id=str(uuid.uuid4()),
            org_id=test_data["org"].id,
            project_id=test_data["project"].id,
            name="Test Reel",
            status="draft",
            created_by=test_data["user"].id
        )
        test_db.add(reel)
        test_db.commit()

        response = client.post(
            f"/api/v1/reels/{reel.id}/items",
            headers=auth_headers,
            json={
                "clip_id": clip.id,
                "position": 0,
                "title_overlay": "Test Title"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["clip_id"] == clip.id
        assert data["title_overlay"] == "Test Title"
        assert data["position"] == 0

    def test_compile_reel(self, test_data, auth_headers, test_db):
        """Test compiling a reel"""
        # Create clips and reel with items
        clip = Clip(
            id=str(uuid.uuid4()),
            org_id=test_data["org"].id,
            project_id=test_data["project"].id,
            transcript_id=test_data["transcript"].id,
            name="Test Clip",
            start_time=0,
            end_time=10,
            duration=10,
            status="ready",
            created_by=test_data["user"].id
        )
        test_db.add(clip)

        reel = Reel(
            id=str(uuid.uuid4()),
            org_id=test_data["org"].id,
            project_id=test_data["project"].id,
            name="Test Reel",
            status="draft",
            created_by=test_data["user"].id
        )
        test_db.add(reel)

        item = ReelItem(
            id=str(uuid.uuid4()),
            reel_id=reel.id,
            clip_id=clip.id,
            position=0
        )
        test_db.add(item)
        test_db.commit()

        response = client.post(
            f"/api/v1/reels/{reel.id}/compile",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "job_id" in data
        assert data["message"] == "Reel compilation started"

    def test_delete_reel(self, test_data, auth_headers, test_db):
        """Test deleting a reel"""
        reel = Reel(
            id=str(uuid.uuid4()),
            org_id=test_data["org"].id,
            project_id=test_data["project"].id,
            name="To Delete",
            status="draft",
            created_by=test_data["user"].id
        )
        test_db.add(reel)
        test_db.commit()

        response = client.delete(
            f"/api/v1/reels/{reel.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        assert test_db.query(Reel).filter(Reel.id == reel.id).first() is None


class TestShareAPI:
    """Test Share functionality"""

    def test_create_share_link(self, test_data, auth_headers, test_db):
        """Test creating a share link"""
        # Create a clip
        clip = Clip(
            id=str(uuid.uuid4()),
            org_id=test_data["org"].id,
            project_id=test_data["project"].id,
            transcript_id=test_data["transcript"].id,
            name="Share Test",
            start_time=0,
            end_time=10,
            duration=10,
            status="ready",
            created_by=test_data["user"].id
        )
        test_db.add(clip)
        test_db.commit()

        response = client.post(
            "/api/v1/share",
            headers=auth_headers,
            json={
                "target_type": "clip",
                "target_id": clip.id,
                "title": "Shared Clip",
                "allow_download": True
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["target_type"] == "clip"
        assert data["target_id"] == clip.id
        assert data["allow_download"] is True
        assert "token" in data
        assert "url" in data

    def test_access_shared_content(self, test_data, auth_headers, test_db):
        """Test accessing shared content"""
        # Create and share a clip
        clip = Clip(
            id=str(uuid.uuid4()),
            org_id=test_data["org"].id,
            project_id=test_data["project"].id,
            transcript_id=test_data["transcript"].id,
            name="Shared Clip",
            start_time=0,
            end_time=10,
            duration=10,
            status="ready",
            created_by=test_data["user"].id
        )
        test_db.add(clip)

        share_link = ShareLink(
            id=str(uuid.uuid4()),
            org_id=test_data["org"].id,
            target_type="clip",
            target_id=clip.id,
            token="test-token-123",
            title="Test Share",
            allow_download=True,
            created_by=test_data["user"].id
        )
        test_db.add(share_link)
        test_db.commit()

        # Access shared content (no auth needed)
        response = client.get("/api/v1/share/test-token-123")

        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "clip"
        assert data["title"] == "Test Share"
        assert data["content"]["name"] == "Shared Clip"

        # Check view count was incremented
        test_db.refresh(share_link)
        assert share_link.view_count == 1


class TestClipTemplates:
    """Test Clip Templates"""

    def test_create_template(self, test_data, auth_headers):
        """Test creating a clip template"""
        response = client.post(
            "/api/v1/templates/clips",
            headers=auth_headers,
            json={
                "name": "Highlight Template",
                "description": "Template for creating highlights",
                "category": "highlight",
                "max_duration": 30.0,
                "include_context_before": 2.0,
                "include_context_after": 2.0,
                "is_public": True
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Highlight Template"
        assert data["category"] == "highlight"
        assert data["max_duration"] == 30.0

    def test_list_templates(self, test_data, auth_headers, test_db):
        """Test listing clip templates"""
        # Create templates
        for i in range(2):
            template = ClipTemplate(
                id=str(uuid.uuid4()),
                org_id=test_data["org"].id,
                name=f"Template {i}",
                category="highlight" if i == 0 else "evidence",
                is_public=True,
                created_by=test_data["user"].id
            )
            test_db.add(template)
        test_db.commit()

        response = client.get(
            "/api/v1/templates/clips",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2


class TestMediaProcessor:
    """Test Media Processing Service"""

    def test_media_processor_initialization(self):
        """Test media processor service initialization"""
        from app.services.media_processor import MediaProcessor

        processor = MediaProcessor()
        assert processor is not None
        # ffmpeg might not be installed in test environment
        # Just check the service initializes

    def test_mock_clip_extraction(self):
        """Test mock clip extraction"""
        from app.services.media_processor import MediaProcessor

        processor = MediaProcessor()
        # Mock extraction (ffmpeg not required)
        result = processor.extract_clip(
            input_path="/fake/input.mp4",
            output_path="/fake/output.mp4",
            start_time=10.0,
            end_time=20.0
        )
        # Mock should always succeed
        assert result is True

    def test_mock_reel_compilation(self):
        """Test mock reel compilation"""
        from app.services.media_processor import MediaProcessor

        processor = MediaProcessor()
        clips = [
            {"path": "/fake/clip1.mp4"},
            {"path": "/fake/clip2.mp4"}
        ]
        result = processor.compile_reel(
            clips=clips,
            output_path="/fake/reel.mp4",
            transition_style="fade",
            resolution="1080p"
        )
        # Mock should always succeed
        assert result is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])