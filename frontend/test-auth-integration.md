# Authentication Integration Test Guide

## Manual Testing Steps

### 1. Test Login Flow

**Prerequisites:**
- Backend server running on `http://localhost:8000`
- At least one user registered in the database

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter valid credentials
3. Click "Sign In"

**Expected Results:**
- Request to `POST /auth/login` with JSON body
- Response contains `access_token`, `refresh_token`, and `user` object
- Tokens stored in localStorage (`qe_token`, `qe_refresh_token`)
- User data stored in localStorage (`qe_user`)
- Redirect to `/dashboard`

**Check in DevTools:**
```javascript
// Open browser console and run:
console.log('Access Token:', localStorage.getItem('qe_token'));
console.log('Refresh Token:', localStorage.getItem('qe_refresh_token'));
console.log('User Data:', JSON.parse(localStorage.getItem('qe_user')));
```

### 2. Test Registration Flow (Retail)

**Steps:**
1. Navigate to `http://localhost:3000/register`
2. Select "Individual" account type
3. Fill in the form:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Password: "SecurePass123"
   - Confirm Password: "SecurePass123"
   - Accept Terms & Privacy
4. Click "Create Account"

**Expected Results:**
- Request to `POST /auth/register/retail` with JSON body:
  ```json
  {
    "email": "test@example.com",
    "password": "SecurePass123",
    "full_name": "Test User",
    "agree_to_terms": true
  }
  ```
- Response contains tokens and user data
- Redirect to `/dashboard`

### 3. Test Registration Flow (Enterprise)

**Steps:**
1. Navigate to `http://localhost:3000/register`
2. Select "Organization" account type
3. Fill in the form:
   - Organization Name: "Test Corp"
   - Industry: "Technology"
   - Company Size: "11-50"
   - Admin Name: "Admin User"
   - Admin Email: "admin@testcorp.com"
   - Password: "SecurePass123"
   - Confirm Password: "SecurePass123"
   - Accept Terms & Privacy
4. Click "Create Account"

**Expected Results:**
- Request to `POST /auth/register/enterprise` with JSON body:
  ```json
  {
    "email": "admin@testcorp.com",
    "password": "SecurePass123",
    "full_name": "Admin User",
    "company_name": "Test Corp",
    "industry": "Technology",
    "company_size": "small",
    "agree_to_terms": true
  }
  ```
- Response contains tokens and user data
- Redirect to `/dashboard`

### 4. Test Token Refresh

**Steps:**
1. Login successfully
2. Wait for token to expire (or manually expire it)
3. Make any authenticated API call

**Expected Results:**
- On 401 error, automatic token refresh triggered
- Request to `POST /auth/refresh` with:
  ```json
  {
    "refresh_token": "..."
  }
  ```
- New access token received and stored
- Original request retried with new token

**Simulate Token Expiry:**
```javascript
// In browser console:
localStorage.setItem('qe_token', 'expired_token');
// Then try to navigate to a protected page
```

### 5. Test Logout

**Steps:**
1. Login successfully
2. Click logout button

**Expected Results:**
- Request to `POST /auth/logout` with:
  ```json
  {
    "refresh_token": "...",
    "all_devices": false
  }
  ```
- All tokens cleared from localStorage
- Redirect to `/login`

### 6. Test Error Handling

**Test Invalid Credentials:**
1. Navigate to `/login`
2. Enter invalid credentials
3. Click "Sign In"

**Expected Results:**
- Error message displayed on screen
- No redirect
- No tokens stored

**Test Network Error:**
1. Stop the backend server
2. Try to login

**Expected Results:**
- Error message displayed
- No crash
- User stays on login page

## Browser DevTools Checklist

### Network Tab
- [x] Login request uses JSON content-type
- [x] Login endpoint is `/auth/login` (not `/auth/login/json`)
- [x] Register endpoint is `/auth/register/retail` or `/auth/register/enterprise`
- [x] Refresh endpoint is `/auth/refresh`
- [x] All requests include `Authorization: Bearer <token>` header (except login/register)

### Application Tab (localStorage)
- [x] `qe_token` contains access token
- [x] `qe_refresh_token` contains refresh token
- [x] `qe_user` contains stringified user object with:
  - id
  - email
  - name
  - role
  - accountType (mapped from customer_type)
  - organizationId (if enterprise)

### Console Tab
- [x] No error messages during normal flow
- [x] Error messages are user-friendly
- [x] No sensitive data logged

## API Response Validation

### Login/Register Response
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "customer_type": "retail",
    "org_id": "org123",
    "org": {
      "id": "org123",
      "name": "Company Name"
    }
  }
}
```

### Refresh Response
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

## Common Issues & Solutions

### Issue: 404 Not Found on /auth/login
**Solution:** Backend is not running or endpoint is incorrect. Check backend logs.

### Issue: CORS Error
**Solution:** Backend CORS configuration needs to allow `http://localhost:3000`

### Issue: Token not included in requests
**Solution:** Check api-client.ts request interceptor is working

### Issue: Redirect loop to /login
**Solution:** Check that tokens are being stored correctly and not immediately expired

### Issue: User data not persisting on refresh
**Solution:** Ensure Redux store is initializing from localStorage on app load

## Automated Test Commands

```bash
# Run type checking
npm run type-check

# Build the application
npm run build

# Start dev server
npm run dev
```

## Success Criteria

- [x] Login with valid credentials works
- [x] Login with invalid credentials shows error
- [x] Retail registration works
- [x] Enterprise registration works
- [x] Logout clears tokens and redirects
- [x] Token refresh happens automatically
- [x] Protected routes redirect to login when not authenticated
- [x] User data persists across page refreshes
- [x] All API requests include authorization header
- [x] Error messages are user-friendly
