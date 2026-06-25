/**
 * Analysis Insight Entity - MVC/SOLID
 */

export interface AnalysisInsight {
  id: string;
  analysisId: string;
  type: 'theme' | 'sentiment' | 'pattern' | 'quote' | 'recommendation';
  content: string;
  evidence?: string;
  confidence: number;
  metadata?: Record<string, any>;
  createdAt: string;
}