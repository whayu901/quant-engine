/**
 * Projects Container - SOLID: Single Responsibility
 * Connects ProjectsView to ProjectController (MVC pattern)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectsView } from '../components/ProjectsView';
import { Services } from '../../di/services';
import { ProjectState } from '../../controllers/ProjectController';
import { Project } from '../../models/entities/Project';

/**
 * Projects Container Component
 * SOLID: Dependency Inversion - Depends on controller abstractions
 */
export const ProjectsContainer: React.FC = () => {
  const navigate = useNavigate();
  const projectController = Services.projects;

  // State from controller
  const [projectState, setProjectState] = useState<ProjectState>(projectController.getState());
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name'>('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = projectController.subscribe(setProjectState);
    // Load projects on mount
    projectController.loadProjects();
    return unsubscribe;
  }, []);

  // Filter and sort projects
  const getFilteredProjects = (): Project[] => {
    let filtered = [...projectState.projects];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.clientName?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  // Calculate statistics
  const stats = {
    total: projectState.projects.length,
    active: projectState.projects.filter(p => p.status === 'active').length,
    completed: projectState.projects.filter(p => p.status === 'completed').length,
    draft: projectState.projects.filter(p => p.status === 'draft').length,
    totalTimeSaved: projectState.projects.reduce((total, project) => {
      const analysisDone = project.metadata?.analysisCount || 0;
      return total + (analysisDone * 475); // minutes saved per analysis
    }, 0)
  };

  // Handle actions
  const handleCreateProject = async (data: {
    name: string;
    description?: string;
    clientName?: string;
  }) => {
    try {
      await projectController.createProject(data);
      setShowCreateModal(false);
    } catch (error) {
      // Error handled in controller state
    }
  };

  const handleUpdateProject = async (projectId: string, data: Partial<Project>) => {
    try {
      await projectController.updateProject(projectId, data);
    } catch (error) {
      // Error handled in controller state
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await projectController.deleteProject(projectId);
        selectedProjects.delete(projectId);
        setSelectedProjects(new Set(selectedProjects));
      } catch (error) {
        // Error handled in controller state
      }
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    const project = projectState.projects.find(p => p.id === projectId);
    if (project) {
      try {
        await projectController.createProject({
          name: `${project.name} (Copy)`,
          description: project.description,
          clientName: project.clientName
        });
      } catch (error) {
        // Error handled in controller state
      }
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleBulkAction = async (action: 'delete' | 'archive' | 'activate') => {
    const projectIds = Array.from(selectedProjects);
    if (projectIds.length === 0) return;

    switch (action) {
      case 'delete':
        if (confirm(`Delete ${projectIds.length} projects?`)) {
          for (const id of projectIds) {
            await projectController.deleteProject(id);
          }
          setSelectedProjects(new Set());
        }
        break;
      case 'archive':
        for (const id of projectIds) {
          await projectController.updateProject(id, { status: 'archived' });
        }
        setSelectedProjects(new Set());
        break;
      case 'activate':
        for (const id of projectIds) {
          await projectController.updateProject(id, { status: 'active' });
        }
        setSelectedProjects(new Set());
        break;
    }
  };

  const handleSelectProject = (projectId: string) => {
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    setSelectedProjects(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
    }
  };

  const handleExport = () => {
    // Export selected or all projects
    const projectsToExport = selectedProjects.size > 0
      ? projectState.projects.filter(p => selectedProjects.has(p.id))
      : filteredProjects;

    const csv = [
      ['Name', 'Client', 'Status', 'Created', 'Updated', 'Transcripts', 'Analyses', 'Time Saved (min)'],
      ...projectsToExport.map(p => [
        p.name,
        p.clientName || '',
        p.status,
        p.createdAt.toLocaleDateString(),
        p.updatedAt.toLocaleDateString(),
        p.metadata?.transcriptCount || 0,
        p.metadata?.analysisCount || 0,
        (p.metadata?.analysisCount || 0) * 475
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProjectsView
      projects={filteredProjects}
      stats={stats}
      isLoading={projectState.isLoading}
      error={projectState.error}
      viewMode={viewMode}
      filterStatus={filterStatus}
      sortBy={sortBy}
      searchQuery={searchQuery}
      selectedProjects={selectedProjects}
      showCreateModal={showCreateModal}
      onViewModeChange={setViewMode}
      onFilterChange={setFilterStatus}
      onSortChange={setSortBy}
      onSearchChange={setSearchQuery}
      onSelectProject={handleSelectProject}
      onSelectAll={handleSelectAll}
      onProjectClick={handleProjectClick}
      onCreateProject={handleCreateProject}
      onUpdateProject={handleUpdateProject}
      onDeleteProject={handleDeleteProject}
      onDuplicateProject={handleDuplicateProject}
      onBulkAction={handleBulkAction}
      onExport={handleExport}
      onShowCreateModal={setShowCreateModal}
    />
  );
};