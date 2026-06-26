// Global type definitions for the application

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'client';
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  transcript_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Transcript {
  id: string;
  project_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
