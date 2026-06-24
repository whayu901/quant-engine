// ProjectList business logic - separated from view
import { useState } from 'react';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import type { ProjectFilters } from '../types';

export function useProjectListLogic() {
  // State management
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // React Query hooks
  const { data: projects, isLoading, error, refetch } = useProjects(filters);
  const deleteProject = useDeleteProject();

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleStatusFilter = (status?: 'active' | 'completed' | 'archived') => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProject.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => setShowCreateModal(false);

  return {
    // State
    projects,
    isLoading,
    error,
    filters,
    searchTerm,
    showCreateModal,

    // Actions
    setSearchTerm,
    handleSearch,
    handleStatusFilter,
    handleDelete,
    openCreateModal,
    closeCreateModal,
    refetch,
  };
}