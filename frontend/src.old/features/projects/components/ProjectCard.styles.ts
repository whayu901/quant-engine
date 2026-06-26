// ProjectCard styles - separated from logic
export const styles = {
  card: 'bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow',
  cardContent: 'p-6',

  header: {
    wrapper: 'flex items-start justify-between mb-4',
    titleLink: 'flex-1',
    title: 'text-lg font-semibold text-gray-900 hover:text-blue-600',
  },

  menu: {
    button: 'p-1 rounded hover:bg-gray-100',
    icon: 'w-5 h-5 text-gray-400',
    backdrop: 'fixed inset-0 z-10',
    dropdown: 'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200',
    item: {
      base: 'flex items-center px-4 py-2 text-sm',
      edit: 'text-gray-700 hover:bg-gray-100',
      delete: 'w-full text-red-600 hover:bg-red-50',
    },
    itemIcon: 'w-4 h-4 mr-2',
  },

  status: {
    wrapper: 'mb-3',
    badge: {
      base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-800',
    },
  },

  description: 'text-sm text-gray-600 mb-4 line-clamp-2',

  stats: {
    grid: 'grid grid-cols-2 gap-4 mb-4',
    item: 'flex items-center text-sm text-gray-500',
    icon: 'w-4 h-4 mr-1',
  },

  viewButton: 'block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors',
};

// Helper function to get status badge style
export const getStatusBadgeStyle = (status: 'active' | 'completed' | 'archived'): string => {
  const statusStyles = {
    active: styles.status.badge.active,
    completed: styles.status.badge.completed,
    archived: styles.status.badge.archived,
  };

  return `${styles.status.badge.base} ${statusStyles[status]}`;
};