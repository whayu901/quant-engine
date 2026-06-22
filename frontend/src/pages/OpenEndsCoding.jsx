import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Hash, Brain, Download, Upload, Filter, Tag, CheckSquare,
  AlertTriangle, TrendingUp, Users, Clock, Zap, Search
} from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ResponseRow = ({ index, style, data }) => {
  const { responses, selectedResponses, onToggleSelection, codes } = data;
  const response = responses[index];
  const isSelected = selectedResponses.has(response.id);

  return (
    <div style={style} className="flex items-start px-4 py-2 border-b hover:bg-gray-50">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelection(response.id)}
        className="mt-1 mr-3"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-4">
            <p className="text-sm text-gray-900">{response.text}</p>
            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
              <span>ID: {response.respondent_id}</span>
              <span>{response.market}</span>
              <span>{response.date}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 max-w-xs">
            {response.codes.map((code, idx) => (
              <span
                key={idx}
                className={`px-2 py-1 text-xs rounded-full ${
                  code.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                  code.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {code.label}
                {code.confidence && (
                  <span className="ml-1 opacity-60">
                    {Math.round(code.confidence * 100)}%
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CodebookPanel = ({ codes, onAddCode, onEditCode, onDeleteCode }) => {
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleAddCode = () => {
    if (newCode.trim()) {
      onAddCode({ label: newCode, description: newDescription, count: 0 });
      setNewCode('');
      setNewDescription('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-4">Codebook</h3>

      <div className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Code label..."
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
        <input
          type="text"
          placeholder="Description (optional)..."
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
        <button
          onClick={handleAddCode}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Add Code
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {codes.map((code, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
            <div className="flex-1">
              <p className="text-sm font-medium">{code.label}</p>
              {code.description && (
                <p className="text-xs text-gray-500">{code.description}</p>
              )}
              <p className="text-xs text-gray-400">Used: {code.count} times</p>
            </div>
            <button
              onClick={() => onDeleteCode(code.id)}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const OpenEndsCoding = () => {
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [codes, setCodes] = useState([]);
  const [selectedResponses, setSelectedResponses] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMarket, setFilterMarket] = useState('all');
  const [filterCode, setFilterCode] = useState('all');
  const [aiProgress, setAiProgress] = useState(null);

  useEffect(() => {
    fetchOpenEndsData();
  }, []);

  const fetchOpenEndsData = async () => {
    try {
      // Generate massive mock data
      const mockResponses = Array.from({ length: 100000 }, (_, i) => {
        const templates = [
          "I prefer this product because it's convenient and easy to use",
          "The price is too high compared to competitors",
          "Quality is excellent but packaging needs improvement",
          "Customer service was very helpful and responsive",
          "Would recommend to friends and family",
          "Delivery was fast but product was damaged",
          "Great value for money, will buy again",
          "Not satisfied with the product performance",
          "Love the new features and design",
          "Difficult to understand the instructions"
        ];

        const markets = ['Indonesia', 'Singapore', 'Malaysia', 'Thailand', 'Philippines'];
        const possibleCodes = [
          { label: 'Price', confidence: 0.9 },
          { label: 'Quality', confidence: 0.85 },
          { label: 'Service', confidence: 0.75 },
          { label: 'Delivery', confidence: 0.8 },
          { label: 'Features', confidence: 0.95 },
          { label: 'Packaging', confidence: 0.7 },
          { label: 'Value', confidence: 0.88 },
          { label: 'Recommendation', confidence: 0.92 }
        ];

        const numCodes = Math.floor(Math.random() * 3) + 1;
        const assignedCodes = [];
        for (let j = 0; j < numCodes; j++) {
          assignedCodes.push(possibleCodes[Math.floor(Math.random() * possibleCodes.length)]);
        }

        return {
          id: `resp_${i}`,
          respondent_id: `R${String(i + 1).padStart(6, '0')}`,
          text: templates[Math.floor(Math.random() * templates.length)] +
                ` [Extended response ${i}...]`,
          market: markets[Math.floor(Math.random() * markets.length)],
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          codes: assignedCodes
        };
      });

      const mockCodes = [
        { id: 1, label: 'Price', description: 'Price-related mentions', count: 12543 },
        { id: 2, label: 'Quality', description: 'Product quality feedback', count: 10234 },
        { id: 3, label: 'Service', description: 'Customer service experiences', count: 8765 },
        { id: 4, label: 'Delivery', description: 'Delivery and shipping', count: 6543 },
        { id: 5, label: 'Features', description: 'Product features and functionality', count: 9876 },
        { id: 6, label: 'Packaging', description: 'Packaging feedback', count: 4321 },
        { id: 7, label: 'Value', description: 'Value for money', count: 7654 },
        { id: 8, label: 'Recommendation', description: 'Would recommend', count: 5432 }
      ];

      setResponses(mockResponses);
      setCodes(mockCodes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching open ends:', error);
      setLoading(false);
    }
  };

  const handleAICoding = async () => {
    setAiProgress({ current: 0, total: responses.length });

    // Simulate AI coding progress
    for (let i = 0; i < 100; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setAiProgress({
        current: Math.floor((i / 100) * responses.length),
        total: responses.length
      });
    }

    setAiProgress(null);
  };

  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      const matchesSearch = searchTerm === '' ||
        r.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMarket = filterMarket === 'all' || r.market === filterMarket;
      const matchesCode = filterCode === 'all' ||
        r.codes.some(c => c.label === filterCode);
      return matchesSearch && matchesMarket && matchesCode;
    });
  }, [responses, searchTerm, filterMarket, filterCode]);

  const codeDistribution = useMemo(() => {
    const dist = {};
    filteredResponses.forEach(r => {
      r.codes.forEach(c => {
        dist[c.label] = (dist[c.label] || 0) + 1;
      });
    });
    return Object.entries(dist).map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredResponses]);

  const marketDistribution = useMemo(() => {
    const dist = {};
    filteredResponses.forEach(r => {
      dist[r.market] = (dist[r.market] || 0) + 1;
    });
    return Object.entries(dist).map(([market, count]) => ({
      name: market,
      value: count,
      fill: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][
        ['Indonesia', 'Singapore', 'Malaysia', 'Thailand', 'Philippines'].indexOf(market)
      ]
    }));
  }, [filteredResponses]);

  const toggleResponseSelection = useCallback((id) => {
    setSelectedResponses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleBulkCode = (codeLabel) => {
    // Apply code to selected responses
    console.log(`Applying code ${codeLabel} to ${selectedResponses.size} responses`);
    setSelectedResponses(new Set());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Open Ends Coding</h1>
            <p className="mt-2 text-sm text-gray-600">
              AI-assisted coding for open-ended survey responses
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{responses.length.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Responses</p>
              </div>
              <Hash className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{codes.length}</p>
                <p className="text-sm text-gray-600">Active Codes</p>
              </div>
              <Tag className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((filteredResponses.filter(r => r.codes.length > 0).length / filteredResponses.length) * 100)}%
                </p>
                <p className="text-sm text-gray-600">Coded</p>
              </div>
              <CheckSquare className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-gray-600">AI Confidence</p>
              </div>
              <Brain className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Coding Area - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search responses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterMarket}
                    onChange={(e) => setFilterMarket(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="all">All Markets</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Philippines">Philippines</option>
                  </select>
                  <select
                    value={filterCode}
                    onChange={(e) => setFilterCode(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    <option value="all">All Codes</option>
                    {codes.map(code => (
                      <option key={code.id} value={code.label}>{code.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedResponses.size > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedResponses.size} selected
                    </span>
                  )}
                  <button
                    onClick={handleAICoding}
                    disabled={aiProgress !== null}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Zap className="h-4 w-4" />
                    <span>AI Auto-Code</span>
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {aiProgress && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>AI Coding in progress...</span>
                    <span>{Math.round((aiProgress.current / aiProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(aiProgress.current / aiProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-2">
                Showing {filteredResponses.length.toLocaleString()} of {responses.length.toLocaleString()} responses
              </p>
            </div>

            {/* Responses Table */}
            <div className="bg-white rounded-lg shadow">
              <div style={{ height: '600px' }}>
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      itemCount={filteredResponses.length}
                      itemSize={80}
                      width={width}
                      itemData={{
                        responses: filteredResponses,
                        selectedResponses,
                        onToggleSelection: toggleResponseSelection,
                        codes
                      }}
                    >
                      {ResponseRow}
                    </List>
                  )}
                </AutoSizer>
              </div>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-4">Code Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={codeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold mb-4">Market Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={marketDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {marketDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar - Codebook */}
          <div className="lg:col-span-1">
            <CodebookPanel
              codes={codes}
              onAddCode={(code) => setCodes([...codes, { ...code, id: codes.length + 1 }])}
              onEditCode={(id, updates) => {
                setCodes(codes.map(c => c.id === id ? { ...c, ...updates } : c));
              }}
              onDeleteCode={(id) => setCodes(codes.filter(c => c.id !== id))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenEndsCoding;