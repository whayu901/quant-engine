# Qual Engine Backend - Architecture Analysis & Improvement Plan

## Executive Summary

Your Qual Engine backend is built on **FastAPI + SQLAlchemy** with a basic but functional structure. However, there are several architectural issues that will become problematic as you scale to handle millions of records:

1. **Business Logic Scattered Across Routers** - Hard to test and reuse
2. **Direct Database Access in Routes** - Tight coupling between HTTP layer and data layer
3. **Multiple Model Files** - Confusing structure with models_phase1/2/3/4/5
4. **Inconsistent Service Pattern** - Only one service file (media_processor)
5. **No Clear Separation of Concerns** - Validation, business logic, and data access mixed together

---

## Current Architecture Overview

### Directory Structure
```
app/
├── main.py                 # Entry point - registers routers
├── database.py             # SQLAlchemy setup
├── config.py               # Settings (environment variables)
├── deps.py                 # Dependency injection (auth, permissions)
├── security.py             # Token/password utilities
├── models.py               # Core SQLAlchemy ORM models
├── models_phase*.py        # PROBLEM: Multiple model files
├── schemas.py              # Pydantic validation schemas
├── schemas_phase*.py       # PROBLEM: Multiple schema files
├── routers/                # HTTP endpoints
│   ├── auth.py
│   ├── projects.py
│   ├── transcripts.py
│   ├── analyses.py
│   ├── admin.py
│   ├── chat.py
│   └── ...
├── services/               # Business logic (only 1 file!)
│   └── media_processor.py
├── tasks.py                # Celery background jobs
├── llm.py                  # LLM integration
├── storage.py              # File storage abstraction
└── transcription.py        # Transcription provider
```

---

## Current Issues Identified

### 1. Business Logic Scattered Across Multiple Layers

**Problem:** Auth, analysis, and project logic are embedded in routers
```python
# routers/analyses.py - Business logic in router!
a = models.Analysis(org_id=user.org_id, transcript_id=t.id, status="pending")
db.add(a); db.commit(); db.refresh(a)
run_analysis.delay(a.id)
```

**Impact:**
- Can't test business logic without HTTP context
- Hard to reuse logic in batch operations
- Celery tasks duplicate logic (see tasks.py line 46-104)

### 2. Tightly Coupled HTTP and Data Layers

**Problem:** Routers directly use SQLAlchemy and models
```python
# routers/projects.py
def list_projects(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (db.query(models.Project)
            .filter(models.Project.org_id == user.org_id)
            .order_by(models.Project.created_at.desc()).all())
```

**Impact:**
- Can't change database without rewriting routes
- Hard to optimize queries later
- SQL directly in route logic

### 3. Multiple Model Files (Messy)

**Current State:**
- `models.py` - Core models
- `models_phase1.py` - Phase 1 models
- `models_phase2.py` - Phase 2 models
- `models_phase3.py` - Phase 3 models
- `models_phase4.py` - Phase 4 models
- `models_phase5.py` - Phase 5 models

**Problem:** Why are there 5 separate files? This suggests:
- Incomplete refactoring
- Confusion about data model evolution
- Hard to understand the actual schema

### 4. Inconsistent Service Layer

**Current State:**
- Only `services/media_processor.py` exists
- Most business logic is in tasks.py or routers
- No unified repository pattern

**Impact:** New developers don't know where to put business logic

### 5. Heavy Reliance on Celery Tasks

**Current State:** `tasks.py` contains core business logic
- `transcribe_media()` - Creates transcript segments
- `run_analysis()` - Complex multi-stage analysis

**Problem:** Database session management is manual and error-prone
```python
db = SessionLocal()  # Manual session creation
try:
    # ... logic
finally:
    db.close()  # Manual cleanup
```

---

## Proposed Architecture: Clean Layer Pattern for FastAPI

This is the simplest pattern for FastAPI that scales well. Think of it as **4 layers**:

```
HTTP Layer (Routers)
    ↓ (depends on)
Service Layer (Business Logic)
    ↓ (depends on)
Repository Layer (Data Access)
    ↓ (depends on)
Database Layer (SQLAlchemy Models)
```

### Layer Responsibilities

| Layer | Responsibility | Examples |
|-------|----------------|----------|
| **Router** | Parse requests, call services, format responses | `POST /analyses`, validate input |
| **Service** | Business logic, calculations, workflow | "Start analysis", "List user's projects" |
| **Repository** | Database queries, CRUD operations | "Get analysis by ID", "List analyses" |
| **Model** | Data structure definition | SQLAlchemy ORM classes |

---

## Proposed Directory Structure

```
app/
├── main.py                    # Entry point
├── config.py                  # Settings
├── database.py                # SQLAlchemy setup (unchanged)
│
├── core/
│   ├── security.py            # JWT/password utils
│   ├── deps.py                # Dependency injection
│   ├── constants.py           # App-wide constants
│   └── exceptions.py          # Custom exceptions
│
├── models/                    # Database models (SINGLE directory)
│   ├── __init__.py           # Import all models here
│   ├── base.py               # Base model with common fields
│   ├── user.py               # User, Org models
│   ├── project.py            # Project, Transcript models
│   ├── analysis.py           # Analysis, Theme, Verbatim models
│   ├── media.py              # MediaAsset, TranscriptSegment models
│   └── usage.py              # UsageRecord model
│
├── schemas/                   # Pydantic validation schemas
│   ├── __init__.py
│   ├── auth.py               # Auth request/response schemas
│   ├── project.py            # Project schemas
│   ├── transcript.py         # Transcript schemas
│   ├── analysis.py           # Analysis schemas
│   └── common.py             # Shared schemas
│
├── repositories/             # Data access layer (NEW)
│   ├── __init__.py
│   ├── base.py               # BaseRepository (CRUD template)
│   ├── user_repo.py          # UserRepository
│   ├── project_repo.py       # ProjectRepository
│   ├── transcript_repo.py    # TranscriptRepository
│   └── analysis_repo.py      # AnalysisRepository
│
├── services/                 # Business logic layer (EXPANDED)
│   ├── __init__.py
│   ├── user_service.py       # User registration, login
│   ├── project_service.py    # Project CRUD, permissions
│   ├── transcript_service.py # Transcript upload, processing
│   ├── analysis_service.py   # Analysis workflow (3 stages)
│   ├── media_processor.py    # Media handling (existing)
│   └── usage_service.py      # Usage tracking and limits
│
├── routers/                  # HTTP endpoints (SIMPLIFIED)
│   ├── __init__.py
│   ├── auth.py               # Login, register, token refresh
│   ├── projects.py           # CRUD operations
│   ├── transcripts.py        # Upload, list, get
│   ├── analyses.py           # Start, get, list
│   ├── usage.py              # Usage stats
│   └── admin.py              # Admin operations
│
├── tasks/                    # Background jobs (REFACTORED)
│   ├── __init__.py
│   ├── celery_app.py         # Celery config
│   ├── transcription.py      # Transcribe task
│   └── analysis.py           # Analysis tasks
│
├── utils/                    # Utilities (NEW)
│   ├── storage.py            # File storage (move here)
│   ├── transcription.py      # Transcription provider (move here)
│   ├── llm.py                # LLM integration (move here)
│   └── rag.py                # RAG functionality (move here)
│
└── tests/                    # Tests (for coverage planning)
    ├── conftest.py           # Pytest fixtures
    ├── unit/
    │   ├── test_services.py
    │   └── test_repositories.py
    ├── integration/
    │   └── test_routers.py
    └── e2e/
        └── test_workflows.py
```

---

## Implementation Plan: Simple → Complex

### Phase 1: Foundation (Week 1)
**Goal:** Set up the basic structure without breaking existing code

1. Create repository layer
   - `repositories/base.py` - BaseRepository with common CRUD
   - `repositories/user_repo.py` - User queries
   - `repositories/project_repo.py` - Project queries

2. Create service layer stubs
   - `services/user_service.py` - Wrap user_repo
   - `services/project_service.py` - Wrap project_repo

3. Update routers to use services
   - `routers/auth.py` - Use user_service
   - `routers/projects.py` - Use project_service

**Key:** Don't delete old code yet, just add alongside

### Phase 2: Business Logic (Week 2)
**Goal:** Move analysis logic into services

1. Create analysis service with 3-stage workflow
   - `services/analysis_service.py`
   - Method: `start_analysis(transcript_id, user_id)`
   - Returns: analysis_id

2. Refactor tasks to use service
   - `tasks/analysis.py` calls `analysis_service.run()`
   - Much simpler task code

3. Update routers
   - `routers/analyses.py` uses service

### Phase 3: Consolidate Models (Week 3)
**Goal:** Merge phase models into single models/ directory

1. Understand what each phase file contains
2. Merge into logical groups (user, project, analysis, media, usage)
3. Test with database migrations

### Phase 4: Testing (Week 4+)
**Goal:** Add test coverage

1. Unit tests for services (mock database)
2. Integration tests for repositories (real database)
3. E2E tests for routers (full flow)

---

## Code Examples: Before & After

### Example 1: Creating a Project

**BEFORE (Current):**
```python
# routers/projects.py
@router.post("", response_model=schemas.ProjectOut)
def create_project(body: schemas.ProjectIn,
                   user: models.User = Depends(require_role("admin", "researcher")),
                   db: Session = Depends(get_db)):
    p = models.Project(org_id=user.org_id, name=body.name,
                       description=body.description, created_by=user.id)
    db.add(p); db.commit(); db.refresh(p)
    return p
```

**AFTER (Proposed):**
```python
# routers/projects.py
@router.post("", response_model=schemas.ProjectOut)
def create_project(
    body: schemas.ProjectIn,
    user: models.User = Depends(require_role("admin", "researcher")),
    service: ProjectService = Depends(get_project_service)
):
    project = service.create(
        org_id=user.org_id,
        name=body.name,
        description=body.description,
        created_by=user.id
    )
    return project

# services/project_service.py
class ProjectService:
    def __init__(self, repo: ProjectRepository):
        self.repo = repo

    def create(self, org_id: str, name: str, description: str, created_by: str):
        # Business logic here (validation, etc.)
        return self.repo.create(
            org_id=org_id,
            name=name,
            description=description,
            created_by=created_by
        )

    def get_by_id(self, project_id: str, org_id: str):
        # Multi-tenant check
        return self.repo.get_by_id(project_id, org_id)

# repositories/project_repo.py
class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs):
        project = models.Project(**kwargs)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def get_by_id(self, project_id: str, org_id: str):
        return self.db.query(models.Project).filter(
            models.Project.id == project_id,
            models.Project.org_id == org_id
        ).first()
```

**Benefits:**
- `ProjectService` can be unit tested with mock repo
- `ProjectRepository` can be tested with real DB
- Router only handles HTTP (parsing, error mapping)

### Example 2: Starting Analysis (Complex Workflow)

**BEFORE (Current):**
```python
# routers/analyses.py
@router.post("/transcripts/{transcript_id}/analyses", response_model=schemas.AnalysisOut)
def start_analysis(transcript_id: str,
                   user: models.User = Depends(require_role("admin", "researcher")),
                   db: Session = Depends(get_db)):
    t = owned_or_404(db, models.Transcript, transcript_id, user.org_id)

    if t.transcription_status in ("pending", "running"):
        raise HTTPException(409, "Transcript is still being transcribed.")
    if not (t.content or "").strip():
        raise HTTPException(422, "Transcript has no text to analyze.")

    used = usage_mod.month_count(db, user.org_id)
    limit = usage_mod.plan_limit(user.org.plan)
    if used >= limit:
        raise HTTPException(402, f"Monthly plan limit reached ({limit}). Upgrade to continue.")

    a = models.Analysis(org_id=user.org_id, transcript_id=t.id, status="pending")
    db.add(a); db.commit(); db.refresh(a)
    run_analysis.delay(a.id)
    db.refresh(a)
    return a

# tasks.py (ALSO contains this logic)
@celery_app.task(name="run_analysis")
def run_analysis(analysis_id: str):
    db = SessionLocal()
    try:
        a = db.get(models.Analysis, analysis_id)
        if not a:
            return
        a.status = "running"
        db.commit()

        transcript = db.get(models.Transcript, a.transcript_id)

        # Stage 1 — themes
        d1, u1 = llm.code_themes(transcript.content)
        # ... build themes

        # Stage 2 — verbatims
        d2, u2 = llm.extract_verbatims(transcript.content, theme_list)
        # ... build verbatims

        # Stage 3 — topline + implications
        d3, u3 = llm.write_topline(transcript.content, theme_list)
        # ... build topline

        a.status = "done"
        a.completed_at = datetime.utcnow()
        db.commit()
        usage_mod.record_usage(db, a.org_id, a.id, in_tok, out_tok)
    except Exception as e:
        a.status = "error"
        a.error = str(e)[:1000]
        db.commit()
    finally:
        db.close()
```

**Problem:** Logic is split between router and task. Hard to test. Hard to reuse.

**AFTER (Proposed):**
```python
# routers/analyses.py (SIMPLE - just HTTP mapping)
@router.post("/transcripts/{transcript_id}/analyses", response_model=schemas.AnalysisOut)
async def start_analysis(
    transcript_id: str,
    user: models.User = Depends(require_role("admin", "researcher")),
    service: AnalysisService = Depends(get_analysis_service)
):
    try:
        analysis = service.start_analysis(transcript_id, user.org_id)
        return analysis
    except ValueError as e:
        raise HTTPException(422, str(e))
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except LimitExceededError as e:
        raise HTTPException(402, str(e))

# services/analysis_service.py (BUSINESS LOGIC)
class AnalysisService:
    def __init__(self,
                 analysis_repo: AnalysisRepository,
                 transcript_repo: TranscriptRepository,
                 usage_service: UsageService):
        self.analysis_repo = analysis_repo
        self.transcript_repo = transcript_repo
        self.usage_service = usage_service

    def start_analysis(self, transcript_id: str, org_id: str) -> models.Analysis:
        """Start a new analysis for a transcript."""
        # Get transcript
        transcript = self.transcript_repo.get_by_id(transcript_id, org_id)
        if not transcript:
            raise ValueError(f"Transcript {transcript_id} not found")

        # Validate transcript is ready
        if transcript.transcription_status in ("pending", "running"):
            raise ValueError("Transcript is still being transcribed")
        if not (transcript.content or "").strip():
            raise ValueError("Transcript has no text to analyze")

        # Check usage limits
        self.usage_service.check_limits(org_id)

        # Create analysis record
        analysis = self.analysis_repo.create(
            org_id=org_id,
            transcript_id=transcript_id,
            status="pending"
        )

        # Queue background job
        from app.tasks.analysis import run_analysis_task
        run_analysis_task.delay(analysis.id)

        return analysis

    def run_analysis(self, analysis_id: str):
        """Run the actual analysis (called by Celery task)."""
        analysis = self.analysis_repo.get_by_id(analysis_id)
        transcript = self.transcript_repo.get_by_id(analysis.transcript_id)

        try:
            analysis.status = "running"
            self.analysis_repo.update(analysis)

            # Stage 1: Extract themes
            themes_data, tokens1 = self._stage_1_themes(transcript.content)

            # Stage 2: Extract verbatims
            verbatims_data, tokens2 = self._stage_2_verbatims(
                transcript.content,
                themes_data
            )

            # Stage 3: Write topline
            topline_data, tokens3 = self._stage_3_topline(
                transcript.content,
                themes_data
            )

            # Save results
            self._save_analysis_results(analysis, themes_data, verbatims_data, topline_data)

            # Record usage
            self.usage_service.record_usage(
                org_id=analysis.org_id,
                analysis_id=analysis.id,
                input_tokens=tokens1[0] + tokens2[0] + tokens3[0],
                output_tokens=tokens1[1] + tokens2[1] + tokens3[1]
            )

            analysis.status = "done"
            analysis.completed_at = datetime.utcnow()
            self.analysis_repo.update(analysis)

        except Exception as e:
            analysis.status = "error"
            analysis.error = str(e)[:1000]
            self.analysis_repo.update(analysis)
            raise

    def _stage_1_themes(self, content: str):
        """Extract themes using LLM."""
        return llm.code_themes(content)

    def _stage_2_verbatims(self, content: str, themes: list):
        """Extract supporting verbatims."""
        return llm.extract_verbatims(content, themes)

    def _stage_3_topline(self, content: str, themes: list):
        """Write topline summary."""
        return llm.write_topline(content, themes)

    def _save_analysis_results(self, analysis, themes_data, verbatims_data, topline_data):
        """Save all results to database."""
        # Save themes
        for i, theme in enumerate(themes_data.get("themes", [])):
            self.analysis_repo.create_theme(
                analysis_id=analysis.id,
                name=theme.get("name"),
                description=theme.get("description"),
                prevalence=theme.get("prevalence"),
                sentiment=theme.get("sentiment"),
                order_idx=i
            )

        # Save verbatims
        for verbatim in verbatims_data.get("verbatims", []):
            self.analysis_repo.create_verbatim(
                theme_id=verbatim.get("theme_id"),
                quote=verbatim.get("quote"),
                speaker=verbatim.get("speaker")
            )

        # Save topline and implications
        analysis.topline = topline_data.get("topline", "")
        for i, implication in enumerate(topline_data.get("implications", [])):
            self.analysis_repo.create_implication(
                analysis_id=analysis.id,
                text=implication,
                order_idx=i
            )

# tasks/analysis.py (MINIMAL - just delegate to service)
from celery import shared_task

@shared_task
def run_analysis_task(analysis_id: str):
    """Background task - run analysis using service."""
    # Create service with database session
    service = AnalysisService(
        analysis_repo=AnalysisRepository(SessionLocal()),
        transcript_repo=TranscriptRepository(SessionLocal()),
        usage_service=UsageService(...)
    )
    service.run_analysis(analysis_id)
```

**Benefits:**
- Business logic is in ONE place (service)
- Can test `start_analysis()` without Celery
- Can test `run_analysis()` without HTTP
- Router only handles HTTP (simple)
- Task is just a thin wrapper (simple)

---

## Key Principles

### 1. **Dependency Injection**
Each layer receives its dependencies rather than creating them:
```python
class ProjectService:
    def __init__(self, repo: ProjectRepository):
        self.repo = repo
```

### 2. **Single Responsibility**
Each class does ONE thing:
- **Router** = HTTP handling
- **Service** = Business logic
- **Repository** = Database queries

### 3. **Testability**
Each layer can be tested independently:
```python
# Test service with mock repo
mock_repo = Mock()
service = ProjectService(mock_repo)
service.create(...)  # No database!
```

### 4. **No Database Leakage**
Data access (SQLAlchemy) never leaks into service or router:
```python
# ✓ GOOD - Service returns dict/model
def create(self) -> ProjectOut:
    return project

# ✗ BAD - Service returns Session object
def create(self) -> Session:
    return db
```

---

## Database Schema (No Changes Needed)

Your current models are well-designed for multi-tenant SaaS. Keep them as-is:

- **Org** - Tenant
- **User** - Team member
- **Project** - Qualitative research project
- **Transcript** - Interview/FGD transcript
- **Analysis** - Results of analysis
- **Theme** - Key theme found
- **Verbatim** - Quote supporting theme
- **Implication** - Business implication

The new architecture just organizes how you query/mutate these.

---

## Performance for Millions of Records

Current issues that hurt performance:

1. **N+1 Queries** - Routers don't eager-load relationships
   ```python
   # Current - will run 1 + N queries!
   projects = db.query(models.Project).all()
   for p in projects:
       print(p.transcripts)  # Another query per project!
   ```

2. **Missing Indexes** - You have some but not all relationships indexed
   ```python
   # Add to models:
   org_id = Column(String(32), ForeignKey("orgs.id"), index=True)
   ```

3. **No Query Optimization** - Repositories should handle this
   ```python
   # Repository can use: joinedload(), contains_eager(), etc.
   def list_projects(self, org_id):
       return self.db.query(models.Project).filter(
           models.Project.org_id == org_id
       ).options(
           joinedload(models.Project.transcripts)  # Eager load!
       ).all()
   ```

4. **No Pagination** - Loading all records at once
   ```python
   # Service should support pagination
   def list_projects(self, org_id, limit=50, offset=0):
       return self.repo.list(org_id, limit, offset)
   ```

**Repository pattern will help you fix all of these in one place.**

---

## Testing Strategy

### Unit Tests (Service Layer)
Test business logic with mock database:
```python
# tests/unit/test_analysis_service.py
def test_start_analysis_validates_transcript_ready():
    mock_repo = Mock()
    mock_repo.get_transcript.return_value = Transcript(
        transcription_status="pending"  # Still transcribing!
    )

    service = AnalysisService(mock_repo, ...)
    with pytest.raises(ValueError):
        service.start_analysis("t1", "org1")
```

### Integration Tests (Repository Layer)
Test queries with real (test) database:
```python
# tests/integration/test_project_repo.py
def test_list_projects_filters_by_org(db_session):
    repo = ProjectRepository(db_session)

    # Create test data
    org1 = Org(id="org1", name="Company A")
    org2 = Org(id="org2", name="Company B")
    db_session.add_all([org1, org2])

    p1 = Project(org_id="org1", name="Project A")
    p2 = Project(org_id="org1", name="Project B")
    p3 = Project(org_id="org2", name="Project C")
    db_session.add_all([p1, p2, p3])
    db_session.commit()

    # Test
    results = repo.list(org_id="org1")
    assert len(results) == 2
    assert all(p.org_id == "org1" for p in results)
```

### E2E Tests (Router Layer)
Test full HTTP flow:
```python
# tests/e2e/test_project_creation.py
def test_create_project_flow(client, user_token):
    response = client.post(
        "/projects",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"name": "New Project", "description": "Test"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "New Project"
```

---

## Migration Path: Minimal Disruption

### Week 1-2: Add alongside existing code
- Create `repositories/` directory
- Create `services/` directory
- Create simple wrappers
- **Don't delete anything**

### Week 3: Gradually migrate routes
- One router at a time
- Update tests as you go
- Old and new code coexist

### Week 4: Clean up
- Delete old router code
- Delete models_phase*.py files
- Move everything to models/
- Run full test suite

---

## Summary: What Changes, What Stays

### Stays the Same
- Database setup (database.py)
- Models (just reorganized)
- Configuration (config.py)
- Celery task framework
- Security/auth approach

### Changes
- Routers become THIN (just HTTP mapping)
- New service layer (business logic)
- New repository layer (data access)
- Better organization (single model directory)
- Testable code (can mock/test independently)

---

## Quick Start: First Repository & Service

Want to get started? Here's the minimum viable architecture for ONE feature (Projects):

```python
# repositories/base.py
from sqlalchemy.orm import Session
from typing import TypeVar, Generic, List, Type

T = TypeVar('T')

class BaseRepository(Generic[T]):
    def __init__(self, db: Session, model: Type[T]):
        self.db = db
        self.model = model

    def create(self, **kwargs) -> T:
        obj = self.model(**kwargs)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def get_by_id(self, id: str) -> T:
        return self.db.query(self.model).filter(
            self.model.id == id
        ).first()

    def list(self, limit=50, offset=0) -> List[T]:
        return self.db.query(self.model).limit(limit).offset(offset).all()

    def update(self, obj: T) -> T:
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: T):
        self.db.delete(obj)
        self.db.commit()

# repositories/project_repo.py
from sqlalchemy.orm import Session
from app import models
from .base import BaseRepository

class ProjectRepository(BaseRepository[models.Project]):
    def __init__(self, db: Session):
        super().__init__(db, models.Project)

    def list_by_org(self, org_id: str, limit=50, offset=0):
        """Get all projects for an organization."""
        return self.db.query(self.model).filter(
            self.model.org_id == org_id
        ).order_by(self.model.created_at.desc()).limit(limit).offset(offset).all()

# services/project_service.py
from app import models
from app.repositories.project_repo import ProjectRepository

class ProjectService:
    def __init__(self, repo: ProjectRepository):
        self.repo = repo

    def create(self, org_id: str, name: str, description: str = "", created_by: str = None):
        return self.repo.create(
            org_id=org_id,
            name=name,
            description=description,
            created_by=created_by
        )

    def get_by_id(self, project_id: str, org_id: str):
        project = self.repo.get_by_id(project_id)
        if not project or project.org_id != org_id:
            return None
        return project

    def list_for_org(self, org_id: str, limit=50, offset=0):
        return self.repo.list_by_org(org_id, limit, offset)

    def delete(self, project_id: str, org_id: str):
        project = self.get_by_id(project_id, org_id)
        if not project:
            return False
        self.repo.delete(project)
        return True

# routers/projects.py (UPDATED)
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.deps import get_current_user, require_role
from app.repositories.project_repo import ProjectRepository
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])

def get_project_service(db: Session = Depends(get_db)):
    repo = ProjectRepository(db)
    return ProjectService(repo)

@router.post("", response_model=schemas.ProjectOut)
def create_project(
    body: schemas.ProjectIn,
    user: models.User = Depends(require_role("admin", "researcher")),
    service: ProjectService = Depends(get_project_service)
):
    return service.create(
        org_id=user.org_id,
        name=body.name,
        description=body.description,
        created_by=user.id
    )

@router.get("", response_model=List[schemas.ProjectOut])
def list_projects(
    user: models.User = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service)
):
    return service.list_for_org(user.org_id)

@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: str,
    user: models.User = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service)
):
    project = service.get_by_id(project_id, user.org_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    user: models.User = Depends(require_role("admin")),
    service: ProjectService = Depends(get_project_service)
):
    if not service.delete(project_id, user.org_id):
        raise HTTPException(404, "Project not found")
    return {"deleted": project_id}
```

---

## Conclusion

Your backend is functional and has good bones. The architecture improvements proposed here will:

1. **Maintainability:** Easy to understand where code goes
2. **Testability:** Each layer can be tested independently
3. **Scalability:** Repositories handle query optimization
4. **Reusability:** Services can be called from routers or tasks
5. **Performance:** N+1 queries and pagination handled at repository layer

Start with Phase 1 (repositories) and don't rush. By the end, you'll have a codebase that can handle millions of records without the "spaghetti code" that plagues similar projects.

**Next Step:** Clarify what the phase*.py model files contain, and we can merge them into a clean models/ structure.
