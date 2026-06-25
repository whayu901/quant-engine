/**
 * APIKey Entity - SOLID: Single Responsibility Principle
 * Only represents API key data structure
 */

export type APIKeyStatus = 'active' | 'limited' | 'expired' | 'revoked';

export class APIKey {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly key: string,
    public readonly prefix: string,
    public readonly status: APIKeyStatus,
    public readonly permissions: string[],
    public readonly rateLimit?: {
      requests: number;
      period: string;
    },
    public readonly createdAt: Date,
    public readonly lastUsedAt?: Date,
    public readonly expiresAt?: Date,
    public readonly userId: string
  ) {}

  get isActive(): boolean {
    return this.status === 'active';
  }

  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return this.expiresAt < new Date();
  }

  get maskedKey(): string {
    return `${this.prefix}...${this.key.slice(-8)}`;
  }

  get daysUntilExpiry(): number | null {
    if (!this.expiresAt) return null;
    const diff = this.expiresAt.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission) || this.permissions.includes('*');
  }

  static fromJSON(json: any): APIKey {
    return new APIKey(
      json.id,
      json.name,
      json.key,
      json.prefix,
      json.status,
      json.permissions || [],
      json.rate_limit ? {
        requests: json.rate_limit.requests,
        period: json.rate_limit.period
      } : undefined,
      new Date(json.created_at),
      json.last_used_at ? new Date(json.last_used_at) : undefined,
      json.expires_at ? new Date(json.expires_at) : undefined,
      json.user_id || json.userId
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      key: this.key,
      prefix: this.prefix,
      status: this.status,
      permissions: this.permissions,
      rate_limit: this.rateLimit,
      created_at: this.createdAt.toISOString(),
      last_used_at: this.lastUsedAt?.toISOString(),
      expires_at: this.expiresAt?.toISOString(),
      user_id: this.userId
    };
  }
}
