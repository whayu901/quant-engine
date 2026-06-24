from typing import Optional
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models, security
from .database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> "models.User":
    uid = security.decode_token(token)
    if not uid:
        raise HTTPException(401, "Invalid or expired token")
    user = db.get(models.User, uid)
    if not user:
        raise HTTPException(401, "User not found")
    return user


def require_role(*roles: str):
    def _dep(user: "models.User" = Depends(get_current_user)) -> "models.User":
        if user.role not in roles:
            raise HTTPException(403, "Insufficient role")
        return user
    return _dep


def owned_or_404(db: Session, model, obj_id: str, org_id: str):
    """Multi-tenant guard: fetch a row only if it belongs to the caller's org."""
    obj = db.get(model, obj_id)
    if not obj or getattr(obj, "org_id", None) != org_id:
        raise HTTPException(404, f"{model.__name__} not found")
    return obj


async def get_current_user_ws(token: str, db: Session) -> Optional[models.User]:
    """Get current user from WebSocket token"""
    uid = security.decode_token(token)
    if not uid:
        return None

    user = db.get(models.User, uid)
    if not user or not user.is_active:
        return None

    return user
