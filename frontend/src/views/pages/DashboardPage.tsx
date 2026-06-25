/**
 * Dashboard Page - SOLID: Single Responsibility
 * Page layout component for dashboard
 */

import React from 'react';
import { DashboardContainer } from '../containers/DashboardContainer';
import { MainLayout } from '../layouts/MainLayout';

/**
 * Dashboard Page Component
 * SOLID: Single Responsibility - Only responsible for page structure
 */
export const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <DashboardContainer />
    </MainLayout>
  );
};