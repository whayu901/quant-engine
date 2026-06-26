/**
 * SystemSettings Entity - SOLID: Single Responsibility Principle
 * Only represents system-wide settings data structure
 */

export interface SystemAnalyticsSettings {
  enabled: boolean;
  trackingId?: string;
  anonymizeIp: boolean;
  cookieConsent: boolean;
}

export interface SystemSecuritySettings {
  enforcePasswordPolicy: boolean;
  minPasswordLength: number;
  requireSpecialChars: boolean;
  require2FA: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
}

export interface SystemFeatureFlags {
  aiAnalysis: boolean;
  codeMixingDetection: boolean;
  realtimeCollaboration: boolean;
  advancedReporting: boolean;
  exportData: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  ssoIntegration: boolean;
}

export interface SystemMaintenanceSettings {
  maintenanceMode: boolean;
  scheduledMaintenance?: {
    startTime: Date;
    endTime: Date;
    message: string;
  };
  allowedIps?: string[];
}

export class SystemSettings {
  constructor(
    public readonly organizationId: string,
    public readonly analytics: SystemAnalyticsSettings,
    public readonly security: SystemSecuritySettings,
    public readonly features: SystemFeatureFlags,
    public readonly maintenance: SystemMaintenanceSettings,
    public readonly branding: {
      organizationName: string;
      logoUrl?: string;
      primaryColor?: string;
      accentColor?: string;
    },
    public readonly limits: {
      maxUsersPerOrg: number;
      maxProjectsPerUser: number;
      maxStoragePerOrg: number; // in GB
      maxAnalysesPerMonth: number;
    },
    public readonly updatedAt?: Date,
    public readonly updatedBy?: string
  ) {}

  static createDefault(organizationId: string): SystemSettings {
    return new SystemSettings(
      organizationId,
      {
        enabled: false,
        anonymizeIp: true,
        cookieConsent: true
      },
      {
        enforcePasswordPolicy: true,
        minPasswordLength: 12,
        requireSpecialChars: true,
        require2FA: false,
        sessionTimeout: 86400000, // 24 hours
        maxLoginAttempts: 5,
        lockoutDuration: 900000 // 15 minutes
      },
      {
        aiAnalysis: true,
        codeMixingDetection: true,
        realtimeCollaboration: true,
        advancedReporting: true,
        exportData: true,
        apiAccess: true,
        webhooks: true,
        ssoIntegration: false
      },
      {
        maintenanceMode: false
      },
      {
        organizationName: 'Qual Engine',
        primaryColor: '#0A7AFF',
        accentColor: '#7B4FFF'
      },
      {
        maxUsersPerOrg: 100,
        maxProjectsPerUser: 50,
        maxStoragePerOrg: 100,
        maxAnalysesPerMonth: 1000
      }
    );
  }

  static fromJSON(json: any): SystemSettings {
    return new SystemSettings(
      json.organization_id || json.organizationId,
      json.analytics,
      json.security,
      json.features,
      {
        maintenanceMode: json.maintenance.maintenance_mode || json.maintenance.maintenanceMode,
        scheduledMaintenance: json.maintenance.scheduled_maintenance ? {
          startTime: new Date(json.maintenance.scheduled_maintenance.start_time),
          endTime: new Date(json.maintenance.scheduled_maintenance.end_time),
          message: json.maintenance.scheduled_maintenance.message
        } : undefined,
        allowedIps: json.maintenance.allowed_ips || json.maintenance.allowedIps
      },
      json.branding,
      json.limits,
      json.updated_at ? new Date(json.updated_at) : undefined,
      json.updated_by || json.updatedBy
    );
  }

  toJSON(): Record<string, any> {
    return {
      organization_id: this.organizationId,
      analytics: this.analytics,
      security: this.security,
      features: this.features,
      maintenance: {
        maintenance_mode: this.maintenance.maintenanceMode,
        scheduled_maintenance: this.maintenance.scheduledMaintenance ? {
          start_time: this.maintenance.scheduledMaintenance.startTime.toISOString(),
          end_time: this.maintenance.scheduledMaintenance.endTime.toISOString(),
          message: this.maintenance.scheduledMaintenance.message
        } : undefined,
        allowed_ips: this.maintenance.allowedIps
      },
      branding: this.branding,
      limits: this.limits,
      updated_at: this.updatedAt?.toISOString(),
      updated_by: this.updatedBy
    };
  }

  isFeatureEnabled(feature: keyof SystemFeatureFlags): boolean {
    return this.features[feature];
  }

  isInMaintenance(): boolean {
    if (!this.maintenance.maintenanceMode) return false;

    if (this.maintenance.scheduledMaintenance) {
      const now = new Date();
      return now >= this.maintenance.scheduledMaintenance.startTime &&
             now <= this.maintenance.scheduledMaintenance.endTime;
    }

    return this.maintenance.maintenanceMode;
  }
}
