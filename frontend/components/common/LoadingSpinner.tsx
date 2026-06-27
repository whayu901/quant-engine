'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  message,
  fullScreen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-blue-600 border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );

  const containerClasses = fullScreen
    ? 'flex flex-col items-center justify-center min-h-screen'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      {spinner}
      {message && (
        <p className="mt-4 text-sm text-gray-600 font-medium">{message}</p>
      )}
    </div>
  );
};

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <LoadingSpinner size="md" message={message} />
      </div>
    </div>
  );
};
