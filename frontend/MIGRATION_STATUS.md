# Next.js Migration Status

## Current State

The Qual Engine frontend has been partially migrated from Vite + React to Next.js 14 with App Router.

### What's Working
- ✅ Next.js 14 is installed and configured
- ✅ App Router structure is set up
- ✅ Redux Toolkit integration is working
- ✅ React Query (TanStack Query) is configured
- ✅ Pages have been created (dashboard, projects, analysis, settings, admin, login)
- ✅ TypeScript configuration is updated for Next.js
- ✅ MUI v5 is installed
- ✅ All Tailwind code has been removed

### Critical Issue: MUI SSR Compatibility

The migration encountered a **critical compatibility issue** between:
- Next.js 14.2.35 (requires React.cache API)
- React 18.3.1 (doesn't have cache API)
- MUI v5 (not fully compatible with React 19)
- React 19 RC (has cache API but MUI v5 not compatible)

### Attempted Solutions

1. **MUI v6 with @mui/material-nextjs**: Failed due to SSR context issues
2. **Custom Emotion cache provider**: Failed during build/prerender
3. **React.cache polyfill via instrumentation**: Loaded too late
4. **React 19 RC upgrade**: Created new compatibility issues with MUI v5

## Recommended Path Forward

### Option 1: Use Next.js 13 (Recommended for stability)
```bash
npm install next@13.5.6 --legacy-peer-deps
```
- Next.js 13 works better with React 18 + MUI v5
- More stable and proven combination
- Skip the React.cache requirement

### Option 2: Wait for MUI v6 Stable
- MUI v6 has better Next.js App Router support
- Currently in beta, needs @mui/material-nextjs package
- May still have SSR issues

### Option 3: Stick with Vite (Recommended for now)
**Given the complexity and instability, consider keeping Vite for now and migrating later when:**
- MUI v6 is stable
- Next.js + React 19 + MUI compatibility is proven
- More community solutions exist

The current Vite setup is working well and adding value. Migrat  ing to Next.js for this project may not provide enough benefits to justify the complexity.

## Files Modified

### Core Next.js Files
- `/app/layout.tsx` - Root layout with providers
- `/app/providers.tsx` - Redux, React Query, MUI setup
- `/app/page.tsx` - Homepage with auth redirect
- `/next.config.js` - Next.js configuration
- `/tsconfig.json` - TypeScript config for Next.js

### Page Files Created
- `/app/dashboard/page.tsx`
- `/app/projects/page.tsx`
- `/app/analysis/page.tsx`
- `/app/settings/page.tsx`
- `/app/admin/page.tsx`
- `/app/login/page.tsx`
- `/app/not-found.tsx`

### Component Files
- `/components/AppLayout.tsx` - Main app layout with navigation
- `/components/ProtectedRoute.tsx` - Route protection HOC

### Library Files
- `/lib/query-client.ts` - React Query configuration
- `/lib/api-client.ts` - API client setup
- `/lib/emotion-cache.tsx` - Emotion cache for MUI (has issues)
- `/lib/react-cache-polyfill.ts` - React.cache polyfill (didn't work)
- `/instrumentation.ts` - Next.js instrumentation hook

### Redux Files
- `/store/index.ts` - Redux store configuration
- `/store/hooks.ts` - Typed Redux hooks
- `/store/slices/authSlice.ts` - Auth state management
- `/store/slices/projectsSlice.ts` - Projects state management

### Style Files
- `/styles/theme.ts` - MUI theme configuration

## Package Changes

### Added
```json
{
  "next": "^14.2.35",
  "@mui/material": "^5.18.0",
  "@mui/icons-material": "^5.18.0",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@emotion/cache": "^11.13.0",
  "@reduxjs/toolkit": "^2.12.0",
  "react-redux": "^9.3.0",
  "@tanstack/react-query": "^5.101.1",
  "@tanstack/react-query-devtools": "^5.101.1",
  "react": "19.0.0-rc" (currently, was 18.3.1)
}
```

### Removed
- Vite-related packages (can be restored)
- Tailwind CSS
- All Tailwind plugins

## Next Steps if Continuing Migration

1. **Downgrade to Next.js 13.5.x**
   ```bash
   npm install next@13.5.6 react@18.3.1 react-dom@18.3.1 --legacy-peer-deps
   ```

2. **Clean build and test**
   ```bash
   rm -rf .next
   npm run build
   npm run dev
   ```

3. **Fix any remaining MUI v5 compatibility issues**
   - Use `InputProps` instead of `slotProps` (already done)
   - Use `primaryTypographyProps` instead of `slotProps` (already done)

4. **Complete component migration**
   - Ensure all old Vite components are converted
   - Remove `src.old` directory once verified

5. **Set up asset handling**
   - Configure Next.js Image component
   - Set up Higgsfields integration if needed

## Developer Notes

- Dev server: `npm run dev` (runs on port 5173)
- Build: `npm run build`
- The build may show prerender warnings but this is acceptable for client-only apps
- All pages use `'use client'` directive as they require client-side state

## Rollback Instructions

If you need to rollback to Vite:

1. Restore Vite packages:
   ```bash
   npm install vite @vitejs/plugin-react --save-dev
   ```

2. Restore vite.config.ts from git history

3. Update package.json scripts back to Vite commands

4. Remove Next.js-specific files (app/, next.config.js, etc.)

5. Restore src/ directory from src.old/
