import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthResponse, User, LoginRequest, RegisterRequest } from '../../types/api';
import api from '../../lib/api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<AuthResponse>('/auth/login', credentials);
          const { user, access_token, refresh_token } = response.data;

          // Store tokens
          localStorage.setItem('access_token', access_token);
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
          }

          set({
            user,
            token: access_token,
            refreshToken: refresh_token || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set default auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Login failed. Please try again.',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<AuthResponse>('/auth/register', data);
          const { user, access_token, refresh_token } = response.data;

          // Store tokens
          localStorage.setItem('access_token', access_token);
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
          }

          set({
            user,
            token: access_token,
            refreshToken: refresh_token || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Set default auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Registration failed. Please try again.',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Clear tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        // Clear auth header
        delete api.defaults.headers.common['Authorization'];

        // Reset state
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });

        // Redirect to login
        window.location.href = '/login';
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          get().logout();
          return false;
        }

        try {
          const response = await api.post<AuthResponse>('/auth/refresh', {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;

          // Update tokens
          localStorage.setItem('access_token', access_token);
          if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
          }

          set({
            token: access_token,
            refreshToken: refresh_token || get().refreshToken,
          });

          // Update auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          // Set auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Verify token by fetching user
          const response = await api.get<User>('/auth/me');

          set({
            user: response.data,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token is invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete api.defaults.headers.common['Authorization'];

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;