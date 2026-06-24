# Quick Reference: Clean Architecture for Qual Engine

**For team members with no Python experience**

---

## The Big Picture (Simple Version)

Think of your backend like a restaurant:

```
Customer (Frontend)
    ↓
Waiter (Router) - Takes orders, delivers food
    ↓
Chef (Service) - Knows the recipes, manages the kitchen
    ↓
Supplier (Repository) - Gets ingredients from the storage/warehouse
    ↓
Storage (Database) - Where everything is kept
```

---

## What Happens When Frontend Sends a Request

**Example: "Create a project"**

```
1. Frontend sends: POST /projects {"name": "My Project"}
   ↓
2. Router receives request
   - Checks if user is logged in
   - Validates the data (name is provided, etc.)
   - Calls ProjectService.create_project(...)
   ↓
3. Service (ProjectService) handles business logic
   - Checks if project name is empty
   - Checks if user has permission
   - Calls Repository.create(...)
   ↓
4. Repository (ProjectRepository) handles database
   - Creates SQL query: INSERT INTO projects ...
   - Saves to database
   - Returns the new project
   ↓
5. Service returns result to Router
   ↓
6. Router formats as JSON and sends back to Frontend
   ↓
7. Frontend receives: {"id": "p123", "name": "My Project", ...}
```

---

## Where to Put What Code

### "I need to add a new API endpoint"
→ Add a function in `routers/some_feature.py`

**Example: Add new endpoint to get project stats**
```python
# routers/projects.py
@router.get("/{project_id}/stats")
def get_project_stats(project_id: str, user: models.User = Depends(get_current_user)):
    # 1. Call the service
    stats = service.get_stats(project_id, user.org_id)
    # 2. Return as JSON
    return stats
```

### "I need to add new business logic"
→ Add a method in `services/some_feature_service.py`

**Example: Add business rule "Only admins can delete projects"**
```python
# services/project_service.py
def delete_project(self, project_id: str, org_id: str, user_role: str):
    # Business logic: Check permission
    if user_role != "admin":
        raise PermissionError("Only admins can delete")

    # If OK, call repository
    return self.repo.delete(project_id)
```

### "I need a new database query"
→ Add a method in `repositories/some_feature_repo.py`

**Example: Query "Get all projects created this month"**
```python
# repositories/project_repo.py
def list_projects_this_month(self, org_id: str):
    from datetime import datetime, timedelta

    today = datetime.utcnow()
    month_start = today.replace(day=1)

    return self.db.query(models.Project).filter(
        models.Project.org_id == org_id,
        models.Project.created_at >= month_start
    ).all()
```

---

## Common Patterns

### Pattern 1: Create Something

```python
# Router
@router.post("/projects")
def create_project(body: schemas.ProjectIn, service: ProjectService = Depends()):
    return service.create(name=body.name, org_id=user.org_id)

# Service
def create(self, name: str, org_id: str):
    if not name.strip():
        raise ValueError("Name is required")
    return self.repo.create(name=name, org_id=org_id)

# Repository
def create(self, **kwargs):
    obj = models.Project(**kwargs)
    self.db.add(obj)
    self.db.commit()
    return obj
```

### Pattern 2: Get Something

```python
# Router
@router.get("/{id}")
def get_project(id: str, service: ProjectService = Depends()):
    project = service.get(id, user.org_id)
    if not project:
        raise HTTPException(404, "Not found")
    return project

# Service
def get(self, id: str, org_id: str):
    # Permission check: Must be in same org
    return self.repo.get_by_id(id, org_id)

# Repository
def get_by_id(self, id: str, org_id: str):
    return self.db.query(models.Project).filter(
        models.Project.id == id,
        models.Project.org_id == org_id
    ).first()
```

### Pattern 3: List with Filtering

```python
# Router
@router.get("")
def list_projects(user: models.User = Depends(), service: ProjectService = Depends()):
    return service.list(org_id=user.org_id, limit=50, offset=0)

# Service
def list(self, org_id: str, limit: int = 50, offset: int = 0):
    return self.repo.list_by_org(org_id, limit, offset)

# Repository
def list_by_org(self, org_id: str, limit: int = 50, offset: int = 0):
    return self.db.query(models.Project).filter(
        models.Project.org_id == org_id
    ).order_by(models.Project.created_at.desc()).limit(limit).offset(offset).all()
```

### Pattern 4: Update Something

```python
# Router
@router.put("/{id}")
def update_project(id: str, body: schemas.ProjectUpdate, service: ProjectService = Depends()):
    project = service.update(id, user.org_id, name=body.name)
    if not project:
        raise HTTPException(404, "Not found")
    return project

# Service
def update(self, id: str, org_id: str, **fields):
    project = self.get(id, org_id)
    if not project:
        return None
    for key, value in fields.items():
        setattr(project, key, value)
    return self.repo.update(project)

# Repository
def update(self, obj):
    self.db.commit()
    self.db.refresh(obj)
    return obj
```

### Pattern 5: Delete Something

```python
# Router
@router.delete("/{id}")
def delete_project(id: str, service: ProjectService = Depends()):
    success = service.delete(id, user.org_id)
    if not success:
        raise HTTPException(404, "Not found")
    return {"deleted": id}

# Service
def delete(self, id: str, org_id: str):
    project = self.get(id, org_id)
    if not project:
        return False
    self.repo.delete(project)
    return True

# Repository
def delete(self, obj):
    self.db.delete(obj)
    self.db.commit()
```

---

## Rules to Follow

### Rule 1: Router Never Touches Database
**WRONG:**
```python
# DON'T do this!
@router.get("/projects")
def list_projects(db: Session = Depends()):
    return db.query(models.Project).all()  # ✗ BAD!
```

**RIGHT:**
```python
# DO this!
@router.get("/projects")
def list_projects(service: ProjectService = Depends()):
    return service.list(user.org_id)  # ✓ GOOD!
```

**Why?** If you need to change the database, you only change the repository, not 10 routers.

### Rule 2: Service Never Uses Database Directly
**WRONG:**
```python
# DON'T do this!
class ProjectService:
    def list_projects(self, org_id: str):
        db = SessionLocal()
        return db.query(models.Project).filter(...)  # ✗ BAD!
```

**RIGHT:**
```python
# DO this!
class ProjectService:
    def __init__(self, repo: ProjectRepository):
        self.repo = repo

    def list_projects(self, org_id: str):
        return self.repo.list_by_org(org_id)  # ✓ GOOD!
```

**Why?** Service can be tested without a real database (using a fake/mock repository).

### Rule 3: Repository Never Has Business Logic
**WRONG:**
```python
# DON'T do this!
class ProjectRepository:
    def create(self, name: str, org_id: str):
        # Don't put validation here!
        if not name or not org_id:  # ✗ BAD!
            raise ValueError("...")
        return db.query(...).add(...)
```

**RIGHT:**
```python
# DO this!
class ProjectRepository:
    def create(self, **kwargs):
        # Just create and save
        obj = models.Project(**kwargs)
        self.db.add(obj)
        self.db.commit()
        return obj  # ✓ GOOD!
```

**Why?** Repository is simple and reusable. Business logic (validation) goes in Service.

### Rule 4: Always Inject Dependencies
**WRONG:**
```python
# DON'T do this!
class ProjectService:
    def __init__(self):
        self.repo = ProjectRepository()  # ✗ BAD! Hard to test!
```

**RIGHT:**
```python
# DO this!
class ProjectService:
    def __init__(self, repo: ProjectRepository):
        self.repo = repo  # ✓ GOOD! Can pass a fake repo in tests
```

**Why?** Easy to test with a mock repository.

---

## Testing (Very Simple)

### Test the Service (No Database)
```python
# tests/unit/test_project_service.py
from unittest.mock import Mock
from app.services.project_service import ProjectService

def test_create_validates_name():
    # Create a fake repository (mock)
    mock_repo = Mock()

    # Create service with fake repo
    service = ProjectService(mock_repo)

    # Test: Should reject empty name
    try:
        service.create("", "org1")
        assert False, "Should have raised error"
    except ValueError:
        pass  # Expected!
```

### Test the Repository (Real Database)
```python
# tests/integration/test_project_repo.py
from app.database import SessionLocal
from app.repositories.project_repo import ProjectRepository
from app import models

def test_list_by_org_filters_correctly():
    # Create real test database
    db = SessionLocal()

    # Add test data
    org1 = models.Org(id="org1", name="Company A")
    org2 = models.Org(id="org2", name="Company B")
    db.add_all([org1, org2])

    p1 = models.Project(org_id="org1", name="Project 1")
    p2 = models.Project(org_id="org2", name="Project 2")
    db.add_all([p1, p2])
    db.commit()

    # Test
    repo = ProjectRepository(db)
    results = repo.list_by_org("org1")

    assert len(results) == 1
    assert results[0].name == "Project 1"
```

### Test the Router (Full HTTP)
```python
# tests/e2e/test_projects_endpoint.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_project_endpoint():
    # Assume we're logged in
    token = "fake_token_123"

    response = client.post(
        "/projects",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "New Project", "description": "Test"}
    )

    assert response.status_code == 201
    assert response.json()["name"] == "New Project"
```

---

## File Organization Cheat Sheet

```
app/
├── routers/
│   ├── projects.py       ← HTTP endpoints (GET, POST, DELETE)
│   ├── analyses.py       ← HTTP endpoints
│   └── auth.py           ← HTTP endpoints
│
├── services/
│   ├── project_service.py    ← Business logic (what can do, what can't)
│   ├── analysis_service.py   ← Business logic
│   └── user_service.py       ← Business logic
│
├── repositories/
│   ├── project_repo.py       ← Database queries (SELECT, INSERT, etc.)
│   ├── analysis_repo.py      ← Database queries
│   └── base.py               ← Template for all repositories (CRUD)
│
└── models/
    ├── project.py            ← Database table definition
    ├── analysis.py           ← Database table definition
    └── user.py               ← Database table definition
```

**Remember:**
- Routes = HTTP (what goes in/out)
- Services = Rules (what's allowed)
- Repositories = Queries (what data)
- Models = Structure (how data looks)

---

## Common Questions

### Q: Can I call Repository from Router?
**A: NO.** Always go through Service:
```python
# ✗ WRONG
router → repository

# ✓ CORRECT
router → service → repository
```

### Q: Can I call Service from another Service?
**A: YES.** That's fine:
```python
# ✓ OK
class AnalysisService:
    def __init__(self, analysis_repo, usage_service):
        self.usage_service = usage_service  # Another service!

    def run_analysis(self):
        # Can call another service
        self.usage_service.check_limits()
```

### Q: Where does validation go?
**A: Service.** All business rules in one place:
```python
# ✓ CORRECT
class ProjectService:
    def create(self, name: str, org_id: str):
        # Validation
        if not name:
            raise ValueError("Name required")
        if not org_id:
            raise ValueError("Org required")

        # Then call repo
        return self.repo.create(name=name, org_id=org_id)
```

### Q: Where does error handling go?
**A: Everywhere:**
- **Repository**: Catches database errors
- **Service**: Catches business logic errors
- **Router**: Catches and formats HTTP errors

```python
# Repository catches database error
def create(self, **kwargs):
    try:
        obj = models.Project(**kwargs)
        self.db.add(obj)
        self.db.commit()
        return obj
    except Exception as e:
        raise DatabaseError(str(e))

# Service catches business error
def create(self, name: str, org_id: str):
    if not name:
        raise ValueError("Name required")  # Business error
    return self.repo.create(name=name, org_id=org_id)

# Router catches and formats HTTP error
@router.post("")
def create_project(body: schemas.ProjectIn, service: ProjectService = Depends()):
    try:
        return service.create(body.name, user.org_id)
    except ValueError as e:
        raise HTTPException(400, str(e))  # HTTP error
    except DatabaseError as e:
        raise HTTPException(500, str(e))  # HTTP error
```

### Q: What about the database session?
**A: Don't worry.** Just pass it to Repository:
```python
# In router
def get_project_service(db: Session = Depends(get_db)):
    repo = ProjectRepository(db)  # ← Pass session here
    return ProjectService(repo)

# In repository
class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db  # Store it

    def create(self, **kwargs):
        obj = models.Project(**kwargs)
        self.db.add(obj)
        self.db.commit()
        return obj
```

---

## Performance Tips

### N+1 Queries Problem
**Bad:** Loading 100 projects, then loading transcripts for each (101 queries!)
```python
# ✗ BAD
projects = repo.list_all()  # 1 query
for p in projects:
    p.transcripts  # 100 more queries! N+1 problem!
```

**Good:** Load everything at once
```python
# ✓ GOOD
from sqlalchemy.orm import joinedload

projects = self.db.query(models.Project).options(
    joinedload(models.Project.transcripts)  # JOIN in same query
).all()
```

**Put this in Repository:**
```python
class ProjectRepository:
    def list_by_org_with_transcripts(self, org_id: str):
        from sqlalchemy.orm import joinedload
        return self.db.query(self.model).filter(
            self.model.org_id == org_id
        ).options(
            joinedload(self.model.transcripts)  # ✓ Eager load
        ).all()
```

### Pagination Problem
**Bad:** Loading 1 million records
```python
# ✗ BAD
all_projects = repo.list_all()  # Loads everything!
```

**Good:** Load only what you need
```python
# ✓ GOOD
projects = repo.list_by_org(org_id, limit=50, offset=0)
```

**Put this in Repository:**
```python
class ProjectRepository:
    def list_by_org(self, org_id: str, limit: int = 50, offset: int = 0):
        return self.db.query(self.model).filter(
            self.model.org_id == org_id
        ).limit(limit).offset(offset).all()  # ✓ Only load 50
```

---

## Summary

**Just Remember:**

1. **Router** = Receives request, returns response (HTTP)
2. **Service** = Checks if request is allowed, applies business rules
3. **Repository** = Gets/saves data from database
4. **Models** = Database table definitions

**If you don't know where code goes:** Ask "Is it HTTP? Is it a business rule? Is it a database query?"

- HTTP stuff → Router
- Business rules → Service
- Database queries → Repository
- Data structure → Model

You're good to go!
