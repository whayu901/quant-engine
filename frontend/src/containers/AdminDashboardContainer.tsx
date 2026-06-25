/**
 * Admin Dashboard Container - MVC Pattern
 * Connects AdminDashboardView (pure presentation) with AdminController (business logic)
 * Acts as the glue between View and Controller
 */

import React, { useEffect, useState } from 'react';
import {
  AdminDashboardView,
  UserManagementView,
  ActivityFeedView
} from '../views/admin/AdminDashboardView';
import { Services } from '../di/setup';
import type { AdminState } from '../controllers/AdminController';

/**
 * Admin Dashboard Container Component
 * Responsibilities:
 * - Subscribe to controller state
 * - Pass data to view as props
 * - Delegate actions to controller
 * - Manage realtime updates
 */
export const AdminDashboardContainer: React.FC<{ organizationId: string }> = ({
  organizationId
}) => {
  const [state, setState] = useState<AdminState>(Services.admin.getState());
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });

  useEffect(() => {
    // Subscribe to controller state changes
    const unsubscribe = Services.admin.subscribe(setState);

    // Load initial data
    loadDashboard();

    // Start realtime updates
    Services.admin.startRealtimeUpdates(organizationId, 10000);

    return () => {
      unsubscribe();
      Services.admin.stopRealtimeUpdates();
    };
  }, [organizationId]);

  useEffect(() => {
    // Reload analytics when date range changes
    loadAnalytics();
  }, [dateRange]);

  const loadDashboard = async () => {
    try {
      await Promise.all([
        loadAnalytics(),
        loadUsers(),
        loadActivities()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      await Services.admin.loadAnalytics(
        organizationId,
        dateRange.startDate,
        dateRange.endDate
      );
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadUsers = async () => {
    try {
      await Services.admin.loadUsers({
        page: 1,
        pageSize: 20,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadActivities = async () => {
    try {
      await Services.admin.loadActivities({
        page: 1,
        pageSize: 50,
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
  };

  const handleRefresh = () => {
    loadDashboard();
  };

  const handlePageChange = async (page: number) => {
    try {
      await Services.admin.loadUsers({
        page,
        pageSize: state.pageSize
      });
    } catch (error) {
      console.error('Failed to change page:', error);
    }
  };

  const handleUserSelect = async (userId: string) => {
    try {
      await Services.admin.loadUser(userId);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const handleInviteUser = async () => {
    // Open invite modal
    // This would trigger a modal component
    console.log('Open invite user modal');
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const reason = prompt('Reason for suspension:');
      if (reason) {
        await Services.admin.suspendUser(userId, reason);
      }
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const handleBulkAction = async (
    userIds: string[],
    action: 'suspend' | 'unsuspend' | 'delete'
  ) => {
    try {
      const confirmed = confirm(
        `Are you sure you want to ${action} ${userIds.length} users?`
      );
      if (confirmed) {
        await Services.admin.bulkAction(userIds, action);
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const handleLoadMoreActivities = async () => {
    try {
      await Services.admin.loadActivities({
        page: Math.ceil(state.activities.length / 50) + 1,
        pageSize: 50
      });
    } catch (error) {
      console.error('Failed to load more activities:', error);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <AdminDashboardView
        analytics={state.analytics}
        realtimeMetrics={state.realtimeMetrics}
        isLoading={state.isLoading}
        error={state.error}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onRefresh={handleRefresh}
      />

      <UserManagementView
        users={state.users}
        totalUsers={state.totalUsers}
        currentPage={state.currentPage}
        pageSize={state.pageSize}
        isLoading={state.isLoading}
        onPageChange={handlePageChange}
        onUserSelect={handleUserSelect}
        onInviteUser={handleInviteUser}
        onSuspendUser={handleSuspendUser}
        onBulkAction={handleBulkAction}
      />

      <ActivityFeedView
        activities={state.activities}
        isLoading={state.isLoading}
        onLoadMore={handleLoadMoreActivities}
      />
    </div>
  );
};
