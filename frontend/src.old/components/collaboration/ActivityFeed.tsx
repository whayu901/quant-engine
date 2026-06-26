import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  FileText,
  MessageSquare,
  UserPlus,
  Edit,
  Trash,
  TrendingUp,
  Lightbulb,
  X,
  Bell,
  BellOff,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import useCollaborationStore from '../../lib/stores/collaborationStore';
import type { CollaborationActivity } from '../../types/collaboration';
import { formatRelativeTime } from '../../lib/utils/format';
import { cn } from '../../lib/utils';

interface ActivityFeedProps {
  projectId: string;
  maxItems?: number;
  className?: string;
}

const actionIcons = {
  created: FileText,
  updated: Edit,
  deleted: Trash,
  commented: MessageSquare,
  invited: UserPlus,
  analyzed: TrendingUp,
};

const actionColors = {
  created: 'text-green-500 bg-green-50',
  updated: 'text-blue-500 bg-blue-50',
  deleted: 'text-red-500 bg-red-50',
  commented: 'text-purple-500 bg-purple-50',
  invited: 'text-amber-500 bg-amber-50',
  analyzed: 'text-indigo-500 bg-indigo-50',
};

export function ActivityFeed({ projectId, maxItems = 50, className }: ActivityFeedProps) {
  const {
    activities,
    unreadActivities,
    showActivityPanel,
    toggleActivityPanel,
    markActivitiesRead,
  } = useCollaborationStore();

  const feedRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = React.useState(false);

  // Mark as read when panel opens
  useEffect(() => {
    if (showActivityPanel && unreadActivities > 0) {
      const timer = setTimeout(() => {
        markActivitiesRead();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showActivityPanel, unreadActivities, markActivitiesRead]);

  // Auto-scroll to new activities
  useEffect(() => {
    if (feedRef.current && activities.length > 0) {
      feedRef.current.scrollTop = 0;
    }
  }, [activities.length]);

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <>
      {/* Activity Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleActivityPanel}
        className="relative"
      >
        <Activity className="h-4 w-4 mr-2" />
        Activity
        {unreadActivities > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadActivities > 9 ? '9+' : unreadActivities}
          </span>
        )}
      </Button>

      {/* Activity Panel */}
      <AnimatePresence>
        {showActivityPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={toggleActivityPanel}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className={cn(
                'absolute right-0 top-12 w-96 max-h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50',
                'flex flex-col',
                className
              )}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-700" />
                    <h3 className="font-semibold">Team Activity</h3>
                    {unreadActivities > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                        {unreadActivities} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMuted(!muted)}
                      className="h-8 w-8 p-0"
                      title={muted ? 'Unmute notifications' : 'Mute notifications'}
                    >
                      {muted ? (
                        <BellOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleActivityPanel}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Activity Feed */}
              <div
                ref={feedRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {displayedActivities.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No team activity yet</p>
                    <p className="text-sm mt-1">
                      Activities will appear here as your team works
                    </p>
                  </div>
                ) : (
                  displayedActivities.map((activity, index) => {
                    const Icon = actionIcons[activity.action];
                    const colorClass = actionColors[activity.action];
                    const isNew = index < unreadActivities;

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'relative pl-10',
                          isNew && 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-500 before:rounded-full'
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            'absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center',
                            colorClass
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          {/* User Info */}
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {activity.user_avatar ? (
                                <img
                                  src={activity.user_avatar}
                                  alt={activity.user_name}
                                  className="h-5 w-5 rounded-full"
                                />
                              ) : (
                                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs">
                                  {activity.user_name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-medium text-sm">
                                {activity.user_name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatRelativeTime(activity.timestamp)}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600">
                            {activity.description}
                          </p>

                          {/* Target */}
                          {activity.target_name && (
                            <div className="mt-2 flex items-center gap-1">
                              <span className="text-xs text-gray-400">in</span>
                              <span className="text-xs font-medium text-gray-700 bg-white px-2 py-0.5 rounded">
                                {activity.target_name}
                              </span>
                            </div>
                          )}

                          {/* Special metadata */}
                          {activity.metadata && (
                            <div className="mt-2">
                              {activity.metadata.time_saved && (
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                  <Lightbulb className="h-3 w-3" />
                                  Saved {activity.metadata.time_saved} hours
                                </div>
                              )}
                              {activity.metadata.insights_found && (
                                <div className="flex items-center gap-1 text-xs text-purple-600">
                                  <TrendingUp className="h-3 w-3" />
                                  Found {activity.metadata.insights_found} insights
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Load More */}
              {activities.length > maxItems && (
                <div className="p-3 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-sm"
                    onClick={() => {/* Load more logic */}}
                  >
                    View all activity
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}