import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useCollaborationStore from '../../lib/stores/collaborationStore';
import type { UserCursor, ActiveUser } from '../../types/collaboration';
import { cn } from '../../lib/utils';

interface CollaborationCursorsProps {
  containerRef?: React.RefObject<HTMLElement>;
  viewportId: string;
  className?: string;
}

const userColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#FFD93D', // Yellow
  '#6C63FF', // Purple
  '#FF69B4', // Hot Pink
];

export function CollaborationCursors({
  containerRef,
  viewportId,
  className,
}: CollaborationCursorsProps) {
  const { userCursors, activeUsers } = useCollaborationStore();
  const cursorTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Filter cursors for this viewport
  const viewportCursors = userCursors.filter((c) => c.viewport === viewportId);

  // Get user info for cursor
  const getUserInfo = (userId: string): ActiveUser | undefined => {
    return activeUsers.find((u) => u.user_id === userId);
  };

  // Clean up stale cursors
  useEffect(() => {
    viewportCursors.forEach((cursor) => {
      const timeoutId = cursorTimeouts.current[cursor.user_id];
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Remove cursor if inactive for 5 seconds
      cursorTimeouts.current[cursor.user_id] = setTimeout(() => {
        // This would typically call an API to remove the cursor
        console.log('Removing stale cursor for user', cursor.user_id);
      }, 5000);
    });

    return () => {
      Object.values(cursorTimeouts.current).forEach(clearTimeout);
    };
  }, [viewportCursors]);

  return (
    <div className={cn('pointer-events-none', className)}>
      <AnimatePresence>
        {viewportCursors.map((cursor) => {
          const user = getUserInfo(cursor.user_id);
          if (!user) return null;

          const colorIndex = activeUsers.indexOf(user) % userColors.length;
          const color = userColors[colorIndex];

          return (
            <motion.div
              key={cursor.user_id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: cursor.x,
                top: cursor.y,
                transform: 'translate(-50%, -50%)',
              }}
              className="z-50"
            >
              {/* Cursor */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
              >
                <path
                  d="M0 0L8 14L11 11L14 8L0 0Z"
                  fill={color}
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>

              {/* User Name Label */}
              <div
                className="absolute left-4 top-0 px-2 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                style={{ backgroundColor: color }}
              >
                {user.name}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

interface CollaborationSelectionProps {
  targetId: string;
  targetType: 'cell' | 'theme' | 'insight' | 'text';
  isSelected?: boolean;
  className?: string;
}

export function CollaborationSelection({
  targetId,
  targetType,
  isSelected = false,
  className,
}: CollaborationSelectionProps) {
  const { userSelections, activeUsers } = useCollaborationStore();

  // Find selections for this target
  const targetSelections = userSelections.filter(
    (s) => s.target_id === targetId && s.target_type === targetType
  );

  // Get unique users selecting this target
  const selectingUsers = targetSelections
    .map((s) => activeUsers.find((u) => u.user_id === s.user_id))
    .filter((u): u is ActiveUser => u !== undefined);

  if (selectingUsers.length === 0 && !isSelected) return null;

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Other users' selections */}
      {selectingUsers.map((user, index) => {
        const colorIndex = activeUsers.indexOf(user) % userColors.length;
        const color = userColors[colorIndex];

        return (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 border-2 rounded"
            style={{
              borderColor: color,
              boxShadow: `0 0 0 1px ${color}40`,
              zIndex: 10 + index,
            }}
          />
        );
      })}

      {/* User avatars */}
      {selectingUsers.length > 0 && (
        <div className="absolute -top-8 left-0 flex -space-x-2">
          {selectingUsers.slice(0, 3).map((user) => {
            const colorIndex = activeUsers.indexOf(user) % userColors.length;
            const color = userColors[colorIndex];

            return (
              <motion.div
                key={user.user_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full border-2 border-white"
                  />
                ) : (
                  <div
                    className="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </motion.div>
            );
          })}
          {selectingUsers.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-gray-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
              +{selectingUsers.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Current user's selection */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 border-2 border-blue-500 rounded bg-blue-50 bg-opacity-20"
          style={{ zIndex: 20 }}
        />
      )}
    </div>
  );
}