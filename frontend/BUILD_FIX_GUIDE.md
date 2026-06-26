# Build Issue Fix Guide

## Current Issue
```
TypeError: a.createContext is not a function
Error: Failed to collect page data for /analysis
```

## Root Cause
MUI v6 has compatibility issues with Next.js 14 SSR (Server-Side Rendering). The `createContext` error indicates that React context is not available during the server-side build process.

## Solution Options

### Option 1: Downgrade to MUI v5 (Recommended)
MUI v5 has stable Next.js support.

```bash
npm uninstall @mui/material @mui/icons-material
npm install @mui/material@^5.15.0 @mui/icons-material@^5.15.0
```

After downgrading, you may need to update some MUI API usage:
- `slotProps` might need to be `InputProps` or `componentsProps`
- Check the [MUI v5 documentation](https://v5.mui.com/) for specific component APIs

### Option 2: Use Dynamic Imports for Client Components
Wrap client-only components with Next.js dynamic imports:

```tsx
// In any page using MUI heavily
import dynamic from 'next/dynamic';

const ClientComponent = dynamic(() => import('@/components/MyComponent'), {
  ssr: false,
});
```

### Option 3: Update Provider Setup
Ensure providers are properly configured for SSR:

```tsx
// app/providers.tsx
'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
```

## Step-by-Step Fix (Recommended Path)

### Step 1: Install MUI Next.js Integration
```bash
npm install @mui/material-nextjs
```

### Step 2: Update app/providers.tsx
```tsx
'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from '@/store';
import { queryClient } from '@/lib/query-client';
import { theme } from '@/styles/theme';
import { initializeAuth } from '@/store/slices/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </QueryClientProvider>
    </Provider>
  );
}
```

### Step 3: Update next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    emotion: true,
  },
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
```

### Step 4: Test the Build
```bash
rm -rf .next
npm run build
```

## Alternative: Start Fresh with Working Template
If issues persist, consider using the official Next.js + MUI template:

```bash
# In a temporary directory
npx create-next-app@latest --example with-mui qual-engine-template
cd qual-engine-template
# Copy over our business logic
```

## Debugging Tips

1. **Check React Version**
   ```bash
   npm list react react-dom
   ```
   Ensure both are version 18.3.1

2. **Clear Next.js Cache**
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```

3. **Verify MUI Installation**
   ```bash
   npm list @mui/material @mui/icons-material
   ```

4. **Test in Development First**
   ```bash
   npm run dev
   # Visit http://localhost:5173
   ```
   If dev works but build fails, it's likely an SSR issue

5. **Enable Verbose Logging**
   ```bash
   NODE_OPTIONS='--trace-warnings' npm run build
   ```

## Common MUI v6 → v5 Migration Changes

If downgrading to MUI v5, update these:

```tsx
// v6 (current)
<TextField
  slotProps={{
    input: { endAdornment: <Icon /> }
  }}
/>

// v5 (after downgrade)
<TextField
  InputProps={{
    endAdornment: <Icon />
  }}
/>

// v6 Grid (doesn't work)
<Grid xs={12} sm={6} md={4}>

// v5 Grid (works)
<Grid item xs={12} sm={6} md={4}>
```

## Testing After Fix

1. Build succeeds without errors
2. Development server runs without errors
3. All pages render correctly
4. Authentication flow works
5. Navigation works
6. API calls work

## If All Else Fails

Contact the team or create an issue with:
- Node version: `node --version`
- NPM version: `npm --version`
- Full error log
- Steps to reproduce

## Quick Win: Development Mode
While fixing the build, you can still develop using:
```bash
npm run dev
```

This bypasses the SSR build issues and allows continued development.
