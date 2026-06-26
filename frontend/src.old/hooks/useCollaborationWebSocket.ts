import { useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import useCollaborationStore from '../lib/stores/collaborationStore';
import useAuthStore from '../lib/stores/authStore';
import type {
  TeamMember,
  CollaborationActivity,
  Comment,
  ActiveUser,
  UserCursor,
  UserSelection,
} from '../types/collaboration';

interface CollaborationMessage {
  type:
    | 'user_joined'
    | 'user_left'
    | 'cursor_update'
    | 'selection_update'
    | 'activity'
    | 'comment_added'
    | 'comment_updated'
    | 'comment_deleted'
    | 'member_added'
    | 'member_removed'
    | 'member_role_changed'
    | 'sync_state';
  payload: any;
  user_id?: string;
  timestamp: string;
}

export function useCollaborationWebSocket(projectId: string | null) {
  const { user } = useAuthStore();
  const {
    setActiveUsers,
    updateUserCursor,
    updateUserSelection,
    removeUser,
    addActivity,
    addComment,
    updateComment,
    deleteComment,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    setTeamMembers,
  } = useCollaborationStore();

  const wsUrl = projectId ? `/ws/collaboration/${projectId}` : null;
  const { lastMessage, sendMessage, connectionStatus } = useWebSocket(wsUrl);

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;

    try {
      const message: CollaborationMessage = JSON.parse(lastMessage.data);

      switch (message.type) {
        case 'user_joined':
          const newUser = message.payload as ActiveUser;
          setActiveUsers((prev: ActiveUser[]) => {
            if (!prev.find((u) => u.user_id === newUser.user_id)) {
              return [...prev, newUser];
            }
            return prev;
          });
          break;

        case 'user_left':
          removeUser(message.payload.user_id);
          break;

        case 'cursor_update':
          const cursor = message.payload as UserCursor;
          if (cursor.user_id !== user?.id) {
            updateUserCursor(cursor);
          }
          break;

        case 'selection_update':
          const selection = message.payload as UserSelection;
          if (selection.user_id !== user?.id) {
            updateUserSelection(selection);
          }
          break;

        case 'activity':
          const activity = message.payload as CollaborationActivity;
          addActivity(activity);
          break;

        case 'comment_added':
          const { target_id, comment } = message.payload;
          addComment(target_id, comment as Comment);
          break;

        case 'comment_updated':
          const { comment_id, content } = message.payload;
          updateComment(comment_id, content);
          break;

        case 'comment_deleted':
          const { target_id: targetId, comment_id: commentId } = message.payload;
          deleteComment(targetId, commentId);
          break;

        case 'member_added':
          addTeamMember(message.payload as TeamMember);
          break;

        case 'member_removed':
          removeTeamMember(message.payload.user_id);
          break;

        case 'member_role_changed':
          const { user_id, role } = message.payload;
          updateMemberRole(user_id, role);
          break;

        case 'sync_state':
          // Full state sync when joining
          const { team_members, active_users, recent_activities } = message.payload;
          if (team_members) setTeamMembers(team_members);
          if (active_users) setActiveUsers(active_users);
          if (recent_activities) {
            recent_activities.forEach((activity: CollaborationActivity) => {
              addActivity(activity);
            });
          }
          break;
      }
    } catch (error) {
      console.error('Failed to parse collaboration message:', error);
    }
  }, [lastMessage]);

  // Send cursor position
  const sendCursorPosition = useCallback(
    (x: number, y: number, viewport: string) => {
      if (!user) return;

      const message: CollaborationMessage = {
        type: 'cursor_update',
        payload: {
          user_id: user.id,
          x,
          y,
          viewport,
        },
        timestamp: new Date().toISOString(),
      };

      sendMessage(message);
    },
    [user, sendMessage]
  );

  // Send selection update
  const sendSelection = useCallback(
    (
      targetId: string,
      targetType: UserSelection['target_type'],
      range?: { start: number; end: number }
    ) => {
      if (!user) return;

      const message: CollaborationMessage = {
        type: 'selection_update',
        payload: {
          user_id: user.id,
          target_id: targetId,
          target_type: targetType,
          range,
        },
        timestamp: new Date().toISOString(),
      };

      sendMessage(message);
    },
    [user, sendMessage]
  );

  // Send activity
  const sendActivity = useCallback(
    (activity: Partial<CollaborationActivity>) => {
      if (!user || !projectId) return;

      const message: CollaborationMessage = {
        type: 'activity',
        payload: {
          ...activity,
          id: `activity-${Date.now()}`,
          project_id: projectId,
          user_id: user.id,
          user_name: user.name || user.email,
          user_avatar: user.avatar_url,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      sendMessage(message);
    },
    [user, projectId, sendMessage]
  );

  // Send comment
  const sendComment = useCallback(
    (
      targetId: string,
      targetType: Comment['target_type'],
      content: string,
      parentId?: string
    ) => {
      if (!user || !projectId) return;

      const comment: Comment = {
        id: `comment-${Date.now()}`,
        project_id: projectId,
        user_id: user.id,
        user_name: user.name || user.email,
        user_avatar: user.avatar_url,
        content,
        target_type: targetType,
        target_id: targetId,
        parent_id: parentId,
        created_at: new Date().toISOString(),
        reactions: [],
      };

      const message: CollaborationMessage = {
        type: 'comment_added',
        payload: {
          target_id: targetId,
          comment,
        },
        timestamp: new Date().toISOString(),
      };

      sendMessage(message);
      return comment;
    },
    [user, projectId, sendMessage]
  );

  // Notify when user joins/leaves
  useEffect(() => {
    if (connectionStatus === 'open' && user) {
      // Send join message
      const joinMessage: CollaborationMessage = {
        type: 'user_joined',
        payload: {
          user_id: user.id,
          name: user.name || user.email,
          avatar: user.avatar_url,
          color: '#0A7AFF', // Could be dynamic
          last_seen: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
      sendMessage(joinMessage);

      // Setup leave handler
      return () => {
        const leaveMessage: CollaborationMessage = {
          type: 'user_left',
          payload: { user_id: user.id },
          timestamp: new Date().toISOString(),
        };
        sendMessage(leaveMessage);
      };
    }
  }, [connectionStatus, user, sendMessage]);

  return {
    connectionStatus,
    sendCursorPosition,
    sendSelection,
    sendActivity,
    sendComment,
  };
}