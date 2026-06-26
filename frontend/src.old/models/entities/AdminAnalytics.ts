/**
 * Admin Analytics Entities - SOLID: Single Responsibility Principle
 * Only represents admin analytics data structures
 */

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
}

export interface UserActivityMetrics {
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number; // in minutes
  totalSessions: number;
}

export interface UsageStatistics {
  totalProjects: number;
  totalAnalyses: number;
  totalTranscripts: number;
  totalMinutesProcessed: number;
  timeSavedMinutes: number; // 8 hours → 5 minutes
  averageAnalysisTime: number; // in seconds
}

export interface SystemHealthMetrics {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number; // percentage
  apiResponseTime: number; // in ms
  errorRate: number; // percentage
  cacheHitRate: number; // percentage
  queueDepth: number;
  activeConnections: number;
}

export interface GeographicDistribution {
  country: string;
  countryCode: string;
  userCount: number;
  analysisCount: number;
  percentage: number;
}

export interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  totalRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number; // percentage
  growthRate: number; // percentage
}

export class AdminAnalytics {
  constructor(
    public readonly organizationId: string,
    public readonly period: {
      startDate: Date;
      endDate: Date;
    },
    public readonly userActivity: UserActivityMetrics,
    public readonly usage: UsageStatistics,
    public readonly systemHealth: SystemHealthMetrics,
    public readonly geographic: GeographicDistribution[],
    public readonly revenue: RevenueMetrics,
    public readonly timeSeries: {
      userActivity: TimeSeriesData[];
      analysisVolume: TimeSeriesData[];
      systemLoad: TimeSeriesData[];
    },
    public readonly generatedAt: Date
  ) {}

  get timeSavedHours(): number {
    // Conversion: 8 hours traditional → 5 minutes with Qual Engine
    // Time saved = (traditional_time - actual_time) per analysis
    const traditionalMinutesPerAnalysis = 480; // 8 hours
    const actualMinutesPerAnalysis = 5;
    const timeSavedPerAnalysis = traditionalMinutesPerAnalysis - actualMinutesPerAnalysis;
    return (this.usage.totalAnalyses * timeSavedPerAnalysis) / 60;
  }

  get speedUpFactor(): number {
    // 8 hours / 5 minutes = 96x faster
    return 480 / 5;
  }

  get topCountries(): GeographicDistribution[] {
    return [...this.geographic]
      .sort((a, b) => b.userCount - a.userCount)
      .slice(0, 5);
  }

  get healthScore(): number {
    const uptimeScore = this.systemHealth.uptime;
    const errorScore = 100 - this.systemHealth.errorRate;
    const cacheScore = this.systemHealth.cacheHitRate;
    const responseScore = Math.max(0, 100 - (this.systemHealth.apiResponseTime / 10));

    return (uptimeScore + errorScore + cacheScore + responseScore) / 4;
  }

  static fromJSON(json: any): AdminAnalytics {
    return new AdminAnalytics(
      json.organization_id || json.organizationId,
      {
        startDate: new Date(json.period.start_date),
        endDate: new Date(json.period.end_date)
      },
      json.user_activity,
      json.usage,
      json.system_health,
      json.geographic || [],
      json.revenue,
      {
        userActivity: json.time_series.user_activity?.map((d: any) => ({
          timestamp: new Date(d.timestamp),
          value: d.value
        })) || [],
        analysisVolume: json.time_series.analysis_volume?.map((d: any) => ({
          timestamp: new Date(d.timestamp),
          value: d.value
        })) || [],
        systemLoad: json.time_series.system_load?.map((d: any) => ({
          timestamp: new Date(d.timestamp),
          value: d.value
        })) || []
      },
      new Date(json.generated_at)
    );
  }

  toJSON(): Record<string, any> {
    return {
      organization_id: this.organizationId,
      period: {
        start_date: this.period.startDate.toISOString(),
        end_date: this.period.endDate.toISOString()
      },
      user_activity: this.userActivity,
      usage: this.usage,
      system_health: this.systemHealth,
      geographic: this.geographic,
      revenue: this.revenue,
      time_series: {
        user_activity: this.timeSeries.userActivity.map(d => ({
          timestamp: d.timestamp.toISOString(),
          value: d.value
        })),
        analysis_volume: this.timeSeries.analysisVolume.map(d => ({
          timestamp: d.timestamp.toISOString(),
          value: d.value
        })),
        system_load: this.timeSeries.systemLoad.map(d => ({
          timestamp: d.timestamp.toISOString(),
          value: d.value
        }))
      },
      generated_at: this.generatedAt.toISOString()
    };
  }
}

export interface UserManagementData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: 'active' | 'suspended' | 'invited' | 'inactive';
  lastLoginAt?: Date;
  createdAt: Date;
  projectCount: number;
  analysisCount: number;
  storageUsed: number; // in GB
}

export class UserActivity {
  constructor(
    public readonly userId: string,
    public readonly userName: string,
    public readonly action: string,
    public readonly resource: string,
    public readonly resourceId?: string,
    public readonly metadata?: Record<string, any>,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
    public readonly timestamp: Date
  ) {}

  get displayAction(): string {
    return `${this.action} ${this.resource}`;
  }

  static fromJSON(json: any): UserActivity {
    return new UserActivity(
      json.user_id || json.userId,
      json.user_name || json.userName,
      json.action,
      json.resource,
      json.resource_id || json.resourceId,
      json.metadata,
      json.ip_address || json.ipAddress,
      json.user_agent || json.userAgent,
      new Date(json.timestamp)
    );
  }

  toJSON(): Record<string, any> {
    return {
      user_id: this.userId,
      user_name: this.userName,
      action: this.action,
      resource: this.resource,
      resource_id: this.resourceId,
      metadata: this.metadata,
      ip_address: this.ipAddress,
      user_agent: this.userAgent,
      timestamp: this.timestamp.toISOString()
    };
  }
}
