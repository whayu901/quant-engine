/**
 * Admin Container - SOLID: Single Responsibility
 * Connects AdminDashboardView to AdminController (MVC pattern)
 */

import React, { useEffect, useState } from 'react';
import { AdminDashboardView } from '../admin/AdminDashboardView';
import { Services } from '../../di/services';
import { AdminState } from '../../controllers/AdminController';

/**
 * Admin Container Component
 * SOLID: Dependency Inversion - Depends on controller abstractions
 */
export const AdminContainer: React.FC = () => {
  const adminController = Services.admin;
  const authController = Services.auth;

  // State from controllers
  const [adminState, setAdminState] = useState<AdminState>(adminController.getState());
  const [authState, setAuthState] = useState(authController.getState());

  // Date range for analytics
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribeAdmin = adminController.subscribe(setAdminState);
    const unsubscribeAuth = authController.subscribe(setAuthState);

    // Load initial data
    if (authState.user?.organizationId) {
      loadAnalytics();
      // Start real-time updates
      adminController.startRealtimeUpdates(authState.user.organizationId, 10000);
    }

    return () => {
      unsubscribeAdmin();
      unsubscribeAuth();
      adminController.stopRealtimeUpdates();
    };
  }, [authState.user?.organizationId]);

  const loadAnalytics = async () => {
    if (!authState.user?.organizationId) return;

    try {
      await adminController.loadAnalytics(
        authState.user.organizationId,
        dateRange.startDate,
        dateRange.endDate
      );
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
    if (authState.user?.organizationId) {
      adminController.loadAnalytics(
        authState.user.organizationId,
        startDate,
        endDate
      );
    }
  };

  const handleRefresh = () => {
    loadAnalytics();
  };

  return (
    <AdminDashboardView
      analytics={adminState.analytics}
      realtimeMetrics={adminState.realtimeMetrics}
      isLoading={adminState.isLoading}
      error={adminState.error}
      dateRange={dateRange}
      onDateRangeChange={handleDateRangeChange}
      onRefresh={handleRefresh}
    />
  );
};