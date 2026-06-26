// CreateProjectModal business logic - separated from view
import { useState } from 'react';
import { useCreateProject } from '../hooks/useProjects';

interface FormErrors {
  name?: string;
  description?: string;
}

interface FormData {
  name: string;
  description: string;
}

export function useCreateProjectModalLogic(onClose: () => void) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Mutation hook
  const createProject = useCreateProject();

  // Field handlers
  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: '' }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Project name must be less than 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createProject.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      // Reset form and close modal on success
      setFormData({ name: '', description: '' });
      setErrors({});
      onClose();
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to create project:', error);
    }
  };

  return {
    formData,
    errors,
    isLoading: createProject.isLoading,
    handleNameChange,
    handleDescriptionChange,
    handleSubmit,
  };
}