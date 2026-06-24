// CreateProjectModal component - View layer only, logic and styles separated
import React from 'react';
import { X } from 'lucide-react';
import { LoadingSpinner } from '../../../shared/components';
import { useCreateProjectModalLogic } from './CreateProjectModal.logic';
import {
  styles,
  getInputStyle,
  getTextareaStyle,
  getSubmitButtonStyle,
} from './CreateProjectModal.styles';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const {
    formData,
    errors,
    isLoading,
    handleNameChange,
    handleDescriptionChange,
    handleSubmit,
  } = useCreateProjectModalLogic(onClose);

  if (!isOpen) return null;

  return (
    <div className={styles.modal.overlay}>
      {/* Backdrop */}
      <div
        className={styles.modal.backdrop}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={styles.modal.container}>
        <div className={styles.modal.dialog}>
          {/* Header */}
          <div className={styles.header.wrapper}>
            <h2 className={styles.header.title}>
              Create New Project
            </h2>
            <button
              onClick={onClose}
              className={styles.header.closeButton}
            >
              <X className={styles.header.closeIcon} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className={styles.form.content}>
              {/* Name Field */}
              <div>
                <label
                  htmlFor="project-name"
                  className={styles.form.field.label}
                >
                  Project Name *
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={getInputStyle(!!errors.name)}
                  placeholder={styles.form.field.placeholder.name}
                  autoFocus
                />
                {errors.name && (
                  <p className={styles.form.field.error}>{errors.name}</p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label
                  htmlFor="project-description"
                  className={styles.form.field.label}
                >
                  Description
                </label>
                <textarea
                  id="project-description"
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  rows={4}
                  className={getTextareaStyle(!!errors.description)}
                  placeholder={styles.form.field.placeholder.description}
                />
                {errors.description && (
                  <p className={styles.form.field.error}>{errors.description}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.footer.wrapper}>
              <button
                type="button"
                onClick={onClose}
                className={styles.footer.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={getSubmitButtonStyle()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className={styles.footer.loadingWrapper}>
                    <LoadingSpinner size="sm" className={styles.footer.loadingSpinner} />
                    Creating...
                  </span>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}