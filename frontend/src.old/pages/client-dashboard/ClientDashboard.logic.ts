// ClientDashboard business logic - separated from view
import { useState, useMemo, useCallback } from 'react';
import { useDashboardData, useExportDashboard } from './hooks/useDashboard';
import type { TabType, DashboardData } from './types';

// Mock data generator (will be replaced with real API data)
function generateMockData(): DashboardData {
  const markets = [
    'Indonesia',
    'Singapore',
    'Malaysia',
    'Thailand',
    'Philippines',
  ];
  const sentiments = ['Positive', 'Neutral', 'Negative'] as const;

  // Theme performance over time
  const themeData = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    themeData.push({
      date: date.toISOString().split('T')[0],
      'Price Sensitivity': Math.floor(Math.random() * 100) + 300,
      Quality: Math.floor(Math.random() * 80) + 250,
      'Brand Trust': Math.floor(Math.random() * 70) + 200,
      'User Experience': Math.floor(Math.random() * 90) + 180,
      Innovation: Math.floor(Math.random() * 60) + 150,
    });
  }

  // Market comparison
  const marketData = markets.map((market) => ({
    market,
    satisfaction: Math.random() * 40 + 60,
    nps: Math.random() * 60 + 20,
    retention: Math.random() * 30 + 70,
    growth: Math.random() * 20 + 5,
  }));

  // Sentiment distribution
  const sentimentData = sentiments.map((sentiment) => ({
    name: sentiment,
    value: Math.floor(Math.random() * 1000) + 500,
    percentage: 0,
  }));
  const total = sentimentData.reduce((acc, curr) => acc + curr.value, 0);
  sentimentData.forEach((item) => {
    item.percentage = parseFloat(((item.value / total) * 100).toFixed(1));
  });

  // Concept test results
  const conceptData = [
    {
      concept: 'Concept A',
      appeal: 85,
      uniqueness: 78,
      believability: 82,
      purchase_intent: 75,
    },
    {
      concept: 'Concept B',
      appeal: 72,
      uniqueness: 88,
      believability: 70,
      purchase_intent: 68,
    },
    {
      concept: 'Concept C',
      appeal: 90,
      uniqueness: 65,
      believability: 88,
      purchase_intent: 85,
    },
    {
      concept: 'Concept D',
      appeal: 68,
      uniqueness: 92,
      believability: 65,
      purchase_intent: 60,
    },
  ];

  // Generate response records
  const responses = [];
  for (let i = 0; i < 100; i++) {
    responses.push({
      id: `R${i + 1}`,
      respondent: `User${Math.floor(Math.random() * 10000)}`,
      market: markets[Math.floor(Math.random() * markets.length)],
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      score: (Math.random() * 5).toFixed(2),
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    });
  }

  return { themeData, marketData, sentimentData, conceptData, responses };
}

export function useClientDashboardLogic() {
  // State
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // API calls (commented out until backend is ready)
  // const { data: dashboardData, isLoading, error } = useDashboardData({
  //   selectedMarket,
  //   dateRange,
  // });

  // Export mutation
  const exportMutation = useExportDashboard();

  // Mock data (replace with dashboardData when API is ready)
  const mockData = useMemo(() => generateMockData(), []);

  // Handlers
  const handleMarketChange = useCallback((market: string) => {
    setSelectedMarket(market);
  }, []);

  const handleDateRangeChange = useCallback((range: string) => {
    setDateRange(range);
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleExport = useCallback(() => {
    // When API is ready:
    // exportMutation.mutate({ selectedMarket, dateRange });

    // For now, show alert
    alert(
      'Exporting data... This would generate a downloadable file with all filtered data.',
    );
  }, [selectedMarket, dateRange]);

  // For now, use mock data. When API is ready, use:
  // return {
  //   data: dashboardData,
  //   isLoading,
  //   error,
  //   ...other state and handlers
  // };

  return {
    // Data
    data: mockData,
    isLoading: false,
    error: null,

    // Filters
    selectedMarket,
    dateRange,
    activeTab,

    // Handlers
    handleMarketChange,
    handleDateRangeChange,
    handleTabChange,
    handleExport,
  };
}
