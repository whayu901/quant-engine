import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3x3, Plus, Edit2, Trash2, Save, X, ChevronRight,
  MessageSquare, TrendingUp, TrendingDown, Minus, Filter,
  Download, Share2, Maximize2, Search, Sparkles
} from 'lucide-react';
import { Theme, Evidence, Sentiment, AnalysisGrid as GridType } from '../../types/api';
import { Button } from '../../components/ui/Button';
import { EvidencePanel } from './EvidencePanel';
import { cn } from '../../lib/utils';

interface AnalysisGridProps {
  grid: GridType;
  themes: Theme[];
  onUpdate?: (grid: GridType) => void;
  onExport?: () => void;
  projectId: string;
}

export const AnalysisGrid: React.FC<AnalysisGridProps> = ({
  grid,
  themes,
  onUpdate,
  onExport,
  projectId
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: string; column: string } | null>(null);
  const [showEvidencePanel, setShowEvidencePanel] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSentiment, setFilterSentiment] = useState<Sentiment | 'all'>('all');

  // Get evidence for selected cell
  const selectedEvidence = useMemo(() => {
    if (!selectedCell) return [];
    const cell = grid.cells.find(
      c => c.row_id === selectedCell.row && c.column_id === selectedCell.column
    );
    return cell?.evidence || [];
  }, [selectedCell, grid.cells]);

  // Filter themes based on search and sentiment
  const filteredThemes = useMemo(() => {
    return themes.filter(theme => {
      const matchesSearch = searchQuery === '' ||
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSentiment = filterSentiment === 'all' ||
        theme.sentiment === filterSentiment;

      return matchesSearch && matchesSentiment;
    });
  }, [themes, searchQuery, filterSentiment]);

  const handleCellClick = (rowId: string, columnId: string) => {
    setSelectedCell({ row: rowId, column: columnId });
    setShowEvidencePanel(true);
  };

  const getSentimentIcon = (sentiment?: Sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-slate-500" />;
      case 'mixed':
        return <div className="flex gap-0.5">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <TrendingDown className="w-3 h-3 text-red-500" />
        </div>;
      default:
        return null;
    }
  };

  const getSentimentColor = (sentiment?: Sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'negative':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'neutral':
        return 'bg-slate-50 border-slate-200 hover:bg-slate-100';
      case 'mixed':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      default:
        return 'bg-white border-slate-200 hover:bg-slate-50';
    }
  };

  return (
    <div className="h-full flex">
      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-velocity-blue/10 to-neural-purple/10 rounded-xl">
                <Grid3x3 className="w-5 h-5 text-velocity-blue" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {grid.name || 'Analysis Grid'}
                </h2>
                <p className="text-sm text-slate-600">
                  {filteredThemes.length} themes • {grid.cells.length} insights
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search themes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velocity-blue focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value as Sentiment | 'all')}
                className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velocity-blue focus:border-transparent"
              >
                <option value="all">All sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid Container */}
        <div className="flex-1 overflow-auto bg-slate-50 p-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left">
                      <span className="text-sm font-semibold text-slate-700">
                        Themes / Categories
                      </span>
                    </th>
                    {grid.columns.map(column => (
                      <th
                        key={column.id}
                        className="px-4 py-3 text-left min-w-[200px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">
                            {column.label}
                          </span>
                          {editMode && (
                            <button className="p-1 hover:bg-slate-200 rounded">
                              <Edit2 className="w-3 h-3 text-slate-400" />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    {editMode && (
                      <th className="px-4 py-3 w-10">
                        <button className="p-1 hover:bg-slate-200 rounded">
                          <Plus className="w-4 h-4 text-slate-400" />
                        </button>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {grid.rows.map((row, rowIndex) => {
                    const theme = filteredThemes.find(t => t.id === row.id);
                    if (!theme && !editMode) return null;

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-200 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {theme && getSentimentIcon(theme.sentiment)}
                            <div>
                              <p className="font-medium text-slate-900">
                                {row.label}
                              </p>
                              {theme && (
                                <p className="text-xs text-slate-500">
                                  {theme.frequency} mentions • {Math.round(theme.confidence * 100)}% confidence
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        {grid.columns.map(column => {
                          const cell = grid.cells.find(
                            c => c.row_id === row.id && c.column_id === column.id
                          );
                          const isSelected = selectedCell?.row === row.id &&
                                           selectedCell?.column === column.id;

                          return (
                            <td
                              key={column.id}
                              className="px-4 py-3 cursor-pointer"
                              onClick={() => handleCellClick(row.id, column.id)}
                            >
                              <motion.div
                                className={cn(
                                  'p-3 rounded-lg border transition-all',
                                  isSelected
                                    ? 'border-velocity-blue bg-velocity-blue/5'
                                    : getSentimentColor(cell?.sentiment),
                                  'hover:shadow-sm'
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {cell ? (
                                  <div>
                                    <p className="text-sm text-slate-700 line-clamp-3">
                                      {cell.content}
                                    </p>
                                    {cell.evidence && cell.evidence.length > 0 && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <MessageSquare className="w-3 h-3 text-slate-400" />
                                        <span className="text-xs text-slate-500">
                                          {cell.evidence.length} quotes
                                        </span>
                                        {cell.count && (
                                          <>
                                            <span className="text-xs text-slate-400">•</span>
                                            <span className="text-xs text-slate-500">
                                              {cell.count} occurrences
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm text-slate-400 italic">
                                    {editMode ? 'Click to add content' : 'No data'}
                                  </div>
                                )}
                              </motion.div>
                            </td>
                          );
                        })}
                        {editMode && (
                          <td className="px-4 py-3">
                            <button className="p-1 hover:bg-red-50 rounded">
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Row Button */}
            {editMode && (
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Row
                </Button>
              </div>
            )}
          </div>

          {/* AI Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-6 bg-gradient-to-r from-velocity-blue/5 to-neural-purple/5 rounded-xl border border-velocity-blue/20"
          >
            <div className="flex items-start gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm">
                <Sparkles className="w-5 h-5 text-velocity-blue" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  AI Insights
                </h3>
                <p className="text-sm text-slate-600">
                  Based on your analysis, we found 3 emerging patterns that might be worth exploring:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">
                    Price sensitivity increasing
                  </button>
                  <button className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">
                    Brand loyalty declining
                  </button>
                  <button className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">
                    New competitor mentioned
                  </button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
              >
                Explore
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Evidence Panel */}
      <AnimatePresence>
        {showEvidencePanel && (
          <EvidencePanel
            evidence={selectedEvidence}
            onClose={() => {
              setShowEvidencePanel(false);
              setSelectedCell(null);
            }}
            projectId={projectId}
          />
        )}
      </AnimatePresence>
    </div>
  );
};