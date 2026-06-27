// Global type definitions for the application
// Re-export from specific type modules for convenience

export * from './auth';
export * from './api';
export * from './collaboration';

// Legacy types - kept for backward compatibility
export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}
