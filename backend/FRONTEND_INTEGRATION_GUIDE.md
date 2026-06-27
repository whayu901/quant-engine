# Frontend Integration Guide - Updated Authentication API

## Quick Reference

The backend authentication API has been updated to return complete user data and proper status codes. This guide will help you update your frontend code.

## What Changed?

### Login Response
**Before:**
```json
{
  "access_token": "token...",
  "token_type": "bearer"
}
```

**After:**
```json
{
  "access_token": "token...",
  "refresh_token": "token...",
  "token_type": "bearer",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "org_id": "org456"
  },
  "status": "success"
}
```

## New Endpoints

### 1. POST `/auth/login/json` (Recommended for Frontend)

Use this instead of `/auth/login` for easier JSON handling.

**Request:**
```typescript
const response = await fetch('http://localhost:8000/auth/login/json', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    remember_me: false
  })
});

const data = await response.json();
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
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

**Error Response (401):**
```json
{
  "detail": {
    "message": "Invalid email or password",
    "field": "credentials"
  }
}
```

### 2. POST `/auth/register` (Updated)

Now supports retail and enterprise registration.

#### Retail Registration

**Request:**
```typescript
const response = await fetch('http://localhost:8000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    account_type: 'retail',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    accept_terms: true,
    accept_privacy: true
  })
});
```

#### Enterprise Registration

**Request:**
```typescript
const response = await fetch('http://localhost:8000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    account_type: 'enterprise',
    organization_name: 'Acme Corp',
    industry: 'Technology',
    company_size: '50-200',
    admin_name: 'Jane Smith',
    admin_email: 'jane@acme.com',
    password: 'SecurePass123!',
    accept_terms: true,
    accept_privacy: true
  })
});
```

**Success Response (201 Created):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
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

**400 - Validation Error:**
```json
{
  "detail": {
    "message": "Password must be at least 8 characters",
    "field": "password"
  }
}
```

**409 - Email Exists:**
```json
{
  "detail": {
    "message": "An account with this email already exists",
    "field": "email"
  }
}
```

## TypeScript Types

Add these types to your frontend:

```typescript
// types/auth.ts

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  org_id: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
  status: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRetailRequest {
  account_type: 'retail';
  name: string;
  email: string;
  password: string;
  accept_terms: boolean;
  accept_privacy: boolean;
}

export interface RegisterEnterpriseRequest {
  account_type: 'enterprise';
  organization_name: string;
  industry?: string;
  company_size?: string;
  admin_name: string;
  admin_email: string;
  password: string;
  accept_terms: boolean;
  accept_privacy: boolean;
}

export type RegisterRequest = RegisterRetailRequest | RegisterEnterpriseRequest;

export interface ErrorResponse {
  detail: {
    message: string;
    field?: string;
  } | string;
}
```

## API Client Example

```typescript
// lib/api-client.ts

class AuthAPI {
  private baseUrl = 'http://localhost:8000';

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login/json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(
        typeof error.detail === 'string'
          ? error.detail
          : error.detail.message
      );
    }

    return response.json();
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(
        typeof error.detail === 'string'
          ? error.detail
          : error.detail.message
      );
    }

    return response.json();
  }

  async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }
}

export const authAPI = new AuthAPI();
```

## React Hook Example

```typescript
// hooks/useAuth.ts

import { useState } from 'react';
import { authAPI } from '@/lib/api-client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(credentials);

      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Store user data
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(data);

      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Store user data
      localStorage.setItem('user', JSON.stringify(response.user));

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return { login, register, logout, loading, error };
}
```

## Error Handling

The API now returns structured errors. Handle them like this:

```typescript
try {
  const response = await authAPI.login(credentials);
  // Handle success
} catch (error) {
  // Error message is already extracted by the API client
  console.error(error.message);

  // Show error to user
  setErrorMessage(error.message);
}
```

## HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Login successful | Proceed to dashboard |
| 201 | Registration successful | Proceed to dashboard |
| 400 | Validation error | Show field-specific error |
| 401 | Invalid credentials | Show "Invalid email or password" |
| 403 | Account deactivated | Show "Contact support" message |
| 409 | Email already exists | Show "Email already registered" |
| 422 | Schema validation error | Show validation errors |
| 500 | Server error | Show "Try again later" |

## Migration Steps

1. **Update Type Definitions**
   ```bash
   # Copy the TypeScript types from this guide to your types/auth.ts
   ```

2. **Update API Client**
   ```typescript
   // Change from /auth/login to /auth/login/json
   // Update response handling to expect AuthResponse
   ```

3. **Update State Management**
   ```typescript
   // Update Redux/Zustand slices to store user data
   // Store both access_token and refresh_token
   ```

4. **Update UI Components**
   ```typescript
   // Update login/register forms to use new request formats
   // Update error handling to show structured errors
   ```

5. **Test Authentication Flow**
   - Test retail registration
   - Test enterprise registration
   - Test login with correct credentials
   - Test login with wrong credentials
   - Test login with deactivated account
   - Test token usage with protected endpoints

## Example: Complete Login Flow

```typescript
// components/LoginForm.tsx

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await login({ email, password, remember_me: rememberMe });

      // Success! User data is already stored in localStorage
      console.log('Logged in as:', response.user.name);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />

      <label>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Remember me
      </label>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Testing

Test the new endpoints using curl:

```bash
# Login
curl -X POST http://localhost:8000/auth/login/json \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "remember_me": false
  }'

# Register (Retail)
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "account_type": "retail",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "accept_terms": true,
    "accept_privacy": true
  }'

# Get current user
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Need Help?

- API Documentation: http://localhost:8000/docs
- Backend Code: `/backend/app/routers/auth.py`
- Schema Definitions: `/backend/app/schemas.py`
- Test Examples: `/backend/tests/test_api_auth.py`
