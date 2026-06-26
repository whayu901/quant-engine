// CreateReelModal business logic
import { useState } from 'react';
import { useCreateReel } from '../hooks/useReels';
import type { CreateReelInput } from '../types';

const DEFAULT_FORM_DATA: CreateReelInput = {
  name: '',
  description: '',
  purpose: 'presentation',
  transition_style: 'fade',
  transition_duration: 0.5,
  resolution: '1080p',
  aspect_ratio: '16:9',
  format: 'mp4',
  intro_text: '',
  outro_text: '',
  watermark: false,
};

export function useCreateReelModalLogic(
  projectId: string,
  onClose: () => void,
  onSuccess?: (reelId: string) => void
) {
  const [formData, setFormData] = useState<CreateReelInput>(DEFAULT_FORM_DATA);
  const createReel = useCreateReel(projectId);

  const handleFieldChange = (field: keyof CreateReelInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const result = await createReel.mutateAsync(formData);

      // Reset form
      setFormData(DEFAULT_FORM_DATA);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result.id);
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error creating reel:', error);
      alert('Error creating reel: ' + (error as Error).message);
    }
  };

  return {
    formData,
    handleFieldChange,
    handleSubmit,
    isLoading: createReel.isLoading,
  };
}
