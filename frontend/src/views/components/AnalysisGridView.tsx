/**
 * Analysis Grid View - SOLID: Single Responsibility
 * Pure presentation component for analysis grid
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3x3,
  Plus,
  Zap,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Edit,
  Trash
} from 'lucide-react';
import { Analysis, GridRow, GridColumn, GridCell, Evidence } from '../../models/entities/Analysis';

export interface AnalysisGridViewProps {
  // Data
  analysis: Analysis | null;
  selectedCell: GridCell | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Events
  onCellClick: (cellId: string) => void;
  onCellEdit: (cellId: string, content: string) => void;
  onAddEvidence: (cellId: string) => void;
  onRemoveEvidence: (cellId: string, evidenceId: string) => void;
  onAutoFill: (cellId: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onDeleteRow: (rowId: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

/**
 * Pure View Component - No business logic
 * SOLID: Interface Segregation - Only receives needed props
 */
export const AnalysisGridView: React.FC<AnalysisGridViewProps> = ({
  analysis,
  selectedCell,
  isLoading,
  isSaving,
  error,
  onCellClick,
  onCellEdit,
  onAddEvidence,
  onRemoveEvidence,
  onAutoFill,
  onAddRow,
  onAddColumn,
  onDeleteRow,
  onDeleteColumn
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!analysis) {
    return <EmptyState />;
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <GridHeader
        analysis={analysis}
        isSaving={isSaving}
      />

      {/* Grid Container */}
      <div className="flex-1 overflow-auto p-4">
        <div className="min-w-fit">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 bg-slate-50 p-2 border border-slate-200">
                  {/* Corner cell */}
                  <div className="w-32 h-10 flex items-center justify-center">
                    <Grid3x3 className="w-5 h-5 text-slate-400" />
                  </div>
                </th>
                {analysis.grid.columns.map((column) => (
                  <ColumnHeader
                    key={column.id}
                    column={column}
                    onDelete={() => onDeleteColumn(column.id)}
                  />
                ))}
                <th className="sticky top-0 z-10 bg-slate-50 p-2 border border-slate-200">
                  <AddColumnButton onClick={onAddColumn} />
                </th>
              </tr>
            </thead>
            <tbody>
              {analysis.grid.rows.map((row) => (
                <GridRowComponent
                  key={row.id}
                  row={row}
                  columns={analysis.grid.columns}
                  cells={analysis.grid.cells.filter(c => c.rowId === row.id)}
                  selectedCell={selectedCell}
                  onCellClick={onCellClick}
                  onCellEdit={onCellEdit}
                  onAutoFill={onAutoFill}
                  onDeleteRow={() => onDeleteRow(row.id)}
                />
              ))}
              <tr>
                <td className="sticky left-0 bg-slate-50 p-2 border border-slate-200">
                  <AddRowButton onClick={onAddRow} />
                </td>
                <td colSpan={analysis.grid.columns.length + 1} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cell Detail Panel */}
      {selectedCell && (
        <CellDetailPanel
          cell={selectedCell}
          onEdit={(content) => onCellEdit(selectedCell.id, content)}
          onAddEvidence={() => onAddEvidence(selectedCell.id)}
          onRemoveEvidence={(evidenceId) => onRemoveEvidence(selectedCell.id, evidenceId)}
          onAutoFill={() => onAutoFill(selectedCell.id)}
        />
      )}
    </div>
  );
};

/**
 * Sub-components - SOLID: Single Responsibility
 */

const LoadingState: React.FC = () => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-velocity-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-600">Loading analysis grid...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center max-w-md">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Analysis</h3>
      <p className="text-slate-600">{error}</p>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center">
      <Grid3x3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Analysis Selected</h3>
      <p className="text-slate-600">Select or create an analysis to get started</p>
    </div>
  </div>
);

const GridHeader: React.FC<{ analysis: Analysis; isSaving: boolean }> = ({
  analysis,
  isSaving
}) => (
  <div className="px-6 py-4 border-b border-slate-200">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{analysis.name}</h2>
        <p className="text-sm text-slate-600 mt-1">
          {analysis.completionPercentage}% complete • {analysis.timeSavedMinutes} minutes saved
        </p>
      </div>
      {isSaving && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className="w-4 h-4 border-2 border-velocity-blue border-t-transparent rounded-full animate-spin" />
          Saving...
        </div>
      )}
    </div>
  </div>
);

const ColumnHeader: React.FC<{
  column: GridColumn;
  onDelete: () => void;
}> = ({ column, onDelete }) => (
  <th className="sticky top-0 z-10 bg-slate-50 p-2 border border-slate-200 group">
    <div className="flex items-center justify-between gap-2 min-w-[150px]">
      <span className="font-medium text-sm text-slate-700">{column.label}</span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
      >
        <Trash className="w-3 h-3 text-slate-500" />
      </button>
    </div>
  </th>
);

const GridRowComponent: React.FC<{
  row: GridRow;
  columns: GridColumn[];
  cells: GridCell[];
  selectedCell: GridCell | null;
  onCellClick: (cellId: string) => void;
  onCellEdit: (cellId: string, content: string) => void;
  onAutoFill: (cellId: string) => void;
  onDeleteRow: () => void;
}> = ({ row, columns, cells, selectedCell, onCellClick, onCellEdit, onAutoFill, onDeleteRow }) => (
  <tr>
    <td className="sticky left-0 z-10 bg-slate-50 p-2 border border-slate-200 group">
      <div className="flex items-center justify-between gap-2 min-w-[120px]">
        <span className="font-medium text-sm text-slate-700">{row.label}</span>
        <button
          onClick={onDeleteRow}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
        >
          <Trash className="w-3 h-3 text-slate-500" />
        </button>
      </div>
    </td>
    {columns.map((column) => {
      const cell = cells.find(c => c.columnId === column.id);
      return (
        <GridCellComponent
          key={`${row.id}-${column.id}`}
          cell={cell}
          isSelected={selectedCell?.id === cell?.id}
          onClick={() => cell && onCellClick(cell.id)}
          onEdit={(content) => cell && onCellEdit(cell.id, content)}
          onAutoFill={() => cell && onAutoFill(cell.id)}
        />
      );
    })}
    <td className="p-2 border border-slate-200" />
  </tr>
);

const GridCellComponent: React.FC<{
  cell?: GridCell;
  isSelected: boolean;
  onClick: () => void;
  onEdit: (content: string) => void;
  onAutoFill: () => void;
}> = ({ cell, isSelected, onClick, onEdit, onAutoFill }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(cell?.content || '');

  const handleSave = () => {
    onEdit(editValue);
    setIsEditing(false);
  };

  const statusColor = {
    empty: 'bg-white',
    draft: 'bg-amber-50',
    completed: 'bg-green-50'
  }[cell?.status || 'empty'];

  return (
    <td
      className={`
        p-2 border border-slate-200 cursor-pointer transition-all group
        ${isSelected ? 'ring-2 ring-velocity-blue' : 'hover:bg-slate-50'}
        ${statusColor}
      `}
      onClick={onClick}
    >
      {isEditing ? (
        <div className="flex gap-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-velocity-blue"
            autoFocus
          />
        </div>
      ) : (
        <div className="min-h-[60px] relative">
          <div className="text-sm text-slate-700">
            {cell?.content || (
              <span className="text-slate-400">Empty</span>
            )}
          </div>

          {/* Cell Actions */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 bg-white rounded hover:bg-slate-100"
            >
              <Edit className="w-3 h-3 text-slate-500" />
            </button>
            {!cell?.content && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAutoFill();
                }}
                className="p-1 bg-white rounded hover:bg-slate-100"
              >
                <Sparkles className="w-3 h-3 text-velocity-blue" />
              </button>
            )}
          </div>

          {/* Evidence Count */}
          {cell?.evidence && cell.evidence.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <FileText className="w-3 h-3" />
              {cell.evidence.length} evidence
            </div>
          )}

          {/* Status Indicator */}
          {cell?.status === 'completed' && (
            <CheckCircle className="absolute bottom-1 right-1 w-4 h-4 text-green-500" />
          )}
        </div>
      )}
    </td>
  );
};

const AddRowButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full py-2 flex items-center justify-center gap-1 text-sm text-velocity-blue hover:bg-velocity-blue/10 rounded transition-colors"
  >
    <Plus className="w-4 h-4" />
    Add Row
  </button>
);

const AddColumnButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 flex items-center gap-1 text-sm text-velocity-blue hover:bg-velocity-blue/10 rounded transition-colors"
  >
    <Plus className="w-4 h-4" />
    Add Column
  </button>
);

const CellDetailPanel: React.FC<{
  cell: GridCell;
  onEdit: (content: string) => void;
  onAddEvidence: () => void;
  onRemoveEvidence: (evidenceId: string) => void;
  onAutoFill: () => void;
}> = ({ cell, onEdit, onAddEvidence, onRemoveEvidence, onAutoFill }) => (
  <motion.div
    initial={{ height: 0 }}
    animate={{ height: 200 }}
    className="border-t border-slate-200 bg-slate-50 p-4"
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-slate-900">Cell Details</h3>
      <div className="flex gap-2">
        <button
          onClick={onAutoFill}
          className="px-3 py-1 text-sm bg-gradient-to-r from-velocity-blue to-neural-purple text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
        >
          <Zap className="w-3 h-3" />
          Auto-fill
        </button>
        <button
          onClick={onAddEvidence}
          className="px-3 py-1 text-sm bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Add Evidence
        </button>
      </div>
    </div>

    {/* Evidence List */}
    <div className="space-y-2 max-h-32 overflow-y-auto">
      {cell.evidence.map((evidence) => (
        <EvidenceItem
          key={evidence.id}
          evidence={evidence}
          onRemove={() => onRemoveEvidence(evidence.id)}
        />
      ))}
    </div>

    {/* AI Suggestion */}
    {cell.aiSuggestion && (
      <div className="mt-3 p-2 bg-velocity-blue/10 rounded-lg">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-velocity-blue mt-0.5" />
          <div>
            <p className="text-xs font-medium text-velocity-blue mb-1">AI Suggestion</p>
            <p className="text-sm text-slate-700">{cell.aiSuggestion}</p>
          </div>
        </div>
      </div>
    )}
  </motion.div>
);

const EvidenceItem: React.FC<{
  evidence: Evidence;
  onRemove: () => void;
}> = ({ evidence, onRemove }) => (
  <div className="flex items-start justify-between gap-2 p-2 bg-white rounded border border-slate-200">
    <div className="flex-1">
      <p className="text-sm text-slate-700">{evidence.text}</p>
      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
        {evidence.speaker && <span>{evidence.speaker}</span>}
        {evidence.formattedTimestamp && <span>{evidence.formattedTimestamp}</span>}
      </div>
    </div>
    <button
      onClick={onRemove}
      className="p-1 hover:bg-slate-100 rounded transition-colors"
    >
      <Trash className="w-3 h-3 text-slate-500" />
    </button>
  </div>
);