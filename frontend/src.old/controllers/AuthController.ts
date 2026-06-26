/**
 * Auth Controller - SOLID: Single Responsibility & Dependency Inversion
 * Orchestrates authentication business logic
 */

import { IAuthService, ILoginCredentials, IRegisterData } from '../interfaces/IAuthService';
import { User } from '../models/entities/User';
import { EventEmitter } from '../utils/EventEmitter';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface IAuthController {
  getState(): AuthState;
  login(credentials: ILoginCredentials): Promise<void>;
  register(data: IRegisterData): Promise<void>;
  logout(): Promise<void>;
  refreshAuth(): Promise<void>;
  subscribe(listener: (state: AuthState) => void): () => void;
}

/**
 * Auth Controller Implementation
 * SOLID: Open/Closed - Extended through dependency injection, not modification
 */
export class AuthController implements IAuthController {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  private eventEmitter = new EventEmitter<AuthState>();

  constructor(private authService: IAuthService) {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    this.updateState({ isLoading: true });

    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        this.updateState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        this.updateState({ isLoading: false });
      }
    } catch (error) {
      this.updateState({ isLoading: false });
    }
  }

  getState(): AuthState {
    return { ...this.state };
  }

  async login(credentials: ILoginCredentials): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Validate inputs
      this.validateLoginCredentials(credentials);

      // Perform login
      await this.authService.login(credentials);

      // Get user data
      const user = await this.authService.getCurrentUser();

      if (!user) {
        throw new Error('Failed to get user data after login');
      }

      this.updateState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Emit success event
      this.eventEmitter.emit('login_success', this.state);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Login failed'
      });
      throw error;
    }
  }

  async register(data: IRegisterData): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Validate inputs
      this.validateRegisterData(data);

      // Perform registration
      await this.authService.register(data);

      // Get user data
      const user = await this.authService.getCurrentUser();

      if (!user) {
        throw new Error('Failed to get user data after registration');
      }

      this.updateState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Emit success event
      this.eventEmitter.emit('register_success', this.state);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Registration failed'
      });
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.updateState({ isLoading: true });

    try {
      await this.authService.logout();

      this.updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });

      // Emit logout event
      this.eventEmitter.emit('logout', this.state);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Logout failed'
      });
    }
  }

  async refreshAuth(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();

      if (user) {
        this.updateState({
          user,
          isAuthenticated: true,
          error: null
        });
      } else {
        this.updateState({
          user: null,
          isAuthenticated: false
        });
      }
    } catch (error: any) {
      this.updateState({
        user: null,
        isAuthenticated: false,
        error: error.message
      });
    }
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    // Call listener immediately with current state
    listener(this.state);

    // Subscribe to future updates
    return this.eventEmitter.on('state_change', listener);
  }

  private updateState(partial: Partial<AuthState>): void {
    this.state = { ...this.state, ...partial };
    this.eventEmitter.emit('state_change', this.state);
  }

  private validateLoginCredentials(credentials: ILoginCredentials): void {
    if (!credentials.email || !credentials.email.includes('@')) {
      throw new Error('Invalid email address');
    }

    if (!credentials.password || credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }

  private validateRegisterData(data: IRegisterData): void {
    if (!data.email || !data.email.includes('@')) {
      throw new Error('Invalid email address');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!data.fullName || data.fullName.trim().length < 2) {
      throw new Error('Full name is required');
    }
  }
}