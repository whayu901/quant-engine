# Qual Engine Frontend Migration Guide

## Overview
This document outlines the complete refactor from Vite/React to Next.js 14 with Material-UI and Redux Toolkit.

## Major Changes

### 1. Framework Migration
- **From**: Vite + React + React Router
- **To**: Next.js 14 (App Router)

### 2. State Management
- **From**: Zustand
- **To**: Redux Toolkit + React Query (TanStack Query)

### 3. UI Framework
- **From**: Tailwind CSS
- **To**: Material-UI (MUI) v5+

### 4. Styling
- **From**: Utility-first CSS (Tailwind)
- **To**: Component-based styling (MUI + Emotion)

## New Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page (redirects)
│   ├── providers.tsx        # Redux + React Query + MUI providers
│   ├── login/
│   │   └── page.tsx        # Login page
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard page
│   ├── projects/
│   │   └── page.tsx        # Projects listing
│   ├── analysis/
│   │   └── page.tsx        # Analysis page
│   ├── settings/
│   │   └── page.tsx        # Settings page
│   └── admin/
│       └── page.tsx        # Admin panel
├── components/              # Shared React components
│   ├── AppLayout.tsx       # Main app layout with navigation
│   └── ProtectedRoute.tsx  # Auth wrapper component
├── store/                   # Redux store
│   ├── index.ts            # Store configuration
│   ├── hooks.ts            # Typed Redux hooks
│   └── slices/
│       ├── authSlice.ts    # Auth state
│       └── projectsSlice.ts # Projects state
├── lib/                     # Utilities and services
│   ├── api-client.ts       # Axios API client
│   └── query-client.ts     # React Query configuration
├── styles/                  # Global styles and theme
│   └── theme.ts            # MUI theme configuration
├── types/                   # TypeScript type definitions
├── next.config.js          # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Features Implemented

### 1. Redux Toolkit State Management
- **Auth Slice**: User authentication state
- **Projects Slice**: Project management state
- Typed hooks for TypeScript support
- Persistent auth via localStorage

### 2. React Query Integration
- Server state management
- Automatic refetching and caching
- Optimistic updates
- DevTools for debugging

### 3. Material-UI Components
- Complete component library
- Custom theme with brand colors
- Responsive design
- Accessible components

### 4. Next.js App Router
- File-based routing
- Server and Client Components
- Built-in API routes support
- Optimized for production

## Configuration Files

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    emotion: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}
```

### tsconfig.json
- Configured for Next.js
- Path aliases for imports
- Emotion JSX support
- Strict type checking enabled

## Running the Application

### Development
```bash
npm run dev
```
Runs on `http://localhost:5173` (same port as before)

### Production Build
```bash
npm run build
npm run start
```

### Type Checking
```bash
npm run type-check
```

## Migration Tasks Completed

- [x] Removed Vite and all related dependencies
- [x] Removed Tailwind CSS and all related dependencies
- [x] Removed Zustand state management
- [x] Installed Next.js 14 with App Router
- [x] Installed Redux Toolkit and React Redux
- [x] Installed Material-UI and dependencies
- [x] Created Redux store with auth and projects slices
- [x] Created MUI theme with brand colors
- [x] Created app layout with navigation
- [x] Migrated login page to MUI
- [x] Created dashboard with MUI components
- [x] Created projects page with MUI components
- [x] Created placeholder pages (analysis, settings, admin)
- [x] Set up API client with axios
- [x] Set up React Query provider
- [x] Configured protected routes
- [x] Removed old configuration files

## Next Steps (Manual Migration Required)

The following features from your old `src/` directory need to be manually migrated:

1. **Feature Modules**
   - `src/features/projects/*` - Project management features
   - `src/pages/reels-manager/*` - Reels management
   - `src/pages/client-dashboard/*` - Client dashboard
   - `src/pages/open-ends-coding/*` - Open ends coding

2. **Core Services**
   - `src/core/auth/*` - Auth service and hooks
   - `src/core/api/*` - API client (partially migrated)

3. **Shared Components**
   - `src/shared/components/*` - Reusable components
   - Convert to MUI components

4. **Business Logic**
   - Move logic files to appropriate Next.js pages
   - Update to use Redux instead of Zustand
   - Update to use MUI instead of Tailwind classes

## Component Migration Guide

### From Tailwind to MUI

**Before (Tailwind):**
```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click Me
  </button>
</div>
```

**After (MUI):**
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
  <Typography variant="h6" fontWeight={700}>Title</Typography>
  <Button variant="contained">Click Me</Button>
</Box>
```

### From Zustand to Redux

**Before (Zustand):**
```tsx
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

const { user, setUser } = useStore();
```

**After (Redux):**
```tsx
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';

const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.auth.user);

dispatch(setUser({ user, token }));
```

## Breaking Changes

1. **No more React Router** - Use Next.js navigation
2. **No more Tailwind classes** - Use MUI components and sx prop
3. **No more Zustand** - Use Redux Toolkit
4. **File structure changed** - App Router instead of src/
5. **Import paths changed** - Use @ aliases

## Environment Variables

Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

## Common Issues and Solutions

### Issue: Module not found
**Solution**: Update import paths to use @ aliases

### Issue: Tailwind classes not working
**Solution**: Replace with MUI components and sx prop

### Issue: React Router navigation not working
**Solution**: Use Next.js `useRouter` from `next/navigation`

### Issue: State not persisting
**Solution**: Ensure Redux store initialization in app/providers.tsx

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/material-ui/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Query Documentation](https://tanstack.com/query/latest)

## Support

For questions or issues, please refer to the respective documentation or create an issue in the project repository.
