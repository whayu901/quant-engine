# Qual Engine Backend - Comprehensive Test Implementation Guide

## Overview

This guide provides a complete testing strategy and implementation for the Qual Engine backend. The test suite is designed to achieve 80%+ code coverage across unit, integration, and API tests.

## Test Structure

```
tests/
├── conftest.py                      # Pytest configuration & fixtures
├── test_unit_security.py            # Security module unit tests
├── test_unit_deps.py                # Dependency & permission unit tests
├── test_integration_repos.py        # Database repository integration tests
├── test_api_auth.py                 # Authentication API tests
├── test_api_projects.py             # Projects API tests
├── test_api_transcripts.py          # Transcripts API tests (template)
├── test_api_analyses.py             # Analyses API tests (template)
└── test_e2e_workflows.py            # End-to-end workflow tests (template)
```

## Test Types

### 1. Unit Tests (Fastest, Most Isolated)
**Purpose**: Test individual functions/classes in isolation
**Database**: No real database (uses mocks/stubs)
**Dependencies**: Mocked external services
**Examples**:
- Password hashing logic
- Token encoding/decoding
- Permission checking
- Schema validation

**Files**:
- `test_unit_security.py` - Security module tests
- `test_unit_deps.py` - Dependency injection tests

### 2. Integration Tests (Medium Speed, DB Access)
**Purpose**: Test database operations and model relationships
**Database**: Real SQLAlchemy with in-memory SQLite
**Dependencies**: Partial mocks (only for external APIs)
**Examples**:
- Model creation and persistence
- Relationship cascades
- Query operations
- Foreign key constraints

**Files**:
- `test_integration_repos.py` - Repository/database tests

### 3. API/E2E Tests (Slowest, Full Stack)
**Purpose**: Test complete HTTP request/response flow
**Database**: Real database with test data
**Dependencies**: Mocked where necessary
**Examples**:
- HTTP endpoints
- Authentication flow
- Authorization checks
- Error handling

**Files**:
- `test_api_auth.py` - Authentication endpoints
- `test_api_projects.py` - Projects endpoints
- `test_api_transcripts.py` - Transcripts endpoints (to be created)
- `test_api_analyses.py` - Analyses endpoints (to be created)

## Running Tests

### Run All Tests
```bash
pytest
```

### Run Specific Test File
```bash
pytest tests/test_unit_security.py
```

### Run Specific Test Class
```bash
pytest tests/test_unit_security.py::TestPasswordHashing
```

### Run Specific Test Function
```bash
pytest tests/test_unit_security.py::TestPasswordHashing::test_hash_password
```

### Run Tests by Marker
```bash
# Run only unit tests
pytest -m unit

# Run only integration tests
pytest -m integration

# Run only API tests
pytest -m api

# Run only auth tests
pytest -m auth

# Run only database tests
pytest -m db
```

### Run with Coverage
```bash
# Generate coverage report
pytest --cov=app --cov-report=html

# View coverage report
open htmlcov/index.html
```

### Run Tests in Parallel (faster)
```bash
# Install pytest-xdist
pip install pytest-xdist

# Run with 4 workers
pytest -n 4
```

### Run Tests with Verbose Output
```bash
pytest -v

# Show print statements
pytest -v -s

# Show slowest tests
pytest --durations=10
```

## Fixtures Overview

Fixtures are reusable test utilities provided in `conftest.py`.

### Database Fixtures

```python
def test_something(db):
    """db: SQLAlchemy Session for database operations"""
    user = models.User(...)
    db.add(user)
    db.commit()
```

### FastAPI Test Client

```python
def test_api(client):
    """client: TestClient for making HTTP requests"""
    response = client.get("/health")
    assert response.status_code == 200
```

### Authentication Fixtures

```python
def test_protected_endpoint(admin_headers):
    """admin_headers: Authorization header with admin token"""
    response = client.get("/auth/me", headers=admin_headers)
    assert response.status_code == 200
```

Available auth fixtures:
- `test_org` - Test organization
- `test_admin_user` - Admin user
- `test_researcher_user` - Researcher user
- `test_viewer_user` - Viewer user
- `admin_token` - JWT token for admin
- `admin_headers` - HTTP headers with admin token
- `researcher_headers` - HTTP headers with researcher token
- `viewer_headers` - HTTP headers with viewer token

### Model Factories

Factories generate test data without needing to manually construct objects.

```python
def test_with_factories(db, org_factory, user_factory, project_factory):
    """Factories create realistic test data"""

    # Create org
    org = org_factory.create(db, name="Test Org")

    # Create user
    user = user_factory.create(db, org=org, email="user@test.com")

    # Create project
    project = project_factory.create(db, org=org, created_by=user)
```

Available factories:
- `org_factory.create(db, **kwargs)` - Create org
- `user_factory.create(db, org=org, **kwargs)` - Create user
- `project_factory.create(db, org=org, **kwargs)` - Create project
- `transcript_factory.create(db, project=project, **kwargs)` - Create transcript
- `analysis_factory.create(db, transcript=transcript, **kwargs)` - Create analysis
- `theme_factory.create(db, analysis=analysis, **kwargs)` - Create theme
- `verbatim_factory.create(db, theme=theme, **kwargs)` - Create verbatim
- `implication_factory.create(db, analysis=analysis, **kwargs)` - Create implication
- `segment_factory.create(db, transcript=transcript, **kwargs)` - Create segment
- `media_factory.create(db, project=project, **kwargs)` - Create media asset

Factory `.build()` method builds objects without persisting:
```python
user_data = user_factory.build(org_id="org-123")
```

## Test Patterns

### Pattern 1: Basic Unit Test
```python
@pytest.mark.unit
def test_password_hashing():
    """Test that password hashing works."""
    password = "mysecurepassword"
    hashed = security.hash_pw(password)

    assert hashed != password
    assert security.verify_pw(password, hashed)
```

### Pattern 2: Integration Test with Database
```python
@pytest.mark.integration
@pytest.mark.db
def test_create_user(db, org_factory):
    """Test creating a user in database."""
    org = org_factory.create(db)
    user = models.User(
        org_id=org.id,
        email="test@example.com",
        hashed_password="hash",
        role="admin"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    assert user.id is not None
    assert user.org_id == org.id
```

### Pattern 3: API Test with Authentication
```python
@pytest.mark.api
def test_get_projects(client, admin_headers):
    """Test fetching projects with authentication."""
    response = client.get("/projects", headers=admin_headers)

    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### Pattern 4: Testing Errors
```python
@pytest.mark.api
def test_login_wrong_password(client, test_user):
    """Test login fails with wrong password."""
    response = client.post("/auth/login", data={
        "username": test_user.email,
        "password": "wrongpassword"
    })

    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()
```

### Pattern 5: Testing Relationships
```python
@pytest.mark.integration
def test_org_users_relationship(db, org_factory, user_factory):
    """Test org has many users relationship."""
    org = org_factory.create(db)
    user1 = user_factory.create(db, org=org)
    user2 = user_factory.create(db, org=org)

    db.refresh(org)
    assert len(org.users) == 2
```

### Pattern 6: Testing Multi-tenancy
```python
@pytest.mark.integration
def test_cross_tenant_isolation(db, org_factory, project_factory):
    """Test users can't access other org's projects."""
    org1 = org_factory.create(db, name="Org 1")
    org2 = org_factory.create(db, name="Org 2")

    project = project_factory.create(db, org=org1)

    # Try to access from org2 context
    from app.deps import owned_or_404
    with pytest.raises(HTTPException) as exc:
        owned_or_404(db, models.Project, project.id, org2.id)

    assert exc.value.status_code == 404
```

## Writing Tests for New Features

### Step 1: Create Test File
```bash
tests/test_api_new_feature.py
```

### Step 2: Structure Test Class
```python
import pytest

@pytest.mark.api
class TestNewFeature:
    """Test new feature endpoint."""

    def test_success_case(self, client, admin_headers):
        """Test successful operation."""
        response = client.post(
            "/endpoint",
            headers=admin_headers,
            json={"data": "value"}
        )
        assert response.status_code == 200

    def test_failure_case(self, client, admin_headers):
        """Test failure case."""
        response = client.post(
            "/endpoint",
            headers=admin_headers,
            json={"invalid": "data"}
        )
        assert response.status_code == 422

    def test_auth_required(self, client):
        """Test that auth is required."""
        response = client.post("/endpoint", json={"data": "value"})
        assert response.status_code == 403
```

### Step 3: Include Test Cases
- Success path
- Validation failures
- Authentication required
- Authorization checks
- Error handling
- Edge cases
- Integration scenarios

## Coverage Targets

### By Module
- `app/security.py` - 95%+ (critical for auth)
- `app/deps.py` - 90%+ (critical for permissions)
- `app/models.py` - 85%+ (must test relationships)
- `app/routers/auth.py` - 90%+
- `app/routers/projects.py` - 85%+
- Other routers - 80%+

### Overall Target
- **Minimum**: 80%
- **Target**: 85%
- **Stretch**: 90%+

## Continuous Integration

### Pre-commit Testing
```bash
# Run fast tests before commit
pytest -m "not slow" --tb=short
```

### CI/CD Pipeline (example)
```yaml
test:
  script:
    - pip install -r requirements.txt
    - pip install pytest pytest-cov pytest-xdist
    - pytest --cov=app --cov-report=xml -n 4
  coverage: '/TOTAL.*\s+(\d+%)$/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
```

## Common Issues & Solutions

### Issue: "Module not found"
```
Solution: Ensure conftest.py is in tests/ directory
and sys.path is configured correctly
```

### Issue: "Database already exists"
```
Solution: Fixtures use in-memory SQLite,
should be cleaned up automatically between tests
```

### Issue: "Token verification fails"
```
Solution: Ensure test user._password is set by factory
for testing login flow
```

### Issue: Tests are slow
```
Solution:
- Use pytest-xdist: pytest -n 4
- Mark slow tests: @pytest.mark.slow
- Run only needed tests: pytest -m "not slow"
- Use mocks for external APIs
```

### Issue: Coverage not accurate
```
Solution:
- Regenerate: pytest --cov=app --cov-report=html --cov-report=term
- Exclude test files: See pytest.ini [coverage:run] section
- Check coverage report: open htmlcov/index.html
```

## Best Practices

1. **One assertion per test** (when possible)
   - Makes tests easier to understand
   - Clearer failure messages

2. **Descriptive test names**
   - `test_login_with_correct_password_succeeds` > `test_login`

3. **Use fixtures over setup methods**
   - Cleaner, more composable
   - Better dependency injection

4. **Test behavior, not implementation**
   - Test "what" not "how"
   - More resilient to refactoring

5. **Mock external dependencies**
   - Tests should be deterministic
   - Don't call real APIs in tests

6. **Use markers for organization**
   - `@pytest.mark.unit` / `@pytest.mark.integration`
   - Run subsets with `-m` flag

7. **Keep tests independent**
   - Don't rely on test execution order
   - Each test should be runnable standalone

8. **Test both success and failure**
   - Happy path (everything works)
   - Error cases (things fail gracefully)
   - Edge cases (boundary conditions)

## Performance Tips

### Speed Up Test Runs
1. Use in-memory SQLite (already configured)
2. Use factories for complex setups
3. Mark slow tests with `@pytest.mark.slow`
4. Run in parallel: `pytest -n auto`
5. Reduce database commits in tests

### Profile Tests
```bash
pytest --durations=10  # Show slowest 10 tests
```

## Next Steps

1. Run existing tests:
   ```bash
   pytest tests/
   ```

2. Generate coverage report:
   ```bash
   pytest --cov=app --cov-report=html
   ```

3. Add tests for remaining routers:
   - Create `test_api_transcripts.py`
   - Create `test_api_analyses.py`
   - Create `test_api_chat.py`
   - Create `test_api_admin.py`

4. Add service layer tests:
   - Create `test_unit_services.py`

5. Add end-to-end tests:
   - Create `test_e2e_workflows.py`

## Reference

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
- [SQLAlchemy Testing](https://docs.sqlalchemy.org/en/14/orm/session_basics.html)
- [Python unittest.mock](https://docs.python.org/3/library/unittest.mock.html)
