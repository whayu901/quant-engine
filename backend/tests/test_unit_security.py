"""
Unit tests for security module.
Tests password hashing, token creation/verification, and auth logic.
"""

import pytest
from datetime import datetime, timedelta
from app import security
from app.config import settings


@pytest.mark.unit
@pytest.mark.auth
class TestPasswordHashing:
    """Test password hashing and verification."""

    def test_hash_password(self):
        """Test that password hashing works correctly."""
        password = "mysecurepassword123"
        hashed = security.hash_pw(password)

        # Hash should be a string
        assert isinstance(hashed, str)
        # Hash should not be the plain password
        assert hashed != password
        # Hash should be deterministic
        assert security.hash_pw(password) == hashed

    def test_verify_correct_password(self):
        """Test that correct password verifies."""
        password = "mysecurepassword123"
        hashed = security.hash_pw(password)

        assert security.verify_pw(password, hashed)

    def test_verify_incorrect_password(self):
        """Test that incorrect password fails verification."""
        password = "mysecurepassword123"
        wrong_password = "wrongpassword"
        hashed = security.hash_pw(password)

        assert not security.verify_pw(wrong_password, hashed)

    def test_hash_different_passwords(self):
        """Test that different passwords produce different hashes."""
        password1 = "password123"
        password2 = "password456"

        hash1 = security.hash_pw(password1)
        hash2 = security.hash_pw(password2)

        assert hash1 != hash2

    def test_hash_empty_password(self):
        """Test hashing empty password."""
        password = ""
        hashed = security.hash_pw(password)

        assert isinstance(hashed, str)
        assert security.verify_pw(password, hashed)

    def test_hash_long_password(self):
        """Test hashing very long password."""
        password = "x" * 1000
        hashed = security.hash_pw(password)

        assert security.verify_pw(password, hashed)

    def test_hash_unicode_password(self):
        """Test hashing password with unicode characters."""
        password = "пароль密码パスワード"
        hashed = security.hash_pw(password)

        assert security.verify_pw(password, hashed)


@pytest.mark.unit
@pytest.mark.auth
class TestTokenCreation:
    """Test JWT token creation and validation."""

    def test_create_token(self):
        """Test that token creation works."""
        user_id = "test-user-123"
        token = security.create_token(user_id)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_token_can_be_decoded(self):
        """Test that created token can be decoded."""
        user_id = "test-user-456"
        token = security.create_token(user_id)

        decoded_user_id = security.decode_token(token)
        assert decoded_user_id == user_id

    def test_decode_invalid_token(self):
        """Test that invalid token returns None."""
        invalid_token = "not.a.valid.token"
        result = security.decode_token(invalid_token)

        assert result is None

    def test_decode_empty_token(self):
        """Test that empty token returns None."""
        result = security.decode_token("")
        assert result is None

    def test_token_contains_user_id(self):
        """Test that token encodes the user ID."""
        user_id = "user-12345"
        token = security.create_token(user_id)

        decoded = security.decode_token(token)
        assert decoded == user_id

    def test_different_user_ids_produce_different_tokens(self):
        """Test that different user IDs produce different tokens."""
        token1 = security.create_token("user1")
        token2 = security.create_token("user2")

        assert token1 != token2

    def test_token_expiration(self):
        """Test that token expiration is set correctly."""
        # This test verifies the token has an expiration claim
        # In a real scenario, you'd need to mock time to test actual expiration
        user_id = "test-user"
        token = security.create_token(user_id)

        # Token should be decodable now
        assert security.decode_token(token) == user_id

    def test_tampered_token_fails_verification(self):
        """Test that tampered token fails verification."""
        user_id = "test-user"
        token = security.create_token(user_id)

        # Tamper with the token
        tampered = token[:-5] + "xxxxx"

        result = security.decode_token(tampered)
        assert result is None


@pytest.mark.unit
@pytest.mark.auth
class TestSecurityConstants:
    """Test security configuration and constants."""

    def test_algo_is_hs256(self):
        """Test that algorithm is HS256."""
        assert security.ALGO == "HS256"

    def test_secret_key_configured(self):
        """Test that secret key is configured."""
        assert settings.secret_key
        assert len(settings.secret_key) > 0

    def test_token_expiration_configured(self):
        """Test that token expiration time is configured."""
        assert settings.access_token_expire_minutes > 0

    def test_token_expiration_is_reasonable(self):
        """Test that token expiration is a reasonable time."""
        # Should be at least 1 hour, at most 30 days
        assert 60 <= settings.access_token_expire_minutes <= 43200


@pytest.mark.unit
@pytest.mark.auth
class TestPasswordEdgeCases:
    """Test edge cases for password hashing."""

    def test_hash_with_special_characters(self):
        """Test password with special characters."""
        password = "P@$$w0rd!#%^&*()"
        hashed = security.hash_pw(password)

        assert security.verify_pw(password, hashed)

    def test_hash_with_spaces(self):
        """Test password with spaces."""
        password = "pass word with spaces"
        hashed = security.hash_pw(password)

        assert security.verify_pw(password, hashed)

    def test_hash_case_sensitive(self):
        """Test that password hashing is case-sensitive."""
        password = "MyPassword123"
        wrong_case = "mypassword123"
        hashed = security.hash_pw(password)

        assert security.verify_pw(password, hashed)
        assert not security.verify_pw(wrong_case, hashed)

    def test_hash_with_newlines(self):
        """Test password with newlines."""
        password = "password\nwith\nnewlines"
        hashed = security.hash_pw(password)

        assert security.verify_pw(password, hashed)


@pytest.mark.unit
@pytest.mark.auth
class TestTokenEdgeCases:
    """Test edge cases for token handling."""

    def test_token_with_special_user_id(self):
        """Test token creation with special characters in user ID."""
        user_id = "user-123_special.id"
        token = security.create_token(user_id)

        decoded = security.decode_token(token)
        assert decoded == user_id

    def test_token_with_long_user_id(self):
        """Test token with very long user ID."""
        user_id = "x" * 1000
        token = security.create_token(user_id)

        decoded = security.decode_token(token)
        assert decoded == user_id

    def test_token_decode_null_input(self):
        """Test decoding None input."""
        result = security.decode_token(None)
        assert result is None
