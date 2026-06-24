// LoadingSpinner component - View only, styles separated
import React from 'react';
import {
  styles,
  getSpinnerSizeClass,
  getContainerClass,
} from './LoadingSpinner.styles';

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
  const spinner = (
    <div
      className={`${getSpinnerSizeClass(size)} ${className}`}
      style={{ borderTopColor: 'transparent' }}
    />
  );

  return (
    <div className={getContainerClass(fullScreen)}>
      {spinner}
      {message && (
        <p className={styles.message}>{message}</p>
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
    <div className={styles.overlay.backdrop}>
      <div className={styles.overlay.card}>
        <LoadingSpinner size="md" message={message} />
      </div>
    </div>
  );
};