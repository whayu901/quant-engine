/**
 * Project Entity - SOLID: Single Responsibility Principle
 * Only represents project data structure
 */

export class Project {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly ownerId: string,
    public readonly status: ProjectStatus,
    public readonly stats: ProjectStats,
    public readonly tags: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly settings?: ProjectSettings
  ) {}

  get isActive(): boolean {
    return this.status === ProjectStatus.ACTIVE;
  }

  get isArchived(): boolean {
    return this.status === ProjectStatus.ARCHIVED;
  }

  get timeSavedHours(): number {
    return Math.floor(this.stats.timeSavedMinutes / 60);
  }

  get timeSavedMinutes(): number {
    return this.stats.timeSavedMinutes % 60;
  }

  static fromJSON(json: any): Project {
    return new Project(
      json.id,
      json.name,
      json.description || '',
      json.owner_id || json.ownerId,
      json.status || ProjectStatus.ACTIVE,
      {
        transcriptCount: json.stats?.transcript_count || 0,
        analysisCount: json.stats?.analysis_count || 0,
        totalDurationMinutes: json.stats?.total_duration_minutes || 0,
        timeSavedMinutes: json.stats?.time_saved_minutes || 0,
        collaboratorCount: json.stats?.collaborator_count || 0
      },
      json.tags || [],
      new Date(json.created_at || json.createdAt),
      new Date(json.updated_at || json.updatedAt),
      json.settings
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      owner_id: this.ownerId,
      status: this.status,
      stats: {
        transcript_count: this.stats.transcriptCount,
        analysis_count: this.stats.analysisCount,
        total_duration_minutes: this.stats.totalDurationMinutes,
        time_saved_minutes: this.stats.timeSavedMinutes,
        collaborator_count: this.stats.collaboratorCount
      },
      tags: this.tags,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      settings: this.settings
    };
  }
}

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export interface ProjectStats {
  transcriptCount: number;
  analysisCount: number;
  totalDurationMinutes: number;
  timeSavedMinutes: number;
  collaboratorCount: number;
}

export interface ProjectSettings {
  defaultLanguage?: string;
  autoTranscribe?: boolean;
  shareWithTeam?: boolean;
  notificationPreferences?: {
    onTranscriptComplete?: boolean;
    onAnalysisComplete?: boolean;
    onNewComment?: boolean;
  };
}