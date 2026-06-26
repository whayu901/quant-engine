// Project hooks (ViewModel layer) following MVVM pattern
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, mutationKeys } from '../../../core/api/query-client';
import { projectService } from '../services/project.service';
import type {
  Project,
  ProjectFilters,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types';

// Hook to fetch all projects
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => projectService.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch single project
export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id!),
    queryFn: () => projectService.getProject(id!),
    enabled: !!id,
  });
}

// Hook to create project
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.projects.create(),
    mutationFn: (input: CreateProjectInput) => projectService.createProject(input),
    onSuccess: (newProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });

      // Optionally, add the new project to the cache immediately
      queryClient.setQueryData<Project[]>(
        queryKeys.projects.list(),
        (old) => [...(old || []), newProject]
      );
    },
  });
}

// Hook to update project
export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.projects.update(id),
    mutationFn: (input: UpdateProjectInput) => projectService.updateProject(id, input),
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        queryKeys.projects.detail(id),
        updatedProject
      );

      // Invalidate projects list to reflect changes
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });
    },
  });
}

// Hook to delete project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.projects.detail(deletedId),
      });

      // Invalidate projects list
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.lists(),
      });
    },
  });
}

// Hook to fetch project transcripts
export function useProjectTranscripts(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.transcripts(projectId!),
    queryFn: () => projectService.getProjectTranscripts(projectId!),
    enabled: !!projectId,
  });
}

// Hook to upload transcript
export function useUploadTranscript(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.projects.uploadTranscript(projectId),
    mutationFn: (file: File) => projectService.uploadTranscript(projectId, file),
    onSuccess: () => {
      // Invalidate transcripts list
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.transcripts(projectId),
      });

      // Update project to reflect new transcript count
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
    },
  });
}