/**
 * Billing Page Component - MVC/SOLID
 * Single Responsibility: Page layout structure only
 */

import React from 'react';
import { BillingContainer } from '../containers/BillingContainer';
import { MainLayout } from '../layouts/MainLayout';

export const BillingPage: React.FC = () => {
  return (
    <MainLayout>
      <BillingContainer />
    </MainLayout>
  );
};