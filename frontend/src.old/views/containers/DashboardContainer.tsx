/**
 * Dashboard Container - SOLID: Single Responsibility
 * Connects DashboardView to ProjectController (MVC pattern)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardView } from '../components/DashboardView';
import { Services } from '../../di/services';
import { ProjectState } from '../../controllers/ProjectController';

/**
 * Dashboard Container Component
 * SOLID: Dependency Inversion - Depends on controller abstractions
 */
export const DashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const projectController = Services.projects;
  const authController = Services.auth;

  // State from controllers
  const [projectState, setProjectState] = useState<ProjectState>(projectController.getState());
  const [authState, setAuthState] = useState(authController.getState());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribeProjects = projectController.subscribe(setProjectState);
    const unsubscribeAuth = authController.subscribe(setAuthState);

    // Load projects on mount
    projectController.loadProjects();

    return () => {
      unsubscribeProjects();
      unsubscribeAuth();
    };
  }, []);

  // Calculate metrics
  const calculateTimeSaved = () => {
    return projectState.projects.reduce((total, project) => {
      // Each analysis saves 8 hours (480 minutes) - 5 minutes = 475 minutes
      const analysisDone = project.metadata?.analysisCount || 0;
      return total + (analysisDone * 475); // minutes saved
    }, 0);
  };

  const totalTimeSaved = calculateTimeSaved();
  const totalHoursSaved = Math.floor(totalTimeSaved / 60);
  const totalMinutesSaved = totalTimeSaved % 60;

  // Recent projects (last 6)
  const recentProjects = projectState.projects
    .slice()
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6);

  // Active projects (in progress)
  const activeProjects = projectState.projects
    .filter(p => p.status === 'active')
    .length;

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

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleViewAllProjects = () => {
    navigate('/projects');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'upload':
        navigate('/upload');
        break;
      case 'analyze':
        navigate('/analyze');
        break;
      case 'report':
        navigate('/reports');
        break;
      default:
        break;
    }
  };

  // Metrics data for the view
  const metrics = {
    totalProjects: projectState.projects.length,
    activeProjects,
    timeSaved: {
      hours: totalHoursSaved,
      minutes: totalMinutesSaved,
      formatted: `${totalHoursSaved}h ${totalMinutesSaved}m`
    },
    speedUpFactor: 96, // 8 hours / 5 minutes
    transcriptsProcessed: projectState.projects.reduce(
      (total, p) => total + (p.metadata?.transcriptCount || 0),
      0
    ),
    analysesCompleted: projectState.projects.reduce(
      (total, p) => total + (p.metadata?.analysisCount || 0),
      0
    )
  };

  // Quick stats for dashboard cards
  const quickStats = [
    {
      label: 'Active Projects',
      value: activeProjects,
      change: '+12%',
      trend: 'up' as const
    },
    {
      label: 'Time Saved',
      value: metrics.timeSaved.formatted,
      change: '96x faster',
      trend: 'up' as const
    },
    {
      label: 'Analyses Done',
      value: metrics.analysesCompleted,
      change: '+23%',
      trend: 'up' as const
    },
    {
      label: 'Transcripts',
      value: metrics.transcriptsProcessed,
      change: '+18%',
      trend: 'up' as const
    }
  ];

  return (
    <DashboardView
      user={authState.user}
      projects={recentProjects}
      metrics={metrics}
      quickStats={quickStats}
      isLoading={projectState.isLoading}
      error={projectState.error}
      selectedView={selectedView}
      showCreateModal={showCreateModal}
      onViewChange={setSelectedView}
      onCreateProject={handleCreateProject}
      onProjectClick={handleProjectClick}
      onViewAllProjects={handleViewAllProjects}
      onQuickAction={handleQuickAction}
      onShowCreateModal={setShowCreateModal}
    />
  );
};