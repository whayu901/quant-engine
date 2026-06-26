// Reels feature types following SOLID principles

export interface Clip {
  id: string;
  name: string;
  status: 'ready' | 'processing' | 'failed' | 'draft';
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface ReelItem {
  id: string;
  reel_id: string;
  clip_id: string;
  position: number;
  clip?: Clip;
  created_at: string;
  updated_at: string;
}

export interface Reel {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  purpose: 'highlight' | 'evidence' | 'presentation' | 'social';
  transition_style: 'fade' | 'cut' | 'dissolve';
  transition_duration: number;
  resolution: '720p' | '1080p' | '4k';
  aspect_ratio: '16:9' | '9:16' | '1:1' | '4:3';
  format: 'mp4' | 'mov' | 'webm';
  intro_text?: string;
  outro_text?: string;
  watermark: boolean;
  status: 'draft' | 'processing' | 'ready' | 'failed';
  total_duration?: number;
  items?: ReelItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateReelInput {
  name: string;
  description?: string;
  purpose: Reel['purpose'];
  transition_style: Reel['transition_style'];
  transition_duration: number;
  resolution: Reel['resolution'];
  aspect_ratio: Reel['aspect_ratio'];
  format: Reel['format'];
  intro_text?: string;
  outro_text?: string;
  watermark: boolean;
}

export interface UpdateReelInput {
  name?: string;
  description?: string;
  purpose?: Reel['purpose'];
  transition_style?: Reel['transition_style'];
  transition_duration?: number;
  resolution?: Reel['resolution'];
  aspect_ratio?: Reel['aspect_ratio'];
  format?: Reel['format'];
  intro_text?: string;
  outro_text?: string;
  watermark?: boolean;
}

export interface AddReelItemInput {
  clip_id: string;
}

export interface UpdateReelItemInput {
  position?: number;
}

export interface ShareInput {
  target_type: 'reel' | 'clip';
  target_id: string;
  title: string;
  description?: string;
  allow_download: boolean;
}

export interface ShareResponse {
  url: string;
  token: string;
  expires_at: string;
}

export interface CompileReelResponse {
  job_id: string;
  status: string;
}
