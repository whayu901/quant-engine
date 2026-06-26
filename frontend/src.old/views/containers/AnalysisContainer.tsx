/**
 * Analysis Container - MVC/SOLID
 * Orchestrates analysis view with grid and AI capabilities
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Services } from '../../di/services';
import { AnalysisView } from '../components/AnalysisView';
import type { Analysis, AnalysisInsight } from '../../models/entities';

export const AnalysisContainer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const analysisController = Services.analysis;

  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    if (projectId) {
      loadAnalyses();
    }
  }, [projectId]);

  const loadAnalyses = async () => {
    try {
      setIsLoading(true);
      const data = await analysisController.getProjectAnalyses(projectId!);
      setAnalyses(data);

      if (data.length > 0) {
        setSelectedAnalysis(data[0]);
        await loadInsights(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async (analysisId: string) => {
    try {
      const data = await analysisController.getAnalysisInsights(analysisId);
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const handleCreateAnalysis = async (name: string, type: string) => {
    if (!projectId) return;

    try {
      const newAnalysis = await analysisController.createAnalysis(projectId, {
        name,
        type,
        parameters: {}
      });

      setAnalyses([...analyses, newAnalysis]);
      setSelectedAnalysis(newAnalysis);
      await loadInsights(newAnalysis.id);
    } catch (error) {
      console.error('Failed to create analysis:', error);
    }
  };

  const handleExtractThemes = async () => {
    if (!selectedAnalysis) return;

    try {
      await analysisController.extractThemes(selectedAnalysis.id);
      await loadInsights(selectedAnalysis.id);
    } catch (error) {
      console.error('Failed to extract themes:', error);
    }
  };

  const handleAnalyzeSegment = async (segment: string) => {
    if (!selectedAnalysis) return;

    try {
      const insight = await analysisController.analyzeSegment(selectedAnalysis.id, segment);
      setInsights([...insights, insight]);
    } catch (error) {
      console.error('Failed to analyze segment:', error);
    }
  };

  return (
    <AnalysisView
      analyses={analyses}
      selectedAnalysis={selectedAnalysis}
      insights={insights}
      isLoading={isLoading}
      onSelectAnalysis={async (analysis) => {
        setSelectedAnalysis(analysis);
        await loadInsights(analysis.id);
      }}
      onCreateAnalysis={handleCreateAnalysis}
      onExtractThemes={handleExtractThemes}
      onAnalyzeSegment={handleAnalyzeSegment}
    />
  );
};