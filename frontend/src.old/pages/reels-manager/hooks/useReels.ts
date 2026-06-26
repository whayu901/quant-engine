// Reels hooks (ViewModel layer) following MVVM pattern
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, mutationKeys } from '../../../core/api/query-client';
import { reelsService } from '../services/reels.service';
import type {
  Reel,
  Clip,
  CreateReelInput,
  UpdateReelInput,
  AddReelItemInput,
  UpdateReelItemInput,
  ShareInput,
} from '../types';

// Hook to fetch all reels for a project
export function useReels(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reels.project(projectId!),
    queryFn: () => reelsService.getReels(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to fetch single reel with items
export function useReel(reelId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reels.detail(reelId!),
    queryFn: () => reelsService.getReel(reelId!),
    enabled: !!reelId,
  });
}

// Hook to fetch clips for a project
export function useClips(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.clips.project(projectId!),
    queryFn: () => reelsService.getClips(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create reel
export function useCreateReel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.reels.create(projectId),
    mutationFn: (input: CreateReelInput) => reelsService.createReel(projectId, input),
    onSuccess: (newReel) => {
      // Invalidate and refetch reels list
      queryClient.invalidateQueries({
        queryKey: queryKeys.reels.project(projectId),
      });

      // Optionally, add the new reel to the cache immediately
      queryClient.setQueryData<Reel[]>(
        queryKeys.reels.project(projectId),
        (old) => [...(old || []), newReel]
      );
    },
  });
}

// Hook to update reel
export function useUpdateReel(reelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.reels.update(reelId),
    mutationFn: (input: UpdateReelInput) => reelsService.updateReel(reelId, input),
    onSuccess: (updatedReel) => {
      // Update the specific reel in cache
      queryClient.setQueryData(
        queryKeys.reels.detail(reelId),
        updatedReel
      );

      // Invalidate reels list to reflect changes
      queryClient.invalidateQueries({
        queryKey: queryKeys.reels.all(),
      });
    },
  });
}

// Hook to delete reel
export function useDeleteReel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reelId: string) => reelsService.deleteReel(reelId),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.reels.detail(deletedId),
      });

      // Invalidate reels list
      queryClient.invalidateQueries({
        queryKey: queryKeys.reels.project(projectId),
      });
    },
  });
}

// Hook to compile reel
export function useCompileReel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reelId: string) => reelsService.compileReel(reelId),
    onSuccess: (_, reelId) => {
      // Invalidate to refresh status
      queryClient.invalidateQueries({
        queryKey: queryKeys.reels.detail(reelId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.reels.project(projectId),
      });
    },
  });
}

// Hook to add item to reel
export function useAddReelItem(reelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.reels.addItem(reelId),
    mutationFn: (input: AddReelItemInput) => reelsService.addReelItem(reelId, input),
    onSuccess: () => {
      // Invalidate reel to refetch with new item
      queryClient.invalidateQueries({
        queryKey: queryKeys.reels.detail(reelId),
      });
    },
  });
}

// Hook to update reel item
export function useUpdateReelItem(reelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateReelItemInput }) =>
      reelsService.updateReelItem(reelId, itemId, input),
    onSuccess: () => {
      // Invalidate reel to refetch with updated item
      queryClient.invalidateQueries({
        queryKey: queryKeys.reels.detail(reelId),
      });
    },
  });
}

// Hook to remove item from reel
export function useRemoveReelItem(reelId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => reelsService.removeReelItem(reelId, itemId),
    onSuccess: () => {
      // Invalidate reel to refetch without removed item
      queryClient.invalidateQueries({
        queryKey: queryKeys.reels.detail(reelId),
      });
    },
  });
}

// Hook to create share link
export function useCreateShareLink() {
  return useMutation({
    mutationFn: (input: ShareInput) => reelsService.createShareLink(input),
  });
}
