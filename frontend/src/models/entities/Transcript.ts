/**
 * Transcript Entity - SOLID: Single Responsibility Principle
 * Only represents transcript data structure
 */

export class Transcript {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
    public readonly durationSeconds: number,
    public readonly status: TranscriptStatus,
    public readonly content?: TranscriptContent,
    public readonly languages?: string[],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly processedAt?: Date,
    public readonly metadata?: TranscriptMetadata
  ) {}

  get isProcessing(): boolean {
    return this.status === TranscriptStatus.PROCESSING;
  }

  get isCompleted(): boolean {
    return this.status === TranscriptStatus.COMPLETED;
  }

  get hasFailed(): boolean {
    return this.status === TranscriptStatus.FAILED;
  }

  get durationFormatted(): string {
    const hours = Math.floor(this.durationSeconds / 3600);
    const minutes = Math.floor((this.durationSeconds % 3600) / 60);
    const seconds = this.durationSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get fileSizeFormatted(): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  static fromJSON(json: any): Transcript {
    return new Transcript(
      json.id,
      json.project_id || json.projectId,
      json.file_name || json.fileName,
      json.file_size || json.fileSize,
      json.mime_type || json.mimeType,
      json.duration_seconds || json.durationSeconds || 0,
      json.status || TranscriptStatus.PENDING,
      json.content ? TranscriptContent.fromJSON(json.content) : undefined,
      json.languages,
      json.created_at ? new Date(json.created_at) : undefined,
      json.updated_at ? new Date(json.updated_at) : undefined,
      json.processed_at ? new Date(json.processed_at) : undefined,
      json.metadata
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      project_id: this.projectId,
      file_name: this.fileName,
      file_size: this.fileSize,
      mime_type: this.mimeType,
      duration_seconds: this.durationSeconds,
      status: this.status,
      content: this.content?.toJSON(),
      languages: this.languages,
      created_at: this.createdAt?.toISOString(),
      updated_at: this.updatedAt?.toISOString(),
      processed_at: this.processedAt?.toISOString(),
      metadata: this.metadata
    };
  }
}

export enum TranscriptStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export class TranscriptContent {
  constructor(
    public readonly text: string,
    public readonly segments: TranscriptSegment[],
    public readonly speakers?: Speaker[]
  ) {}

  static fromJSON(json: any): TranscriptContent {
    return new TranscriptContent(
      json.text,
      json.segments?.map((s: any) => TranscriptSegment.fromJSON(s)) || [],
      json.speakers?.map((s: any) => Speaker.fromJSON(s))
    );
  }

  toJSON(): Record<string, any> {
    return {
      text: this.text,
      segments: this.segments.map(s => s.toJSON()),
      speakers: this.speakers?.map(s => s.toJSON())
    };
  }
}

export class TranscriptSegment {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly startTime: number,
    public readonly endTime: number,
    public readonly speaker?: string,
    public readonly confidence?: number,
    public readonly language?: string
  ) {}

  static fromJSON(json: any): TranscriptSegment {
    return new TranscriptSegment(
      json.id,
      json.text,
      json.start_time || json.startTime,
      json.end_time || json.endTime,
      json.speaker,
      json.confidence,
      json.language
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      text: this.text,
      start_time: this.startTime,
      end_time: this.endTime,
      speaker: this.speaker,
      confidence: this.confidence,
      language: this.language
    };
  }
}

export class Speaker {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly segments: number[]
  ) {}

  static fromJSON(json: any): Speaker {
    return new Speaker(
      json.id,
      json.name,
      json.segments
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      segments: this.segments
    };
  }
}

export interface TranscriptMetadata {
  originalFileName?: string;
  uploadedBy?: string;
  processingTime?: number;
  errorMessage?: string;
  retryCount?: number;
}