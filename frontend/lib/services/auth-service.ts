import { apiClient } from '../api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  RefreshTokenResponse,
  SocialAuthProvider,
  SocialAuthResponse,
  User,
} from '@/types/auth';

class AuthService {
  private readonly TOKEN_KEY = 'qe_token';
  private readonly REFRESH_TOKEN_KEY = 'qe_refresh_token';
  private readonly USER_KEY = 'qe_user';

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Backend expects form data with 'username' field for email
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await apiClient.post<any>('/auth/login', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Backend returns { access_token, token_type } format
    // We'll fetch user data separately
    const loginResponse: LoginResponse = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token || response.access_token,
      tokenType: response.token_type || 'bearer',
      user: {
        id: 'temp-id',
        email: credentials.email,
        name: '',
        role: 'researcher',
        accountType: 'retail',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };

    // Store tokens and user data
    this.setAuthData(loginResponse);

    return loginResponse;
  }

  /**
   * Register a new user (retail or enterprise)
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    // Backend currently only has one register endpoint
    const endpoint = '/auth/register';

    // Transform frontend data to backend format
    let requestData: any;

    if (data.accountType === 'retail') {
      requestData = {
        email: data.email,
        password: data.password,
        org_name: data.name || 'Personal'
      };
    } else {
      // For enterprise, use admin email and organization name
      requestData = {
        email: data.adminEmail,
        password: data.password,
        org_name: data.organizationName
      };
    }

    const response = await apiClient.post<any>(endpoint, requestData);

    // Backend returns { access_token } format
    const registerResponse: RegisterResponse = {
      accessToken: response.access_token,
      refreshToken: response.access_token, // Use same token for now
      tokenType: 'bearer',
      user: {
        id: 'new-user',
        email: data.accountType === 'retail' ? data.email : data.adminEmail,
        name: data.accountType === 'retail' ? data.name : data.adminName,
        role: 'admin', // New registrations are admin of their org
        accountType: data.accountType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message: 'Registration successful'
    };

    // Store tokens and user data
    this.setAuthData(registerResponse);

    return registerResponse;
  }

  /**
   * Social authentication (Google, Microsoft, GitHub)
   */
  async socialAuth(provider: SocialAuthProvider): Promise<SocialAuthResponse> {
    const response = await apiClient.post<SocialAuthResponse>(
      `/api/auth/social/${provider.provider}`,
      { accessToken: provider.accessToken }
    );

    // Store tokens and user data
    this.setAuthData(response);

    return response;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      await apiClient.post('/auth/logout', {
        refresh_token: refreshToken,
        all_devices: false
      });
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Request password reset email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const requestData = {
      token: data.token,
      new_password: data.password
    };
    return apiClient.post<ResetPasswordResponse>('/auth/reset-password', requestData);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return apiClient.post<VerifyEmailResponse>('/auth/verify-email', data);
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<any>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    // Update tokens
    this.setToken(response.access_token);
    if (response.refresh_token) {
      this.setRefreshToken(response.refresh_token);
    }

    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token || refreshToken,
      tokenType: response.token_type
    };
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const userData = await apiClient.get<any>('/auth/me');
    // Transform backend user data to frontend format
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      accountType: userData.customer_type || 'retail',
      organizationId: userData.org_id,
      organizationName: userData.org?.name,
      createdAt: userData.created_at || new Date().toISOString(),
      updatedAt: userData.updated_at || new Date().toISOString()
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get stored user
   */
  getUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Store authentication data
   */
  private setAuthData(data: LoginResponse | RegisterResponse | SocialAuthResponse): void {
    this.setToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);
    this.setUser(data.user);
  }

  /**
   * Set token in localStorage
   */
  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Set refresh token in localStorage
   */
  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Set user in localStorage
   */
  private setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

export const authService = new AuthService();
