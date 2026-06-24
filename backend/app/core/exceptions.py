"""
Core Business Exceptions
Domain-specific exceptions for business rule violations
"""

from typing import Optional, Any, Dict


class DomainException(Exception):
    """Base domain exception"""
    def __init__(self, message: str, code: str = "DOMAIN_ERROR", details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationException(DomainException):
    """Authentication related exceptions"""
    def __init__(self, message: str = "Authentication failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "AUTH_ERROR", details)


class AuthorizationException(DomainException):
    """Authorization related exceptions"""
    def __init__(self, message: str = "Unauthorized access", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "AUTHZ_ERROR", details)


class ValidationException(DomainException):
    """Validation related exceptions"""
    def __init__(self, message: str = "Validation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "VALIDATION_ERROR", details)


class ResourceNotFoundException(DomainException):
    """Resource not found exception"""
    def __init__(self, resource: str, identifier: Any):
        message = f"{resource} with identifier {identifier} not found"
        super().__init__(message, "NOT_FOUND", {"resource": resource, "identifier": identifier})


class ResourceAlreadyExistsException(DomainException):
    """Resource already exists exception"""
    def __init__(self, resource: str, identifier: Any):
        message = f"{resource} with identifier {identifier} already exists"
        super().__init__(message, "ALREADY_EXISTS", {"resource": resource, "identifier": identifier})


class BusinessRuleViolationException(DomainException):
    """Business rule violation exception"""
    def __init__(self, rule: str, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "BUSINESS_RULE_VIOLATION", {"rule": rule, **(details or {})})


class QuotaExceededException(DomainException):
    """Quota exceeded exception"""
    def __init__(self, resource: str, limit: int, current: int):
        message = f"Quota exceeded for {resource}. Limit: {limit}, Current: {current}"
        super().__init__(message, "QUOTA_EXCEEDED", {"resource": resource, "limit": limit, "current": current})


class InvalidStateException(DomainException):
    """Invalid state transition exception"""
    def __init__(self, entity: str, current_state: str, attempted_action: str):
        message = f"Cannot perform {attempted_action} on {entity} in state {current_state}"
        super().__init__(message, "INVALID_STATE", {
            "entity": entity,
            "current_state": current_state,
            "attempted_action": attempted_action
        })


class ExternalServiceException(DomainException):
    """External service exception"""
    def __init__(self, service: str, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, "EXTERNAL_SERVICE_ERROR", {"service": service, **(details or {})})


class RateLimitException(DomainException):
    """Rate limit exception"""
    def __init__(self, action: str, limit: int, window: int, retry_after: Optional[int] = None):
        message = f"Rate limit exceeded for {action}. Limit: {limit} per {window}s"
        details = {"action": action, "limit": limit, "window": window}
        if retry_after:
            details["retry_after"] = retry_after
        super().__init__(message, "RATE_LIMIT", details)


class InvalidCredentialsException(AuthenticationException):
    """Invalid credentials exception"""
    def __init__(self):
        super().__init__("Invalid username or password")


class TokenExpiredException(AuthenticationException):
    """Token expired exception"""
    def __init__(self):
        super().__init__("Token has expired")


class TokenInvalidException(AuthenticationException):
    """Invalid token exception"""
    def __init__(self):
        super().__init__("Invalid token")


class InsufficientPermissionsException(AuthorizationException):
    """Insufficient permissions exception"""
    def __init__(self, action: str, required_permission: Optional[str] = None):
        details = {"action": action}
        if required_permission:
            details["required_permission"] = required_permission
        super().__init__(f"Insufficient permissions for {action}", details)