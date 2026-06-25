/**
 * Settings Repository - SOLID: Single Responsibility & Open/Closed
 * Handles settings data access with caching capability
 */

import { IRepository } from '../../interfaces/IRepository';
import { UserSettings } from '../entities/UserSettings';
import { SystemSettings } from '../entities/SystemSettings';
import { BillingSettings } from '../entities/BillingSettings';
import { APIKey } from '../entities/APIKey';
import api from '../../lib/api/client';

export class SettingsRepository implements IRepository<UserSettings> {
  private cache: Map<string, { data: UserSettings; timestamp: number }> = new Map();
  private cacheTTL: number = 300000; // 5 minutes default

  async findById(userId: string): Promise<UserSettings | null> {
    // Check cache first
    const cached = this.getFromCache(userId);
    if (cached) return cached;

    try {
      const response = await api.get(`/users/${userId}/settings`);
      const settings = UserSettings.fromJSON(response);
      this.addToCache(userId, settings);
      return settings;
    } catch (error: any) {
      if (error.status === 404) {
        // Return default settings if not found
        return UserSettings.createDefault(userId);
      }
      throw error;
    }
  }

  async findAll(): Promise<UserSettings[]> {
    throw new Error('findAll not supported for UserSettings');
  }

  async create(data: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await api.post('/settings', data);
      const settings = UserSettings.fromJSON(response);
      this.addToCache(settings.userId, settings);
      return settings;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create settings');
    }
  }

  async update(userId: string, data: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await api.patch(`/users/${userId}/settings`, data);
      const settings = UserSettings.fromJSON(response);
      this.addToCache(userId, settings);
      return settings;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update settings');
    }
  }

  async delete(userId: string): Promise<boolean> {
    try {
      await api.delete(`/users/${userId}/settings`);
      this.removeFromCache(userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateProfile(userId: string, profile: Partial<UserSettings['profile']>): Promise<UserSettings> {
    return this.update(userId, { profile } as any);
  }

  async updateNotifications(userId: string, notifications: Partial<UserSettings['notifications']>): Promise<UserSettings> {
    return this.update(userId, { notifications } as any);
  }

  async updateLanguage(userId: string, language: Partial<UserSettings['language']>): Promise<UserSettings> {
    return this.update(userId, { language } as any);
  }

  async updateSecurity(userId: string, security: Partial<UserSettings['security']>): Promise<UserSettings> {
    return this.update(userId, { security } as any);
  }

  async updateIntegrations(userId: string, integrations: Partial<UserSettings['integrations']>): Promise<UserSettings> {
    return this.update(userId, { integrations } as any);
  }

  async updateTheme(userId: string, theme: 'light' | 'dark' | 'auto'): Promise<UserSettings> {
    return this.update(userId, { theme } as any);
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post(`/users/${userId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.avatar_url;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to upload avatar');
    }
  }

  async deleteAvatar(userId: string): Promise<void> {
    try {
      await api.delete(`/users/${userId}/avatar`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete avatar');
    }
  }

  // Cache management methods
  private getFromCache(userId: string): UserSettings | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(userId);
      return null;
    }

    return cached.data;
  }

  private addToCache(userId: string, settings: UserSettings): void {
    this.cache.set(userId, {
      data: settings,
      timestamp: Date.now()
    });
  }

  private removeFromCache(userId: string): void {
    this.cache.delete(userId);
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public setCacheTTL(milliseconds: number): void {
    this.cacheTTL = milliseconds;
  }
}

export class SystemSettingsRepository implements IRepository<SystemSettings> {
  private cache: Map<string, { data: SystemSettings; timestamp: number }> = new Map();
  private cacheTTL: number = 600000; // 10 minutes for system settings

  async findById(organizationId: string): Promise<SystemSettings | null> {
    const cached = this.getFromCache(organizationId);
    if (cached) return cached;

    try {
      const response = await api.get(`/organizations/${organizationId}/settings`);
      const settings = SystemSettings.fromJSON(response);
      this.addToCache(organizationId, settings);
      return settings;
    } catch (error: any) {
      if (error.status === 404) {
        return SystemSettings.createDefault(organizationId);
      }
      throw error;
    }
  }

  async findAll(): Promise<SystemSettings[]> {
    throw new Error('findAll not supported for SystemSettings');
  }

  async create(data: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await api.post('/organizations/settings', data);
      const settings = SystemSettings.fromJSON(response);
      this.addToCache(settings.organizationId, settings);
      return settings;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create system settings');
    }
  }

  async update(organizationId: string, data: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      const response = await api.patch(`/organizations/${organizationId}/settings`, data);
      const settings = SystemSettings.fromJSON(response);
      this.addToCache(organizationId, settings);
      return settings;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update system settings');
    }
  }

  async delete(organizationId: string): Promise<boolean> {
    try {
      await api.delete(`/organizations/${organizationId}/settings`);
      this.removeFromCache(organizationId);
      return true;
    } catch (error) {
      return false;
    }
  }

  private getFromCache(organizationId: string): SystemSettings | null {
    const cached = this.cache.get(organizationId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(organizationId);
      return null;
    }

    return cached.data;
  }

  private addToCache(organizationId: string, settings: SystemSettings): void {
    this.cache.set(organizationId, {
      data: settings,
      timestamp: Date.now()
    });
  }

  private removeFromCache(organizationId: string): void {
    this.cache.delete(organizationId);
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export class APIKeyRepository {
  async findAll(userId: string): Promise<APIKey[]> {
    try {
      const response = await api.get(`/users/${userId}/api-keys`);
      return response.api_keys.map((key: any) => APIKey.fromJSON(key));
    } catch (error) {
      throw new Error('Failed to fetch API keys');
    }
  }

  async findById(userId: string, keyId: string): Promise<APIKey | null> {
    try {
      const response = await api.get(`/users/${userId}/api-keys/${keyId}`);
      return APIKey.fromJSON(response);
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async create(userId: string, data: { name: string; permissions: string[]; expiresAt?: Date }): Promise<APIKey> {
    try {
      const response = await api.post(`/users/${userId}/api-keys`, {
        name: data.name,
        permissions: data.permissions,
        expires_at: data.expiresAt?.toISOString()
      });
      return APIKey.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create API key');
    }
  }

  async rotate(userId: string, keyId: string): Promise<APIKey> {
    try {
      const response = await api.post(`/users/${userId}/api-keys/${keyId}/rotate`);
      return APIKey.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to rotate API key');
    }
  }

  async revoke(userId: string, keyId: string): Promise<boolean> {
    try {
      await api.delete(`/users/${userId}/api-keys/${keyId}`);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export class BillingRepository implements IRepository<BillingSettings> {
  private cache: Map<string, { data: BillingSettings; timestamp: number }> = new Map();
  private cacheTTL: number = 60000; // 1 minute for billing data

  async findById(userId: string): Promise<BillingSettings | null> {
    const cached = this.getFromCache(userId);
    if (cached) return cached;

    try {
      const response = await api.get(`/users/${userId}/billing`);
      const billing = BillingSettings.fromJSON(response);
      this.addToCache(userId, billing);
      return billing;
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async findAll(): Promise<BillingSettings[]> {
    throw new Error('findAll not supported for BillingSettings');
  }

  async create(data: Partial<BillingSettings>): Promise<BillingSettings> {
    throw new Error('create not supported for BillingSettings');
  }

  async update(userId: string, data: Partial<BillingSettings>): Promise<BillingSettings> {
    try {
      const response = await api.patch(`/users/${userId}/billing`, data);
      const billing = BillingSettings.fromJSON(response);
      this.addToCache(userId, billing);
      return billing;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update billing settings');
    }
  }

  async delete(userId: string): Promise<boolean> {
    throw new Error('delete not supported for BillingSettings');
  }

  async updateSubscription(userId: string, tier: string): Promise<BillingSettings> {
    try {
      const response = await api.post(`/users/${userId}/billing/subscription`, { tier });
      const billing = BillingSettings.fromJSON(response);
      this.addToCache(userId, billing);
      return billing;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update subscription');
    }
  }

  async cancelSubscription(userId: string): Promise<BillingSettings> {
    try {
      const response = await api.post(`/users/${userId}/billing/subscription/cancel`);
      const billing = BillingSettings.fromJSON(response);
      this.addToCache(userId, billing);
      return billing;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to cancel subscription');
    }
  }

  private getFromCache(userId: string): BillingSettings | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(userId);
      return null;
    }

    return cached.data;
  }

  private addToCache(userId: string, billing: BillingSettings): void {
    this.cache.set(userId, {
      data: billing,
      timestamp: Date.now()
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
