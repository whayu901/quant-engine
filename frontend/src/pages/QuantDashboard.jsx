import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3, PieChart, TrendingUp, Database, Download,
  FileSpreadsheet, Calculator, Filter, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 bg-${color}-100 rounded-lg`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      {change !== undefined && (
        <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

const SurveyRow = ({ index, style, data }) => {
  const survey = data[index];

  return (
    <div style={style} className="flex items-center px-4 border-b hover:bg-gray-50">
      <div className="flex-1 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-gray-900">{survey.name}</p>
            <p className="text-sm text-gray-500">
              {survey.responses.toLocaleString()} responses | {survey.completion_rate}% completion
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{survey.market}</p>
              <p className="text-xs text-gray-500">{survey.date}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              survey.status === 'active' ? 'bg-green-100 text-green-800' :
              survey.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {survey.status}
            </span>
            <button className="text-blue-600 hover:text-blue-800">
              Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuantDashboard = () => {
  const { user, userDetails } = useAuth();
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [responseData, setResponseData] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('all');

  useEffect(() => {
    fetchQuantData();
  }, []);

  const fetchQuantData = async () => {
    try {
      // Generate massive mock survey data
      const mockSurveys = Array.from({ length: 50000 }, (_, i) => ({
        id: `survey_${i}`,
        name: `Survey ${Math.floor(i / 100) + 1} - Wave ${(i % 10) + 1}`,
        responses: Math.floor(Math.random() * 10000) + 500,
        completion_rate: Math.floor(Math.random() * 30) + 70,
        market: ['Indonesia', 'Singapore', 'Malaysia', 'Thailand', 'Philippines'][Math.floor(Math.random() * 5)],
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: ['active', 'completed', 'draft'][Math.floor(Math.random() * 3)],
        margin_error: (Math.random() * 2 + 1).toFixed(1),
        confidence_level: 95
      }));

      // Response trend data
      const trend = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          responses: Math.floor(Math.random() * 5000) + 2000,
          completes: Math.floor(Math.random() * 3000) + 1500,
          dropouts: Math.floor(Math.random() * 500) + 100
        };
      });

      // Market distribution
      const markets = [
        { name: 'Indonesia', value: 12500, fill: '#3b82f6' },
        { name: 'Singapore', value: 8200, fill: '#10b981' },
        { name: 'Malaysia', value: 9800, fill: '#f59e0b' },
        { name: 'Thailand', value: 7600, fill: '#ef4444' },
        { name: 'Philippines', value: 6900, fill: '#8b5cf6' }
      ];

      // Quality metrics for radar chart
      const quality = [
        { metric: 'Data Quality', A: 92, B: 85, fullMark: 100 },
        { metric: 'Response Rate', A: 78, B: 72, fullMark: 100 },
        { metric: 'Completion', A: 85, B: 80, fullMark: 100 },
        { metric: 'Speed', A: 88, B: 82, fullMark: 100 },
        { metric: 'Accuracy', A: 95, B: 90, fullMark: 100 },
        { metric: 'Coverage', A: 82, B: 75, fullMark: 100 }
      ];

      setSurveys(mockSurveys);
      setResponseData(trend);
      setMarketData(markets);
      setQualityMetrics(quality);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quant data:', error);
      setLoading(false);
    }
  };

  const filteredSurveys = useMemo(() => {
    if (selectedMarket === 'all') return surveys;
    return surveys.filter(s => s.market === selectedMarket);
  }, [surveys, selectedMarket]);

  const stats = useMemo(() => ({
    total_surveys: surveys.length,
    active_surveys: surveys.filter(s => s.status === 'active').length,
    total_responses: surveys.reduce((acc, s) => acc + s.responses, 0),
    avg_completion: Math.round(surveys.reduce((acc, s) => acc + s.completion_rate, 0) / surveys.length)
  }), [surveys]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Quantitative Research Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Survey management, data analysis, and statistical insights
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileSpreadsheet}
            title="Total Surveys"
            value={stats.total_surveys.toLocaleString()}
            change={12}
            color="indigo"
          />
          <StatCard
            icon={BarChart3}
            title="Active Surveys"
            value={stats.active_surveys.toLocaleString()}
            color="green"
          />
          <StatCard
            icon={Database}
            title="Total Responses"
            value={(stats.total_responses / 1000000).toFixed(1) + 'M'}
            change={23}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Avg Completion"
            value={stats.avg_completion + '%'}
            change={-2}
            color="orange"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Response Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Response Trend (30 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="responses" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="completes" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="dropouts" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Market Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Market Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={marketData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${(value/1000).toFixed(1)}k`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {marketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Metrics Radar */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Quality Metrics Comparison</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={qualityMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Current Quarter" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="Previous Quarter" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Key Insights</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Data Quality Improved</p>
                    <p className="text-xs text-gray-500">+7% compared to last quarter</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Response Rate Declining</p>
                    <p className="text-xs text-gray-500">Consider incentive adjustments</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Accuracy at All-Time High</p>
                    <p className="text-xs text-gray-500">95% validation rate achieved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Surveys Table with Virtual Scrolling */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Survey Repository</h3>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Markets</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Philippines">Philippines</option>
                </select>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Showing {filteredSurveys.length.toLocaleString()} surveys
            </p>
          </div>

          <div style={{ height: '500px' }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  itemCount={filteredSurveys.length}
                  itemSize={70}
                  width={width}
                  itemData={filteredSurveys}
                >
                  {SurveyRow}
                </List>
              )}
            </AutoSizer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantDashboard;