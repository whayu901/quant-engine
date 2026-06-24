"""
Core Domain Models - Business Logic and Entities
These models are framework-agnostic and contain pure business logic
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, field


class UserRole(str, Enum):
    """User role enumeration"""
    ADMIN = "admin"
    ORG_ADMIN = "org_admin"
    RESEARCHER = "researcher"
    CLIENT = "client"


class UserStatus(str, Enum):
    """User status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


@dataclass
class Organization:
    """Organization domain entity"""
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    settings: Dict[str, Any] = field(default_factory=dict)

    def can_create_users(self, current_user_count: int, limit: int = 100) -> bool:
        """Check if organization can create more users"""
        return current_user_count < limit and self.is_active

    def can_create_projects(self, current_project_count: int, limit: int = 50) -> bool:
        """Check if organization can create more projects"""
        return current_project_count < limit and self.is_active


@dataclass
class User:
    """User domain entity with business logic"""
    id: int
    email: str
    username: str
    role: UserRole
    organization_id: int
    status: UserStatus
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    preferences: Dict[str, Any] = field(default_factory=dict)

    def can_access_project(self, project_org_id: int) -> bool:
        """Check if user can access a project"""
        if self.role == UserRole.ADMIN:
            return True
        return project_org_id == self.organization_id

    def can_manage_users(self) -> bool:
        """Check if user can manage other users"""
        return self.role in [UserRole.ADMIN, UserRole.ORG_ADMIN]

    def can_delete_projects(self) -> bool:
        """Check if user can delete projects"""
        return self.role in [UserRole.ADMIN, UserRole.ORG_ADMIN]

    def can_view_analytics(self) -> bool:
        """Check if user can view analytics"""
        return self.role != UserRole.CLIENT

    def is_active(self) -> bool:
        """Check if user is active"""
        return self.status == UserStatus.ACTIVE

    def get_permissions(self) -> List[str]:
        """Get user permissions based on role"""
        permissions_map = {
            UserRole.ADMIN: [
                "manage_all_organizations",
                "manage_all_users",
                "manage_all_projects",
                "view_all_analytics",
                "system_configuration"
            ],
            UserRole.ORG_ADMIN: [
                "manage_organization_users",
                "manage_organization_projects",
                "view_organization_analytics",
                "manage_organization_settings"
            ],
            UserRole.RESEARCHER: [
                "create_projects",
                "manage_own_projects",
                "view_analytics",
                "export_data"
            ],
            UserRole.CLIENT: [
                "view_assigned_projects",
                "comment_on_projects",
                "download_reports"
            ]
        }
        return permissions_map.get(self.role, [])


@dataclass
class AuthToken:
    """Authentication token domain entity"""
    access_token: str
    refresh_token: Optional[str]
    token_type: str = "Bearer"
    expires_in: int = 3600
    user_id: int = 0
    issued_at: datetime = field(default_factory=datetime.utcnow)

    def is_expired(self) -> bool:
        """Check if token is expired"""
        elapsed = (datetime.utcnow() - self.issued_at).total_seconds()
        return elapsed > self.expires_in

    def remaining_time(self) -> int:
        """Get remaining time in seconds"""
        elapsed = (datetime.utcnow() - self.issued_at).total_seconds()
        remaining = self.expires_in - elapsed
        return max(0, int(remaining))


@dataclass
class LoginCredentials:
    """Login credentials value object"""
    username: str
    password: str
    remember_me: bool = False
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    def validate(self) -> bool:
        """Validate credentials format"""
        if not self.username or not self.password:
            return False
        if len(self.password) < 8:
            return False
        return True


@dataclass
class PasswordResetRequest:
    """Password reset request domain entity"""
    email: str
    token: str
    expires_at: datetime
    used: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)

    def is_valid(self) -> bool:
        """Check if reset request is valid"""
        if self.used:
            return False
        return datetime.utcnow() < self.expires_at