import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Plus, TrendingUp, Clock, FileText,
  BarChart3, Users, Zap, ArrowRight, Calendar,
  Activity, Target, Award, Globe
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

  // Recent projects (last 4)
  const recentProjects = projects
    ?.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4) || [];

  const stats = [
    {
      label: 'Total Projects',
      value: projects?.length || 0,
      icon: <LayoutGrid className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Time Saved',
      value: `${totalHoursSaved}h ${totalMinutesSaved}m`,
      icon: <Clock className="w-5 h-5" />,
      color: 'from-velocity-blue to-neural-purple',
      change: '+24%',
      trend: 'up'
    },
    {
      label: 'Transcripts',
      value: projects?.reduce((acc, p) => acc + (p.stats?.transcript_count || 0), 0) || 0,
      icon: <FileText className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      change: '+8%',
      trend: 'up'
    },
    {
      label: 'Analyses',
      value: projects?.reduce((acc, p) => acc + (p.stats?.analysis_count || 0), 0) || 0,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      change: '+15%',
      trend: 'up'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back, {user?.full_name?.split(' ')[0]}!
              </h1>
              <p className="text-slate-600 mt-1">
                Here's what's happening with your research today
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowUploader(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Transcript
              </Button>
              <Button
                variant="speed"
                onClick={() => navigate('/projects/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Saved Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-velocity-blue to-neural-purple rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                You've saved {totalHoursSaved} hours this month!
              </h2>
              <p className="text-white/80">
                That's {Math.round(totalHoursSaved / 8)} full working days of analysis time
              </p>
              <div className="mt-4">
                <TimeSavedBadge
                  hours={totalHoursSaved}
                  minutes={totalMinutesSaved}
                  variant="large"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="hidden lg:block">
              <Zap className="w-32 h-32 text-white/20" />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
                {stat.trend === 'up' && (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Recent Projects
            </h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/projects')}
            >
              View all
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {projectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center">
              <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No projects yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first project to start analyzing qualitative data
              </p>
              <Button
                variant="speed"
                onClick={() => navigate('/projects/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            </div>
          )}
        </div>

        {/* Usage Overview */}
        {usage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Usage */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-200"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Plan Usage
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Minutes</span>
                    <span className="text-sm font-medium text-slate-900">
                      {usage.minutes_used} / {usage.minutes_limit}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-velocity-blue to-neural-purple"
                      style={{ width: `${(usage.minutes_used / usage.minutes_limit) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Analyses</span>
                    <span className="text-sm font-medium text-slate-900">
                      {usage.analyses_used} / {usage.analyses_limit}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${(usage.analyses_used / usage.analyses_limit) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Storage</span>
                    <span className="text-sm font-medium text-slate-900">
                      {usage.storage_used_gb.toFixed(1)} / {usage.storage_limit_gb} GB
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${(usage.storage_used_gb / usage.storage_limit_gb) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button variant="ghost" className="w-full">
                  Upgrade Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 border border-slate-200"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowUploader(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Upload Transcript</p>
                    <p className="text-sm text-slate-600">Add new recordings for analysis</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </button>

                <button
                  onClick={() => navigate('/analysis')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">View Analyses</p>
                    <p className="text-sm text-slate-600">Review your research insights</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </button>

                <button
                  onClick={() => navigate('/chat')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">AI Assistant</p>
                    <p className="text-sm text-slate-600">Ask questions about your data</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </button>

                <button
                  onClick={() => navigate('/team')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Team Settings</p>
                    <p className="text-sm text-slate-600">Manage team members</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* SEA Market Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-gradient-to-r from-sunset-orange/10 to-tropical-teal/10 rounded-2xl border border-sunset-orange/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Globe className="w-6 h-6 text-sunset-orange" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                SEA Research Insights
              </h3>
              <p className="text-slate-600 mb-4">
                This month, researchers across Southeast Asia saved over 10,000 hours using Qual Engine.
                Join 500+ teams transforming qualitative research in the region.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-sunset-orange" />
                  <span className="text-sm font-medium text-slate-700">
                    #1 in Singapore
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-tropical-teal" />
                  <span className="text-sm font-medium text-slate-700">
                    95% accuracy for code-mixing
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-velocity-blue" />
                  <span className="text-sm font-medium text-slate-700">
                    10x faster than manual
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
        </div>
      )}
    </div>
  );
};

export default Dashboard;