// Unified authentication service following SOLID principles
import { apiClient } from '../api/client';
import type { ApiClient } from '../api/client';

// Types for authentication
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'org_admin' | 'researcher' | 'freelance_researcher' | 'client_user';
  org_id?: string;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Authentication service interface (dependency inversion)
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  getStoredToken(): string | null;
  getStoredUser(): User | null;
  clearSession(): void;
}

// Concrete implementation
export class AuthService implements IAuthService {
  private readonly TOKEN_KEY = 'qe_token';  // Single token key (not qe_auth_token)
  private readonly USER_KEY = 'qe_user';

  constructor(private api: ApiClient) {}

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // Step 1: Login to get token
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const loginResponse = await this.api.post<LoginResponse>(
      '/auth/login',
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const token = loginResponse.access_token;

    // Step 2: Store token immediately
    this.storeToken(token);

    // Step 3: Get user data with the new token
    const user = await this.getCurrentUser();

    // Step 4: Store user data
    this.storeUser(user);

    return { user, token };
  }

  async logout(): Promise<void> {
    try {
      // Attempt server-side logout
      await this.api.post('/auth/logout');
    } catch (error) {
      // Silent fail - always clear local session
      console.warn('Server logout failed:', error);
    } finally {
      this.clearSession();
    }
  }

  async getCurrentUser(): Promise<User> {
    return await this.api.get<User>('/auth/me');
  }

  getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}

// Create default auth service instance
export const authService = new AuthService(apiClient);

// Role-based permission checking utilities
export const permissions = {
  canManageUsers: (role?: string): boolean => {
    return role === 'admin' || role === 'org_admin';
  },

  canManageProjects: (role?: string): boolean => {
    return ['admin', 'org_admin', 'researcher'].includes(role || '');
  },

  canViewAnalytics: (role?: string): boolean => {
    return ['admin', 'org_admin'].includes(role || '');
  },

  canAccessAdmin: (role?: string): boolean => {
    return role === 'admin';
  },

  canAccessOrgAdmin: (role?: string): boolean => {
    return role === 'org_admin';
  },

  canAccessResearch: (role?: string): boolean => {
    return ['researcher', 'freelance_researcher'].includes(role || '');
  },

  canAccessClient: (role?: string): boolean => {
    return role === 'client_user';
  },
};