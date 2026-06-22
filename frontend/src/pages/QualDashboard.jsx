import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText, MessageSquare, Users, Clock, Search, Filter,
  TrendingUp, Target, BookOpen, Mic, Video, Hash
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 bg-${color}-100 rounded-lg`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      {subtitle && (
        <span className="text-sm text-gray-500">{subtitle}</span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

const TranscriptRow = ({ index, style, data }) => {
  const transcript = data[index];

  return (
    <div style={style} className="flex items-center px-4 border-b hover:bg-gray-50">
      <div className="flex-1 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {transcript.participant_name || `Participant ${transcript.participant_id}`}
            </p>
            <p className="text-sm text-gray-500">
              Project: {transcript.project_name} | Duration: {transcript.duration}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 text-xs rounded-full ${
              transcript.status === 'completed' ? 'bg-green-100 text-green-800' :
              transcript.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {transcript.status}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(transcript.created_at).toLocaleDateString()}
            </span>
            <button className="text-blue-600 hover:text-blue-800">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisCard = ({ analysis }) => (
  <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer">
    <div className="flex items-start justify-between mb-3">
      <h4 className="font-medium text-gray-900">{analysis.title}</h4>
      <span className={`px-2 py-1 text-xs rounded-full ${
        analysis.type === 'thematic' ? 'bg-purple-100 text-purple-800' :
        analysis.type === 'sentiment' ? 'bg-blue-100 text-blue-800' :
        'bg-green-100 text-green-800'
      }`}>
        {analysis.type}
      </span>
    </div>
    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{analysis.description}</p>
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{analysis.author}</span>
      <span className="text-gray-500">{analysis.date}</span>
    </div>
    <div className="mt-3 flex items-center space-x-2">
      <div className="flex -space-x-2">
        {analysis.collaborators?.slice(0, 3).map((collab, idx) => (
          <div key={idx} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs">
            {collab.charAt(0)}
          </div>
        ))}
      </div>
      {analysis.collaborators?.length > 3 && (
        <span className="text-xs text-gray-500">+{analysis.collaborators.length - 3}</span>
      )}
    </div>
  </div>
);

const QualDashboard = () => {
  const { user, userDetails } = useAuth();
  const [stats, setStats] = useState({
    active_projects: 12,
    total_transcripts: 847,
    analyses_completed: 234,
    team_members: 8
  });
  const [transcripts, setTranscripts] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Generate mock data for transcripts (simulating large dataset)
      const mockTranscripts = Array.from({ length: 10000 }, (_, i) => ({
        id: `transcript_${i}`,
        participant_id: `P${String(i + 1).padStart(5, '0')}`,
        participant_name: `Participant ${i + 1}`,
        project_name: `Project ${Math.floor(i / 100) + 1}`,
        duration: `${Math.floor(Math.random() * 60 + 30)} mins`,
        status: ['completed', 'in_progress', 'pending'][Math.floor(Math.random() * 3)],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        language: ['English', 'Bahasa', 'Thai', 'Vietnamese'][Math.floor(Math.random() * 4)],
        quality_score: Math.floor(Math.random() * 30) + 70
      }));

      const mockAnalyses = [
        {
          id: 1,
          title: 'Consumer Behavior Analysis - Q4 2024',
          type: 'thematic',
          description: 'Deep dive into shopping patterns and preferences across SEA markets with focus on digital adoption',
          author: 'Sarah Chen',
          date: '2 hours ago',
          collaborators: ['John', 'Maria', 'Ahmed', 'Lisa']
        },
        {
          id: 2,
          title: 'Brand Perception Study',
          type: 'sentiment',
          description: 'Sentiment analysis of brand mentions across social media and interview transcripts',
          author: 'Mike Johnson',
          date: '5 hours ago',
          collaborators: ['Emma', 'David']
        },
        {
          id: 3,
          title: 'Product Concept Testing Results',
          type: 'coding',
          description: 'Coded responses from 500+ participants on new product concepts',
          author: 'Anna Lee',
          date: '1 day ago',
          collaborators: ['Tom', 'Rachel', 'Sam', 'Nina', 'Alex']
        }
      ];

      setTranscripts(mockTranscripts);
      setAnalyses(mockAnalyses);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setLoading(false);
    }
  };

  const filteredTranscripts = useMemo(() => {
    return transcripts.filter(t => {
      const matchesSearch = searchTerm === '' ||
        t.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.project_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || t.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [transcripts, searchTerm, filterStatus]);

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
            <h1 className="text-3xl font-bold text-gray-900">Qualitative Research Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage interviews, transcripts, and qualitative analysis
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Target}
            title="Active Projects"
            value={stats.active_projects}
            subtitle="3 new this week"
            color="purple"
          />
          <StatCard
            icon={FileText}
            title="Total Transcripts"
            value={stats.total_transcripts.toLocaleString()}
            subtitle="147 pending review"
            color="blue"
          />
          <StatCard
            icon={BookOpen}
            title="Analyses Completed"
            value={stats.analyses_completed}
            subtitle="12 in progress"
            color="green"
          />
          <StatCard
            icon={Users}
            title="Team Members"
            value={stats.team_members}
            subtitle="2 online now"
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center space-x-2 p-3 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
              <Mic className="h-5 w-5 text-purple-600" />
              <span>Upload Audio</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <Video className="h-5 w-5 text-blue-600" />
              <span>Upload Video</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors">
              <FileText className="h-5 w-5 text-green-600" />
              <span>Import Transcript</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
              <Hash className="h-5 w-5 text-orange-600" />
              <span>Start Coding</span>
            </button>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Recent Analyses</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyses.map(analysis => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))}
          </div>
        </div>

        {/* Transcripts Table with Virtual Scrolling */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transcripts Library</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transcripts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Showing {filteredTranscripts.length.toLocaleString()} of {transcripts.length.toLocaleString()} transcripts
            </p>
          </div>

          <div style={{ height: '500px' }}>
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  itemCount={filteredTranscripts.length}
                  itemSize={70}
                  width={width}
                  itemData={filteredTranscripts}
                >
                  {TranscriptRow}
                </List>
              )}
            </AutoSizer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualDashboard;