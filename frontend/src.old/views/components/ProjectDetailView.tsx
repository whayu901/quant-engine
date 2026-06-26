/**
 * Project Detail View - Pure presentation component
 */

import React, { useState } from 'react';
import type { Project, Transcript } from '../../models/entities';

interface ProjectDetailViewProps {
  project: Project | null;
  transcripts: Transcript[];
  isLoading: boolean;
  error: string | null;
  onUploadTranscript: (file: File) => Promise<void>;
  onDeleteTranscript: (id: string) => Promise<void>;
  onRunAnalysis: () => Promise<void>;
  onBack: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  transcripts,
  isLoading,
  error,
  onUploadTranscript,
  onDeleteTranscript,
  onRunAnalysis,
  onBack
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await onUploadTranscript(file);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velocity-blue mx-auto mb-4"></div>
          <p className="text-slate-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 mb-2 flex items-center"
          >
            ← Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          {project.description && (
            <p className="text-slate-600 mt-1">{project.description}</p>
          )}
        </div>
        <button
          onClick={onRunAnalysis}
          disabled={transcripts.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-velocity-blue to-neural-purple text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          Run Analysis →
        </button>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-velocity-blue bg-velocity-blue/5' : 'border-slate-300'
        } ${isUploading ? 'opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="audio/*,video/*,.txt,.docx,.pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <div className="text-4xl mb-4">📁</div>
          <p className="text-slate-900 font-medium mb-1">
            {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
          </p>
          <p className="text-sm text-slate-600">
            Support for audio, video, text, and document files
          </p>
        </label>
      </div>

      {/* Transcripts List */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Transcripts ({transcripts.length})
        </h2>

        {transcripts.length === 0 ? (
          <div className="bg-slate-50 rounded-lg p-8 text-center">
            <p className="text-slate-600">No transcripts yet. Upload files to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transcripts.map((transcript) => (
              <div
                key={transcript.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{transcript.fileName}</h3>
                  <p className="text-sm text-slate-600">
                    {transcript.duration} • {transcript.language} • {transcript.status}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteTranscript(transcript.id)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};