/**
 * Controller Hook - SOLID: Adapter Pattern
 * Adapts MVC controllers for React component usage
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Services } from '../di/setup';

/**
 * Generic hook for using controllers in React components
 * SOLID: Open/Closed - Extended through generic types
 */
export function useController<TState, TController>(
  getController: () => TController & {
    getState: () => TState;
    subscribe: (listener: (state: TState) => void) => () => void;
  }
): TState {
  const controller = getController();
  const [state, setState] = useState<TState>(controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  return state;
}

/**
 * Hook for Auth Controller
 */
export function useAuth() {
  const controller = Services.auth;
  const state = useController(() => controller);

  const login = useCallback(
    async (email: string, password: string) => {
      return controller.login({ email, password });
    },
    [controller]
  );

  const logout = useCallback(async () => {
    return controller.logout();
  }, [controller]);

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      return controller.register({
        email,
        password,
        fullName
      });
    },
    [controller]
  );

  return {
    ...state,
    login,
    logout,
    register
  };
}

/**
 * Hook for Project Controller
 */
export function useProjects() {
  const controller = Services.projects;
  const state = useController(() => controller);
  const loadedRef = useRef(false);

  // Load projects on mount
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      controller.loadProjects();
    }
  }, [controller]);

  const createProject = useCallback(
    async (name: string, description?: string) => {
      return controller.createProject({
        name,
        description
      } as any);
    },
    [controller]
  );

  const updateProject = useCallback(
    async (id: string, data: any) => {
      return controller.updateProject(id, data);
    },
    [controller]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      return controller.deleteProject(id);
    },
    [controller]
  );

  const archiveProject = useCallback(
    async (id: string) => {
      return controller.archiveProject(id);
    },
    [controller]
  );

  const loadProject = useCallback(
    async (id: string) => {
      return controller.loadProject(id);
    },
    [controller]
  );

  const refresh = useCallback(async () => {
    return controller.loadProjects();
  }, [controller]);

  return {
    ...state,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    loadProject,
    refresh
  };
}

/**
 * Hook for using multiple controllers
 * SOLID: Interface Segregation - Components only use what they need
 */
export function useControllers<T extends Record<string, any>>(
  controllers: T
): { [K in keyof T]: ReturnType<T[K]> } {
  const result: any = {};

  for (const key in controllers) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    result[key] = useController(controllers[key]);
  }

  return result;
}