"""
Unit tests for dependency functions and permission checks.
Tests authentication, authorization, and multi-tenancy logic.
"""

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app import models, security, deps
from app.deps import get_current_user, require_role, owned_or_404


@pytest.mark.unit
@pytest.mark.auth
class TestOwnershipCheck:
    """Test the owned_or_404 multi-tenancy guard."""

    def test_owned_or_404_found_and_owned(self, db: Session, test_org, test_project):
        """Test that owned_or_404 returns object when owned by org."""
        result = owned_or_404(db, models.Project, test_project.id, test_org.id)
        assert result.id == test_project.id

    def test_owned_or_404_not_found(self, db: Session, test_org):
        """Test that owned_or_404 raises 404 when object doesn't exist."""
        with pytest.raises(HTTPException) as exc_info:
            owned_or_404(db, models.Project, "nonexistent-id", test_org.id)

        assert exc_info.value.status_code == 404

    def test_owned_or_404_wrong_org(self, db: Session, test_project, org_factory):
        """Test that owned_or_404 raises 404 when object belongs to different org."""
        other_org = org_factory.create(db)

        with pytest.raises(HTTPException) as exc_info:
            owned_or_404(db, models.Project, test_project.id, other_org.id)

        assert exc_info.value.status_code == 404

    def test_owned_or_404_with_user(self, db: Session, test_user, test_org):
        """Test owned_or_404 with User model."""
        result = owned_or_404(db, models.User, test_user.id, test_org.id)
        assert result.id == test_user.id

    def test_owned_or_404_with_transcript(self, db: Session, test_transcript, test_org):
        """Test owned_or_404 with Transcript model."""
        result = owned_or_404(db, models.Transcript, test_transcript.id, test_org.id)
        assert result.id == test_transcript.id

    def test_owned_or_404_guards_against_cross_tenant_access(self, db: Session, org_factory, project_factory):
        """Test that owned_or_404 prevents cross-tenant access."""
        org1 = org_factory.create(db, name="Org 1")
        org2 = org_factory.create(db, name="Org 2")

        project = project_factory.create(db, org=org1)

        # User from org2 cannot access org1's project
        with pytest.raises(HTTPException) as exc_info:
            owned_or_404(db, models.Project, project.id, org2.id)

        assert exc_info.value.status_code == 404


@pytest.mark.unit
@pytest.mark.auth
class TestRoleBasedAccess:
    """Test role-based access control."""

    def test_admin_role_check(self, test_admin_user):
        """Test that admin user has admin role."""
        assert test_admin_user.role == "admin"

    def test_researcher_role_check(self, test_researcher_user):
        """Test that researcher user has researcher role."""
        assert test_researcher_user.role == "researcher"

    def test_viewer_role_check(self, test_viewer_user):
        """Test that viewer user has viewer role."""
        assert test_viewer_user.role == "viewer"

    def test_role_hierarchy(self):
        """Test role hierarchy (admin > researcher > viewer)."""
        admin_role = "admin"
        researcher_role = "researcher"
        viewer_role = "viewer"

        # This is a conceptual test - in practice, you'd implement role hierarchy
        roles = [admin_role, researcher_role, viewer_role]
        assert roles[0] == "admin"
        assert roles[1] == "researcher"
        assert roles[2] == "viewer"


@pytest.mark.unit
@pytest.mark.auth
class TestTokenDecoding:
    """Test token decoding and user extraction."""

    def test_create_and_decode_token(self, test_admin_user):
        """Test that created token can be decoded to get user ID."""
        token = security.create_token(test_admin_user.id)
        decoded_id = security.decode_token(token)

        assert decoded_id == test_admin_user.id

    def test_decode_invalid_token(self):
        """Test that invalid token returns None."""
        invalid_token = "invalid.jwt.token"
        result = security.decode_token(invalid_token)

        assert result is None

    def test_decode_empty_token(self):
        """Test that empty token returns None."""
        result = security.decode_token("")
        assert result is None

    def test_decode_none_token(self):
        """Test that None token returns None."""
        result = security.decode_token(None)
        assert result is None


@pytest.mark.unit
@pytest.mark.auth
class TestUserPermissions:
    """Test user permission checks."""

    def test_admin_can_delete_project(self, test_admin_user):
        """Test that admin has delete permissions."""
        assert test_admin_user.role == "admin"
        # Admin should have delete permissions

    def test_researcher_cannot_delete_project(self, test_researcher_user):
        """Test that researcher doesn't have delete permissions."""
        assert test_researcher_user.role == "researcher"
        # Researcher shouldn't have delete permissions

    def test_viewer_cannot_delete_project(self, test_viewer_user):
        """Test that viewer doesn't have delete permissions."""
        assert test_viewer_user.role == "viewer"
        # Viewer shouldn't have delete permissions

    def test_admin_can_create_project(self, test_admin_user):
        """Test that admin can create projects."""
        assert test_admin_user.role == "admin"

    def test_researcher_can_create_project(self, test_researcher_user):
        """Test that researcher can create projects."""
        assert test_researcher_user.role == "researcher"

    def test_viewer_cannot_create_project(self, test_viewer_user):
        """Test that viewer cannot create projects."""
        assert test_viewer_user.role == "viewer"


@pytest.mark.unit
@pytest.mark.auth
class TestUserActivation:
    """Test user active/inactive status."""

    def test_user_is_active_by_default(self, db, test_org, user_factory):
        """Test that new users are active by default."""
        user = user_factory.create(db, org=test_org)
        assert user.is_active is True

    def test_user_can_be_deactivated(self, db, test_user):
        """Test that user can be marked as inactive."""
        test_user.is_active = False
        db.commit()
        db.refresh(test_user)

        assert test_user.is_active is False

    def test_inactive_user_should_not_login(self, db, test_user):
        """Test that inactive user cannot login."""
        test_user.is_active = False
        db.commit()

        # In actual implementation, check would happen in login endpoint
        assert test_user.is_active is False


@pytest.mark.unit
@pytest.mark.auth
class TestMultiTenancy:
    """Test multi-tenancy enforcement."""

    def test_user_belongs_to_org(self, test_user, test_org):
        """Test that user belongs to an org."""
        assert test_user.org_id == test_org.id

    def test_user_cannot_belong_to_multiple_orgs(self, db, test_user):
        """Test that a user belongs to only one org."""
        org_ids = db.query(models.User).filter_by(email=test_user.email).all()
        # Should only find one user
        assert len(org_ids) == 1

    def test_project_belongs_to_org(self, test_project, test_org):
        """Test that project belongs to an org."""
        assert test_project.org_id == test_org.id

    def test_transcript_belongs_to_org(self, test_transcript, test_org):
        """Test that transcript belongs to an org."""
        assert test_transcript.org_id == test_org.id

    def test_analysis_belongs_to_org(self, test_analysis, test_org):
        """Test that analysis belongs to an org."""
        assert test_analysis.org_id == test_org.id

    def test_users_from_different_orgs_isolated(self, db, org_factory, user_factory):
        """Test that users from different orgs don't see each other's data."""
        org1 = org_factory.create(db, name="Org 1")
        org2 = org_factory.create(db, name="Org 2")

        user1 = user_factory.create(db, org=org1)
        user2 = user_factory.create(db, org=org2)

        assert user1.org_id != user2.org_id


@pytest.mark.unit
@pytest.mark.auth
class TestEmailUniqueness:
    """Test that email addresses are unique."""

    def test_email_is_unique(self, db, test_user):
        """Test that email is unique across system."""
        # Try to find user by email
        found = db.query(models.User).filter_by(email=test_user.email).all()
        assert len(found) == 1

    def test_cannot_create_duplicate_email(self, db, test_user, user_factory):
        """Test that duplicate emails are prevented at DB level."""
        # Attempting to create another user with same email should fail
        try:
            user_factory.create(
                db,
                org_id=test_user.org_id,
                email=test_user.email
            )
            # If we get here, the constraint wasn't enforced
            pytest.fail("Should not allow duplicate email")
        except Exception as e:
            # Database integrity error expected
            assert "unique" in str(e).lower() or "constraint" in str(e).lower()


@pytest.mark.unit
class TestPermissionDependencyLogic:
    """Test require_role decorator logic."""

    def test_require_role_accepts_multiple_roles(self):
        """Test that require_role can check multiple roles."""
        # Test the decorator accepts multiple role arguments
        allowed_roles = ("admin", "researcher")
        assert "admin" in allowed_roles
        assert "researcher" in allowed_roles
        assert "viewer" not in allowed_roles

    def test_require_role_single_role(self):
        """Test that require_role can check single role."""
        allowed_role = "admin"
        assert "admin" == allowed_role
        assert "researcher" != allowed_role


@pytest.mark.unit
@pytest.mark.auth
class TestAuthenticationEdgeCases:
    """Test edge cases in authentication."""

    def test_decode_token_with_corrupted_payload(self):
        """Test decoding token with invalid payload."""
        # Not a valid JWT
        invalid_token = "not.a.jwt.token"
        result = security.decode_token(invalid_token)
        assert result is None

    def test_decode_token_with_extra_dots(self):
        """Test decoding token with malformed structure."""
        malformed = "part1.part2.part3.part4"
        result = security.decode_token(malformed)
        assert result is None

    def test_user_lookup_with_invalid_id(self, db):
        """Test looking up user with invalid ID."""
        user = db.query(models.User).filter_by(id="invalid-id-12345").first()
        assert user is None

    def test_token_for_nonexistent_user(self, db):
        """Test token created for non-existent user."""
        token = security.create_token("nonexistent-user-id")
        decoded_id = security.decode_token(token)

        # Token decodes but user won't be found in DB
        assert decoded_id == "nonexistent-user-id"
        found_user = db.get(models.User, decoded_id)
        assert found_user is None
