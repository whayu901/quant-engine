// ClipsManagementModal component - View layer
import React from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useClipsManagementModalLogic } from './ClipsManagementModal.logic';
import { styles } from './ClipsManagementModal.styles';

interface ClipsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  reelId: string;
  projectId: string;
  onCompile?: () => void;
}

export function ClipsManagementModal({
  isOpen,
  onClose,
  reelId,
  projectId,
  onCompile,
}: ClipsManagementModalProps) {
  const {
    reel,
    clips,
    isLoading,
    handleAddClip,
    handleRemoveClip,
    handleMoveClip,
    handleCompile,
  } = useClipsManagementModalLogic(reelId, projectId, onClose, onCompile);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header.wrapper}>
          <h2 className={styles.header.title}>
            Manage Clips - {reel?.name || 'Loading...'}
          </h2>
          <button className={styles.header.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : (
            <div className={styles.container}>
              {/* Current clips in reel */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Clips in Reel ({reel?.items?.length || 0})
                </h3>
                {reel?.items && reel.items.length > 0 ? (
                  <div className={styles.clipsList}>
                    {reel.items.map((item, index) => (
                      <div key={item.id} className={styles.clipItem}>
                        <span className={styles.clipPosition}>{index + 1}</span>
                        <span className={styles.clipName}>
                          {item.clip?.name || 'Unknown Clip'}
                        </span>
                        <div className={styles.clipControls}>
                          <button
                            className={styles.iconButton}
                            onClick={() => handleMoveClip(item.id, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            className={styles.iconButton}
                            onClick={() => handleMoveClip(item.id, 'down')}
                            disabled={index === (reel.items?.length || 0) - 1}
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.dangerButton}`}
                            onClick={() => handleRemoveClip(item.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyMessage}>No clips added yet</p>
                )}
              </div>

              {/* Available clips */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Available Clips</h3>
                {clips && clips.length > 0 ? (
                  <div className={styles.clipsList}>
                    {clips.map((clip) => {
                      const isAdded = reel?.items?.some(
                        (item) => item.clip_id === clip.id
                      );
                      return (
                        <div key={clip.id} className={styles.clipItem}>
                          <span className={styles.clipName}>{clip.name}</span>
                          <button
                            className={styles.addButton}
                            onClick={() => handleAddClip(clip.id)}
                            disabled={isAdded}
                          >
                            {isAdded ? 'Added' : 'Add'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.emptyMessage}>No clips available</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer.wrapper}>
          <button className={styles.footer.cancelButton} onClick={onClose}>
            Close
          </button>
          {reel?.status === 'draft' && reel?.items && reel.items.length > 0 && (
            <button
              className={styles.footer.compileButton}
              onClick={handleCompile}
            >
              Compile Reel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
