# Starter Template: Copy-Paste Code to Get Started

These are ready-to-use templates for building your clean architecture. Just copy and customize!

---

## Template 1: BaseRepository (Foundation)

**File: `app/repositories/base.py`**

Copy this exactly. It's the foundation for all repositories.

```python
from sqlalchemy.orm import Session
from typing import TypeVar, Generic, List, Type, Optional

T = TypeVar('T')


class BaseRepository(Generic[T]):
    """
    Base repository class with common CRUD operations.
    All repositories inherit from this.

    Usage:
        class ProjectRepository(BaseRepository[models.Project]):
            def __init__(self, db: Session):
                super().__init__(db, models.Project)
    """

    def __init__(self, db: Session, model: Type[T]):
        self.db = db
        self.model = model

    def create(self, **kwargs) -> T:
        """Create a new record."""
        obj = self.model(**kwargs)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get(self, id: str) -> Optional[T]:
        """Get a record by ID."""
        return self.db.query(self.model).filter(self.model.id == id).first()

    def list(self, limit: int = 50, offset: int = 0) -> List[T]:
        """List all records with pagination."""
        return self.db.query(self.model).limit(limit).offset(offset).all()

    def update(self, obj: T) -> T:
        """Update an existing record."""
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: T):
        """Delete a record."""
        self.db.delete(obj)
        self.db.commit()

    def count(self) -> int:
        """Count total records."""
        return self.db.query(self.model).count()
```

---

## Template 2: Simple Repository (Example: Project)

**File: `app/repositories/project_repo.py`**

Copy and customize for your entity.

```python
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app import models
from .base import BaseRepository


class ProjectRepository(BaseRepository[models.Project]):
    """Repository for Project database operations."""

    def __init__(self, db: Session):
        super().__init__(db, models.Project)

    # -- Custom queries specific to Project --

    def get_by_id_and_org(self, project_id: str, org_id: str) -> Optional[models.Project]:
        """Get a project only if it belongs to the organization (multi-tenant check)."""
        return self.db.query(self.model).filter(
            self.model.id == project_id,
            self.model.org_id == org_id
        ).first()

    def list_by_org(self, org_id: str, limit: int = 50, offset: int = 0) -> List[models.Project]:
        """List all projects for an organization."""
        return self.db.query(self.model).filter(
            self.model.org_id == org_id
        ).order_by(
            self.model.created_at.desc()
        ).limit(limit).offset(offset).all()

    def list_by_org_with_count(self, org_id: str) -> List[models.Project]:
        """List projects with transcript count (useful for dashboard)."""
        from sqlalchemy import func
        return self.db.query(self.model).filter(
            self.model.org_id == org_id
        ).options(
            joinedload(self.model.transcripts)  # Eager load to avoid N+1 queries
        ).order_by(
            self.model.created_at.desc()
        ).all()

    def count_by_org(self, org_id: str) -> int:
        """Count projects for an organization."""
        return self.db.query(self.model).filter(
            self.model.org_id == org_id
        ).count()

    def search_by_name(self, org_id: str, search_term: str) -> List[models.Project]:
        """Search projects by name."""
        return self.db.query(self.model).filter(
            self.model.org_id == org_id,
            self.model.name.ilike(f"%{search_term}%")
        ).order_by(
            self.model.created_at.desc()
        ).all()
```

---

## Template 3: Simple Service (Example: Project)

**File: `app/services/project_service.py`**

Copy and customize for your feature.

```python
from typing import List, Optional
from app import models
from app.repositories.project_repo import ProjectRepository


class ProjectService:
    """Service for project business logic."""

    def __init__(self, repo: ProjectRepository):
        """
        Initialize service with repository.

        Args:
            repo: ProjectRepository instance (injected by FastAPI)
        """
        self.repo = repo

    # -- Create --

    def create_project(self, org_id: str, name: str, description: str = "", created_by: str = None) -> models.Project:
        """
        Create a new project.

        Args:
            org_id: Organization ID (who owns this project)
            name: Project name
            description: Optional project description
            created_by: User ID who created it

        Returns:
            Created Project object

        Raises:
            ValueError: If validation fails
        """
        # Validation (business logic)
        if not name or not name.strip():
            raise ValueError("Project name is required")

        if len(name.strip()) > 255:
            raise ValueError("Project name must be less than 255 characters")

        # Delegate to repository
        return self.repo.create(
            org_id=org_id,
            name=name.strip(),
            description=description,
            created_by=created_by
        )

    # -- Read --

    def get_project(self, project_id: str, org_id: str) -> Optional[models.Project]:
        """
        Get a project by ID (with organization permission check).

        Args:
            project_id: Project ID to retrieve
            org_id: Organization ID (to ensure permission)

        Returns:
            Project object or None if not found
        """
        return self.repo.get_by_id_and_org(project_id, org_id)

    def list_projects(self, org_id: str, limit: int = 50, offset: int = 0) -> List[models.Project]:
        """
        List projects for an organization.

        Args:
            org_id: Organization ID
            limit: Max results to return (default 50)
            offset: Results to skip (for pagination)

        Returns:
            List of Project objects
        """
        return self.repo.list_by_org(org_id, limit, offset)

    def search_projects(self, org_id: str, search_term: str) -> List[models.Project]:
        """
        Search projects by name.

        Args:
            org_id: Organization ID
            search_term: Text to search for

        Returns:
            List of matching Project objects
        """
        if not search_term or not search_term.strip():
            return self.list_projects(org_id)

        return self.repo.search_by_name(org_id, search_term.strip())

    # -- Update --

    def update_project(self, project_id: str, org_id: str, name: str = None, description: str = None) -> Optional[models.Project]:
        """
        Update a project.

        Args:
            project_id: Project ID to update
            org_id: Organization ID (permission check)
            name: New project name (optional)
            description: New description (optional)

        Returns:
            Updated Project object or None if not found
        """
        project = self.get_project(project_id, org_id)
        if not project:
            return None

        # Only update if provided
        if name is not None:
            if not name.strip():
                raise ValueError("Project name cannot be empty")
            project.name = name.strip()

        if description is not None:
            project.description = description

        return self.repo.update(project)

    # -- Delete --

    def delete_project(self, project_id: str, org_id: str) -> bool:
        """
        Delete a project.

        Args:
            project_id: Project ID to delete
            org_id: Organization ID (permission check)

        Returns:
            True if deleted, False if not found
        """
        project = self.get_project(project_id, org_id)
        if not project:
            return False

        self.repo.delete(project)
        return True

    # -- Stats --

    def get_project_stats(self, project_id: str, org_id: str) -> dict:
        """
        Get statistics for a project.

        Args:
            project_id: Project ID
            org_id: Organization ID (permission check)

        Returns:
            Dictionary with stats
        """
        project = self.get_project(project_id, org_id)
        if not project:
            return None

        return {
            "id": project.id,
            "name": project.name,
            "transcript_count": len(project.transcripts),
            "created_at": project.created_at,
        }
```

---

## Template 4: Simple Router (Example: Project)

**File: `app/routers/projects.py`**

Copy and customize for your endpoints.

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app import models, schemas
from app.database import get_db
from app.deps import get_current_user, require_role
from app.repositories.project_repo import ProjectRepository
from app.services.project_service import ProjectService

# -- Dependency Injection --

def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
    """
    Dependency that creates and injects ProjectService.
    FastAPI calls this automatically for each request.
    """
    repo = ProjectRepository(db)
    return ProjectService(repo)

# -- Router Setup --

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
    responses={404: {"description": "Not found"}}
)

# -- Schemas (for request/response) --

class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class ProjectUpdate(BaseModel):
    name: str = None
    description: str = None


# -- Endpoints --

@router.post("", response_model=schemas.ProjectOut, status_code=201)
def create_project(
    body: ProjectCreate,
    user: models.User = Depends(require_role("admin", "researcher")),
    service: ProjectService = Depends(get_project_service)
):
    """
    Create a new project.

    - **Requires:** User must be admin or researcher
    - **Returns:** Created project
    """
    try:
        project = service.create_project(
            org_id=user.org_id,
            name=body.name,
            description=body.description,
            created_by=user.id
        )
        return project
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=List[schemas.ProjectOut])
def list_projects(
    user: models.User = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
    limit: int = 50,
    offset: int = 0
):
    """
    List all projects for the user's organization.

    - **Query params:**
      - limit: Max results (default 50)
      - offset: Pagination offset (default 0)
    """
    return service.list_projects(user.org_id, limit, offset)


@router.get("/search", response_model=List[schemas.ProjectOut])
def search_projects(
    q: str,
    user: models.User = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service)
):
    """Search projects by name."""
    return service.search_projects(user.org_id, q)


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: str,
    user: models.User = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service)
):
    """Get a specific project."""
    project = service.get_project(project_id, user.org_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: str,
    body: ProjectUpdate,
    user: models.User = Depends(require_role("admin", "researcher")),
    service: ProjectService = Depends(get_project_service)
):
    """Update a project."""
    try:
        project = service.update_project(
            project_id=project_id,
            org_id=user.org_id,
            name=body.name,
            description=body.description
        )
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    user: models.User = Depends(require_role("admin")),
    service: ProjectService = Depends(get_project_service)
):
    """Delete a project (admin only)."""
    success = service.delete_project(project_id, user.org_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"deleted": project_id}


@router.get("/{project_id}/stats")
def get_project_stats(
    project_id: str,
    user: models.User = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service)
):
    """Get statistics for a project."""
    stats = service.get_project_stats(project_id, user.org_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Project not found")
    return stats
```

---

## Template 5: Unit Test (Example: ProjectService)

**File: `app/tests/unit/test_project_service.py`**

```python
import pytest
from unittest.mock import Mock, MagicMock
from app import models
from app.services.project_service import ProjectService


class TestProjectService:
    """Unit tests for ProjectService (no database)."""

    def setup_method(self):
        """Run before each test."""
        # Create a mock repository
        self.mock_repo = Mock()
        # Create service with mock
        self.service = ProjectService(self.mock_repo)

    # -- Tests for create_project --

    def test_create_project_validates_empty_name(self):
        """Service should reject empty project names."""
        with pytest.raises(ValueError, match="name is required"):
            self.service.create_project(org_id="org1", name="", description="test")

        # Mock should never be called
        self.mock_repo.create.assert_not_called()

    def test_create_project_validates_long_name(self):
        """Service should reject names longer than 255 chars."""
        long_name = "x" * 256
        with pytest.raises(ValueError, match="less than 255"):
            self.service.create_project(org_id="org1", name=long_name)

    def test_create_project_success(self):
        """Service should create project with valid data."""
        # Setup mock to return a project
        expected_project = models.Project(
            id="p1",
            org_id="org1",
            name="Test Project",
            description="test"
        )
        self.mock_repo.create.return_value = expected_project

        # Call service
        result = self.service.create_project(
            org_id="org1",
            name="Test Project",
            description="test",
            created_by="user1"
        )

        # Verify
        assert result.id == "p1"
        assert result.name == "Test Project"
        self.mock_repo.create.assert_called_once()

    def test_create_project_strips_whitespace(self):
        """Service should strip leading/trailing whitespace."""
        expected_project = models.Project(id="p1", name="Test Project")
        self.mock_repo.create.return_value = expected_project

        self.service.create_project(org_id="org1", name="  Test Project  ")

        # Verify it called with stripped name
        call_args = self.mock_repo.create.call_args
        assert call_args.kwargs["name"] == "Test Project"

    # -- Tests for get_project --

    def test_get_project_returns_none_if_not_found(self):
        """Service should return None if project doesn't exist."""
        self.mock_repo.get_by_id_and_org.return_value = None

        result = self.service.get_project("p999", "org1")

        assert result is None

    def test_get_project_checks_organization(self):
        """Service should filter by organization."""
        expected_project = models.Project(id="p1", org_id="org1")
        self.mock_repo.get_by_id_and_org.return_value = expected_project

        result = self.service.get_project("p1", "org1")

        assert result.id == "p1"
        # Verify it passed both IDs to repo
        self.mock_repo.get_by_id_and_org.assert_called_once_with("p1", "org1")

    # -- Tests for list_projects --

    def test_list_projects_with_pagination(self):
        """Service should pass pagination params to repo."""
        self.mock_repo.list_by_org.return_value = []

        self.service.list_projects("org1", limit=25, offset=50)

        self.mock_repo.list_by_org.assert_called_once_with("org1", 25, 50)

    def test_list_projects_default_pagination(self):
        """Service should use default pagination if not provided."""
        self.mock_repo.list_by_org.return_value = []

        self.service.list_projects("org1")

        self.mock_repo.list_by_org.assert_called_once_with("org1", 50, 0)

    # -- Tests for delete_project --

    def test_delete_project_returns_false_if_not_found(self):
        """Service should return False if project not found."""
        self.mock_repo.get_by_id_and_org.return_value = None

        result = self.service.delete_project("p999", "org1")

        assert result is False
        self.mock_repo.delete.assert_not_called()

    def test_delete_project_calls_repo_if_found(self):
        """Service should delete if found."""
        expected_project = models.Project(id="p1")
        self.mock_repo.get_by_id_and_org.return_value = expected_project

        result = self.service.delete_project("p1", "org1")

        assert result is True
        self.mock_repo.delete.assert_called_once_with(expected_project)
```

---

## Template 6: Integration Test (Example: ProjectRepository)

**File: `app/tests/integration/test_project_repo.py`**

```python
import pytest
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal
from app.repositories.project_repo import ProjectRepository


@pytest.fixture
def db_session():
    """
    Create a test database session.
    Automatically cleans up after each test.
    """
    db = SessionLocal()
    yield db
    # Cleanup
    db.query(models.Project).delete()
    db.query(models.Org).delete()
    db.commit()
    db.close()


@pytest.fixture
def org(db_session):
    """Create test organization."""
    org = models.Org(id="org1", name="Test Org")
    db_session.add(org)
    db_session.commit()
    return org


@pytest.fixture
def repo(db_session):
    """Create repository with test database."""
    return ProjectRepository(db_session)


class TestProjectRepository:
    """Integration tests for ProjectRepository (with real database)."""

    def test_create_project(self, repo, org, db_session):
        """Repository should create project in database."""
        project = repo.create(org_id=org.id, name="Test Project")

        assert project.id is not None
        assert project.name == "Test Project"

        # Verify it's in database
        db_project = db_session.query(models.Project).filter_by(id=project.id).first()
        assert db_project is not None

    def test_get_by_id(self, repo, org):
        """Repository should retrieve project by ID."""
        # Create first
        created = repo.create(org_id=org.id, name="Test Project")

        # Get
        retrieved = repo.get(created.id)

        assert retrieved.id == created.id
        assert retrieved.name == "Test Project"

    def test_get_by_id_and_org_filters_org(self, repo, db_session):
        """Repository should filter by organization."""
        org1 = models.Org(id="org1", name="Org 1")
        org2 = models.Org(id="org2", name="Org 2")
        db_session.add_all([org1, org2])
        db_session.commit()

        # Create projects in different orgs
        p1 = repo.create(org_id="org1", name="Project 1")
        p2 = repo.create(org_id="org2", name="Project 2")

        # Get should filter by org
        result = repo.get_by_id_and_org(p1.id, "org1")
        assert result.id == p1.id

        # Should return None for wrong org
        result = repo.get_by_id_and_org(p1.id, "org2")
        assert result is None

    def test_list_by_org(self, repo, db_session):
        """Repository should list only org's projects."""
        org1 = models.Org(id="org1", name="Org 1")
        org2 = models.Org(id="org2", name="Org 2")
        db_session.add_all([org1, org2])
        db_session.commit()

        # Create projects
        p1 = repo.create(org_id="org1", name="P1")
        p2 = repo.create(org_id="org1", name="P2")
        p3 = repo.create(org_id="org2", name="P3")

        # List org1
        result = repo.list_by_org("org1")

        assert len(result) == 2
        assert all(p.org_id == "org1" for p in result)

    def test_list_by_org_pagination(self, repo, db_session):
        """Repository should support pagination."""
        org = models.Org(id="org1", name="Org 1")
        db_session.add(org)
        db_session.commit()

        # Create 5 projects
        for i in range(5):
            repo.create(org_id="org1", name=f"Project {i}")

        # Get first 2
        result = repo.list_by_org("org1", limit=2, offset=0)
        assert len(result) == 2

        # Get next 2
        result = repo.list_by_org("org1", limit=2, offset=2)
        assert len(result) == 2

        # Get remaining
        result = repo.list_by_org("org1", limit=2, offset=4)
        assert len(result) == 1

    def test_update_project(self, repo, org):
        """Repository should update project."""
        # Create
        project = repo.create(org_id=org.id, name="Original Name")

        # Update
        project.name = "Updated Name"
        updated = repo.update(project)

        assert updated.name == "Updated Name"

    def test_delete_project(self, repo, org, db_session):
        """Repository should delete project."""
        # Create
        project = repo.create(org_id=org.id, name="To Delete")

        # Delete
        repo.delete(project)

        # Verify deleted
        result = db_session.query(models.Project).filter_by(id=project.id).first()
        assert result is None

    def test_search_by_name(self, repo, db_session):
        """Repository should search by name."""
        org = models.Org(id="org1", name="Org 1")
        db_session.add(org)
        db_session.commit()

        repo.create(org_id="org1", name="Marketing Research")
        repo.create(org_id="org1", name="Product Testing")
        repo.create(org_id="org1", name="Market Analysis")

        # Search
        results = repo.search_by_name("org1", "market")

        # Should find "Marketing" and "Market Analysis" (case-insensitive)
        assert len(results) == 2

    def test_count_by_org(self, repo, db_session):
        """Repository should count projects."""
        org = models.Org(id="org1", name="Org 1")
        db_session.add(org)
        db_session.commit()

        repo.create(org_id="org1", name="P1")
        repo.create(org_id="org1", name="P2")

        count = repo.count_by_org("org1")
        assert count == 2
```

---

## Template 7: E2E Test (Example: Project Endpoint)

**File: `app/tests/e2e/test_projects_endpoint.py`**

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app import models
from app.database import SessionLocal


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def db_session():
    """Create test database session."""
    db = SessionLocal()
    yield db
    # Cleanup
    db.query(models.Project).delete()
    db.query(models.Transcript).delete()
    db.query(models.User).delete()
    db.query(models.Org).delete()
    db.commit()
    db.close()


@pytest.fixture
def test_user(db_session):
    """Create test user and organization."""
    org = models.Org(id="test-org", name="Test Organization")
    db_session.add(org)
    db_session.commit()

    user = models.User(
        id="test-user",
        org_id=org.id,
        email="test@example.com",
        hashed_password="fake_hash",
        role="admin"
    )
    db_session.add(user)
    db_session.commit()
    return user


@pytest.fixture
def auth_headers(test_user):
    """Create authorization headers."""
    # In real app, you'd generate a real token
    token = "test-token"  # Mock token
    return {"Authorization": f"Bearer {token}"}


class TestProjectsEndpoint:
    """E2E tests for project endpoints."""

    def test_create_project(self, client, auth_headers):
        """Should create a project."""
        response = client.post(
            "/projects",
            headers=auth_headers,
            json={
                "name": "Market Research 2024",
                "description": "Annual market analysis"
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Market Research 2024"
        assert data["id"] is not None

    def test_create_project_validates_name(self, client, auth_headers):
        """Should reject empty project name."""
        response = client.post(
            "/projects",
            headers=auth_headers,
            json={
                "name": "",
                "description": "test"
            }
        )

        assert response.status_code == 400
        assert "name is required" in response.json()["detail"]

    def test_list_projects(self, client, db_session, test_user, auth_headers):
        """Should list all projects for organization."""
        # Create test projects
        p1 = models.Project(org_id=test_user.org_id, name="Project 1")
        p2 = models.Project(org_id=test_user.org_id, name="Project 2")
        db_session.add_all([p1, p2])
        db_session.commit()

        response = client.get("/projects", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_list_projects_pagination(self, client, db_session, test_user, auth_headers):
        """Should support pagination."""
        # Create 5 projects
        for i in range(5):
            p = models.Project(org_id=test_user.org_id, name=f"Project {i}")
            db_session.add(p)
        db_session.commit()

        # Get first page
        response = client.get("/projects?limit=2&offset=0", headers=auth_headers)
        assert len(response.json()) == 2

        # Get second page
        response = client.get("/projects?limit=2&offset=2", headers=auth_headers)
        assert len(response.json()) == 2

    def test_get_project(self, client, db_session, test_user, auth_headers):
        """Should get a specific project."""
        # Create project
        project = models.Project(org_id=test_user.org_id, name="Test Project")
        db_session.add(project)
        db_session.commit()

        response = client.get(f"/projects/{project.id}", headers=auth_headers)

        assert response.status_code == 200
        assert response.json()["name"] == "Test Project"

    def test_get_project_not_found(self, client, auth_headers):
        """Should return 404 for non-existent project."""
        response = client.get("/projects/nonexistent", headers=auth_headers)
        assert response.status_code == 404

    def test_update_project(self, client, db_session, test_user, auth_headers):
        """Should update a project."""
        # Create project
        project = models.Project(org_id=test_user.org_id, name="Old Name")
        db_session.add(project)
        db_session.commit()

        response = client.put(
            f"/projects/{project.id}",
            headers=auth_headers,
            json={"name": "New Name"}
        )

        assert response.status_code == 200
        assert response.json()["name"] == "New Name"

    def test_delete_project(self, client, db_session, test_user, auth_headers):
        """Should delete a project (admin only)."""
        # Create project
        project = models.Project(org_id=test_user.org_id, name="To Delete")
        db_session.add(project)
        db_session.commit()

        response = client.delete(f"/projects/{project.id}", headers=auth_headers)

        assert response.status_code == 200
        assert response.json()["deleted"] == project.id

        # Verify deleted
        response = client.get(f"/projects/{project.id}", headers=auth_headers)
        assert response.status_code == 404

    def test_requires_authentication(self, client):
        """Should reject requests without token."""
        response = client.get("/projects")
        assert response.status_code == 401

    def test_search_projects(self, client, db_session, test_user, auth_headers):
        """Should search projects by name."""
        # Create projects
        db_session.add(models.Project(org_id=test_user.org_id, name="Market Research"))
        db_session.add(models.Project(org_id=test_user.org_id, name="Product Testing"))
        db_session.commit()

        response = client.get("/projects/search?q=market", headers=auth_headers)

        assert response.status_code == 200
        results = response.json()
        assert len(results) == 1
        assert "Market" in results[0]["name"]
```

---

## How to Use These Templates

### Step 1: Copy BaseRepository
```bash
cp STARTER_TEMPLATE.md app/repositories/base.py
# Edit out just the Python code
```

### Step 2: Copy and Customize for Your Feature
For each new feature (Project, Analysis, Transcript, etc.):

1. Copy **Template 2** (Repository)
   - Replace `Project` with your entity name
   - Replace `project_repo.py` with your file name
   - Customize queries for your needs

2. Copy **Template 3** (Service)
   - Replace `Project` with your entity name
   - Add your business logic

3. Copy **Template 4** (Router)
   - Replace `projects` with your feature name
   - Keep the structure, just customize endpoints

4. Copy **Template 5** (Unit Test)
   - Replace `ProjectService` with your service name
   - Add tests for your business logic

5. Copy **Template 6** (Integration Test)
   - Replace `ProjectRepository` with your repo name
   - Add tests for your queries

6. Copy **Template 7** (E2E Test)
   - Replace `/projects` with your endpoint
   - Add tests for full flow

### Step 3: Run Tests
```bash
# Unit tests (no database)
pytest tests/unit/test_*_service.py -v

# Integration tests (with database)
pytest tests/integration/test_*_repo.py -v

# E2E tests (full flow)
pytest tests/e2e/test_*_endpoint.py -v

# All with coverage
pytest --cov=app tests/ -v
```

---

## Quick Copy-Paste Commands

```bash
# Create repository structure
mkdir -p app/repositories
touch app/repositories/__init__.py
touch app/repositories/base.py

# Create service structure
mkdir -p app/services_v2
touch app/services_v2/__init__.py

# Create test structure
mkdir -p app/tests/unit
mkdir -p app/tests/integration
mkdir -p app/tests/e2e
touch app/tests/__init__.py
touch app/tests/conftest.py
```

---

## What's Next

1. **Start with ProjectRepository + ProjectService** (simplest)
2. **Write tests for both** (validates the pattern)
3. **Create ProjectRouter** (thin wrapper)
4. **Test in Postman/Frontend** (verify it works)
5. **Repeat for other features**

The templates are modular - each one can be used independently!
