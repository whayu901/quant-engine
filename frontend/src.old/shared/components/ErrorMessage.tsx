// Reusable error message component
import React from 'react';
import { AlertCircle, XCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  error: Error | string | null;
  title?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  variant?: 'error' | 'warning';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  title = 'An error occurred',
  onRetry,
  fullScreen = false,
  variant = 'error',
  className = '',
}) => {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;
  const Icon = variant === 'error' ? XCircle : AlertCircle;

  const colorClasses = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const content = (
    <div className={`rounded-lg border p-4 ${colorClasses[variant]} ${className}`}>
      <div className="flex items-start">
        <Icon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="mt-1 text-sm opacity-90">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Empty state component
interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};