// ProjectCard business logic - separated from view
import { useState } from 'react';
import type { Project } from '../types';

export function useProjectCardLogic() {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu(!showMenu);
  const closeMenu = () => setShowMenu(false);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = (
    onDelete: (id: string, name: string) => void,
    project: Project
  ) => {
    closeMenu();
    onDelete(project.id, project.name);
  };

  return {
    showMenu,
    toggleMenu,
    closeMenu,
    formatDate,
    handleDelete,
  };
}