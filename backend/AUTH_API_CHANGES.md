# Authentication API Changes

## Summary

Updated backend authentication endpoints to return complete user data and proper HTTP status codes, matching frontend expectations.

## Modified Files

1. `/app/routers/auth.py` - Updated authentication endpoints
2. `/app/schemas.py` - Added new response schemas

## Changes

### 1. Enhanced Response Schemas

#### New `AuthResponse` Schema
```python
class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
    status: str = "success"
```

#### Updated `UserOut` Schema
```python
class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None  # Added name field
    role: str
    org_id: str
```

#### New Registration Schemas
```python
class RegisterRetailIn(BaseModel):
    """Registration for individual/retail users"""
    account_type: str = "retail"
    name: str
    email: EmailStr
    password: str
    accept_terms: bool = True
    accept_privacy: bool = True

class RegisterEnterpriseIn(BaseModel):
    """Registration for enterprise/organization users"""
    account_type: str = "enterprise"
    organization_name: str
    industry: Optional[str] = None
    company_size: Optional[str] = None
    admin_name: str
    admin_email: EmailStr
    password: str
    accept_terms: bool = True
    accept_privacy: bool = True
```

#### New Login Schema
```python
class LoginIn(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False
```

### 2. Updated Endpoints

#### POST `/auth/register`

**Request (Retail):**
```json
{
  "account_type": "retail",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "accept_terms": true,
  "accept_privacy": true
}
```

**Request (Enterprise):**
```json
{
  "account_type": "enterprise",
  "organization_name": "Acme Corp",
  "industry": "Technology",
  "company_size": "50-200",
  "admin_name": "Jane Smith",
  "admin_email": "jane@acme.com",
  "password": "SecurePass123!",
  "accept_terms": true,
  "accept_privacy": true
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "abc123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "admin",
    "org_id": "org456"
  },
  "status": "success"
}
```

**Error Responses:**

- **400 Bad Request** - Validation error
```json
{
  "detail": {
    "message": "Password must be at least 8 characters",
    "field": "password"
  }
}
```

- **409 Conflict** - Email already exists
```json
{
  "detail": {
    "message": "An account with this email already exists",
    "field": "email"
  }
}
```

- **500 Internal Server Error** - Server error
```json
{
  "detail": {
    "message": "Registration failed. Please try again later.",
    "error": "..."
  }
}
```

#### POST `/auth/login`

OAuth2 password flow endpoint (form-data).

**Request (form-data):**
```
username: user@example.com
password: SecurePass123!
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "org_id": "org456"
  },
  "status": "success"
}
```

**Error Responses:**

- **401 Unauthorized** - Invalid credentials
```json
{
  "detail": {
    "message": "Invalid email or password",
    "field": "credentials"
  }
}
```

- **403 Forbidden** - Account deactivated
```json
{
  "detail": {
    "message": "Account is deactivated. Please contact support.",
    "field": "account"
  }
}
```

#### POST `/auth/login/json` (NEW)

JSON-based login endpoint for frontend applications.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "remember_me": false
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "org_id": "org456"
  },
  "status": "success"
}
```

**Error Responses:** Same as `/auth/login`

#### GET `/auth/me`

No changes - returns current user data.

## Features Added

### 1. Multi-Tier Registration Support
- Retail (individual) registration
- Enterprise (organization) registration
- Legacy format support for backward compatibility

### 2. Enhanced Error Handling
- Proper HTTP status codes (400, 401, 403, 409, 500)
- Structured error messages with field identification
- User-friendly error messages
- Transaction rollback on errors

### 3. Security Improvements
- Active user status checking
- Last login timestamp tracking
- Email normalization (lowercase)
- Rate limiting maintained (5/min for register, 10/min for login)

### 4. Better Response Format
- Consistent `AuthResponse` for both login and register
- Complete user object in response
- Both access and refresh tokens
- Status field for response validation

## Migration Notes

### Frontend Changes Required

Update the API client to use the new response format:

```typescript
// Old format
interface LoginResponse {
  access_token: string;
  token_type: string;
}

// New format
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    org_id: string;
  };
  status: string;
}
```

### Recommended Endpoint Usage

For frontend applications, use `/auth/login/json` instead of `/auth/login` for easier JSON handling.

## Testing

The schemas have been validated successfully:

```bash
cd backend
source venv/bin/activate
python -c "from app import schemas; import json; ..."
# ✓ Schemas validated successfully!
```

## Next Steps

1. Update frontend API client to use new response format
2. Implement refresh token rotation (currently uses same token)
3. Add email verification flow
4. Add password reset flow
5. Consider implementing "remember me" functionality with different token expiry
6. Add audit logging for authentication events
7. Implement account lockout after failed attempts

## Backward Compatibility

The legacy `RegisterIn` schema is maintained for backward compatibility. Both old and new registration formats are supported via Union type:

```python
body: Union[schemas.RegisterRetailIn, schemas.RegisterEnterpriseIn, schemas.RegisterIn]
```

## Security Considerations

1. All passwords are hashed using bcrypt
2. Emails are stored in lowercase for consistency
3. Rate limiting prevents brute force attacks
4. Generic error messages prevent user enumeration
5. Active status checking prevents deactivated account access
6. Transaction rollback ensures data consistency on errors
