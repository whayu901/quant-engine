/**
 * Report Entity - SOLID: Single Responsibility Principle
 * Only represents report/export data structure
 */

export class Report {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly name: string,
    public readonly type: ReportType,
    public readonly format: ReportFormat,
    public readonly sections: ReportSection[],
    public readonly status: ReportStatus,
    public readonly createdAt: Date,
    public readonly createdBy: string,
    public readonly metadata?: ReportMetadata
  ) {}

  get isCompleted(): boolean {
    return this.status === ReportStatus.COMPLETED;
  }

  get isProcessing(): boolean {
    return this.status === ReportStatus.PROCESSING;
  }

  get sectionCount(): number {
    return this.sections.length;
  }

  get pageCount(): number {
    return this.sections.reduce((sum, section) => sum + (section.pageCount || 1), 0);
  }

  static fromJSON(json: any): Report {
    return new Report(
      json.id,
      json.project_id || json.projectId,
      json.name,
      json.type || ReportType.COMPREHENSIVE,
      json.format || ReportFormat.PDF,
      (json.sections || []).map((s: any) => ReportSection.fromJSON(s)),
      json.status || ReportStatus.DRAFT,
      new Date(json.created_at || json.createdAt),
      json.created_by || json.createdBy,
      json.metadata
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      project_id: this.projectId,
      name: this.name,
      type: this.type,
      format: this.format,
      sections: this.sections.map(s => s.toJSON()),
      status: this.status,
      created_at: this.createdAt.toISOString(),
      created_by: this.createdBy,
      metadata: this.metadata
    };
  }
}

export enum ReportType {
  COMPREHENSIVE = 'comprehensive',
  EXECUTIVE_SUMMARY = 'executive_summary',
  THEME_ANALYSIS = 'theme_analysis',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  JOURNEY_MAP = 'journey_map',
  COMPARISON = 'comparison',
  CUSTOM = 'custom'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  POWERPOINT = 'powerpoint',
  WORD = 'word',
  HTML = 'html',
  MARKDOWN = 'markdown'
}

export enum ReportStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export class ReportSection {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: SectionType,
    public readonly content: SectionContent,
    public readonly order: number,
    public readonly pageCount?: number
  ) {}

  static fromJSON(json: any): ReportSection {
    return new ReportSection(
      json.id,
      json.title,
      json.type || SectionType.TEXT,
      SectionContent.fromJSON(json.content),
      json.order || 0,
      json.page_count || json.pageCount
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      title: this.title,
      type: this.type,
      content: this.content.toJSON(),
      order: this.order,
      page_count: this.pageCount
    };
  }
}

export enum SectionType {
  COVER = 'cover',
  TABLE_OF_CONTENTS = 'table_of_contents',
  EXECUTIVE_SUMMARY = 'executive_summary',
  METHODOLOGY = 'methodology',
  TEXT = 'text',
  CHART = 'chart',
  TABLE = 'table',
  THEME_ANALYSIS = 'theme_analysis',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  QUOTES = 'quotes',
  RECOMMENDATIONS = 'recommendations',
  APPENDIX = 'appendix'
}

export class SectionContent {
  constructor(
    public readonly text?: string,
    public readonly charts?: ChartData[],
    public readonly tables?: TableData[],
    public readonly quotes?: QuoteData[],
    public readonly themes?: any[],
    public readonly metrics?: MetricData[]
  ) {}

  static fromJSON(json: any): SectionContent {
    return new SectionContent(
      json.text,
      json.charts?.map((c: any) => ChartData.fromJSON(c)),
      json.tables?.map((t: any) => TableData.fromJSON(t)),
      json.quotes?.map((q: any) => QuoteData.fromJSON(q)),
      json.themes,
      json.metrics?.map((m: any) => MetricData.fromJSON(m))
    );
  }

  toJSON(): Record<string, any> {
    return {
      text: this.text,
      charts: this.charts?.map(c => c.toJSON()),
      tables: this.tables?.map(t => t.toJSON()),
      quotes: this.quotes?.map(q => q.toJSON()),
      themes: this.themes,
      metrics: this.metrics?.map(m => m.toJSON())
    };
  }
}

export class ChartData {
  constructor(
    public readonly type: 'bar' | 'line' | 'pie' | 'donut' | 'radar' | 'heatmap',
    public readonly title: string,
    public readonly data: any[],
    public readonly options?: any
  ) {}

  static fromJSON(json: any): ChartData {
    return new ChartData(
      json.type,
      json.title,
      json.data,
      json.options
    );
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      title: this.title,
      data: this.data,
      options: this.options
    };
  }
}

export class TableData {
  constructor(
    public readonly headers: string[],
    public readonly rows: any[][],
    public readonly caption?: string
  ) {}

  static fromJSON(json: any): TableData {
    return new TableData(
      json.headers,
      json.rows,
      json.caption
    );
  }

  toJSON(): Record<string, any> {
    return {
      headers: this.headers,
      rows: this.rows,
      caption: this.caption
    };
  }
}

export class QuoteData {
  constructor(
    public readonly text: string,
    public readonly source: string,
    public readonly speaker?: string,
    public readonly context?: string
  ) {}

  static fromJSON(json: any): QuoteData {
    return new QuoteData(
      json.text,
      json.source,
      json.speaker,
      json.context
    );
  }

  toJSON(): Record<string, any> {
    return {
      text: this.text,
      source: this.source,
      speaker: this.speaker,
      context: this.context
    };
  }
}

export class MetricData {
  constructor(
    public readonly label: string,
    public readonly value: number | string,
    public readonly unit?: string,
    public readonly change?: number,
    public readonly trend?: 'up' | 'down' | 'stable'
  ) {}

  static fromJSON(json: any): MetricData {
    return new MetricData(
      json.label,
      json.value,
      json.unit,
      json.change,
      json.trend
    );
  }

  toJSON(): Record<string, any> {
    return {
      label: this.label,
      value: this.value,
      unit: this.unit,
      change: this.change,
      trend: this.trend
    };
  }
}

export interface ReportMetadata {
  clientName?: string;
  projectName?: string;
  researchPeriod?: { start: Date; end: Date };
  participantCount?: number;
  transcriptCount?: number;
  timeSavedMinutes?: number;
  generatedBy?: string;
  template?: string;
  language?: string;
}

/**
 * Report Generation Request
 */
export class ReportGenerationRequest {
  constructor(
    public readonly name: string,
    public readonly type: ReportType,
    public readonly format: ReportFormat,
    public readonly sections: string[],
    public readonly data: ReportDataSources,
    public readonly options?: ReportGenerationOptions
  ) {}

  toJSON(): Record<string, any> {
    return {
      name: this.name,
      type: this.type,
      format: this.format,
      sections: this.sections,
      data: this.data,
      options: this.options
    };
  }
}

export interface ReportDataSources {
  transcriptIds?: string[];
  analysisIds?: string[];
  themeIds?: string[];
  chatSessionIds?: string[];
}

export interface ReportGenerationOptions {
  template?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
  includeRawData?: boolean;
  includeMethodology?: boolean;
  includeRecommendations?: boolean;
  language?: string;
  pageLimit?: number;
}