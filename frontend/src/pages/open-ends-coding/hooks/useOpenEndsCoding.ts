// Custom hook for OpenEndsCoding logic
import { useState, useEffect, useCallback, useMemo } from 'react';
import { generateMockResponses, getMockCodes } from '../services/mock.service';
import type { Response, Code, AIProgress, FilterState, CodeDistribution, MarketDistribution } from '../types';

export function useOpenEndsCoding() {
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Response[]>([]);
  const [codes, setCodes] = useState<Code[]>([]);
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [aiProgress, setAiProgress] = useState<AIProgress | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    filterMarket: 'all',
    filterCode: 'all',
  });

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const mockResponses = generateMockResponses();
        const mockCodes = getMockCodes();

        setResponses(mockResponses);
        setCodes(mockCodes);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Filter responses based on search and filters
  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      const matchesSearch =
        filters.searchTerm === '' ||
        r.text.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesMarket =
        filters.filterMarket === 'all' || r.market === filters.filterMarket;
      const matchesCode =
        filters.filterCode === 'all' ||
        r.codes.some((c) => c.label === filters.filterCode);
      return matchesSearch && matchesMarket && matchesCode;
    });
  }, [responses, filters]);

  // Calculate code distribution
  const codeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    filteredResponses.forEach((r) => {
      r.codes.forEach((c) => {
        dist[c.label] = (dist[c.label] || 0) + 1;
      });
    });
    return Object.entries(dist)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredResponses]);

  // Calculate market distribution
  const marketDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    filteredResponses.forEach((r) => {
      dist[r.market] = (dist[r.market] || 0) + 1;
    });
    const marketColors: Record<string, string> = {
      Indonesia: '#3b82f6',
      Singapore: '#10b981',
      Malaysia: '#f59e0b',
      Thailand: '#ef4444',
      Philippines: '#8b5cf6',
    };
    return Object.entries(dist).map(([market, count]) => ({
      name: market,
      value: count,
      fill: marketColors[market] || '#6b7280',
    }));
  }, [filteredResponses]);

  // Calculate coded percentage
  const codedPercentage = useMemo(() => {
    if (filteredResponses.length === 0) return 0;
    const codedCount = filteredResponses.filter((r) => r.codes.length > 0).length;
    return Math.round((codedCount / filteredResponses.length) * 100);
  }, [filteredResponses]);

  // Toggle response selection
  const toggleResponseSelection = useCallback((id: string) => {
    setSelectedResponses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Handle AI coding simulation
  const handleAICoding = useCallback(async () => {
    setAiProgress({ current: 0, total: responses.length });

    for (let i = 0; i < 100; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setAiProgress({
        current: Math.floor((i / 100) * responses.length),
        total: responses.length,
      });
    }

    setAiProgress(null);
  }, [responses.length]);

  // Handle bulk code application
  const handleBulkCode = useCallback((codeLabel: string) => {
    console.log(
      `Applying code ${codeLabel} to ${selectedResponses.size} responses`
    );
    setSelectedResponses(new Set());
  }, [selectedResponses.size]);

  // Add code
  const handleAddCode = useCallback((code: Omit<Code, 'id'>) => {
    setCodes((prev) => [
      ...prev,
      { ...code, id: Math.max(...prev.map((c) => c.id), 0) + 1 },
    ]);
  }, []);

  // Edit code
  const handleEditCode = useCallback((id: number, updates: Partial<Code>) => {
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  // Delete code
  const handleDeleteCode = useCallback((id: number) => {
    setCodes((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Update filter
  const updateFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return {
    // Data
    responses,
    codes,
    filteredResponses,
    selectedResponses,
    aiProgress,
    loading,

    // Computed
    codeDistribution,
    marketDistribution,
    codedPercentage,

    // Filters
    filters,
    updateFilter,

    // Handlers
    toggleResponseSelection,
    handleAICoding,
    handleBulkCode,
    handleAddCode,
    handleEditCode,
    handleDeleteCode,
  };
}
