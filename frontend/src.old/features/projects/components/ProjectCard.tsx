// ProjectCard component - View layer only, logic and styles separated
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, Film, MoreVertical, Trash2, Edit } from 'lucide-react';
import type { Project } from '../types';
import { useProjectCardLogic } from './ProjectCard.logic';
import { styles, getStatusBadgeStyle } from './ProjectCard.styles';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string, name: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const {
    showMenu,
    toggleMenu,
    closeMenu,
    formatDate,
    handleDelete,
  } = useProjectCardLogic();

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        {/* Header */}
        <div className={styles.header.wrapper}>
          <Link
            to={`/research/projects/${project.id}`}
            className={styles.header.titleLink}
          >
            <h3 className={styles.header.title}>
              {project.name}
            </h3>
          </Link>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={toggleMenu}
              className={styles.menu.button}
            >
              <MoreVertical className={styles.menu.icon} />
            </button>

            {showMenu && (
              <>
                <div
                  className={styles.menu.backdrop}
                  onClick={closeMenu}
                />
                <div className={styles.menu.dropdown}>
                  <Link
                    to={`/research/projects/${project.id}/edit`}
                    className={`${styles.menu.item.base} ${styles.menu.item.edit}`}
                    onClick={closeMenu}
                  >
                    <Edit className={styles.menu.itemIcon} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(onDelete, project)}
                    className={`${styles.menu.item.base} ${styles.menu.item.delete}`}
                  >
                    <Trash2 className={styles.menu.itemIcon} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className={styles.status.wrapper}>
          <span className={getStatusBadgeStyle(project.status)}>
            {project.status}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className={styles.description}>
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className={styles.stats.grid}>
          <div className={styles.stats.item}>
            <FileText className={styles.stats.icon} />
            {project.transcript_count || 0} transcripts
          </div>
          <div className={styles.stats.item}>
            <Film className={styles.stats.icon} />
            {project.clip_count || 0} clips
          </div>
          <div className={styles.stats.item}>
            <Users className={styles.stats.icon} />
            {project.participant_count || 0} participants
          </div>
          <div className={styles.stats.item}>
            <Calendar className={styles.stats.icon} />
            {formatDate(project.created_at)}
          </div>
        </div>

        {/* View Button */}
        <Link
          to={`/research/projects/${project.id}`}
          className={styles.viewButton}
        >
          View Project
        </Link>
      </div>
    </div>
  );
}