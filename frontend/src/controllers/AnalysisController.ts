/**
 * Analysis Controller - SOLID: Single Responsibility & Dependency Inversion
 * Orchestrates analysis business logic
 */

import { IAnalysisService, ICreateAnalysisData, IUpdateCellData, ISuggestionResult, IThemeResult, ExportFormat } from '../interfaces/IAnalysisService';
import { Analysis, GridCell, Evidence, Insight } from '../models/entities/Analysis';
import { EventEmitter } from '../utils/EventEmitter';

export interface AnalysisState {
  currentAnalysis: Analysis | null;
  analyses: Analysis[];
  selectedCell: GridCell | null;
  suggestions: ISuggestionResult[];
  themes: IThemeResult[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

export interface IAnalysisController {
  getState(): AnalysisState;
  createAnalysis(projectId: string, data: ICreateAnalysisData): Promise<Analysis>;
  loadAnalysis(id: string): Promise<void>;
  loadAnalyses(projectId: string): Promise<void>;
  updateCell(cellId: string, data: IUpdateCellData): Promise<void>;
  selectCell(cellId: string): void;
  addEvidence(cellId: string, evidence: Evidence): Promise<void>;
  removeEvidence(cellId: string, evidenceId: string): Promise<void>;
  generateSuggestions(): Promise<void>;
  autoFillCell(cellId: string): Promise<void>;
  extractThemes(transcriptIds: string[]): Promise<void>;
  exportAnalysis(format: ExportFormat): Promise<void>;
  subscribe(listener: (state: AnalysisState) => void): () => void;
}

/**
 * Analysis Controller Implementation
 * SOLID: Open/Closed - Extended through dependency injection
 */
export class AnalysisController implements IAnalysisController {
  private state: AnalysisState = {
    currentAnalysis: null,
    analyses: [],
    selectedCell: null,
    suggestions: [],
    themes: [],
    isLoading: false,
    isSaving: false,
    error: null
  };

  private eventEmitter = new EventEmitter<any>();
  private autoSaveTimer: NodeJS.Timeout | null = null;

  constructor(private analysisService: IAnalysisService) {}

  getState(): AnalysisState {
    return { ...this.state };
  }

  async createAnalysis(projectId: string, data: ICreateAnalysisData): Promise<Analysis> {
    this.updateState({ isLoading: true, error: null });

    try {
      // Validate analysis data
      this.validateAnalysisData(data);

      const analysis = await this.analysisService.createAnalysis(projectId, data);

      // Add to analyses list
      this.updateState({
        analyses: [analysis, ...this.state.analyses],
        currentAnalysis: analysis,
        isLoading: false
      });

      // Emit event
      this.eventEmitter.emit('analysis_created', analysis);

      // Calculate time saved
      const timeSaved = this.calculateTimeSaved(analysis);
      this.eventEmitter.emit('time_saved', { analysisId: analysis.id, minutes: timeSaved });

      return analysis;
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to create analysis'
      });
      throw error;
    }
  }

  async loadAnalysis(id: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const analysis = await this.analysisService.getAnalysis(id);

      this.updateState({
        currentAnalysis: analysis,
        isLoading: false
      });

      // Emit event
      this.eventEmitter.emit('analysis_loaded', analysis);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load analysis'
      });
      throw error;
    }
  }

  async loadAnalyses(projectId: string): Promise<void> {
    this.updateState({ isLoading: true, error: null });

    try {
      const analyses = await this.analysisService.listAnalyses(projectId);

      this.updateState({
        analyses,
        isLoading: false
      });

      // Calculate total time saved
      const totalTimeSaved = analyses.reduce((sum, a) => sum + a.timeSavedMinutes, 0);
      this.eventEmitter.emit('total_time_saved', totalTimeSaved);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to load analyses'
      });
      throw error;
    }
  }

  async updateCell(cellId: string, data: IUpdateCellData): Promise<void> {
    if (!this.state.currentAnalysis) {
      throw new Error('No analysis loaded');
    }

    this.updateState({ isSaving: true, error: null });

    try {
      const updatedCell = await this.analysisService.updateGridCell(
        this.state.currentAnalysis.id,
        cellId,
        data
      );

      // Update current analysis
      const updatedCells = this.state.currentAnalysis.grid.cells.map(c =>
        c.id === cellId ? updatedCell : c
      );

      const updatedAnalysis = {
        ...this.state.currentAnalysis,
        grid: {
          ...this.state.currentAnalysis.grid,
          cells: updatedCells
        }
      } as Analysis;

      this.updateState({
        currentAnalysis: updatedAnalysis,
        selectedCell: updatedCell,
        isSaving: false
      });

      // Emit event
      this.eventEmitter.emit('cell_updated', { cellId, cell: updatedCell });

      // Schedule auto-save
      this.scheduleAutoSave();
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to update cell'
      });
      throw error;
    }
  }

  selectCell(cellId: string): void {
    if (!this.state.currentAnalysis) return;

    const cell = this.state.currentAnalysis.grid.cells.find(c => c.id === cellId);

    if (cell) {
      this.updateState({ selectedCell: cell });
      this.eventEmitter.emit('cell_selected', cell);
    }
  }

  async addEvidence(cellId: string, evidence: Evidence): Promise<void> {
    if (!this.state.currentAnalysis) {
      throw new Error('No analysis loaded');
    }

    this.updateState({ isSaving: true });

    try {
      const updatedCell = await this.analysisService.addEvidence(
        this.state.currentAnalysis.id,
        cellId,
        evidence
      );

      this.updateCellInState(updatedCell);
      this.updateState({ isSaving: false });

      this.eventEmitter.emit('evidence_added', { cellId, evidence });
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to add evidence'
      });
      throw error;
    }
  }

  async removeEvidence(cellId: string, evidenceId: string): Promise<void> {
    if (!this.state.currentAnalysis) {
      throw new Error('No analysis loaded');
    }

    this.updateState({ isSaving: true });

    try {
      const updatedCell = await this.analysisService.removeEvidence(
        this.state.currentAnalysis.id,
        cellId,
        evidenceId
      );

      this.updateCellInState(updatedCell);
      this.updateState({ isSaving: false });

      this.eventEmitter.emit('evidence_removed', { cellId, evidenceId });
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to remove evidence'
      });
      throw error;
    }
  }

  async generateSuggestions(): Promise<void> {
    if (!this.state.currentAnalysis) {
      throw new Error('No analysis loaded');
    }

    this.updateState({ isLoading: true });

    try {
      const suggestions = await this.analysisService.generateSuggestions(
        this.state.currentAnalysis.id
      );

      this.updateState({
        suggestions,
        isLoading: false
      });

      this.eventEmitter.emit('suggestions_generated', suggestions);
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to generate suggestions'
      });
      throw error;
    }
  }

  async autoFillCell(cellId: string): Promise<void> {
    if (!this.state.currentAnalysis) {
      throw new Error('No analysis loaded');
    }

    this.updateState({ isSaving: true });

    try {
      const updatedCell = await this.analysisService.autoFillCell(
        this.state.currentAnalysis.id,
        cellId
      );

      this.updateCellInState(updatedCell);
      this.updateState({ isSaving: false });

      // Track time saved
      const timeSaved = 5; // Assume 5 minutes saved per auto-fill
      this.eventEmitter.emit('time_saved', { cellId, minutes: timeSaved });
    } catch (error: any) {
      this.updateState({
        isSaving: false,
        error: error.message || 'Failed to auto-fill cell'
      });
      throw error;
    }
  }

  async extractThemes(transcriptIds: string[]): Promise<void> {
    if (!this.state.currentAnalysis) {
      throw new Error('No analysis loaded');
    }

    this.updateState({ isLoading: true });

    try {
      const themes = await this.analysisService.extractThemes(
        this.state.currentAnalysis.id,
        transcriptIds
      );

      this.updateState({
        themes,
        isLoading: false
      });

      this.eventEmitter.emit('themes_extracted', themes);

      // Track time saved
      const timeSaved = transcriptIds.length * 10; // 10 minutes per transcript
      this.eventEmitter.emit('time_saved', { action: 'theme_extraction', minutes: timeSaved });
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to extract themes'
      });
      throw error;
    }
  }

  async exportAnalysis(format: ExportFormat): Promise<void> {
    if (!this.state.currentAnalysis) {
      throw new Error('No analysis loaded');
    }

    this.updateState({ isLoading: true });

    try {
      const blob = await this.analysisService.exportAnalysis(
        this.state.currentAnalysis.id,
        format
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.state.currentAnalysis.name}.${this.getFileExtension(format)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.updateState({ isLoading: false });

      this.eventEmitter.emit('analysis_exported', { format });
    } catch (error: any) {
      this.updateState({
        isLoading: false,
        error: error.message || 'Failed to export analysis'
      });
      throw error;
    }
  }

  subscribe(listener: (state: AnalysisState) => void): () => void {
    listener(this.state);
    return this.eventEmitter.on('state_change', listener);
  }

  // Private methods
  private updateState(partial: Partial<AnalysisState>): void {
    this.state = { ...this.state, ...partial };
    this.eventEmitter.emit('state_change', this.state);
  }

  private updateCellInState(updatedCell: GridCell): void {
    if (!this.state.currentAnalysis) return;

    const updatedCells = this.state.currentAnalysis.grid.cells.map(c =>
      c.id === updatedCell.id ? updatedCell : c
    );

    const updatedAnalysis = {
      ...this.state.currentAnalysis,
      grid: {
        ...this.state.currentAnalysis.grid,
        cells: updatedCells
      }
    } as Analysis;

    this.updateState({
      currentAnalysis: updatedAnalysis,
      selectedCell: this.state.selectedCell?.id === updatedCell.id ? updatedCell : this.state.selectedCell
    });
  }

  private validateAnalysisData(data: ICreateAnalysisData): void {
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('Analysis name must be at least 3 characters');
    }

    if (!data.rows || data.rows.length === 0) {
      throw new Error('At least one row is required');
    }

    if (!data.columns || data.columns.length === 0) {
      throw new Error('At least one column is required');
    }

    if (data.rows.length > 20) {
      throw new Error('Maximum 20 rows allowed');
    }

    if (data.columns.length > 20) {
      throw new Error('Maximum 20 columns allowed');
    }
  }

  private calculateTimeSaved(analysis: Analysis): number {
    // Calculate based on grid size and completion
    const cellCount = analysis.cellCount;
    const manualTimePerCell = 5; // 5 minutes per cell manually
    const aiTimePerCell = 0.5; // 30 seconds with AI
    return Math.round(cellCount * (manualTimePerCell - aiTimePerCell));
  }

  private scheduleAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      this.eventEmitter.emit('auto_save');
    }, 5000); // Auto-save after 5 seconds of inactivity
  }

  private getFileExtension(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.EXCEL:
        return 'xlsx';
      case ExportFormat.CSV:
        return 'csv';
      case ExportFormat.PDF:
        return 'pdf';
      case ExportFormat.POWERPOINT:
        return 'pptx';
      default:
        return 'file';
    }
  }
}