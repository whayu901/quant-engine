"""
Authentication Controller
Handles HTTP requests and responses for authentication endpoints
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field

from app.core.domain import LoginCredentials, User
from app.core.interfaces.services import IAuthService
from app.core.exceptions import (
    InvalidCredentialsException,
    TokenInvalidException,
    ValidationException,
    ResourceNotFoundException,
    DomainException
)


# Request/Response models
class LoginRequest(BaseModel):
    """Login request model"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    remember_me: bool = False


class LoginResponse(BaseModel):
    """Login response model"""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int
    user: Dict[str, Any]


class RefreshTokenRequest(BaseModel):
    """Refresh token request model"""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Refresh token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int


class PasswordResetRequest(BaseModel):
    """Password reset request model"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation model"""
    token: str
    new_password: str = Field(..., min_length=8)


class ChangePasswordRequest(BaseModel):
    """Change password request model"""
    current_password: str
    new_password: str = Field(..., min_length=8)


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


# Security
security = HTTPBearer()


class AuthController:
    """Authentication controller handling HTTP layer"""

    def __init__(self, auth_service: IAuthService):
        self.auth_service = auth_service
        self.router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
        self._setup_routes()

    def _setup_routes(self):
        """Setup controller routes"""
        self.router.post("/login", response_model=LoginResponse)(self.login)
        self.router.post("/logout", response_model=MessageResponse)(self.logout)
        self.router.post("/refresh", response_model=RefreshTokenResponse)(self.refresh_token)
        self.router.post("/password/reset", response_model=MessageResponse)(self.request_password_reset)
        self.router.post("/password/reset/confirm", response_model=MessageResponse)(self.reset_password)
        self.router.post("/password/change", response_model=MessageResponse)(self.change_password)
        self.router.get("/me")(self.get_current_user)

    async def login(self, request: LoginRequest, req: Request) -> LoginResponse:
        """
        Login endpoint

        Authenticates user with username/email and password
        Returns access and refresh tokens
        """
        try:
            # Create credentials object
            credentials = LoginCredentials(
                username=request.username,
                password=request.password,
                remember_me=request.remember_me,
                ip_address=req.client.host if req.client else None,
                user_agent=req.headers.get("User-Agent")
            )

            # Authenticate
            result = await self.auth_service.login(credentials)

            return LoginResponse(**result)

        except InvalidCredentialsException:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password"
            )
        except ValidationException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=e.message
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication failed"
            )

    async def logout(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> MessageResponse:
        """
        Logout endpoint

        Revokes the current access token
        """
        try:
            token = credentials.credentials
            success = await self.auth_service.logout(token)

            if success:
                return MessageResponse(message="Logged out successfully")
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Logout failed"
                )

        except TokenInvalidException:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Logout failed"
            )

    async def refresh_token(self, request: RefreshTokenRequest) -> RefreshTokenResponse:
        """
        Refresh token endpoint

        Exchanges refresh token for new access token
        """
        try:
            result = await self.auth_service.refresh_token(request.refresh_token)
            return RefreshTokenResponse(**result)

        except TokenInvalidException:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        except ResourceNotFoundException:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token refresh failed"
            )

    async def request_password_reset(self, request: PasswordResetRequest) -> MessageResponse:
        """
        Request password reset endpoint

        Sends password reset email to user
        """
        try:
            # Always return success to prevent email enumeration
            await self.auth_service.request_password_reset(request.email)
            return MessageResponse(
                message="If an account exists with this email, a password reset link has been sent"
            )

        except Exception:
            # Still return success message
            return MessageResponse(
                message="If an account exists with this email, a password reset link has been sent"
            )

    async def reset_password(self, request: PasswordResetConfirm) -> MessageResponse:
        """
        Reset password endpoint

        Resets password using reset token
        """
        try:
            success = await self.auth_service.reset_password(
                request.token,
                request.new_password
            )

            if success:
                return MessageResponse(message="Password reset successfully")
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password reset failed"
                )

        except TokenInvalidException:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        except ValidationException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=e.message
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Password reset failed"
            )

    async def change_password(
        self,
        request: ChangePasswordRequest,
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> MessageResponse:
        """
        Change password endpoint

        Changes password for authenticated user
        """
        try:
            # Verify token and get user
            token = credentials.credentials
            user = await self.auth_service.verify_token(token)

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )

            # Change password
            success = await self.auth_service.change_password(
                user.id,
                request.current_password,
                request.new_password
            )

            if success:
                return MessageResponse(message="Password changed successfully")
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password change failed"
                )

        except InvalidCredentialsException:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )
        except ValidationException as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=e.message
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Password change failed"
            )

    async def get_current_user(
        self,
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> Dict[str, Any]:
        """
        Get current user endpoint

        Returns current authenticated user info
        """
        try:
            token = credentials.credentials
            user = await self.auth_service.verify_token(token)

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )

            return {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role.value,
                "organization_id": user.organization_id,
                "permissions": user.get_permissions(),
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "created_at": user.created_at.isoformat()
            }

        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )


# Dependency injection helper
async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: IAuthService = Depends()  # Will be injected
) -> User:
    """
    Dependency for getting current authenticated user
    Use this in other controllers that need authentication
    """
    token = credentials.credentials
    user = await auth_service.verify_token(token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user