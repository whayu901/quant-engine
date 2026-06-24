"""
Security Utilities
Handles password hashing, token generation, and security validation
"""

import secrets
import string
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt

# Configuration
SECRET_KEY = "your-secret-key-here"  # TODO: Move to environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PasswordManager:
    """Handles password operations securely"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Any]:
        """
        Validate password strength
        Returns dict with validation results
        """
        errors = []
        warnings = []

        # Check length
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        elif len(password) < 12:
            warnings.append("Consider using a longer password (12+ characters)")

        # Check complexity
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in string.punctuation for c in password)

        if not has_upper:
            errors.append("Password must contain at least one uppercase letter")
        if not has_lower:
            errors.append("Password must contain at least one lowercase letter")
        if not has_digit:
            errors.append("Password must contain at least one digit")
        if not has_special:
            warnings.append("Consider adding special characters for better security")

        # Check for common patterns
        common_patterns = ["password", "123456", "qwerty", "abc123", "admin"]
        for pattern in common_patterns:
            if pattern.lower() in password.lower():
                errors.append(f"Password contains common pattern: {pattern}")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "strength": _calculate_strength(password)
        }

    @staticmethod
    def generate_secure_password(length: int = 16) -> str:
        """Generate a secure random password"""
        alphabet = string.ascii_letters + string.digits + string.punctuation
        return ''.join(secrets.choice(alphabet) for _ in range(length))


class TokenManager:
    """Handles JWT token operations"""

    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })

        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })

        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def verify_token(token: str, expected_type: str = "access") -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

            # Check token type
            if payload.get("type") != expected_type:
                return None

            # Check expiration
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
                return None

            return payload
        except JWTError:
            return None

    @staticmethod
    def generate_reset_token() -> str:
        """Generate secure random token for password reset"""
        return secrets.token_urlsafe(32)

    @staticmethod
    def generate_api_key() -> str:
        """Generate secure API key"""
        return secrets.token_urlsafe(32)


class SecurityValidator:
    """Validates security-related inputs"""

    @staticmethod
    def sanitize_email(email: str) -> str:
        """Sanitize and validate email address"""
        email = email.strip().lower()
        # Basic email validation
        if "@" not in email or "." not in email.split("@")[1]:
            raise ValueError("Invalid email address")
        return email

    @staticmethod
    def sanitize_username(username: str) -> str:
        """Sanitize and validate username"""
        username = username.strip().lower()

        # Check length
        if len(username) < 3 or len(username) > 30:
            raise ValueError("Username must be between 3 and 30 characters")

        # Check allowed characters
        allowed = string.ascii_lowercase + string.digits + "_-"
        if not all(c in allowed for c in username):
            raise ValueError("Username can only contain letters, numbers, underscores, and hyphens")

        return username

    @staticmethod
    def validate_ip_address(ip: str) -> bool:
        """Validate IP address format"""
        parts = ip.split(".")
        if len(parts) != 4:
            return False

        for part in parts:
            try:
                num = int(part)
                if num < 0 or num > 255:
                    return False
            except ValueError:
                return False

        return True

    @staticmethod
    def check_rate_limit(key: str, limit: int, window: int) -> bool:
        """Check if rate limit is exceeded (stub for Redis implementation)"""
        # TODO: Implement with Redis
        return False


def _calculate_strength(password: str) -> str:
    """Calculate password strength score"""
    score = 0

    # Length score
    score += min(len(password) // 4, 3)

    # Complexity score
    if any(c.isupper() for c in password):
        score += 1
    if any(c.islower() for c in password):
        score += 1
    if any(c.isdigit() for c in password):
        score += 1
    if any(c in string.punctuation for c in password):
        score += 2

    # Determine strength level
    if score < 3:
        return "weak"
    elif score < 6:
        return "medium"
    elif score < 8:
        return "strong"
    else:
        return "very_strong"