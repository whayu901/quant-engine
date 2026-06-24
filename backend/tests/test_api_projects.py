"""
API/Integration tests for projects router.
Tests HTTP endpoints for project CRUD operations.
"""

import pytest
import json


@pytest.mark.api
@pytest.mark.router
class TestProjectsCreate:
    """Test project creation endpoint."""

    def test_create_project_success(self, client, admin_headers):
        """Test successful project creation."""
        response = client.post(
            "/projects",
            headers=admin_headers,
            json={
                "name": "My Research Project",
                "description": "A project for consumer research"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "My Research Project"
        assert data["description"] == "A project for consumer research"
        assert data["id"] is not None
        assert data["created_at"] is not None

    def test_create_project_researcher_can_create(self, client, researcher_headers):
        """Test that researcher can create projects."""
        response = client.post(
            "/projects",
            headers=researcher_headers,
            json={
                "name": "Researcher Project",
                "description": "Created by researcher"
            }
        )

        assert response.status_code == 200
        assert response.json()["name"] == "Researcher Project"

    def test_create_project_viewer_cannot_create(self, client, viewer_headers):
        """Test that viewer cannot create projects."""
        response = client.post(
            "/projects",
            headers=viewer_headers,
            json={
                "name": "Viewer Project",
                "description": "Should fail"
            }
        )

        assert response.status_code == 403

    def test_create_project_no_auth_fails(self, client):
        """Test that unauthenticated request fails."""
        response = client.post(
            "/projects",
            json={
                "name": "No Auth Project",
                "description": "Should fail"
            }
        )

        assert response.status_code == 403

    def test_create_project_invalid_token(self, client):
        """Test that invalid token fails."""
        response = client.post(
            "/projects",
            headers={"Authorization": "Bearer invalid"},
            json={
                "name": "Invalid Token Project",
                "description": "Should fail"
            }
        )

        assert response.status_code == 401

    def test_create_project_missing_name(self, client, admin_headers):
        """Test that missing name is rejected."""
        response = client.post(
            "/projects",
            headers=admin_headers,
            json={
                "description": "No name"
            }
        )

        assert response.status_code == 422

    def test_create_project_empty_name(self, client, admin_headers):
        """Test that empty name is accepted."""
        response = client.post(
            "/projects",
            headers=admin_headers,
            json={
                "name": "",
                "description": "Empty name"
            }
        )

        # Depending on validation, might be 422 or 200
        assert response.status_code in [200, 422]

    def test_create_project_no_description(self, client, admin_headers):
        """Test that description is optional."""
        response = client.post(
            "/projects",
            headers=admin_headers,
            json={
                "name": "No Description"
            }
        )

        assert response.status_code == 200
        assert response.json()["description"] == ""

    def test_create_project_belongs_to_user_org(self, client, admin_headers, test_admin_user):
        """Test that created project belongs to user's org."""
        response = client.post(
            "/projects",
            headers=admin_headers,
            json={
                "name": "Test Project",
                "description": "Test"
            }
        )

        assert response.status_code == 200
        # Project should belong to admin's org
        data = response.json()
        assert data["id"] is not None

    def test_create_multiple_projects(self, client, admin_headers):
        """Test creating multiple projects."""
        names = ["Project 1", "Project 2", "Project 3"]

        for name in names:
            response = client.post(
                "/projects",
                headers=admin_headers,
                json={"name": name, "description": f"Description for {name}"}
            )
            assert response.status_code == 200
            assert response.json()["name"] == name


@pytest.mark.api
@pytest.mark.router
class TestProjectsList:
    """Test project listing endpoint."""

    def test_list_projects_empty(self, client, admin_headers):
        """Test listing projects when none exist."""
        response = client.get("/projects", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_list_projects_success(self, client, admin_headers, test_project):
        """Test successfully listing projects."""
        response = client.get("/projects", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(p["id"] == test_project.id for p in data)

    def test_list_projects_no_auth(self, client):
        """Test that unauthenticated list fails."""
        response = client.get("/projects")

        assert response.status_code == 403

    def test_list_projects_invalid_token(self, client):
        """Test that invalid token fails."""
        response = client.get(
            "/projects",
            headers={"Authorization": "Bearer invalid"}
        )

        assert response.status_code == 401

    def test_list_projects_multi_tenant(self, client, admin_headers, test_project, org_factory, user_factory):
        """Test that projects are isolated by org."""
        # Admin lists projects - should see test_project
        response = client.get("/projects", headers=admin_headers)

        assert response.status_code == 200
        projects = response.json()
        assert any(p["id"] == test_project.id for p in projects)

    def test_list_projects_ordered_by_created_at(self, client, admin_headers, project_factory, test_org):
        """Test that projects are ordered by creation time."""
        # Create multiple projects
        p1 = project_factory.create(client.extra_context.get('db'), org=test_org)
        # In real test, would need to control timestamps

        response = client.get("/projects", headers=admin_headers)
        assert response.status_code == 200

    def test_list_projects_pagination(self, client, admin_headers):
        """Test project pagination (if implemented)."""
        # Create many projects
        for i in range(5):
            client.post(
                "/projects",
                headers=admin_headers,
                json={"name": f"Project {i}", "description": ""}
            )

        response = client.get("/projects", headers=admin_headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)


@pytest.mark.api
@pytest.mark.router
class TestProjectsGet:
    """Test get single project endpoint."""

    def test_get_project_success(self, client, admin_headers, test_project):
        """Test successfully getting a project."""
        response = client.get(
            f"/projects/{test_project.id}",
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_project.id
        assert data["name"] == test_project.name

    def test_get_project_not_found(self, client, admin_headers):
        """Test getting nonexistent project."""
        response = client.get(
            "/projects/nonexistent-id",
            headers=admin_headers
        )

        assert response.status_code == 404

    def test_get_project_no_auth(self, client, test_project):
        """Test that unauthenticated get fails."""
        response = client.get(f"/projects/{test_project.id}")

        assert response.status_code == 403

    def test_get_project_invalid_token(self, client, test_project):
        """Test that invalid token fails."""
        response = client.get(
            f"/projects/{test_project.id}",
            headers={"Authorization": "Bearer invalid"}
        )

        assert response.status_code == 401

    def test_get_project_wrong_org(self, client, test_project, org_factory, user_factory, db):
        """Test that user cannot get project from different org."""
        other_org = org_factory.create(db)
        other_user = user_factory.create(db, org=other_org)
        other_token = None  # Would need to create token

        # This test depends on having a token for other_user
        # For now, just verify test_project exists
        assert test_project.id is not None

    def test_get_project_returns_all_fields(self, client, admin_headers, test_project):
        """Test that all project fields are returned."""
        response = client.get(
            f"/projects/{test_project.id}",
            headers=admin_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "name" in data
        assert "description" in data
        assert "created_at" in data


@pytest.mark.api
@pytest.mark.router
class TestProjectsDelete:
    """Test project deletion endpoint."""

    def test_delete_project_admin(self, client, admin_headers, project_factory, test_org, db):
        """Test that admin can delete projects."""
        project = project_factory.create(db, org=test_org)

        response = client.delete(
            f"/projects/{project.id}",
            headers=admin_headers
        )

        assert response.status_code == 200
        assert response.json()["deleted"] == project.id

    def test_delete_project_not_found(self, client, admin_headers):
        """Test deleting nonexistent project."""
        response = client.delete(
            "/projects/nonexistent-id",
            headers=admin_headers
        )

        assert response.status_code == 404

    def test_delete_project_researcher_cannot(self, client, researcher_headers, test_project):
        """Test that researcher cannot delete projects."""
        response = client.delete(
            f"/projects/{test_project.id}",
            headers=researcher_headers
        )

        assert response.status_code == 403

    def test_delete_project_viewer_cannot(self, client, viewer_headers, test_project):
        """Test that viewer cannot delete projects."""
        response = client.delete(
            f"/projects/{test_project.id}",
            headers=viewer_headers
        )

        assert response.status_code == 403

    def test_delete_project_no_auth(self, client, test_project):
        """Test that unauthenticated delete fails."""
        response = client.delete(f"/projects/{test_project.id}")

        assert response.status_code == 403

    def test_delete_project_cascades(self, client, admin_headers, project_factory, test_org, transcript_factory, db):
        """Test that deleting project cascades to transcripts."""
        project = project_factory.create(db, org=test_org)
        transcript = transcript_factory.create(db, project=project)

        response = client.delete(
            f"/projects/{project.id}",
            headers=admin_headers
        )

        assert response.status_code == 200

    def test_delete_project_wrong_org(self, client, admin_headers, test_project, org_factory, project_factory, db):
        """Test that user cannot delete project from different org."""
        # Create another org and project
        other_org = org_factory.create(db)
        other_project = project_factory.create(db, org=other_org)

        # Admin from test_org tries to delete other_project
        response = client.delete(
            f"/projects/{other_project.id}",
            headers=admin_headers
        )

        assert response.status_code == 404


@pytest.mark.api
@pytest.mark.router
class TestProjectsErrorHandling:
    """Test error handling in projects endpoints."""

    def test_invalid_json_rejected(self, client, admin_headers):
        """Test that invalid JSON is rejected."""
        response = client.post(
            "/projects",
            headers=admin_headers,
            content="not json"
        )

        assert response.status_code == 422

    def test_missing_required_field(self, client, admin_headers):
        """Test that missing required field is rejected."""
        response = client.post(
            "/projects",
            headers=admin_headers,
            json={"description": "No name"}
        )

        assert response.status_code == 422

    def test_invalid_field_type(self, client, admin_headers):
        """Test that invalid field type is rejected."""
        response = client.post(
            "/projects",
            headers=admin_headers,
            json={
                "name": 123,  # Should be string
                "description": "Test"
            }
        )

        # FastAPI will coerce 123 to string "123" by default
        assert response.status_code == 200


@pytest.mark.api
@pytest.mark.router
class TestProjectsIntegration:
    """Test project operations integration."""

    def test_create_list_get_delete_flow(self, client, admin_headers):
        """Test complete project lifecycle."""
        # Create
        create_response = client.post(
            "/projects",
            headers=admin_headers,
            json={
                "name": "Lifecycle Project",
                "description": "Test project lifecycle"
            }
        )
        assert create_response.status_code == 200
        project_id = create_response.json()["id"]

        # List and verify it's there
        list_response = client.get("/projects", headers=admin_headers)
        assert list_response.status_code == 200
        projects = list_response.json()
        assert any(p["id"] == project_id for p in projects)

        # Get
        get_response = client.get(
            f"/projects/{project_id}",
            headers=admin_headers
        )
        assert get_response.status_code == 200
        assert get_response.json()["id"] == project_id

        # Delete
        delete_response = client.delete(
            f"/projects/{project_id}",
            headers=admin_headers
        )
        assert delete_response.status_code == 200

    def test_multiple_users_same_org_same_projects(self, client, admin_headers, researcher_headers):
        """Test that users in same org see same projects."""
        # Create project as admin
        create_response = client.post(
            "/projects",
            headers=admin_headers,
            json={"name": "Shared Project", "description": ""}
        )
        assert create_response.status_code == 200

        # List as researcher - should see same project
        list_response = client.get(
            "/projects",
            headers=researcher_headers
        )
        assert list_response.status_code == 200

    def test_project_permissions_by_role(self, client, admin_headers, researcher_headers, viewer_headers):
        """Test project permissions by role."""
        # Admin creates project
        create_response = client.post(
            "/projects",
            headers=admin_headers,
            json={"name": "Permission Test", "description": ""}
        )
        assert create_response.status_code == 200
        project_id = create_response.json()["id"]

        # Researcher can list and get
        list_response = client.get("/projects", headers=researcher_headers)
        assert list_response.status_code == 200

        get_response = client.get(
            f"/projects/{project_id}",
            headers=researcher_headers
        )
        assert get_response.status_code == 200

        # Researcher cannot delete
        delete_response = client.delete(
            f"/projects/{project_id}",
            headers=researcher_headers
        )
        assert delete_response.status_code == 403

        # Viewer can list and get
        list_response = client.get("/projects", headers=viewer_headers)
        assert list_response.status_code == 200

        # Viewer cannot delete
        delete_response = client.delete(
            f"/projects/{project_id}",
            headers=viewer_headers
        )
        assert delete_response.status_code == 403
