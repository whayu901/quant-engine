/**
 * Settings Page - SOLID: Single Responsibility
 * Page layout component for user settings
 */

import React from 'react';
import { SettingsContainer } from '../containers/SettingsContainer';
import { MainLayout } from '../layouts/MainLayout';

/**
 * Settings Page Component
 * SOLID: Single Responsibility - Only responsible for page structure
 */
export const SettingsPage: React.FC = () => {
  return (
    <MainLayout>
      <SettingsContainer />
    </MainLayout>
  );
};