/**
 * Project Detail Page Component - MVC/SOLID
 * Single Responsibility: Page layout structure only
 */

import React from 'react';
import { ProjectDetailContainer } from '../containers/ProjectDetailContainer';
import { MainLayout } from '../layouts/MainLayout';

export const ProjectDetailPage: React.FC = () => {
  return (
    <MainLayout>
      <ProjectDetailContainer />
    </MainLayout>
  );
};