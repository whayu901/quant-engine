# Frontend Authentication Fixes - Summary

## Overview
Updated frontend authentication to work with the new backend API format.

## Changes Made

### 1. `/lib/services/auth-service.ts`

#### Login Method
- **Changed**: Endpoint from form data to JSON format
- **Old**: `POST /auth/login` with `application/x-www-form-urlencoded`
- **New**: `POST /auth/login` with JSON body `{ email, password, remember_me }`
- **Response handling**: Now properly extracts user data from response
- **User mapping**: Maps `customer_type` to `accountType`

#### Register Method
- **Changed**: Routes to separate retail/enterprise endpoints
- **New endpoints**: 
  - Retail: `POST /auth/register/retail`
  - Enterprise: `POST /auth/register/enterprise`
- **Data transformation**: 
  - Maps frontend field names to backend field names
  - `name` → `full_name`
  - `adminName` → `full_name`
  - `adminEmail` → `email`
  - `organizationName` → `company_name`
- **Company size mapping**: Maps UI-friendly sizes to backend values

#### Logout Method
- **Changed**: Endpoint from `/api/auth/logout` to `/auth/logout`
- **Added**: Sends `refresh_token` in request body

#### Password Reset Method
- **Changed**: Maps `password` field to `new_password`

#### Refresh Token Method
- **Changed**: 
  - Endpoint from `/api/auth/refresh` to `/auth/refresh`
  - Request field: `refreshToken` → `refresh_token`
  - Response fields: `access_token`, `refresh_token`, `token_type`

#### Get Current User Method
- **Changed**: Maps `customer_type` to `accountType`
- **Added**: Organization data mapping

### 2. `/lib/api-client.ts`

#### Token Refresh Interceptor
- **Changed**: Endpoint from `/api/auth/refresh` to `/auth/refresh`
- **Changed**: Request/response field names to match backend
- **Added**: Check for `newRefreshToken` before updating storage

### 3. Response Format

#### Backend Response Structure
```json
{
  "access_token": "token...",
  "refresh_token": "token...",
  "token_type": "bearer",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "customer_type": "retail",
    "org_id": "org456",
    "org": {
      "id": "org456",
      "name": "Company Name",
      "tier": "free",
      "customer_type": "retail"
    }
  }
}
```

#### Frontend Mapping
- `access_token` → `accessToken`
- `refresh_token` → `refreshToken`
- `token_type` → `tokenType`
- `customer_type` → `accountType`
- `org_id` → `organizationId`
- `org.name` → `organizationName`

### 4. Files Modified
1. `/lib/services/auth-service.ts` - Core authentication service
2. `/lib/api-client.ts` - HTTP client with token refresh
3. `/store/slices/authSlice.ts` - Already compatible (no changes needed)
4. `/app/login/page.tsx` - Already compatible (no changes needed)
5. `/app/register/page.tsx` - Already compatible (no changes needed)

## Testing Checklist

- [ ] Login with valid credentials redirects to /dashboard
- [ ] Login with invalid credentials shows error
- [ ] Registration (retail) creates account and redirects to /dashboard
- [ ] Registration (enterprise) creates account and redirects to /dashboard
- [ ] Logout clears tokens and redirects to /login
- [ ] Token refresh works automatically on 401 errors
- [ ] User data is properly stored in localStorage
- [ ] Both access_token and refresh_token are stored
- [ ] Password reset flow works
- [ ] Email verification flow works

## API Endpoints Used

### Authentication
- `POST /auth/login` - Login
- `POST /auth/register/retail` - Register retail customer
- `POST /auth/register/enterprise` - Register enterprise customer
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh access token

### User Management
- `GET /auth/me` - Get current user
- `PATCH /auth/me` - Update user profile

### Password Management
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Email Verification
- `POST /auth/verify-email` - Verify email with token

## Environment Variables
Ensure `NEXT_PUBLIC_API_URL` is set correctly:
- Development: `http://localhost:8000`
- Production: Your production API URL

## Notes
- All tokens are stored in localStorage with keys: `qe_token`, `qe_refresh_token`, `qe_user`
- Token refresh happens automatically on 401 errors
- User is redirected to /dashboard after successful login/registration
- User is redirected to /login when tokens are invalid or expired
