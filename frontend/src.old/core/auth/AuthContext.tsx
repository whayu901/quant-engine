// New unified AuthContext using React Query hooks
// This replaces the duplicate implementations in contexts/AuthContext.jsx
import React, { createContext, useContext } from 'react';
import { useAuth, useLogin, useLogout, usePermissions } from './auth.hooks';
import type { User, LoginCredentials } from './auth.service';

interface AuthContextValue {
  // User state
  user: User | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;

  // Permissions
  permissions: {
    canManageUsers: boolean;
    canManageProjects: boolean;
    canViewAnalytics: boolean;
    canAccessAdmin: boolean;
    canAccessOrgAdmin: boolean;
    canAccessResearch: boolean;
    canAccessClient: boolean;
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isAuthenticated, isLoading, token } = useAuth();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const permissions = usePermissions();

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    permissions,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallback = <div>Unauthorized</div>
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <>{fallback}</>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}