# Security & QA Orchestration System for Qual Engine

## Agent Hierarchy & Responsibilities

### Security Team
```yaml
security-auditor:
  role: Chief Security Officer
  responsibility: Overall security posture
  tech_focus: [OWASP, JWT, PostgreSQL security, HTTPS/TLS]

  current_context:
    critical_issues:
      - password_hashing: "SHA256 without salt in admin.py:253"
      - share_links: "Plaintext passwords in clips.py:699"
      - default_creds: "changeme123 hardcoded"

    immediate_actions:
      - implement_bcrypt: "Replace SHA256 with bcrypt"
      - add_rate_limiting: "Protect all endpoints"
      - sanitize_inputs: "Prevent XSS/SQL injection"

penetration-tester: # (if added)
  role: Offensive Security
  responsibility: Find vulnerabilities before attackers
  tech_focus: [API testing, Auth bypass, Injection attacks]
```

### Quality Assurance Team
```yaml
qa-expert:
  role: QA Lead
  responsibility: Quality strategy and metrics
  tech_focus: [Test planning, Coverage metrics, Bug tracking]

  current_context:
    coverage_emergency: "0% test coverage across stack"
    quality_metrics:
      code_quality: "B-"
      documentation: "C"
      error_handling: "C+"

    priority_matrix:
      p0: ["Authentication tests", "Authorization tests"]
      p1: ["API endpoint tests", "React component tests"]
      p2: ["Integration tests", "Performance tests"]

test-automator:
  role: Test Implementation Specialist
  responsibility: Build and maintain test infrastructure
  tech_focus: [pytest, Jest, React Testing Library, Playwright]

  current_context:
    backend_testing:
      framework: pytest
      required_packages: [pytest, pytest-asyncio, pytest-cov, factory-boy]
      coverage_target: 80%

    frontend_testing:
      framework: Jest + RTL
      required_packages: [@testing-library/react, @testing-library/jest-dom]
      coverage_target: 70%

    e2e_testing:
      framework: Playwright
      critical_paths: [login, project_creation, analysis_workflow]
```

## Integrated Memory System

### Security & QA Shared Context
```json
{
  "security_posture": {
    "current_grade": "D+",
    "vulnerabilities": {
      "critical": 2,
      "high": 3,
      "medium": 4,
      "low": 7
    },
    "last_audit": "2024-06-24",
    "compliance": {
      "OWASP_top_10": "3/10 addressed",
      "GDPR": "partial",
      "SOC2": "not_compliant"
    }
  },

  "quality_metrics": {
    "test_coverage": {
      "backend": 0,
      "frontend": 0,
      "e2e": 0
    },
    "code_smells": 47,
    "technical_debt": "3 months",
    "bug_rate": "unknown (no tracking)"
  },

  "stack_vulnerabilities": {
    "FastAPI": {
      "version": "0.104.1",
      "issues": ["No rate limiting", "No CSRF protection", "Verbose errors"]
    },
    "React": {
      "version": "18.3.1",
      "issues": ["XSS risks in user content", "No CSP headers"]
    },
    "PostgreSQL": {
      "version": "15",
      "issues": ["Weak password policy", "No query timeout"]
    },
    "Dependencies": {
      "outdated": 12,
      "vulnerable": 2
    }
  }
}
```

## Task Coordination Protocols

### Protocol 1: Security Audit & Fix
```markdown
TRIGGER: "Perform security audit"

SEQUENCE:
1. security-auditor + sql-pro:
   - Scan database for SQL injection risks
   - Review password storage
   - Check access controls

2. security-auditor + fastapi-developer:
   - Review authentication flow
   - Check authorization middleware
   - Validate input sanitization

3. security-auditor + react-specialist:
   - Check for XSS vulnerabilities
   - Review state management security
   - Validate client-side validation

4. python-pro + security-auditor:
   - Implement fixes:
     ```python
     # Before (VULNERABLE)
     hashed_password = hashlib.sha256(password.encode()).hexdigest()

     # After (SECURE)
     from passlib.context import CryptContext
     pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
     hashed_password = pwd_context.hash(password)
     ```

MEMORY UPDATE:
- vulnerabilities_fixed: ["password_hashing", "rate_limiting"]
- security_grade: "D+" → "C+"
```

### Protocol 2: Test Infrastructure Setup
```markdown
TRIGGER: "Setup test infrastructure"

PARALLEL EXECUTION:
├── Branch A: Backend Testing (test-automator + python-pro)
│   ├── Install pytest ecosystem
│   ├── Create test structure:
│   │   └── /backend/tests/
│   │       ├── conftest.py
│   │       ├── test_auth.py
│   │       ├── test_api/
│   │       └── fixtures/
│   └── Write critical tests
│
├── Branch B: Frontend Testing (test-automator + react-specialist)
│   ├── Configure Jest + RTL
│   ├── Create test structure:
│   │   └── /frontend/src/__tests__/
│   │       ├── components/
│   │       ├── pages/
│   │       └── utils/
│   └── Write component tests
│
└── Branch C: E2E Testing (test-automator + qa-expert)
    ├── Setup Playwright
    ├── Create test scenarios
    └── Implement critical paths

SYNCHRONIZATION: All branches complete → Run full test suite
```

### Protocol 3: Quality Gate Implementation
```markdown
TRIGGER: "Implement quality gates"

COORDINATION:
qa-expert (LEAD) → Define standards:
  - Minimum 60% test coverage
  - No critical vulnerabilities
  - Performance benchmarks met

security-auditor → Security requirements:
  - All auth endpoints tested
  - No plaintext passwords
  - Rate limiting active

test-automator → Implementation:
  - Pre-commit hooks
  - CI/CD pipeline
  - Automated reports

DELIVERABLES:
- .github/workflows/quality.yml
- .pre-commit-config.yaml
- pytest.ini / jest.config.js
```

## Agent Communication Examples

### Example 1: Critical Security Fix (Password Hashing)
```yaml
message:
  from: security-auditor
  to: [python-pro, fastapi-developer]
  priority: CRITICAL

  issue:
    type: "Weak cryptography"
    location: "/backend/app/routers/admin.py:253"
    current: "SHA256 without salt"
    impact: "Password rainbow table attacks"

  required_action:
    implement: "bcrypt with salt"
    test: "Password hash verification"
    migrate: "Existing password hashes"

response:
  from: python-pro
  status: "In progress"

  implementation:
    file: "/backend/app/security.py"
    changes:
      - "Added passlib[bcrypt] to requirements"
      - "Created pwd_context with bcrypt"
      - "Updated hash_pw and verify_pw functions"

  test_coverage:
    - "test_password_hashing"
    - "test_password_verification"
    - "test_migration_script"

validation:
  from: security-auditor
  status: "Approved"
  notes: "Meets security standards"
```

### Example 2: Test Coverage Emergency
```yaml
message:
  from: qa-expert
  to: [test-automator, all-developers]
  priority: HIGH

  issue:
    type: "Zero test coverage"
    impact: "Cannot verify code quality"
    risk: "Production bugs, security vulnerabilities"

  action_plan:
    phase_1: "Critical path tests (1 week)"
      - Authentication flow
      - Authorization checks
      - Data validation

    phase_2: "Component tests (2 weeks)"
      - API endpoints
      - React components
      - Database operations

    phase_3: "Full coverage (1 month)"
      - 80% backend
      - 70% frontend
      - E2E scenarios

coordination:
  test-automator: "Setup infrastructure"
  python-pro: "Write backend tests"
  react-specialist: "Write frontend tests"
  security-auditor: "Security test cases"
```

## Stack-Specific Security & QA Rules

### FastAPI Security Rules
```python
# Rule 1: Always use dependency injection for auth
from fastapi import Depends
user: User = Depends(get_current_user)

# Rule 2: Rate limiting on all endpoints
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@router.post("/api/endpoint")
@limiter.limit("10/minute")
async def endpoint():
    pass

# Rule 3: Input validation with Pydantic
from pydantic import BaseModel, validator
class UserInput(BaseModel):
    email: EmailStr
    password: SecretStr

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password too short')
        return v
```

### React Security Rules
```javascript
// Rule 1: Never use dangerouslySetInnerHTML with user input
// BAD
<div dangerouslySetInnerHTML={{__html: userContent}} />

// GOOD
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userContent)}} />

// Rule 2: Validate all user inputs
// Rule 3: Use environment variables for sensitive data
// Rule 4: Implement CSP headers
```

### PostgreSQL Security Rules
```sql
-- Rule 1: Use parameterized queries (SQLAlchemy does this)
-- Rule 2: Implement row-level security
-- Rule 3: Encrypt sensitive columns
-- Rule 4: Regular backups with encryption
```

## Testing Strategy by Stack Layer

### Backend Testing Matrix
| Component | Test Type | Framework | Priority | Owner |
|-----------|-----------|-----------|----------|--------|
| Auth endpoints | Unit + Integration | pytest | P0 | python-pro + security-auditor |
| API endpoints | Unit + Integration | pytest | P1 | fastapi-developer + test-automator |
| Database queries | Unit | pytest + factoryboy | P1 | sql-pro + test-automator |
| Background tasks | Integration | pytest-asyncio | P2 | python-pro |
| WebSockets | Integration | pytest-asyncio | P2 | fastapi-developer |

### Frontend Testing Matrix
| Component | Test Type | Framework | Priority | Owner |
|-----------|-----------|-----------|----------|--------|
| AuthContext | Unit | Jest + RTL | P0 | react-specialist + security-auditor |
| Form validation | Unit | Jest + RTL | P0 | react-specialist |
| API integration | Integration | Jest + MSW | P1 | frontend-developer |
| Virtual scrolling | Performance | Jest | P2 | react-specialist |
| Accessibility | A11y | jest-axe | P2 | qa-expert |

### E2E Testing Scenarios
```javascript
// Critical paths (test-automator + qa-expert)
describe('Authentication Flow', () => {
  test('User can login with valid credentials');
  test('User cannot login with invalid credentials');
  test('Session expires after timeout');
  test('Role-based access is enforced');
});

describe('Project Workflow', () => {
  test('Create project → Upload transcript → Run analysis');
  test('Generate clips → Create reels → Share');
});
```

## Continuous Monitoring

### Security Metrics Dashboard
```yaml
real_time_monitoring:
  - Failed login attempts
  - API rate limit hits
  - SQL injection attempts
  - XSS payload detection
  - Unusual data access patterns

daily_reports:
  - New vulnerabilities
  - Dependency updates
  - Security test results
  - Penetration test findings

weekly_audits:
  - Code security review
  - Access log analysis
  - Permission changes
  - Data exposure risks
```

### Quality Metrics Dashboard
```yaml
continuous_metrics:
  - Test coverage percentage
  - Test execution time
  - Failed test count
  - Code complexity scores
  - Performance benchmarks

deployment_gates:
  - Coverage >= 60%
  - No critical vulnerabilities
  - All tests passing
  - Performance within SLA
  - Security scan clean
```

## Emergency Response Protocols

### Security Breach Response
```markdown
DETECTION: security-auditor identifies breach

IMMEDIATE:
1. security-auditor: Assess impact
2. fastapi-developer: Disable affected endpoints
3. sql-pro: Lock down database
4. python-pro: Patch vulnerability

RECOVERY:
1. test-automator: Verify fix
2. qa-expert: Full regression test
3. security-auditor: Penetration test
4. All: Post-mortem analysis
```

### Quality Failure Response
```markdown
DETECTION: qa-expert identifies critical bug in production

IMMEDIATE:
1. qa-expert: Assess impact
2. test-automator: Write failing test
3. Responsible developer: Fix issue
4. test-automator: Verify fix

PREVENTION:
1. Add test for this case
2. Update quality gates
3. Review similar code
4. Update documentation
```

## Success Metrics

### Security Success
- 0 critical vulnerabilities
- 100% auth endpoints tested
- < 5 minute incident response
- A+ security grade

### Quality Success
- 80% test coverage (backend)
- 70% test coverage (frontend)
- < 2% bug escape rate
- < 100ms API response time

Remember: Security and Quality are not afterthoughts - they're integral to every line of code.