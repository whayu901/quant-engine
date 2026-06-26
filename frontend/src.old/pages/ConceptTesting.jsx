import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, Star, ThumbsUp, MessageSquare, TrendingUp,
  Users, Globe, Target, Award, BarChart3, Eye, Heart
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

const ConceptCard = ({ concept, onClick, isSelected }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{concept.name}</h3>
          <p className="text-sm text-gray-500">{concept.category}</p>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(concept.overall_score)}`}>
          {concept.overall_score}%
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{concept.description}</p>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <p className="font-semibold">{concept.appeal}%</p>
          <p className="text-gray-500">Appeal</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{concept.uniqueness}%</p>
          <p className="text-gray-500">Unique</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{concept.purchase_intent}%</p>
          <p className="text-gray-500">Purchase</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-500">
            {concept.responses.toLocaleString()} responses
          </span>
        </div>
        <div className="flex -space-x-2">
          {concept.markets.slice(0, 3).map((market, idx) => (
            <div
              key={idx}
              className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium"
            >
              {market.substring(0, 2).toUpperCase()}
            </div>
          ))}
          {concept.markets.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-xs text-white">
              +{concept.markets.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConceptTesting = () => {
  const [loading, setLoading] = useState(true);
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [marketFilter, setMarketFilter] = useState('all');

  useEffect(() => {
    fetchConceptData();
  }, []);

  const fetchConceptData = async () => {
    try {
      // Generate mock concept data
      const mockConcepts = Array.from({ length: 12 }, (_, i) => ({
        id: `concept_${i}`,
        name: `Concept ${String.fromCharCode(65 + i)}`,
        category: ['Food & Beverage', 'Personal Care', 'Electronics', 'Fashion'][i % 4],
        description: `Innovative product concept targeting modern consumers with emphasis on sustainability and convenience. Features include premium materials and smart technology integration.`,
        overall_score: Math.floor(Math.random() * 30) + 60,
        appeal: Math.floor(Math.random() * 30) + 60,
        uniqueness: Math.floor(Math.random() * 30) + 55,
        purchase_intent: Math.floor(Math.random() * 35) + 50,
        believability: Math.floor(Math.random() * 25) + 65,
        relevance: Math.floor(Math.random() * 30) + 60,
        responses: Math.floor(Math.random() * 5000) + 1000,
        markets: ['Indonesia', 'Singapore', 'Malaysia', 'Thailand', 'Philippines'].slice(0, Math.floor(Math.random() * 3) + 2),
        demographics: {
          age: [
            { range: '18-24', percentage: 25 },
            { range: '25-34', percentage: 35 },
            { range: '35-44', percentage: 25 },
            { range: '45+', percentage: 15 }
          ],
          gender: [
            { type: 'Male', value: 45 },
            { type: 'Female', value: 55 }
          ]
        },
        sentiment: {
          positive: Math.floor(Math.random() * 30) + 50,
          neutral: Math.floor(Math.random() * 20) + 20,
          negative: Math.floor(Math.random() * 15) + 10
        },
        attributes: [
          { attribute: 'Quality', score: Math.floor(Math.random() * 30) + 60 },
          { attribute: 'Value', score: Math.floor(Math.random() * 30) + 55 },
          { attribute: 'Innovation', score: Math.floor(Math.random() * 30) + 65 },
          { attribute: 'Trust', score: Math.floor(Math.random() * 30) + 50 },
          { attribute: 'Design', score: Math.floor(Math.random() * 30) + 70 },
          { attribute: 'Sustainability', score: Math.floor(Math.random() * 30) + 45 }
        ],
        timeline: Array.from({ length: 7 }, (_, j) => ({
          day: `Day ${j + 1}`,
          score: Math.floor(Math.random() * 10) + 60 + (j * 2)
        }))
      }));

      setConcepts(mockConcepts);
      setSelectedConcept(mockConcepts[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching concepts:', error);
      setLoading(false);
    }
  };

  const filteredConcepts = useMemo(() => {
    if (marketFilter === 'all') return concepts;
    return concepts.filter(c => c.markets.includes(marketFilter));
  }, [concepts, marketFilter]);

  const handleConceptSelect = (concept) => {
    if (comparisonMode) {
      if (selectedForComparison.find(c => c.id === concept.id)) {
        setSelectedForComparison(selectedForComparison.filter(c => c.id !== concept.id));
      } else if (selectedForComparison.length < 3) {
        setSelectedForComparison([...selectedForComparison, concept]);
      }
    } else {
      setSelectedConcept(concept);
    }
  };

  const radarData = useMemo(() => {
    if (!selectedConcept) return [];
    return selectedConcept.attributes.map(attr => ({
      attribute: attr.attribute,
      value: attr.score,
      fullMark: 100
    }));
  }, [selectedConcept]);

  const comparisonData = useMemo(() => {
    if (!comparisonMode || selectedForComparison.length === 0) return [];

    const attributes = ['Appeal', 'Uniqueness', 'Purchase Intent', 'Believability', 'Relevance'];
    return attributes.map(attr => {
      const data = { attribute: attr };
      selectedForComparison.forEach(concept => {
        data[concept.name] = concept[attr.toLowerCase().replace(' ', '_')] ||
                             Math.floor(Math.random() * 30) + 60;
      });
      return data;
    });
  }, [comparisonMode, selectedForComparison]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Concept Testing</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Evaluate and compare product concepts with consumer insights
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={marketFilter}
                  onChange={(e) => setMarketFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Markets</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Philippines">Philippines</option>
                </select>
                <button
                  onClick={() => {
                    setComparisonMode(!comparisonMode);
                    setSelectedForComparison([]);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    comparisonMode
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {comparisonMode ? 'Exit Comparison' : 'Compare Concepts'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Concept Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {filteredConcepts.map(concept => (
            <ConceptCard
              key={concept.id}
              concept={concept}
              onClick={() => handleConceptSelect(concept)}
              isSelected={
                comparisonMode
                  ? selectedForComparison.some(c => c.id === concept.id)
                  : selectedConcept?.id === concept.id
              }
            />
          ))}
        </div>

        {/* Comparison Mode */}
        {comparisonMode && selectedForComparison.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">
              Concept Comparison ({selectedForComparison.length} selected)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="attribute" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                {selectedForComparison.map((concept, idx) => (
                  <Bar
                    key={concept.id}
                    dataKey={concept.name}
                    fill={['#3b82f6', '#10b981', '#f59e0b'][idx]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Detailed Analysis */}
        {!comparisonMode && selectedConcept && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{selectedConcept.appeal}%</span>
                </div>
                <p className="text-sm text-gray-600">Appeal Score</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold">{selectedConcept.uniqueness}%</span>
                </div>
                <p className="text-sm text-gray-600">Uniqueness</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{selectedConcept.purchase_intent}%</span>
                </div>
                <p className="text-sm text-gray-600">Purchase Intent</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold">{selectedConcept.believability}%</span>
                </div>
                <p className="text-sm text-gray-600">Believability</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold">{selectedConcept.relevance}%</span>
                </div>
                <p className="text-sm text-gray-600">Relevance</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Attribute Radar */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Attribute Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="attribute" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name={selectedConcept.name}
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Sentiment Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Positive', value: selectedConcept.sentiment.positive, fill: '#10b981' },
                        { name: 'Neutral', value: selectedConcept.sentiment.neutral, fill: '#6b7280' },
                        { name: 'Negative', value: selectedConcept.sentiment.negative, fill: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { fill: '#10b981' },
                        { fill: '#6b7280' },
                        { fill: '#ef4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demographics and Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={selectedConcept.demographics.age}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Score Timeline */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Score Progression</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={selectedConcept.timeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#93bbfc"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConceptTesting;