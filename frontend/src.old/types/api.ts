// API Response Types for Qual Engine

// Base Response Types
export interface SuccessResponse<T = any> {
  status: 'success';
  data: T;
  message?: string;
}

export interface ErrorResponse {
  status: 'error';
  error: string;
  detail?: Record<string, any>;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export type APIResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  organization_name?: string;
  role?: string;
  country?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  organization: Organization;
  language_preference?: LanguageCode;
  timezone?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  email_verified: boolean;
}

export type UserRole = 'admin' | 'analyst' | 'viewer' | 'owner';

// Organization Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: SubscriptionPlan;
  country?: string;
  industry?: string;
  size?: string;
  created_at: string;
  updated_at: string;
  settings?: OrganizationSettings;
}

export interface OrganizationSettings {
  default_language: LanguageCode;
  data_residency?: DataResidency;
  compliance?: ComplianceSettings;
  branding?: BrandingSettings;
}

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise' | 'trial';
export type DataResidency = 'singapore' | 'jakarta' | 'bangkok' | 'auto';

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: ProjectStatus;
  settings: ProjectSettings;
  stats?: ProjectStats;
  collaborators?: Collaborator[];
  tags?: string[];
}

export type ProjectStatus = 'active' | 'archived' | 'completed';

export interface ProjectSettings {
  languages: LanguageCode[];
  auto_transcribe: boolean;
  auto_analyze: boolean;
  share_settings?: ShareSettings;
}

export interface ProjectStats {
  transcript_count: number;
  analysis_count: number;
  total_duration_minutes: number;
  time_saved_minutes: number;
  last_activity?: string;
}

export interface Collaborator {
  user_id: string;
  user: User;
  role: CollaboratorRole;
  added_at: string;
}

export type CollaboratorRole = 'owner' | 'editor' | 'viewer';

// Transcript Types
export interface Transcript {
  id: string;
  project_id: string;
  name: string;
  file_url?: string;
  status: TranscriptStatus;
  duration_seconds?: number;
  language_detected?: LanguageCode[];
  has_code_mixing?: boolean;
  speaker_count?: number;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  segments?: TranscriptSegment[];
  metadata?: TranscriptMetadata;
}

export type TranscriptStatus = 'uploading' | 'processing' | 'completed' | 'failed';

export interface TranscriptSegment {
  id: string;
  transcript_id: string;
  speaker: string;
  text: string;
  translated_text?: string;
  start_time: number;
  end_time: number;
  confidence?: number;
  language?: LanguageCode;
  sentiment?: Sentiment;
}

export interface TranscriptMetadata {
  file_name?: string;
  file_size?: number;
  file_type?: string;
  recording_date?: string;
  location?: string;
  participants?: string[];
}

// Analysis Types
export interface Analysis {
  id: string;
  transcript_id: string;
  project_id: string;
  type: AnalysisType;
  status: AnalysisStatus;
  created_at: string;
  completed_at?: string;
  results?: AnalysisResults;
  confidence?: number;
}

export type AnalysisType = 'themes' | 'sentiment' | 'summary' | 'grid' | 'topline';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalysisResults {
  themes?: Theme[];
  sentiment?: SentimentAnalysis;
  summary?: string;
  insights?: Insight[];
  grid?: AnalysisGrid;
  topline?: ToplineReport;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  evidence: Evidence[];
  frequency: number;
  sentiment?: Sentiment;
  confidence: number;
  color?: string;
}

export interface Evidence {
  segment_id: string;
  text: string;
  speaker: string;
  timestamp: number;
  confidence: number;
}

export interface SentimentAnalysis {
  overall: Sentiment;
  distribution: SentimentDistribution;
  timeline?: SentimentTimeline[];
}

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed';

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  evidence: Evidence[];
  importance: 'high' | 'medium' | 'low';
  confidence: number;
}

export type InsightType = 'finding' | 'recommendation' | 'question' | 'pattern';

// Chat Types
export interface ChatSession {
  id: string;
  project_id?: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  context?: ChatContext;
}

export interface ChatContext {
  scope: 'project' | 'transcript' | 'knowledge_base';
  resource_ids?: string[];
  language?: LanguageCode;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  citations?: Citation[];
  metadata?: MessageMetadata;
}

export interface Citation {
  id: string;
  source_type: 'transcript' | 'analysis' | 'document';
  source_id: string;
  text: string;
  timestamp?: number;
  confidence?: number;
}

export interface MessageMetadata {
  tokens_used?: number;
  processing_time_ms?: number;
  model_used?: string;
}

// Survey Types (Phase 2)
export interface Survey {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  questions: Question[];
  status: 'draft' | 'active' | 'closed';
  created_at: string;
  responses_count?: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  required: boolean;
  order: number;
}

export type QuestionType = 'text' | 'single_choice' | 'multiple_choice' | 'scale' | 'matrix';

// Media Types
export interface MediaFile {
  id: string;
  project_id: string;
  type: 'audio' | 'video' | 'document';
  name: string;
  url: string;
  size_bytes: number;
  duration_seconds?: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  created_at: string;
  metadata?: MediaMetadata;
}

export interface MediaMetadata {
  format?: string;
  codec?: string;
  bitrate?: number;
  sample_rate?: number;
  channels?: number;
  width?: number;
  height?: number;
}

// Collaboration Types
export interface Team {
  id: string;
  organization_id: string;
  name: string;
  members: TeamMember[];
  created_at: string;
}

export interface TeamMember {
  user_id: string;
  user: User;
  role: TeamRole;
  joined_at: string;
  permissions: Permission[];
}

export type TeamRole = 'admin' | 'manager' | 'member';

export interface Permission {
  resource: string;
  action: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export type NotificationType =
  | 'transcript_ready'
  | 'analysis_complete'
  | 'collaboration_invite'
  | 'mention'
  | 'system';

// WebSocket Types
export interface WebSocketMessage {
  type: WebSocketEventType;
  payload: any;
  timestamp: string;
}

export type WebSocketEventType =
  | 'transcription.progress'
  | 'transcription.complete'
  | 'analysis.progress'
  | 'analysis.complete'
  | 'chat.message'
  | 'collaboration.update'
  | 'presence.update';

export interface ProgressUpdate {
  task_id: string;
  progress: number;
  message?: string;
  estimated_time_remaining?: number;
}

// Utility Types
export type LanguageCode = 'en' | 'id' | 'ms' | 'th' | 'vi' | 'tl' | 'zh' | 'ta' | 'hi';

export interface ComplianceSettings {
  pdpa_enabled?: boolean;
  gdpr_enabled?: boolean;
  data_retention_days?: number;
  audit_logging?: boolean;
}

export interface BrandingSettings {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  custom_domain?: string;
}

export interface ShareSettings {
  public_access?: boolean;
  password_protected?: boolean;
  expiry_date?: string;
  allowed_domains?: string[];
}

// Analysis Grid Types
export interface AnalysisGrid {
  id: string;
  name: string;
  rows: GridRow[];
  columns: GridColumn[];
  cells: GridCell[];
  created_at: string;
  updated_at: string;
}

export interface GridRow {
  id: string;
  label: string;
  order: number;
}

export interface GridColumn {
  id: string;
  label: string;
  type: 'theme' | 'category' | 'metric';
  order: number;
}

export interface GridCell {
  row_id: string;
  column_id: string;
  content: string;
  evidence?: Evidence[];
  sentiment?: Sentiment;
  count?: number;
}

// Export Types
export interface ExportRequest {
  format: ExportFormat;
  include_sections: ExportSection[];
  language?: LanguageCode;
  branding?: boolean;
}

export type ExportFormat = 'pdf' | 'docx' | 'xlsx' | 'pptx';

export type ExportSection =
  | 'summary'
  | 'themes'
  | 'sentiment'
  | 'quotes'
  | 'grid'
  | 'statistics'
  | 'recommendations';

// Time Tracking Types
export interface TimeTracking {
  project_id: string;
  total_time_saved_minutes: number;
  manual_time_estimate_minutes: number;
  actual_time_minutes: number;
  efficiency_percentage: number;
  last_updated: string;
}

// Billing Types
export interface UsageStats {
  organization_id: string;
  period: string;
  minutes_used: number;
  minutes_limit: number;
  analyses_used: number;
  analyses_limit: number;
  storage_used_gb: number;
  storage_limit_gb: number;
  users_active: number;
  users_limit: number;
}

export interface Invoice {
  id: string;
  organization_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  period_start: string;
  period_end: string;
  due_date: string;
  paid_at?: string;
  invoice_url?: string;
}