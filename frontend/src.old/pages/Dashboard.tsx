import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plus, TrendingUp, Clock, FileText,
  BarChart3, Users, Zap, ArrowRight, Calendar,
  Activity, Target, Award, Globe, ChevronRight,
  Sparkles, Briefcase, Brain, Rocket, Shield,
  CheckCircle, AlertCircle, XCircle, ArrowUpRight,
  Download, Share2, Filter, Search, Bell,
  Settings, HelpCircle, ChevronDown, Eye
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProjectCard } from '../components/projects/ProjectCard';
import { TimeSavedBadge } from '../components/ui/TimeSavedBadge';
import { TranscriptUploader } from '../components/transcripts/TranscriptUploader';
import useAuthStore from '../lib/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api/client';
import { Project, UsageStats } from '../types/api';
import { formatNumber, formatSEACurrency } from '../lib/utils/format';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showUploader, setShowUploader] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects'),
  });

  // Fetch usage stats
  const { data: usage } = useQuery<UsageStats>({
    queryKey: ['usage'],
    queryFn: () => api.get('/organization/usage'),
  });

  // Calculate total time saved
  const totalTimeSaved = projects?.reduce(
    (acc, project) => acc + (project.stats?.time_saved_minutes || 0),
    0
  ) || 0;

  const totalHoursSaved = Math.floor(totalTimeSaved / 60);
  const totalMinutesSaved = totalTimeSaved % 60;

  // Recent projects (last 6)
  const recentProjects = projects
    ?.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6) || [];

  // Stats with enhanced visuals
  const stats = [
    {
      label: 'Active Projects',
      value: projects?.length || 0,
      icon: <Briefcase className="w-5 h-5" />,
      color: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      change: '+12%',
      trend: 'up',
      description: 'Total research projects'
    },
    {
      label: 'Time Saved',
      value: `${totalHoursSaved}h ${totalMinutesSaved}m`,
      icon: <Clock className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      change: '+24%',
      trend: 'up',
      description: 'Analysis time reduced'
    },
    {
      label: 'Transcripts',
      value: projects?.reduce((acc, p) => acc + (p.stats?.transcript_count || 0), 0) || 0,
      icon: <FileText className="w-5 h-5" />,
      color: 'from-green-500 to-teal-600',
      bgGradient: 'from-green-50 to-teal-50',
      change: '+8%',
      trend: 'up',
      description: 'Processed recordings'
    },
    {
      label: 'AI Analyses',
      value: projects?.reduce((acc, p) => acc + (p.stats?.analysis_count || 0), 0) || 0,
      icon: <Brain className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      change: '+15%',
      trend: 'up',
      description: 'Insights generated'
    },
  ];

  // Activity feed
  const activities = [
    {
      type: 'project',
      title: 'New project created',
      description: 'Customer Journey Mapping Q4',
      time: '2 hours ago',
      icon: <Plus className="w-4 h-4" />,
      color: 'blue'
    },
    {
      type: 'analysis',
      title: 'Analysis completed',
      description: 'Sentiment analysis on user feedback',
      time: '4 hours ago',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'green'
    },
    {
      type: 'upload',
      title: 'Transcripts uploaded',
      description: '5 new interview recordings',
      time: '6 hours ago',
      icon: <FileText className="w-4 h-4" />,
      color: 'purple'
    },
    {
      type: 'share',
      title: 'Report shared',
      description: 'Q3 Research Findings shared with team',
      time: '1 day ago',
      icon: <Share2 className="w-4 h-4" />,
      color: 'orange'
    },
  ];

  // Quick insights
  const insights = [
    { label: 'Most Active Day', value: 'Wednesday', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Avg. Analysis Time', value: '12 mins', icon: <Clock className="w-4 h-4" /> },
    { label: 'Team Members', value: '8 active', icon: <Users className="w-4 h-4" /> },
    { label: 'Success Rate', value: '98.5%', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Header with Glassmorphism */}
      <div className="glass-card border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
              >
                Welcome back, {user?.full_name?.split(' ')[0]}! 👋
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-1"
              >
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {/* Notification Bell */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              {/* Quick Actions */}
              <Button
                variant="secondary"
                onClick={() => setShowUploader(true)}
                className="hidden sm:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Transcript
              </Button>
              <Button
                variant="speed"
                onClick={() => navigate('/projects/new')}
                className="btn-gradient"
              >
                <Rocket className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </motion.div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            {['overview', 'analytics', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Hero Card with Gradient Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="gradient-bg rounded-3xl p-8 text-white mb-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-purple-600/20" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold mb-2">
                      {totalHoursSaved > 0 ? `${totalHoursSaved} hours saved` : 'Start saving time today!'}
                    </h2>
                    <p className="text-white/90 text-lg">
                      {totalHoursSaved > 0
                        ? `That's ${Math.round(totalHoursSaved / 8)} full working days of productivity gained`
                        : 'Upload your first transcript to begin your research journey'}
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30">
                        <span className="text-sm text-white/80">Efficiency Score</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Zap className="w-5 h-5 text-yellow-300" />
                          <span className="text-2xl font-bold">94%</span>
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/30">
                        <span className="text-sm text-white/80">This Month</span>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendingUp className="w-5 h-5 text-green-300" />
                          <span className="text-2xl font-bold">+24%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="hidden lg:block"
                  >
                    <Rocket className="w-32 h-32 text-white/30" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Stats Grid with Enhanced Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="glass-card p-6 card-hover group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                        <div className="text-white">{stat.icon}</div>
                      </div>
                      {stat.trend === 'up' && (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          {stat.change}
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </p>
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {stat.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stat.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Projects - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Recent Projects</h2>
                        <p className="text-sm text-gray-600 mt-1">Your latest research initiatives</p>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => navigate('/projects')}
                        className="btn-ghost"
                      >
                        View all
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    {projectsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                          </div>
                        ))}
                      </div>
                    ) : recentProjects.length > 0 ? (
                      <div className="space-y-4">
                        {recentProjects.slice(0, 4).map((project, index) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="bg-white rounded-xl p-4 border border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {project.name}
                                  </h3>
                                  <span className={`badge ${project.status === 'active' ? 'badge-success' : 'badge-info'}`}>
                                    {project.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {project.description || 'No description provided'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {project.stats?.transcript_count || 0} transcripts
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Brain className="w-3 h-3" />
                                    {project.stats?.analysis_count || 0} analyses
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(project.updated_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {/* Progress Bar */}
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                    <span>Completion</span>
                                    <span className="font-medium">75%</span>
                                  </div>
                                  <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '75%' }} />
                                  </div>
                                </div>
                              </div>
                              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <Eye className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <LayoutGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Start Your First Project
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                          Create a project to begin organizing and analyzing your qualitative research data
                        </p>
                        <Button
                          variant="speed"
                          onClick={() => navigate('/projects/new')}
                          className="btn-gradient"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Project
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Activity Feed - Takes 1 column */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowUploader(true)}
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all group"
                      >
                        <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-gray-700">Upload</span>
                      </button>
                      <button
                        onClick={() => navigate('/analysis')}
                        className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl hover:from-green-100 hover:to-teal-100 transition-all group"
                      >
                        <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-gray-700">Analyze</span>
                      </button>
                      <button
                        onClick={() => navigate('/chat')}
                        className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all group"
                      >
                        <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-gray-700">AI Chat</span>
                      </button>
                      <button
                        onClick={() => navigate('/reports')}
                        className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all group"
                      >
                        <Download className="w-6 h-6 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-gray-700">Export</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Activity Feed */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {activities.map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activity.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                            activity.color === 'green' ? 'bg-green-100 text-green-600' :
                            activity.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {activity.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {activity.time}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
                      View all activity →
                    </button>
                  </motion.div>
                </div>
              </div>

              {/* Usage & Insights Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Plan Usage */}
                {usage && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Plan Usage</h3>
                        <p className="text-sm text-gray-600 mt-1">Current billing period</p>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        Upgrade →
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Minutes Used</span>
                          <span className="text-sm font-bold text-gray-900">
                            {usage.minutes_used} / {usage.minutes_limit}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(usage.minutes_used / usage.minutes_limit) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">AI Analyses</span>
                          <span className="text-sm font-bold text-gray-900">
                            {usage.analyses_used} / {usage.analyses_limit}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(usage.analyses_used / usage.analyses_limit) * 100}%` }}
                            transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-green-500 to-teal-600"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Storage</span>
                          <span className="text-sm font-bold text-gray-900">
                            {usage.storage_used_gb.toFixed(1)} / {usage.storage_limit_gb} GB
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(usage.storage_used_gb / usage.storage_limit_gb) * 100}%` }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round((1 - usage.minutes_used / usage.minutes_limit) * 100)}%
                          </p>
                          <p className="text-xs text-gray-600">Remaining</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round((usage.minutes_limit - usage.minutes_used) / 60)}h
                          </p>
                          <p className="text-xs text-gray-600">Available</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Quick Insights</h3>
                      <p className="text-sm text-gray-600 mt-1">Key performance metrics</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Details →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {insights.map((insight, index) => (
                      <motion.div
                        key={insight.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          {insight.icon}
                          <span className="text-xs font-medium">{insight.label}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{insight.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl border border-primary-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Shield className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Security Status</p>
                        <p className="text-xs text-gray-600">All systems operational</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Analytics content would go here */}
              <div className="glass-card p-8 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Detailed analytics and insights coming soon</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Activity timeline would go here */}
              <div className="glass-card p-8 text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Activity Timeline</h3>
                <p className="text-gray-600">Complete activity history coming soon</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <TranscriptUploader
                projectId={selectedProjectId || projects?.[0]?.id || ''}
                onClose={() => setShowUploader(false)}
                onUploadComplete={(transcriptIds) => {
                  setShowUploader(false);
                  // Navigate to first transcript
                  if (transcriptIds.length > 0) {
                    navigate(`/transcripts/${transcriptIds[0]}`);
                  }
                }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Dashboard;