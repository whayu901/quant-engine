// ClientDashboard styles - separated from view
export const dashboardStyles = {
  container: 'min-h-screen bg-gray-50',

  header: {
    wrapper: 'bg-white shadow-sm border-b',
    content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    innerContent: 'py-6 flex justify-between items-center',
    title: 'text-3xl font-bold text-gray-900',
    subtitle: 'mt-2 text-sm text-gray-600',
    controls: 'flex space-x-3',
  },

  select: 'px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
  exportButton:
    'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2',

  main: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',

  metricsGrid: 'grid grid-cols-1 md:grid-cols-4 gap-6 mb-8',

  tabs: {
    wrapper: 'bg-white rounded-lg shadow mb-8',
    header: 'border-b',
    buttonContainer: 'flex space-x-8 px-6',
    button: (isActive: boolean) =>
      `py-4 px-1 border-b-2 font-medium text-sm capitalize ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`,
    content: 'p-6',
  },

  charts: {
    section: 'space-y-8',
    title: 'text-lg font-semibold mb-4',
    grid: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  },

  sentimentMetrics: {
    container: 'space-y-6',
    item: 'flex justify-between mb-2',
    label: 'font-medium',
    value: 'text-gray-600',
    progressBar: 'w-full bg-gray-200 rounded-full h-2.5',
    progressFill: (sentiment: string) => {
      const colorMap: Record<string, string> = {
        Positive: 'bg-green-500',
        Neutral: 'bg-yellow-500',
        Negative: 'bg-red-500',
      };
      return `h-2.5 rounded-full ${colorMap[sentiment] || 'bg-gray-500'}`;
    },
    percentage: 'text-sm text-gray-500 mt-1',
  },

  dataTable: {
    wrapper: 'border rounded-lg overflow-hidden',
    header: 'flex bg-gray-100 border-b font-semibold',
    headerCell: 'flex-1 px-4 py-2',
    info: 'text-sm text-gray-600 mb-2',
  },

  insights: {
    wrapper: 'bg-white rounded-lg shadow p-6',
    title: 'text-lg font-semibold mb-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    card: (borderColor: string) => `border-l-4 ${borderColor} pl-4`,
    cardTitle: 'font-medium text-gray-900',
    cardText: 'text-sm text-gray-600 mt-1',
  },
} as const;

// Chart colors
export const chartColors = {
  priceSensitivity: '#ef4444',
  quality: '#3b82f6',
  brandTrust: '#10b981',
  userExperience: '#f59e0b',
  innovation: '#8b5cf6',
  satisfaction: '#3b82f6',
  nps: '#10b981',
  retention: '#f59e0b',
  growth: '#8b5cf6',
  appeal: '#3b82f6',
  uniqueness: '#10b981',
  believability: '#f59e0b',
  purchaseIntent: '#ef4444',
  positive: '#10b981',
  neutral: '#f59e0b',
  negative: '#ef4444',
  target: '#ef4444',
} as const;

// Market options
export const marketOptions = [
  { value: 'all', label: 'All Markets' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'TH', label: 'Thailand' },
  { value: 'PH', label: 'Philippines' },
] as const;

// Date range options
export const dateRangeOptions = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
  { value: '1year', label: 'Last Year' },
] as const;

// Tab options
export const tabOptions = [
  'overview',
  'themes',
  'sentiment',
  'concepts',
  'data',
] as const;

// Table columns
export const tableColumns = [
  { key: 'id', label: 'ID' },
  { key: 'respondent', label: 'Respondent' },
  { key: 'market', label: 'Market' },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'score', label: 'Score' },
  { key: 'date', label: 'Date' },
] as const;

// Insights data (mock for demo)
export const insightsData = [
  {
    title: 'Price Sensitivity Trend',
    text: 'Price sensitivity has increased by 15% in the Indonesian market over the past month, suggesting a need for value-focused positioning.',
    borderColor: 'border-blue-500',
  },
  {
    title: 'Quality Perception',
    text: 'Quality perception scores highest in Singapore (4.6/5) while showing improvement potential in Philippines (3.8/5).',
    borderColor: 'border-green-500',
  },
  {
    title: 'Concept C Leading',
    text: 'Concept C shows the highest purchase intent at 85%, driven by strong appeal and believability scores.',
    borderColor: 'border-purple-500',
  },
  {
    title: 'User Experience Focus',
    text: 'User experience mentions have grown 22% week-over-week, indicating increasing importance in purchase decisions.',
    borderColor: 'border-orange-500',
  },
] as const;
