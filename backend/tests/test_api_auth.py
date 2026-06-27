"""
API/Integration tests for authentication router.
Tests HTTP endpoints for registration, login, and user info.
"""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.api
@pytest.mark.auth
class TestAuthRegister:
    """Test user registration endpoint."""

    def test_register_success(self, client: TestClient):
        """Test successful user registration."""
        response = client.post("/auth/register", json={
            "email": "newuser@test.com",
            "password": "secure123",
            "org_name": "My Organization"
        })

        assert response.status_code == 201  # Updated to 201 Created
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["status"] == "success"
        assert data["user"]["email"] == "newuser@test.com"

    def test_register_creates_user(self, client: TestClient):
        """Test that register creates a user in the database."""
        response = client.post("/auth/register", json={
            "email": "newuser@test.com",
            "password": "secure123",
            "org_name": "My Organization"
        })

        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["id"]
        assert data["user"]["org_id"]

    def test_register_creates_org(self, client: TestClient):
        """Test that register creates an organization."""
        response = client.post("/auth/register", json={
            "email": "newuser@test.com",
            "password": "secure123",
            "org_name": "My Organization"
        })

        assert response.status_code == 201
        data = response.json()
        assert data["user"]["org_id"]

    def test_register_duplicate_email(self, client: TestClient, test_user):
        """Test that duplicate email registration fails."""
        response = client.post("/auth/register", json={
            "email": test_user.email,
            "password": "different123",
            "org_name": "Different Org"
        })

        assert response.status_code == 409  # Updated to 409 Conflict
        detail = response.json()["detail"]
        if isinstance(detail, dict):
            assert "already exists" in detail["message"].lower()
        else:
            assert "already" in detail.lower()

    def test_register_invalid_email(self, client: TestClient):
        """Test that invalid email format is rejected."""
        response = client.post("/auth/register", json={
            "email": "not-an-email",
            "password": "secure123",
            "org_name": "My Organization"
        })

        assert response.status_code == 422  # Validation error

    def test_register_missing_email(self, client: TestClient):
        """Test that missing email is rejected."""
        response = client.post("/auth/register", json={
            "password": "secure123",
            "org_name": "My Organization"
        })

        assert response.status_code == 422

    def test_register_missing_password(self, client: TestClient):
        """Test that missing password is rejected."""
        response = client.post("/auth/register", json={
            "email": "newuser@test.com",
            "org_name": "My Organization"
        })

        assert response.status_code == 422

    def test_register_missing_org_name(self, client: TestClient):
        """Test that missing org name is rejected."""
        response = client.post("/auth/register", json={
            "email": "newuser@test.com",
            "password": "secure123"
        })

        assert response.status_code == 422

    def test_register_empty_password(self, client: TestClient):
        """Test that empty password is accepted (validation test)."""
        # Note: In real app, you might want to enforce minimum password length
        response = client.post("/auth/register", json={
            "email": "newuser@test.com",
            "password": "",
            "org_name": "My Organization"
        })

        # Depending on validation rules, might be 200 or 422
        assert response.status_code in [200, 422]

    def test_register_user_is_admin_by_default(self, client: TestClient, db):
        """Test that first user created is admin."""
        response = client.post("/auth/register", json={
            "email": "admin@test.com",
            "password": "secure123",
            "org_name": "My Organization"
        })

        assert response.status_code == 200
        # New user should be admin
        from app.models import User
        user = db.query(User).filter_by(email="admin@test.com").first()
        assert user.role == "admin"

    def test_register_token_is_valid(self, client: TestClient):
        """Test that returned token is valid."""
        response = client.post("/auth/register", json={
            "email": "newuser@test.com",
            "password": "secure123",
            "org_name": "My Organization"
        })

        assert response.status_code == 201
        token = response.json()["access_token"]

        # Use token to get user info
        me_response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert me_response.status_code == 200


@pytest.mark.api
@pytest.mark.auth
class TestAuthLogin:
    """Test user login endpoint."""

    def test_login_success(self, client: TestClient, test_user):
        """Test successful login."""
        response = client.post("/auth/login", data={
            "username": test_user.email,
            "password": test_user._password
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["status"] == "success"
        assert data["user"]["email"] == test_user.email
        assert data["user"]["id"] == test_user.id

    def test_login_wrong_password(self, client: TestClient, test_user):
        """Test login with wrong password."""
        response = client.post("/auth/login", data={
            "username": test_user.email,
            "password": "wrongpassword"
        })

        assert response.status_code == 401
        detail = response.json()["detail"]
        if isinstance(detail, dict):
            assert "invalid" in detail["message"].lower()
        else:
            assert "invalid" in detail.lower()

    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with nonexistent user."""
        response = client.post("/auth/login", data={
            "username": "nonexistent@test.com",
            "password": "anypassword"
        })

        assert response.status_code == 401

    def test_login_empty_password(self, client: TestClient, test_user):
        """Test login with empty password."""
        response = client.post("/auth/login", data={
            "username": test_user.email,
            "password": ""
        })

        assert response.status_code == 401

    def test_login_case_sensitive_email(self, client: TestClient, test_user):
        """Test that email is case-insensitive in login."""
        response = client.post("/auth/login", data={
            "username": test_user.email.upper(),
            "password": test_user._password
        })

        # Should succeed because we normalize to lowercase
        assert response.status_code == 200

    def test_login_returns_valid_token(self, client: TestClient, test_user):
        """Test that login returns a valid token."""
        response = client.post("/auth/login", data={
            "username": test_user.email,
            "password": test_user._password
        })

        assert response.status_code == 200
        token = response.json()["access_token"]

        # Token should work to fetch user info
        me_response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert me_response.status_code == 200

    def test_login_missing_username(self, client: TestClient):
        """Test login without username."""
        response = client.post("/auth/login", data={
            "password": "anypassword"
        })

        assert response.status_code == 422

    def test_login_missing_password(self, client: TestClient):
        """Test login without password."""
        response = client.post("/auth/login", data={
            "username": "user@test.com"
        })

        assert response.status_code == 422


@pytest.mark.api
@pytest.mark.auth
class TestAuthMe:
    """Test get current user endpoint."""

    def test_me_with_valid_token(self, client: TestClient, admin_headers, test_admin_user):
        """Test getting current user with valid token."""
        response = client.get("/auth/me", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_admin_user.id
        assert data["email"] == test_admin_user.email
        assert data["role"] == "admin"

    def test_me_without_token(self, client: TestClient):
        """Test getting current user without token."""
        response = client.get("/auth/me")

        assert response.status_code == 403

    def test_me_with_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token."""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"}
        )

        assert response.status_code == 401

    def test_me_with_expired_token(self, client: TestClient):
        """Test getting current user with expired token."""
        # Create a token that's already expired
        from app import security
        from datetime import datetime, timedelta

        # This would require mocking time or using a special test token
        # For now, this is a placeholder for future implementation
        pass

    def test_me_returns_user_info(self, client: TestClient, researcher_headers, test_researcher_user):
        """Test that me endpoint returns correct user info."""
        response = client.get("/auth/me", headers=researcher_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_researcher_user.email
        assert data["role"] == "researcher"
        assert data["org_id"] == test_researcher_user.org_id

    def test_me_with_different_users(self, client: TestClient, admin_headers, researcher_headers, test_admin_user, test_researcher_user):
        """Test that me endpoint returns correct user for different tokens."""
        # Admin token
        admin_response = client.get("/auth/me", headers=admin_headers)
        admin_data = admin_response.json()
        assert admin_data["id"] == test_admin_user.id

        # Researcher token
        researcher_response = client.get("/auth/me", headers=researcher_headers)
        researcher_data = researcher_response.json()
        assert researcher_data["id"] == test_researcher_user.id


@pytest.mark.api
@pytest.mark.auth
class TestAuthTokenUsage:
    """Test token usage in authenticated requests."""

    def test_token_in_authorization_header(self, client: TestClient, admin_headers):
        """Test token in Authorization header."""
        response = client.get("/auth/me", headers=admin_headers)
        assert response.status_code == 200

    def test_bearer_prefix_required(self, client: TestClient, admin_token):
        """Test that Bearer prefix is required."""
        # Without Bearer prefix
        response = client.get(
            "/auth/me",
            headers={"Authorization": admin_token}
        )
        assert response.status_code == 401

    def test_token_case_sensitive(self, client: TestClient, admin_token):
        """Test that token is case-sensitive."""
        invalid_token = admin_token.lower() if admin_token[0].isupper() else admin_token.upper()
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {invalid_token}"}
        )
        assert response.status_code == 401

    def test_different_tokens_for_different_users(self, client: TestClient, admin_token, researcher_token):
        """Test that tokens are unique per user."""
        assert admin_token != researcher_token


@pytest.mark.api
@pytest.mark.auth
class TestAuthSecurityHeaders:
    """Test security-related HTTP headers."""

    def test_cors_headers_present(self, client: TestClient):
        """Test that CORS headers are present."""
        response = client.get("/health")
        # CORS headers should be in response
        # (depends on CORS configuration)
        assert response.status_code == 200

    def test_login_response_content_type(self, client: TestClient, test_user):
        """Test that login response has correct content type."""
        response = client.post("/auth/login", data={
            "username": test_user.email,
            "password": test_user._password
        })

        assert response.headers.get("content-type") == "application/json"


@pytest.mark.api
@pytest.mark.auth
class TestAuthErrorHandling:
    """Test error handling in auth endpoints."""

    def test_register_validation_error_response(self, client: TestClient):
        """Test validation error response format."""
        response = client.post("/auth/register", json={
            "email": "invalid-email",
            "password": "pass",
            "org_name": "Org"
        })

        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_login_invalid_credentials_message(self, client: TestClient, test_user):
        """Test invalid credentials error message."""
        response = client.post("/auth/login", data={
            "username": test_user.email,
            "password": "wrongpass"
        })

        assert response.status_code == 401
        detail = response.json()["detail"]
        if isinstance(detail, dict):
            assert "invalid" in detail["message"].lower()
        else:
            assert "invalid" in detail.lower()

    def test_me_invalid_token_message(self, client: TestClient):
        """Test invalid token error message."""
        response = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid"}
        )

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data


@pytest.mark.api
@pytest.mark.auth
class TestAuthIntegration:
    """Test auth flow integration."""

    def test_full_registration_login_flow(self, client: TestClient):
        """Test complete registration and login flow."""
        # Register
        reg_response = client.post("/auth/register", json={
            "email": "testflow@test.com",
            "password": "secure123",
            "org_name": "Test Organization"
        })

        assert reg_response.status_code == 201
        reg_data = reg_response.json()
        reg_token = reg_data["access_token"]
        reg_user_from_response = reg_data["user"]

        # Use registration token to get user info
        me_response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {reg_token}"}
        )

        assert me_response.status_code == 200
        reg_user = me_response.json()

        # Login with same credentials
        login_response = client.post("/auth/login", data={
            "username": "testflow@test.com",
            "password": "secure123"
        })

        assert login_response.status_code == 200
        login_data = login_response.json()
        login_token = login_data["access_token"]
        login_user_from_response = login_data["user"]

        # Use login token to get user info
        login_me_response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {login_token}"}
        )

        assert login_me_response.status_code == 200
        login_user = login_me_response.json()

        # Should be same user in all responses
        assert reg_user["id"] == login_user["id"]
        assert reg_user["email"] == login_user["email"]
        assert reg_user_from_response["id"] == login_user_from_response["id"]
        assert reg_user_from_response["email"] == login_user_from_response["email"]


@pytest.mark.api
@pytest.mark.auth
class TestAuthRetailRegistration:
    """Test retail (individual) user registration."""

    def test_retail_registration_success(self, client: TestClient):
        """Test successful retail user registration."""
        response = client.post("/auth/register", json={
            "account_type": "retail",
            "name": "John Doe",
            "email": "john@example.com",
            "password": "SecurePass123!",
            "accept_terms": True,
            "accept_privacy": True
        })

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["user"]["email"] == "john@example.com"
        assert data["user"]["name"] == "John Doe"
        assert data["user"]["role"] == "admin"
        assert "access_token" in data
        assert "refresh_token" in data


@pytest.mark.api
@pytest.mark.auth
class TestAuthEnterpriseRegistration:
    """Test enterprise/organization registration."""

    def test_enterprise_registration_success(self, client: TestClient):
        """Test successful enterprise registration."""
        response = client.post("/auth/register", json={
            "account_type": "enterprise",
            "organization_name": "Acme Corp",
            "industry": "Technology",
            "company_size": "50-200",
            "admin_name": "Jane Smith",
            "admin_email": "jane@acme.com",
            "password": "SecurePass123!",
            "accept_terms": True,
            "accept_privacy": True
        })

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["user"]["email"] == "jane@acme.com"
        assert data["user"]["name"] == "Jane Smith"
        assert data["user"]["role"] == "admin"
        assert "access_token" in data
        assert "refresh_token" in data


@pytest.mark.api
@pytest.mark.auth
class TestAuthLoginJSON:
    """Test JSON-based login endpoint."""

    def test_login_json_success(self, client: TestClient, test_user):
        """Test successful JSON login."""
        response = client.post("/auth/login/json", json={
            "email": test_user.email,
            "password": test_user._password,
            "remember_me": False
        })

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == test_user.email
        assert data["user"]["id"] == test_user.id

    def test_login_json_with_remember_me(self, client: TestClient, test_user):
        """Test JSON login with remember_me flag."""
        response = client.post("/auth/login/json", json={
            "email": test_user.email,
            "password": test_user._password,
            "remember_me": True
        })

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    def test_login_json_invalid_credentials(self, client: TestClient, test_user):
        """Test JSON login with invalid credentials."""
        response = client.post("/auth/login/json", json={
            "email": test_user.email,
            "password": "wrongpassword"
        })

        assert response.status_code == 401
        detail = response.json()["detail"]
        if isinstance(detail, dict):
            assert "invalid" in detail["message"].lower()

    def test_login_json_case_insensitive_email(self, client: TestClient, test_user):
        """Test JSON login with uppercase email."""
        response = client.post("/auth/login/json", json={
            "email": test_user.email.upper(),
            "password": test_user._password
        })

        assert response.status_code == 200
        assert response.json()["status"] == "success"
