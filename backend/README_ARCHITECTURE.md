# Qual Engine Backend: Architecture Redesign Guide

**Complete guide for refactoring to clean, scalable architecture**

---

## Documents Overview

This architecture redesign includes 4 comprehensive documents:

### 1. **ARCHITECTURE_ANALYSIS.md** (Start Here!)
**What:** Comprehensive analysis of current architecture and problems

**Contains:**
- Current structure breakdown
- Identified issues (scattered logic, tight coupling, multiple model files)
- Proposed clean layer pattern
- Side-by-side before/after examples
- Performance optimization strategies
- Testing approach

**Read this if:** You want to understand WHY we're changing

**Key sections:**
- Current Architecture Overview
- Issues Identified (5 major problems)
- Proposed Architecture (4-layer pattern)
- Code Examples (before/after)
- Performance for Millions of Records

---

### 2. **IMPLEMENTATION_ROADMAP.md** (The Plan)
**What:** Day-by-day, 4-week implementation plan

**Contains:**
- 6 phases with daily tasks
- Phase 1: Foundation setup (repositories)
- Phase 2: Migrate first router (projects)
- Phase 3: Migrate remaining routers
- Phase 4: Complex workflow (analysis)
- Phase 5: Cleanup and consolidation
- Phase 6: Performance optimization (optional)
- Risk mitigation strategies

**Read this if:** You want to know WHEN and HOW to implement

**Key sections:**
- 4-week timeline breakdown
- Zero-downtime migration strategy
- Checklist of files to create
- Success criteria
- Risk mitigation

---

### 3. **ARCHITECTURE_QUICK_REFERENCE.md** (For Your Team)
**What:** Simple guide for developers (non-Python experience OK)

**Contains:**
- Big picture explanation (restaurant analogy)
- Where to put what code
- Common patterns (Create, Read, Update, Delete)
- Rules to follow
- Testing basics
- File organization
- Common questions and answers
- Performance tips

**Read this if:** You're a team member and need to understand the architecture

**Key sections:**
- Restaurant analogy explanation
- "Where to put what code" guide
- Common patterns (5 examples)
- Rules to follow (4 key rules)
- Common questions FAQ
- Quick reference chart

---

### 4. **STARTER_TEMPLATE.md** (Copy-Paste Code)
**What:** Ready-to-use code templates for each layer

**Contains:**
- Template 1: BaseRepository (foundation)
- Template 2: Simple Repository (with custom queries)
- Template 3: Simple Service (with business logic)
- Template 4: Simple Router (with endpoints)
- Template 5: Unit Tests (mock-based)
- Template 6: Integration Tests (database-based)
- Template 7: E2E Tests (full flow)
- Quick copy-paste commands

**Read this if:** You're ready to start coding

**Key sections:**
- 7 ready-to-use templates
- Each template fully commented
- Example: ProjectRepository, ProjectService, ProjectRouter
- Test examples for each layer
- Copy-paste commands

---

## Quick Start (3 Steps)

### Step 1: Read the Analysis (30 mins)
```
Read: ARCHITECTURE_ANALYSIS.md
Focus on: "Current Issues Identified" and "Proposed Architecture"
Goal: Understand why we're changing
```

### Step 2: Understand the Plan (20 mins)
```
Read: ARCHITECTURE_QUICK_REFERENCE.md
Focus on: "Where to Put What Code" and "Common Patterns"
Goal: Know where to put your code
```

### Step 3: Start Coding (Next phase)
```
Read: IMPLEMENTATION_ROADMAP.md Phase 1
Read: STARTER_TEMPLATE.md
Goal: Create first repository and service
```

---

## The Architecture in One Picture

```
HTTP Request
    ↓
ROUTER (HTTP Layer)
├─ Parse request
├─ Validate input schema
└─ Call service

    ↓
SERVICE (Business Logic Layer)
├─ Check business rules
├─ Apply validations
└─ Call repository

    ↓
REPOSITORY (Data Access Layer)
├─ Build SQL queries
├─ Handle pagination
└─ Call database

    ↓
DATABASE (SQLAlchemy Models)
└─ Data structure definitions

    ↓
HTTP Response (formatted JSON)
```

---

## Key Concepts

### The 4 Layers

| Layer | Responsibility | Example |
|-------|----------------|---------|
| **Router** | HTTP protocol | Parse POST body, validate Content-Type, format JSON response |
| **Service** | Business logic | "Only admins can delete", "Check usage limits", "3-stage analysis workflow" |
| **Repository** | Data queries | SELECT projects WHERE org_id = ?; INSERT INTO projects ...; |
| **Model** | Data structure | Table definitions, columns, relationships |

### Key Benefits

1. **Testability:** Service logic can be tested with fake repository (no database)
2. **Maintainability:** Business logic is in ONE place (Service), not scattered
3. **Scalability:** Repository handles query optimization (eager loading, pagination)
4. **Reusability:** Service can be called from routes, tasks, or other services
5. **Flexibility:** Can change database without touching routes

### Design Principles

- **Single Responsibility:** Each class does ONE thing
- **Dependency Injection:** Classes receive their dependencies
- **No Leakage:** Database details never leak into higher layers
- **Testability:** Each layer can be tested independently

---

## Current State Problems

### Problem 1: Business Logic Scattered
**Now:** Logic is split between routers and tasks
**After:** All logic in services

### Problem 2: Tight Coupling
**Now:** Routers use SQLAlchemy directly
**After:** Routers use services, services use repositories

### Problem 3: Repeated Code
**Now:** Task code duplicates router logic
**After:** Both call same service

### Problem 4: Hard to Test
**Now:** Can't test without HTTP or database
**After:** Can test with mocks

### Problem 5: Multiple Model Files
**Now:** models.py, models_phase1.py, models_phase2.py...
**After:** Single models/ directory

---

## Project Structure: Before & After

### BEFORE (Current)
```
app/
├── main.py
├── database.py
├── config.py
├── models.py
├── models_phase1.py        # ← Messy!
├── models_phase2.py
├── models_phase3.py
├── models_phase4.py
├── models_phase5.py
├── schemas.py
├── routers/
│   ├── auth.py             # ← Business logic mixed in
│   ├── projects.py
│   ├── analyses.py
│   └── ...
├── services/
│   └── media_processor.py  # ← Only 1 service!
└── tasks.py                # ← More business logic here
```

### AFTER (Proposed)
```
app/
├── main.py
├── database.py
├── config.py
├── models/                 # ← Single directory
│   ├── user.py
│   ├── project.py
│   ├── analysis.py
│   └── media.py
├── schemas/                # ← Organized by feature
│   ├── user.py
│   ├── project.py
│   └── analysis.py
├── repositories/           # ← NEW! Data access layer
│   ├── base.py
│   ├── user_repo.py
│   ├── project_repo.py
│   └── analysis_repo.py
├── services/               # ← EXPANDED! Business logic
│   ├── user_service.py
│   ├── project_service.py
│   └── analysis_service.py
├── routers/                # ← SIMPLIFIED! Just HTTP
│   ├── auth.py
│   ├── projects.py
│   └── analyses.py
└── tasks/
    ├── analysis.py         # ← Thin wrapper calling service
    └── transcription.py
```

---

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: Create base repository
- Day 3-4: Create project repository and service
- Day 5: Create project router v2

**Deliverable:** projects_v2 endpoints working

### Week 2: Core Routes
- Day 6-7: Migrate auth
- Day 8-9: Migrate transcripts
- Day 10-12: Migrate usage and admin

**Deliverable:** All simple routes migrated

### Week 3: Complex Features
- Day 14-19: Migrate analysis (3-stage workflow)
- Day 20: Migrate chat
- Day 21: Migrate clips (if needed)

**Deliverable:** Complex workflows working

### Week 4: Cleanup
- Day 22-25: Remove old code
- Day 26-27: Full test suite passing
- Day 28: Go live with new architecture

**Deliverable:** Clean, tested codebase ready for millions of records

---

## How to Use This Guide

### You Are a Senior Developer
1. Read: **ARCHITECTURE_ANALYSIS.md** (30 mins)
2. Read: **IMPLEMENTATION_ROADMAP.md** (30 mins)
3. Start: Phase 1 with **STARTER_TEMPLATE.md**

### You Are a Mid-Level Developer
1. Read: **ARCHITECTURE_QUICK_REFERENCE.md** (20 mins)
2. Read: **STARTER_TEMPLATE.md** (30 mins)
3. Ask: Senior dev for guidance on Phase 1

### You Are a Junior Developer or Non-Python
1. Read: **ARCHITECTURE_QUICK_REFERENCE.md** (20 mins)
2. Wait: For senior dev to set up Phase 1
3. Study: The patterns in your assigned feature
4. Implement: Following the templates

### You Are the Project Manager
1. Read: "Quick Start" section above (5 mins)
2. Read: **IMPLEMENTATION_ROADMAP.md** Timeline (10 mins)
3. Track: Progress against the 4-week plan
4. Celebrate: Milestones (end of each week)

---

## File Sizes & Time to Read

| Document | Size | Read Time | Best For |
|----------|------|-----------|----------|
| ARCHITECTURE_ANALYSIS.md | 30KB | 45 mins | Architects, technical leads |
| IMPLEMENTATION_ROADMAP.md | 31KB | 60 mins | Project managers, developers |
| ARCHITECTURE_QUICK_REFERENCE.md | 15KB | 20 mins | All team members |
| STARTER_TEMPLATE.md | 31KB | 90 mins | Developers (reference) |

**Total:** About 2-3 hours to fully understand the architecture

---

## Success Metrics

After completing this refactoring, you'll have:

- ✓ **100% of business logic in services** (testable, reusable)
- ✓ **100% of data queries in repositories** (optimizable, consistent)
- ✓ **Zero database code in routers** (clean separation)
- ✓ **>80% test coverage** (unit, integration, E2E)
- ✓ **Single model directory** (not phase1-5 files)
- ✓ **Zero downtime migration** (old and new code running together)
- ✓ **Ready to scale** (can handle millions of records)

---

## FAQ

### Q: How long will this take?
**A:** 4 weeks (1 week per layer, working incrementally)

### Q: Will it break my frontend?
**A:** No. We run old and new code in parallel, then switch endpoints.

### Q: Can I do this while shipping features?
**A:** Yes. Phase 1-3 are safe to do in parallel. Phase 4-5 require stability.

### Q: Do I need to change the database?
**A:** No. Same schema, same data. Only code organization changes.

### Q: What about Celery tasks?
**A:** They become thin wrappers that call services. Much simpler!

### Q: How much will performance improve?
**A:** Same or better (repositories handle optimization like eager loading).

### Q: What if my team has 0 Python experience?
**A:** Use **ARCHITECTURE_QUICK_REFERENCE.md** and **STARTER_TEMPLATE.md**. Copy patterns!

---

## Common Mistakes (Avoid These!)

### Mistake 1: Putting HTTP in Service
```python
# ✗ WRONG
class ProjectService:
    def create(self, request: Request):
        # Don't do this! Services don't know about HTTP
        headers = request.headers
```

### Mistake 2: Putting Business Logic in Router
```python
# ✗ WRONG
@router.post("/projects")
def create(body):
    if not body.name:  # ← This should be in service!
        raise HTTPException(400, "...")
```

### Mistake 3: Putting SQL in Service
```python
# ✗ WRONG
class ProjectService:
    def create(self, name: str):
        db.query(models.Project).filter(...)  # ← This should be in repository!
```

### Mistake 4: Creating Dependencies Inside Classes
```python
# ✗ WRONG
class ProjectService:
    def __init__(self):
        self.repo = ProjectRepository()  # ← Hard to test!
```

### Mistake 5: Skipping Tests
```python
# ✗ WRONG
# Write service, but no tests
# Write repository, but no tests
# Only test through HTTP (slow!)
```

---

## Next Steps

1. **Today:** Read ARCHITECTURE_ANALYSIS.md
2. **Tomorrow:** Read ARCHITECTURE_QUICK_REFERENCE.md
3. **Day 3:** Read IMPLEMENTATION_ROADMAP.md
4. **Day 4:** Team meeting to align on plan
5. **Day 5:** Start Phase 1 with STARTER_TEMPLATE.md

---

## Questions or Issues?

When you get stuck:

1. **"Where should this code go?"** → Read ARCHITECTURE_QUICK_REFERENCE.md "Where to Put What"
2. **"How do I write a repository?"** → Read STARTER_TEMPLATE.md Template 2
3. **"How do I write a service?"** → Read STARTER_TEMPLATE.md Template 3
4. **"How do I test this?"** → Read STARTER_TEMPLATE.md Templates 5-7
5. **"What should I do this week?"** → Read IMPLEMENTATION_ROADMAP.md for your week

---

## Credits & Philosophy

This architecture is based on:
- **Clean Architecture** (Robert C. Martin)
- **Hexagonal Architecture** (Alistair Cockburn)
- **Repository Pattern** (Microsoft)
- **Dependency Injection** (Spring Framework)

Adapted for FastAPI and Python best practices.

---

## Summary

You have a functional backend that works. Now you're making it:

1. **Testable** - Test business logic without HTTP or database
2. **Maintainable** - Clear separation of concerns
3. **Scalable** - Repository pattern for optimization
4. **Reusable** - Services can be called from anywhere
5. **Professional** - Enterprise-grade architecture

This is the foundation for beating CoLoop.ai by being faster, more reliable, and easier to maintain.

Let's go build something great! 🚀
