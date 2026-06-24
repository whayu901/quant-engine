"""
Unit Tests for Security Utilities
Tests password hashing, token generation, and validation
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import patch
import string

from app.core.security import PasswordManager, TokenManager, SecurityValidator


class TestPasswordManager:
    """Test password management functionality"""

    def test_hash_password(self):
        """Test password hashing"""
        # Arrange
        password = "SecurePassword123!"
        manager = PasswordManager()

        # Act
        hashed = manager.hash_password(password)

        # Assert
        assert hashed != password
        assert len(hashed) > 50  # Bcrypt hashes are long
        assert hashed.startswith("$2b$")  # Bcrypt prefix

    def test_verify_password_correct(self):
        """Test verifying correct password"""
        # Arrange
        password = "SecurePassword123!"
        manager = PasswordManager()
        hashed = manager.hash_password(password)

        # Act
        is_valid = manager.verify_password(password, hashed)

        # Assert
        assert is_valid is True

    def test_verify_password_incorrect(self):
        """Test verifying incorrect password"""
        # Arrange
        password = "SecurePassword123!"
        wrong_password = "WrongPassword456!"
        manager = PasswordManager()
        hashed = manager.hash_password(password)

        # Act
        is_valid = manager.verify_password(wrong_password, hashed)

        # Assert
        assert is_valid is False

    def test_validate_password_strength_strong(self):
        """Test validation of strong password"""
        # Arrange
        password = "StrongPass123!@#"
        manager = PasswordManager()

        # Act
        result = manager.validate_password_strength(password)

        # Assert
        assert result["valid"] is True
        assert len(result["errors"]) == 0
        assert result["strength"] in ["strong", "very_strong"]

    def test_validate_password_strength_weak(self):
        """Test validation of weak password"""
        # Arrange
        password = "weak"
        manager = PasswordManager()

        # Act
        result = manager.validate_password_strength(password)

        # Assert
        assert result["valid"] is False
        assert "at least 8 characters" in result["errors"][0]
        assert result["strength"] == "weak"

    def test_validate_password_no_uppercase(self):
        """Test password without uppercase letters"""
        # Arrange
        password = "lowercase123!"
        manager = PasswordManager()

        # Act
        result = manager.validate_password_strength(password)

        # Assert
        assert result["valid"] is False
        assert any("uppercase" in error for error in result["errors"])

    def test_validate_password_no_digit(self):
        """Test password without digits"""
        # Arrange
        password = "NoDigitsHere!"
        manager = PasswordManager()

        # Act
        result = manager.validate_password_strength(password)

        # Assert
        assert result["valid"] is False
        assert any("digit" in error for error in result["errors"])

    def test_validate_password_common_pattern(self):
        """Test password with common pattern"""
        # Arrange
        password = "Password123!"
        manager = PasswordManager()

        # Act
        result = manager.validate_password_strength(password)

        # Assert
        assert result["valid"] is False
        assert any("common pattern" in error for error in result["errors"])

    def test_generate_secure_password(self):
        """Test secure password generation"""
        # Arrange
        manager = PasswordManager()
        length = 20

        # Act
        password = manager.generate_secure_password(length)

        # Assert
        assert len(password) == length
        assert any(c.isupper() for c in password)
        assert any(c.islower() for c in password)
        assert any(c.isdigit() for c in password)
        assert any(c in string.punctuation for c in password)


class TestTokenManager:
    """Test token management functionality"""

    def test_create_access_token(self):
        """Test access token creation"""
        # Arrange
        manager = TokenManager()
        data = {"sub": "1", "username": "testuser"}

        # Act
        token = manager.create_access_token(data)

        # Assert
        assert token is not None
        assert len(token) > 50
        assert "." in token  # JWT format

    def test_create_refresh_token(self):
        """Test refresh token creation"""
        # Arrange
        manager = TokenManager()
        data = {"sub": "1", "username": "testuser"}

        # Act
        token = manager.create_refresh_token(data)

        # Assert
        assert token is not None
        assert len(token) > 50
        assert "." in token  # JWT format

    def test_verify_valid_access_token(self):
        """Test verification of valid access token"""
        # Arrange
        manager = TokenManager()
        data = {"sub": "1", "username": "testuser"}
        token = manager.create_access_token(data)

        # Act
        payload = manager.verify_token(token, expected_type="access")

        # Assert
        assert payload is not None
        assert payload["sub"] == "1"
        assert payload["username"] == "testuser"
        assert payload["type"] == "access"

    def test_verify_expired_token(self):
        """Test verification of expired token"""
        # Arrange
        manager = TokenManager()
        data = {"sub": "1", "username": "testuser"}

        # Create token with negative expiry
        with patch('app.core.security.datetime') as mock_datetime:
            mock_datetime.utcnow.return_value = datetime.utcnow() - timedelta(hours=2)
            token = manager.create_access_token(data, expires_delta=timedelta(hours=1))

        # Act
        payload = manager.verify_token(token)

        # Assert
        assert payload is None

    def test_verify_wrong_token_type(self):
        """Test verification with wrong token type"""
        # Arrange
        manager = TokenManager()
        data = {"sub": "1", "username": "testuser"}
        refresh_token = manager.create_refresh_token(data)

        # Act
        payload = manager.verify_token(refresh_token, expected_type="access")

        # Assert
        assert payload is None

    def test_verify_invalid_token(self):
        """Test verification of invalid token"""
        # Arrange
        manager = TokenManager()
        invalid_token = "invalid.token.here"

        # Act
        payload = manager.verify_token(invalid_token)

        # Assert
        assert payload is None

    def test_generate_reset_token(self):
        """Test reset token generation"""
        # Arrange
        manager = TokenManager()

        # Act
        token = manager.generate_reset_token()

        # Assert
        assert token is not None
        assert len(token) > 30
        assert isinstance(token, str)

    def test_generate_api_key(self):
        """Test API key generation"""
        # Arrange
        manager = TokenManager()

        # Act
        api_key = manager.generate_api_key()

        # Assert
        assert api_key is not None
        assert len(api_key) > 30
        assert isinstance(api_key, str)


class TestSecurityValidator:
    """Test security validation functionality"""

    def test_sanitize_email_valid(self):
        """Test sanitizing valid email"""
        # Arrange
        validator = SecurityValidator()
        email = "  Test@Example.COM  "

        # Act
        sanitized = validator.sanitize_email(email)

        # Assert
        assert sanitized == "test@example.com"

    def test_sanitize_email_invalid(self):
        """Test sanitizing invalid email"""
        # Arrange
        validator = SecurityValidator()
        invalid_emails = ["notanemail", "missing@domain", "@nodomain.com"]

        # Act & Assert
        for email in invalid_emails:
            with pytest.raises(ValueError) as exc_info:
                validator.sanitize_email(email)
            assert "Invalid email" in str(exc_info.value)

    def test_sanitize_username_valid(self):
        """Test sanitizing valid username"""
        # Arrange
        validator = SecurityValidator()
        username = "  TestUser123  "

        # Act
        sanitized = validator.sanitize_username(username)

        # Assert
        assert sanitized == "testuser123"

    def test_sanitize_username_too_short(self):
        """Test sanitizing username that's too short"""
        # Arrange
        validator = SecurityValidator()
        username = "ab"

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            validator.sanitize_username(username)
        assert "between 3 and 30 characters" in str(exc_info.value)

    def test_sanitize_username_too_long(self):
        """Test sanitizing username that's too long"""
        # Arrange
        validator = SecurityValidator()
        username = "a" * 31

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            validator.sanitize_username(username)
        assert "between 3 and 30 characters" in str(exc_info.value)

    def test_sanitize_username_invalid_characters(self):
        """Test sanitizing username with invalid characters"""
        # Arrange
        validator = SecurityValidator()
        username = "user@name!"

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            validator.sanitize_username(username)
        assert "letters, numbers, underscores, and hyphens" in str(exc_info.value)

    def test_validate_ip_address_valid(self):
        """Test validating valid IP addresses"""
        # Arrange
        validator = SecurityValidator()
        valid_ips = ["192.168.1.1", "10.0.0.1", "255.255.255.255", "0.0.0.0"]

        # Act & Assert
        for ip in valid_ips:
            assert validator.validate_ip_address(ip) is True

    def test_validate_ip_address_invalid(self):
        """Test validating invalid IP addresses"""
        # Arrange
        validator = SecurityValidator()
        invalid_ips = [
            "256.1.1.1",  # Out of range
            "192.168.1",  # Missing octet
            "192.168.1.1.1",  # Too many octets
            "192.168.a.1",  # Non-numeric
            "not.an.ip.address"
        ]

        # Act & Assert
        for ip in invalid_ips:
            assert validator.validate_ip_address(ip) is False

    def test_check_rate_limit(self):
        """Test rate limit checking (stub test)"""
        # Arrange
        validator = SecurityValidator()

        # Act
        result = validator.check_rate_limit("user:1", 100, 60)

        # Assert (stub always returns False for now)
        assert result is False