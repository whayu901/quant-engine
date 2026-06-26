// Dashboard hooks following MVVM pattern with React Query
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys, mutationKeys } from '../../../core/api/query-client';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardFilters } from '../types';

// Hook to fetch dashboard data
export function useDashboardData(filters?: DashboardFilters) {
  return useQuery({
    queryKey: [...queryKeys.all, 'dashboard', 'data', filters] as const,
    queryFn: () => dashboardService.getDashboardData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Keep previous data while fetching new data (for smooth filter transitions)
    keepPreviousData: true,
  });
}

// Hook to export dashboard data
export function useExportDashboard() {
  return useMutation({
    mutationKey: ['dashboard', 'export'] as const,
    mutationFn: (filters?: DashboardFilters) =>
      dashboardService.exportDashboardData(filters),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
