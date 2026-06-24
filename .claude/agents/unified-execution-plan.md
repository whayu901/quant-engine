# Unified Execution Plan: Security & Quality Implementation

## Current State Assessment (All Agents Consensus)

### 🔴 CRITICAL Issues (Must Fix Immediately)
```yaml
security_critical:
  1. weak_password_hashing:
     location: /backend/app/routers/admin.py:253
     current: SHA256(password)
     required: bcrypt with salt
     assigned: [security-auditor, python-pro]

  2. zero_test_coverage:
     backend: 0%
     frontend: 0%
     required: minimum 60%
     assigned: [test-automator, qa-expert]

  3. unregistered_routers:
     missing: [ingestion.py, analysis.py]
     impact: "Phase 1-2 endpoints inaccessible"
     assigned: [fastapi-developer]

  4. n_plus_one_queries:
     locations: [admin.py:207, admin.py:365, clips.py:237]
     impact: "50x slower than necessary"
     assigned: [sql-pro, python-pro]
```

## Phase 1: Security Hardening (Week 1)

### Day 1-2: Password Security Fix
```markdown
PARALLEL EXECUTION:

Task A: Fix Password Hashing
├── security-auditor: Define requirements
├── python-pro: Implement bcrypt
└── test-automator: Write security tests

Task B: Add Rate Limiting
├── security-auditor: Define limits
├── fastapi-developer: Implement middleware
└── test-automator: Write rate limit tests

IMPLEMENTATION:
```

```python
# Task A Implementation (python-pro + security-auditor)
# File: /backend/app/security.py

from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
import secrets

# BEFORE (VULNERABLE)
# def hash_pw(password: str) -> str:
#     return hashlib.sha256(password.encode()).hexdigest()

# AFTER (SECURE)
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # security-auditor: industry standard
)

def hash_pw(password: str) -> str:
    """Hash password using bcrypt with automatic salt"""
    return pwd_context.hash(password)

def verify_pw(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

# Migration script for existing passwords
async def migrate_passwords(db: Session):
    """One-time migration from SHA256 to bcrypt"""
    users = db.query(User).all()
    for user in users:
        if len(user.hashed_password) == 64:  # SHA256 length
            # Force password reset on next login
            user.requires_password_reset = True
            db.add(user)
    db.commit()
```

```python
# Task B Implementation (fastapi-developer + security-auditor)
# File: /backend/app/middleware/rate_limit.py

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Create limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per minute"],  # security-auditor: baseline
    storage_uri="redis://localhost:6379"  # sql-pro: use Redis for distributed
)

# Apply to app
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Endpoint-specific limits
@router.post("/auth/login")
@limiter.limit("5 per minute")  # security-auditor: prevent brute force
async def login(...):
    pass

@router.post("/api/v1/analysis")
@limiter.limit("10 per hour")  # fastapi-developer: expensive operation
async def create_analysis(...):
    pass
```

### Day 3-4: Test Infrastructure Setup
```markdown
PARALLEL EXECUTION:

Backend Testing Setup (test-automator + python-pro):
```

```bash
# Install testing dependencies
pip install pytest pytest-asyncio pytest-cov factory-boy faker httpx

# Create test structure
mkdir -p backend/tests/{unit,integration,fixtures}
touch backend/tests/conftest.py
```

```python
# File: /backend/tests/conftest.py (test-automator)
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.security import hash_pw

# Test database
SQLALCHEMY_TEST_DATABASE_URL = "postgresql://test:test@localhost/qual_engine_test"

@pytest.fixture(scope="session")
def db_engine():
    engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session(db_engine):
    TestingSessionLocal = sessionmaker(bind=db_engine)
    session = TestingSessionLocal()
    yield session
    session.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def test_user(db_session):
    """Create test user (security-auditor: with secure password)"""
    from app.models import User, Org

    org = Org(id="test-org", name="Test Org", plan="pro")
    db_session.add(org)

    user = User(
        id="test-user",
        email="test@example.com",
        hashed_password=hash_pw("SecureP@ssw0rd123!"),
        role="researcher",
        org_id="test-org"
    )
    db_session.add(user)
    db_session.commit()
    return user
```

```python
# File: /backend/tests/test_security.py (security-auditor + test-automator)
import pytest
from app.security import hash_pw, verify_pw, create_token

class TestPasswordSecurity:
    """security-auditor: Critical security tests"""

    def test_bcrypt_hashing(self):
        """Ensure bcrypt is used, not SHA256"""
        password = "TestPassword123!"
        hashed = hash_pw(password)

        # bcrypt hashes start with $2b$
        assert hashed.startswith("$2b$")
        # Should be different each time (salt)
        assert hash_pw(password) != hashed

    def test_password_verification(self):
        """Test secure password verification"""
        password = "SecureP@ssw0rd!"
        hashed = hash_pw(password)

        assert verify_pw(password, hashed) == True
        assert verify_pw("WrongPassword", hashed) == False

    def test_timing_attack_resistance(self):
        """security-auditor: Prevent timing attacks"""
        import time
        hashed = hash_pw("test")

        # Time correct password
        start = time.perf_counter()
        for _ in range(10):
            verify_pw("test", hashed)
        correct_time = time.perf_counter() - start

        # Time incorrect password
        start = time.perf_counter()
        for _ in range(10):
            verify_pw("wrong", hashed)
        wrong_time = time.perf_counter() - start

        # Times should be similar (constant time comparison)
        assert abs(correct_time - wrong_time) < 0.1
```

```javascript
// Frontend Testing Setup (test-automator + react-specialist)
// File: /frontend/package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}

// File: /frontend/jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
  ],
  coverageThresholds: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  }
};

// File: /frontend/src/__tests__/AuthContext.test.jsx (react-specialist + security-auditor)
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

describe('AuthContext Security', () => {
  test('stores token securely', async () => {
    // security-auditor: ensure token is stored properly
    const { login } = useAuth();
    await login('test@example.com', 'password');

    const token = localStorage.getItem('qe_token');
    expect(token).toBeDefined();
    expect(token).toMatch(/^eyJ/); // JWT format
  });

  test('clears sensitive data on logout', () => {
    // security-auditor: ensure complete cleanup
    const { logout } = useAuth();
    localStorage.setItem('qe_token', 'test-token');

    logout();

    expect(localStorage.getItem('qe_token')).toBeNull();
  });

  test('validates role-based access', () => {
    // security-auditor: test authorization
    const { user, hasPermission } = useAuth();
    user.role = 'researcher';

    expect(hasPermission('view_projects')).toBe(true);
    expect(hasPermission('manage_users')).toBe(false);
  });
});
```

## Phase 2: Performance & Quality (Week 2)

### Day 5-6: Database Optimization
```python
# sql-pro + python-pro: Fix N+1 Queries
# File: /backend/app/routers/admin.py

from sqlalchemy.orm import joinedload, selectinload

# BEFORE (N+1 Query)
# users = db.query(User).filter_by(org_id=org_id).all()
# for user in users:
#     enhancement = db.query(UserEnhancement).filter_by(user_id=user.id).first()

# AFTER (Optimized)
users = db.query(User).options(
    joinedload(User.enhancement),  # sql-pro: eager load relationship
    selectinload(User.projects)    # sql-pro: for one-to-many
).filter_by(org_id=org_id).all()

# Add indexes (sql-pro: based on query patterns)
"""
-- Migration file
CREATE INDEX idx_transcripts_project_created ON transcripts(project_id, created_at DESC);
CREATE INDEX idx_clips_project_status ON clips(project_id, status);
CREATE INDEX idx_users_org_role ON users(org_id, role);
"""
```

### Day 7: React Query Implementation
```javascript
// react-specialist + frontend-developer: Implement React Query
// File: /frontend/src/hooks/useProjects.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: api.projects,
    staleTime: 5 * 60 * 1000, // react-specialist: 5 minutes
    cacheTime: 10 * 60 * 1000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, description }) =>
      api.createProject(name, description),
    onSuccess: () => {
      // react-specialist: invalidate cache
      queryClient.invalidateQueries(['projects']);
    },
  });
}

// File: /frontend/src/pages/Projects.jsx (refactored)
function Projects() {
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();

  // No more useState for loading, error, projects!
  // No more useEffect for fetching!

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    // ... render projects
  );
}
```

## Phase 3: Continuous Monitoring (Week 3+)

### Automated Quality Gates
```yaml
# File: /.github/workflows/quality-security.yml (qa-expert + all agents)
name: Quality & Security Gates

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run pytest with coverage
        run: |
          cd backend
          pytest --cov=app --cov-report=xml --cov-fail-under=60

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Jest tests
        run: |
          cd frontend
          npm test -- --coverage --watchAll=false

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Run Trivy security scanner
        uses: aquasecurity/trivy-action@master
      - name: OWASP Dependency Check
        run: |
          dependency-check --scan . --format JSON

  quality-check:
    runs-on: ubuntu-latest
    steps:
      - name: SonarQube Scan
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        run: sonar-scanner
```

## Success Metrics Dashboard

### Week 1 Goals ✅
- [ ] Password hashing migrated to bcrypt
- [ ] Rate limiting implemented
- [ ] Test infrastructure ready
- [ ] Critical auth tests written

### Week 2 Goals 📊
- [ ] N+1 queries fixed
- [ ] React Query implemented
- [ ] 30% test coverage achieved
- [ ] Performance improved by 10x

### Week 3 Goals 🚀
- [ ] 60% test coverage reached
- [ ] All critical vulnerabilities fixed
- [ ] CI/CD pipeline active
- [ ] Monitoring dashboard live

## Agent Collaboration Matrix

| Task | Lead Agent | Supporting Agents | Validation |
|------|------------|-------------------|------------|
| Security fixes | security-auditor | python-pro, fastapi-developer | test-automator |
| Test setup | test-automator | qa-expert, all developers | security-auditor |
| Performance | sql-pro | python-pro, react-specialist | qa-expert |
| Quality gates | qa-expert | test-automator, security-auditor | qual-engine-specialist |

## Communication Channels

1. **Daily Sync**: All agents report progress
2. **Security Alerts**: Immediate escalation
3. **Quality Reports**: Weekly metrics
4. **Memory Updates**: After each task completion

Remember: Every agent contributes to both security and quality!