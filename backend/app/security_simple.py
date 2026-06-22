from datetime import datetime, timedelta
from jose import jwt, JWTError
from .config import settings
import hashlib

ALGO = "HS256"

def hash_pw(p: str) -> str:
    """Simple hash for demo - NOT for production"""
    return hashlib.sha256(p.encode()).hexdigest()

def verify_pw(p: str, h: str) -> bool:
    """Simple verify for demo - NOT for production"""
    return hashlib.sha256(p.encode()).hexdigest() == h

def create_token(sub: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": sub, "exp": exp}, settings.secret_key, algorithm=ALGO)

def decode_token(token: str):
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGO]).get("sub")
    except JWTError:
        return None