import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, Users, MessageCircle, Target,
  Download, Filter, Calendar, Globe
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Sankey, Treemap, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ReferenceLine, Brush
} from 'recharts';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

// Custom hook for data fetching with caching
const useDataFetch = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error };
};

// Virtualized Table Component for millions of records
const VirtualizedTable = ({ data, columns }) => {
  const Row = ({ index, style }) => (
    <div style={style} className={`flex border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
      {columns.map((col) => (
        <div key={col.key} className="flex-1 px-4 py-2 text-sm">
          {data[index][col.key]}
        </div>
      ))}
    </div>
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          itemCount={data.length}
          itemSize={40}
          width={width}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
};

const ClientDashboard = () => {
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');

  // Generate massive mock data for demo
  const generateMockData = useCallback(() => {
    const markets = ['Indonesia', 'Singapore', 'Malaysia', 'Thailand', 'Philippines'];
    const sentiments = ['Positive', 'Neutral', 'Negative'];

    // Theme performance over time (aggregated for performance)
    const themeData = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      themeData.push({
        date: date.toISOString().split('T')[0],
        'Price Sensitivity': Math.floor(Math.random() * 100) + 300,
        'Quality': Math.floor(Math.random() * 80) + 250,
        'Brand Trust': Math.floor(Math.random() * 70) + 200,
        'User Experience': Math.floor(Math.random() * 90) + 180,
        'Innovation': Math.floor(Math.random() * 60) + 150
      });
    }

    // Market comparison
    const marketData = markets.map(market => ({
      market,
      satisfaction: Math.random() * 40 + 60,
      nps: Math.random() * 60 + 20,
      retention: Math.random() * 30 + 70,
      growth: Math.random() * 20 + 5
    }));

    // Sentiment distribution
    const sentimentData = sentiments.map(sentiment => ({
      name: sentiment,
      value: Math.floor(Math.random() * 1000) + 500,
      percentage: 0
    }));
    const total = sentimentData.reduce((acc, curr) => acc + curr.value, 0);
    sentimentData.forEach(item => {
      item.percentage = ((item.value / total) * 100).toFixed(1);
    });

    // Concept test results
    const conceptData = [
      { concept: 'Concept A', appeal: 85, uniqueness: 78, believability: 82, purchase_intent: 75 },
      { concept: 'Concept B', appeal: 72, uniqueness: 88, believability: 70, purchase_intent: 68 },
      { concept: 'Concept C', appeal: 90, uniqueness: 65, believability: 88, purchase_intent: 85 },
      { concept: 'Concept D', appeal: 68, uniqueness: 92, believability: 65, purchase_intent: 60 }
    ];

    // Generate millions of response records (paginated in real app)
    const responses = [];
    for (let i = 0; i < 100; i++) { // Limited for demo, but architecture supports millions
      responses.push({
        id: `R${i + 1}`,
        respondent: `User${Math.floor(Math.random() * 10000)}`,
        market: markets[Math.floor(Math.random() * markets.length)],
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        score: (Math.random() * 5).toFixed(2),
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    return { themeData, marketData, sentimentData, conceptData, responses };
  }, []);

  const mockData = useMemo(() => generateMockData(), [generateMockData]);

  const exportData = () => {
    // In real app, this would trigger a server-side export for large datasets
    alert('Exporting data... This would generate a downloadable file with all filtered data.');
  };

  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-8 w-8 text-${color}-500`} />
        {change !== undefined && (
          <span className={`text-sm font-semibold ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold">{value}</h3>
      <p className="text-gray-600 text-sm mt-1">{title}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Research Insights Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Real-time insights from your market research data
              </p>
            </div>
            <div className="flex space-x-3">
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Markets</option>
                <option value="ID">Indonesia</option>
                <option value="SG">Singapore</option>
                <option value="MY">Malaysia</option>
                <option value="TH">Thailand</option>
                <option value="PH">Philippines</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Responses"
            value="2.4M"
            change={12}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Avg. Satisfaction"
            value="4.2/5"
            change={5}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            title="NPS Score"
            value="+42"
            change={-3}
            icon={Target}
            color="purple"
          />
          <MetricCard
            title="Response Rate"
            value="68%"
            change={8}
            icon={MessageCircle}
            color="orange"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {['overview', 'themes', 'sentiment', 'concepts', 'data'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Theme Performance Over Time */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Theme Performance Trends</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={mockData.themeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Price Sensitivity" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="Quality" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Brand Trust" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="User Experience" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="Innovation" stroke="#8b5cf6" strokeWidth={2} />
                      <Brush dataKey="date" height={30} stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Market Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Market Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockData.marketData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="market" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="satisfaction" fill="#3b82f6" />
                        <Bar dataKey="nps" fill="#10b981" />
                        <Bar dataKey="retention" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Growth by Market</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={mockData.marketData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="market" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="growth" stroke="#8b5cf6" fill="#c084fc" />
                        <ReferenceLine y={15} label="Target" stroke="#ef4444" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sentiment' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={mockData.sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Sentiment Metrics</h3>
                  <div className="space-y-6">
                    {mockData.sentimentData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-600">{item.value.toLocaleString()} responses</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              item.name === 'Positive' ? 'bg-green-500' :
                              item.name === 'Neutral' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.percentage}% of total</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'concepts' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Concept Testing Results</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={mockData.conceptData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="concept" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Appeal" dataKey="appeal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Radar name="Uniqueness" dataKey="uniqueness" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Radar name="Believability" dataKey="believability" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                    <Radar name="Purchase Intent" dataKey="purchase_intent" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'data' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Response Data (Virtualized for Performance)</h3>
                <div className="text-sm text-gray-600 mb-2">
                  Showing 100 of 2.4M records - Virtualized rendering for smooth scrolling
                </div>
                <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                  <div className="flex bg-gray-100 border-b font-semibold">
                    <div className="flex-1 px-4 py-2">ID</div>
                    <div className="flex-1 px-4 py-2">Respondent</div>
                    <div className="flex-1 px-4 py-2">Market</div>
                    <div className="flex-1 px-4 py-2">Sentiment</div>
                    <div className="flex-1 px-4 py-2">Score</div>
                    <div className="flex-1 px-4 py-2">Date</div>
                  </div>
                  <VirtualizedTable
                    data={mockData.responses}
                    columns={[
                      { key: 'id', label: 'ID' },
                      { key: 'respondent', label: 'Respondent' },
                      { key: 'market', label: 'Market' },
                      { key: 'sentiment', label: 'Sentiment' },
                      { key: 'score', label: 'Score' },
                      { key: 'date', label: 'Date' }
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">AI-Generated Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-medium text-gray-900">Price Sensitivity Trend</p>
              <p className="text-sm text-gray-600 mt-1">
                Price sensitivity has increased by 15% in the Indonesian market over the past month,
                suggesting a need for value-focused positioning.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-medium text-gray-900">Quality Perception</p>
              <p className="text-sm text-gray-600 mt-1">
                Quality perception scores highest in Singapore (4.6/5) while showing improvement
                potential in Philippines (3.8/5).
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="font-medium text-gray-900">Concept C Leading</p>
              <p className="text-sm text-gray-600 mt-1">
                Concept C shows the highest purchase intent at 85%, driven by strong appeal
                and believability scores.
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <p className="font-medium text-gray-900">User Experience Focus</p>
              <p className="text-sm text-gray-600 mt-1">
                User experience mentions have grown 22% week-over-week, indicating increasing
                importance in purchase decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;