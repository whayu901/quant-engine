import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Clock, FileText, Users, Calendar, TrendingUp,
  BarChart3, MessageSquare, MoreVertical, Archive,
  Share2, Trash2
} from 'lucide-react';
import { Project } from '../../types/api';
import { TimeSavedBadge } from '../../components/ui/TimeSavedBadge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';

interface ProjectCardProps {
  project: Project;
  onUpdate?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onUpdate,
  onDelete,
  className
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const timeSaved = project.stats?.time_saved_minutes || 0;
  const hours = Math.floor(timeSaved / 60);
  const minutes = timeSaved % 60;

  const handleArchive = () => {
    if (onUpdate) {
      onUpdate({ ...project, status: 'archived' });
    }
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this project?')) {
      onDelete(project.id);
    }
    setShowMenu(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200',
        'hover:shadow-lg transition-all duration-200',
        className
      )}
    >
      {/* Status Badge */}
      {project.status === 'archived' && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        </div>
      )}

      {/* Project Header */}
      <div className="flex items-start justify-between mb-4">
        <Link
          to={`/projects/${project.id}`}
          className="flex-1 group"
        >
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-velocity-blue transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </Link>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-slate-500" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-10"
            >
              <div className="py-1">
                <button
                  onClick={() => setShowMenu(false)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Share2 className="w-4 h-4" />
                  Share Project
                </button>
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Archive className="w-4 h-4" />
                  {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                </button>
                <hr className="my-1 border-slate-200" />
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Time Saved Badge */}
      {timeSaved > 0 && (
        <div className="mb-4">
          <TimeSavedBadge
            hours={hours}
            minutes={minutes}
            variant="default"
            animated={false}
          />
        </div>
      )}

      {/* Project Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-medium">
            {project.stats?.transcript_count || 0}
          </span>
          <span className="text-slate-500">transcripts</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-medium">
            {project.stats?.analysis_count || 0}
          </span>
          <span className="text-slate-500">analyses</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-medium">
            {Math.round((project.stats?.total_duration_minutes || 0) / 60)}h
          </span>
          <span className="text-slate-500">audio</span>
        </div>
      </div>

      {/* Collaborators */}
      {project.collaborators && project.collaborators.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {project.collaborators.slice(0, 3).map((collaborator, index) => (
              <div
                key={collaborator.user_id}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-velocity-blue to-neural-purple flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                style={{ zIndex: 3 - index }}
              >
                {collaborator.user.full_name.charAt(0).toUpperCase()}
              </div>
            ))}
            {project.collaborators.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-medium border-2 border-white">
                +{project.collaborators.length - 3}
              </div>
            )}
          </div>
          <span className="text-sm text-slate-500">
            {project.collaborators.length} {project.collaborators.length === 1 ? 'member' : 'members'}
          </span>
        </div>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          <span>
            Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
          </span>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-velocity-blue hover:text-velocity-blue-dark transition-colors"
        >
          Open
          <TrendingUp className="w-4 h-4" />
        </Link>
      </div>

      {/* Progress Indicator (if processing) */}
      {project.stats?.transcript_count === 0 && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-velocity-blue/10 to-neural-purple/10 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-velocity-blue" />
            </div>
            <p className="text-slate-900 font-medium mb-1">No transcripts yet</p>
            <p className="text-sm text-slate-600">Upload your first recording to get started</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};