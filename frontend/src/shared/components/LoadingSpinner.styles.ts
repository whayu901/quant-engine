// LoadingSpinner styles - separated from component
export const styles = {
  spinner: {
    base: 'animate-spin rounded-full border-blue-500',
    sizes: {
      sm: 'h-4 w-4 border',
      md: 'h-8 w-8 border-2',
      lg: 'h-16 w-16 border-2',
      xl: 'h-32 w-32 border-t-2 border-b-2',
    },
  },

  container: {
    fullScreen: 'flex flex-col items-center justify-center h-screen',
    inline: 'flex flex-col items-center justify-center p-8',
  },

  message: 'mt-4 text-gray-600 text-sm',

  overlay: {
    backdrop: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    card: 'bg-white rounded-lg p-6 shadow-xl',
  },
};

// Helper function to get spinner size class
export const getSpinnerSizeClass = (size: 'sm' | 'md' | 'lg' | 'xl'): string => {
  return `${styles.spinner.base} ${styles.spinner.sizes[size]}`;
};

// Helper function to get container class
export const getContainerClass = (fullScreen: boolean): string => {
  return fullScreen ? styles.container.fullScreen : styles.container.inline;
};