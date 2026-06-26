/**
 * Billing Controller - SOLID: Single Responsibility & Liskov Substitution
 * Manages billing business logic and state
 */

import { BillingSettings, PaymentMethod, Invoice } from '../models/entities/BillingSettings';
import { BillingRepository } from '../models/repositories/SettingsRepository';
import { EventEmitter } from '../utils/EventEmitter';

export interface BillingState {
  billing: BillingSettings | null;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
}

export interface IBillingController {
  getState(): BillingState;
  loadBilling(userId: string): Promise<void>;
  updateSubscription(userId: string, tier: string): Promise<void>;
  cancelSubscription(userId: string): Promise<void>;
  getUsagePercentage(metric: 'analysisMinutes' | 'analyses' | 'storage' | 'apiCalls'): number;
  isUsageLimitReached(metric: 'analysisMinutes' | 'analyses' | 'storage' | 'apiCalls'): boolean;
  subscribe(listener: (state: BillingState) => void): () => void;
}

/**
 * Billing Controller Implementation
 * SOLID: Dependency Inversion - Depends on repository abstraction
 */
export class BillingController implements IBillingController {
  private state: BillingState = {
    billing: null,
    isLoading: false,
    error: null,
    isProcessing: false
  };

  private eventEmitter = new EventEmitter<BillingState>();

  constructor(private billingRepository: BillingRepository) {}

  getState(): BillingState {
    return { ...this.state };
  }

  async loadBilling(userId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const billing = await this.billingRepository.findById(userId);

      if (!billing) {
        throw new Error('Billing information not found');
      }

      this.updateState({
        billing,
        isLoading: false
      });

      // Check for usage warnings
      this.checkUsageWarnings(billing);

      this.eventEmitter.emit('billing_loaded', billing);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load billing information'
      });
      throw error;
    }
  }

  async updateSubscription(userId: string, tier: string): Promise<void> {
    this.updateState({ isProcessing: true, error: null });

    try {
      this.validateSubscriptionTier(tier);

      const updatedBilling = await this.billingRepository.updateSubscription(userId, tier);

      this.updateState({
        billing: updatedBilling,
        isProcessing: false
      });

      this.eventEmitter.emit('subscription_updated', updatedBilling);
    } catch (error: any) {
      this.updateState({
        isProcessing: false,
        error: error.message || 'Failed to update subscription'
      });
      throw error;
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    this.updateState({ isProcessing: true, error: null });

    try {
      const updatedBilling = await this.billingRepository.cancelSubscription(userId);

      this.updateState({
        billing: updatedBilling,
        isProcessing: false
      });

      this.eventEmitter.emit('subscription_canceled', updatedBilling);
    } catch (error: any) {
      this.updateState({
        isProcessing: false,
        error: error.message || 'Failed to cancel subscription'
      });
      throw error;
    }
  }

  getUsagePercentage(metric: 'analysisMinutes' | 'analyses' | 'storage' | 'apiCalls'): number {
    if (!this.state.billing) return 0;
    return this.state.billing.getUsagePercentage(metric);
  }

  isUsageLimitReached(metric: 'analysisMinutes' | 'analyses' | 'storage' | 'apiCalls'): boolean {
    if (!this.state.billing) return false;
    return this.state.billing.isUsageLimitReached(metric);
  }

  getDaysUntilRenewal(): number {
    if (!this.state.billing) return 0;
    return this.state.billing.daysUntilRenewal;
  }

  getDefaultPaymentMethod(): PaymentMethod | undefined {
    if (!this.state.billing) return undefined;
    return this.state.billing.defaultPaymentMethod;
  }

  getTotalSpent(): number {
    if (!this.state.billing) return 0;
    return this.state.billing.totalSpent;
  }

  isOnTrial(): boolean {
    if (!this.state.billing) return false;
    return this.state.billing.isOnTrial;
  }

  subscribe(listener: (state: BillingState) => void): () => void {
    listener(this.state);
    return this.eventEmitter.on('state_change', listener);
  }

  private updateState(partial: Partial<BillingState>): void {
    this.state = { ...this.state, ...partial };
    this.eventEmitter.emit('state_change', this.state);
  }

  private validateSubscriptionTier(tier: string): void {
    const validTiers = ['free', 'starter', 'pro', 'enterprise'];
    if (!validTiers.includes(tier)) {
      throw new Error('Invalid subscription tier');
    }
  }

  private checkUsageWarnings(billing: BillingSettings): void {
    const metrics: Array<'analysisMinutes' | 'analyses' | 'storage' | 'apiCalls'> = [
      'analysisMinutes',
      'analyses',
      'storage',
      'apiCalls'
    ];

    metrics.forEach(metric => {
      const percentage = billing.getUsagePercentage(metric);

      if (percentage >= 90) {
        this.eventEmitter.emit('usage_warning', {
          metric,
          percentage,
          level: 'critical'
        });
      } else if (percentage >= 75) {
        this.eventEmitter.emit('usage_warning', {
          metric,
          percentage,
          level: 'warning'
        });
      }
    });

    // Check trial expiration
    if (billing.isOnTrial && billing.subscription.trialEnd) {
      const daysLeft = Math.ceil(
        (billing.subscription.trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysLeft <= 3) {
        this.eventEmitter.emit('trial_expiring', { daysLeft });
      }
    }
  }
}
