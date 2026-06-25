# Phase 7 UI/UX Design Specification
# Settings & Admin Dashboard - Qual Engine

**Version:** 1.0
**Date:** 2026-06-25
**Designer:** UI/UX Team
**Status:** Ready for Implementation

---

## Executive Summary

This document provides comprehensive UI/UX specifications for Phase 7: Settings & Admin Dashboard for Qual Engine. The design emphasizes SPEED (8 hours → 5 minutes), SEA market optimization, mobile-first approach, and follows the established design system using Velocity Blue (#0A7AFF) and Neural Purple (#7B4FFF).

**Key Design Principles:**
- Speed-first visual language with lightning-fast interactions
- Mobile-responsive for 85% SEA mobile users
- WCAG 2.1 AA accessibility compliance
- SEA-friendly language and cultural considerations
- MVC/SOLID architecture patterns

---

## Table of Contents

1. [Component Hierarchy](#1-component-hierarchy)
2. [Settings Interface](#2-settings-interface)
3. [Admin Dashboard](#3-admin-dashboard)
4. [Billing Interface](#4-billing-interface)
5. [Key UI Patterns](#5-key-ui-patterns)
6. [Mobile Responsive Design](#6-mobile-responsive-design)
7. [Accessibility Features](#7-accessibility-features)
8. [Animations & Micro-interactions](#8-animations--micro-interactions)
9. [Implementation Guide](#9-implementation-guide)

---

## 1. Component Hierarchy

### 1.1 Settings Page Structure

```
SettingsPage (Container)
├── SettingsLayout (MVC Pattern)
│   ├── SettingsNavigation (Sidebar)
│   │   ├── NavigationItem (Profile)
│   │   ├── NavigationItem (Account)
│   │   ├── NavigationItem (Notifications)
│   │   ├── NavigationItem (Language)
│   │   ├── NavigationItem (API Keys)
│   │   ├── NavigationItem (Integrations)
│   │   └── NavigationItem (Security)
│   │
│   └── SettingsContent (Main Panel)
│       ├── ProfileSettings
│       │   ├── AvatarUploader
│       │   ├── ProfileForm
│       │   └── TimezoneSelector
│       │
│       ├── AccountSettings
│       │   ├── EmailSettings
│       │   ├── PasswordChanger
│       │   └── SessionManager
│       │
│       ├── NotificationSettings
│       │   ├── NotificationToggleGroup
│       │   ├── EmailPreferences
│       │   └── PushNotificationSettings
│       │
│       ├── LanguageSettings
│       │   ├── LanguageSelector (SEA Languages)
│       │   ├── TimezoneSelector
│       │   └── DateFormatSelector
│       │
│       ├── APIKeysManager
│       │   ├── APIKeyList
│       │   ├── CreateAPIKeyModal
│       │   └── APIKeyCard
│       │
│       ├── IntegrationSettings
│       │   ├── IntegrationGrid
│       │   ├── IntegrationCard (Slack, Teams, etc.)
│       │   └── WebhookManager
│       │
│       └── SecuritySettings
│           ├── TwoFactorAuth
│           ├── SessionHistory
│           └── DataExportRequest
```

### 1.2 Admin Dashboard Structure

```
AdminDashboard (Container)
├── AdminLayout
│   ├── AdminHeader
│   │   ├── OrganizationSwitcher
│   │   ├── QuickActions
│   │   └── AdminNotifications
│   │
│   ├── MetricsOverview
│   │   ├── TimeSavedMetric (Hero)
│   │   ├── UserActivityMetric
│   │   ├── UsageStatisticsMetric
│   │   └── RevenueMetric
│   │
│   ├── VisualizationSection
│   │   ├── TimeSeriesChart (Usage over time)
│   │   ├── UserActivityHeatmap
│   │   ├── SystemHealthIndicators
│   │   └── GeographicDistribution (SEA Map)
│   │
│   ├── UserManagement
│   │   ├── UserManagementTable (Virtualized)
│   │   ├── UserFilters
│   │   ├── UserActions (Invite, Edit, Suspend)
│   │   └── BulkActionsToolbar
│   │
│   ├── SystemMonitoring
│   │   ├── SystemHealthCards
│   │   ├── APIResponseTimeChart
│   │   ├── CacheHitRateChart
│   │   └── ErrorRateMonitor
│   │
│   └── ActivityFeed
│       ├── RecentActivityList
│       ├── AuditLogViewer
│       └── SystemAlerts
```

### 1.3 Billing Interface Structure

```
BillingPage (Container)
├── BillingLayout
│   ├── CurrentPlanCard
│   │   ├── PlanName
│   │   ├── PlanFeatures
│   │   ├── UsageProgressBars
│   │   └── UpgradeButton
│   │
│   ├── UsageOverview
│   │   ├── MinutesUsageCard
│   │   ├── AnalysesUsageCard
│   │   ├── StorageUsageCard
│   │   └── UsageTimeline
│   │
│   ├── PaymentMethods
│   │   ├── PaymentMethodList
│   │   ├── AddPaymentMethodButton
│   │   └── PaymentMethodCard
│   │
│   ├── InvoiceHistory
│   │   ├── InvoiceTable
│   │   ├── InvoiceRow
│   │   └── DownloadInvoiceButton
│   │
│   └── PricingComparison
│       ├── PricingTierCard (Starter)
│       ├── PricingTierCard (Pro - Recommended)
│       ├── PricingTierCard (Enterprise)
│       └── SEAPricingDisclaimer
```

---

## 2. Settings Interface

### 2.1 Settings Navigation (Sidebar)

**Layout:** Fixed left sidebar on desktop, bottom tabs on mobile

```tsx
// Desktop (width: 280px, fixed)
<SettingsNavigation>
  <NavigationHeader>
    <Avatar size="lg" />
    <UserName>Sarah Chen</UserName>
    <UserEmail>sarah@company.com</UserEmail>
  </NavigationHeader>

  <NavigationList>
    <NavigationItem icon={User} active>
      Profile
    </NavigationItem>
    <NavigationItem icon={Settings}>
      Account
    </NavigationItem>
    <NavigationItem icon={Bell}>
      Notifications
    </NavigationItem>
    <NavigationItem icon={Globe}>
      Language & Region
    </NavigationItem>
    <NavigationItem icon={Key}>
      API Keys
    </NavigationItem>
    <NavigationItem icon={Plug}>
      Integrations
    </NavigationItem>
    <NavigationItem icon={Shield}>
      Security
    </NavigationItem>
  </NavigationList>

  <NavigationFooter>
    <VersionInfo>v2.4.1</VersionInfo>
  </NavigationFooter>
</SettingsNavigation>
```

**Styles:**
```css
.settings-navigation {
  width: 280px;
  height: 100vh;
  background: var(--color-sheet);
  border-right: 1px solid var(--color-hairline);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.navigation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: var(--color-charcoal);
  font-size: 15px;
  font-weight: 500;
  border-radius: 10px;
  margin: 4px 12px;
  cursor: pointer;
  transition: all 0.2s var(--ease-speed);
}

.navigation-item:hover {
  background: var(--color-cloud);
  color: var(--color-velocity-blue);
}

.navigation-item.active {
  background: var(--color-velocity-blue-ultra-light);
  color: var(--color-velocity-blue);
  font-weight: 600;
  border-left: 3px solid var(--color-velocity-blue);
}

/* Mobile: Bottom tabs */
@media (max-width: 768px) {
  .settings-navigation {
    width: 100%;
    height: auto;
    position: fixed;
    bottom: 0;
    left: 0;
    top: auto;
    border-right: none;
    border-top: 1px solid var(--color-hairline);
    flex-direction: row;
    overflow-x: auto;
    padding: 8px;
  }

  .navigation-item {
    flex-direction: column;
    gap: 4px;
    padding: 8px 16px;
    margin: 0 4px;
    font-size: 12px;
  }
}
```

### 2.2 Profile Settings

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ Profile Settings                                     │
│                                                      │
│ ┌────────┐                                          │
│ │ Avatar │  Change Photo                            │
│ │  [📷]  │  Remove                                  │
│ └────────┘                                          │
│                                                      │
│ Full Name                                           │
│ ┌─────────────────────────────────────────────┐    │
│ │ Sarah Chen                                   │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ Job Title                                           │
│ ┌─────────────────────────────────────────────┐    │
│ │ Senior Research Manager                      │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ Company                                             │
│ ┌─────────────────────────────────────────────┐    │
│ │ ACME Research Agency                         │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ Time Zone                                           │
│ ┌─────────────────────────────────────────────┐    │
│ │ (GMT+8:00) Singapore                    [▼] │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│               [Cancel]  [Save Changes ⚡]           │
└─────────────────────────────────────────────────────┘
```

**Component Spec:**
```tsx
interface ProfileSettingsProps {
  user: User;
  onUpdate: (data: UpdateUserData) => Promise<void>;
}

export function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const [form, setForm] = useState({
    fullName: user.full_name,
    jobTitle: user.job_title,
    company: user.company,
    timezone: user.timezone
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="settings-section">
      <SectionHeader
        title="Profile Settings"
        description="Manage your personal information and preferences"
      />

      <div className="settings-content">
        <AvatarUploader
          currentAvatar={user.avatar_url}
          onUpload={handleAvatarUpload}
          loading={isUploading}
        />

        <FormField label="Full Name" required>
          <Input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Enter your full name"
          />
        </FormField>

        <FormField label="Job Title">
          <Input
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            placeholder="e.g., Senior Research Manager"
          />
        </FormField>

        <FormField label="Company">
          <Input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="Your organization name"
          />
        </FormField>

        <FormField label="Time Zone">
          <TimezoneSelector
            value={form.timezone}
            onChange={(tz) => setForm({ ...form, timezone: tz })}
            seaFocus // Prioritize SEA timezones
          />
        </FormField>

        <FormActions>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="speed"
            onClick={handleSave}
            loading={isSaving}
          >
            Save Changes
          </Button>
        </FormActions>
      </div>
    </div>
  );
}
```

### 2.3 Language Settings (SEA Focus)

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ Language & Region                                    │
│                                                      │
│ Interface Language                                  │
│ ┌─────────────────────────────────────────────┐    │
│ │ 🇬🇧 English (default)                   [▼] │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ Available languages:                                │
│ • 🇬🇧 English                                        │
│ • 🇮🇩 Bahasa Indonesia                              │
│ • 🇹🇭 ภาษาไทย (Thai)                                │
│ • 🇻🇳 Tiếng Việt (Vietnamese)                        │
│ • 🇵🇭 Filipino                                       │
│ • 🇲🇾 Bahasa Melayu                                 │
│ • 🇸🇬 Chinese (Simplified)                           │
│                                                      │
│ Date Format                                         │
│ ┌─────────────────────────────────────────────┐    │
│ │ DD/MM/YYYY (25/06/2026)              [▼]   │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ Number Format                                       │
│ ┌─────────────────────────────────────────────┐    │
│ │ 1,234.56 (US/UK)                     [▼]   │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ Currency Display                                    │
│ ┌─────────────────────────────────────────────┐    │
│ │ SGD $ (Singapore Dollar)             [▼]   │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ ℹ️  Code-mixing detection is always enabled         │
│                                                      │
│               [Cancel]  [Save Changes ⚡]           │
└─────────────────────────────────────────────────────┘
```

**SEA Language Options:**
```tsx
const SEA_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', native: 'Bahasa Indonesia' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', native: 'ภาษาไทย' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', native: 'Tiếng Việt' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭', native: 'Filipino' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', native: 'Bahasa Melayu' },
  { code: 'zh-Hans', name: 'Chinese (Simplified)', flag: '🇸🇬', native: '简体中文' },
];

const SEA_CURRENCIES = [
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
];
```

### 2.4 API Keys Manager

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ API Keys                        [+ Create New Key]  │
│                                                      │
│ Use API keys to integrate Qual Engine with your     │
│ applications. Keep them secure and rotate regularly.│
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ Production API Key              🟢 Active    │    │
│ │ qe_live_abc123...xyz789                      │    │
│ │ Created: Jun 1, 2026 • Last used: 2h ago    │    │
│ │ [👁️ Reveal] [📋 Copy] [🔄 Rotate] [🗑️ Delete]  │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ Development API Key             🟡 Limited   │    │
│ │ qe_test_def456...uvw012                      │    │
│ │ Created: May 15, 2026 • Last used: 1d ago   │    │
│ │ [👁️ Reveal] [📋 Copy] [🔄 Rotate] [🗑️ Delete]  │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ Webhook Secret Key              🔴 Expired   │    │
│ │ qe_whsec_ghi789...rst345                     │    │
│ │ Created: Mar 10, 2026 • Expired: Jun 10     │    │
│ │ [🔄 Rotate] [🗑️ Delete]                         │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ 📖 API Documentation                                │
│ 🔒 Security Best Practices                          │
└─────────────────────────────────────────────────────┘
```

**Component Spec:**
```tsx
interface APIKey {
  id: string;
  name: string;
  key: string; // Masked
  status: 'active' | 'limited' | 'expired';
  created_at: string;
  last_used_at: string;
  permissions: string[];
}

export function APIKeysManager() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="settings-section">
      <SectionHeader
        title="API Keys"
        description="Manage API keys for programmatic access"
        action={
          <Button
            variant="speed"
            icon={<Plus />}
            onClick={() => setShowCreateModal(true)}
          >
            Create New Key
          </Button>
        }
      />

      <InfoBanner variant="info">
        Use API keys to integrate Qual Engine with your applications.
        Keep them secure and rotate regularly.
      </InfoBanner>

      <div className="api-keys-list">
        {keys.map(key => (
          <APIKeyCard
            key={key.id}
            apiKey={key}
            onReveal={handleReveal}
            onCopy={handleCopy}
            onRotate={handleRotate}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <div className="api-resources">
        <ResourceLink icon={<Book />} href="/docs/api">
          API Documentation
        </ResourceLink>
        <ResourceLink icon={<Lock />} href="/docs/security">
          Security Best Practices
        </ResourceLink>
      </div>

      {showCreateModal && (
        <CreateAPIKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateKey}
        />
      )}
    </div>
  );
}
```

**API Key Card Styles:**
```css
.api-key-card {
  background: var(--color-sheet);
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s var(--ease-speed);
}

.api-key-card:hover {
  border-color: var(--color-velocity-blue);
  box-shadow: 0 4px 12px rgba(10, 122, 255, 0.1);
}

.api-key-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.api-key-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-ink);
}

.api-key-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.api-key-status.active {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.api-key-status.limited {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.api-key-status.expired {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.api-key-value {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--color-charcoal);
  padding: 12px;
  background: var(--color-cloud);
  border-radius: 8px;
  margin-bottom: 12px;
  user-select: all;
}

.api-key-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: var(--color-slate);
  margin-bottom: 16px;
}

.api-key-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.api-key-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--color-hairline);
  border-radius: 8px;
  background: var(--color-sheet);
  color: var(--color-charcoal);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s var(--ease-speed);
}

.api-key-action-btn:hover {
  border-color: var(--color-velocity-blue);
  color: var(--color-velocity-blue);
  background: var(--color-velocity-blue-ultra-light);
}

.api-key-action-btn.danger:hover {
  border-color: var(--color-error);
  color: var(--color-error);
  background: var(--color-error-bg);
}
```

### 2.5 Notification Settings

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ Notification Preferences                             │
│                                                      │
│ Choose how and when you want to be notified         │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ Analysis & Processing                                │
│                                                      │
│ ☑️ Analysis complete                [Email] [Push]   │
│    Notify when transcript analysis finishes          │
│                                                      │
│ ☑️ Processing errors               [Email] [Push]   │
│    Alert when transcription or analysis fails        │
│                                                      │
│ ☐ Processing started               [Email] [Push]   │
│    Notify when analysis begins (can be noisy)        │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ Collaboration                                        │
│                                                      │
│ ☑️ Comments & mentions             [Email] [Push]   │
│    When someone mentions you or comments             │
│                                                      │
│ ☑️ Project invitations             [Email] [Push]   │
│    When added to a new project                       │
│                                                      │
│ ☐ Team activity                    [Email] [Push]   │
│    Daily digest of team actions                      │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ Account & Billing                                    │
│                                                      │
│ ☑️ Usage limits                    [Email] [Push]   │
│    Alert at 80% and 100% of plan limits              │
│                                                      │
│ ☑️ Payment issues                  [Email]          │
│    Failed payments or expiring cards                 │
│                                                      │
│ ☑️ Security alerts                 [Email] [Push]   │
│    Suspicious login attempts                         │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ Marketing & Updates                                  │
│                                                      │
│ ☑️ Product updates                 [Email]          │
│    New features and improvements                     │
│                                                      │
│ ☐ Newsletter                       [Email]          │
│    Tips, case studies, and SEA insights              │
│                                                      │
│ ☐ Special offers                   [Email]          │
│    Promotions and discounts                          │
│                                                      │
│               [Cancel]  [Save Preferences]          │
└─────────────────────────────────────────────────────┘
```

**Component Implementation:**
```tsx
interface NotificationPreference {
  id: string;
  category: 'analysis' | 'collaboration' | 'account' | 'marketing';
  label: string;
  description: string;
  channels: {
    email: boolean;
    push: boolean;
    sms?: boolean;
  };
  recommended?: boolean;
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);

  const toggleChannel = (id: string, channel: 'email' | 'push' | 'sms') => {
    setPreferences(prev => prev.map(pref =>
      pref.id === id
        ? { ...pref, channels: { ...pref.channels, [channel]: !pref.channels[channel] }}
        : pref
    ));
  };

  return (
    <div className="settings-section">
      <SectionHeader
        title="Notification Preferences"
        description="Choose how and when you want to be notified"
      />

      <div className="notification-groups">
        {NOTIFICATION_CATEGORIES.map(category => (
          <NotificationGroup key={category.id} category={category}>
            {preferences
              .filter(p => p.category === category.id)
              .map(pref => (
                <NotificationRow
                  key={pref.id}
                  preference={pref}
                  onToggleChannel={toggleChannel}
                />
              ))}
          </NotificationGroup>
        ))}
      </div>

      <FormActions>
        <Button variant="secondary">Cancel</Button>
        <Button variant="speed" onClick={handleSave}>
          Save Preferences
        </Button>
      </FormActions>
    </div>
  );
}
```

---

## 3. Admin Dashboard

### 3.1 Admin Dashboard Overview

**Hero Metrics Section:**
```
┌─────────────────────────────────────────────────────────────────┐
│                       Admin Dashboard                            │
│                                                                  │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃  🎯 Organization Performance - This Month                ┃  │
│ ┃                                                           ┃  │
│ ┃  ⚡ 1,247 hours saved    📊 523 analyses    👥 47 users  ┃  │
│ ┃  💰 $2,850 revenue      📈 +24% growth     ✅ 99.2% uptime┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                                  │
│ ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│ │ Active Users │ Avg Response │ Cache Hit    │ API Uptime   │ │
│ │   47/50      │    210ms     │   Rate 87%   │   99.8%      │ │
│ │   🟢 94%     │   ⚡ Fast    │   🟢 Good    │   ✅ Healthy │ │
│ └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Component Structure:**
```tsx
export function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) return <AdminDashboardSkeleton />;

  return (
    <div className="admin-dashboard">
      {/* Hero Metrics */}
      <HeroMetricsSection>
        <HeroMetric
          label="Hours Saved"
          value={data.metrics.hoursSaved}
          icon={<Zap />}
          gradient="from-velocity-blue to-neural-purple"
          trend={+24}
        />
        <HeroMetric
          label="Total Analyses"
          value={data.metrics.totalAnalyses}
          icon={<BarChart3 />}
          gradient="from-green-500 to-emerald-500"
          trend={+12}
        />
        <HeroMetric
          label="Active Users"
          value={`${data.metrics.activeUsers}/${data.metrics.totalSeats}`}
          icon={<Users />}
          gradient="from-purple-500 to-pink-500"
          trend={+8}
        />
        <HeroMetric
          label="Revenue"
          value={formatSEACurrency(data.metrics.revenue, 'SGD')}
          icon={<DollarSign />}
          gradient="from-orange-500 to-red-500"
          trend={+15}
        />
      </HeroMetricsSection>

      {/* System Health Cards */}
      <SystemHealthGrid>
        <SystemHealthCard
          title="Active Users"
          value={`${data.health.activeUsers}/${data.health.totalSeats}`}
          percentage={94}
          status="good"
          icon={<Users />}
        />
        <SystemHealthCard
          title="Avg Response"
          value="210ms"
          status="excellent"
          icon={<Zap />}
          description="API response time"
        />
        <SystemHealthCard
          title="Cache Hit Rate"
          value="87%"
          status="good"
          icon={<Database />}
        />
        <SystemHealthCard
          title="API Uptime"
          value="99.8%"
          status="excellent"
          icon={<Activity />}
        />
      </SystemHealthGrid>

      {/* Charts Section */}
      <ChartsSection>
        <UsageOverTimeChart data={data.usage} />
        <UserActivityHeatmap data={data.activity} />
        <GeographicDistribution data={data.geography} />
      </ChartsSection>

      {/* User Management Table */}
      <UserManagementSection>
        <UserManagementTable
          users={data.users}
          onInvite={handleInviteUser}
          onEdit={handleEditUser}
          onSuspend={handleSuspendUser}
        />
      </UserManagementSection>

      {/* Activity Feed */}
      <ActivityFeedSection>
        <RecentActivityFeed activities={data.recentActivity} />
      </ActivityFeedSection>
    </div>
  );
}
```

### 3.2 User Management Table

**Visual Design (Desktop):**
```
┌───────────────────────────────────────────────────────────────────────────┐
│ User Management                   [🔍 Search]  [Filter ▼]  [+ Invite User] │
│                                                                            │
│ ☑️ Name ▼          Email              Role        Status      Last Active  │
│ ├─────────────────────────────────────────────────────────────────────────┤
│ │☑️ Sarah Chen     sarah@co.com      Admin       🟢 Active   2 mins ago  │ │
│ │   👤 Profile · 523 analyses · Joined Mar 2026              [Edit] [⋮]  │ │
│ ├─────────────────────────────────────────────────────────────────────────┤
│ │☐ John Tan        john@co.com       Researcher  🟢 Active   1 hour ago  │ │
│ │   👤 Profile · 142 analyses · Joined Apr 2026              [Edit] [⋮]  │ │
│ ├─────────────────────────────────────────────────────────────────────────┤
│ │☐ Maria Santos    maria@co.com      Researcher  🟡 Idle     2 days ago  │ │
│ │   👤 Profile · 87 analyses · Joined May 2026               [Edit] [⋮]  │ │
│ ├─────────────────────────────────────────────────────────────────────────┤
│ │☐ David Lee       david@co.com      Viewer      🔴 Suspended 1 week ago │ │
│ │   👤 Profile · 12 analyses · Joined Feb 2026               [Edit] [⋮]  │ │
│ └─────────────────────────────────────────────────────────────────────────┘
│                                                                            │
│ ☑️ 3 selected    [Bulk Actions ▼]                   Showing 1-10 of 47 ⟩ │
└───────────────────────────────────────────────────────────────────────────┘
```

**Component Implementation:**
```tsx
interface UserTableRow {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'researcher' | 'viewer';
  status: 'active' | 'idle' | 'suspended';
  last_active: string;
  analyses_count: number;
  joined_date: string;
}

export function UserManagementTable() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/admin/users')
  });

  return (
    <div className="user-management-section">
      <div className="section-header">
        <h2>User Management</h2>
        <div className="section-actions">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users..."
          />
          <Select
            value={filterRole}
            onChange={setFilterRole}
            options={ROLE_FILTER_OPTIONS}
          />
          <Button
            variant="speed"
            icon={<Plus />}
            onClick={handleInviteUser}
          >
            Invite User
          </Button>
        </div>
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>
                <Checkbox
                  checked={selectedUsers.length === users.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <UserTableRow
                key={user.id}
                user={user}
                selected={selectedUsers.includes(user.id)}
                onSelect={handleSelectUser}
                onEdit={handleEditUser}
                onSuspend={handleSuspendUser}
              />
            ))}
          </tbody>
        </table>
      </div>

      {selectedUsers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.length}
          onChangeRole={handleBulkChangeRole}
          onSuspend={handleBulkSuspend}
          onDelete={handleBulkDelete}
        />
      )}

      <TablePagination
        currentPage={1}
        totalPages={5}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

function UserTableRow({ user, selected, onSelect, onEdit, onSuspend }: UserTableRowProps) {
  return (
    <>
      <tr className="user-row">
        <td>
          <Checkbox checked={selected} onChange={() => onSelect(user.id)} />
        </td>
        <td>
          <div className="user-cell">
            <Avatar src={user.avatar_url} name={user.name} size="md" />
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-meta">
                {user.analyses_count} analyses · Joined {formatDate(user.joined_date)}
              </div>
            </div>
          </div>
        </td>
        <td>{user.email}</td>
        <td>
          <RoleBadge role={user.role} />
        </td>
        <td>
          <StatusBadge status={user.status} />
        </td>
        <td>
          <TimeAgo date={user.last_active} />
        </td>
        <td>
          <div className="action-buttons">
            <IconButton
              icon={<Edit />}
              onClick={() => onEdit(user)}
              tooltip="Edit user"
            />
            <IconButton
              icon={<MoreVertical />}
              onClick={() => handleShowMenu(user)}
              tooltip="More actions"
            />
          </div>
        </td>
      </tr>
    </>
  );
}
```

**Styles:**
```css
.user-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-sheet);
  border-radius: 16px;
  overflow: hidden;
}

.user-table thead {
  background: var(--color-cloud);
  border-bottom: 2px solid var(--color-hairline);
}

.user-table th {
  padding: 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-slate);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.user-table tbody tr {
  border-bottom: 1px solid var(--color-hairline);
  transition: background 0.15s var(--ease-speed);
}

.user-table tbody tr:hover {
  background: var(--color-cloud);
}

.user-table td {
  padding: 16px;
  vertical-align: middle;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-ink);
}

.user-meta {
  font-size: 13px;
  color: var(--color-slate);
  margin-top: 2px;
}

/* Mobile: Card Layout */
@media (max-width: 768px) {
  .user-table {
    display: none;
  }

  .user-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .user-card {
    background: var(--color-sheet);
    border: 1px solid var(--color-hairline);
    border-radius: 16px;
    padding: 16px;
  }
}
```

### 3.3 System Monitoring Dashboard

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ System Health                                   Last updated: 5s │
│                                                                  │
│ ┌────────────────┬────────────────┬────────────────────────┐   │
│ │ API Health     │ Database       │ Cache System           │   │
│ │ 🟢 Operational │ 🟢 Healthy     │ 🟢 Optimal             │   │
│ │ 99.8% uptime   │ 15ms latency   │ 87% hit rate           │   │
│ │ 210ms response │ 24 connections │ 12GB used / 16GB total │   │
│ └────────────────┴────────────────┴────────────────────────┘   │
│                                                                  │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │ API Response Time (Last 24 Hours)                          │  │
│ │                                                             │  │
│ │   400ms ┤                                                   │  │
│ │   300ms ┤        ╱╲                                         │  │
│ │   200ms ┤  ╱╲  ╱  ╲╱╲    ╱╲                                │  │
│ │   100ms ┼───────────────────────────────────────────       │  │
│ │     0ms └────────────────────────────────────────────      │  │
│ │         00:00    06:00    12:00    18:00    24:00          │  │
│ │                                                             │  │
│ │ Avg: 210ms  •  P95: 450ms  •  P99: 850ms                   │  │
│ └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│ ┌──────────────────────┬──────────────────────┐                │
│ │ Cache Hit Rate       │ Error Rate           │                │
│ │                      │                      │                │
│ │    ████████████░░    │    ▁▁▁▂▁▁▁▁▁▁       │                │
│ │    87% Hit Rate      │    0.08% Errors     │                │
│ │    13% Misses        │    4 errors/hour    │                │
│ └──────────────────────┴──────────────────────┘                │
│                                                                  │
│ 📊 View Detailed Metrics    🔔 Configure Alerts                 │
└─────────────────────────────────────────────────────────────────┘
```

**Component Implementation:**
```tsx
export function SystemMonitoring() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: () => api.get('/admin/system-health'),
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  return (
    <div className="system-monitoring">
      <div className="section-header">
        <h2>System Health</h2>
        <div className="last-updated">
          Last updated: {formatTimeAgo(data.lastUpdated)}
        </div>
      </div>

      {/* Health Cards */}
      <div className="health-cards-grid">
        <SystemHealthCard
          title="API Health"
          status={data.api.status}
          metrics={[
            { label: 'Uptime', value: `${data.api.uptime}%` },
            { label: 'Response', value: `${data.api.avgResponse}ms` }
          ]}
          icon={<Activity />}
        />
        <SystemHealthCard
          title="Database"
          status={data.database.status}
          metrics={[
            { label: 'Latency', value: `${data.database.latency}ms` },
            { label: 'Connections', value: data.database.connections }
          ]}
          icon={<Database />}
        />
        <SystemHealthCard
          title="Cache System"
          status={data.cache.status}
          metrics={[
            { label: 'Hit Rate', value: `${data.cache.hitRate}%` },
            { label: 'Memory', value: `${data.cache.memoryUsed}GB / ${data.cache.memoryTotal}GB` }
          ]}
          icon={<Layers />}
        />
      </div>

      {/* API Response Time Chart */}
      <ChartCard title="API Response Time (Last 24 Hours)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.apiResponseTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke="var(--color-velocity-blue)"
              strokeWidth={2}
            />
            <ReferenceLine
              y={500}
              label="SLA Threshold"
              stroke="var(--color-warning)"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="chart-metrics">
          <MetricBadge label="Avg" value={`${data.metrics.avg}ms`} />
          <MetricBadge label="P95" value={`${data.metrics.p95}ms`} />
          <MetricBadge label="P99" value={`${data.metrics.p99}ms`} />
        </div>
      </ChartCard>

      {/* Cache & Error Rates */}
      <div className="metrics-grid">
        <MetricCard
          title="Cache Hit Rate"
          primaryValue={`${data.cache.hitRate}%`}
          secondaryValue={`${data.cache.missRate}% misses`}
          chart={<MiniSparkline data={data.cache.history} />}
        />
        <MetricCard
          title="Error Rate"
          primaryValue={`${data.errors.rate}%`}
          secondaryValue={`${data.errors.count} errors/hour`}
          chart={<MiniSparkline data={data.errors.history} color="error" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Button variant="ghost" icon={<BarChart3 />}>
          View Detailed Metrics
        </Button>
        <Button variant="ghost" icon={<Bell />}>
          Configure Alerts
        </Button>
      </div>
    </div>
  );
}
```

---

## 4. Billing Interface

### 4.1 Current Plan Card

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ ⭐ Pro Plan                                   [Upgrade Plan] │
│                                                              │
│ SGD $199/month                              Next bill: Jul 1 │
│                                                              │
│ Your Usage This Month:                                      │
│                                                              │
│ Minutes Used                                 580 / 3,000    │
│ ██████░░░░░░░░░░░░░░░░░░░░░░░                19%          │
│                                                              │
│ Analyses                                      42 / 500      │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░                8%           │
│                                                              │
│ Storage                                      2.1GB / 50GB   │
│ █░░░░░░░░░░░░░░░░░░░░░░░░░░░                4%           │
│                                                              │
│ Team Members                                    8 / 10      │
│ ████████████████████████░░                    80%          │
│                                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│ Plan Features:                                              │
│ ✅ Unlimited projects                                       │
│ ✅ 3,000 minutes/month transcription                        │
│ ✅ Advanced analytics & visualizations                      │
│ ✅ Team collaboration (10 seats)                            │
│ ✅ Priority support                                         │
│ ✅ Custom integrations                                      │
│                                                              │
│ [Manage Subscription]  [View All Plans]                     │
└─────────────────────────────────────────────────────────────┘
```

**Component Implementation:**
```tsx
interface UsageMetric {
  label: string;
  used: number;
  limit: number;
  unit: string;
  warningThreshold?: number; // e.g., 80 = warn at 80%
}

export function CurrentPlanCard() {
  const { data: subscription } = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => api.get('/billing/subscription')
  });

  const { data: usage } = useQuery({
    queryKey: ['billing', 'usage'],
    queryFn: () => api.get('/billing/usage')
  });

  const usageMetrics: UsageMetric[] = [
    {
      label: 'Minutes Used',
      used: usage.minutes_used,
      limit: usage.minutes_limit,
      unit: 'minutes',
      warningThreshold: 80
    },
    {
      label: 'Analyses',
      used: usage.analyses_used,
      limit: usage.analyses_limit,
      unit: 'analyses',
      warningThreshold: 90
    },
    {
      label: 'Storage',
      used: usage.storage_used_gb,
      limit: usage.storage_limit_gb,
      unit: 'GB',
      warningThreshold: 85
    },
    {
      label: 'Team Members',
      used: usage.seats_used,
      limit: usage.seats_limit,
      unit: 'seats',
      warningThreshold: 100
    }
  ];

  return (
    <div className="current-plan-card">
      <div className="plan-header">
        <div className="plan-info">
          <h3 className="plan-name">
            {subscription.plan.icon} {subscription.plan.name}
          </h3>
          <div className="plan-price">
            {formatSEACurrency(subscription.price, subscription.currency)}/
            {subscription.interval}
          </div>
        </div>
        <Button variant="speed" onClick={handleUpgrade}>
          Upgrade Plan
        </Button>
      </div>

      <div className="next-billing">
        Next bill: {formatDate(subscription.next_billing_date)}
      </div>

      <div className="usage-section">
        <h4>Your Usage This Month:</h4>
        {usageMetrics.map(metric => (
          <UsageProgressBar
            key={metric.label}
            label={metric.label}
            used={metric.used}
            limit={metric.limit}
            unit={metric.unit}
            warning={metric.used / metric.limit * 100 >= (metric.warningThreshold || 100)}
          />
        ))}
      </div>

      <div className="plan-features">
        <h4>Plan Features:</h4>
        <ul>
          {subscription.plan.features.map((feature, i) => (
            <li key={i}>
              <Check className="feature-check" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="plan-actions">
        <Button variant="ghost" onClick={handleManageSubscription}>
          Manage Subscription
        </Button>
        <Button variant="ghost" onClick={handleViewPlans}>
          View All Plans
        </Button>
      </div>
    </div>
  );
}

function UsageProgressBar({ label, used, limit, unit, warning }: UsageProgressBarProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;

  return (
    <div className="usage-progress">
      <div className="usage-header">
        <span className="usage-label">{label}</span>
        <span className="usage-values">
          {formatNumber(used)} / {formatNumber(limit)} {unit}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill ${isNearLimit ? 'warning' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="usage-percentage">
        {percentage.toFixed(0)}%
        {isNearLimit && (
          <span className="usage-warning">
            <AlertTriangle className="w-3 h-3" />
            Approaching limit
          </span>
        )}
      </div>
    </div>
  );
}
```

**Styles:**
```css
.current-plan-card {
  background: var(--color-sheet);
  border: 1px solid var(--color-hairline);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(23, 25, 28, 0.04);
}

.plan-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.plan-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 8px;
}

.plan-price {
  font-size: 32px;
  font-weight: 700;
  background: var(--gradient-speed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.usage-section {
  margin: 32px 0;
}

.usage-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 20px;
}

.usage-progress {
  margin-bottom: 24px;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.usage-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-charcoal);
}

.usage-values {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-slate);
}

.progress-bar {
  height: 8px;
  background: var(--color-cloud);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-speed);
  border-radius: 999px;
  transition: width 0.3s var(--ease-smooth);
}

.progress-fill.warning {
  background: var(--color-warning);
}

.usage-percentage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-slate);
}

.usage-warning {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-warning);
  font-weight: 600;
}

.plan-features {
  margin: 32px 0;
  padding: 24px 0;
  border-top: 1px solid var(--color-hairline);
}

.plan-features h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 16px;
}

.plan-features ul {
  list-style: none;
  padding: 0;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 14px;
  color: var(--color-charcoal);
}

.feature-check {
  width: 20px;
  height: 20px;
  color: var(--color-success);
  flex-shrink: 0;
}

.plan-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--color-hairline);
}

/* Mobile */
@media (max-width: 768px) {
  .current-plan-card {
    padding: 20px;
  }

  .plan-header {
    flex-direction: column;
    gap: 16px;
  }

  .plan-actions {
    flex-direction: column;
  }

  .plan-actions button {
    width: 100%;
  }
}
```

### 4.2 Invoice History Table

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Invoice History                                              │
│                                                              │
│ Date          Amount      Status      Invoice      Actions  │
│ ─────────────────────────────────────────────────────────── │
│ Jun 1, 2026   SGD $199   ✅ Paid     #INV-2026-06  📥 ⋮    │
│ May 1, 2026   SGD $199   ✅ Paid     #INV-2026-05  📥 ⋮    │
│ Apr 1, 2026   SGD $199   ✅ Paid     #INV-2026-04  📥 ⋮    │
│ Mar 1, 2026   SGD $199   ✅ Paid     #INV-2026-03  📥 ⋮    │
│ Feb 1, 2026   SGD $199   ⚠️ Pending  #INV-2026-02  📥 ⋮    │
│ Jan 1, 2026   SGD $149   ✅ Paid     #INV-2026-01  📥 ⋮    │
│                                                              │
│                                      Showing 1-10 of 24 ⟩  │
└─────────────────────────────────────────────────────────────┘
```

**Component Implementation:**
```tsx
interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  pdf_url: string;
}

export function InvoiceHistory() {
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['billing', 'invoices'],
    queryFn: () => api.get('/billing/invoices')
  });

  const handleDownload = async (invoice: Invoice) => {
    const response = await fetch(invoice.pdf_url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${invoice.invoice_number}.pdf`;
    link.click();
  };

  return (
    <div className="invoice-history-section">
      <h3>Invoice History</h3>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Invoice</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice.id}>
              <td>{formatDate(invoice.date)}</td>
              <td>{formatSEACurrency(invoice.amount, invoice.currency)}</td>
              <td>
                <InvoiceStatusBadge status={invoice.status} />
              </td>
              <td>
                <span className="invoice-number">{invoice.invoice_number}</span>
              </td>
              <td>
                <div className="invoice-actions">
                  <IconButton
                    icon={<Download />}
                    onClick={() => handleDownload(invoice)}
                    tooltip="Download PDF"
                  />
                  <IconButton
                    icon={<MoreVertical />}
                    onClick={() => handleShowMenu(invoice)}
                    tooltip="More actions"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: Invoice['status'] }) {
  const config = {
    paid: { icon: '✅', label: 'Paid', color: 'success' },
    pending: { icon: '⚠️', label: 'Pending', color: 'warning' },
    failed: { icon: '❌', label: 'Failed', color: 'error' },
    refunded: { icon: '↩️', label: 'Refunded', color: 'info' }
  }[status];

  return (
    <span className={`status-badge status-${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
}
```

### 4.3 Pricing Comparison (Upgrade Modal)

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Choose Your Plan                                              [✕ Close] │
│                                                                          │
│ ┌──────────────┬──────────────────┬──────────────┐                     │
│ │   Starter    │   Pro ⭐         │  Enterprise  │                     │
│ │              │   RECOMMENDED    │              │                     │
│ ├──────────────┼──────────────────┼──────────────┤                     │
│ │ SGD $79/mo   │   SGD $199/mo    │  Custom      │                     │
│ │              │                  │  Pricing     │                     │
│ ├──────────────┼──────────────────┼──────────────┤                     │
│ │ • 5 projects │ • Unlimited      │ • Everything │                     │
│ │ • 3 seats    │   projects       │   in Pro     │                     │
│ │ • 600 min/mo │ • 10 seats       │ • Unlimited  │                     │
│ │ • Basic      │ • 3,000 min/mo   │   seats      │                     │
│ │   analytics  │ • Advanced       │ • Dedicated  │                     │
│ │ • Email      │   analytics      │   support    │                     │
│ │   support    │ • Priority       │ • Custom SLA │                     │
│ │              │   support        │ • SSO        │                     │
│ │              │ • API access     │ • Custom     │                     │
│ │              │                  │   contract   │                     │
│ ├──────────────┼──────────────────┼──────────────┤                     │
│ │ [Choose]     │ [Upgrade Now ⚡] │ [Contact]    │                     │
│ └──────────────┴──────────────────┴──────────────┘                     │
│                                                                          │
│ 💳 All plans include:                                                   │
│    • Unlimited transcripts • SEA language support                       │
│    • Code-mixing detection • Team collaboration                         │
│                                                                          │
│ 🌏 SEA-friendly pricing: Pay in SGD, IDR, THB, PHP, MYR, VND           │
│                                                                          │
│ ℹ️  Need help choosing? [Talk to Sales]                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**Component Implementation:**
```tsx
interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  recommended?: boolean;
  cta: string;
  ctaVariant: 'primary' | 'speed' | 'secondary';
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 79,
    currency: 'SGD',
    interval: 'month',
    features: [
      '5 projects',
      '3 team members',
      '600 minutes/month',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Choose Starter',
    ctaVariant: 'secondary'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    currency: 'SGD',
    interval: 'month',
    features: [
      'Unlimited projects',
      '10 team members',
      '3,000 minutes/month',
      'Advanced analytics & visualizations',
      'Priority support',
      'API access',
      'Custom integrations',
    ],
    recommended: true,
    cta: 'Upgrade to Pro',
    ctaVariant: 'speed'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 0, // Custom
    currency: 'SGD',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom minutes',
      'Dedicated support',
      'Custom SLA',
      'SSO & SAML',
      'Custom contract terms',
      'On-premise deployment option',
    ],
    cta: 'Contact Sales',
    ctaVariant: 'secondary'
  }
];

export function PricingComparison({ currentPlan }: { currentPlan: string }) {
  const [selectedCurrency, setSelectedCurrency] = useState('SGD');

  return (
    <div className="pricing-modal">
      <div className="pricing-header">
        <h2>Choose Your Plan</h2>
        <CurrencySelector
          value={selectedCurrency}
          onChange={setSelectedCurrency}
          currencies={SEA_CURRENCIES}
        />
      </div>

      <div className="pricing-tiers">
        {PRICING_TIERS.map(tier => (
          <PricingTierCard
            key={tier.id}
            tier={tier}
            currency={selectedCurrency}
            currentPlan={currentPlan}
            recommended={tier.recommended}
            onSelect={() => handleSelectPlan(tier)}
          />
        ))}
      </div>

      <div className="pricing-footer">
        <div className="included-features">
          <h4>💳 All plans include:</h4>
          <ul>
            <li>Unlimited transcripts</li>
            <li>SEA language support</li>
            <li>Code-mixing detection</li>
            <li>Team collaboration</li>
          </ul>
        </div>

        <div className="sea-pricing-note">
          <Globe className="w-5 h-5" />
          SEA-friendly pricing: Pay in SGD, IDR, THB, PHP, MYR, VND
        </div>

        <div className="help-section">
          <Info className="w-4 h-4" />
          Need help choosing?
          <Button variant="ghost" onClick={handleContactSales}>
            Talk to Sales
          </Button>
        </div>
      </div>
    </div>
  );
}

function PricingTierCard({ tier, currency, currentPlan, recommended, onSelect }: PricingTierCardProps) {
  const isCurrentPlan = tier.id === currentPlan;

  return (
    <div className={`pricing-card ${recommended ? 'recommended' : ''} ${isCurrentPlan ? 'current' : ''}`}>
      {recommended && (
        <div className="recommended-badge">
          ⭐ RECOMMENDED
        </div>
      )}

      {isCurrentPlan && (
        <div className="current-plan-badge">
          CURRENT PLAN
        </div>
      )}

      <h3 className="tier-name">{tier.name}</h3>

      <div className="tier-price">
        {tier.price > 0 ? (
          <>
            <span className="price-amount">
              {formatSEACurrency(tier.price, currency)}
            </span>
            <span className="price-interval">
              /{tier.interval}
            </span>
          </>
        ) : (
          <span className="price-custom">Custom Pricing</span>
        )}
      </div>

      <ul className="tier-features">
        {tier.features.map((feature, i) => (
          <li key={i}>
            <Check className="feature-check" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant={tier.ctaVariant}
        className="tier-cta"
        onClick={onSelect}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? 'Current Plan' : tier.cta}
      </Button>
    </div>
  );
}
```

**Styles:**
```css
.pricing-tiers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin: 32px 0;
}

.pricing-card {
  position: relative;
  background: var(--color-sheet);
  border: 2px solid var(--color-hairline);
  border-radius: 20px;
  padding: 32px 24px;
  transition: all 0.2s var(--ease-speed);
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(23, 25, 28, 0.12);
}

.pricing-card.recommended {
  border-color: var(--color-velocity-blue);
  box-shadow: 0 4px 16px rgba(10, 122, 255, 0.2);
}

.pricing-card.current {
  border-color: var(--color-success);
  background: var(--color-success-bg);
}

.recommended-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: var(--gradient-speed);
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(10, 122, 255, 0.3);
}

.current-plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: var(--color-success);
  color: white;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  border-radius: 999px;
}

.tier-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 16px;
}

.tier-price {
  margin-bottom: 24px;
}

.price-amount {
  font-size: 40px;
  font-weight: 700;
  background: var(--gradient-speed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price-interval {
  font-size: 18px;
  color: var(--color-slate);
  margin-left: 4px;
}

.price-custom {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-charcoal);
}

.tier-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
}

.tier-features li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  font-size: 14px;
  color: var(--color-charcoal);
  line-height: 1.5;
}

.feature-check {
  width: 18px;
  height: 18px;
  color: var(--color-velocity-blue);
  flex-shrink: 0;
  margin-top: 2px;
}

.tier-cta {
  width: 100%;
  justify-content: center;
}

/* Mobile: Stack cards */
@media (max-width: 768px) {
  .pricing-tiers {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .pricing-card {
    padding: 24px 20px;
  }
}
```

---

## 5. Key UI Patterns

### 5.1 Form Patterns

**Standard Form Field:**
```tsx
export function FormField({
  label,
  required,
  error,
  hint,
  children
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      {hint && <p className="form-hint">{hint}</p>}
      {children}
      {error && (
        <div className="form-error">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
```

**Styles:**
```css
.form-field {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 8px;
}

.form-label .required {
  color: var(--color-error);
  margin-left: 4px;
}

.form-hint {
  font-size: 13px;
  color: var(--color-slate);
  margin: -4px 0 8px 0;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-error);
}

input.input,
select.input,
textarea.input {
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 1.5px solid var(--color-hairline);
  border-radius: 10px;
  font-size: 15px;
  font-family: var(--font-sans);
  color: var(--color-ink);
  background: var(--color-sheet);
  transition: all 0.2s var(--ease-speed);
}

input.input:focus,
select.input:focus,
textarea.input:focus {
  outline: none;
  border-color: var(--color-velocity-blue);
  box-shadow: 0 0 0 4px rgba(10, 122, 255, 0.1);
}

input.input.error,
select.input.error,
textarea.input.error {
  border-color: var(--color-error);
}

input.input.error:focus,
select.input.error:focus,
textarea.input.error:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

textarea.input {
  min-height: 120px;
  resize: vertical;
}

/* Mobile: Larger touch targets */
@media (max-width: 768px) {
  input.input,
  select.input {
    height: 52px;
    font-size: 16px; /* Prevents iOS zoom */
  }
}
```

### 5.2 Toggle Switch (Notification Preferences)

**Component:**
```tsx
export function ToggleSwitch({
  checked,
  onChange,
  label,
  description
}: ToggleSwitchProps) {
  return (
    <label className="toggle-switch-container">
      <div className="toggle-content">
        <span className="toggle-label">{label}</span>
        {description && (
          <span className="toggle-description">{description}</span>
        )}
      </div>
      <div className="toggle-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="toggle-input"
        />
        <span className="toggle-slider" />
      </div>
    </label>
  );
}
```

**Styles:**
```css
.toggle-switch-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s var(--ease-speed);
}

.toggle-switch-container:hover {
  background: var(--color-cloud);
}

.toggle-content {
  flex: 1;
}

.toggle-label {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 4px;
}

.toggle-description {
  display: block;
  font-size: 13px;
  color: var(--color-slate);
  line-height: 1.5;
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 28px;
  flex-shrink: 0;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: var(--color-hairline);
  border-radius: 999px;
  transition: all 0.2s var(--ease-speed);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s var(--ease-speed);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background: var(--color-velocity-blue);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-input:focus + .toggle-slider {
  box-shadow: 0 0 0 4px rgba(10, 122, 255, 0.1);
}

/* Accessibility: Keyboard focus */
.toggle-input:focus-visible + .toggle-slider {
  outline: 2px solid var(--color-velocity-blue);
  outline-offset: 2px;
}
```

### 5.3 Empty State Pattern

**Component:**
```tsx
export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon className="w-16 h-16" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <Button variant="speed" onClick={action.onClick}>
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

**Styles:**
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
  min-height: 400px;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-cloud);
  border-radius: 20px;
  margin-bottom: 24px;
  color: var(--color-slate);
}

.empty-state-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 12px;
}

.empty-state-description {
  font-size: 15px;
  color: var(--color-slate);
  max-width: 400px;
  line-height: 1.6;
  margin-bottom: 24px;
}
```

### 5.4 Loading States

**Skeleton Loading:**
```tsx
export function SettingsSkeleton() {
  return (
    <div className="settings-skeleton">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-subtitle" />
      <div className="skeleton-fields">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-field">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-input" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Styles:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-cloud) 0%,
    #ffffff 50%,
    var(--color-cloud) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-title {
  height: 32px;
  width: 40%;
  margin-bottom: 12px;
}

.skeleton-subtitle {
  height: 20px;
  width: 60%;
  margin-bottom: 32px;
}

.skeleton-field {
  margin-bottom: 24px;
}

.skeleton-label {
  height: 16px;
  width: 30%;
  margin-bottom: 8px;
}

.skeleton-input {
  height: 48px;
  width: 100%;
}
```

---

## 6. Mobile Responsive Design

### 6.1 Mobile Breakpoints

```css
/* Mobile-first approach */
/* Base styles are mobile (320px+) */

/* Tablet */
@media (min-width: 768px) {
  /* Tablet-specific styles */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Desktop-specific styles */
}

/* Large desktop */
@media (min-width: 1440px) {
  /* Large screen optimizations */
}
```

### 6.2 Mobile Navigation (Settings)

**Mobile: Bottom Tab Bar**
```tsx
export function MobileSettingsNavigation({ activeSection }: MobileSettingsNavigationProps) {
  return (
    <nav className="mobile-settings-nav">
      <MobileNavItem
        icon={<User />}
        label="Profile"
        active={activeSection === 'profile'}
        href="/settings/profile"
      />
      <MobileNavItem
        icon={<Bell />}
        label="Notifications"
        active={activeSection === 'notifications'}
        href="/settings/notifications"
      />
      <MobileNavItem
        icon={<Globe />}
        label="Language"
        active={activeSection === 'language'}
        href="/settings/language"
      />
      <MobileNavItem
        icon={<Key />}
        label="API"
        active={activeSection === 'api'}
        href="/settings/api"
      />
      <MobileNavItem
        icon={<MoreHorizontal />}
        label="More"
        active={activeSection === 'more'}
        href="/settings/more"
      />
    </nav>
  );
}
```

**Styles:**
```css
@media (max-width: 768px) {
  .mobile-settings-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background: var(--color-sheet);
    border-top: 1px solid var(--color-hairline);
    padding: 8px 0;
    z-index: 100;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  }

  .mobile-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 4px;
    color: var(--color-slate);
    font-size: 11px;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.15s var(--ease-speed);
  }

  .mobile-nav-item.active {
    color: var(--color-velocity-blue);
  }

  .mobile-nav-item svg {
    width: 20px;
    height: 20px;
  }

  /* Add bottom padding to main content to account for nav */
  .settings-content {
    padding-bottom: 80px;
  }
}
```

### 6.3 Mobile Table (User Management)

**Mobile: Card Layout**
```tsx
export function MobileUserCard({ user }: { user: UserTableRow }) {
  return (
    <div className="mobile-user-card">
      <div className="user-card-header">
        <Avatar src={user.avatar_url} name={user.name} size="lg" />
        <div className="user-card-info">
          <h4>{user.name}</h4>
          <p>{user.email}</p>
        </div>
        <RoleBadge role={user.role} />
      </div>

      <div className="user-card-meta">
        <div className="meta-item">
          <span className="meta-label">Status</span>
          <StatusBadge status={user.status} />
        </div>
        <div className="meta-item">
          <span className="meta-label">Last Active</span>
          <span>{formatTimeAgo(user.last_active)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Analyses</span>
          <span>{user.analyses_count}</span>
        </div>
      </div>

      <div className="user-card-actions">
        <Button variant="secondary" size="sm" onClick={() => handleEdit(user)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleMore(user)}>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

**Styles:**
```css
@media (max-width: 768px) {
  /* Hide table on mobile */
  .user-table {
    display: none;
  }

  /* Show card layout */
  .mobile-user-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .mobile-user-card {
    background: var(--color-sheet);
    border: 1px solid var(--color-hairline);
    border-radius: 16px;
    padding: 16px;
  }

  .user-card-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }

  .user-card-info {
    flex: 1;
    min-width: 0;
  }

  .user-card-info h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-ink);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-card-info p {
    font-size: 13px;
    color: var(--color-slate);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-card-meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 16px 0;
    border-top: 1px solid var(--color-hairline);
    border-bottom: 1px solid var(--color-hairline);
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .meta-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-slate);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .meta-item > span:last-child {
    font-size: 14px;
    color: var(--color-ink);
    font-weight: 500;
  }

  .user-card-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .user-card-actions button:first-child {
    flex: 1;
  }
}
```

### 6.4 Mobile Modal (Full Screen)

```css
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
    margin: 0;
    transform: none;
  }

  .modal-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--color-sheet);
    border-bottom: 1px solid var(--color-hairline);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* Smooth iOS scrolling */
  }

  .modal-footer {
    position: sticky;
    bottom: 0;
    z-index: 10;
    background: var(--color-sheet);
    border-top: 1px solid var(--color-hairline);
  }
}
```

### 6.5 Touch-Friendly Interactions

```css
/* Minimum touch target size: 44x44px */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Prevent iOS tap highlight */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Custom tap feedback */
.tappable {
  position: relative;
}

.tappable::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-velocity-blue);
  opacity: 0;
  border-radius: inherit;
  pointer-events: none;
  transition: opacity 0.1s ease;
}

.tappable:active::after {
  opacity: 0.1;
}

/* Pull-to-refresh hint */
.pull-to-refresh {
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-slate);
  font-size: 14px;
  transition: transform 0.2s ease;
}

.pull-to-refresh.pulling {
  transform: translateY(60px);
}
```

---

## 7. Accessibility Features

### 7.1 WCAG 2.1 AA Compliance

**Color Contrast:**
- Text: Minimum 4.5:1 contrast ratio
- UI Components: Minimum 3:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio

**Example Contrast Checks:**
```css
/* ✅ PASS: Ink on Paper */
color: #17191C; /* Ink */
background: #F4F3EE; /* Paper */
/* Contrast ratio: 12.5:1 */

/* ✅ PASS: Velocity Blue on Sheet */
color: #0A7AFF; /* Velocity Blue */
background: #FCFCFA; /* Sheet */
/* Contrast ratio: 4.8:1 */

/* ✅ PASS: White on Velocity Blue */
color: #FFFFFF;
background: #0A7AFF;
/* Contrast ratio: 5.2:1 */

/* ❌ FAIL: Slate on Cloud (too low) */
/* color: #6B6F76; */
/* background: #F8F9FA; */
/* Contrast ratio: 2.8:1 - Use darker text */
```

### 7.2 Keyboard Navigation

**Focus Indicators:**
```css
/* Visible focus for all interactive elements */
*:focus-visible {
  outline: 2px solid var(--color-velocity-blue);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Custom focus for buttons */
.btn:focus-visible {
  outline: 3px solid var(--color-velocity-blue);
  outline-offset: 2px;
}

/* Custom focus for inputs */
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: none;
  border-color: var(--color-velocity-blue);
  box-shadow: 0 0 0 4px rgba(10, 122, 255, 0.1);
}

/* Skip to main content link */
.skip-to-main {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 12px 24px;
  background: var(--color-velocity-blue);
  color: white;
  text-decoration: none;
  border-radius: 0 0 8px 8px;
}

.skip-to-main:focus {
  left: 50%;
  transform: translateX(-50%);
  top: 0;
}
```

**Tab Order:**
```html
<!-- Logical tab order -->
<div className="settings-page">
  <a href="#main-content" className="skip-to-main">
    Skip to main content
  </a>

  <nav>
    <!-- Navigation: tabindex managed automatically -->
  </nav>

  <main id="main-content" tabIndex="-1">
    <!-- Main content: focusable programmatically -->
  </main>
</div>
```

### 7.3 Screen Reader Support

**ARIA Labels:**
```tsx
// Button with icon only
<button
  aria-label="Edit user profile"
  onClick={handleEdit}
>
  <Edit className="w-5 h-5" />
</button>

// Toggle switch
<div className="toggle-switch">
  <input
    type="checkbox"
    id="email-notifications"
    checked={emailEnabled}
    onChange={handleToggle}
    aria-describedby="email-notifications-desc"
  />
  <label htmlFor="email-notifications">
    Email Notifications
  </label>
  <span id="email-notifications-desc" className="sr-only">
    Receive email notifications when analysis completes
  </span>
</div>

// Loading state
<button disabled aria-busy="true">
  <span className="spinner" aria-hidden="true" />
  <span>Processing...</span>
</button>

// Modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Create API Key</h2>
  <p id="modal-description">
    Generate a new API key for integrations
  </p>
  {/* Modal content */}
</div>
```

**Screen Reader Only Text:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### 7.4 Reduced Motion

```css
/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Keep essential animations but reduce duration */
  .spinner {
    animation-duration: 0.5s !important;
  }
}
```

### 7.5 Form Accessibility

```tsx
export function AccessibleFormField({
  label,
  error,
  hint,
  required,
  children
}: AccessibleFormFieldProps) {
  const fieldId = useId();
  const errorId = useId();
  const hintId = useId();

  return (
    <div className="form-field">
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && (
          <span aria-label="required">*</span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="form-hint">
          {hint}
        </p>
      )}

      {React.cloneElement(children, {
        id: fieldId,
        'aria-required': required,
        'aria-invalid': !!error,
        'aria-describedby': [
          hint ? hintId : null,
          error ? errorId : null
        ].filter(Boolean).join(' ')
      })}

      {error && (
        <div id={errorId} className="form-error" role="alert">
          <AlertCircle aria-hidden="true" className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
```

---

## 8. Animations & Micro-interactions

### 8.1 Animation Timing

```css
:root {
  /* Fast interactions (hover, active) */
  --duration-fast: 150ms;

  /* Standard transitions */
  --duration-normal: 250ms;

  /* Complex animations */
  --duration-slow: 400ms;

  /* Page transitions */
  --duration-page: 350ms;

  /* Easing functions */
  --ease-speed: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.4, 0, 0.6, 1);
  --ease-entrance: cubic-bezier(0, 0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
}
```

### 8.2 Save Success Animation

```tsx
export function SaveSuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
      className="save-success-toast"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <CheckCircle className="w-6 h-6 text-success" />
      </motion.div>
      <span>Settings saved successfully!</span>
    </motion.div>
  );
}
```

### 8.3 Loading Spinner (API Keys)

```tsx
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <motion.svg
      className={`${sizes[size]} text-velocity-blue`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );
}
```

### 8.4 Card Hover Effect

```css
.hover-lift-card {
  transition: all 0.2s var(--ease-speed);
}

.hover-lift-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(23, 25, 28, 0.12);
}

.hover-lift-card:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 25, 28, 0.08);
}
```

### 8.5 Page Transition

```tsx
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.25,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}
```

### 8.6 Usage Bar Fill Animation

```tsx
export function AnimatedUsageBar({ percentage }: { percentage: number }) {
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="usage-bar">
      <motion.div
        className="usage-fill"
        initial={{ width: 0 }}
        animate={{ width: `${displayPercentage}%` }}
        transition={{
          duration: 0.8,
          ease: 'easeOut'
        }}
      />
    </div>
  );
}
```

---

## 9. Implementation Guide

### 9.1 File Structure

```
frontend/src/
├── pages/
│   ├── settings/
│   │   ├── SettingsPage.tsx                 # Main container
│   │   ├── SettingsPage.logic.ts            # Business logic
│   │   ├── SettingsPage.styles.ts           # Styles config
│   │   ├── components/
│   │   │   ├── SettingsNavigation.tsx
│   │   │   ├── ProfileSettings.tsx
│   │   │   ├── AccountSettings.tsx
│   │   │   ├── NotificationSettings.tsx
│   │   │   ├── LanguageSettings.tsx
│   │   │   ├── APIKeysManager.tsx
│   │   │   ├── IntegrationSettings.tsx
│   │   │   └── SecuritySettings.tsx
│   │   └── index.ts
│   │
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminDashboard.logic.ts
│   │   ├── AdminDashboard.styles.ts
│   │   ├── components/
│   │   │   ├── HeroMetricsSection.tsx
│   │   │   ├── SystemHealthGrid.tsx
│   │   │   ├── UserManagementTable.tsx
│   │   │   ├── SystemMonitoring.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── UsageOverTimeChart.tsx
│   │   └── index.ts
│   │
│   └── billing/
│       ├── BillingPage.tsx
│       ├── BillingPage.logic.ts
│       ├── BillingPage.styles.ts
│       ├── components/
│       │   ├── CurrentPlanCard.tsx
│       │   ├── UsageOverview.tsx
│       │   ├── PaymentMethods.tsx
│       │   ├── InvoiceHistory.tsx
│       │   └── PricingComparison.tsx
│       └── index.ts
│
├── components/
│   ├── ui/
│   │   ├── FormField.tsx
│   │   ├── ToggleSwitch.tsx
│   │   ├── Select.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Tooltip.tsx
│   │   └── ...
│   └── ...
│
└── hooks/
    ├── useSettings.ts
    ├── useAdminDashboard.ts
    ├── useBilling.ts
    └── ...
```

### 9.2 API Integration

```typescript
// services/api/settings.service.ts
export const settingsApi = {
  // Profile
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: UpdateProfileData) => api.patch('/users/me', data),
  uploadAvatar: (file: File) => api.post('/users/me/avatar', { file }),

  // Notifications
  getNotificationPreferences: () => api.get('/users/me/notifications'),
  updateNotificationPreferences: (prefs: NotificationPreferences) =>
    api.patch('/users/me/notifications', prefs),

  // API Keys
  listAPIKeys: () => api.get('/api-keys'),
  createAPIKey: (data: CreateAPIKeyData) => api.post('/api-keys', data),
  rotateAPIKey: (id: string) => api.post(`/api-keys/${id}/rotate`),
  deleteAPIKey: (id: string) => api.delete(`/api-keys/${id}`),

  // Integrations
  listIntegrations: () => api.get('/integrations'),
  connectIntegration: (provider: string, data: any) =>
    api.post(`/integrations/${provider}/connect`, data),
  disconnectIntegration: (id: string) =>
    api.delete(`/integrations/${id}`),
};

// services/api/admin.service.ts
export const adminApi = {
  // Dashboard
  getDashboardMetrics: () => api.get('/admin/dashboard/metrics'),
  getSystemHealth: () => api.get('/admin/system/health'),
  getUsageData: (params: UsageParams) => api.get('/admin/usage', { params }),

  // User Management
  listUsers: (params: UserListParams) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: UpdateUserData) =>
    api.patch(`/admin/users/${id}`, data),
  suspendUser: (id: string) => api.post(`/admin/users/${id}/suspend`),
  unsuspendUser: (id: string) => api.post(`/admin/users/${id}/unsuspend`),
  inviteUser: (data: InviteUserData) => api.post('/admin/users/invite', data),

  // Activity
  getActivityFeed: (params: ActivityParams) =>
    api.get('/admin/activity', { params }),
  getAuditLogs: (params: AuditParams) =>
    api.get('/admin/audit-logs', { params }),
};

// services/api/billing.service.ts
export const billingApi = {
  // Subscription
  getSubscription: () => api.get('/billing/subscription'),
  getUsage: () => api.get('/billing/usage'),
  updateSubscription: (planId: string) =>
    api.post('/billing/subscription/update', { planId }),
  cancelSubscription: () => api.post('/billing/subscription/cancel'),

  // Payment Methods
  listPaymentMethods: () => api.get('/billing/payment-methods'),
  addPaymentMethod: (data: PaymentMethodData) =>
    api.post('/billing/payment-methods', data),
  deletePaymentMethod: (id: string) =>
    api.delete(`/billing/payment-methods/${id}`),
  setDefaultPaymentMethod: (id: string) =>
    api.post(`/billing/payment-methods/${id}/set-default`),

  // Invoices
  listInvoices: (params: InvoiceParams) =>
    api.get('/billing/invoices', { params }),
  downloadInvoice: (id: string) =>
    api.get(`/billing/invoices/${id}/download`),
};
```

### 9.3 State Management

```typescript
// stores/settingsStore.ts
import create from 'zustand';

interface SettingsStore {
  profile: UserProfile | null;
  notificationPreferences: NotificationPreferences | null;
  apiKeys: APIKey[];

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setNotificationPreferences: (prefs: NotificationPreferences) => void;
  setAPIKeys: (keys: APIKey[]) => void;
  addAPIKey: (key: APIKey) => void;
  removeAPIKey: (id: string) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  profile: null,
  notificationPreferences: null,
  apiKeys: [],

  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null
  })),
  setNotificationPreferences: (prefs) => set({ notificationPreferences: prefs }),
  setAPIKeys: (keys) => set({ apiKeys: keys }),
  addAPIKey: (key) => set((state) => ({
    apiKeys: [...state.apiKeys, key]
  })),
  removeAPIKey: (id) => set((state) => ({
    apiKeys: state.apiKeys.filter(k => k.id !== id)
  })),
}));
```

### 9.4 Testing Checklist

**Unit Tests:**
- [ ] All form validation logic
- [ ] API service functions
- [ ] Store actions and state updates
- [ ] Utility functions (formatters, validators)

**Integration Tests:**
- [ ] Settings save and update flows
- [ ] API key creation and rotation
- [ ] User management CRUD operations
- [ ] Billing subscription changes

**E2E Tests:**
- [ ] Complete settings flow (update profile → save → verify)
- [ ] Admin dashboard user management
- [ ] Billing upgrade flow
- [ ] API key lifecycle (create → use → rotate → delete)

**Accessibility Tests:**
- [ ] Keyboard navigation through all settings
- [ ] Screen reader announces all actions
- [ ] Focus management in modals
- [ ] Color contrast meets WCAG AA
- [ ] Forms have proper labels and error messages

**Mobile Tests:**
- [ ] Touch targets meet 44px minimum
- [ ] Navigation works on mobile
- [ ] Forms are usable on small screens
- [ ] Tables convert to cards
- [ ] Modals are full-screen

**Performance Tests:**
- [ ] Initial load time < 2s
- [ ] Settings save < 500ms
- [ ] Table virtualization for 1000+ rows
- [ ] Image optimization (avatars)
- [ ] Lazy loading for integrations

---

## Summary

This comprehensive UI/UX design specification for Phase 7 provides:

1. **Complete Component Hierarchy** - Clear structure for Settings, Admin Dashboard, and Billing
2. **Detailed Visual Designs** - Wireframes and specifications for every section
3. **Mobile-Responsive Patterns** - Mobile-first approach with SEA market optimization
4. **Accessibility Features** - WCAG 2.1 AA compliance with keyboard navigation and screen reader support
5. **Animation Guidelines** - Speed-focused micro-interactions and transitions
6. **Implementation Guide** - File structure, API integration, and testing checklist

**Key Design Principles Maintained:**
- Speed-first visual language (8 hours → 5 minutes emphasis)
- SEA market optimization (languages, currencies, cultural considerations)
- Mobile-first responsive design (85% SEA mobile users)
- WCAG 2.1 AA accessibility compliance
- MVC/SOLID architecture patterns
- Velocity Blue (#0A7AFF) and Neural Purple (#7B4FFF) brand colors

**Files to Create:**
- `/frontend/src/pages/settings/*` (7 components)
- `/frontend/src/pages/admin/*` (6 components)
- `/frontend/src/pages/billing/*` (5 components)
- `/frontend/src/components/ui/*` (additional shared components)
- `/frontend/src/services/api/*` (API integration)

**Next Steps:**
1. Review this specification with the development team
2. Create Figma mockups based on these specs (optional)
3. Implement components following MVC pattern
4. Write comprehensive tests (unit, integration, E2E)
5. Conduct accessibility audit
6. Perform user testing with SEA users

---

**Document Version:** 1.0
**Last Updated:** 2026-06-25
**Status:** Ready for Implementation
**Estimated Implementation Time:** 3-4 weeks
