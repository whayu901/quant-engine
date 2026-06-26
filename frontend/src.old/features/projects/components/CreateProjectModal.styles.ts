// CreateProjectModal styles - separated from logic
export const styles = {
  modal: {
    overlay: 'fixed inset-0 z-50 overflow-y-auto',
    backdrop: 'fixed inset-0 bg-black bg-opacity-50 transition-opacity',
    container: 'flex min-h-full items-center justify-center p-4',
    dialog: 'relative bg-white rounded-lg max-w-md w-full shadow-xl',
  },

  header: {
    wrapper: 'flex items-center justify-between p-6 border-b',
    title: 'text-xl font-semibold text-gray-900',
    closeButton: 'p-1 rounded-lg hover:bg-gray-100',
    closeIcon: 'w-5 h-5 text-gray-400',
  },

  form: {
    content: 'p-6 space-y-4',

    field: {
      label: 'block text-sm font-medium text-gray-700 mb-1',
      input: {
        base: 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        normal: 'border-gray-300',
        error: 'border-red-300',
      },
      textarea: {
        base: 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        normal: 'border-gray-300',
        error: 'border-red-300',
      },
      placeholder: {
        name: 'Enter project name',
        description: 'Optional project description',
      },
      error: 'mt-1 text-sm text-red-600',
    },
  },

  footer: {
    wrapper: 'flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t rounded-b-lg',
    cancelButton: 'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    submitButton: {
      base: 'px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
      normal: 'bg-blue-600 hover:bg-blue-700',
      disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    },
    loadingWrapper: 'flex items-center',
    loadingSpinner: 'mr-2',
  },
};

// Helper function to get input style based on error state
export const getInputStyle = (hasError: boolean): string => {
  return `${styles.form.field.input.base} ${
    hasError ? styles.form.field.input.error : styles.form.field.input.normal
  }`;
};

// Helper function to get textarea style based on error state
export const getTextareaStyle = (hasError: boolean): string => {
  return `${styles.form.field.textarea.base} ${
    hasError ? styles.form.field.textarea.error : styles.form.field.textarea.normal
  }`;
};

// Helper function to get submit button style
export const getSubmitButtonStyle = (): string => {
  return `${styles.footer.submitButton.base} ${styles.footer.submitButton.normal} ${styles.footer.submitButton.disabled}`;
};