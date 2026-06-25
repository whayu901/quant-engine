/**
 * Billing Container - MVC/SOLID
 * Manages billing, usage, and subscription
 */

import React, { useEffect, useState } from 'react';
import { Services } from '../../di/services';
import { BillingView } from '../components/BillingView';

interface UsageData {
  plan: string;
  monthCount: number;
  limit: number;
  percentage: number;
  daysRemaining: number;
}

interface BillingInfo {
  customerId: string;
  subscriptionStatus: 'active' | 'cancelled' | 'past_due';
  currentPlan: 'free' | 'starter' | 'professional' | 'enterprise';
  nextBillingDate?: string;
  paymentMethod?: {
    type: string;
    last4?: string;
  };
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

export const BillingContainer: React.FC = () => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);

      // Simulate loading billing data
      // In production, this would call the actual billing service
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUsage({
        plan: 'Professional',
        monthCount: 42,
        limit: 100,
        percentage: 42,
        daysRemaining: 15
      });

      setBilling({
        customerId: 'cus_12345',
        subscriptionStatus: 'active',
        currentPlan: 'professional',
        nextBillingDate: '2026-07-01',
        paymentMethod: {
          type: 'card',
          last4: '4242'
        }
      });

      setInvoices([
        {
          id: 'inv_001',
          date: '2026-06-01',
          amount: 99,
          status: 'paid',
          downloadUrl: '/invoices/inv_001.pdf'
        },
        {
          id: 'inv_002',
          date: '2026-05-01',
          amount: 99,
          status: 'paid',
          downloadUrl: '/invoices/inv_002.pdf'
        }
      ]);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradePlan = async (plan: string) => {
    try {
      // Implement plan upgrade logic
      console.log('Upgrading to plan:', plan);
      alert(`Upgrading to ${plan} plan...`);
      await loadBillingData();
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        // Implement cancellation logic
        console.log('Cancelling subscription...');
        alert('Subscription cancelled');
        await loadBillingData();
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
      }
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      // Implement payment method update
      console.log('Updating payment method...');
      alert('Redirecting to payment update...');
    } catch (error) {
      console.error('Failed to update payment method:', error);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      window.open(invoice.downloadUrl, '_blank');
    }
  };

  return (
    <BillingView
      usage={usage}
      billing={billing}
      invoices={invoices}
      isLoading={isLoading}
      onUpgradePlan={handleUpgradePlan}
      onCancelSubscription={handleCancelSubscription}
      onUpdatePaymentMethod={handleUpdatePaymentMethod}
      onDownloadInvoice={handleDownloadInvoice}
    />
  );
};