/**
 * Authentication Service Interface - SOLID: Dependency Inversion Principle
 * High-level modules depend on abstractions
 */

import { User } from '../models/entities/User';

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterData {
  email: string;
  password: string;
  fullName: string;
  company?: string;
  role?: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IAuthService {
  login(credentials: ILoginCredentials): Promise<IAuthTokens>;
  register(data: IRegisterData): Promise<IAuthTokens>;
  logout(): Promise<void>;
  refreshToken(token: string): Promise<IAuthTokens>;
  getCurrentUser(): Promise<User | null>;
  validateToken(token: string): Promise<boolean>;
  resetPassword(email: string): Promise<void>;
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
}

export interface IAuthStateListener {
  onAuthStateChanged(user: User | null): void;
}

export interface IAuthStorage {
  saveTokens(tokens: IAuthTokens): void;
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  clearTokens(): void;
}