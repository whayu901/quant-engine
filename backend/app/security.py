from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from .config import settings
import os
import secrets

# Use bcrypt for secure password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGO = "HS256"


def hash_pw(p: str) -> str:
    """Hash password using bcrypt with salt"""
    return pwd_context.hash(p)


def verify_pw(p: str, h: str) -> bool:
    """Verify password against bcrypt hash"""
    try:
        return pwd_context.verify(p, h)
    except Exception:
        # Handle potential issues with legacy SHA256 hashes
        # This allows gradual migration from SHA256 to bcrypt
        import hashlib
        if len(h) == 64:  # SHA256 produces 64 char hex string
            return hashlib.sha256(p.encode()).hexdigest() == h
        return False


def create_token(sub: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": sub, "exp": exp}, settings.secret_key, algorithm=ALGO)


def decode_token(token: str):
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGO]).get("sub")
    except JWTError:
        return None
