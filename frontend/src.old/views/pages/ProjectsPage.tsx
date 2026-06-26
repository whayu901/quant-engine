/**
 * Projects Page - SOLID: Single Responsibility
 * Page layout component for projects listing
 */

import React from 'react';
import { ProjectsContainer } from '../containers/ProjectsContainer';
import { MainLayout } from '../layouts/MainLayout';

/**
 * Projects Page Component
 * SOLID: Single Responsibility - Only responsible for page structure
 */
export const ProjectsPage: React.FC = () => {
  return (
    <MainLayout>
      <ProjectsContainer />
    </MainLayout>
  );
};