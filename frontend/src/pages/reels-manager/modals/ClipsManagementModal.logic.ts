// ClipsManagementModal business logic
import {
  useReel,
  useClips,
  useAddReelItem,
  useRemoveReelItem,
  useUpdateReelItem,
  useCompileReel,
} from '../hooks/useReels';

export function useClipsManagementModalLogic(
  reelId: string,
  projectId: string,
  onClose: () => void,
  onCompile?: () => void
) {
  const { data: reel, isLoading } = useReel(reelId);
  const { data: clips = [] } = useClips(projectId);
  const addReelItem = useAddReelItem(reelId);
  const removeReelItem = useRemoveReelItem(reelId);
  const updateReelItem = useUpdateReelItem(reelId);
  const compileReel = useCompileReel(projectId);

  const handleAddClip = async (clipId: string) => {
    try {
      await addReelItem.mutateAsync({ clip_id: clipId });
    } catch (error) {
      console.error('Error adding clip to reel:', error);
      alert('Error adding clip: ' + (error as Error).message);
    }
  };

  const handleRemoveClip = async (itemId: string) => {
    try {
      await removeReelItem.mutateAsync(itemId);
    } catch (error) {
      console.error('Error removing clip from reel:', error);
      alert('Error removing clip: ' + (error as Error).message);
    }
  };

  const handleMoveClip = async (itemId: string, direction: 'up' | 'down') => {
    if (!reel?.items) return;

    const items = [...reel.items];
    const index = items.findIndex((item) => item.id === itemId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    // Swap positions
    const temp = items[index];
    items[index] = items[newIndex];
    items[newIndex] = temp;

    // Update positions
    try {
      for (let i = 0; i < items.length; i++) {
        await updateReelItem.mutateAsync({
          itemId: items[i].id,
          input: { position: i },
        });
      }
    } catch (error) {
      console.error('Error reordering clips:', error);
      alert('Error reordering clips: ' + (error as Error).message);
    }
  };

  const handleCompile = async () => {
    try {
      const response = await compileReel.mutateAsync(reelId);
      alert('Reel compilation started. Job ID: ' + response.job_id);

      if (onCompile) {
        onCompile();
      }

      onClose();
    } catch (error) {
      console.error('Error compiling reel:', error);
      alert('Error compiling reel: ' + (error as Error).message);
    }
  };

  return {
    reel,
    clips,
    isLoading,
    handleAddClip,
    handleRemoveClip,
    handleMoveClip,
    handleCompile,
  };
}
