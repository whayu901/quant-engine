/**
 * Analysis Service Interface - SOLID: Dependency Inversion Principle
 * High-level modules depend on abstractions
 */

import { Analysis, AnalysisGrid, GridCell, Evidence, Insight } from '../models/entities/Analysis';

export interface IAnalysisService {
  // Analysis CRUD
  createAnalysis(projectId: string, data: ICreateAnalysisData): Promise<Analysis>;
  getAnalysis(id: string): Promise<Analysis>;
  updateAnalysis(id: string, data: Partial<Analysis>): Promise<Analysis>;
  deleteAnalysis(id: string): Promise<boolean>;
  listAnalyses(projectId: string): Promise<Analysis[]>;

  // Grid operations
  updateGridCell(analysisId: string, cellId: string, data: IUpdateCellData): Promise<GridCell>;
  addEvidence(analysisId: string, cellId: string, evidence: Evidence): Promise<GridCell>;
  removeEvidence(analysisId: string, cellId: string, evidenceId: string): Promise<GridCell>;

  // AI operations
  generateSuggestions(analysisId: string): Promise<ISuggestionResult[]>;
  autoFillCell(analysisId: string, cellId: string): Promise<GridCell>;
  extractThemes(analysisId: string, transcriptIds: string[]): Promise<IThemeResult[]>;

  // Export
  exportAnalysis(analysisId: string, format: ExportFormat): Promise<Blob>;
}

export interface ICreateAnalysisData {
  name: string;
  description?: string;
  type: string;
  rows: Array<{ label: string; type: string }>;
  columns: Array<{ label: string; type: string }>;
  transcriptIds?: string[];
}

export interface IUpdateCellData {
  content?: string;
  status?: 'empty' | 'draft' | 'completed';
  evidence?: Evidence[];
  aiSuggestion?: string;
}

export interface ISuggestionResult {
  cellId: string;
  suggestion: string;
  confidence: number;
  evidence: Evidence[];
}

export interface IThemeResult {
  theme: string;
  description: string;
  occurrences: number;
  evidence: Evidence[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export enum ExportFormat {
  EXCEL = 'excel',
  CSV = 'csv',
  PDF = 'pdf',
  POWERPOINT = 'powerpoint'
}

/**
 * Analysis State Observer
 */
export interface IAnalysisStateListener {
  onAnalysisUpdated(analysis: Analysis): void;
  onCellUpdated(cellId: string, cell: GridCell): void;
  onInsightGenerated(insight: Insight): void;
}

/**
 * Analysis Cache Interface
 */
export interface IAnalysisCache {
  getAnalysis(id: string): Analysis | null;
  setAnalysis(analysis: Analysis): void;
  clearAnalysis(id: string): void;
  clearAll(): void;
}