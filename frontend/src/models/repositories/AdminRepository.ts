/**
 * Admin Repository - SOLID: Single Responsibility & Open/Closed
 * Handles admin data access with caching capability
 */

import { AdminAnalytics, UserActivity, UserManagementData } from '../entities/AdminAnalytics';
import { IPaginatedRepository, IPaginatedResult, IQueryOptions } from '../../interfaces/IRepository';
import api from '../../lib/api/client';

export class AdminAnalyticsRepository {
  private cache: Map<string, { data: AdminAnalytics; timestamp: number }> = new Map();
  private cacheTTL: number = 300000; // 5 minutes

  async getAnalytics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AdminAnalytics> {
    const cacheKey = `${organizationId}-${startDate.toISOString()}-${endDate.toISOString()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get(`/admin/organizations/${organizationId}/analytics`, {
        params: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        }
      });

      const analytics = AdminAnalytics.fromJSON(response);
      this.addToCache(cacheKey, analytics);
      return analytics;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch analytics');
    }
  }

  async getRealtimeMetrics(organizationId: string): Promise<{
    activeUsers: number;
    activeAnalyses: number;
    systemLoad: number;
    queueDepth: number;
  }> {
    try {
      const response = await api.get(`/admin/organizations/${organizationId}/realtime`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch realtime metrics');
    }
  }

  async getTimeSavedMetrics(organizationId: string, period: '7d' | '30d' | '90d' | '1y'): Promise<{
    totalMinutesSaved: number;
    totalHoursSaved: number;
    analysisCount: number;
    speedUpFactor: number;
  }> {
    try {
      const response = await api.get(`/admin/organizations/${organizationId}/time-saved`, {
        params: { period }
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch time saved metrics');
    }
  }

  private getFromCache(key: string): AdminAnalytics | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private addToCache(key: string, analytics: AdminAnalytics): void {
    this.cache.set(key, {
      data: analytics,
      timestamp: Date.now()
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export class UserActivityRepository implements IPaginatedRepository<UserActivity> {
  async findById(id: string): Promise<UserActivity | null> {
    try {
      const response = await api.get(`/admin/activity/${id}`);
      return UserActivity.fromJSON(response);
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async findAll(): Promise<UserActivity[]> {
    try {
      const response = await api.get('/admin/activity');
      return response.activities.map((a: any) => UserActivity.fromJSON(a));
    } catch (error) {
      throw new Error('Failed to fetch activities');
    }
  }

  async findPaginated(options: IQueryOptions): Promise<IPaginatedResult<UserActivity>> {
    try {
      const params = new URLSearchParams({
        page: String(options.page || 1),
        page_size: String(options.pageSize || 20),
        ...(options.sortBy && { sort_by: options.sortBy }),
        ...(options.sortOrder && { sort_order: options.sortOrder }),
        ...(options.filters && { ...options.filters })
      });

      const response = await api.get(`/admin/activity?${params}`);

      return {
        data: response.activities.map((a: any) => UserActivity.fromJSON(a)),
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages
      };
    } catch (error) {
      throw new Error('Failed to fetch paginated activities');
    }
  }

  async create(data: Partial<UserActivity>): Promise<UserActivity> {
    throw new Error('create not supported for UserActivity');
  }

  async update(id: string, data: Partial<UserActivity>): Promise<UserActivity> {
    throw new Error('update not supported for UserActivity');
  }

  async delete(id: string): Promise<boolean> {
    throw new Error('delete not supported for UserActivity');
  }

  async getAuditLog(
    organizationId: string,
    options: IQueryOptions
  ): Promise<IPaginatedResult<UserActivity>> {
    try {
      const params = new URLSearchParams({
        page: String(options.page || 1),
        page_size: String(options.pageSize || 50),
        ...(options.sortBy && { sort_by: options.sortBy }),
        ...(options.sortOrder && { sort_order: options.sortOrder }),
        ...(options.filters && { ...options.filters })
      });

      const response = await api.get(`/admin/organizations/${organizationId}/audit?${params}`);

      return {
        data: response.activities.map((a: any) => UserActivity.fromJSON(a)),
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages
      };
    } catch (error) {
      throw new Error('Failed to fetch audit log');
    }
  }
}

export class UserManagementRepository implements IPaginatedRepository<UserManagementData> {
  async findById(userId: string): Promise<UserManagementData | null> {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response;
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async findAll(): Promise<UserManagementData[]> {
    try {
      const response = await api.get('/admin/users');
      return response.users;
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  }

  async findPaginated(options: IQueryOptions): Promise<IPaginatedResult<UserManagementData>> {
    try {
      const params = new URLSearchParams({
        page: String(options.page || 1),
        page_size: String(options.pageSize || 20),
        ...(options.sortBy && { sort_by: options.sortBy }),
        ...(options.sortOrder && { sort_order: options.sortOrder }),
        ...(options.filters && { ...options.filters })
      });

      const response = await api.get(`/admin/users?${params}`);

      return {
        data: response.users,
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages
      };
    } catch (error) {
      throw new Error('Failed to fetch paginated users');
    }
  }

  async create(data: Partial<UserManagementData>): Promise<UserManagementData> {
    try {
      const response = await api.post('/admin/users', data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create user');
    }
  }

  async update(userId: string, data: Partial<UserManagementData>): Promise<UserManagementData> {
    try {
      const response = await api.patch(`/admin/users/${userId}`, data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update user');
    }
  }

  async delete(userId: string): Promise<boolean> {
    try {
      await api.delete(`/admin/users/${userId}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async suspendUser(userId: string, reason: string): Promise<UserManagementData> {
    try {
      const response = await api.post(`/admin/users/${userId}/suspend`, { reason });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to suspend user');
    }
  }

  async unsuspendUser(userId: string): Promise<UserManagementData> {
    try {
      const response = await api.post(`/admin/users/${userId}/unsuspend`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to unsuspend user');
    }
  }

  async inviteUser(email: string, role: string): Promise<void> {
    try {
      await api.post('/admin/users/invite', { email, role });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to invite user');
    }
  }

  async bulkAction(userIds: string[], action: 'suspend' | 'unsuspend' | 'delete'): Promise<void> {
    try {
      await api.post('/admin/users/bulk', { user_ids: userIds, action });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to perform bulk action');
    }
  }
}
