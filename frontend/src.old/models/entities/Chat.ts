/**
 * Chat Entity - SOLID: Single Responsibility Principle
 * Only represents chat data structure
 */

export class ChatSession {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly userId: string,
    public readonly messages: ChatMessage[],
    public readonly context: ChatContext,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly metadata?: ChatMetadata
  ) {}

  get messageCount(): number {
    return this.messages.length;
  }

  get lastMessage(): ChatMessage | null {
    return this.messages[this.messages.length - 1] || null;
  }

  get totalTokensUsed(): number {
    return this.messages.reduce((sum, msg) => sum + (msg.tokenCount || 0), 0);
  }

  static fromJSON(json: any): ChatSession {
    return new ChatSession(
      json.id,
      json.project_id || json.projectId,
      json.user_id || json.userId,
      (json.messages || []).map((m: any) => ChatMessage.fromJSON(m)),
      ChatContext.fromJSON(json.context || {}),
      new Date(json.created_at || json.createdAt),
      new Date(json.updated_at || json.updatedAt),
      json.metadata
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      project_id: this.projectId,
      user_id: this.userId,
      messages: this.messages.map(m => m.toJSON()),
      context: this.context.toJSON(),
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      metadata: this.metadata
    };
  }
}

export class ChatMessage {
  constructor(
    public readonly id: string,
    public readonly role: MessageRole,
    public readonly content: string,
    public readonly citations: Citation[],
    public readonly timestamp: Date,
    public readonly tokenCount?: number,
    public readonly processingTime?: number,
    public readonly feedback?: MessageFeedback
  ) {}

  get isUser(): boolean {
    return this.role === MessageRole.USER;
  }

  get isAssistant(): boolean {
    return this.role === MessageRole.ASSISTANT;
  }

  get isSystem(): boolean {
    return this.role === MessageRole.SYSTEM;
  }

  get hasCitations(): boolean {
    return this.citations.length > 0;
  }

  static fromJSON(json: any): ChatMessage {
    return new ChatMessage(
      json.id,
      json.role || MessageRole.USER,
      json.content,
      (json.citations || []).map((c: any) => Citation.fromJSON(c)),
      new Date(json.timestamp),
      json.token_count || json.tokenCount,
      json.processing_time || json.processingTime,
      json.feedback ? MessageFeedback.fromJSON(json.feedback) : undefined
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      role: this.role,
      content: this.content,
      citations: this.citations.map(c => c.toJSON()),
      timestamp: this.timestamp.toISOString(),
      token_count: this.tokenCount,
      processing_time: this.processingTime,
      feedback: this.feedback?.toJSON()
    };
  }
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export class Citation {
  constructor(
    public readonly id: string,
    public readonly source: CitationSource,
    public readonly text: string,
    public readonly relevance: number,
    public readonly metadata?: CitationMetadata
  ) {}

  get formattedSource(): string {
    switch (this.source.type) {
      case 'transcript':
        return `Transcript: ${this.source.name}`;
      case 'analysis':
        return `Analysis: ${this.source.name}`;
      case 'document':
        return `Document: ${this.source.name}`;
      default:
        return this.source.name;
    }
  }

  static fromJSON(json: any): Citation {
    return new Citation(
      json.id,
      CitationSource.fromJSON(json.source),
      json.text,
      json.relevance || 0.5,
      json.metadata
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      source: this.source.toJSON(),
      text: this.text,
      relevance: this.relevance,
      metadata: this.metadata
    };
  }
}

export class CitationSource {
  constructor(
    public readonly type: 'transcript' | 'analysis' | 'document' | 'external',
    public readonly id: string,
    public readonly name: string,
    public readonly timestamp?: number,
    public readonly page?: number,
    public readonly url?: string
  ) {}

  static fromJSON(json: any): CitationSource {
    return new CitationSource(
      json.type,
      json.id,
      json.name,
      json.timestamp,
      json.page,
      json.url
    );
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      id: this.id,
      name: this.name,
      timestamp: this.timestamp,
      page: this.page,
      url: this.url
    };
  }
}

export class ChatContext {
  constructor(
    public readonly transcriptIds: string[],
    public readonly analysisIds: string[],
    public readonly documentIds: string[],
    public readonly filters?: ContextFilters,
    public readonly settings?: ContextSettings
  ) {}

  get hasTranscripts(): boolean {
    return this.transcriptIds.length > 0;
  }

  get hasAnalyses(): boolean {
    return this.analysisIds.length > 0;
  }

  get totalSources(): number {
    return this.transcriptIds.length + this.analysisIds.length + this.documentIds.length;
  }

  static fromJSON(json: any): ChatContext {
    return new ChatContext(
      json.transcript_ids || json.transcriptIds || [],
      json.analysis_ids || json.analysisIds || [],
      json.document_ids || json.documentIds || [],
      json.filters,
      json.settings
    );
  }

  toJSON(): Record<string, any> {
    return {
      transcript_ids: this.transcriptIds,
      analysis_ids: this.analysisIds,
      document_ids: this.documentIds,
      filters: this.filters,
      settings: this.settings
    };
  }
}

export interface ContextFilters {
  dateRange?: { start: Date; end: Date };
  speakers?: string[];
  topics?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface ContextSettings {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  language?: string;
}

export class MessageFeedback {
  constructor(
    public readonly rating: 'positive' | 'negative',
    public readonly comment?: string,
    public readonly timestamp?: Date
  ) {}

  static fromJSON(json: any): MessageFeedback {
    return new MessageFeedback(
      json.rating,
      json.comment,
      json.timestamp ? new Date(json.timestamp) : undefined
    );
  }

  toJSON(): Record<string, any> {
    return {
      rating: this.rating,
      comment: this.comment,
      timestamp: this.timestamp?.toISOString()
    };
  }
}

export interface ChatMetadata {
  timeSavedMinutes?: number;
  insightsGenerated?: number;
  questionsAnswered?: number;
  model?: string;
  temperature?: number;
}

export interface CitationMetadata {
  speaker?: string;
  startTime?: number;
  endTime?: number;
  confidence?: number;
  tags?: string[];
}