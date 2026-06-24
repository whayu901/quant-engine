// Dashboard service following SOLID principles
import { apiClient } from '../../../core/api/client';
import type { ApiClient } from '../../../core/api/client';
import type { DashboardData, DashboardFilters } from '../types';

// Service interface for dependency inversion
export interface IDashboardService {
  getDashboardData(filters?: DashboardFilters): Promise<DashboardData>;
  exportDashboardData(filters?: DashboardFilters): Promise<Blob>;
}

// Concrete implementation
export class DashboardService implements IDashboardService {
  constructor(private api: ApiClient) {}

  async getDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
    const params = new URLSearchParams();

    if (filters?.selectedMarket && filters.selectedMarket !== 'all') {
      params.append('market', filters.selectedMarket);
    }
    if (filters?.dateRange) {
      params.append('date_range', filters.dateRange);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/dashboard/insights?${queryString}`
      : '/api/v1/dashboard/insights';

    return await this.api.get<DashboardData>(url);
  }

  async exportDashboardData(filters?: DashboardFilters): Promise<Blob> {
    const params = new URLSearchParams();

    if (filters?.selectedMarket && filters.selectedMarket !== 'all') {
      params.append('market', filters.selectedMarket);
    }
    if (filters?.dateRange) {
      params.append('date_range', filters.dateRange);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/dashboard/export?${queryString}`
      : '/api/v1/dashboard/export';

    // For blob responses, we need to handle differently
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    return await response.blob();
  }
}

// Create default service instance
export const dashboardService = new DashboardService(apiClient);
