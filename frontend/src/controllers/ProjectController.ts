/**
 * Project Controller - SOLID: Single Responsibility & Liskov Substitution
 * Manages project business logic and state
 */

import { IPaginatedRepository, IQueryOptions } from '../interfaces/IRepository';
import { Project } from '../models/entities/Project';
import { EventEmitter } from '../utils/EventEmitter';

export interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  totalProjects: number;
  currentPage: number;
  pageSize: number;
}

export interface IProjectController {
  getState(): ProjectState;
  loadProjects(options?: IQueryOptions): Promise<void>;
  loadProject(id: string): Promise<void>;
  createProject(data: Partial<Project>): Promise<Project>;
  updateProject(id: string, data: Partial<Project>): Promise<void>;
  deleteProject(id: string): Promise<void>;
  archiveProject(id: string): Promise<void>;
  subscribe(listener: (state: ProjectState) => void): () => void;
}

/**
 * Project Controller Implementation
 * SOLID: Dependency Inversion - Depends on repository abstraction
 */
export class ProjectController implements IProjectController {
  private state: ProjectState = {
    projects: [],
    selectedProject: null,
    isLoading: false,
    error: null,
    totalProjects: 0,
    currentPage: 1,
    pageSize: 10
  };

  private eventEmitter = new EventEmitter<ProjectState>();

  constructor(private projectRepository: IPaginatedRepository<Project>) {}

  getState(): ProjectState {
    return { ...this.state };
  }

  async loadProjects(options?: IQueryOptions): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const queryOptions: IQueryOptions = {
        page: options?.page || this.state.currentPage,
        pageSize: options?.pageSize || this.state.pageSize,
        sortBy: options?.sortBy || 'updated_at',
        sortOrder: options?.sortOrder || 'desc',
        filters: options?.filters
      };

      const result = await this.projectRepository.findPaginated(queryOptions);

      this.updateState({
        projects: result.data,
        totalProjects: result.total,
        currentPage: result.page,
        pageSize: result.pageSize,
        isLoading: false
      });

      // Calculate and emit time saved metrics
      const totalTimeSaved = result.data.reduce(
        (sum, project) => sum + project.stats.timeSavedMinutes,
        0
      );

      this.eventEmitter.emit('metrics_updated', {
        totalProjects: result.total,
        totalTimeSavedMinutes: totalTimeSaved
      });
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load projects'
      });
      throw error;
    }
  }

  async loadProject(id: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const project = await this.projectRepository.findById(id);

      if (!project) {
        throw new Error('Project not found');
      }

      this.updateState({
        selectedProject: project,
        isLoading: false
      });

      this.eventEmitter.emit('project_loaded', project);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load project'
      });
      throw error;
    }
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Validate project data
      this.validateProjectData(data);

      const project = await this.projectRepository.create(data);

      // Add to projects list
      this.updateState({
        projects: [project, ...this.state.projects],
        totalProjects: this.state.totalProjects + 1,
        isLoading: false
      });

      this.eventEmitter.emit('project_created', project);
      return project;
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to create project'
      });
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<Project>): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const updatedProject = await this.projectRepository.update(id, data);

      // Update in projects list
      const projects = this.state.projects.map(p =>
        p.id === id ? updatedProject : p
      );

      // Update selected project if it's the same
      const selectedProject =
        this.state.selectedProject?.id === id
          ? updatedProject
          : this.state.selectedProject;

      this.updateState({
        projects,
        selectedProject,
        isLoading: false
      });

      this.eventEmitter.emit('project_updated', updatedProject);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to update project'
      });
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const success = await this.projectRepository.delete(id);

      if (!success) {
        throw new Error('Failed to delete project');
      }

      // Remove from projects list
      const projects = this.state.projects.filter(p => p.id !== id);

      // Clear selected project if it was deleted
      const selectedProject =
        this.state.selectedProject?.id === id
          ? null
          : this.state.selectedProject;

      this.updateState({
        projects,
        selectedProject,
        totalProjects: this.state.totalProjects - 1,
        isLoading: false
      });

      this.eventEmitter.emit('project_deleted', id);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to delete project'
      });
      throw error;
    }
  }

  async archiveProject(id: string): Promise<void> {
    await this.updateProject(id, { status: 'archived' as any });
    this.eventEmitter.emit('project_archived', id);
  }

  async unarchiveProject(id: string): Promise<void> {
    await this.updateProject(id, { status: 'active' as any });
    this.eventEmitter.emit('project_unarchived', id);
  }

  subscribe(listener: (state: ProjectState) => void): () => void {
    listener(this.state);
    return this.eventEmitter.on('state_change', listener);
  }

  private updateState(partial: Partial<ProjectState>): void {
    this.state = { ...this.state, ...partial };
    this.eventEmitter.emit('state_change', this.state);
  }

  private validateProjectData(data: Partial<Project>): void {
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('Project name must be at least 3 characters');
    }

    if (data.name.length > 100) {
      throw new Error('Project name must be less than 100 characters');
    }

    if (data.description && data.description.length > 500) {
      throw new Error('Project description must be less than 500 characters');
    }

    if (data.tags && data.tags.length > 10) {
      throw new Error('Maximum 10 tags allowed');
    }
  }
}