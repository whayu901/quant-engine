/**
 * Admin Page - SOLID: Single Responsibility
 * Page layout component for admin dashboard
 */

import React from 'react';
import { AdminContainer } from '../containers/AdminContainer';
import { MainLayout } from '../layouts/MainLayout';

/**
 * Admin Page Component
 * SOLID: Single Responsibility - Only responsible for page structure
 */
export const AdminPage: React.FC = () => {
  return (
    <MainLayout>
      <AdminContainer />
    </MainLayout>
  );
};