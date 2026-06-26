// ProjectList styles - separated from logic
export const styles = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',

  header: {
    wrapper: 'mb-8',
    title: 'text-3xl font-bold text-gray-900',
    subtitle: 'mt-2 text-sm text-gray-600',
  },

  actionsBar: {
    wrapper: 'mb-6 flex flex-col sm:flex-row gap-4',
    searchForm: 'flex-1',
    searchContainer: 'relative',
    searchIcon: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5',
    searchInput: 'pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    filterGroup: 'flex gap-2',
    filterButton: {
      base: 'px-4 py-2 rounded-lg transition-colors',
      active: 'bg-blue-600 text-white',
      inactive: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    },
    createButton: 'inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    createButtonIcon: 'w-5 h-5 mr-2',
  },

  projectsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
};

// Helper function to get filter button style
export const getFilterButtonStyle = (isActive: boolean): string => {
  return `${styles.actionsBar.filterButton.base} ${
    isActive
      ? styles.actionsBar.filterButton.active
      : styles.actionsBar.filterButton.inactive
  }`;
};