# Master Orchestrator with Integrated Memory System

## Agent Registry & Capabilities

### Core Development Agents
| Agent | Role | Expertise | Memory Context |
|-------|------|-----------|----------------|
| `qual-engine-specialist` | Project Lead | Overall architecture, business logic | Full project context |
| `backend-developer` | Backend Generalist | System design, infrastructure | API patterns, auth flow |
| `frontend-developer` | Frontend Generalist | UI/UX, component architecture | Component tree, routing |
| `api-designer` | API Architect | REST design, contracts | Endpoint registry, versions |

### Language Specialists
| Agent | Role | Expertise | Memory Context |
|-------|------|-----------|----------------|
| `python-pro` | Python Expert | Pythonic patterns, optimization | Python 3.12, async patterns |
| `fastapi-developer` | FastAPI Specialist | FastAPI framework, Pydantic | FastAPI 0.104+, SQLAlchemy |
| `react-specialist` | React Expert | React 18, hooks, performance | Component patterns, state |
| `sql-pro` | Database Expert | PostgreSQL, query optimization | Schema, indexes, migrations |

### Data & AI Team
| Agent | Role | Expertise | Memory Context |
|-------|------|-----------|----------------|
| `ai-engineer` | Chief AI Architect | LLMs, NLP, Audio Processing | Claude/GPT integration, RAG |
| `data-scientist` | Analytics Lead | ML Models, Statistical Analysis | Theme extraction, sentiment |
| `data-analyst` | BI Lead | Visualization, Reporting | Dashboards, KPIs, charts |
| `data-engineer` | Pipeline Architect | ETL/ELT, Streaming | Airflow, Celery, Kafka |
| `postgres-pro` | PostgreSQL Expert | Query Optimization, Extensions | pgvector, partitioning |
| `database-optimizer` | Performance Specialist | Caching, Pooling | Redis, PgBouncer, monitoring |

## Unified Memory Store

```yaml
# Project Context (Shared by All Agents)
project_context:
  name: qual-engine
  phase: 5
  environment: development
  database: PostgreSQL 15

  backend:
    framework: FastAPI 0.104.1
    orm: SQLAlchemy 2.0.23
    auth: JWT (python-jose)
    async: asyncio + Celery
    testing: pytest

  frontend:
    framework: React 18.3.1
    bundler: Vite 5.3.1
    routing: React Router v6
    state: Context API (React Query available)
    charts: Recharts
    styling: TailwindCSS + styled-jsx

  infrastructure:
    containers: Docker Compose
    python: 3.12
    node: 18+
    redis: For caching/queues

# Agent-Specific Memory
agent_memory:
  python_pro:
    last_optimization: "N+1 query fixes"
    patterns_used: ["dependency injection", "async context managers"]
    warnings: ["SHA256 password hashing needs upgrade"]

  fastapi_developer:
    endpoints_created: 47
    middleware: ["CORS", "authentication"]
    pending_tasks: ["Add rate limiting", "Implement pagination"]
    performance_issues: ["Synchronous AI calls in request path"]

  react_specialist:
    components: 13  # page components
    virtualized: ["OpenEndsCoding", "QualDashboard"]
    needs_virtualization: ["UserManagement"]
    unused_packages: ["@tanstack/react-query"]

  sql_pro:
    tables: 35  # across phases 0-5
    missing_indexes: ["transcripts(project_id, created_at)", "clips(project_id, status)"]
    n_plus_one_locations: ["/admin.py:207", "/admin.py:365", "/clips.py:237"]

  backend_developer:
    routers: 12
    unregistered: ["ingestion.py", "analysis.py"]
    auth_patterns: 3  # needs consolidation

  frontend_developer:
    duplicated_components: 30+
    test_coverage: 0%
    performance_scores: {"LCP": 2.5, "FID": 100, "CLS": 0.1}

  api_designer:
    version: "v1"
    inconsistent_paths: ["/projects", "/api/v1/analysis"]
    breaking_changes: []
```

## Task Coordination Protocol

### 1. Task Assignment Matrix

| Task Type | Primary Agent | Supporting Agents | Sequence |
|-----------|--------------|-------------------|----------|
| Add new API endpoint | `fastapi-developer` | `api-designer`, `python-pro` | Design → Implement → Optimize |
| Optimize database query | `sql-pro` | `python-pro`, `backend-developer` | Analyze → Fix → Test |
| Create React component | `react-specialist` | `frontend-developer`, `api-designer` | Design → Build → Connect |
| Fix performance issue | `python-pro` OR `react-specialist` | All relevant | Profile → Fix → Validate |
| Add authentication | `backend-developer` | `fastapi-developer`, `sql-pro` | Schema → API → Middleware |
| Implement feature | `qual-engine-specialist` | All others as needed | Plan → Distribute → Integrate |

### 2. Communication Protocol

```json
{
  "task_id": "uuid",
  "initiator": "orchestrator",
  "agents": ["fastapi-developer", "sql-pro"],
  "context": {
    "task": "Optimize user list endpoint",
    "priority": "high",
    "constraints": ["maintain backward compatibility"],
    "deadline": "phase_5_completion"
  },
  "memory_snapshot": {
    "relevant_files": ["/app/routers/admin.py"],
    "recent_changes": ["Added UserEnhancement model"],
    "known_issues": ["N+1 query on line 207"]
  },
  "execution_plan": {
    "phase_1": {
      "agent": "sql-pro",
      "action": "Analyze query patterns",
      "output": "optimization_plan.md"
    },
    "phase_2": {
      "agent": "fastapi-developer",
      "action": "Implement eager loading",
      "dependencies": ["phase_1.output"]
    },
    "phase_3": {
      "agent": "python-pro",
      "action": "Optimize Python code",
      "dependencies": ["phase_2.output"]
    }
  }
}
```

### 3. Conflict Resolution Rules

```yaml
conflicts:
  file_modification:
    rule: "Sequential access only"
    priority: ["qual-engine-specialist", "fastapi-developer", "python-pro"]

  api_contract:
    rule: "api-designer has veto power"
    escalation: "qual-engine-specialist mediates"

  database_schema:
    rule: "sql-pro owns schema decisions"
    consultation: "backend-developer for ORM mapping"

  component_architecture:
    rule: "react-specialist leads"
    consultation: "frontend-developer for integration"

  performance_optimization:
    rule: "Language specialist leads for their domain"
    validation: "qual-engine-specialist approves"
```

## Memory Management System

### Short-term Memory (Per Session)
```yaml
session_memory:
  current_task: null
  active_agents: []
  files_modified: []
  decisions_made: []
  errors_encountered: []
  performance_metrics:
    start_time: null
    api_calls: 0
    lines_changed: 0
```

### Long-term Memory (Persistent)
```yaml
persistent_memory:
  architectural_decisions:
    - "JWT for authentication (decided: phase_0)"
    - "PostgreSQL for persistence (decided: phase_0)"
    - "Celery for async tasks (decided: phase_3)"
    - "React Query for frontend state (pending: phase_6)"

  code_patterns:
    backend:
      - "Use dependency injection for database sessions"
      - "Return HTTPException for errors"
      - "Use Pydantic for validation"
    frontend:
      - "Virtual scrolling for >1000 items"
      - "Memoize filtered data"
      - "Extract reusable components"

  optimization_history:
    - date: "2024-01-15"
      issue: "N+1 queries"
      solution: "Added joinedload"
      impact: "50x faster"

  known_issues:
    critical:
      - "No test coverage"
      - "Missing routers in main.py"
    high:
      - "React Query not used"
      - "N+1 queries in admin.py"
    medium:
      - "No rate limiting"
      - "Component duplication"
```

## Agent Collaboration Examples

### Example 1: Fixing N+1 Query Problem

```markdown
ORCHESTRATOR: Detected N+1 query issue in /admin.py:207

TASK ASSIGNMENT:
├── sql-pro: Analyze query pattern
├── python-pro: Review Python code
└── fastapi-developer: Implement fix

EXECUTION:
1. sql-pro → "Need joinedload on User.enhancement relationship"
2. python-pro → "Also optimize the loop at line 223"
3. fastapi-developer → "Implementing with proper error handling"

MEMORY UPDATE:
- Fixed: admin.py:207 N+1 query
- Pattern: Always use joinedload for relationships
- Performance: 50x improvement on user list
```

### Example 2: Creating New Feature (Activity Dashboard)

```markdown
ORCHESTRATOR: Implement activity dashboard feature

PARALLEL EXECUTION:
├── Branch A: Backend
│   ├── api-designer → Define endpoints
│   ├── sql-pro → Design activity schema
│   └── fastapi-developer → Implement endpoints
│
└── Branch B: Frontend
    ├── react-specialist → Component architecture
    └── frontend-developer → UI implementation

SYNCHRONIZATION POINT: API contract agreement

INTEGRATION:
├── backend-developer → Connect all backend pieces
├── frontend-developer → Wire API to UI
└── qual-engine-specialist → Final review

MEMORY UPDATE:
- New feature: Activity Dashboard
- Endpoints: /api/v1/activity/*
- Components: ActivityDashboard.jsx, ActivityChart.jsx
- Performance: Virtual scrolling implemented
```

### Example 3: Performance Optimization Task

```markdown
ORCHESTRATOR: Optimize application performance

AGENT COORDINATION:
1. python-pro + sql-pro:
   - Identify slow queries
   - Add missing indexes
   - Implement query caching

2. react-specialist + frontend-developer:
   - Add React.memo to components
   - Implement code splitting
   - Use React Query for caching

3. fastapi-developer + backend-developer:
   - Add response caching
   - Implement pagination
   - Move AI calls to background

RESULTS:
- Backend: 10x faster API responses
- Frontend: 50% reduction in bundle size
- Database: 20x faster queries
```

## Handoff Protocol

When agents complete tasks, they must provide:

```yaml
handoff:
  from_agent: "fastapi-developer"
  to_agent: "react-specialist"
  task_status: "endpoint_complete"

  deliverables:
    - file: "/app/routers/dashboard.py"
      changes: "Added GET /api/v1/dashboard/stats"
    - documentation: "endpoint_spec.yaml"
    - tests: "test_dashboard.py"

  context_transfer:
    api_endpoint: "/api/v1/dashboard/stats"
    response_format: "JSON with nested metrics"
    auth_required: true
    rate_limit: "100 requests/minute"

  warnings:
    - "Large payload, consider pagination"
    - "Needs caching for production"

  next_steps:
    - "Create Dashboard component"
    - "Add loading states"
    - "Implement error handling"
```

## Error Recovery Protocol

```yaml
error_handling:
  detection:
    - Monitor agent outputs for errors
    - Check for conflicts in recommendations
    - Validate against project constraints

  recovery:
    conflict_detected:
      1. Pause all agents
      2. Identify conflict type
      3. Apply resolution rules
      4. Update memory
      5. Resume with updated context

    agent_failure:
      1. Log error to memory
      2. Reassign task to backup agent
      3. Update execution plan
      4. Continue with degraded capability

    integration_failure:
      1. Rollback changes
      2. Analyze root cause
      3. Update agent memory
      4. Retry with fixes
```

## Best Practices

1. **Always check memory before task assignment**
2. **Language specialists lead for their domain**
3. **Core developers handle integration**
4. **Project specialist has final say on architecture**
5. **Update memory after every significant decision**
6. **Document patterns for future reference**
7. **Escalate conflicts early**
8. **Maintain audit trail of all changes**

## Usage Commands

```markdown
# Single agent task
"Using python-pro, optimize the database queries"

# Multi-agent collaboration
"Fix the N+1 query issue using sql-pro and fastapi-developer"

# Full stack feature
"Implement user analytics dashboard using all relevant agents"

# Performance audit
"Run performance analysis with python-pro and react-specialist"
```

Remember: The orchestrator ensures all agents work in harmony, maintaining consistency across the entire Qual Engine platform.