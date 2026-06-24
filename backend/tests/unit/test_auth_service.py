"""
Unit Tests for Authentication Service
Tests business logic without external dependencies
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Optional

from app.core.domain import User, UserRole, UserStatus, LoginCredentials, AuthToken
from app.core.exceptions import (
    InvalidCredentialsException,
    TokenInvalidException,
    ValidationException,
    ResourceNotFoundException
)
from app.services.auth_service import AuthService


@pytest.fixture
def mock_user_repo():
    """Create mock user repository"""
    repo = AsyncMock()
    return repo


@pytest.fixture
def mock_auth_repo():
    """Create mock auth repository"""
    repo = AsyncMock()
    return repo


@pytest.fixture
def mock_cache_repo():
    """Create mock cache repository"""
    repo = AsyncMock()
    return repo


@pytest.fixture
def auth_service(mock_user_repo, mock_auth_repo, mock_cache_repo):
    """Create auth service with mocked dependencies"""
    return AuthService(mock_user_repo, mock_auth_repo, mock_cache_repo)


@pytest.fixture
def sample_user():
    """Create sample user for testing"""
    return User(
        id=1,
        email="test@example.com",
        username="testuser",
        role=UserRole.RESEARCHER,
        organization_id=1,
        status=UserStatus.ACTIVE,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        last_login=None,
        preferences={}
    )


class TestAuthServiceLogin:
    """Test login functionality"""

    @pytest.mark.asyncio
    async def test_login_success(self, auth_service, mock_user_repo, mock_auth_repo, mock_cache_repo, sample_user):
        """Test successful login"""
        # Arrange
        credentials = LoginCredentials(
            username="testuser",
            password="ValidPass123!",
            remember_me=False
        )

        mock_user_repo.get_by_username.return_value = sample_user
        mock_auth_repo.verify_password.return_value = True
        mock_auth_repo.store_token.return_value = True

        # Act
        result = await auth_service.login(credentials)

        # Assert
        assert "access_token" in result
        assert "refresh_token" in result
        assert result["token_type"] == "Bearer"
        assert result["user"]["id"] == sample_user.id
        assert result["user"]["role"] == sample_user.role.value

        # Verify calls
        mock_user_repo.get_by_username.assert_called_once_with("testuser")
        mock_auth_repo.verify_password.assert_called_once_with(sample_user.id, credentials.password)
        mock_user_repo.update_last_login.assert_called_once()
        mock_cache_repo.set.assert_called_once()

    @pytest.mark.asyncio
    async def test_login_invalid_credentials(self, auth_service, mock_user_repo, mock_auth_repo):
        """Test login with invalid credentials"""
        # Arrange
        credentials = LoginCredentials(
            username="testuser",
            password="WrongPassword",
            remember_me=False
        )

        mock_user_repo.get_by_username.return_value = None

        # Act & Assert
        with pytest.raises(InvalidCredentialsException):
            await auth_service.login(credentials)

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, auth_service, mock_user_repo, mock_auth_repo, sample_user):
        """Test login with wrong password"""
        # Arrange
        credentials = LoginCredentials(
            username="testuser",
            password="WrongPassword",
            remember_me=False
        )

        mock_user_repo.get_by_username.return_value = sample_user
        mock_auth_repo.verify_password.return_value = False

        # Act & Assert
        with pytest.raises(InvalidCredentialsException):
            await auth_service.login(credentials)

    @pytest.mark.asyncio
    async def test_login_inactive_user(self, auth_service, mock_user_repo, mock_auth_repo, sample_user):
        """Test login with inactive user"""
        # Arrange
        credentials = LoginCredentials(
            username="testuser",
            password="ValidPass123!",
            remember_me=False
        )

        sample_user.status = UserStatus.INACTIVE
        mock_user_repo.get_by_username.return_value = sample_user
        mock_auth_repo.verify_password.return_value = True

        # Act & Assert
        with pytest.raises(ValidationException) as exc_info:
            await auth_service.login(credentials)

        assert "not active" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_login_with_email(self, auth_service, mock_user_repo, mock_auth_repo, sample_user):
        """Test login using email instead of username"""
        # Arrange
        credentials = LoginCredentials(
            username="test@example.com",
            password="ValidPass123!",
            remember_me=False
        )

        mock_user_repo.get_by_username.return_value = None
        mock_user_repo.get_by_email.return_value = sample_user
        mock_auth_repo.verify_password.return_value = True

        # Act
        result = await auth_service.login(credentials)

        # Assert
        assert "access_token" in result
        mock_user_repo.get_by_email.assert_called_once()


class TestAuthServiceLogout:
    """Test logout functionality"""

    @pytest.mark.asyncio
    async def test_logout_success(self, auth_service, mock_auth_repo, mock_cache_repo):
        """Test successful logout"""
        # Arrange
        token = "valid_token"

        with patch.object(auth_service.token_manager, 'verify_token') as mock_verify:
            mock_verify.return_value = {"sub": "1", "username": "testuser"}
            mock_auth_repo.revoke_token.return_value = True

            # Act
            result = await auth_service.logout(token)

            # Assert
            assert result is True
            mock_auth_repo.revoke_token.assert_called_once_with(token)
            mock_cache_repo.delete.assert_called_once_with("user:1")

    @pytest.mark.asyncio
    async def test_logout_invalid_token(self, auth_service):
        """Test logout with invalid token"""
        # Arrange
        token = "invalid_token"

        with patch.object(auth_service.token_manager, 'verify_token') as mock_verify:
            mock_verify.return_value = None

            # Act & Assert
            with pytest.raises(TokenInvalidException):
                await auth_service.logout(token)


class TestAuthServiceTokenRefresh:
    """Test token refresh functionality"""

    @pytest.mark.asyncio
    async def test_refresh_token_success(self, auth_service, mock_user_repo, mock_auth_repo, sample_user):
        """Test successful token refresh"""
        # Arrange
        refresh_token = "valid_refresh_token"

        with patch.object(auth_service.token_manager, 'verify_token') as mock_verify:
            mock_verify.return_value = {
                "sub": "1",
                "username": "testuser",
                "type": "refresh"
            }
            mock_auth_repo.is_token_revoked.return_value = False
            mock_user_repo.get_by_id.return_value = sample_user

            # Act
            result = await auth_service.refresh_token(refresh_token)

            # Assert
            assert "access_token" in result
            assert result["refresh_token"] == refresh_token
            mock_user_repo.get_by_id.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_refresh_token_revoked(self, auth_service, mock_auth_repo):
        """Test refresh with revoked token"""
        # Arrange
        refresh_token = "revoked_token"

        with patch.object(auth_service.token_manager, 'verify_token') as mock_verify:
            mock_verify.return_value = {"sub": "1", "type": "refresh"}
            mock_auth_repo.is_token_revoked.return_value = True

            # Act & Assert
            with pytest.raises(TokenInvalidException):
                await auth_service.refresh_token(refresh_token)

    @pytest.mark.asyncio
    async def test_refresh_token_user_not_found(self, auth_service, mock_user_repo, mock_auth_repo):
        """Test refresh when user no longer exists"""
        # Arrange
        refresh_token = "valid_refresh_token"

        with patch.object(auth_service.token_manager, 'verify_token') as mock_verify:
            mock_verify.return_value = {"sub": "1", "type": "refresh"}
            mock_auth_repo.is_token_revoked.return_value = False
            mock_user_repo.get_by_id.return_value = None

            # Act & Assert
            with pytest.raises(ResourceNotFoundException):
                await auth_service.refresh_token(refresh_token)


class TestAuthServicePasswordReset:
    """Test password reset functionality"""

    @pytest.mark.asyncio
    async def test_request_password_reset_success(self, auth_service, mock_user_repo, mock_auth_repo, sample_user):
        """Test successful password reset request"""
        # Arrange
        email = "test@example.com"
        mock_user_repo.get_by_email.return_value = sample_user

        # Act
        result = await auth_service.request_password_reset(email)

        # Assert
        assert result is True
        mock_auth_repo.create_reset_request.assert_called_once()

    @pytest.mark.asyncio
    async def test_request_password_reset_user_not_found(self, auth_service, mock_user_repo):
        """Test password reset for non-existent user (should still return success)"""
        # Arrange
        email = "nonexistent@example.com"
        mock_user_repo.get_by_email.return_value = None

        # Act
        result = await auth_service.request_password_reset(email)

        # Assert (returns True to prevent email enumeration)
        assert result is True

    @pytest.mark.asyncio
    async def test_reset_password_success(self, auth_service, mock_user_repo, mock_auth_repo, sample_user):
        """Test successful password reset"""
        # Arrange
        token = "reset_token"
        new_password = "NewSecurePass123!"

        reset_request = MagicMock()
        reset_request.is_valid.return_value = True
        reset_request.email = sample_user.email

        mock_auth_repo.get_reset_request.return_value = reset_request
        mock_user_repo.get_by_email.return_value = sample_user
        mock_auth_repo.update_password.return_value = True

        # Act
        result = await auth_service.reset_password(token, new_password)

        # Assert
        assert result is True
        mock_auth_repo.update_password.assert_called_once()
        mock_auth_repo.mark_reset_used.assert_called_once_with(token)

    @pytest.mark.asyncio
    async def test_reset_password_weak_password(self, auth_service):
        """Test password reset with weak password"""
        # Arrange
        token = "reset_token"
        weak_password = "weak"

        # Act & Assert
        with pytest.raises(ValidationException) as exc_info:
            await auth_service.reset_password(token, weak_password)

        assert "requirements" in str(exc_info.value)


class TestAuthServicePasswordChange:
    """Test password change functionality"""

    @pytest.mark.asyncio
    async def test_change_password_success(self, auth_service, mock_auth_repo):
        """Test successful password change"""
        # Arrange
        user_id = 1
        current_password = "CurrentPass123!"
        new_password = "NewSecurePass456!"

        mock_auth_repo.verify_password.return_value = True
        mock_auth_repo.update_password.return_value = True

        # Act
        result = await auth_service.change_password(user_id, current_password, new_password)

        # Assert
        assert result is True
        mock_auth_repo.verify_password.assert_called_once_with(user_id, current_password)
        mock_auth_repo.update_password.assert_called_once()

    @pytest.mark.asyncio
    async def test_change_password_wrong_current(self, auth_service, mock_auth_repo):
        """Test password change with wrong current password"""
        # Arrange
        user_id = 1
        wrong_password = "WrongPass123!"
        new_password = "NewSecurePass456!"

        mock_auth_repo.verify_password.return_value = False

        # Act & Assert
        with pytest.raises(InvalidCredentialsException):
            await auth_service.change_password(user_id, wrong_password, new_password)


class TestAuthServiceTokenVerification:
    """Test token verification functionality"""

    @pytest.mark.asyncio
    async def test_verify_token_success(self, auth_service, mock_user_repo, mock_auth_repo, mock_cache_repo, sample_user):
        """Test successful token verification"""
        # Arrange
        token = "valid_token"

        with patch.object(auth_service.token_manager, 'verify_token') as mock_verify:
            mock_verify.return_value = {"sub": "1", "username": "testuser"}
            mock_auth_repo.is_token_revoked.return_value = False
            mock_cache_repo.get.return_value = None  # No cache
            mock_user_repo.get_by_id.return_value = sample_user

            # Act
            result = await auth_service.verify_token(token)

            # Assert
            assert result is not None
            assert result.id == sample_user.id
            mock_cache_repo.set.assert_called_once()  # Should cache user

    @pytest.mark.asyncio
    async def test_verify_token_from_cache(self, auth_service, mock_cache_repo, sample_user):
        """Test token verification with cached user"""
        # Arrange
        token = "valid_token"
        cached_data = sample_user.__dict__

        with patch.object(auth_service.token_manager, 'verify_token') as mock_verify:
            mock_verify.return_value = {"sub": "1", "username": "testuser"}
            mock_cache_repo.get.return_value = cached_data

            # Act
            result = await auth_service.verify_token(token)

            # Assert
            assert result is not None
            assert result.id == sample_user.id

    @pytest.mark.asyncio
    async def test_verify_token_invalid(self, auth_service):
        """Test verification of invalid token"""
        # Arrange
        token = "invalid_token"

        with patch.object(auth_service.token_manager, 'verify_token') as mock_verify:
            mock_verify.return_value = None

            # Act
            result = await auth_service.verify_token(token)

            # Assert
            assert result is None