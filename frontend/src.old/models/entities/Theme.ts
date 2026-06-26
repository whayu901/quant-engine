/**
 * Theme Entity - SOLID: Single Responsibility Principle
 * Only represents theme extraction data structure
 */

export class Theme {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly category: ThemeCategory,
    public readonly occurrences: number,
    public readonly sentiment: SentimentScore,
    public readonly evidence: ThemeEvidence[],
    public readonly subThemes: SubTheme[],
    public readonly confidence: number,
    public readonly createdAt: Date,
    public readonly metadata?: ThemeMetadata
  ) {}

  get sentimentLabel(): string {
    if (this.sentiment.positive > 0.6) return 'Positive';
    if (this.sentiment.negative > 0.6) return 'Negative';
    if (this.sentiment.neutral > 0.6) return 'Neutral';
    return 'Mixed';
  }

  get evidenceCount(): number {
    return this.evidence.length;
  }

  get subThemeCount(): number {
    return this.subThemes.length;
  }

  get importanceScore(): number {
    // Calculate importance based on occurrences and confidence
    return (this.occurrences * 0.7 + this.confidence * 100 * 0.3) / 10;
  }

  static fromJSON(json: any): Theme {
    return new Theme(
      json.id,
      json.project_id || json.projectId,
      json.name,
      json.description,
      json.category || ThemeCategory.GENERAL,
      json.occurrences || 0,
      SentimentScore.fromJSON(json.sentiment || {}),
      (json.evidence || []).map((e: any) => ThemeEvidence.fromJSON(e)),
      (json.sub_themes || json.subThemes || []).map((s: any) => SubTheme.fromJSON(s)),
      json.confidence || 0.5,
      new Date(json.created_at || json.createdAt),
      json.metadata
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      project_id: this.projectId,
      name: this.name,
      description: this.description,
      category: this.category,
      occurrences: this.occurrences,
      sentiment: this.sentiment.toJSON(),
      evidence: this.evidence.map(e => e.toJSON()),
      sub_themes: this.subThemes.map(s => s.toJSON()),
      confidence: this.confidence,
      created_at: this.createdAt.toISOString(),
      metadata: this.metadata
    };
  }
}

export enum ThemeCategory {
  GENERAL = 'general',
  PAIN_POINT = 'pain_point',
  FEATURE_REQUEST = 'feature_request',
  POSITIVE_FEEDBACK = 'positive_feedback',
  CONCERN = 'concern',
  SUGGESTION = 'suggestion',
  BEHAVIOR = 'behavior',
  EMOTION = 'emotion',
  CUSTOM = 'custom'
}

export class SentimentScore {
  constructor(
    public readonly positive: number,
    public readonly negative: number,
    public readonly neutral: number
  ) {}

  get dominant(): 'positive' | 'negative' | 'neutral' {
    if (this.positive > this.negative && this.positive > this.neutral) return 'positive';
    if (this.negative > this.positive && this.negative > this.neutral) return 'negative';
    return 'neutral';
  }

  static fromJSON(json: any): SentimentScore {
    return new SentimentScore(
      json.positive || 0,
      json.negative || 0,
      json.neutral || 0
    );
  }

  toJSON(): Record<string, any> {
    return {
      positive: this.positive,
      negative: this.negative,
      neutral: this.neutral
    };
  }
}

export class ThemeEvidence {
  constructor(
    public readonly id: string,
    public readonly transcriptId: string,
    public readonly text: string,
    public readonly speaker?: string,
    public readonly timestamp?: number,
    public readonly relevance: number
  ) {}

  static fromJSON(json: any): ThemeEvidence {
    return new ThemeEvidence(
      json.id,
      json.transcript_id || json.transcriptId,
      json.text,
      json.speaker,
      json.timestamp,
      json.relevance || 0.5
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      transcript_id: this.transcriptId,
      text: this.text,
      speaker: this.speaker,
      timestamp: this.timestamp,
      relevance: this.relevance
    };
  }
}

export class SubTheme {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly occurrences: number,
    public readonly evidence: ThemeEvidence[]
  ) {}

  static fromJSON(json: any): SubTheme {
    return new SubTheme(
      json.id,
      json.name,
      json.occurrences || 0,
      (json.evidence || []).map((e: any) => ThemeEvidence.fromJSON(e))
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      occurrences: this.occurrences,
      evidence: this.evidence.map(e => e.toJSON())
    };
  }
}

export interface ThemeMetadata {
  language?: string;
  processingTime?: number;
  modelUsed?: string;
  transcriptCount?: number;
  timeSavedMinutes?: number;
}

/**
 * Theme Extraction Request
 */
export class ThemeExtractionRequest {
  constructor(
    public readonly transcriptIds: string[],
    public readonly options: ThemeExtractionOptions
  ) {}

  toJSON(): Record<string, any> {
    return {
      transcript_ids: this.transcriptIds,
      options: this.options
    };
  }
}

export interface ThemeExtractionOptions {
  maxThemes?: number;
  minOccurrences?: number;
  categories?: ThemeCategory[];
  includeSentiment?: boolean;
  includeSubThemes?: boolean;
  language?: string;
  customPrompt?: string;
}