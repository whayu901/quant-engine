/**
 * Project Detail Container - MVC/SOLID
 * Manages state and orchestrates project detail view
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Services } from '../../di/services';
import { ProjectDetailView } from '../components/ProjectDetailView';
import type { Project, Transcript } from '../../models/entities';

export const ProjectDetailContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectController = Services.projects;
  const transcriptController = Services.transcripts;

  const [project, setProject] = useState<Project | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const loadProjectDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load project and transcripts in parallel
      const [projectData, transcriptsData] = await Promise.all([
        projectController.getProject(id),
        transcriptController.getProjectTranscripts(id)
      ]);

      setProject(projectData);
      setTranscripts(transcriptsData);
    } catch (err) {
      setError('Failed to load project details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadTranscript = async (file: File) => {
    if (!id) return;

    try {
      await transcriptController.uploadTranscript(id, file);
      await loadProjectDetails(); // Reload to show new transcript
    } catch (err) {
      setError('Failed to upload transcript');
    }
  };

  const handleDeleteTranscript = async (transcriptId: string) => {
    try {
      await transcriptController.deleteTranscript(transcriptId);
      await loadProjectDetails(); // Reload after deletion
    } catch (err) {
      setError('Failed to delete transcript');
    }
  };

  const handleRunAnalysis = async () => {
    if (!id) return;

    try {
      await projectController.runAnalysis(id);
      navigate(`/analysis?projectId=${id}`);
    } catch (err) {
      setError('Failed to start analysis');
    }
  };

  return (
    <ProjectDetailView
      project={project}
      transcripts={transcripts}
      isLoading={isLoading}
      error={error}
      onUploadTranscript={handleUploadTranscript}
      onDeleteTranscript={handleDeleteTranscript}
      onRunAnalysis={handleRunAnalysis}
      onBack={() => navigate('/projects')}
    />
  );
};