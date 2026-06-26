/**
 * Analysis Page Component - MVC/SOLID
 * Single Responsibility: Page layout structure only
 */

import React from 'react';
import { AnalysisContainer } from '../containers/AnalysisContainer';
import { MainLayout } from '../layouts/MainLayout';

export const AnalysisPage: React.FC = () => {
  return (
    <MainLayout>
      <AnalysisContainer />
    </MainLayout>
  );
};