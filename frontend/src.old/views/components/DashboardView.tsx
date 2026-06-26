/**
 * Dashboard View - SOLID: Interface Segregation
 * Pure presentation component for dashboard
 */

import React from 'react';
import { User } from '../../models/entities/User';
import { Project } from '../../models/entities/Project';
import {
  LayoutGrid, Plus, TrendingUp, Clock, FileText,
  BarChart3, Users, Zap, ArrowRight, Calendar,
  Activity, Target, Award, Globe, List
} from 'lucide-react';

// ISP: Segregated interfaces
export interface DashboardViewProps {
  user: User | null;
  projects: Project[];
  metrics: {
    totalProjects: number;
    activeProjects: number;
    timeSaved: {
      hours: number;
      minutes: number;
      formatted: string;
    };
    speedUpFactor: number;
    transcriptsProcessed: number;
    analysesCompleted: number;
  };
  quickStats: Array<{
    label: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  isLoading: boolean;
  error: string | null;
  selectedView: 'grid' | 'list';
  showCreateModal: boolean;
  onViewChange: (view: 'grid' | 'list') => void;
  onCreateProject: (data: { name: string; description?: string; clientName?: string }) => void;
  onProjectClick: (projectId: string) => void;
  onViewAllProjects: () => void;
  onQuickAction: (action: string) => void;
  onShowCreateModal: (show: boolean) => void;
}

/**
 * Dashboard View Component
 * Pure presentation - NO business logic
 */
export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  projects,
  metrics,
  quickStats,
  isLoading,
  error,
  selectedView,
  showCreateModal,
  onViewChange,
  onCreateProject,
  onProjectClick,
  onViewAllProjects,
  onQuickAction,
  onShowCreateModal
}) => {
  if (isLoading && projects.length === 0) {
    return (
      <div className="dashboard-loading">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="text-red-600 text-center py-8">
          <p className="text-lg font-semibold">Error loading dashboard</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      {/* Header */}
      <div className="dashboard-header mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'Researcher'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Transform qualitative data 96x faster with AI-powered analysis
            </p>
          </div>
          <button
            onClick={() => onShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>
      </div>

      {/* Time Saved Banner */}
      <div className="time-saved-banner bg-gradient-to-r from-velocity-blue to-neural-purple text-white rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Total Time Saved</p>
            <p className="text-4xl font-bold">{metrics.timeSaved.formatted}</p>
            <p className="text-sm opacity-90 mt-1">
              That's {metrics.speedUpFactor}x faster than traditional methods!
            </p>
          </div>
          <div className="text-right">
            <Zap size={48} className="text-yellow-300" />
            <p className="text-xs opacity-75 mt-2">8 hours → 5 minutes</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="stat-card bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className={`text-xs mt-2 ${
                  stat.trend === 'up' ? 'text-green-600' :
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </p>
              </div>
              <TrendingUp
                size={20}
                className={stat.trend === 'up' ? 'text-green-600' : 'text-gray-400'}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onQuickAction('upload')}
            className="action-card p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <FileText size={24} className="text-velocity-blue mb-2" />
            <p className="font-medium">Upload Transcripts</p>
            <p className="text-sm text-gray-600">Process new interview data</p>
          </button>
          <button
            onClick={() => onQuickAction('analyze')}
            className="action-card p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <BarChart3 size={24} className="text-neural-purple mb-2" />
            <p className="font-medium">Start Analysis</p>
            <p className="text-sm text-gray-600">AI-powered insights</p>
          </button>
          <button
            onClick={() => onQuickAction('report')}
            className="action-card p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <Award size={24} className="text-green-600 mb-2" />
            <p className="font-medium">Generate Report</p>
            <p className="text-sm text-gray-600">Export findings</p>
          </button>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="recent-projects">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <div className="flex items-center gap-4">
            <div className="view-toggle flex gap-2">
              <button
                onClick={() => onViewChange('grid')}
                className={`p-2 rounded ${selectedView === 'grid' ? 'bg-gray-200' : ''}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => onViewChange('list')}
                className={`p-2 rounded ${selectedView === 'list' ? 'bg-gray-200' : ''}`}
              >
                <List size={20} />
              </button>
            </div>
            <button
              onClick={onViewAllProjects}
              className="text-velocity-blue hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state text-center py-12 bg-gray-50 rounded-lg">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No projects yet</p>
            <button
              onClick={() => onShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className={`projects-${selectedView} ${
            selectedView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'
          }`}>
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                view={selectedView}
                onClick={() => onProjectClick(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => onShowCreateModal(false)}
          onCreate={onCreateProject}
        />
      )}
    </div>
  );
};

/**
 * Project Card Component
 */
const ProjectCard: React.FC<{
  project: Project;
  view: 'grid' | 'list';
  onClick: () => void;
}> = ({ project, view, onClick }) => {
  const timeSaved = (project.metadata?.analysisCount || 0) * 475; // minutes
  const hours = Math.floor(timeSaved / 60);
  const minutes = timeSaved % 60;

  if (view === 'list') {
    return (
      <div
        onClick={onClick}
        className="project-card-list bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{project.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText size={14} />
                {project.metadata?.transcriptCount || 0} transcripts
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 size={14} />
                {project.metadata?.analysisCount || 0} analyses
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {hours}h {minutes}m saved
              </span>
            </div>
          </div>
          <ArrowRight size={20} className="text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="project-card-grid bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`status-badge px-2 py-1 rounded text-xs font-medium ${
          project.status === 'active' ? 'bg-green-100 text-green-700' :
          project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {project.status}
        </div>
        <Globe size={16} className="text-gray-400" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-500">Transcripts</p>
            <p className="font-semibold">{project.metadata?.transcriptCount || 0}</p>
          </div>
          <div>
            <p className="text-gray-500">Analyses</p>
            <p className="font-semibold">{project.metadata?.analysisCount || 0}</p>
          </div>
          <div className="col-span-2 mt-2">
            <p className="text-gray-500">Time Saved</p>
            <p className="font-semibold text-velocity-blue">{hours}h {minutes}m</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Create Project Modal Component
 */
const CreateProjectModal: React.FC<{
  onClose: () => void;
  onCreate: (data: { name: string; description?: string; clientName?: string }) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [clientName, setClientName] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        clientName: clientName.trim() || undefined
      });
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="modal-content bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-velocity-blue"
              placeholder="e.g., Customer Satisfaction Study Q1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-velocity-blue"
              placeholder="Brief description of the project..."
              rows={3}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-velocity-blue"
              placeholder="e.g., Acme Corp"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-velocity-blue text-white rounded-md hover:bg-opacity-90"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};