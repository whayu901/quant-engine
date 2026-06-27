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
  user: {
    id: string;
    email: string;
    name: string;
  };
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

export interface SentimentTimeline {
  timestamp: number;
  sentiment: Sentiment;
  score: number;
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

export interface ToplineReport {
  key_findings: string[];
  executive_summary: string;
  recommendations: string[];
  next_steps: string[];
}

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
