# Qual Engine: Architecture Refactoring Roadmap

## Timeline: 4 Weeks (Incremental, Zero Downtime)

This is designed to be done **gradually alongside existing code** with zero disruption to your running system.

---

## Phase 1: Foundation Setup (Days 1-5)

### Goal
Set up the clean architecture layer structure. Existing code keeps working.

### What You'll Do

#### 1.1 Create Directory Structure
```bash
mkdir -p app/repositories
mkdir -p app/services_v2  # Keep old services/ as-is during transition
mkdir -p app/models/__old__
```

#### 1.2 Create Core Repository Files
**File: `/app/repositories/__init__.py`**
```python
# Empty file
```

**File: `/app/repositories/base.py`**
Create the BaseRepository template that all repositories inherit from. This is the CRUD template.

**File: `/app/repositories/user_repo.py`**
Repository for User and Org queries.

**File: `/app/repositories/project_repo.py`**
Repository for Project queries.

**File: `/app/repositories/transcript_repo.py`**
Repository for Transcript and MediaAsset queries.

**File: `/app/repositories/analysis_repo.py`**
Repository for Analysis, Theme, Verbatim, Implication queries.

#### 1.3 Create Core Service Files
**File: `/app/services_v2/__init__.py`**
```python
# Empty file
```

**File: `/app/services_v2/user_service.py`**
Simple service that wraps UserRepository.

**File: `/app/services_v2/project_service.py`**
Simple service that wraps ProjectRepository.

#### 1.4 Update Dependencies
**File: `/app/deps.py` (ADD to existing)**
```python
# Add dependency getters for new repositories and services
def get_project_service(db: Session = Depends(get_db)) -> ProjectService:
    repo = ProjectRepository(db)
    return ProjectService(repo)
```

### Testing Phase 1
```bash
# Just verify imports work
python -c "from app.repositories.project_repo import ProjectRepository; print('OK')"
python -c "from app.services_v2.project_service import ProjectService; print('OK')"
```

### Commit Message
```
refactor: add clean architecture foundation (repositories + services_v2)

- Create repositories/ directory with BaseRepository pattern
- Create services_v2/ directory with initial services
- No changes to existing code - purely additive
```

**Status: SAFE ✓** - Old code still works, new code is isolated

---

## Phase 2: Migrate First Router (Days 6-10)

### Goal
Migrate ONE router to use the new architecture. Prove the pattern works.

### What You'll Do

#### 2.1 Implement ProjectRepository
**File: `/app/repositories/project_repo.py`**
```python
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app import models
from .base import BaseRepository

class ProjectRepository(BaseRepository[models.Project]):
    def __init__(self, db: Session):
        super().__init__(db, models.Project)

    def list_by_org(self, org_id: str, limit=50, offset=0):
        """Get projects for an org, eager-loaded with transcripts."""
        return self.db.query(self.model).filter(
            self.model.org_id == org_id
        ).options(
            joinedload(self.model.transcripts)  # Prevents N+1 queries!
        ).order_by(
            self.model.created_at.desc()
        ).limit(limit).offset(offset).all()

    def get_by_id_with_org_check(self, project_id: str, org_id: str):
        """Get a project, ensuring it belongs to the org."""
        return self.db.query(self.model).filter(
            self.model.id == project_id,
            self.model.org_id == org_id
        ).first()

    def list_all_for_org(self, org_id: str):
        """Get all projects (for admin/migration)."""
        return self.db.query(self.model).filter(
            self.model.org_id == org_id
        ).order_by(self.model.created_at.desc()).all()
```

#### 2.2 Implement ProjectService
**File: `/app/services_v2/project_service.py`**
```python
from typing import List, Optional
from app import models
from app.repositories.project_repo import ProjectRepository

class ProjectService:
    def __init__(self, repo: ProjectRepository):
        self.repo = repo

    def create_project(self, org_id: str, name: str, description: str, created_by: str) -> models.Project:
        """Create a new project."""
        if not name or not name.strip():
            raise ValueError("Project name is required")
        return self.repo.create(
            org_id=org_id,
            name=name.strip(),
            description=description,
            created_by=created_by
        )

    def get_project(self, project_id: str, org_id: str) -> Optional[models.Project]:
        """Get a project by ID (with org permission check)."""
        return self.repo.get_by_id_with_org_check(project_id, org_id)

    def list_projects(self, org_id: str, limit: int = 50, offset: int = 0) -> List[models.Project]:
        """List projects for an org."""
        return self.repo.list_by_org(org_id, limit, offset)

    def delete_project(self, project_id: str, org_id: str) -> bool:
        """Delete a project (must belong to org)."""
        project = self.get_project(project_id, org_id)
        if not project:
            return False
        self.repo.delete(project)
        return True
```

#### 2.3 Create New Router
**File: `/app/routers/projects_v2.py`** (alongside existing projects.py)
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.deps import get_current_user, require_role
from app.repositories.project_repo import ProjectRepository
from app.services_v2.project_service import ProjectService

router = APIRouter(prefix="/projects/v2", tags=["projects_v2"])

def get_project_service(db: Session = Depends(get_db)):
    return ProjectService(ProjectRepository(db))

@router.post("", response_model=schemas.ProjectOut)
def create_project(
    body: schemas.ProjectIn,
    user: models.User = Depends(require_role("admin", "researcher")),
    service: ProjectService = Depends(get_project_service)
):
    try:
        return service.create_project(
            org_id=user.org_id,
            name=body.name,
            description=body.description,
            created_by=user.id
        )
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.get("", response_model=List[schemas.ProjectOut])
def list_projects(
    user: models.User = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service),
    limit: int = 50,
    offset: int = 0
):
    return service.list_projects(user.org_id, limit, offset)

@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: str,
    user: models.User = Depends(get_current_user),
    service: ProjectService = Depends(get_project_service)
):
    project = service.get_project(project_id, user.org_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    user: models.User = Depends(require_role("admin")),
    service: ProjectService = Depends(get_project_service)
):
    if not service.delete_project(project_id, user.org_id):
        raise HTTPException(404, "Project not found")
    return {"deleted": project_id}
```

#### 2.4 Register New Router
**File: `/app/main.py` (UPDATE)**
```python
from .routers import projects_v2  # Add this line

# Then in the router registration:
routers = [auth, projects, projects_v2, transcripts, ...]  # Include both old and new
```

### Testing Phase 2
```bash
# Test the new endpoints
curl -X POST http://localhost:8000/projects/v2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"Test"}'

# Should work and show project structure
```

### Write Unit Test (Optional but Recommended)
**File: `/app/tests/unit/test_project_service.py`**
```python
import pytest
from unittest.mock import Mock
from app.services_v2.project_service import ProjectService
from app import models

def test_create_project_validates_name():
    """Service should reject empty names."""
    mock_repo = Mock()
    service = ProjectService(mock_repo)

    with pytest.raises(ValueError, match="name is required"):
        service.create_project(
            org_id="org1",
            name="",  # Empty!
            description="Test",
            created_by="user1"
        )

    # Should not have called repo
    mock_repo.create.assert_not_called()

def test_create_project_success():
    """Service should create project with valid data."""
    mock_repo = Mock()
    expected_project = models.Project(
        id="p1",
        org_id="org1",
        name="Test Project",
        description="Test"
    )
    mock_repo.create.return_value = expected_project

    service = ProjectService(mock_repo)
    result = service.create_project(
        org_id="org1",
        name="Test Project",
        description="Test",
        created_by="user1"
    )

    assert result.id == "p1"
    mock_repo.create.assert_called_once()
```

### Commit Message
```
refactor: migrate projects to clean architecture (repositories + services)

- Implement ProjectRepository with eager loading
- Implement ProjectService with business logic
- Add projects_v2 router using new architecture
- Old projects router still functional (gradual migration)
- Add unit tests for ProjectService
```

**Status: SAFE ✓** - Both old and new endpoints work. Old code untouched.

---

## Phase 3: Migrate Remaining Routers (Days 11-25)

### Goal
Move all routers to the new architecture one by one.

### Order (Prioritize by complexity)

1. **auth.py** → auth_service + user_repo (simplest)
2. **transcripts.py** → transcript_service + transcript_repo + media_repo
3. **analyses.py** → analysis_service + analysis_repo (most complex)
4. **usage.py** → usage_service + usage_repo
5. **admin.py** → admin_service + org_repo
6. **chat.py** → chat_service
7. **clips.py** → clips_service

### For Each Router

**Day N (Morning):**
1. Create repository (if not exists)
2. Create service
3. Create tests for service

**Day N (Afternoon):**
1. Create new router file (router_v2.py)
2. Register in main.py
3. Test both old and new endpoints

**Day N+1 (Morning):**
1. Check logs - are new endpoints being used?
2. If needed, remove old router from main.py

**Example: Migrate auth.py (Days 11-12)**

**File: `/app/repositories/user_repo.py`**
```python
from sqlalchemy.orm import Session
from app import models
from .base import BaseRepository

class UserRepository(BaseRepository[models.User]):
    def __init__(self, db: Session):
        super().__init__(db, models.User)

    def get_by_email(self, email: str) -> models.User:
        return self.db.query(self.model).filter(
            self.model.email == email
        ).first()

    def get_by_id(self, user_id: str) -> models.User:
        return self.db.query(self.model).filter(
            self.model.id == user_id
        ).first()

    def create_user(self, email: str, password_hash: str, org_id: str, role: str = "researcher"):
        return self.create(
            email=email,
            hashed_password=password_hash,
            org_id=org_id,
            role=role
        )

class OrgRepository(BaseRepository[models.Org]):
    def __init__(self, db: Session):
        super().__init__(db, models.Org)

    def create_org(self, name: str, plan: str = "free"):
        return self.create(name=name, plan=plan)
```

**File: `/app/services_v2/user_service.py`**
```python
from app import models, security
from app.repositories.user_repo import UserRepository, OrgRepository

class UserService:
    def __init__(self, user_repo: UserRepository, org_repo: OrgRepository):
        self.user_repo = user_repo
        self.org_repo = org_repo

    def register(self, email: str, password: str, org_name: str):
        """Register a new user and create an organization."""
        # Check if email exists
        existing_user = self.user_repo.get_by_email(email)
        if existing_user:
            raise ValueError("Email already registered")

        # Create org
        org = self.org_repo.create_org(name=org_name, plan="free")

        # Create user
        hashed_pw = security.hash_pw(password)
        user = self.user_repo.create_user(
            email=email,
            password_hash=hashed_pw,
            org_id=org.id,
            role="admin"
        )

        return user

    def login(self, email: str, password: str):
        """Verify credentials and return user."""
        user = self.user_repo.get_by_email(email)
        if not user or not security.verify_pw(password, user.hashed_password):
            raise ValueError("Invalid credentials")
        return user

    def get_user(self, user_id: str):
        """Get user by ID."""
        return self.user_repo.get_by_id(user_id)
```

**File: `/app/routers/auth_v2.py`**
```python
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import models, schemas, security
from app.database import get_db
from app.repositories.user_repo import UserRepository, OrgRepository
from app.services_v2.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth_v2"])

def get_user_service(db: Session = Depends(get_db)):
    return UserService(UserRepository(db), OrgRepository(db))

@router.post("/register", response_model=schemas.Token)
def register(
    body: schemas.RegisterIn,
    service: UserService = Depends(get_user_service)
):
    try:
        user = service.register(body.email, body.password, body.org_name)
        token = security.create_token(user.id)
        return {"access_token": token}
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.post("/login", response_model=schemas.Token)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    service: UserService = Depends(get_user_service)
):
    try:
        user = service.login(form.username, form.password)
        token = security.create_token(user.id)
        return {"access_token": token}
    except ValueError:
        raise HTTPException(401, "Invalid credentials")

@router.get("/me", response_model=schemas.UserOut)
def me(
    user: models.User = Depends(get_current_user),
    service: UserService = Depends(get_user_service)
):
    return service.get_user(user.id)
```

### Commit Pattern for Each Router
```
refactor: migrate {feature} to clean architecture

- Create {Feature}Repository
- Create {Feature}Service
- Add {feature}_v2 router
- Add unit tests
```

**Status: SAFE ✓** - Incremental migration, old code still available

---

## Phase 4: Refactor Analysis (Complex) (Days 26-35)

### Goal
The most complex migration. Contains 3-stage workflow.

### Current Problem
Logic is split across `routers/analyses.py` and `tasks.py`. Hard to test.

### New Approach
Single `AnalysisService` with clear stages.

**File: `/app/repositories/analysis_repo.py`**
```python
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app import models
from .base import BaseRepository

class AnalysisRepository(BaseRepository[models.Analysis]):
    def __init__(self, db: Session):
        super().__init__(db, models.Analysis)

    def get_by_id_with_details(self, analysis_id: str):
        """Get analysis with all related data (themes, verbatims, etc)."""
        return self.db.query(self.model).filter(
            self.model.id == analysis_id
        ).options(
            joinedload(self.model.themes).joinedload(models.Theme.verbatims),
            joinedload(self.model.implications)
        ).first()

    def create_theme(self, analysis_id: str, **kwargs):
        theme = models.Theme(analysis_id=analysis_id, **kwargs)
        self.db.add(theme)
        self.db.flush()
        return theme

    def create_verbatim(self, theme_id: str, **kwargs):
        verbatim = models.Verbatim(theme_id=theme_id, **kwargs)
        self.db.add(verbatim)
        self.db.flush()
        return verbatim

    def create_implication(self, analysis_id: str, **kwargs):
        implication = models.Implication(analysis_id=analysis_id, **kwargs)
        self.db.add(implication)
        self.db.flush()
        return implication

class TranscriptRepository(BaseRepository[models.Transcript]):
    def __init__(self, db: Session):
        super().__init__(db, models.Transcript)

    def get_by_id_with_org_check(self, transcript_id: str, org_id: str):
        return self.db.query(self.model).filter(
            self.model.id == transcript_id,
            self.model.org_id == org_id
        ).first()
```

**File: `/app/services_v2/analysis_service.py`**
```python
from datetime import datetime
from app import models, llm
from app.repositories.analysis_repo import AnalysisRepository, TranscriptRepository
from app.services_v2.usage_service import UsageService

class AnalysisService:
    def __init__(self,
                 analysis_repo: AnalysisRepository,
                 transcript_repo: TranscriptRepository,
                 usage_service: UsageService):
        self.analysis_repo = analysis_repo
        self.transcript_repo = transcript_repo
        self.usage_service = usage_service

    def start_analysis(self, transcript_id: str, org_id: str) -> models.Analysis:
        """Start a new analysis."""
        # Get and validate transcript
        transcript = self.transcript_repo.get_by_id_with_org_check(transcript_id, org_id)
        if not transcript:
            raise ValueError(f"Transcript not found")

        if transcript.transcription_status in ("pending", "running"):
            raise ValueError("Transcript is still being transcribed")

        if not (transcript.content or "").strip():
            raise ValueError("Transcript has no text to analyze")

        # Check usage limits
        self.usage_service.check_limits(org_id)

        # Create analysis
        analysis = self.analysis_repo.create(
            org_id=org_id,
            transcript_id=transcript_id,
            status="pending"
        )

        return analysis

    def run_analysis(self, analysis_id: str):
        """Execute the 3-stage analysis workflow."""
        analysis = self.analysis_repo.get(analysis_id)
        if not analysis:
            raise ValueError(f"Analysis {analysis_id} not found")

        transcript = self.transcript_repo.get(analysis.transcript_id)

        try:
            analysis.status = "running"
            self.analysis_repo.update(analysis)

            # Stage 1: Extract themes
            themes_result, tokens1 = self._stage_1_extract_themes(transcript.content)

            # Stage 2: Extract verbatims
            verbatims_result, tokens2 = self._stage_2_extract_verbatims(
                transcript.content,
                themes_result
            )

            # Stage 3: Write topline
            topline_result, tokens3 = self._stage_3_write_topline(
                transcript.content,
                themes_result
            )

            # Save all results
            self._save_results(analysis, themes_result, verbatims_result, topline_result)

            # Record token usage
            total_input = tokens1[0] + tokens2[0] + tokens3[0]
            total_output = tokens1[1] + tokens2[1] + tokens3[1]
            self.usage_service.record_usage(analysis.org_id, analysis.id, total_input, total_output)

            # Mark complete
            analysis.status = "done"
            analysis.completed_at = datetime.utcnow()
            analysis.input_tokens = total_input
            analysis.output_tokens = total_output
            self.analysis_repo.update(analysis)

        except Exception as e:
            analysis.status = "error"
            analysis.error = str(e)[:1000]
            self.analysis_repo.update(analysis)
            raise

    def _stage_1_extract_themes(self, content: str):
        """Extract themes using LLM."""
        return llm.code_themes(content)

    def _stage_2_extract_verbatims(self, content: str, themes: list):
        """Extract supporting verbatims."""
        return llm.extract_verbatims(content, themes)

    def _stage_3_write_topline(self, content: str, themes: list):
        """Write topline and implications."""
        return llm.write_topline(content, themes)

    def _save_results(self, analysis, themes_data, verbatims_data, topline_data):
        """Save all analysis results to database."""
        # Create themes
        theme_map = {}
        for i, theme_data in enumerate(themes_data.get("themes", [])):
            theme = self.analysis_repo.create_theme(
                analysis_id=analysis.id,
                name=theme_data.get("name"),
                description=theme_data.get("description"),
                prevalence=theme_data.get("prevalence"),
                sentiment=theme_data.get("sentiment"),
                order_idx=i
            )
            theme_map[theme_data.get("id", i)] = theme.id

        # Create verbatims
        for verbatim_data in verbatims_data.get("verbatims", []):
            theme_id = theme_map.get(verbatim_data.get("themeId"))
            if theme_id:
                self.analysis_repo.create_verbatim(
                    theme_id=theme_id,
                    quote=verbatim_data.get("quote"),
                    speaker=verbatim_data.get("speaker")
                )

        # Create implications
        for i, implication_text in enumerate(topline_data.get("implications", [])):
            self.analysis_repo.create_implication(
                analysis_id=analysis.id,
                text=implication_text,
                order_idx=i
            )

        # Set topline
        analysis.topline = topline_data.get("topline", "")
        analysis.respondent_count = themes_data.get("respondentCount")

        self.analysis_repo.update(analysis)
```

**File: `/app/routers/analyses_v2.py`**
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas
from app.database import get_db
from app.deps import get_current_user, require_role, owned_or_404
from app.repositories.analysis_repo import AnalysisRepository, TranscriptRepository
from app.services_v2.analysis_service import AnalysisService
from app.services_v2.usage_service import UsageService
from app.tasks.analysis import run_analysis_task

router = APIRouter(tags=["analyses_v2"])

def get_analysis_service(db: Session = Depends(get_db)):
    analysis_repo = AnalysisRepository(db)
    transcript_repo = TranscriptRepository(db)
    usage_service = UsageService(None)  # TODO: pass repo
    return AnalysisService(analysis_repo, transcript_repo, usage_service)

@router.post("/transcripts/{transcript_id}/analyses", response_model=schemas.AnalysisOut)
def start_analysis(
    transcript_id: str,
    user: models.User = Depends(require_role("admin", "researcher")),
    service: AnalysisService = Depends(get_analysis_service)
):
    try:
        analysis = service.start_analysis(transcript_id, user.org_id)
        # Queue background job
        run_analysis_task.delay(analysis.id)
        return analysis
    except ValueError as e:
        raise HTTPException(422, str(e))

@router.get("/analyses/{analysis_id}", response_model=schemas.AnalysisOut)
def get_analysis(
    analysis_id: str,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = owned_or_404(db, models.Analysis, analysis_id, user.org_id)
    return analysis

@router.get("/transcripts/{transcript_id}/analyses", response_model=List[schemas.AnalysisSummary])
def list_analyses(
    transcript_id: str,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    owned_or_404(db, models.Transcript, transcript_id, user.org_id)
    return db.query(models.Analysis).filter(
        models.Analysis.transcript_id == transcript_id
    ).order_by(models.Analysis.created_at.desc()).all()
```

**File: `/app/tasks/analysis.py` (REFACTORED)**
```python
from app.celery_app import celery_app
from app.database import SessionLocal
from app.repositories.analysis_repo import AnalysisRepository, TranscriptRepository
from app.services_v2.analysis_service import AnalysisService
from app.services_v2.usage_service import UsageService

@celery_app.task(name="run_analysis_task")
def run_analysis_task(analysis_id: str):
    """Background task: run analysis using service."""
    db = SessionLocal()
    try:
        # Create service with dependencies
        analysis_repo = AnalysisRepository(db)
        transcript_repo = TranscriptRepository(db)
        usage_service = UsageService(None)  # TODO: pass repo

        service = AnalysisService(analysis_repo, transcript_repo, usage_service)
        service.run_analysis(analysis_id)
    except Exception as e:
        print(f"Analysis task failed: {e}")
        raise
    finally:
        db.close()
```

### Commit Message
```
refactor: migrate analysis workflow to clean architecture

- Create AnalysisRepository with theme/verbatim operations
- Create AnalysisService with 3-stage workflow
- Refactor tasks/analysis.py to use service
- Add analyses_v2 router with clean error handling
- Separate concerns: routes -> services -> repositories -> models
```

**Status: CHECKPOINT** - Half the work is done!

---

## Phase 5: Clean Up & Test (Days 36-40)

### Goal
Remove old code, consolidate models, ensure everything works.

### 5.1 Remove Old Routers
```python
# In main.py, remove old router imports and registrations
# Keep only _v2 routers (which we'll rename to remove _v2)

# Before:
from .routers import auth, auth_v2
routers = [auth, auth_v2, ...]

# After:
from .routers import auth
routers = [auth, ...]
```

Then delete old files:
```bash
rm app/routers/projects.py
rm app/routers/auth.py
rm app/routers/analyses.py
# ... etc
```

### 5.2 Rename _v2 Files
```bash
mv app/routers/auth_v2.py app/routers/auth.py
mv app/routers/projects_v2.py app/routers/projects.py
mv app/routers/analyses_v2.py app/routers/analyses.py
# ... etc
```

Update imports in main.py.

### 5.3 Consolidate Models
**Option A: Minimal Change**
Keep existing models.py but just verify they're complete.

**Option B: Better Organization**
Move models to models/ directory:
```bash
mkdir -p app/models
mv app/models.py app/models/core.py
mv app/models_phase*.py app/models/__old__/  # Archive old phases
```

Then create `app/models/__init__.py`:
```python
from .core import (
    Org, User, Project, Transcript, MediaAsset,
    TranscriptSegment, Analysis, Theme, Verbatim,
    Implication, UsageRecord
)

__all__ = [
    "Org", "User", "Project", "Transcript", "MediaAsset",
    "TranscriptSegment", "Analysis", "Theme", "Verbatim",
    "Implication", "UsageRecord"
]
```

### 5.4 Run Full Test Suite
```bash
# Unit tests (fast)
pytest tests/unit -v

# Integration tests (medium)
pytest tests/integration -v

# E2E tests (slow)
pytest tests/e2e -v

# All tests with coverage
pytest --cov=app tests/
```

### 5.5 Final Cleanup
Delete:
- `app/services/` (old, unused)
- `app/models_phase*.py` (all old phase files)
- `app/routers/*_v2.py` (all _v2 files)

Rename:
- `app/services_v2/` → `app/services/`

### Commit Message
```
refactor: finalize clean architecture migration

- Remove old router and service files
- Consolidate models to single directory
- Rename _v2 files to production names
- All tests passing (unit, integration, e2e)
- Database schema unchanged (alembic migrations)
```

**Status: COMPLETE ✓**

---

## Phase 6: Performance Optimization (Optional, Days 41+)

Now that you have repositories, you can easily optimize:

### 6.1 Add Database Indexes
Repositories make this safe and trackable:
```python
# models/project.py
class Project(Base):
    __tablename__ = "projects"
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)  # ADD INDEX
```

Alembic migration:
```bash
alembic revision --autogenerate -m "add performance indexes"
alembic upgrade head
```

### 6.2 Add Caching Layer
Create `repositories/cache.py`:
```python
from redis import Redis

class CachedRepository:
    def __init__(self, repo, cache: Redis):
        self.repo = repo
        self.cache = cache

    def get_by_id(self, id: str):
        cached = self.cache.get(f"project:{id}")
        if cached:
            return json.loads(cached)
        obj = self.repo.get_by_id(id)
        self.cache.set(f"project:{id}", json.dumps(obj), ex=3600)
        return obj
```

### 6.3 Add Query Logging
Create `utils/query_log.py`:
```python
from sqlalchemy import event

def log_queries(dbapi_conn, connection_record):
    connection_record.info['query_start_time'] = time.time()

def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total_time = time.time() - conn.info.get('query_start_time', 0)
    logger.debug(f"Query took {total_time:.3f}s: {statement}")
    if total_time > 1.0:  # Warn on slow queries
        logger.warning(f"SLOW QUERY ({total_time:.3f}s): {statement}")
```

---

## Summary: What Changes Day by Day

### Week 1 (Preparation)
- **Day 1-2:** Create base repository, project repository
- **Day 3-4:** Create project service, test it
- **Day 5:** Add projects_v2 router, verify it works

### Week 2 (Core Migration)
- **Day 6-7:** Migrate auth
- **Day 8-9:** Migrate transcripts
- **Day 10-12:** Migrate usage
- **Day 13:** Migrate admin

### Week 3 (Complex Features)
- **Day 14-19:** Migrate analyses (3-stage workflow)
- **Day 20:** Migrate chat
- **Day 21:** Migrate clips (if needed)

### Week 4 (Cleanup)
- **Day 22-25:** Remove old code, consolidate models
- **Day 26-27:** Full test run
- **Day 28:** Go live with new architecture

---

## Risk Mitigation

### Problem: What if new router has a bug?
**Solution:** Keep both old and new endpoints active. Frontend can switch gradually.

### Problem: What if I break the database?
**Solution:** Database access is ONLY through repositories. Test repository with real database before deploying service.

### Problem: What if performance gets worse?
**Solution:** Repositories make query optimization centralized. Add eager loading, caching in one place.

### Problem: What if team members don't understand?
**Solution:** Clear separation:
- Routes = HTTP (what data comes in/goes out)
- Services = Business logic (rules, validation)
- Repositories = Database queries (SQL)
- Models = Data structure

---

## Files to Create (Checklist)

```
Week 1:
[ ] app/repositories/__init__.py
[ ] app/repositories/base.py
[ ] app/repositories/project_repo.py
[ ] app/services_v2/__init__.py
[ ] app/services_v2/project_service.py
[ ] app/routers/projects_v2.py
[ ] app/tests/unit/test_project_service.py

Week 2:
[ ] app/repositories/user_repo.py
[ ] app/repositories/transcript_repo.py
[ ] app/repositories/analysis_repo.py
[ ] app/services_v2/user_service.py
[ ] app/services_v2/transcript_service.py
[ ] app/services_v2/analysis_service.py
[ ] app/services_v2/usage_service.py
[ ] app/routers/auth_v2.py
[ ] app/routers/transcripts_v2.py
[ ] app/routers/analyses_v2.py
[ ] app/routers/usage_v2.py
[ ] app/tasks/analysis.py (refactored)

Week 3:
[ ] Clean up old files
[ ] Consolidate models/
[ ] Final tests
```

---

## Success Criteria

At the end of 4 weeks, you should have:

- ✓ All business logic in services (testable)
- ✓ All database queries in repositories (optimizable)
- ✓ All routers as thin HTTP mappings
- ✓ Unit test coverage for services (>80%)
- ✓ Integration test coverage for repositories
- ✓ E2E tests for critical flows
- ✓ Zero downtime during migration
- ✓ Same database schema (fully backward compatible)
- ✓ Performance either equal or better

Your backend will be ready to scale to millions of records!
