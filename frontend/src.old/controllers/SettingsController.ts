/**
 * Settings Controller - SOLID: Single Responsibility & Liskov Substitution
 * Manages settings business logic and state
 */

import { UserSettings } from '../models/entities/UserSettings';
import { APIKey } from '../models/entities/APIKey';
import { SettingsRepository, APIKeyRepository } from '../models/repositories/SettingsRepository';
import { EventEmitter } from '../utils/EventEmitter';

export interface SettingsState {
  settings: UserSettings | null;
  apiKeys: APIKey[];
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  lastSavedAt?: Date;
}

export interface ISettingsController {
  getState(): SettingsState;
  loadSettings(userId: string): Promise<void>;
  updateProfile(userId: string, profile: Partial<UserSettings['profile']>): Promise<void>;
  updateNotifications(userId: string, notifications: Partial<UserSettings['notifications']>): Promise<void>;
  updateLanguage(userId: string, language: Partial<UserSettings['language']>): Promise<void>;
  updateSecurity(userId: string, security: Partial<UserSettings['security']>): Promise<void>;
  updateIntegrations(userId: string, integrations: Partial<UserSettings['integrations']>): Promise<void>;
  updateTheme(userId: string, theme: 'light' | 'dark' | 'auto'): Promise<void>;
  uploadAvatar(userId: string, file: File): Promise<void>;
  deleteAvatar(userId: string): Promise<void>;
  loadAPIKeys(userId: string): Promise<void>;
  createAPIKey(userId: string, name: string, permissions: string[], expiresAt?: Date): Promise<APIKey>;
  rotateAPIKey(userId: string, keyId: string): Promise<void>;
  revokeAPIKey(userId: string, keyId: string): Promise<void>;
  subscribe(listener: (state: SettingsState) => void): () => void;
}

/**
 * Settings Controller Implementation
 * SOLID: Dependency Inversion - Depends on repository abstractions
 */
export class SettingsController implements ISettingsController {
  private state: SettingsState = {
    settings: null,
    apiKeys: [],
    isLoading: false,
    error: null,
    isSaving: false,
    lastSavedAt: undefined
  };

  private eventEmitter = new EventEmitter<SettingsState>();

  constructor(
    private settingsRepository: SettingsRepository,
    private apiKeyRepository: APIKeyRepository
  ) {}

  getState(): SettingsState {
    return { ...this.state };
  }

  async loadSettings(userId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const settings = await this.settingsRepository.findById(userId);

      if (!settings) {
        throw new Error('Settings not found');
      }

      this.updateState({
        settings,
        isLoading: false
      });

      this.eventEmitter.emit('settings_loaded', settings);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load settings'
      });
      throw error;
    }
  }

  async updateProfile(userId: string, profile: Partial<UserSettings['profile']>): Promise<void> {
    this.updateState({ isSaving: true, error: null });

    try {
      this.validateProfile(profile);

      const updatedSettings = await this.settingsRepository.updateProfile(userId, profile);

      this.updateState({
        settings: updatedSettings,
        isSaving: false,
        lastSavedAt: new Date()
      });

      this.eventEmitter.emit('profile_updated', updatedSettings);
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to update profile'
      });
      throw error;
    }
  }

  async updateNotifications(userId: string, notifications: Partial<UserSettings['notifications']>): Promise<void> {
    this.updateState({ isSaving: true, error: null });

    try {
      const updatedSettings = await this.settingsRepository.updateNotifications(userId, notifications);

      this.updateState({
        settings: updatedSettings,
        isSaving: false,
        lastSavedAt: new Date()
      });

      this.eventEmitter.emit('notifications_updated', updatedSettings);
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to update notifications'
      });
      throw error;
    }
  }

  async updateLanguage(userId: string, language: Partial<UserSettings['language']>): Promise<void> {
    this.updateState({ isSaving: true, error: null });

    try {
      this.validateLanguage(language);

      const updatedSettings = await this.settingsRepository.updateLanguage(userId, language);

      this.updateState({
        settings: updatedSettings,
        isSaving: false,
        lastSavedAt: new Date()
      });

      this.eventEmitter.emit('language_updated', updatedSettings);
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to update language'
      });
      throw error;
    }
  }

  async updateSecurity(userId: string, security: Partial<UserSettings['security']>): Promise<void> {
    this.updateState({ isSaving: true, error: null });

    try {
      this.validateSecurity(security);

      const updatedSettings = await this.settingsRepository.updateSecurity(userId, security);

      this.updateState({
        settings: updatedSettings,
        isSaving: false,
        lastSavedAt: new Date()
      });

      this.eventEmitter.emit('security_updated', updatedSettings);
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to update security'
      });
      throw error;
    }
  }

  async updateIntegrations(userId: string, integrations: Partial<UserSettings['integrations']>): Promise<void> {
    this.updateState({ isSaving: true, error: null });

    try {
      const updatedSettings = await this.settingsRepository.updateIntegrations(userId, integrations);

      this.updateState({
        settings: updatedSettings,
        isSaving: false,
        lastSavedAt: new Date()
      });

      this.eventEmitter.emit('integrations_updated', updatedSettings);
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to update integrations'
      });
      throw error;
    }
  }

  async updateTheme(userId: string, theme: 'light' | 'dark' | 'auto'): Promise<void> {
    this.updateState({ isSaving: true, error: null });

    try {
      const updatedSettings = await this.settingsRepository.updateTheme(userId, theme);

      this.updateState({
        settings: updatedSettings,
        isSaving: false,
        lastSavedAt: new Date()
      });

      // Apply theme immediately
      this.applyTheme(theme);

      this.eventEmitter.emit('theme_updated', updatedSettings);
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to update theme'
      });
      throw error;
    }
  }

  async uploadAvatar(userId: string, file: File): Promise<void> {
    this.updateState({ isSaving: true, error: null });

    try {
      this.validateAvatarFile(file);

      const avatarUrl = await this.settingsRepository.uploadAvatar(userId, file);

      // Update settings with new avatar URL
      const updatedSettings = await this.settingsRepository.updateProfile(userId, { avatarUrl });

      this.updateState({
        settings: updatedSettings,
        isSaving: false,
        lastSavedAt: new Date()
      });

      this.eventEmitter.emit('avatar_uploaded', updatedSettings);
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to upload avatar'
      });
      throw error;
    }
  }

  async deleteAvatar(userId: string): Promise<void> {
    this.updateState({ isSaving: true, error: null });

    try {
      await this.settingsRepository.deleteAvatar(userId);

      // Update settings to remove avatar URL
      const updatedSettings = await this.settingsRepository.updateProfile(userId, { avatarUrl: undefined });

      this.updateState({
        settings: updatedSettings,
        isSaving: false,
        lastSavedAt: new Date()
      });

      this.eventEmitter.emit('avatar_deleted', updatedSettings);
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to delete avatar'
      });
      throw error;
    }
  }

  async loadAPIKeys(userId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const apiKeys = await this.apiKeyRepository.findAll(userId);

      this.updateState({
        apiKeys,
        isLoading: false
      });

      this.eventEmitter.emit('api_keys_loaded', apiKeys);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load API keys'
      });
      throw error;
    }
  }

  async createAPIKey(userId: string, name: string, permissions: string[], expiresAt?: Date): Promise<APIKey> {
    this.updateState({ isSaving: true, error: null });

    try {
      this.validateAPIKeyName(name);
      this.validateAPIKeyPermissions(permissions);

      const apiKey = await this.apiKeyRepository.create(userId, { name, permissions, expiresAt });

      this.updateState({
        apiKeys: [apiKey, ...this.state.apiKeys],
        isSaving: false
      });

      this.eventEmitter.emit('api_key_created', apiKey);
      return apiKey;
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to create API key'
      });
      throw error;
    }
  }

  async rotateAPIKey(userId: string, keyId: string): Promise<void> {
    this.updateState({ isSaving: true, error: null });

    try {
      const newApiKey = await this.apiKeyRepository.rotate(userId, keyId);

      // Update the key in the list
      const apiKeys = this.state.apiKeys.map(key =>
        key.id === keyId ? newApiKey : key
      );

      this.updateState({
        apiKeys,
        isSaving: false
      });

      this.eventEmitter.emit('api_key_rotated', newApiKey);
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to rotate API key'
      });
      throw error;
    }
  }

  async revokeAPIKey(userId: string, keyId: string): Promise<void> {
    this.updateState({ isSaving: true, error: null });

    try {
      const success = await this.apiKeyRepository.revoke(userId, keyId);

      if (!success) {
        throw new Error('Failed to revoke API key');
      }

      // Remove from the list
      const apiKeys = this.state.apiKeys.filter(key => key.id !== keyId);

      this.updateState({
        apiKeys,
        isSaving: false
      });

      this.eventEmitter.emit('api_key_revoked', keyId);
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to revoke API key'
      });
      throw error;
    }
  }

  subscribe(listener: (state: SettingsState) => void): () => void {
    listener(this.state);
    return this.eventEmitter.on('state_change', listener);
  }

  private updateState(partial: Partial<SettingsState>): void {
    this.state = { ...this.state, ...partial };
    this.eventEmitter.emit('state_change', this.state);
  }

  private validateProfile(profile: Partial<UserSettings['profile']>): void {
    if (profile.fullName !== undefined && profile.fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }

    if (profile.fullName && profile.fullName.length > 100) {
      throw new Error('Full name must be less than 100 characters');
    }

    if (profile.bio && profile.bio.length > 500) {
      throw new Error('Bio must be less than 500 characters');
    }
  }

  private validateLanguage(language: Partial<UserSettings['language']>): void {
    const validLanguages = ['en', 'id', 'th', 'vi', 'tl', 'ms', 'zh-Hans'];
    if (language.interfaceLanguage && !validLanguages.includes(language.interfaceLanguage)) {
      throw new Error('Invalid language selection');
    }
  }

  private validateSecurity(security: Partial<UserSettings['security']>): void {
    if (security.sessionTimeout !== undefined && security.sessionTimeout < 300000) {
      throw new Error('Session timeout must be at least 5 minutes');
    }
  }

  private validateAvatarFile(file: File): void {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      throw new Error('Avatar file size must be less than 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Avatar must be a JPEG, PNG, GIF, or WebP image');
    }
  }

  private validateAPIKeyName(name: string): void {
    if (!name || name.trim().length < 3) {
      throw new Error('API key name must be at least 3 characters');
    }

    if (name.length > 50) {
      throw new Error('API key name must be less than 50 characters');
    }
  }

  private validateAPIKeyPermissions(permissions: string[]): void {
    if (permissions.length === 0) {
      throw new Error('At least one permission is required');
    }

    const validPermissions = ['read', 'write', 'delete', 'admin', '*'];
    const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));

    if (invalidPermissions.length > 0) {
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }
  }

  private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    if (typeof document === 'undefined') return;

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }
}
