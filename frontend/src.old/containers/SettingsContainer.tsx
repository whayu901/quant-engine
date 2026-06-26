/**
 * Settings Container - MVC Pattern
 * Connects SettingsView (pure presentation) with SettingsController (business logic)
 * Acts as the glue between View and Controller
 */

import React, { useEffect, useState } from 'react';
import { SettingsView } from '../views/settings/SettingsView';
import { Services } from '../di/setup';
import type { SettingsState } from '../controllers/SettingsController';

/**
 * Settings Container Component
 * Responsibilities:
 * - Subscribe to controller state
 * - Pass data to view as props
 * - Delegate actions to controller
 * - Handle side effects (loading, errors)
 */
export const SettingsContainer: React.FC<{ userId: string }> = ({ userId }) => {
  const [state, setState] = useState<SettingsState>(Services.settings.getState());
  const [activeSection, setActiveSection] = useState<string>('profile');

  useEffect(() => {
    // Subscribe to controller state changes
    const unsubscribe = Services.settings.subscribe(setState);

    // Load initial data
    loadSettings();

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const loadSettings = async () => {
    try {
      await Services.settings.loadSettings(userId);
      await Services.settings.loadAPIKeys(userId);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleUpdateProfile = async (profile: any) => {
    try {
      await Services.settings.updateProfile(userId, profile);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleUpdateNotifications = async (notifications: any) => {
    try {
      await Services.settings.updateNotifications(userId, notifications);
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  const handleUpdateLanguage = async (language: any) => {
    try {
      await Services.settings.updateLanguage(userId, language);
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  const handleUpdateSecurity = async (security: any) => {
    try {
      await Services.settings.updateSecurity(userId, security);
    } catch (error) {
      console.error('Failed to update security:', error);
    }
  };

  const handleUpdateIntegrations = async (integrations: any) => {
    try {
      await Services.settings.updateIntegrations(userId, integrations);
    } catch (error) {
      console.error('Failed to update integrations:', error);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    try {
      await Services.settings.uploadAvatar(userId, file);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await Services.settings.deleteAvatar(userId);
    } catch (error) {
      console.error('Failed to delete avatar:', error);
    }
  };

  const handleCreateAPIKey = async (name: string, permissions: string[], expiresAt?: Date) => {
    try {
      await Services.settings.createAPIKey(userId, name, permissions, expiresAt);
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const handleRotateAPIKey = async (keyId: string) => {
    try {
      await Services.settings.rotateAPIKey(userId, keyId);
    } catch (error) {
      console.error('Failed to rotate API key:', error);
    }
  };

  const handleRevokeAPIKey = async (keyId: string) => {
    try {
      await Services.settings.revokeAPIKey(userId, keyId);
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  // Pure presentation: all logic is in controller
  return (
    <SettingsView
      settings={state.settings}
      apiKeys={state.apiKeys}
      isLoading={state.isLoading}
      isSaving={state.isSaving}
      error={state.error}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    />
  );
};
