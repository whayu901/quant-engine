// CreateReelModal component - View layer
import React from 'react';
import { useCreateReelModalLogic } from './CreateReelModal.logic';
import { styles } from './CreateReelModal.styles';

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: (reelId: string) => void;
}

export function CreateReelModal({ isOpen, onClose, projectId, onSuccess }: CreateReelModalProps) {
  const {
    formData,
    handleFieldChange,
    handleSubmit,
    isLoading,
  } = useCreateReelModalLogic(projectId, onClose, onSuccess);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header.wrapper}>
          <h2 className={styles.header.title}>Create New Reel</h2>
          <button className={styles.header.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.form.grid}>
            <div className={styles.form.group}>
              <label className={styles.form.label}>Reel Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Enter reel name..."
                className={styles.form.input}
                required
              />
            </div>

            <div className={styles.form.group}>
              <label className={styles.form.label}>Purpose</label>
              <select
                value={formData.purpose}
                onChange={(e) => handleFieldChange('purpose', e.target.value)}
                className={styles.form.select}
              >
                <option value="highlight">Highlight Reel</option>
                <option value="evidence">Evidence</option>
                <option value="presentation">Presentation</option>
                <option value="social">Social Media</option>
              </select>
            </div>

            <div className={styles.form.group}>
              <label className={styles.form.label}>Resolution</label>
              <select
                value={formData.resolution}
                onChange={(e) => handleFieldChange('resolution', e.target.value)}
                className={styles.form.select}
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
                <option value="4k">4K</option>
              </select>
            </div>

            <div className={styles.form.group}>
              <label className={styles.form.label}>Aspect Ratio</label>
              <select
                value={formData.aspect_ratio}
                onChange={(e) => handleFieldChange('aspect_ratio', e.target.value)}
                className={styles.form.select}
              >
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Portrait)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:3">4:3 (Classic)</option>
              </select>
            </div>

            <div className={styles.form.group}>
              <label className={styles.form.label}>Transition Style</label>
              <select
                value={formData.transition_style}
                onChange={(e) => handleFieldChange('transition_style', e.target.value)}
                className={styles.form.select}
              >
                <option value="fade">Fade</option>
                <option value="cut">Cut</option>
                <option value="dissolve">Dissolve</option>
              </select>
            </div>

            <div className={styles.form.group}>
              <label className={styles.form.label}>Transition Duration (seconds)</label>
              <input
                type="number"
                value={formData.transition_duration}
                onChange={(e) => handleFieldChange('transition_duration', parseFloat(e.target.value))}
                min="0"
                max="5"
                step="0.1"
                className={styles.form.input}
              />
            </div>

            <div className={styles.form.groupFull}>
              <label className={styles.form.label}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className={styles.form.textarea}
              />
            </div>

            <div className={styles.form.groupFull}>
              <label className={styles.form.label}>Intro Text</label>
              <input
                type="text"
                value={formData.intro_text}
                onChange={(e) => handleFieldChange('intro_text', e.target.value)}
                placeholder="Optional intro text..."
                className={styles.form.input}
              />
            </div>

            <div className={styles.form.groupFull}>
              <label className={styles.form.label}>Outro Text</label>
              <input
                type="text"
                value={formData.outro_text}
                onChange={(e) => handleFieldChange('outro_text', e.target.value)}
                placeholder="Optional outro text..."
                className={styles.form.input}
              />
            </div>

            <div className={styles.form.group}>
              <label className={styles.form.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.watermark}
                  onChange={(e) => handleFieldChange('watermark', e.target.checked)}
                  className={styles.form.checkbox}
                />
                Add watermark
              </label>
            </div>
          </div>
        </div>

        <div className={styles.footer.wrapper}>
          <button
            className={styles.footer.cancelButton}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={styles.footer.submitButton}
            onClick={handleSubmit}
            disabled={!formData.name || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Reel'}
          </button>
        </div>
      </div>
    </div>
  );
}
