// Project service (Model layer) following SOLID principles
import { apiClient } from '../../../core/api/client';
import type { ApiClient } from '../../../core/api/client';
import type {
  Project,
  Transcript,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFilters,
} from '../types';

// Service interface for dependency inversion
export interface IProjectService {
  getProjects(filters?: ProjectFilters): Promise<Project[]>;
  getProject(id: string): Promise<Project>;
  createProject(input: CreateProjectInput): Promise<Project>;
  updateProject(id: string, input: UpdateProjectInput): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getProjectTranscripts(projectId: string): Promise<Transcript[]>;
  uploadTranscript(projectId: string, file: File): Promise<Transcript>;
}

// Concrete implementation
export class ProjectService implements IProjectService {
  constructor(private api: ApiClient) {}

  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.org_id) params.append('org_id', filters.org_id);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString();
    const url = queryString ? `/api/v1/projects?${queryString}` : '/api/v1/projects';

    return await this.api.get<Project[]>(url);
  }

  async getProject(id: string): Promise<Project> {
    return await this.api.get<Project>(`/api/v1/projects/${id}`);
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    return await this.api.post<Project>('/api/v1/projects', input);
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    return await this.api.patch<Project>(`/api/v1/projects/${id}`, input);
  }

  async deleteProject(id: string): Promise<void> {
    await this.api.delete(`/api/v1/projects/${id}`);
  }

  async getProjectTranscripts(projectId: string): Promise<Transcript[]> {
    return await this.api.get<Transcript[]>(`/api/v1/projects/${projectId}/transcripts`);
  }

  async uploadTranscript(projectId: string, file: File): Promise<Transcript> {
    const formData = new FormData();
    formData.append('file', file);

    return await this.api.post<Transcript>(
      `/api/v1/projects/${projectId}/upload-transcript`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }
}

// Create default service instance
export const projectService = new ProjectService(apiClient);