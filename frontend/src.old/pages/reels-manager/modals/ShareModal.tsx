// ShareModal component - View layer
import React from 'react';
import { styles } from './ShareModal.styles';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reelName: string;
  shareUrl: string;
  onCopyLink: () => void;
}

export function ShareModal({
  isOpen,
  onClose,
  reelName,
  shareUrl,
  onCopyLink,
}: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header.wrapper}>
          <h2 className={styles.header.title}>Share Reel</h2>
          <button className={styles.header.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>
            Share this reel using the link below:
          </p>
          <div className={styles.linkContainer}>
            <input
              type="text"
              value={shareUrl}
              readOnly
              className={styles.linkInput}
            />
            <button className={styles.copyButton} onClick={onCopyLink}>
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
