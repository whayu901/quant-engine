/**
 * Project Repository - SOLID: Single Responsibility & Open/Closed
 * Handles project data access with caching capability
 */

import { IPaginatedRepository, IPaginatedResult, IQueryOptions } from '../../interfaces/IRepository';
import { Project } from '../entities/Project';
import api from '../../lib/api/client';

export class ProjectRepository implements IPaginatedRepository<Project> {
  private cache: Map<string, { data: Project; timestamp: number }> = new Map();
  private cacheTTL: number = 300000; // 5 minutes default

  async findById(id: string): Promise<Project | null> {
    // Check cache first
    const cached = this.getFromCache(id);
    if (cached) return cached;

    try {
      const response = await api.get(`/projects/${id}`);
      const project = Project.fromJSON(response);
      this.addToCache(id, project);
      return project;
    } catch (error: any) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      const response = await api.get('/projects');
      return response.projects.map((p: any) => Project.fromJSON(p));
    } catch (error) {
      throw new Error('Failed to fetch projects');
    }
  }

  async findPaginated(options: IQueryOptions): Promise<IPaginatedResult<Project>> {
    try {
      const params = new URLSearchParams({
        page: String(options.page || 1),
        page_size: String(options.pageSize || 10),
        ...(options.sortBy && { sort_by: options.sortBy }),
        ...(options.sortOrder && { sort_order: options.sortOrder }),
        ...(options.filters && { ...options.filters })
      });

      const response = await api.get(`/projects?${params}`);

      return {
        data: response.projects.map((p: any) => Project.fromJSON(p)),
        total: response.total,
        page: response.page,
        pageSize: response.page_size,
        totalPages: response.total_pages
      };
    } catch (error) {
      throw new Error('Failed to fetch paginated projects');
    }
  }

  async create(data: Partial<Project>): Promise<Project> {
    try {
      const response = await api.post('/projects', {
        name: data.name,
        description: data.description,
        tags: data.tags
      });
      const project = Project.fromJSON(response);
      this.addToCache(project.id, project);
      return project;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create project');
    }
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    try {
      const response = await api.patch(`/projects/${id}`, {
        name: data.name,
        description: data.description,
        tags: data.tags,
        status: data.status
      });
      const project = Project.fromJSON(response);
      this.addToCache(id, project);
      return project;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update project');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/projects/${id}`);
      this.removeFromCache(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async archive(id: string): Promise<Project> {
    return this.update(id, { status: 'archived' as any });
  }

  async unarchive(id: string): Promise<Project> {
    return this.update(id, { status: 'active' as any });
  }

  async getCollaborators(projectId: string): Promise<any[]> {
    try {
      const response = await api.get(`/projects/${projectId}/collaborators`);
      return response.collaborators;
    } catch (error) {
      throw new Error('Failed to fetch collaborators');
    }
  }

  async addCollaborator(projectId: string, userId: string, role: string): Promise<void> {
    await api.post(`/projects/${projectId}/collaborators`, {
      user_id: userId,
      role
    });
  }

  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/collaborators/${userId}`);
  }

  // Cache management methods
  private getFromCache(id: string): Project | null {
    const cached = this.cache.get(id);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(id);
      return null;
    }

    return cached.data;
  }

  private addToCache(id: string, project: Project): void {
    this.cache.set(id, {
      data: project,
      timestamp: Date.now()
    });
  }

  private removeFromCache(id: string): void {
    this.cache.delete(id);
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public setCacheTTL(milliseconds: number): void {
    this.cacheTTL = milliseconds;
  }
}