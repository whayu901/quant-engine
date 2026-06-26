/**
 * Reports Container - MVC/SOLID
 * Manages report generation and export
 */

import React, { useEffect, useState } from 'react';
import { Services } from '../../di/services';
import { ReportsView } from '../components/ReportsView';
import type { Project, Report } from '../../models/entities';

export const ReportsContainer: React.FC = () => {
  const projectController = Services.projects;
  const reportController = Services.reports;

  const [projects, setProjects] = useState<Project[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [projectsData, reportsData] = await Promise.all([
        projectController.loadProjects(),
        reportController.getReports()
      ]);

      setProjects(projectsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (projectId: string, format: string, options: any) => {
    try {
      setIsGenerating(true);

      const report = await reportController.generateReport({
        projectId,
        format,
        options
      });

      setReports([report, ...reports]);

      // Return the download URL
      return report.downloadUrl;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await reportController.deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const url = await reportController.getDownloadUrl(reportId);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  return (
    <ReportsView
      projects={projects}
      reports={reports}
      selectedProject={selectedProject}
      isLoading={isLoading}
      isGenerating={isGenerating}
      onSelectProject={setSelectedProject}
      onGenerateReport={handleGenerateReport}
      onDeleteReport={handleDeleteReport}
      onDownloadReport={handleDownloadReport}
    />
  );
};