// ReelsManager business logic - separated from view
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReels,
  useClips,
  useDeleteReel,
  useCompileReel,
  useCreateShareLink,
  useReel,
} from './hooks/useReels';
import type { Reel } from './types';

export function useReelsManagerLogic(projectId: string) {
  const navigate = useNavigate();

  // Queries
  const { data: reels = [], isLoading } = useReels(projectId);
  const { data: clips = [] } = useClips(projectId);

  // Mutations
  const deleteReel = useDeleteReel(projectId);
  const compileReel = useCompileReel(projectId);
  const createShareLink = useCreateShareLink();

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [clipsModalOpen, setClipsModalOpen] = useState(false);

  // Selected reel state
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Handlers
  const handleNavigateToClips = () => {
    navigate(`/projects/${projectId}/clips`);
  };

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleOpenEditModal = (reel: Reel) => {
    setSelectedReel(reel);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedReel(null);
  };

  const handleOpenShareModal = async (reel: Reel) => {
    try {
      const response = await createShareLink.mutateAsync({
        target_type: 'reel',
        target_id: reel.id,
        title: reel.name,
        description: reel.description,
        allow_download: true,
      });

      setSelectedReel(reel);
      setShareUrl(response.url);
      setShareModalOpen(true);
    } catch (error) {
      console.error('Error creating share link:', error);
      alert('Error creating share link: ' + (error as Error).message);
    }
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setSelectedReel(null);
    setShareUrl('');
  };

  const handleOpenClipsModal = (reel: Reel) => {
    setSelectedReel(reel);
    setClipsModalOpen(true);
  };

  const handleCloseClipsModal = () => {
    setClipsModalOpen(false);
    setSelectedReel(null);
  };

  const handleDeleteReel = async (reelId: string) => {
    if (!confirm('Are you sure you want to delete this reel?')) return;

    try {
      await deleteReel.mutateAsync(reelId);
    } catch (error) {
      console.error('Error deleting reel:', error);
      alert('Error deleting reel: ' + (error as Error).message);
    }
  };

  const handleCompileReel = async (reelId: string) => {
    try {
      const response = await compileReel.mutateAsync(reelId);
      alert('Reel compilation started. Job ID: ' + response.job_id);
    } catch (error) {
      console.error('Error compiling reel:', error);
      alert('Error compiling reel: ' + (error as Error).message);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  return {
    // Data
    reels,
    clips,
    isLoading,
    selectedReel,
    shareUrl,

    // Modal state
    createModalOpen,
    editModalOpen,
    shareModalOpen,
    clipsModalOpen,

    // Handlers
    handleNavigateToClips,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleOpenEditModal,
    handleCloseEditModal,
    handleOpenShareModal,
    handleCloseShareModal,
    handleOpenClipsModal,
    handleCloseClipsModal,
    handleDeleteReel,
    handleCompileReel,
    handleCopyShareLink,
  };
}
