# Multi-Tier Authentication API Specification

**For Frontend Developers**
**Version:** 1.0
**Base URL:** `http://localhost:8000/api` (dev) | `https://api.qualengine.com/api` (prod)

---

## Authentication Overview

### Token Types
- **Access Token:** Short-lived (30 min), used for API requests
- **Refresh Token:** Long-lived (30 days), used to get new access tokens

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## Registration Endpoints

### 1. Register Retail Customer

**Endpoint:** `POST /auth/register/retail`

**Rate Limit:** 5 requests per minute

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "company_name": "My Company",  // Optional
  "phone_number": "+6512345678",  // Optional
  "agree_to_terms": true
}
```

**Validation Rules:**
- Email: Valid format, not disposable
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Full name: Min 2 chars
- Phone: International format recommended

**Success Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "abc123def456",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "customer_type": "retail",
    "org_id": "org789xyz",
    "org": {
      "id": "org789xyz",
      "name": "My Company",
      "tier": "free",
      "customer_type": "retail",
      "max_users": 5
    },
    "email_verified": false,
    "created_at": "2024-06-26T10:00:00Z"
  }
}
```

**Error Responses:**
```json
// 400 - Email already exists
{
  "detail": "Email already registered"
}

// 400 - Weak password
{
  "detail": "Password must contain at least one uppercase letter"
}

// 429 - Rate limit exceeded
{
  "detail": "Rate limit exceeded. Try again in 60 seconds"
}
```

---

### 2. Register Enterprise Customer

**Endpoint:** `POST /auth/register/enterprise`

**Rate Limit:** 3 requests per minute (stricter due to manual review)

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePass123",
  "full_name": "Jane Smith",
  "company_name": "Enterprise Corp",
  "company_domain": "company.com",
  "company_size": "large",  // small | medium | large | enterprise
  "industry": "Technology",
  "country": "SG",  // ISO 2-letter code
  "phone_number": "+6512345678",
  "job_title": "CTO",  // Optional
  "expected_users": 50,  // Optional
  "agree_to_terms": true
}
```

**Success Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "xyz789abc456",
    "email": "admin@company.com",
    "name": "Jane Smith",
    "role": "admin",
    "customer_type": "enterprise",
    "org_id": "orgent123",
    "org": {
      "id": "orgent123",
      "name": "Enterprise Corp",
      "tier": "enterprise",
      "customer_type": "enterprise",
      "domain": "company.com",
      "max_users": 100,
      "company_size": "large",
      "industry": "Technology",
      "country_code": "SG"
    },
    "email_verified": false,
    "created_at": "2024-06-26T10:00:00Z"
  }
}
```

**Frontend Notes:**
- Show "Email verification required" message
- For enterprise, mention "Our team will contact you within 24 hours"
- Redirect to email verification page

---

## Login Endpoints

### 3. Login

**Endpoint:** `POST /auth/login`

**Rate Limit:** 10 requests per minute

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "remember_me": true,  // Optional - extends refresh token to 90 days
  "device_info": {  // Optional
    "device_name": "MacBook Pro",
    "device_type": "desktop"  // desktop | mobile | tablet
  }
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "customer_type": "retail",
    "org_id": "org123",
    "email_verified": true,
    "last_login": "2024-06-26T09:30:00Z"
  }
}
```

**Error Responses:**
```json
// 401 - Invalid credentials
{
  "detail": "Invalid credentials"
}

// 423 - Account locked
{
  "detail": "Too many failed login attempts. Account locked for 30 minutes."
}

// 403 - Account inactive
{
  "detail": "Account is inactive"
}
```

**Frontend Notes:**
- Store both `access_token` and `refresh_token` securely
- Show warning if `email_verified: false`
- Implement auto-logout after token expiration

---

## Token Management

### 4. Refresh Access Token

**Endpoint:** `POST /auth/refresh`

**No rate limit** (needed for seamless UX)

**Request:**
```json
{
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg..."
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",  // Same token returned
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Error Response (401):**
```json
{
  "detail": "Invalid or expired refresh token"
}
```

**Frontend Implementation:**
```javascript
// Automatically refresh before expiration
let refreshTimer;

function scheduleTokenRefresh(expiresIn) {
  // Refresh 5 minutes before expiration
  const refreshIn = (expiresIn - 300) * 1000;

  refreshTimer = setTimeout(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      scheduleTokenRefresh(data.expires_in);
    } else {
      // Refresh failed - redirect to login
      window.location.href = '/login';
    }
  }, refreshIn);
}

// Call after login
scheduleTokenRefresh(1800); // 30 minutes
```

---

### 5. Logout

**Endpoint:** `POST /auth/logout`

**Requires:** Authentication

**Request:**
```json
{
  "refresh_token": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",  // Optional
  "all_devices": false  // If true, logout from all devices
}
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Frontend Implementation:**
```javascript
async function logout(allDevices = false) {
  const refreshToken = localStorage.getItem('refresh_token');

  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
      all_devices: allDevices
    })
  });

  // Clear local storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  // Redirect to login
  window.location.href = '/login';
}
```

---

## Email Verification

### 6. Verify Email

**Endpoint:** `POST /auth/verify-email`

**Request:**
```json
{
  "token": "email_verification_token_from_email_link"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully",
  "email_verified": true
}
```

**Error Response (400):**
```json
{
  "detail": "Invalid or expired verification token"
}
```

**Email Link Format:**
```
https://app.qualengine.com/verify-email?token=abc123xyz789
```

---

### 7. Resend Verification Email

**Endpoint:** `POST /auth/resend-verification`

**Rate Limit:** 3 per hour

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Verification email sent"
}
```

**Frontend Note:** Always return 200 even if email doesn't exist (security)

---

## Password Management

### 8. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Rate Limit:** 3 per hour per email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset instructions sent to your email"
}
```

**Frontend Note:** Always return 200 (security - don't reveal if email exists)

---

### 9. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Request:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Error Responses:**
```json
// 400 - Invalid token
{
  "detail": "Invalid or expired reset token"
}

// 400 - Weak password
{
  "detail": "Password must be at least 8 characters long"
}
```

**Frontend:** Redirect to login after success

---

### 10. Change Password

**Endpoint:** `PATCH /auth/me/password`

**Requires:** Authentication

**Request:**
```json
{
  "current_password": "OldPassword123",
  "new_password": "NewPassword456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
```json
// 400 - Wrong current password
{
  "detail": "Current password is incorrect"
}

// 400 - Weak new password
{
  "detail": "Password must contain at least one number"
}
```

**Frontend Note:** Optionally logout all devices after password change

---

## User Profile

### 11. Get Current User

**Endpoint:** `GET /auth/me`

**Requires:** Authentication

**Success Response (200):**
```json
{
  "id": "abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "customer_type": "retail",
  "org_id": "org123",
  "org": {
    "id": "org123",
    "name": "My Company",
    "tier": "professional",
    "customer_type": "retail",
    "max_users": 10
  },
  "email_verified": true,
  "phone_number": "+6512345678",
  "avatar_url": "https://...",
  "created_at": "2024-01-15T10:00:00Z",
  "last_login": "2024-06-26T09:30:00Z"
}
```

---

### 12. Update Profile

**Endpoint:** `PATCH /auth/me`

**Requires:** Authentication

**Request:**
```json
{
  "name": "John Smith",
  "phone_number": "+6587654321",
  "avatar_url": "https://cdn.example.com/avatar.jpg"
}
```

**Success Response (200):**
```json
{
  "id": "abc123",
  "email": "user@example.com",
  "name": "John Smith",
  "phone_number": "+6587654321",
  "avatar_url": "https://cdn.example.com/avatar.jpg",
  // ... full user object
}
```

---

## Session Management

### 13. List Active Sessions

**Endpoint:** `GET /auth/sessions`

**Requires:** Authentication

**Success Response (200):**
```json
{
  "sessions": [
    {
      "id": "session123",
      "device_type": "desktop",
      "device_os": "macOS",
      "browser": "Chrome",
      "ip_address": "192.168.1.1",
      "location_city": "Singapore",
      "location_country": "SG",
      "last_activity_at": "2024-06-26T10:00:00Z",
      "is_current": true,
      "created_at": "2024-06-20T08:00:00Z"
    },
    {
      "id": "session456",
      "device_type": "mobile",
      "device_os": "iOS",
      "browser": "Safari",
      "ip_address": "203.0.113.1",
      "location_city": "Jakarta",
      "location_country": "ID",
      "last_activity_at": "2024-06-25T14:30:00Z",
      "is_current": false,
      "created_at": "2024-06-18T12:00:00Z"
    }
  ]
}
```

**Frontend UI Ideas:**
- Show current session with green indicator
- Show "This device" for current session
- Button to revoke each session
- Show last activity time
- Show device icons (desktop, mobile, tablet)

---

### 14. Revoke Session

**Endpoint:** `DELETE /auth/sessions/{session_id}`

**Requires:** Authentication

**Success Response (200):**
```json
{
  "message": "Session revoked successfully"
}
```

**Frontend Note:** Can't revoke current session via this endpoint (use logout)

---

## Error Handling

### Standard Error Response Format
```json
{
  "detail": "Error message here"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `423` - Locked (account locked)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Frontend Token Storage Best Practices

### Recommended Approach: Memory + Refresh Token in HttpOnly Cookie

**Option 1: Most Secure (Recommended)**
```javascript
// Access token in memory only
let accessToken = null;

// Refresh token in httpOnly cookie (set by backend)
// Backend should set: Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict

async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',  // Send cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  accessToken = data.access_token;  // Store in memory
  // Refresh token stored in httpOnly cookie by backend
}
```

**Option 2: localStorage (Simpler, less secure)**
```javascript
// Store in localStorage
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);

// Retrieve
const accessToken = localStorage.getItem('access_token');
```

**⚠️ Never store in:**
- sessionStorage for refresh tokens (lost on tab close)
- Regular cookies without HttpOnly flag (vulnerable to XSS)
- Global variables (lost on page refresh)

---

## Frontend Integration Examples

### React Hook for Authentication

```typescript
import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  customer_type: 'retail' | 'enterprise';
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  async function fetchCurrentUser() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalid, try refresh
        await refreshToken();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setUser(data.user);

    // Schedule token refresh
    scheduleTokenRefresh(data.expires_in);
  }

  async function logout() {
    const refreshToken = localStorage.getItem('refresh_token');

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }

  async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        scheduleTokenRefresh(data.expires_in);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  function scheduleTokenRefresh(expiresIn: number) {
    // Refresh 5 minutes before expiration
    const refreshIn = (expiresIn - 300) * 1000;
    setTimeout(refreshToken, refreshIn);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Protected Route Component

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.email_verified) {
    return <Navigate to="/verify-email" />;
  }

  return <>{children}</>;
}
```

---

## Testing Endpoints

### cURL Examples

**Register Retail:**
```bash
curl -X POST http://localhost:8000/api/auth/register/retail \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "full_name": "Test User",
    "agree_to_terms": true
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

**Get Current User:**
```bash
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Refresh Token:**
```bash
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Changelog

### Version 1.0 (2026-06-26)
- Initial multi-tier authentication API
- Separate retail and enterprise registration
- JWT access and refresh tokens
- Email verification flow
- Password reset flow
- Session management
- Profile management

---

**Questions?** Contact the backend team or refer to:
- Full Assessment: `/backend/MULTI_TIER_AUTH_COMPATIBILITY_ASSESSMENT.md`
- Implementation Guide: `/backend/MULTI_TIER_AUTH_IMPLEMENTATION_GUIDE.md`
