/**
 * UserSettings Entity - SOLID: Single Responsibility Principle
 * Only represents user settings data structure
 */

export interface NotificationPreferences {
  email: {
    projectUpdates: boolean;
    analysisComplete: boolean;
    weeklyDigest: boolean;
    securityAlerts: boolean;
    billingUpdates: boolean;
  };
  push: {
    projectUpdates: boolean;
    analysisComplete: boolean;
    mentions: boolean;
    securityAlerts: boolean;
  };
  inApp: {
    projectUpdates: boolean;
    analysisComplete: boolean;
    mentions: boolean;
    collaboratorJoined: boolean;
  };
}

export interface LanguageSettings {
  interfaceLanguage: string;
  dateFormat: string;
  numberFormat: string;
  currency: string;
  timezone: string;
  codeMixingDetection: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'app' | 'sms' | 'email';
  sessionTimeout: number;
  loginAlerts: boolean;
  deviceTrustEnabled: boolean;
  activeSessionCount?: number;
}

export interface IntegrationSettings {
  slack?: {
    enabled: boolean;
    workspaceId?: string;
    channelId?: string;
    notifications: string[];
  };
  teams?: {
    enabled: boolean;
    teamId?: string;
    channelId?: string;
    notifications: string[];
  };
  webhook?: {
    enabled: boolean;
    url?: string;
    events: string[];
    secret?: string;
  };
}

export class UserSettings {
  constructor(
    public readonly userId: string,
    public readonly profile: {
      fullName: string;
      jobTitle?: string;
      company?: string;
      avatarUrl?: string;
      bio?: string;
    },
    public readonly notifications: NotificationPreferences,
    public readonly language: LanguageSettings,
    public readonly security: SecuritySettings,
    public readonly integrations: IntegrationSettings,
    public readonly theme: 'light' | 'dark' | 'auto',
    public readonly updatedAt?: Date
  ) {}

  static createDefault(userId: string): UserSettings {
    return new UserSettings(
      userId,
      {
        fullName: '',
        jobTitle: undefined,
        company: undefined,
        avatarUrl: undefined,
        bio: undefined
      },
      {
        email: {
          projectUpdates: true,
          analysisComplete: true,
          weeklyDigest: true,
          securityAlerts: true,
          billingUpdates: true
        },
        push: {
          projectUpdates: true,
          analysisComplete: true,
          mentions: true,
          securityAlerts: true
        },
        inApp: {
          projectUpdates: true,
          analysisComplete: true,
          mentions: true,
          collaboratorJoined: true
        }
      },
      {
        interfaceLanguage: 'en',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: '1,234.56',
        currency: 'SGD',
        timezone: 'Asia/Singapore',
        codeMixingDetection: true
      },
      {
        twoFactorEnabled: false,
        sessionTimeout: 86400000, // 24 hours
        loginAlerts: true,
        deviceTrustEnabled: false
      },
      {},
      'auto'
    );
  }

  static fromJSON(json: any): UserSettings {
    return new UserSettings(
      json.user_id || json.userId,
      json.profile,
      json.notifications,
      json.language,
      json.security,
      json.integrations || {},
      json.theme || 'auto',
      json.updated_at ? new Date(json.updated_at) : undefined
    );
  }

  toJSON(): Record<string, any> {
    return {
      user_id: this.userId,
      profile: this.profile,
      notifications: this.notifications,
      language: this.language,
      security: this.security,
      integrations: this.integrations,
      theme: this.theme,
      updated_at: this.updatedAt?.toISOString()
    };
  }

  withProfile(profile: Partial<UserSettings['profile']>): UserSettings {
    return new UserSettings(
      this.userId,
      { ...this.profile, ...profile },
      this.notifications,
      this.language,
      this.security,
      this.integrations,
      this.theme,
      new Date()
    );
  }

  withNotifications(notifications: Partial<NotificationPreferences>): UserSettings {
    return new UserSettings(
      this.userId,
      this.profile,
      { ...this.notifications, ...notifications },
      this.language,
      this.security,
      this.integrations,
      this.theme,
      new Date()
    );
  }

  withLanguage(language: Partial<LanguageSettings>): UserSettings {
    return new UserSettings(
      this.userId,
      this.profile,
      this.notifications,
      { ...this.language, ...language },
      this.security,
      this.integrations,
      this.theme,
      new Date()
    );
  }

  withSecurity(security: Partial<SecuritySettings>): UserSettings {
    return new UserSettings(
      this.userId,
      this.profile,
      this.notifications,
      this.language,
      { ...this.security, ...security },
      this.integrations,
      this.theme,
      new Date()
    );
  }

  withIntegrations(integrations: Partial<IntegrationSettings>): UserSettings {
    return new UserSettings(
      this.userId,
      this.profile,
      this.notifications,
      this.language,
      this.security,
      { ...this.integrations, ...integrations },
      this.theme,
      new Date()
    );
  }

  withTheme(theme: 'light' | 'dark' | 'auto'): UserSettings {
    return new UserSettings(
      this.userId,
      this.profile,
      this.notifications,
      this.language,
      this.security,
      this.integrations,
      theme,
      new Date()
    );
  }
}
