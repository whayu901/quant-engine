/**
 * Reports View - Pure presentation component
 */

import React, { useState } from 'react';
import type { Project, Report } from '../../models/entities';

interface ReportsViewProps {
  projects: Project[];
  reports: Report[];
  selectedProject: Project | null;
  isLoading: boolean;
  isGenerating: boolean;
  onSelectProject: (project: Project | null) => void;
  onGenerateReport: (projectId: string, format: string, options: any) => Promise<string>;
  onDeleteReport: (reportId: string) => Promise<void>;
  onDownloadReport: (reportId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  reports,
  selectedProject,
  isLoading,
  isGenerating,
  onSelectProject,
  onGenerateReport,
  onDeleteReport,
  onDownloadReport
}) => {
  const [reportFormat, setReportFormat] = useState('pdf');
  const [includeOptions, setIncludeOptions] = useState({
    transcripts: true,
    themes: true,
    insights: true,
    charts: true,
    summary: true
  });

  const handleGenerateReport = async () => {
    if (!selectedProject) return;

    try {
      await onGenerateReport(selectedProject.id, reportFormat, includeOptions);
      // Reset after successful generation
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-velocity-blue mx-auto mb-4"></div>
          <p className="text-slate-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Export</h1>
        <p className="text-slate-600 mt-1">Generate and manage your research reports</p>
      </div>

      {/* Generate Report Section */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Generate New Report</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Project
            </label>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find(p => p.id === e.target.value);
                onSelectProject(project || null);
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-velocity-blue"
            >
              <option value="">Choose a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Export Format
            </label>
            <select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-velocity-blue"
            >
              <option value="pdf">PDF Document</option>
              <option value="pptx">PowerPoint Presentation</option>
              <option value="docx">Word Document</option>
              <option value="xlsx">Excel Spreadsheet</option>
            </select>
          </div>
        </div>

        {/* Include Options */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Include in Report
          </label>
          <div className="space-y-2">
            {Object.entries(includeOptions).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setIncludeOptions({
                    ...includeOptions,
                    [key]: e.target.checked
                  })}
                  className="mr-3 text-velocity-blue focus:ring-velocity-blue"
                />
                <span className="text-slate-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateReport}
          disabled={!selectedProject || isGenerating}
          className="mt-6 w-full py-3 bg-gradient-to-r from-velocity-blue to-neural-purple text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
        >
          {isGenerating ? 'Generating Report...' : 'Generate Report'}
        </button>
      </div>

      {/* Previous Reports */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Previous Reports ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <div className="bg-slate-50 rounded-lg p-8 text-center">
            <p className="text-slate-600">No reports generated yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="font-medium text-slate-900">{report.name}</h3>
                  <p className="text-sm text-slate-600">
                    {report.format.toUpperCase()} • {report.projectName} • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDownloadReport(report.id)}
                    className="px-4 py-2 bg-velocity-blue text-white rounded-lg hover:bg-velocity-blue-dark transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => onDeleteReport(report.id)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};