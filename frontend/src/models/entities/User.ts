/**
 * User Entity - SOLID: Single Responsibility Principle
 * Only represents user data structure
 */

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullName: string,
    public readonly avatarUrl?: string,
    public readonly company?: string,
    public readonly role?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly lastLoginAt?: Date,
    public readonly isEmailVerified?: boolean,
    public readonly preferences?: UserPreferences
  ) {}

  get firstName(): string {
    return this.fullName.split(' ')[0];
  }

  get initials(): string {
    return this.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  hasRole(role: string): boolean {
    return this.role === role;
  }

  static fromJSON(json: any): User {
    return new User(
      json.id,
      json.email,
      json.full_name || json.fullName,
      json.avatar_url || json.avatarUrl,
      json.company,
      json.role,
      json.created_at ? new Date(json.created_at) : undefined,
      json.updated_at ? new Date(json.updated_at) : undefined,
      json.last_login_at ? new Date(json.last_login_at) : undefined,
      json.is_email_verified || json.isEmailVerified,
      json.preferences
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      full_name: this.fullName,
      avatar_url: this.avatarUrl,
      company: this.company,
      role: this.role,
      created_at: this.createdAt?.toISOString(),
      updated_at: this.updatedAt?.toISOString(),
      last_login_at: this.lastLoginAt?.toISOString(),
      is_email_verified: this.isEmailVerified,
      preferences: this.preferences
    };
  }
}

export interface UserPreferences {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}