import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private processQueue(error: Error | null, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private setupInterceptors(): void {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('qe_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          if (typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('qe_refresh_token');

            if (!refreshToken) {
              // No refresh token available, redirect to login
              this.clearAuthAndRedirect();
              return Promise.reject(error);
            }

            try {
              // Try to refresh the token
              const response = await axios.post(
                `${this.client.defaults.baseURL}/auth/refresh`,
                { refresh_token: refreshToken }
              );

              const { access_token: accessToken, refresh_token: newRefreshToken } = response.data;

              // Update tokens in localStorage
              localStorage.setItem('qe_token', accessToken);
              if (newRefreshToken) {
                localStorage.setItem('qe_refresh_token', newRefreshToken);
              }

              // Update the authorization header
              this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;

              // Process queued requests
              this.processQueue(null, accessToken);

              // Retry the original request
              return this.client(originalRequest);
            } catch (refreshError) {
              // Refresh failed, clear auth and redirect
              this.processQueue(refreshError as Error, null);
              this.clearAuthAndRedirect();
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          }
        }

        // Extract error message
        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          'An unexpected error occurred';

        return Promise.reject(new Error(message));
      }
    );
  }

  private clearAuthAndRedirect(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('qe_token');
      localStorage.removeItem('qe_refresh_token');
      localStorage.removeItem('qe_user');
      window.location.href = '/login';
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
