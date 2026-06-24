"""
Input validators for API endpoints
"""
import re
from typing import Optional


def validate_password(password: str) -> tuple[bool, Optional[str]]:
    """
    Validate password complexity requirements

    Requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - Optional: At least 1 special character

    Returns:
        (is_valid, error_message)
    """

    if not password:
        return False, "Password is required"

    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"

    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"

    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"

    # Optional: Check for special characters
    # if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
    #     return False, "Password must contain at least one special character"

    # Check for common weak passwords
    weak_passwords = [
        "password", "12345678", "password123", "admin123", "qwerty123",
        "letmein", "welcome123", "monkey123", "dragon123"
    ]

    if password.lower() in weak_passwords:
        return False, "This password is too common. Please choose a stronger password"

    return True, None


def validate_email(email: str) -> tuple[bool, Optional[str]]:
    """
    Validate email format

    Returns:
        (is_valid, error_message)
    """

    if not email:
        return False, "Email is required"

    # Basic email regex pattern
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'

    if not re.match(email_pattern, email):
        return False, "Invalid email format"

    # Check for disposable email domains (optional)
    disposable_domains = [
        "tempmail.com", "throwaway.email", "guerrillamail.com",
        "mailinator.com", "10minutemail.com", "trashmail.com"
    ]

    domain = email.split('@')[1].lower()
    if domain in disposable_domains:
        return False, "Disposable email addresses are not allowed"

    return True, None


def validate_file_extension(filename: str, allowed_extensions: list[str]) -> tuple[bool, Optional[str]]:
    """
    Validate file extension

    Returns:
        (is_valid, error_message)
    """

    if not filename:
        return False, "Filename is required"

    # Get file extension
    extension = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''

    if not extension:
        return False, "File must have an extension"

    if extension not in allowed_extensions:
        return False, f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"

    return True, None