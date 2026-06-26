/**
 * Types for team collaboration features
 */

export interface TeamMember {
  id: string;
  user_id: string;
  project_id: string;
  role: 'owner' | 'admin' | 'analyst' | 'viewer';
  email: string;
  name: string;
  avatar_url?: string;
  joined_at: string;
  last_active?: string;
  is_online?: boolean;
  permissions: TeamPermissions;
}

export interface TeamPermissions {
  can_edit: boolean;
  can_delete: boolean;
  can_invite: boolean;
  can_export: boolean;
  can_analyze: boolean;
  can_comment: boolean;
}

export interface TeamInvite {
  id: string;
  project_id: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  invited_by: string;
  invited_at: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  token: string;
}

export interface CollaborationActivity {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  action: 'created' | 'updated' | 'deleted' | 'commented' | 'invited' | 'analyzed';
  target_type: 'project' | 'transcript' | 'analysis' | 'theme' | 'insight' | 'comment';
  target_id: string;
  target_name: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  target_type: 'analysis' | 'theme' | 'insight' | 'transcript';
  target_id: string;
  parent_id?: string; // For threaded comments
  created_at: string;
  updated_at?: string;
  is_resolved?: boolean;
  resolved_by?: string;
  resolved_at?: string;
  mentions?: string[]; // User IDs mentioned in comment
  reactions?: CommentReaction[];
}

export interface CommentReaction {
  user_id: string;
  user_name: string;
  emoji: string;
  created_at: string;
}

export interface CollaborationSession {
  id: string;
  project_id: string;
  active_users: ActiveUser[];
  cursors: UserCursor[];
  selections: UserSelection[];
}

export interface ActiveUser {
  user_id: string;
  name: string;
  avatar?: string;
  color: string; // For cursor/selection color
  last_seen: string;
  current_view?: string; // Which page/section they're viewing
}

export interface UserCursor {
  user_id: string;
  x: number;
  y: number;
  viewport: string; // Which component/area
}

export interface UserSelection {
  user_id: string;
  target_type: 'cell' | 'theme' | 'insight' | 'text';
  target_id: string;
  range?: { start: number; end: number }; // For text selection
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  mentions: boolean;
  comments: boolean;
  invites: boolean;
  activity_digest: 'realtime' | 'hourly' | 'daily' | 'never';
}

export interface TeamAnalytics {
  project_id: string;
  total_members: number;
  active_members_today: number;
  active_members_week: number;
  total_comments: number;
  total_analyses: number;
  average_time_saved: number;
  collaboration_score: number; // 0-100
  top_contributors: TeamContributor[];
  activity_timeline: ActivityTimepoint[];
}

export interface TeamContributor {
  user_id: string;
  name: string;
  avatar?: string;
  contributions: number;
  analyses_created: number;
  comments_made: number;
  time_saved: number;
}

export interface ActivityTimepoint {
  date: string;
  activities: number;
  active_users: number;
  analyses: number;
  comments: number;
}