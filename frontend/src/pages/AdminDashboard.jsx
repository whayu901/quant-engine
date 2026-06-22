import React, { useState, useEffect } from 'react';
import {
  Users, Activity, Database, TrendingUp,
  UserCheck, FileText, MessageSquare, BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 bg-${color}-100 rounded-lg`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      {change && (
        <span className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-sm text-gray-600">{title}</p>
  </div>
);

const AdminDashboard = () => {
  const { user, hasPermission } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [projectData, setProjectData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const data = await response.json();
      setStats(data);

      // Transform data for charts
      transformChartData(data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setLoading(false);
    }
  };

  const transformChartData = (data) => {
    // Activity trend (mock data for now)
    const activityTrend = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      activityTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        users: Math.floor(Math.random() * 50) + 20,
        activities: Math.floor(Math.random() * 200) + 100
      });
    }
    setActivityData(activityTrend);

    // Team distribution
    if (data.teams) {
      const teamChart = Object.entries(data.teams).map(([team, count]) => ({
        name: team.replace('_', ' ').toUpperCase(),
        value: count
      }));
      setTeamData(teamChart);
    }

    // Project status
    if (data.projects) {
      setProjectData([
        { name: 'Active', value: data.projects.active, color: '#10b981' },
        { name: 'Completed', value: data.projects.completed, color: '#3b82f6' },
        { name: 'Archived', value: data.projects.total - data.projects.active - data.projects.completed, color: '#6b7280' }
      ]);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Organization overview and system management
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats?.users?.total || 0}
            change={12}
            color="blue"
          />
          <StatCard
            icon={Activity}
            title="Active Today"
            value={stats?.users?.active_today || 0}
            change={-5}
            color="green"
          />
          <StatCard
            icon={FileText}
            title="Total Projects"
            value={stats?.projects?.total || 0}
            change={8}
            color="purple"
          />
          <StatCard
            icon={Database}
            title="Transcripts"
            value={stats?.content?.transcripts || 0}
            change={15}
            color="orange"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="#93bbfc" />
                <Area type="monotone" dataKey="activities" stackId="1" stroke="#10b981" fill="#86efac" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Team Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Team Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={teamData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {teamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Content Statistics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Content Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Transcripts</span>
                <span className="font-bold">{stats?.content?.transcripts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Analyses</span>
                <span className="font-bold">{stats?.content?.analyses || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Evidence</span>
                <span className="font-bold">{stats?.content?.evidence || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Open Ends</span>
                <span className="font-bold">{stats?.content?.open_ends_questions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Concept Tests</span>
                <span className="font-bold">{stats?.content?.concept_tests || 0}</span>
              </div>
            </div>
          </div>

          {/* Project Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Project Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {projectData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {stats?.activity?.recent?.slice(0, 5).map((act, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-sm">
                  <div className="flex-shrink-0 w-2 h-2 mt-1.5 bg-blue-400 rounded-full"></div>
                  <div>
                    <p className="text-gray-900">{act.action.replace('_', ' ')}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(act.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Roles Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { name: 'Admin', count: stats?.users?.by_role?.admin || 0 },
                { name: 'Researcher', count: stats?.users?.by_role?.researcher || 0 },
                { name: 'Viewer', count: stats?.users?.by_role?.viewer || 0 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        {hasPermission('manage_users') && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Manage Users</span>
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>View Projects</span>
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Analytics</span>
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Support</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;