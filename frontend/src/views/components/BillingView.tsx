/**
 * Billing View - Pure presentation component
 */

import React from 'react';

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

interface BillingViewProps {
  usage: UsageData | null;
  billing: BillingInfo | null;
  invoices: Invoice[];
  isLoading: boolean;
  onUpgradePlan: (plan: string) => Promise<void>;
  onCancelSubscription: () => Promise<void>;
  onUpdatePaymentMethod: () => Promise<void>;
  onDownloadInvoice: (invoiceId: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  usage,
  billing,
  invoices,
  isLoading,
  onUpgradePlan,
  onCancelSubscription,
  onUpdatePaymentMethod,
  onDownloadInvoice
}) => {
  const plans = [
    { id: 'free', name: 'Free', price: 0, analyses: 5, features: ['5 analyses/month', '1 user', 'Basic support'] },
    { id: 'starter', name: 'Starter', price: 29, analyses: 25, features: ['25 analyses/month', '3 users', 'Email support', 'Export to PDF'] },
    { id: 'professional', name: 'Professional', price: 99, analyses: 100, features: ['100 analyses/month', '10 users', 'Priority support', 'All export formats', 'API access'] },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', analyses: 'Unlimited', features: ['Unlimited analyses', 'Unlimited users', 'Dedicated support', 'Custom integrations', 'SLA'] }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velocity-blue mx-auto mb-4"></div>
          <p className="text-slate-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing & Usage</h1>
        <p className="text-slate-600 mt-1">Manage your subscription and track usage</p>
      </div>

      {/* Usage Overview */}
      {usage && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Current Usage</h2>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-700">Analyses This Month</span>
              <span className="font-medium text-slate-900">
                {usage.monthCount} / {usage.limit}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-velocity-blue to-neural-purple h-3 rounded-full transition-all"
                style={{ width: `${Math.min(usage.percentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {usage.daysRemaining} days remaining in billing cycle
            </p>
          </div>

          {usage.percentage > 80 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              You've used {usage.percentage}% of your monthly limit. Consider upgrading for more analyses.
            </div>
          )}
        </div>
      )}

      {/* Current Plan */}
      {billing && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Current Plan</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              billing.subscriptionStatus === 'active'
                ? 'bg-green-100 text-green-700'
                : billing.subscriptionStatus === 'past_due'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {billing.subscriptionStatus}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Plan</span>
              <span className="font-medium text-slate-900 capitalize">{billing.currentPlan}</span>
            </div>
            {billing.nextBillingDate && (
              <div className="flex justify-between">
                <span className="text-slate-600">Next Billing Date</span>
                <span className="font-medium text-slate-900">
                  {new Date(billing.nextBillingDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {billing.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Method</span>
                <span className="font-medium text-slate-900">
                  {billing.paymentMethod.type} ending in {billing.paymentMethod.last4}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onUpdatePaymentMethod}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Update Payment
            </button>
            {billing.subscriptionStatus === 'active' && (
              <button
                onClick={onCancelSubscription}
                className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg border-2 p-6 ${
                billing?.currentPlan === plan.id
                  ? 'border-velocity-blue'
                  : 'border-slate-200'
              }`}
            >
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              <div className="my-4">
                {typeof plan.price === 'number' ? (
                  <div>
                    <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                    <span className="text-slate-600">/month</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {billing?.currentPlan !== plan.id && (
                <button
                  onClick={() => onUpgradePlan(plan.id)}
                  className="w-full py-2 px-4 bg-velocity-blue text-white rounded-lg hover:bg-velocity-blue-dark transition-colors"
                >
                  {plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                </button>
              )}
              {billing?.currentPlan === plan.id && (
                <div className="w-full py-2 px-4 bg-slate-100 text-slate-600 rounded-lg text-center">
                  Current Plan
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Billing History</h2>
        {invoices.length === 0 ? (
          <div className="bg-slate-50 rounded-lg p-8 text-center">
            <p className="text-slate-600">No invoices yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      ${invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => onDownloadInvoice(invoice.id)}
                        className="text-velocity-blue hover:text-velocity-blue-dark"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};