/**
 * Projects View - Pure presentation component
 * SOLID: Single Responsibility - Only handles presentation
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Grid3x3, List, Clock, Users } from 'lucide-react';
import type { Project } from '../../models/entities/Project';

interface ProjectsViewProps {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  onCreateProject: (name: string, description: string) => void;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  isLoading,
  error,
  onCreateProject,
  onSelectProject,
  onDeleteProject
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName, newProjectDescription);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateForm(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velocity-blue mx-auto mb-4"></div>
          <p className="text-slate-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600 mt-1">Manage your research projects</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-velocity-blue to-neural-purple text-white rounded-lg font-medium hover:shadow-lg transition-shadow flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-velocity-blue focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-velocity-blue text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-velocity-blue text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Project</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Coffee Sachet Research 2026"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-velocity-blue focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Brief description of your research project..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-velocity-blue focus:border-transparent"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewProjectName('');
                  setNewProjectDescription('');
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-6 py-2 bg-gradient-to-r from-velocity-blue to-neural-purple text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                Create Project
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Projects List/Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-50 rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-xl font-medium text-slate-900 mb-2">
            {searchQuery ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-slate-600">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first project to get started'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectProject(project)}
              className={`bg-white border border-slate-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all ${
                viewMode === 'list' ? 'flex items-center justify-between' : ''
              }`}
            >
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-slate-600 text-sm mb-4">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  {project.members && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{project.members.length}</span>
                    </div>
                  )}
                </div>
              </div>
              {viewMode === 'list' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  🗑️
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};