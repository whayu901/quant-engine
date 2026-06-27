import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import type { User } from '@/types/auth';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

export function useAuth(requireAuth = false): UseAuthReturn {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [requireAuth, isLoading, isAuthenticated, router]);

  const logout = async () => {
    await dispatch(logoutUser()).unwrap();
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
  };
}

export function useRequireAuth(): UseAuthReturn {
  return useAuth(true);
}
