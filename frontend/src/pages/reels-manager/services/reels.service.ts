// Reels service (Model layer) following SOLID principles
import { apiClient } from '../../../core/api/client';
import type { ApiClient } from '../../../core/api/client';
import type {
  Reel,
  Clip,
  CreateReelInput,
  UpdateReelInput,
  AddReelItemInput,
  UpdateReelItemInput,
  ShareInput,
  ShareResponse,
  CompileReelResponse,
} from '../types';

// Service interface for dependency inversion
export interface IReelsService {
  // Reels
  getReels(projectId: string): Promise<Reel[]>;
  getReel(reelId: string): Promise<Reel>;
  createReel(projectId: string, input: CreateReelInput): Promise<Reel>;
  updateReel(reelId: string, input: UpdateReelInput): Promise<Reel>;
  deleteReel(reelId: string): Promise<void>;
  compileReel(reelId: string): Promise<CompileReelResponse>;

  // Reel Items
  addReelItem(reelId: string, input: AddReelItemInput): Promise<void>;
  updateReelItem(reelId: string, itemId: string, input: UpdateReelItemInput): Promise<void>;
  removeReelItem(reelId: string, itemId: string): Promise<void>;

  // Clips
  getClips(projectId: string): Promise<Clip[]>;

  // Share
  createShareLink(input: ShareInput): Promise<ShareResponse>;
}

// Concrete implementation
export class ReelsService implements IReelsService {
  constructor(private api: ApiClient) {}

  // Reels
  async getReels(projectId: string): Promise<Reel[]> {
    return await this.api.get<Reel[]>(`/projects/${projectId}/reels`);
  }

  async getReel(reelId: string): Promise<Reel> {
    return await this.api.get<Reel>(`/reels/${reelId}`);
  }

  async createReel(projectId: string, input: CreateReelInput): Promise<Reel> {
    return await this.api.post<Reel>(`/projects/${projectId}/reels`, input);
  }

  async updateReel(reelId: string, input: UpdateReelInput): Promise<Reel> {
    return await this.api.put<Reel>(`/reels/${reelId}`, input);
  }

  async deleteReel(reelId: string): Promise<void> {
    await this.api.delete(`/reels/${reelId}`);
  }

  async compileReel(reelId: string): Promise<CompileReelResponse> {
    return await this.api.post<CompileReelResponse>(`/reels/${reelId}/compile`);
  }

  // Reel Items
  async addReelItem(reelId: string, input: AddReelItemInput): Promise<void> {
    await this.api.post(`/reels/${reelId}/items`, input);
  }

  async updateReelItem(reelId: string, itemId: string, input: UpdateReelItemInput): Promise<void> {
    await this.api.put(`/reels/${reelId}/items/${itemId}`, input);
  }

  async removeReelItem(reelId: string, itemId: string): Promise<void> {
    await this.api.delete(`/reels/${reelId}/items/${itemId}`);
  }

  // Clips
  async getClips(projectId: string): Promise<Clip[]> {
    const clips = await this.api.get<Clip[]>(`/projects/${projectId}/clips`);
    // Only return ready clips
    return clips.filter(c => c.status === 'ready');
  }

  // Share
  async createShareLink(input: ShareInput): Promise<ShareResponse> {
    return await this.api.post<ShareResponse>('/share', input);
  }
}

// Create default service instance
export const reelsService = new ReelsService(apiClient);
