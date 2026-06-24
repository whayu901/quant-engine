"""
Repository Interfaces - Contracts for Data Access
These interfaces define the contract that repositories must implement
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.core.domain import User, Organization, AuthToken, LoginCredentials, PasswordResetRequest


class IUserRepository(ABC):
    """User repository interface"""

    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        pass

    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        pass

    @abstractmethod
    async def create(self, user_data: Dict[str, Any]) -> User:
        """Create new user"""
        pass

    @abstractmethod
    async def update(self, user_id: int, update_data: Dict[str, Any]) -> Optional[User]:
        """Update user"""
        pass

    @abstractmethod
    async def delete(self, user_id: int) -> bool:
        """Delete user"""
        pass

    @abstractmethod
    async def list_by_organization(self, org_id: int, offset: int = 0, limit: int = 100) -> List[User]:
        """List users by organization"""
        pass

    @abstractmethod
    async def update_last_login(self, user_id: int, login_time: datetime) -> None:
        """Update user's last login time"""
        pass

    @abstractmethod
    async def count_by_organization(self, org_id: int) -> int:
        """Count users in organization"""
        pass


class IOrganizationRepository(ABC):
    """Organization repository interface"""

    @abstractmethod
    async def get_by_id(self, org_id: int) -> Optional[Organization]:
        """Get organization by ID"""
        pass

    @abstractmethod
    async def get_by_name(self, name: str) -> Optional[Organization]:
        """Get organization by name"""
        pass

    @abstractmethod
    async def create(self, org_data: Dict[str, Any]) -> Organization:
        """Create new organization"""
        pass

    @abstractmethod
    async def update(self, org_id: int, update_data: Dict[str, Any]) -> Optional[Organization]:
        """Update organization"""
        pass

    @abstractmethod
    async def list_all(self, offset: int = 0, limit: int = 100) -> List[Organization]:
        """List all organizations"""
        pass

    @abstractmethod
    async def count_projects(self, org_id: int) -> int:
        """Count projects in organization"""
        pass


class IAuthRepository(ABC):
    """Authentication repository interface"""

    @abstractmethod
    async def verify_password(self, user_id: int, password: str) -> bool:
        """Verify user password"""
        pass

    @abstractmethod
    async def update_password(self, user_id: int, new_password: str) -> bool:
        """Update user password"""
        pass

    @abstractmethod
    async def store_token(self, user_id: int, token: AuthToken) -> bool:
        """Store authentication token"""
        pass

    @abstractmethod
    async def revoke_token(self, token: str) -> bool:
        """Revoke authentication token"""
        pass

    @abstractmethod
    async def is_token_revoked(self, token: str) -> bool:
        """Check if token is revoked"""
        pass

    @abstractmethod
    async def create_reset_request(self, email: str, token: str, expires_at: datetime) -> PasswordResetRequest:
        """Create password reset request"""
        pass

    @abstractmethod
    async def get_reset_request(self, token: str) -> Optional[PasswordResetRequest]:
        """Get password reset request by token"""
        pass

    @abstractmethod
    async def mark_reset_used(self, token: str) -> bool:
        """Mark reset request as used"""
        pass


class ICacheRepository(ABC):
    """Cache repository interface"""

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        pass

    @abstractmethod
    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL"""
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        pass

    @abstractmethod
    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        pass