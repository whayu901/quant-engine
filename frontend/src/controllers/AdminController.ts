/**
 * Admin Controller - SOLID: Single Responsibility & Liskov Substitution
 * Manages admin dashboard business logic and state
 */

import { AdminAnalytics, UserActivity, UserManagementData } from '../models/entities/AdminAnalytics';
import { SystemSettings } from '../models/entities/SystemSettings';
import {
  AdminAnalyticsRepository,
  UserActivityRepository,
  UserManagementRepository
} from '../models/repositories/AdminRepository';
import { SystemSettingsRepository } from '../models/repositories/SettingsRepository';
import { EventEmitter } from '../utils/EventEmitter';
import { IQueryOptions, IPaginatedResult } from '../interfaces/IRepository';

export interface AdminState {
  analytics: AdminAnalytics | null;
  realtimeMetrics: {
    activeUsers: number;
    activeAnalyses: number;
    systemLoad: number;
    queueDepth: number;
  } | null;
  users: UserManagementData[];
  selectedUser: UserManagementData | null;
  activities: UserActivity[];
  systemSettings: SystemSettings | null;
  isLoading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  pageSize: number;
}

export interface IAdminController {
  getState(): AdminState;
  loadAnalytics(organizationId: string, startDate: Date, endDate: Date): Promise<void>;
  loadRealtimeMetrics(organizationId: string): Promise<void>;
  loadUsers(options?: IQueryOptions): Promise<void>;
  loadUser(userId: string): Promise<void>;
  createUser(data: Partial<UserManagementData>): Promise<void>;
  updateUser(userId: string, data: Partial<UserManagementData>): Promise<void>;
  suspendUser(userId: string, reason: string): Promise<void>;
  unsuspendUser(userId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  inviteUser(email: string, role: string): Promise<void>;
  bulkAction(userIds: string[], action: 'suspend' | 'unsuspend' | 'delete'): Promise<void>;
  loadActivities(options?: IQueryOptions): Promise<void>;
  loadAuditLog(organizationId: string, options?: IQueryOptions): Promise<void>;
  loadSystemSettings(organizationId: string): Promise<void>;
  updateSystemSettings(organizationId: string, settings: Partial<SystemSettings>): Promise<void>;
  subscribe(listener: (state: AdminState) => void): () => void;
}

/**
 * Admin Controller Implementation
 * SOLID: Dependency Inversion - Depends on repository abstractions
 */
export class AdminController implements IAdminController {
  private state: AdminState = {
    analytics: null,
    realtimeMetrics: null,
    users: [],
    selectedUser: null,
    activities: [],
    systemSettings: null,
    isLoading: false,
    error: null,
    totalUsers: 0,
    currentPage: 1,
    pageSize: 20
  };

  private eventEmitter = new EventEmitter<AdminState>();
  private realtimeInterval?: NodeJS.Timeout;

  constructor(
    private analyticsRepository: AdminAnalyticsRepository,
    private userActivityRepository: UserActivityRepository,
    private userManagementRepository: UserManagementRepository,
    private systemSettingsRepository: SystemSettingsRepository
  ) {}

  getState(): AdminState {
    return { ...this.state };
  }

  async loadAnalytics(organizationId: string, startDate: Date, endDate: Date): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const analytics = await this.analyticsRepository.getAnalytics(organizationId, startDate, endDate);

      this.updateState({
        analytics,
        isLoading: false
      });

      this.eventEmitter.emit('analytics_loaded', analytics);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load analytics'
      });
      throw error;
    }
  }

  async loadRealtimeMetrics(organizationId: string): Promise<void> {
    try {
      const metrics = await this.analyticsRepository.getRealtimeMetrics(organizationId);

      this.updateState({
        realtimeMetrics: metrics
      });

      this.eventEmitter.emit('realtime_metrics_updated', metrics);
    } catch (error: any) {
      // Don't update error state for realtime metrics to avoid disrupting UI
      console.error('Failed to load realtime metrics:', error);
    }
  }

  startRealtimeUpdates(organizationId: string, intervalMs: number = 10000): void {
    this.stopRealtimeUpdates();

    // Initial load
    this.loadRealtimeMetrics(organizationId);

    // Set up interval
    this.realtimeInterval = setInterval(() => {
      this.loadRealtimeMetrics(organizationId);
    }, intervalMs);
  }

  stopRealtimeUpdates(): void {
    if (this.realtimeInterval) {
      clearInterval(this.realtimeInterval);
      this.realtimeInterval = undefined;
    }
  }

  async loadUsers(options?: IQueryOptions): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const queryOptions: IQueryOptions = {
        page: options?.page || this.state.currentPage,
        pageSize: options?.pageSize || this.state.pageSize,
        sortBy: options?.sortBy || 'created_at',
        sortOrder: options?.sortOrder || 'desc',
        filters: options?.filters
      };

      const result = await this.userManagementRepository.findPaginated(queryOptions);

      this.updateState({
        users: result.data,
        totalUsers: result.total,
        currentPage: result.page,
        pageSize: result.pageSize,
        isLoading: false
      });

      this.eventEmitter.emit('users_loaded', result.data);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load users'
      });
      throw error;
    }
  }

  async loadUser(userId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      this.updateState({
        selectedUser: user,
        isLoading: false
      });

      this.eventEmitter.emit('user_loaded', user);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load user'
      });
      throw error;
    }
  }

  async createUser(data: Partial<UserManagementData>): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      this.validateUserData(data);

      const user = await this.userManagementRepository.create(data);

      this.updateState({
        users: [user, ...this.state.users],
        totalUsers: this.state.totalUsers + 1,
        isLoading: false
      });

      this.eventEmitter.emit('user_created', user);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to create user'
      });
      throw error;
    }
  }

  async updateUser(userId: string, data: Partial<UserManagementData>): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const updatedUser = await this.userManagementRepository.update(userId, data);

      const users = this.state.users.map(u => u.id === userId ? updatedUser : u);
      const selectedUser = this.state.selectedUser?.id === userId ? updatedUser : this.state.selectedUser;

      this.updateState({
        users,
        selectedUser,
        isLoading: false
      });

      this.eventEmitter.emit('user_updated', updatedUser);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to update user'
      });
      throw error;
    }
  }

  async suspendUser(userId: string, reason: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const updatedUser = await this.userManagementRepository.suspendUser(userId, reason);

      const users = this.state.users.map(u => u.id === userId ? updatedUser : u);

      this.updateState({
        users,
        isLoading: false
      });

      this.eventEmitter.emit('user_suspended', updatedUser);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to suspend user'
      });
      throw error;
    }
  }

  async unsuspendUser(userId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const updatedUser = await this.userManagementRepository.unsuspendUser(userId);

      const users = this.state.users.map(u => u.id === userId ? updatedUser : u);

      this.updateState({
        users,
        isLoading: false
      });

      this.eventEmitter.emit('user_unsuspended', updatedUser);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to unsuspend user'
      });
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const success = await this.userManagementRepository.delete(userId);

      if (!success) {
        throw new Error('Failed to delete user');
      }

      const users = this.state.users.filter(u => u.id !== userId);
      const selectedUser = this.state.selectedUser?.id === userId ? null : this.state.selectedUser;

      this.updateState({
        users,
        selectedUser,
        totalUsers: this.state.totalUsers - 1,
        isLoading: false
      });

      this.eventEmitter.emit('user_deleted', userId);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to delete user'
      });
      throw error;
    }
  }

  async inviteUser(email: string, role: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      this.validateEmail(email);
      this.validateRole(role);

      await this.userManagementRepository.inviteUser(email, role);

      this.updateState({
        isLoading: false
      });

      this.eventEmitter.emit('user_invited', { email, role });
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to invite user'
      });
      throw error;
    }
  }

  async bulkAction(userIds: string[], action: 'suspend' | 'unsuspend' | 'delete'): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      if (userIds.length === 0) {
        throw new Error('No users selected');
      }

      await this.userManagementRepository.bulkAction(userIds, action);

      // Reload users after bulk action
      await this.loadUsers();

      this.eventEmitter.emit('bulk_action_completed', { userIds, action });
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to perform bulk action'
      });
      throw error;
    }
  }

  async loadActivities(options?: IQueryOptions): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const result = await this.userActivityRepository.findPaginated({
        page: options?.page || 1,
        pageSize: options?.pageSize || 50,
        sortBy: options?.sortBy || 'timestamp',
        sortOrder: options?.sortOrder || 'desc',
        filters: options?.filters
      });

      this.updateState({
        activities: result.data,
        isLoading: false
      });

      this.eventEmitter.emit('activities_loaded', result.data);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load activities'
      });
      throw error;
    }
  }

  async loadAuditLog(organizationId: string, options?: IQueryOptions): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const result = await this.userActivityRepository.getAuditLog(organizationId, {
        page: options?.page || 1,
        pageSize: options?.pageSize || 50,
        sortBy: options?.sortBy || 'timestamp',
        sortOrder: options?.sortOrder || 'desc',
        filters: options?.filters
      });

      this.updateState({
        activities: result.data,
        isLoading: false
      });

      this.eventEmitter.emit('audit_log_loaded', result.data);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load audit log'
      });
      throw error;
    }
  }

  async loadSystemSettings(organizationId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const settings = await this.systemSettingsRepository.findById(organizationId);

      if (!settings) {
        throw new Error('System settings not found');
      }

      this.updateState({
        systemSettings: settings,
        isLoading: false
      });

      this.eventEmitter.emit('system_settings_loaded', settings);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load system settings'
      });
      throw error;
    }
  }

  async updateSystemSettings(organizationId: string, settings: Partial<SystemSettings>): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const updatedSettings = await this.systemSettingsRepository.update(organizationId, settings);

      this.updateState({
        systemSettings: updatedSettings,
        isLoading: false
      });

      this.eventEmitter.emit('system_settings_updated', updatedSettings);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to update system settings'
      });
      throw error;
    }
  }

  subscribe(listener: (state: AdminState) => void): () => void {
    listener(this.state);
    return this.eventEmitter.on('state_change', listener);
  }

  cleanup(): void {
    this.stopRealtimeUpdates();
    this.eventEmitter.clear();
  }

  private updateState(partial: Partial<AdminState>): void {
    this.state = { ...this.state, ...partial };
    this.eventEmitter.emit('state_change', this.state);
  }

  private validateUserData(data: Partial<UserManagementData>): void {
    if (!data.email) {
      throw new Error('Email is required');
    }

    this.validateEmail(data.email);

    if (!data.fullName || data.fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }

    if (data.role) {
      this.validateRole(data.role);
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email address');
    }
  }

  private validateRole(role: string): void {
    const validRoles = ['admin', 'user', 'viewer', 'analyst'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role');
    }
  }
}
