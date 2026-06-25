# Phase 7 Quick Reference Guide

## Architecture Overview

```
View (Pure Presentation)
    ↓↑ Props & Callbacks
Container (Glue Layer)
    ↓↑ State & Actions
Controller (Business Logic)
    ↓↑ Data Operations
Repository (Data Access)
    ↓↑ JSON Transform
Entity (Data Model)
```

## File Locations

### Entities (Models)
```
/frontend/src/models/entities/
├── UserSettings.ts          # User preferences and settings
├── APIKey.ts                # API key management
├── SystemSettings.ts        # Organization-wide settings
├── BillingSettings.ts       # Subscription and billing
└── AdminAnalytics.ts        # Analytics and metrics
```

### Repositories
```
/frontend/src/models/repositories/
├── SettingsRepository.ts    # User/System/API/Billing repositories
└── AdminRepository.ts       # Analytics/Activity/User management
```

### Controllers
```
/frontend/src/controllers/
├── SettingsController.ts    # Settings business logic
├── AdminController.ts       # Admin dashboard logic
└── BillingController.ts     # Billing logic
```

### Views
```
/frontend/src/views/
├── settings/
│   └── SettingsView.tsx     # Pure settings UI
└── admin/
    └── AdminDashboardView.tsx  # Pure admin dashboard UI
```

### Containers
```
/frontend/src/containers/
├── SettingsContainer.tsx       # Settings MVC glue
└── AdminDashboardContainer.tsx # Admin MVC glue
```

## Quick Usage

### Import Services
```typescript
import { Services } from './di/setup';

// Access controllers
Services.settings   // SettingsController
Services.admin      // AdminController
Services.billing    // BillingController
```

### Settings Management
```typescript
// Load settings
await Services.settings.loadSettings(userId);

// Update profile
await Services.settings.updateProfile(userId, {
  fullName: 'John Doe',
  company: 'ACME Corp'
});

// Subscribe to changes
const unsubscribe = Services.settings.subscribe((state) => {
  console.log('Settings:', state.settings);
  console.log('Loading:', state.isLoading);
});
```

### Admin Dashboard
```typescript
// Load analytics
await Services.admin.loadAnalytics(orgId, startDate, endDate);

// Start realtime updates
Services.admin.startRealtimeUpdates(orgId, 10000);

// Stop realtime updates
Services.admin.stopRealtimeUpdates();

// Load users
await Services.admin.loadUsers({ page: 1, pageSize: 20 });

// Suspend user
await Services.admin.suspendUser(userId, 'Violation of terms');
```

### Billing Management
```typescript
// Load billing
await Services.billing.loadBilling(userId);

// Check usage
const percentage = Services.billing.getUsagePercentage('analyses');
const limitReached = Services.billing.isUsageLimitReached('storage');

// Update subscription
await Services.billing.updateSubscription(userId, 'pro');
```

## React Component Usage

### Settings Page
```tsx
import { SettingsContainer } from './containers/SettingsContainer';

function SettingsPage() {
  const { userId } = useAuth();
  return <SettingsContainer userId={userId} />;
}
```

### Admin Page
```tsx
import { AdminDashboardContainer } from './containers/AdminDashboardContainer';

function AdminPage() {
  const { organizationId } = useAuth();
  return <AdminDashboardContainer organizationId={organizationId} />;
}
```

## State Interfaces

### SettingsState
```typescript
{
  settings: UserSettings | null;
  apiKeys: APIKey[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSavedAt?: Date;
}
```

### AdminState
```typescript
{
  analytics: AdminAnalytics | null;
  realtimeMetrics: {...} | null;
  users: UserManagementData[];
  activities: UserActivity[];
  systemSettings: SystemSettings | null;
  isLoading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  pageSize: number;
}
```

### BillingState
```typescript
{
  billing: BillingSettings | null;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
}
```

## Event Subscriptions

All controllers emit events via EventEmitter:

```typescript
// Settings events
'state_change'           // State updated
'settings_loaded'        // Settings loaded
'profile_updated'        // Profile updated
'api_key_created'        // API key created
'theme_updated'          // Theme changed

// Admin events
'state_change'           // State updated
'analytics_loaded'       // Analytics loaded
'realtime_metrics_updated'  // Realtime update
'user_suspended'         // User suspended
'bulk_action_completed'  // Bulk action done

// Billing events
'state_change'           // State updated
'billing_loaded'         // Billing loaded
'usage_warning'          // Usage at 75%/90%
'trial_expiring'         // Trial ending soon
```

## SEA Languages Supported

```typescript
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'zh-Hans', name: '简体中文', flag: '🇸🇬' }
];
```

## SEA Currencies Supported

```typescript
const currencies = [
  { code: 'SGD', symbol: '$' },
  { code: 'IDR', symbol: 'Rp' },
  { code: 'THB', symbol: '฿' },
  { code: 'VND', symbol: '₫' },
  { code: 'PHP', symbol: '₱' },
  { code: 'MYR', symbol: 'RM' },
  { code: 'USD', symbol: '$' }
];
```

## Validation Rules

### Profile
- Full name: min 2 chars, max 100 chars
- Bio: max 500 chars

### Avatar
- Max size: 5MB
- Allowed types: JPEG, PNG, GIF, WebP

### API Keys
- Name: min 3 chars, max 50 chars
- Permissions: read, write, delete, admin, *

### Email
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Security
- Session timeout: min 5 minutes

## Cache TTLs

```typescript
UserSettings: 5 minutes
SystemSettings: 10 minutes
BillingSettings: 1 minute
AdminAnalytics: 5 minutes
```

## API Endpoints Reference

### Settings
```
GET    /users/:userId/settings
PATCH  /users/:userId/settings
POST   /users/:userId/avatar
DELETE /users/:userId/avatar
GET    /users/:userId/api-keys
POST   /users/:userId/api-keys
POST   /users/:userId/api-keys/:keyId/rotate
DELETE /users/:userId/api-keys/:keyId
```

### Admin
```
GET    /admin/organizations/:orgId/analytics
GET    /admin/organizations/:orgId/realtime
GET    /admin/users
POST   /admin/users
PATCH  /admin/users/:userId
DELETE /admin/users/:userId
POST   /admin/users/:userId/suspend
POST   /admin/users/bulk
GET    /admin/activity
```

### Billing
```
GET    /users/:userId/billing
POST   /users/:userId/billing/subscription
POST   /users/:userId/billing/subscription/cancel
```

## Troubleshooting

### Controller not found
```typescript
// Ensure DI setup is called
import { initializeApp } from './di/setup';
initializeApp();
```

### State not updating
```typescript
// Ensure you're subscribed
useEffect(() => {
  const unsubscribe = Services.settings.subscribe(setState);
  return unsubscribe; // Cleanup
}, []);
```

### Cache not working
```typescript
// Check cache TTL
repository.setCacheTTL(300000); // 5 minutes

// Clear cache manually
repository.clearCache();
```

## Performance Tips

1. Use pagination for large lists
2. Enable caching in repositories
3. Debounce frequent updates
4. Use realtime updates sparingly
5. Cleanup subscriptions on unmount

## Testing Checklist

- [ ] Unit tests for controllers
- [ ] Integration tests for repositories
- [ ] Component tests for views
- [ ] E2E tests for user flows
- [ ] Error handling coverage
- [ ] Cache invalidation tests
- [ ] State subscription tests

## SOLID Principles Applied

✅ **Single Responsibility**: Each class has one reason to change
✅ **Open/Closed**: Open for extension, closed for modification
✅ **Liskov Substitution**: Subtypes can replace base types
✅ **Interface Segregation**: Clients depend only on what they use
✅ **Dependency Inversion**: Depend on abstractions, not concretions

---

**Quick Reference Complete** 📚
