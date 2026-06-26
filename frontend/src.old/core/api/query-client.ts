// React Query configuration and query client setup
import { QueryClient } from '@tanstack/react-query';

// Create query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: data considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Cache time: data stays in cache for 10 minutes after becoming inactive
      cacheTime: 10 * 60 * 1000,

      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,

      // Don't refetch on reconnect (too aggressive)
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once
      retry: 1,

      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query key factory for consistent key generation
export const queryKeys = {
  all: ['qual-engine'] as const,

  auth: {
    all: () => [...queryKeys.all, 'auth'] as const,
    user: () => [...queryKeys.auth.all(), 'user'] as const,
    session: () => [...queryKeys.auth.all(), 'session'] as const,
  },

  projects: {
    all: () => [...queryKeys.all, 'projects'] as const,
    lists: () => [...queryKeys.projects.all(), 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.projects.lists(), { filters }] as const,
    details: () => [...queryKeys.projects.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    transcripts: (projectId: string) =>
      [...queryKeys.projects.detail(projectId), 'transcripts'] as const,
  },

  analysis: {
    all: () => [...queryKeys.all, 'analysis'] as const,
    project: (projectId: string) =>
      [...queryKeys.analysis.all(), 'project', projectId] as const,
    codes: (projectId: string) =>
      [...queryKeys.analysis.project(projectId), 'codes'] as const,
    themes: (projectId: string) =>
      [...queryKeys.analysis.project(projectId), 'themes'] as const,
    evidence: (projectId: string) =>
      [...queryKeys.analysis.project(projectId), 'evidence'] as const,
  },

  clips: {
    all: () => [...queryKeys.all, 'clips'] as const,
    project: (projectId: string) =>
      [...queryKeys.clips.all(), 'project', projectId] as const,
    detail: (clipId: string) =>
      [...queryKeys.clips.all(), 'detail', clipId] as const,
  },

  reels: {
    all: () => [...queryKeys.all, 'reels'] as const,
    project: (projectId: string) =>
      [...queryKeys.reels.all(), 'project', projectId] as const,
    detail: (reelId: string) =>
      [...queryKeys.reels.all(), 'detail', reelId] as const,
  },

  admin: {
    all: () => [...queryKeys.all, 'admin'] as const,
    users: {
      all: () => [...queryKeys.admin.all(), 'users'] as const,
      list: (orgId?: string) =>
        [...queryKeys.admin.users.all(), { orgId }] as const,
      detail: (userId: string) =>
        [...queryKeys.admin.users.all(), userId] as const,
    },
    orgs: {
      all: () => [...queryKeys.admin.all(), 'orgs'] as const,
      list: () => [...queryKeys.admin.orgs.all(), 'list'] as const,
      detail: (orgId: string) =>
        [...queryKeys.admin.orgs.all(), orgId] as const,
    },
    stats: () => [...queryKeys.admin.all(), 'stats'] as const,
  },
};

// Type-safe mutation key factory
export const mutationKeys = {
  auth: {
    login: () => ['auth', 'login'] as const,
    logout: () => ['auth', 'logout'] as const,
    register: () => ['auth', 'register'] as const,
  },

  projects: {
    create: () => ['projects', 'create'] as const,
    update: (id: string) => ['projects', 'update', id] as const,
    delete: (id: string) => ['projects', 'delete', id] as const,
    uploadTranscript: (id: string) => ['projects', 'upload', id] as const,
  },

  analysis: {
    create: (projectId: string) => ['analysis', 'create', projectId] as const,
    updateCodes: (projectId: string) => ['analysis', 'codes', projectId] as const,
    updateThemes: (projectId: string) => ['analysis', 'themes', projectId] as const,
  },

  clips: {
    create: (projectId: string) => ['clips', 'create', projectId] as const,
    update: (clipId: string) => ['clips', 'update', clipId] as const,
    delete: (clipId: string) => ['clips', 'delete', clipId] as const,
  },

  reels: {
    create: (projectId: string) => ['reels', 'create', projectId] as const,
    update: (reelId: string) => ['reels', 'update', reelId] as const,
    delete: (reelId: string) => ['reels', 'delete', reelId] as const,
    addItem: (reelId: string) => ['reels', 'addItem', reelId] as const,
  },
};