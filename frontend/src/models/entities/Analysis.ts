/**
 * Analysis Entity - SOLID: Single Responsibility Principle
 * Only represents analysis data structure
 */

export class Analysis {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly type: AnalysisType,
    public readonly status: AnalysisStatus,
    public readonly grid: AnalysisGrid,
    public readonly insights: Insight[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: string,
    public readonly timeSavedMinutes: number
  ) {}

  get isCompleted(): boolean {
    return this.status === AnalysisStatus.COMPLETED;
  }

  get isProcessing(): boolean {
    return this.status === AnalysisStatus.PROCESSING;
  }

  get cellCount(): number {
    return this.grid.rows.length * this.grid.columns.length;
  }

  get completedCellCount(): number {
    return this.grid.cells.filter(c => c.status === 'completed').length;
  }

  get completionPercentage(): number {
    if (this.cellCount === 0) return 0;
    return Math.round((this.completedCellCount / this.cellCount) * 100);
  }

  static fromJSON(json: any): Analysis {
    return new Analysis(
      json.id,
      json.project_id || json.projectId,
      json.name,
      json.description || '',
      json.type || AnalysisType.THEMATIC,
      json.status || AnalysisStatus.DRAFT,
      AnalysisGrid.fromJSON(json.grid || {}),
      (json.insights || []).map((i: any) => Insight.fromJSON(i)),
      new Date(json.created_at || json.createdAt),
      new Date(json.updated_at || json.updatedAt),
      json.created_by || json.createdBy,
      json.time_saved_minutes || json.timeSavedMinutes || 0
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      project_id: this.projectId,
      name: this.name,
      description: this.description,
      type: this.type,
      status: this.status,
      grid: this.grid.toJSON(),
      insights: this.insights.map(i => i.toJSON()),
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      created_by: this.createdBy,
      time_saved_minutes: this.timeSavedMinutes
    };
  }
}

export enum AnalysisType {
  THEMATIC = 'thematic',
  SENTIMENT = 'sentiment',
  JOURNEY = 'journey',
  COMPARISON = 'comparison',
  CUSTOM = 'custom'
}

export enum AnalysisStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Analysis Grid - Represents the analysis matrix
 */
export class AnalysisGrid {
  constructor(
    public readonly rows: GridRow[],
    public readonly columns: GridColumn[],
    public readonly cells: GridCell[]
  ) {}

  getCellByPosition(rowId: string, columnId: string): GridCell | undefined {
    return this.cells.find(c => c.rowId === rowId && c.columnId === columnId);
  }

  getCellsByRow(rowId: string): GridCell[] {
    return this.cells.filter(c => c.rowId === rowId);
  }

  getCellsByColumn(columnId: string): GridCell[] {
    return this.cells.filter(c => c.columnId === columnId);
  }

  static fromJSON(json: any): AnalysisGrid {
    return new AnalysisGrid(
      (json.rows || []).map((r: any) => GridRow.fromJSON(r)),
      (json.columns || []).map((c: any) => GridColumn.fromJSON(c)),
      (json.cells || []).map((c: any) => GridCell.fromJSON(c))
    );
  }

  toJSON(): Record<string, any> {
    return {
      rows: this.rows.map(r => r.toJSON()),
      columns: this.columns.map(c => c.toJSON()),
      cells: this.cells.map(c => c.toJSON())
    };
  }
}

export class GridRow {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly type: 'theme' | 'segment' | 'persona' | 'custom',
    public readonly order: number,
    public readonly color?: string
  ) {}

  static fromJSON(json: any): GridRow {
    return new GridRow(
      json.id,
      json.label,
      json.type || 'custom',
      json.order || 0,
      json.color
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      label: this.label,
      type: this.type,
      order: this.order,
      color: this.color
    };
  }
}

export class GridColumn {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly type: 'question' | 'topic' | 'metric' | 'custom',
    public readonly order: number,
    public readonly width?: number
  ) {}

  static fromJSON(json: any): GridColumn {
    return new GridColumn(
      json.id,
      json.label,
      json.type || 'custom',
      json.order || 0,
      json.width
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      label: this.label,
      type: this.type,
      order: this.order,
      width: this.width
    };
  }
}

export class GridCell {
  constructor(
    public readonly id: string,
    public readonly rowId: string,
    public readonly columnId: string,
    public readonly content: string,
    public readonly evidence: Evidence[],
    public readonly status: 'empty' | 'draft' | 'completed',
    public readonly confidence?: number,
    public readonly aiSuggestion?: string
  ) {}

  get hasEvidence(): boolean {
    return this.evidence.length > 0;
  }

  get evidenceCount(): number {
    return this.evidence.length;
  }

  static fromJSON(json: any): GridCell {
    return new GridCell(
      json.id,
      json.row_id || json.rowId,
      json.column_id || json.columnId,
      json.content || '',
      (json.evidence || []).map((e: any) => Evidence.fromJSON(e)),
      json.status || 'empty',
      json.confidence,
      json.ai_suggestion || json.aiSuggestion
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      row_id: this.rowId,
      column_id: this.columnId,
      content: this.content,
      evidence: this.evidence.map(e => e.toJSON()),
      status: this.status,
      confidence: this.confidence,
      ai_suggestion: this.aiSuggestion
    };
  }
}

/**
 * Evidence - Supporting quotes/data for analysis
 */
export class Evidence {
  constructor(
    public readonly id: string,
    public readonly transcriptId: string,
    public readonly text: string,
    public readonly speaker?: string,
    public readonly timestamp?: number,
    public readonly startTime?: number,
    public readonly endTime?: number,
    public readonly sentiment?: 'positive' | 'negative' | 'neutral',
    public readonly tags?: string[]
  ) {}

  get formattedTimestamp(): string {
    if (!this.startTime) return '';
    const minutes = Math.floor(this.startTime / 60);
    const seconds = this.startTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  static fromJSON(json: any): Evidence {
    return new Evidence(
      json.id,
      json.transcript_id || json.transcriptId,
      json.text,
      json.speaker,
      json.timestamp,
      json.start_time || json.startTime,
      json.end_time || json.endTime,
      json.sentiment,
      json.tags
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      transcript_id: this.transcriptId,
      text: this.text,
      speaker: this.speaker,
      timestamp: this.timestamp,
      start_time: this.startTime,
      end_time: this.endTime,
      sentiment: this.sentiment,
      tags: this.tags
    };
  }
}

/**
 * Insight - AI-generated insights
 */
export class Insight {
  constructor(
    public readonly id: string,
    public readonly type: InsightType,
    public readonly title: string,
    public readonly description: string,
    public readonly evidence: Evidence[],
    public readonly importance: 'high' | 'medium' | 'low',
    public readonly confidence: number,
    public readonly tags?: string[]
  ) {}

  static fromJSON(json: any): Insight {
    return new Insight(
      json.id,
      json.type || InsightType.THEME,
      json.title,
      json.description,
      (json.evidence || []).map((e: any) => Evidence.fromJSON(e)),
      json.importance || 'medium',
      json.confidence || 0.5,
      json.tags
    );
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      evidence: this.evidence.map(e => e.toJSON()),
      importance: this.importance,
      confidence: this.confidence,
      tags: this.tags
    };
  }
}

export enum InsightType {
  THEME = 'theme',
  PATTERN = 'pattern',
  ANOMALY = 'anomaly',
  RECOMMENDATION = 'recommendation',
  SENTIMENT = 'sentiment'
}