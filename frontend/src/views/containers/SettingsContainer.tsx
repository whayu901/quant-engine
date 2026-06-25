/**
 * Settings Container - SOLID: Single Responsibility
 * Connects SettingsView to SettingsController (MVC pattern)
 */

import React, { useEffect, useState } from 'react';
import { SettingsView } from '../settings/SettingsView';
import { Services } from '../../di/services';
import { SettingsState } from '../../controllers/SettingsController';

/**
 * Settings Container Component
 * SOLID: Dependency Inversion - Depends on controller abstractions
 */
export const SettingsContainer: React.FC = () => {
  const settingsController = Services.settings;
  const authController = Services.auth;

  // State from controllers
  const [settingsState, setSettingsState] = useState<SettingsState>(settingsController.getState());
  const [authState, setAuthState] = useState(authController.getState());
  const [activeSection, setActiveSection] = useState('profile');

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribeSettings = settingsController.subscribe(setSettingsState);
    const unsubscribeAuth = authController.subscribe(setAuthState);

    // Load settings and API keys on mount
    if (authState.user?.id) {
      settingsController.loadSettings(authState.user.id);
      settingsController.loadAPIKeys(authState.user.id);
    }

    return () => {
      unsubscribeSettings();
      unsubscribeAuth();
    };
  }, [authState.user?.id]);

  // Profile handlers
  const handleProfileUpdate = async (profile: Partial<any>) => {
    if (!authState.user?.id) return;
    await settingsController.updateProfile(authState.user.id, profile);
  };

  const handleUploadAvatar = async (file: File) => {
    if (!authState.user?.id) return;
    await settingsController.uploadAvatar(authState.user.id, file);
  };

  const handleDeleteAvatar = async () => {
    if (!authState.user?.id) return;
    await settingsController.deleteAvatar(authState.user.id);
  };

  // Notification handlers
  const handleNotificationUpdate = async (notifications: Partial<any>) => {
    if (!authState.user?.id) return;
    await settingsController.updateNotifications(authState.user.id, notifications);
  };

  // Language handlers
  const handleLanguageUpdate = async (language: Partial<any>) => {
    if (!authState.user?.id) return;
    await settingsController.updateLanguage(authState.user.id, language);
  };

  // Security handlers
  const handleSecurityUpdate = async (security: Partial<any>) => {
    if (!authState.user?.id) return;
    await settingsController.updateSecurity(authState.user.id, security);
  };

  // Integration handlers
  const handleIntegrationUpdate = async (integrations: Partial<any>) => {
    if (!authState.user?.id) return;
    await settingsController.updateIntegrations(authState.user.id, integrations);
  };

  // Theme handler
  const handleThemeUpdate = async (theme: 'light' | 'dark' | 'auto') => {
    if (!authState.user?.id) return;
    await settingsController.updateTheme(authState.user.id, theme);
  };

  // API Key handlers
  const handleCreateAPIKey = async (name: string, permissions: string[], expiresAt?: Date) => {
    if (!authState.user?.id) return;
    return await settingsController.createAPIKey(authState.user.id, name, permissions, expiresAt);
  };

  const handleRotateAPIKey = async (keyId: string) => {
    if (!authState.user?.id) return;
    await settingsController.rotateAPIKey(authState.user.id, keyId);
  };

  const handleRevokeAPIKey = async (keyId: string) => {
    if (!authState.user?.id) return;
    await settingsController.revokeAPIKey(authState.user.id, keyId);
  };

  // Create prop objects for each section
  const profileSectionProps = settingsState.settings ? {
    profile: settingsState.settings.profile,
    isSaving: settingsState.isSaving,
    onUpdate: handleProfileUpdate,
    onUploadAvatar: handleUploadAvatar,
    onDeleteAvatar: handleDeleteAvatar
  } : null;

  const notificationSectionProps = settingsState.settings ? {
    notifications: settingsState.settings.notifications,
    isSaving: settingsState.isSaving,
    onUpdate: handleNotificationUpdate
  } : null;

  const languageSectionProps = settingsState.settings ? {
    language: settingsState.settings.language,
    isSaving: settingsState.isSaving,
    onUpdate: handleLanguageUpdate
  } : null;

  const securitySectionProps = settingsState.settings ? {
    security: settingsState.settings.security,
    isSaving: settingsState.isSaving,
    onUpdate: handleSecurityUpdate
  } : null;

  const integrationSectionProps = settingsState.settings ? {
    integrations: settingsState.settings.integrations,
    isSaving: settingsState.isSaving,
    onUpdate: handleIntegrationUpdate
  } : null;

  const apiKeysSectionProps = {
    apiKeys: settingsState.apiKeys,
    isLoading: settingsState.isLoading,
    onCreate: handleCreateAPIKey,
    onRotate: handleRotateAPIKey,
    onRevoke: handleRevokeAPIKey
  };

  return (
    <SettingsView
      settings={settingsState.settings}
      apiKeys={settingsState.apiKeys}
      isLoading={settingsState.isLoading}
      isSaving={settingsState.isSaving}
      error={settingsState.error}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    />
  );
};