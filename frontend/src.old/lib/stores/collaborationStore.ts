import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  TeamMember,
  CollaborationActivity,
  Comment,
  ActiveUser,
  UserCursor,
  UserSelection,
} from '../../types/collaboration';

interface CollaborationState {
  // Team members
  teamMembers: TeamMember[];
  currentUserRole: 'owner' | 'admin' | 'analyst' | 'viewer' | null;

  // Activity
  activities: CollaborationActivity[];
  unreadActivities: number;

  // Comments
  comments: Record<string, Comment[]>; // Indexed by target_id
  unreadComments: number;

  // Real-time collaboration
  activeUsers: ActiveUser[];
  userCursors: UserCursor[];
  userSelections: UserSelection[];

  // UI state
  showActivityPanel: boolean;
  showTeamPanel: boolean;
  showComments: boolean;
  selectedComment: Comment | null;

  // Actions
  setTeamMembers: (members: TeamMember[]) => void;
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (userId: string) => void;
  updateMemberRole: (userId: string, role: TeamMember['role']) => void;

  addActivity: (activity: CollaborationActivity) => void;
  markActivitiesRead: () => void;

  addComment: (targetId: string, comment: Comment) => void;
  updateComment: (commentId: string, content: string) => void;
  deleteComment: (targetId: string, commentId: string) => void;
  resolveComment: (commentId: string) => void;

  setActiveUsers: (users: ActiveUser[]) => void;
  updateUserCursor: (cursor: UserCursor) => void;
  updateUserSelection: (selection: UserSelection) => void;
  removeUser: (userId: string) => void;

  toggleActivityPanel: () => void;
  toggleTeamPanel: () => void;
  toggleComments: () => void;
  setSelectedComment: (comment: Comment | null) => void;

  // Clear state
  clearCollaboration: () => void;
}

const useCollaborationStore = create<CollaborationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      teamMembers: [],
      currentUserRole: null,
      activities: [],
      unreadActivities: 0,
      comments: {},
      unreadComments: 0,
      activeUsers: [],
      userCursors: [],
      userSelections: [],
      showActivityPanel: false,
      showTeamPanel: false,
      showComments: false,
      selectedComment: null,

      // Team member actions
      setTeamMembers: (members) =>
        set({ teamMembers: members }, false, 'setTeamMembers'),

      addTeamMember: (member) =>
        set(
          (state) => ({ teamMembers: [...state.teamMembers, member] }),
          false,
          'addTeamMember'
        ),

      removeTeamMember: (userId) =>
        set(
          (state) => ({
            teamMembers: state.teamMembers.filter((m) => m.user_id !== userId),
          }),
          false,
          'removeTeamMember'
        ),

      updateMemberRole: (userId, role) =>
        set(
          (state) => ({
            teamMembers: state.teamMembers.map((m) =>
              m.user_id === userId ? { ...m, role } : m
            ),
          }),
          false,
          'updateMemberRole'
        ),

      // Activity actions
      addActivity: (activity) =>
        set(
          (state) => ({
            activities: [activity, ...state.activities].slice(0, 100), // Keep last 100
            unreadActivities: state.unreadActivities + 1,
          }),
          false,
          'addActivity'
        ),

      markActivitiesRead: () =>
        set({ unreadActivities: 0 }, false, 'markActivitiesRead'),

      // Comment actions
      addComment: (targetId, comment) =>
        set(
          (state) => ({
            comments: {
              ...state.comments,
              [targetId]: [...(state.comments[targetId] || []), comment],
            },
            unreadComments: state.unreadComments + 1,
          }),
          false,
          'addComment'
        ),

      updateComment: (commentId, content) =>
        set(
          (state) => ({
            comments: Object.fromEntries(
              Object.entries(state.comments).map(([targetId, comments]) => [
                targetId,
                comments.map((c) =>
                  c.id === commentId
                    ? { ...c, content, updated_at: new Date().toISOString() }
                    : c
                ),
              ])
            ),
          }),
          false,
          'updateComment'
        ),

      deleteComment: (targetId, commentId) =>
        set(
          (state) => ({
            comments: {
              ...state.comments,
              [targetId]: state.comments[targetId]?.filter(
                (c) => c.id !== commentId
              ),
            },
          }),
          false,
          'deleteComment'
        ),

      resolveComment: (commentId) =>
        set(
          (state) => ({
            comments: Object.fromEntries(
              Object.entries(state.comments).map(([targetId, comments]) => [
                targetId,
                comments.map((c) =>
                  c.id === commentId
                    ? {
                        ...c,
                        is_resolved: true,
                        resolved_at: new Date().toISOString(),
                      }
                    : c
                ),
              ])
            ),
          }),
          false,
          'resolveComment'
        ),

      // Real-time collaboration actions
      setActiveUsers: (users) =>
        set({ activeUsers: users }, false, 'setActiveUsers'),

      updateUserCursor: (cursor) =>
        set(
          (state) => ({
            userCursors: [
              ...state.userCursors.filter((c) => c.user_id !== cursor.user_id),
              cursor,
            ],
          }),
          false,
          'updateUserCursor'
        ),

      updateUserSelection: (selection) =>
        set(
          (state) => ({
            userSelections: [
              ...state.userSelections.filter(
                (s) => s.user_id !== selection.user_id
              ),
              selection,
            ],
          }),
          false,
          'updateUserSelection'
        ),

      removeUser: (userId) =>
        set(
          (state) => ({
            activeUsers: state.activeUsers.filter((u) => u.user_id !== userId),
            userCursors: state.userCursors.filter((c) => c.user_id !== userId),
            userSelections: state.userSelections.filter(
              (s) => s.user_id !== userId
            ),
          }),
          false,
          'removeUser'
        ),

      // UI actions
      toggleActivityPanel: () =>
        set(
          (state) => ({
            showActivityPanel: !state.showActivityPanel,
            unreadActivities: state.showActivityPanel
              ? 0
              : state.unreadActivities,
          }),
          false,
          'toggleActivityPanel'
        ),

      toggleTeamPanel: () =>
        set(
          (state) => ({ showTeamPanel: !state.showTeamPanel }),
          false,
          'toggleTeamPanel'
        ),

      toggleComments: () =>
        set(
          (state) => ({
            showComments: !state.showComments,
            unreadComments: state.showComments ? 0 : state.unreadComments,
          }),
          false,
          'toggleComments'
        ),

      setSelectedComment: (comment) =>
        set({ selectedComment: comment }, false, 'setSelectedComment'),

      // Clear state
      clearCollaboration: () =>
        set(
          {
            teamMembers: [],
            currentUserRole: null,
            activities: [],
            unreadActivities: 0,
            comments: {},
            unreadComments: 0,
            activeUsers: [],
            userCursors: [],
            userSelections: [],
            showActivityPanel: false,
            showTeamPanel: false,
            showComments: false,
            selectedComment: null,
          },
          false,
          'clearCollaboration'
        ),
    }),
    {
      name: 'collaboration-storage',
    }
  )
);

export default useCollaborationStore;