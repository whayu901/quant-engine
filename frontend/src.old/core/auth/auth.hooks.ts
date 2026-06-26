// Authentication hooks using React Query (MVVM ViewModel layer)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginCredentials, type User } from './auth.service';
import { queryKeys } from '../api/query-client';

// Hook for authentication state
export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const token = authService.getStoredToken();
      if (!token) return null;

      try {
        return await authService.getCurrentUser();
      } catch (error) {
        // Token is invalid, clear session
        authService.clearSession();
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes
    retry: false, // Don't retry auth checks
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    token: authService.getStoredToken(),
  };
}

// Hook for login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: ({ user }) => {
      // Update the user in the cache
      queryClient.setQueryData(queryKeys.auth.user(), user);

      // Navigate based on role
      const roleRoutes: Record<string, string> = {
        admin: '/admin/dashboard',
        org_admin: '/org/dashboard',
        researcher: '/research/projects',
        freelance_researcher: '/research/projects',
        client_user: '/client/dashboard',
      };

      const route = roleRoutes[user.role] || '/';
      navigate(route);
    },
    onError: (error) => {
      // Clear any cached auth data on error
      queryClient.removeQueries({ queryKey: queryKeys.auth.all() });
      authService.clearSession();
    },
  });
}

// Hook for logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      navigate('/login');
    },
    onSettled: () => {
      // Always clear session even if server logout fails
      authService.clearSession();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all() });
    },
  });
}

// Hook for checking permissions
export function usePermissions() {
  const { user } = useAuth();

  return {
    canManageUsers: user ? ['admin', 'org_admin'].includes(user.role) : false,
    canManageProjects: user ? ['admin', 'org_admin', 'researcher'].includes(user.role) : false,
    canViewAnalytics: user ? ['admin', 'org_admin'].includes(user.role) : false,
    canAccessAdmin: user?.role === 'admin',
    canAccessOrgAdmin: user?.role === 'org_admin',
    canAccessResearch: user ? ['researcher', 'freelance_researcher'].includes(user.role) : false,
    canAccessClient: user?.role === 'client_user',
  };
}

// Hook for protected routes
export function useRequireAuth(allowedRoles?: User['role'][]) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Check authentication
  if (!isLoading && !isAuthenticated) {
    navigate('/login');
    return { authorized: false, loading: isLoading };
  }

  // Check role-based access
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    navigate('/unauthorized');
    return { authorized: false, loading: isLoading };
  }

  return { authorized: isAuthenticated, loading: isLoading };
}