// Project feature types following SOLID principles
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  org_id?: string;
  owner_id: string;
  participant_count?: number;
  transcript_count?: number;
  analysis_count?: number;
  clip_count?: number;
}

export interface Transcript {
  id: string;
  project_id: string;
  name: string;
  content: string;
  duration?: number;
  language?: string;
  speaker?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: Project['status'];
}

export interface ProjectFilters {
  status?: Project['status'];
  search?: string;
  org_id?: string;
  page?: number;
  limit?: number;
}