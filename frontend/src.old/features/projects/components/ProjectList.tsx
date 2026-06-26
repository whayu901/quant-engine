// ProjectList component - View layer only, logic and styles separated
import React from 'react';
import { Plus, Search, FolderOpen } from 'lucide-react';
import { LoadingSpinner, ErrorMessage, EmptyState } from '../../../shared/components';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectCard } from './ProjectCard';
import { useProjectListLogic } from './ProjectList.logic';
import { styles, getFilterButtonStyle } from './ProjectList.styles';

export function ProjectList() {
  const {
    projects,
    isLoading,
    error,
    filters,
    searchTerm,
    showCreateModal,
    setSearchTerm,
    handleSearch,
    handleStatusFilter,
    handleDelete,
    openCreateModal,
    closeCreateModal,
    refetch,
  } = useProjectListLogic();

  // Loading state
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading projects..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        title="Failed to load projects"
        onRetry={() => refetch()}
        fullScreen
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header.wrapper}>
        <h1 className={styles.header.title}>Projects</h1>
        <p className={styles.header.subtitle}>
          Manage your research projects and transcripts
        </p>
      </div>

      {/* Actions Bar */}
      <div className={styles.actionsBar.wrapper}>
        {/* Search */}
        <form onSubmit={handleSearch} className={styles.actionsBar.searchForm}>
          <div className={styles.actionsBar.searchContainer}>
            <Search className={styles.actionsBar.searchIcon} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className={styles.actionsBar.searchInput}
            />
          </div>
        </form>

        {/* Status Filter */}
        <div className={styles.actionsBar.filterGroup}>
          <button
            onClick={() => handleStatusFilter(undefined)}
            className={getFilterButtonStyle(!filters.status)}
          >
            All
          </button>
          <button
            onClick={() => handleStatusFilter('active')}
            className={getFilterButtonStyle(filters.status === 'active')}
          >
            Active
          </button>
          <button
            onClick={() => handleStatusFilter('completed')}
            className={getFilterButtonStyle(filters.status === 'completed')}
          >
            Completed
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={openCreateModal}
          className={styles.actionsBar.createButton}
        >
          <Plus className={styles.actionsBar.createButtonIcon} />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects && projects.length > 0 ? (
        <div className={styles.projectsGrid}>
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No projects found"
          description={filters.search ? "Try adjusting your search terms" : "Create your first project to get started"}
          action={
            !filters.search ? {
              label: "Create Project",
              onClick: openCreateModal
            } : undefined
          }
        />
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={closeCreateModal}
        />
      )}
    </div>
  );
}