/**
 * Auth Repository - SOLID: Single Responsibility & Dependency Inversion
 * Handles authentication data access only
 */

import { IAuthService, ILoginCredentials, IRegisterData, IAuthTokens, IAuthStorage } from '../../interfaces/IAuthService';
import { User } from '../entities/User';
import api from '../../lib/api/client';

export class AuthRepository implements IAuthService {
  constructor(private storage: IAuthStorage) {}

  async login(credentials: ILoginCredentials): Promise<IAuthTokens> {
    try {
      const response = await api.post('/auth/login', credentials);
      const tokens: IAuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in || 3600
      };

      this.storage.saveTokens(tokens);
      return tokens;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  async register(data: IRegisterData): Promise<IAuthTokens> {
    try {
      const response = await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        company: data.company,
        role: data.role
      });

      const tokens: IAuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in || 3600
      };

      this.storage.saveTokens(tokens);
      return tokens;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      this.storage.clearTokens();
    }
  }

  async refreshToken(token: string): Promise<IAuthTokens> {
    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: token
      });

      const tokens: IAuthTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresIn: response.expires_in || 3600
      };

      this.storage.saveTokens(tokens);
      return tokens;
    } catch (error: any) {
      this.storage.clearTokens();
      throw new Error('Token refresh failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.storage.getAccessToken();
      if (!token) return null;

      const response = await api.get('/auth/me');
      return User.fromJSON(response);
    } catch (error) {
      return null;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await api.post('/auth/validate', { token });
      return true;
    } catch {
      return false;
    }
  }

  async resetPassword(email: string): Promise<void> {
    await api.post('/auth/reset-password', { email });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword
    });
  }
}

/**
 * Local Storage Implementation - SOLID: Single Responsibility
 */
export class LocalAuthStorage implements IAuthStorage {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly EXPIRES_AT_KEY = 'expires_at';

  saveTokens(tokens: IAuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expiresIn);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toISOString());
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    if (!expiresAt) return true;

    return new Date(expiresAt) <= new Date();
  }
}