"""
Authentication Service Implementation
Handles all authentication business logic
"""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import secrets

from app.core.interfaces.services import IAuthService
from app.core.interfaces.repositories import IUserRepository, IAuthRepository, ICacheRepository
from app.core.domain import User, AuthToken, LoginCredentials
from app.core.exceptions import (
    InvalidCredentialsException,
    TokenExpiredException,
    TokenInvalidException,
    ResourceNotFoundException,
    ValidationException
)
from app.core.security import PasswordManager, TokenManager, SecurityValidator


class AuthService(IAuthService):
    """Implementation of authentication service"""

    def __init__(self, user_repo: IUserRepository, auth_repo: IAuthRepository, cache_repo: Optional[ICacheRepository] = None):
        self.user_repo = user_repo
        self.auth_repo = auth_repo
        self.cache_repo = cache_repo
        self.password_manager = PasswordManager()
        self.token_manager = TokenManager()
        self.validator = SecurityValidator()

    async def login(self, credentials: LoginCredentials) -> Dict[str, Any]:
        """Authenticate user and return tokens"""
        # Validate credentials format
        if not credentials.validate():
            raise ValidationException("Invalid credentials format")

        # Sanitize username
        username = self.validator.sanitize_username(credentials.username)

        # Try to find user by username or email
        user = await self.user_repo.get_by_username(username)
        if not user:
            user = await self.user_repo.get_by_email(username)

        if not user:
            raise InvalidCredentialsException()

        # Verify password
        is_valid = await self.auth_repo.verify_password(user.id, credentials.password)
        if not is_valid:
            raise InvalidCredentialsException()

        # Check if user is active
        if not user.is_active():
            raise ValidationException("Account is not active")

        # Generate tokens
        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "role": user.role.value,
            "org_id": user.organization_id
        }

        access_token = self.token_manager.create_access_token(token_data)
        refresh_token = self.token_manager.create_refresh_token(token_data)

        # Store tokens
        auth_token = AuthToken(
            access_token=access_token,
            refresh_token=refresh_token,
            user_id=user.id
        )
        await self.auth_repo.store_token(user.id, auth_token)

        # Update last login
        await self.user_repo.update_last_login(user.id, datetime.utcnow())

        # Cache user data if cache available
        if self.cache_repo:
            cache_key = f"user:{user.id}"
            await self.cache_repo.set(cache_key, user.__dict__, ttl=3600)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer",
            "expires_in": 3600,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role.value,
                "organization_id": user.organization_id,
                "permissions": user.get_permissions()
            }
        }

    async def logout(self, token: str) -> bool:
        """Logout user and revoke token"""
        # Verify token first
        payload = self.token_manager.verify_token(token)
        if not payload:
            raise TokenInvalidException()

        # Revoke token
        await self.auth_repo.revoke_token(token)

        # Clear cache if available
        if self.cache_repo:
            user_id = payload.get("sub")
            if user_id:
                cache_key = f"user:{user_id}"
                await self.cache_repo.delete(cache_key)

        return True

    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token"""
        # Verify refresh token
        payload = self.token_manager.verify_token(refresh_token, expected_type="refresh")
        if not payload:
            raise TokenInvalidException()

        # Check if token is revoked
        is_revoked = await self.auth_repo.is_token_revoked(refresh_token)
        if is_revoked:
            raise TokenInvalidException()

        # Get user
        user_id = int(payload.get("sub"))
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise ResourceNotFoundException("User", user_id)

        # Check if user is still active
        if not user.is_active():
            raise ValidationException("Account is not active")

        # Generate new access token
        token_data = {
            "sub": str(user.id),
            "username": user.username,
            "role": user.role.value,
            "org_id": user.organization_id
        }

        new_access_token = self.token_manager.create_access_token(token_data)

        return {
            "access_token": new_access_token,
            "refresh_token": refresh_token,  # Keep same refresh token
            "token_type": "Bearer",
            "expires_in": 3600
        }

    async def verify_token(self, token: str) -> Optional[User]:
        """Verify token and return user"""
        # Verify token format and expiration
        payload = self.token_manager.verify_token(token)
        if not payload:
            return None

        # Check if token is revoked
        is_revoked = await self.auth_repo.is_token_revoked(token)
        if is_revoked:
            return None

        # Get user from cache if available
        user_id = int(payload.get("sub"))

        if self.cache_repo:
            cache_key = f"user:{user_id}"
            cached_user = await self.cache_repo.get(cache_key)
            if cached_user:
                return User(**cached_user)

        # Get from database
        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active():
            return None

        # Cache user data
        if self.cache_repo:
            cache_key = f"user:{user_id}"
            await self.cache_repo.set(cache_key, user.__dict__, ttl=3600)

        return user

    async def request_password_reset(self, email: str) -> bool:
        """Request password reset"""
        # Sanitize email
        email = self.validator.sanitize_email(email)

        # Check if user exists
        user = await self.user_repo.get_by_email(email)
        if not user:
            # Return true anyway to prevent email enumeration
            return True

        # Generate reset token
        reset_token = self.token_manager.generate_reset_token()

        # Store reset request (expires in 1 hour)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        await self.auth_repo.create_reset_request(email, reset_token, expires_at)

        # TODO: Send email with reset token
        # await self.notification_service.send_password_reset_email(email, reset_token)

        return True

    async def reset_password(self, token: str, new_password: str) -> bool:
        """Reset password using token"""
        # Validate password strength
        validation = self.password_manager.validate_password_strength(new_password)
        if not validation["valid"]:
            raise ValidationException("Password does not meet requirements", validation)

        # Get reset request
        reset_request = await self.auth_repo.get_reset_request(token)
        if not reset_request or not reset_request.is_valid():
            raise TokenInvalidException()

        # Get user
        user = await self.user_repo.get_by_email(reset_request.email)
        if not user:
            raise ResourceNotFoundException("User", reset_request.email)

        # Hash new password
        password_hash = self.password_manager.hash_password(new_password)

        # Update password
        success = await self.auth_repo.update_password(user.id, password_hash)

        # Mark reset as used
        if success:
            await self.auth_repo.mark_reset_used(token)

        return success

    async def change_password(self, user_id: int, current_password: str, new_password: str) -> bool:
        """Change user password"""
        # Validate new password strength
        validation = self.password_manager.validate_password_strength(new_password)
        if not validation["valid"]:
            raise ValidationException("Password does not meet requirements", validation)

        # Verify current password
        is_valid = await self.auth_repo.verify_password(user_id, current_password)
        if not is_valid:
            raise InvalidCredentialsException()

        # Hash new password
        password_hash = self.password_manager.hash_password(new_password)

        # Update password
        return await self.auth_repo.update_password(user_id, password_hash)