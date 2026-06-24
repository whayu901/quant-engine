"""
User Repository Implementation
Handles all database operations for User entities
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy import select, update, delete, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.interfaces.repositories import IUserRepository
from app.core.domain import User, UserRole, UserStatus
from app.models import User as UserModel
from app.core.exceptions import ResourceNotFoundException


class UserRepository(IUserRepository):
    """SQLAlchemy implementation of User repository"""

    def __init__(self, db_session: AsyncSession):
        self.db = db_session

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(
            select(UserModel)
            .where(UserModel.id == user_id)
            .options(selectinload(UserModel.organization))
        )
        user_model = result.scalar_one_or_none()

        if not user_model:
            return None

        return self._to_domain(user_model)

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        result = await self.db.execute(
            select(UserModel)
            .where(UserModel.email == email.lower())
            .options(selectinload(UserModel.organization))
        )
        user_model = result.scalar_one_or_none()

        if not user_model:
            return None

        return self._to_domain(user_model)

    async def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        result = await self.db.execute(
            select(UserModel)
            .where(UserModel.username == username.lower())
            .options(selectinload(UserModel.organization))
        )
        user_model = result.scalar_one_or_none()

        if not user_model:
            return None

        return self._to_domain(user_model)

    async def create(self, user_data: Dict[str, Any]) -> User:
        """Create new user"""
        user_model = UserModel(
            email=user_data["email"].lower(),
            username=user_data["username"].lower(),
            password_hash=user_data["password_hash"],
            role=user_data["role"],
            organization_id=user_data["organization_id"],
            is_active=user_data.get("is_active", True),
            preferences=user_data.get("preferences", {})
        )

        self.db.add(user_model)
        await self.db.commit()
        await self.db.refresh(user_model)

        return self._to_domain(user_model)

    async def update(self, user_id: int, update_data: Dict[str, Any]) -> Optional[User]:
        """Update user"""
        # Build update dict
        update_dict = {}
        if "email" in update_data:
            update_dict["email"] = update_data["email"].lower()
        if "username" in update_data:
            update_dict["username"] = update_data["username"].lower()
        if "role" in update_data:
            update_dict["role"] = update_data["role"]
        if "is_active" in update_data:
            update_dict["is_active"] = update_data["is_active"]
        if "preferences" in update_data:
            update_dict["preferences"] = update_data["preferences"]

        update_dict["updated_at"] = datetime.utcnow()

        # Execute update
        await self.db.execute(
            update(UserModel)
            .where(UserModel.id == user_id)
            .values(**update_dict)
        )
        await self.db.commit()

        # Return updated user
        return await self.get_by_id(user_id)

    async def delete(self, user_id: int) -> bool:
        """Delete user"""
        result = await self.db.execute(
            delete(UserModel).where(UserModel.id == user_id)
        )
        await self.db.commit()

        return result.rowcount > 0

    async def list_by_organization(self, org_id: int, offset: int = 0, limit: int = 100) -> List[User]:
        """List users by organization"""
        result = await self.db.execute(
            select(UserModel)
            .where(UserModel.organization_id == org_id)
            .offset(offset)
            .limit(limit)
            .options(selectinload(UserModel.organization))
        )

        return [self._to_domain(user) for user in result.scalars()]

    async def update_last_login(self, user_id: int, login_time: datetime) -> None:
        """Update user's last login time"""
        await self.db.execute(
            update(UserModel)
            .where(UserModel.id == user_id)
            .values(last_login=login_time)
        )
        await self.db.commit()

    async def count_by_organization(self, org_id: int) -> int:
        """Count users in organization"""
        result = await self.db.execute(
            select(func.count(UserModel.id))
            .where(UserModel.organization_id == org_id)
        )
        return result.scalar() or 0

    def _to_domain(self, user_model: UserModel) -> User:
        """Convert SQLAlchemy model to domain entity"""
        return User(
            id=user_model.id,
            email=user_model.email,
            username=user_model.username,
            role=UserRole(user_model.role),
            organization_id=user_model.organization_id,
            status=UserStatus.ACTIVE if user_model.is_active else UserStatus.INACTIVE,
            created_at=user_model.created_at,
            updated_at=user_model.updated_at,
            last_login=user_model.last_login,
            preferences=user_model.preferences or {}
        )