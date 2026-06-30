// Fieldwork QC domain types — shapes mirror the backend
// (app/schemas_fieldwork.py). Fields are snake_case like the rest of types/api.ts.

export type BatchStatus =
  | 'pending' | 'importing' | 'running' | 'completed' | 'failed';

export type QcStatus =
  | 'pending' | 'pass' | 'flag' | 'review' | 'reject';

export type FlagSeverity = 'info' | 'warn' | 'critical';
export type FlagStatus = 'open' | 'confirmed' | 'dismissed';

export interface GpsBbox {
  lat_min: number;
  lat_max: number;
  lng_min: number;
  lng_max: number;
}

export interface BatchResultSummary {
  interviews: number;
  by_check: Record<string, number>;
  by_status: Record<string, number>;
  flags_total: number;
}

export interface FieldworkBatch {
  id: string;
  org_id: string;
  project_id: string;
  market_id?: string | null;
  integration_id?: string | null;
  name: string;
  source: string;
  status: BatchStatus;
  rules?: Record<string, unknown> | null;
  result_summary?: BatchResultSummary | null;
  created_at: string;
  completed_at?: string | null;
}

export interface Interview {
  id: string;
  org_id: string;
  project_id: string;
  batch_id: string;
  external_id?: string | null;
  interviewer_id?: string | null;
  respondent_ref?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  duration_sec?: number | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  audio_ref?: string | null;
  media_id?: string | null;
  answers?: Record<string, unknown> | null;
  qc_status: QcStatus;
  qc_score?: number | null;
  created_at: string;
}

export interface QCFlag {
  id: string;
  interview_id: string;
  batch_id: string;
  check: string;
  severity: FlagSeverity;
  detail?: Record<string, unknown> | null;
  status: FlagStatus;
  reviewer_id?: string | null;
  created_at: string;
}

export interface InterviewDetail extends Interview {
  flags: QCFlag[];
}

export interface InterviewerScore {
  id: string;
  batch_id: string;
  interviewer_id: string;
  n_interviews: number;
  avg_duration_sec?: number | null;
  flag_rate?: number | null;
  anomaly_score?: number | null;
  computed_at?: string | null;
}

export interface InterviewerSummary {
  interviewer_id: string;
  n_interviews: number;
  avg_duration_sec?: number | null;
  flag_rate?: number | null;
  anomaly_score?: number | null;
}

export interface TrendPoint {
  time: string;
  approved: number;
  rejected: number;
}

export interface FieldworkReport {
  interviews_total: number;
  approved: number;
  fraud_rejected: number;
  ineligible: number;
  needs_review: number;
  by_check: Record<string, number>;
  interviewers: InterviewerSummary[];
  trend: TrendPoint[];
}

// Backend PaginatedResponse shape (skip/limit/has_more).
export interface FieldworkPage<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface FlagResolvePayload {
  status: 'confirmed' | 'dismissed';
  note?: string;
}

// Default sampling bbox — mirrors backend DEFAULT_RULES.gps_bbox
// (Jabodetabek). Used to draw the sampling rectangle when a batch has no
// explicit rules.gps_bbox of its own.
export const DEFAULT_GPS_BBOX: GpsBbox = {
  lat_min: -6.40,
  lat_max: -6.05,
  lng_min: 106.65,
  lng_max: 106.95,
};
