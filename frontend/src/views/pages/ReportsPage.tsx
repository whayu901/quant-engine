/**
 * Reports Page Component - MVC/SOLID
 * Single Responsibility: Page layout structure only
 */

import React from 'react';
import { ReportsContainer } from '../containers/ReportsContainer';
import { MainLayout } from '../layouts/MainLayout';

export const ReportsPage: React.FC = () => {
  return (
    <MainLayout>
      <ReportsContainer />
    </MainLayout>
  );
};