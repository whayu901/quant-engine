"""
Service Interfaces - Business Logic Contracts
These interfaces define the contract that services must implement
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.core.domain import User, Organization, AuthToken, LoginCredentials


class IAuthService(ABC):
    """Authentication service interface"""

    @abstractmethod
    async def login(self, credentials: LoginCredentials) -> Dict[str, Any]:
        """Authenticate user and return tokens"""
        pass

    @abstractmethod
    async def logout(self, token: str) -> bool:
        """Logout user and revoke token"""
        pass

    @abstractmethod
    async def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token"""
        pass

    @abstractmethod
    async def verify_token(self, token: str) -> Optional[User]:
        """Verify token and return user"""
        pass

    @abstractmethod
    async def request_password_reset(self, email: str) -> bool:
        """Request password reset"""
        pass

    @abstractmethod
    async def reset_password(self, token: str, new_password: str) -> bool:
        """Reset password using token"""
        pass

    @abstractmethod
    async def change_password(self, user_id: int, current_password: str, new_password: str) -> bool:
        """Change user password"""
        pass


class IUserService(ABC):
    """User management service interface"""

    @abstractmethod
    async def create_user(self, user_data: Dict[str, Any], created_by: User) -> User:
        """Create new user with validation"""
        pass

    @abstractmethod
    async def get_user(self, user_id: int, requesting_user: User) -> Optional[User]:
        """Get user by ID with permission check"""
        pass

    @abstractmethod
    async def update_user(self, user_id: int, update_data: Dict[str, Any], updated_by: User) -> Optional[User]:
        """Update user with permission check"""
        pass

    @abstractmethod
    async def delete_user(self, user_id: int, deleted_by: User) -> bool:
        """Delete user with permission check"""
        pass

    @abstractmethod
    async def list_users(self, filters: Dict[str, Any], requesting_user: User,
                         offset: int = 0, limit: int = 100) -> Dict[str, Any]:
        """List users with filtering and pagination"""
        pass

    @abstractmethod
    async def get_user_permissions(self, user_id: int) -> List[str]:
        """Get user permissions"""
        pass

    @abstractmethod
    async def update_user_status(self, user_id: int, status: str, updated_by: User) -> bool:
        """Update user status"""
        pass


class IOrganizationService(ABC):
    """Organization management service interface"""

    @abstractmethod
    async def create_organization(self, org_data: Dict[str, Any], created_by: User) -> Organization:
        """Create new organization"""
        pass

    @abstractmethod
    async def get_organization(self, org_id: int, requesting_user: User) -> Optional[Organization]:
        """Get organization with permission check"""
        pass

    @abstractmethod
    async def update_organization(self, org_id: int, update_data: Dict[str, Any], updated_by: User) -> Optional[Organization]:
        """Update organization with permission check"""
        pass

    @abstractmethod
    async def list_organizations(self, requesting_user: User, offset: int = 0, limit: int = 100) -> Dict[str, Any]:
        """List organizations with pagination"""
        pass

    @abstractmethod
    async def get_organization_statistics(self, org_id: int, requesting_user: User) -> Dict[str, Any]:
        """Get organization statistics"""
        pass


class INotificationService(ABC):
    """Notification service interface"""

    @abstractmethod
    async def send_welcome_email(self, user: User) -> bool:
        """Send welcome email to new user"""
        pass

    @abstractmethod
    async def send_password_reset_email(self, email: str, reset_token: str) -> bool:
        """Send password reset email"""
        pass

    @abstractmethod
    async def send_notification(self, user_id: int, message: str, notification_type: str) -> bool:
        """Send generic notification"""
        pass