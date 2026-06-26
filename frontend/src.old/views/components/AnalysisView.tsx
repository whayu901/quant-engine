/**
 * Analysis View - Pure presentation component
 */

import React, { useState } from 'react';
import type { Analysis, AnalysisInsight } from '../../models/entities';

interface AnalysisViewProps {
  analyses: Analysis[];
  selectedAnalysis: Analysis | null;
  insights: AnalysisInsight[];
  isLoading: boolean;
  onSelectAnalysis: (analysis: Analysis) => void;
  onCreateAnalysis: (name: string, type: string) => Promise<void>;
  onExtractThemes: () => Promise<void>;
  onAnalyzeSegment: (segment: string) => Promise<void>;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  analyses,
  selectedAnalysis,
  insights,
  isLoading,
  onSelectAnalysis,
  onCreateAnalysis,
  onExtractThemes,
  onAnalyzeSegment
}) => {
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [newAnalysisName, setNewAnalysisName] = useState('');
  const [newAnalysisType, setNewAnalysisType] = useState('thematic');
  const [selectedText, setSelectedText] = useState('');

  const handleCreateAnalysis = async () => {
    if (newAnalysisName) {
      await onCreateAnalysis(newAnalysisName, newAnalysisType);
      setNewAnalysisName('');
      setShowNewAnalysis(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velocity-blue mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Sidebar - Analysis List */}
      <div className="col-span-3 bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Analyses</h2>
          <button
            onClick={() => setShowNewAnalysis(true)}
            className="text-velocity-blue hover:text-velocity-blue-dark"
          >
            + New
          </button>
        </div>

        {showNewAnalysis && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <input
              type="text"
              value={newAnalysisName}
              onChange={(e) => setNewAnalysisName(e.target.value)}
              placeholder="Analysis name"
              className="w-full px-3 py-2 border border-slate-200 rounded mb-2"
            />
            <select
              value={newAnalysisType}
              onChange={(e) => setNewAnalysisType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded mb-2"
            >
              <option value="thematic">Thematic Analysis</option>
              <option value="sentiment">Sentiment Analysis</option>
              <option value="narrative">Narrative Analysis</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleCreateAnalysis}
                className="flex-1 px-3 py-1 bg-velocity-blue text-white rounded text-sm"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewAnalysis(false)}
                className="flex-1 px-3 py-1 border border-slate-200 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {analyses.map((analysis) => (
            <button
              key={analysis.id}
              onClick={() => onSelectAnalysis(analysis)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedAnalysis?.id === analysis.id
                  ? 'bg-velocity-blue text-white'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="font-medium">{analysis.name}</div>
              <div className={`text-sm ${
                selectedAnalysis?.id === analysis.id ? 'text-white/80' : 'text-slate-600'
              }`}>
                {analysis.type}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Analysis Grid */}
      <div className="col-span-9">
        {selectedAnalysis ? (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                {selectedAnalysis.name}
              </h1>
              <button
                onClick={onExtractThemes}
                className="px-4 py-2 bg-gradient-to-r from-velocity-blue to-neural-purple text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Extract Themes
              </button>
            </div>

            {/* Selected Text Action */}
            {selectedText && (
              <div className="mb-4 p-4 bg-velocity-blue/10 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Selected text:</p>
                <p className="text-slate-900 mb-3">"{selectedText}"</p>
                <button
                  onClick={() => {
                    onAnalyzeSegment(selectedText);
                    setSelectedText('');
                  }}
                  className="px-3 py-1 bg-velocity-blue text-white rounded text-sm"
                >
                  Analyze Selection
                </button>
              </div>
            )}

            {/* Insights Grid */}
            <div className="space-y-4" onMouseUp={handleTextSelection}>
              {insights.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  <p>No insights yet.</p>
                  <p className="text-sm mt-2">Click "Extract Themes" to begin analysis.</p>
                </div>
              ) : (
                insights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-slate-900">{insight.type}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        insight.confidence > 0.8
                          ? 'bg-green-100 text-green-700'
                          : insight.confidence > 0.5
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-slate-700 mb-2">{insight.content}</p>
                    {insight.evidence && (
                      <div className="text-sm text-slate-600 italic border-l-2 border-slate-300 pl-3">
                        "{insight.evidence}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <p className="text-slate-600">Select or create an analysis to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};