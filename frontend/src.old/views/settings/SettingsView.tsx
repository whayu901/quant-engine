/**
 * Settings View - SOLID: Interface Segregation Principle
 * Pure presentation component - NO business logic
 * All data and handlers passed as props
 */

import React from 'react';
import { UserSettings } from '../../models/entities/UserSettings';
import { APIKey } from '../../models/entities/APIKey';

// ISP: Segregated interfaces for different concerns
export interface SettingsViewProps {
  settings: UserSettings | null;
  apiKeys: APIKey[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export interface ProfileSectionProps {
  profile: UserSettings['profile'];
  isSaving: boolean;
  onUpdate: (profile: Partial<UserSettings['profile']>) => void;
  onUploadAvatar: (file: File) => void;
  onDeleteAvatar: () => void;
}

export interface NotificationSectionProps {
  notifications: UserSettings['notifications'];
  isSaving: boolean;
  onUpdate: (notifications: Partial<UserSettings['notifications']>) => void;
}

export interface LanguageSectionProps {
  language: UserSettings['language'];
  isSaving: boolean;
  onUpdate: (language: Partial<UserSettings['language']>) => void;
}

export interface SecuritySectionProps {
  security: UserSettings['security'];
  isSaving: boolean;
  onUpdate: (security: Partial<UserSettings['security']>) => void;
}

export interface IntegrationSectionProps {
  integrations: UserSettings['integrations'];
  isSaving: boolean;
  onUpdate: (integrations: Partial<UserSettings['integrations']>) => void;
}

export interface APIKeysSectionProps {
  apiKeys: APIKey[];
  isLoading: boolean;
  onCreate: (name: string, permissions: string[], expiresAt?: Date) => void;
  onRotate: (keyId: string) => void;
  onRevoke: (keyId: string) => void;
}

/**
 * Settings View Component
 * Pure presentation - delegates all actions to parent
 */
export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  apiKeys,
  isLoading,
  isSaving,
  error,
  activeSection,
  onSectionChange
}) => {
  if (isLoading && !settings) {
    return (
      <div className="settings-view loading">
        <div className="loading-spinner">Loading settings...</div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="settings-view error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="settings-view">
      <SettingsNavigation
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        userProfile={settings.profile}
      />

      <div className="settings-content">
        {activeSection === 'profile' && (
          <ProfileSection profile={settings.profile} isSaving={isSaving} />
        )}

        {activeSection === 'notifications' && (
          <NotificationSection notifications={settings.notifications} isSaving={isSaving} />
        )}

        {activeSection === 'language' && (
          <LanguageSection language={settings.language} isSaving={isSaving} />
        )}

        {activeSection === 'security' && (
          <SecuritySection security={settings.security} isSaving={isSaving} />
        )}

        {activeSection === 'integrations' && (
          <IntegrationSection integrations={settings.integrations} isSaving={isSaving} />
        )}

        {activeSection === 'api-keys' && (
          <APIKeysSection apiKeys={apiKeys} isLoading={isLoading} />
        )}
      </div>

      {error && (
        <div className="settings-error-toast">
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Settings Navigation - Pure presentation
 */
interface SettingsNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userProfile: UserSettings['profile'];
}

const SettingsNavigation: React.FC<SettingsNavigationProps> = ({
  activeSection,
  onSectionChange,
  userProfile
}) => {
  const sections = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'account', label: 'Account', icon: 'settings' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'language', label: 'Language & Region', icon: 'globe' },
    { id: 'api-keys', label: 'API Keys', icon: 'key' },
    { id: 'integrations', label: 'Integrations', icon: 'plug' },
    { id: 'security', label: 'Security', icon: 'shield' }
  ];

  return (
    <nav className="settings-navigation">
      <div className="navigation-header">
        <div className="user-avatar">
          {userProfile.avatarUrl ? (
            <img src={userProfile.avatarUrl} alt={userProfile.fullName} />
          ) : (
            <div className="avatar-placeholder">
              {userProfile.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="user-info">
          <div className="user-name">{userProfile.fullName}</div>
          {userProfile.company && (
            <div className="user-company">{userProfile.company}</div>
          )}
        </div>
      </div>

      <ul className="navigation-list">
        {sections.map(section => (
          <li key={section.id}>
            <button
              className={`navigation-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              <span className={`icon icon-${section.icon}`} />
              <span className="label">{section.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="navigation-footer">
        <div className="version-info">v2.4.1</div>
      </div>
    </nav>
  );
};

/**
 * Profile Section - Pure presentation
 */
const ProfileSection: React.FC<Partial<ProfileSectionProps>> = ({ profile, isSaving }) => {
  if (!profile) return null;

  return (
    <div className="settings-section profile-section">
      <div className="section-header">
        <h2>Profile Settings</h2>
        <p>Manage your personal information and preferences</p>
      </div>

      <div className="section-content">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            defaultValue={profile.fullName}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            defaultValue={profile.jobTitle}
            placeholder="e.g., Senior Research Manager"
          />
        </div>

        <div className="form-group">
          <label>Company</label>
          <input
            type="text"
            defaultValue={profile.company}
            placeholder="Your organization name"
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            defaultValue={profile.bio}
            placeholder="Tell us about yourself"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary">Cancel</button>
          <button className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Notification Section - Pure presentation
 */
const NotificationSection: React.FC<Partial<NotificationSectionProps>> = ({
  notifications,
  isSaving
}) => {
  if (!notifications) return null;

  return (
    <div className="settings-section notification-section">
      <div className="section-header">
        <h2>Notification Preferences</h2>
        <p>Control how you receive notifications</p>
      </div>

      <div className="section-content">
        <div className="notification-group">
          <h3>Email Notifications</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              defaultChecked={notifications.email.projectUpdates}
            />
            <span>Project updates</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              defaultChecked={notifications.email.analysisComplete}
            />
            <span>Analysis complete</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              defaultChecked={notifications.email.weeklyDigest}
            />
            <span>Weekly digest</span>
          </label>
        </div>

        <div className="notification-group">
          <h3>Push Notifications</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              defaultChecked={notifications.push.projectUpdates}
            />
            <span>Project updates</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              defaultChecked={notifications.push.mentions}
            />
            <span>Mentions</span>
          </label>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Language Section - Pure presentation with SEA focus
 */
const LanguageSection: React.FC<Partial<LanguageSectionProps>> = ({ language, isSaving }) => {
  if (!language) return null;

  const seaLanguages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'th', name: 'Thai', native: 'ภาษาไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'tl', name: 'Filipino', native: 'Filipino', flag: '🇵🇭' },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'zh-Hans', name: 'Chinese (Simplified)', native: '简体中文', flag: '🇸🇬' }
  ];

  return (
    <div className="settings-section language-section">
      <div className="section-header">
        <h2>Language & Region</h2>
        <p>Customize your language and regional preferences</p>
      </div>

      <div className="section-content">
        <div className="form-group">
          <label>Interface Language</label>
          <select defaultValue={language.interfaceLanguage}>
            {seaLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.native}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date Format</label>
          <select defaultValue={language.dateFormat}>
            <option value="DD/MM/YYYY">DD/MM/YYYY (25/06/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (06/25/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-06-25)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Currency Display</label>
          <select defaultValue={language.currency}>
            <option value="SGD">SGD $ (Singapore Dollar)</option>
            <option value="IDR">IDR Rp (Indonesian Rupiah)</option>
            <option value="THB">THB ฿ (Thai Baht)</option>
            <option value="USD">USD $ (US Dollar)</option>
          </select>
        </div>

        <div className="info-box">
          <span className="icon-info">ℹ️</span>
          Code-mixing detection is always enabled for SEA languages
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Security Section - Pure presentation
 */
const SecuritySection: React.FC<Partial<SecuritySectionProps>> = ({ security, isSaving }) => {
  if (!security) return null;

  return (
    <div className="settings-section security-section">
      <div className="section-header">
        <h2>Security Settings</h2>
        <p>Manage your account security and authentication</p>
      </div>

      <div className="section-content">
        <div className="security-item">
          <div className="security-info">
            <h3>Two-Factor Authentication</h3>
            <p>Add an extra layer of security to your account</p>
          </div>
          <button className="btn btn-secondary">
            {security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>

        <div className="security-item">
          <div className="security-info">
            <h3>Session Timeout</h3>
            <p>Automatically log out after inactivity</p>
          </div>
          <select defaultValue={security.sessionTimeout}>
            <option value={3600000}>1 hour</option>
            <option value={28800000}>8 hours</option>
            <option value={86400000}>24 hours</option>
          </select>
        </div>

        <div className="security-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              defaultChecked={security.loginAlerts}
            />
            <span>Send alerts for new login attempts</span>
          </label>
        </div>
      </div>
    </div>
  );
};

/**
 * Integration Section - Pure presentation
 */
const IntegrationSection: React.FC<Partial<IntegrationSectionProps>> = ({
  integrations,
  isSaving
}) => {
  if (!integrations) return null;

  return (
    <div className="settings-section integration-section">
      <div className="section-header">
        <h2>Integrations</h2>
        <p>Connect Qual Engine with your favorite tools</p>
      </div>

      <div className="section-content">
        <div className="integration-grid">
          <div className="integration-card">
            <div className="integration-icon">📧</div>
            <h3>Slack</h3>
            <p>Get notifications in Slack channels</p>
            <button className="btn btn-secondary">
              {integrations.slack?.enabled ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          <div className="integration-card">
            <div className="integration-icon">👥</div>
            <h3>Microsoft Teams</h3>
            <p>Collaborate with your team</p>
            <button className="btn btn-secondary">
              {integrations.teams?.enabled ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          <div className="integration-card">
            <div className="integration-icon">🔗</div>
            <h3>Webhooks</h3>
            <p>Send data to custom endpoints</p>
            <button className="btn btn-secondary">
              {integrations.webhook?.enabled ? 'Configure' : 'Setup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * API Keys Section - Pure presentation
 */
const APIKeysSection: React.FC<Partial<APIKeysSectionProps>> = ({ apiKeys, isLoading }) => {
  return (
    <div className="settings-section api-keys-section">
      <div className="section-header">
        <h2>API Keys</h2>
        <p>Manage your API keys for programmatic access</p>
        <button className="btn btn-primary">Create New Key</button>
      </div>

      <div className="section-content">
        {isLoading ? (
          <div className="loading">Loading API keys...</div>
        ) : apiKeys && apiKeys.length > 0 ? (
          <div className="api-keys-list">
            {apiKeys.map(key => (
              <div key={key.id} className="api-key-card">
                <div className="key-info">
                  <h3>{key.name}</h3>
                  <p className="key-masked">{key.maskedKey}</p>
                  <div className="key-meta">
                    <span>Created: {key.createdAt.toLocaleDateString()}</span>
                    {key.lastUsedAt && (
                      <span>Last used: {key.lastUsedAt.toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="key-actions">
                  <button className="btn btn-sm">Reveal</button>
                  <button className="btn btn-sm">Copy</button>
                  <button className="btn btn-sm">Rotate</button>
                  <button className="btn btn-sm btn-danger">Revoke</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No API keys yet. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};
