/**
 * BillingSettings Entity - SOLID: Single Responsibility Principle
 * Only represents billing data structure
 */

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type PaymentMethodType = 'card' | 'bank_transfer' | 'paypal';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  billingDetails: {
    name: string;
    email: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  pdfUrl?: string;
  createdAt: Date;
  dueDate: Date;
  paidAt?: Date;
}

export interface UsageMetrics {
  analysisMinutes: {
    used: number;
    limit: number;
    resetDate: Date;
  };
  analyses: {
    used: number;
    limit: number;
    resetDate: Date;
  };
  storage: {
    used: number; // in GB
    limit: number; // in GB
  };
  apiCalls: {
    used: number;
    limit: number;
    resetDate: Date;
  };
}

export class BillingSettings {
  constructor(
    public readonly userId: string,
    public readonly organizationId: string,
    public readonly subscription: {
      tier: SubscriptionTier;
      status: SubscriptionStatus;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      cancelAtPeriodEnd: boolean;
      trialEnd?: Date;
    },
    public readonly usage: UsageMetrics,
    public readonly paymentMethods: PaymentMethod[],
    public readonly invoices: Invoice[],
    public readonly billingEmail: string,
    public readonly taxId?: string,
    public readonly updatedAt?: Date
  ) {}

  get isOnTrial(): boolean {
    return this.subscription.status === 'trialing' &&
           this.subscription.trialEnd !== undefined &&
           this.subscription.trialEnd > new Date();
  }

  get daysUntilRenewal(): number {
    const diff = this.subscription.currentPeriodEnd.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  get defaultPaymentMethod(): PaymentMethod | undefined {
    return this.paymentMethods.find(pm => pm.isDefault);
  }

  get totalSpent(): number {
    return this.invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }

  isUsageLimitReached(metric: keyof UsageMetrics): boolean {
    const usage = this.usage[metric];
    return 'used' in usage && 'limit' in usage && usage.used >= usage.limit;
  }

  getUsagePercentage(metric: keyof UsageMetrics): number {
    const usage = this.usage[metric];
    if (!('used' in usage) || !('limit' in usage)) return 0;
    return (usage.used / usage.limit) * 100;
  }

  static fromJSON(json: any): BillingSettings {
    return new BillingSettings(
      json.user_id || json.userId,
      json.organization_id || json.organizationId,
      {
        tier: json.subscription.tier,
        status: json.subscription.status,
        currentPeriodStart: new Date(json.subscription.current_period_start),
        currentPeriodEnd: new Date(json.subscription.current_period_end),
        cancelAtPeriodEnd: json.subscription.cancel_at_period_end || false,
        trialEnd: json.subscription.trial_end ? new Date(json.subscription.trial_end) : undefined
      },
      {
        analysisMinutes: {
          used: json.usage.analysis_minutes.used,
          limit: json.usage.analysis_minutes.limit,
          resetDate: new Date(json.usage.analysis_minutes.reset_date)
        },
        analyses: {
          used: json.usage.analyses.used,
          limit: json.usage.analyses.limit,
          resetDate: new Date(json.usage.analyses.reset_date)
        },
        storage: {
          used: json.usage.storage.used,
          limit: json.usage.storage.limit
        },
        apiCalls: {
          used: json.usage.api_calls.used,
          limit: json.usage.api_calls.limit,
          resetDate: new Date(json.usage.api_calls.reset_date)
        }
      },
      json.payment_methods?.map((pm: any) => ({
        id: pm.id,
        type: pm.type,
        last4: pm.last4,
        brand: pm.brand,
        expiryMonth: pm.expiry_month,
        expiryYear: pm.expiry_year,
        isDefault: pm.is_default,
        billingDetails: pm.billing_details
      })) || [],
      json.invoices?.map((inv: any) => ({
        id: inv.id,
        number: inv.number,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        description: inv.description,
        pdfUrl: inv.pdf_url,
        createdAt: new Date(inv.created_at),
        dueDate: new Date(inv.due_date),
        paidAt: inv.paid_at ? new Date(inv.paid_at) : undefined
      })) || [],
      json.billing_email || json.billingEmail,
      json.tax_id || json.taxId,
      json.updated_at ? new Date(json.updated_at) : undefined
    );
  }

  toJSON(): Record<string, any> {
    return {
      user_id: this.userId,
      organization_id: this.organizationId,
      subscription: {
        tier: this.subscription.tier,
        status: this.subscription.status,
        current_period_start: this.subscription.currentPeriodStart.toISOString(),
        current_period_end: this.subscription.currentPeriodEnd.toISOString(),
        cancel_at_period_end: this.subscription.cancelAtPeriodEnd,
        trial_end: this.subscription.trialEnd?.toISOString()
      },
      usage: {
        analysis_minutes: {
          used: this.usage.analysisMinutes.used,
          limit: this.usage.analysisMinutes.limit,
          reset_date: this.usage.analysisMinutes.resetDate.toISOString()
        },
        analyses: {
          used: this.usage.analyses.used,
          limit: this.usage.analyses.limit,
          reset_date: this.usage.analyses.resetDate.toISOString()
        },
        storage: {
          used: this.usage.storage.used,
          limit: this.usage.storage.limit
        },
        api_calls: {
          used: this.usage.apiCalls.used,
          limit: this.usage.apiCalls.limit,
          reset_date: this.usage.apiCalls.resetDate.toISOString()
        }
      },
      payment_methods: this.paymentMethods.map(pm => ({
        id: pm.id,
        type: pm.type,
        last4: pm.last4,
        brand: pm.brand,
        expiry_month: pm.expiryMonth,
        expiry_year: pm.expiryYear,
        is_default: pm.isDefault,
        billing_details: pm.billingDetails
      })),
      invoices: this.invoices.map(inv => ({
        id: inv.id,
        number: inv.number,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        description: inv.description,
        pdf_url: inv.pdfUrl,
        created_at: inv.createdAt.toISOString(),
        due_date: inv.dueDate.toISOString(),
        paid_at: inv.paidAt?.toISOString()
      })),
      billing_email: this.billingEmail,
      tax_id: this.taxId,
      updated_at: this.updatedAt?.toISOString()
    };
  }
}
