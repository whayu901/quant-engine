/**
 * Analysis Repository - SOLID: Single Responsibility & Open/Closed
 * Handles analysis data access with caching
 */

import { IAnalysisService, ICreateAnalysisData, IUpdateCellData, ISuggestionResult, IThemeResult, ExportFormat } from '../../interfaces/IAnalysisService';
import { Analysis, GridCell, Evidence, Insight } from '../entities/Analysis';
import api from '../../lib/api/client';

export class AnalysisRepository implements IAnalysisService {
  private cache: Map<string, { data: Analysis; timestamp: number }> = new Map();
  private cacheTTL: number = 300000; // 5 minutes

  async createAnalysis(projectId: string, data: ICreateAnalysisData): Promise<Analysis> {
    try {
      const response = await api.post(`/projects/${projectId}/analyses`, {
        name: data.name,
        description: data.description,
        type: data.type,
        rows: data.rows,
        columns: data.columns,
        transcript_ids: data.transcriptIds
      });

      const analysis = Analysis.fromJSON(response);
      this.addToCache(analysis.id, analysis);
      return analysis;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create analysis');
    }
  }

  async getAnalysis(id: string): Promise<Analysis> {
    // Check cache first
    const cached = this.getFromCache(id);
    if (cached) return cached;

    try {
      const response = await api.get(`/analyses/${id}`);
      const analysis = Analysis.fromJSON(response);
      this.addToCache(id, analysis);
      return analysis;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch analysis');
    }
  }

  async updateAnalysis(id: string, data: Partial<Analysis>): Promise<Analysis> {
    try {
      const response = await api.patch(`/analyses/${id}`, {
        name: data.name,
        description: data.description,
        status: data.status
      });

      const analysis = Analysis.fromJSON(response);
      this.addToCache(id, analysis);
      return analysis;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update analysis');
    }
  }

  async deleteAnalysis(id: string): Promise<boolean> {
    try {
      await api.delete(`/analyses/${id}`);
      this.removeFromCache(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async listAnalyses(projectId: string): Promise<Analysis[]> {
    try {
      const response = await api.get(`/projects/${projectId}/analyses`);
      return response.analyses.map((a: any) => Analysis.fromJSON(a));
    } catch (error) {
      throw new Error('Failed to fetch analyses');
    }
  }

  async updateGridCell(analysisId: string, cellId: string, data: IUpdateCellData): Promise<GridCell> {
    try {
      const response = await api.patch(`/analyses/${analysisId}/cells/${cellId}`, {
        content: data.content,
        status: data.status,
        evidence: data.evidence?.map(e => e.toJSON()),
        ai_suggestion: data.aiSuggestion
      });

      const cell = GridCell.fromJSON(response);

      // Update cache if analysis is cached
      const cached = this.getFromCache(analysisId);
      if (cached) {
        const updatedCells = cached.grid.cells.map(c =>
          c.id === cellId ? cell : c
        );
        const updatedAnalysis = new Analysis(
          cached.id,
          cached.projectId,
          cached.name,
          cached.description,
          cached.type,
          cached.status,
          { ...cached.grid, cells: updatedCells } as any,
          cached.insights,
          cached.createdAt,
          new Date(),
          cached.createdBy,
          cached.timeSavedMinutes
        );
        this.addToCache(analysisId, updatedAnalysis);
      }

      return cell;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update cell');
    }
  }

  async addEvidence(analysisId: string, cellId: string, evidence: Evidence): Promise<GridCell> {
    try {
      const response = await api.post(
        `/analyses/${analysisId}/cells/${cellId}/evidence`,
        evidence.toJSON()
      );

      return GridCell.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to add evidence');
    }
  }

  async removeEvidence(analysisId: string, cellId: string, evidenceId: string): Promise<GridCell> {
    try {
      const response = await api.delete(
        `/analyses/${analysisId}/cells/${cellId}/evidence/${evidenceId}`
      );

      return GridCell.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to remove evidence');
    }
  }

  async generateSuggestions(analysisId: string): Promise<ISuggestionResult[]> {
    try {
      const response = await api.post(`/analyses/${analysisId}/suggestions`);

      return response.suggestions.map((s: any) => ({
        cellId: s.cell_id,
        suggestion: s.suggestion,
        confidence: s.confidence,
        evidence: (s.evidence || []).map((e: any) => Evidence.fromJSON(e))
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to generate suggestions');
    }
  }

  async autoFillCell(analysisId: string, cellId: string): Promise<GridCell> {
    try {
      const response = await api.post(`/analyses/${analysisId}/cells/${cellId}/autofill`);
      return GridCell.fromJSON(response);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to auto-fill cell');
    }
  }

  async extractThemes(analysisId: string, transcriptIds: string[]): Promise<IThemeResult[]> {
    try {
      const response = await api.post(`/analyses/${analysisId}/extract-themes`, {
        transcript_ids: transcriptIds
      });

      return response.themes.map((t: any) => ({
        theme: t.theme,
        description: t.description,
        occurrences: t.occurrences,
        evidence: (t.evidence || []).map((e: any) => Evidence.fromJSON(e)),
        sentiment: t.sentiment
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to extract themes');
    }
  }

  async exportAnalysis(analysisId: string, format: ExportFormat): Promise<Blob> {
    try {
      const response = await api.get(`/analyses/${analysisId}/export`, {
        params: { format },
        responseType: 'blob'
      });

      return new Blob([response], {
        type: this.getMimeType(format)
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to export analysis');
    }
  }

  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.EXCEL:
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case ExportFormat.CSV:
        return 'text/csv';
      case ExportFormat.PDF:
        return 'application/pdf';
      case ExportFormat.POWERPOINT:
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      default:
        return 'application/octet-stream';
    }
  }

  // Cache management
  private getFromCache(id: string): Analysis | null {
    const cached = this.cache.get(id);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(id);
      return null;
    }

    return cached.data;
  }

  private addToCache(id: string, analysis: Analysis): void {
    this.cache.set(id, {
      data: analysis,
      timestamp: Date.now()
    });
  }

  private removeFromCache(id: string): void {
    this.cache.delete(id);
  }

  public clearCache(): void {
    this.cache.clear();
  }
}