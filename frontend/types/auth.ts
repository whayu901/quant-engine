export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'researcher' | 'client';
  accountType: 'retail' | 'enterprise';
  organizationId?: string;
  organizationName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface RegisterRetailRequest {
  accountType: 'retail';
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface RegisterEnterpriseRequest {
  accountType: 'enterprise';
  organizationName: string;
  industry: string;
  companySize: string;
  adminName: string;
  adminEmail: string;
  password: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export type RegisterRequest = RegisterRetailRequest | RegisterEnterpriseRequest;

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface SocialAuthProvider {
  provider: 'google' | 'microsoft' | 'github';
  accessToken: string;
}

export interface SocialAuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}
