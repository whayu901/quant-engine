// ReelsManager component - View layer only
import React from 'react';
import { useParams } from 'react-router-dom';
import { Film, Plus, Play, Share2, Settings, Trash2, Download } from 'lucide-react';
import { useReelsManagerLogic } from './ReelsManager.logic';
import { styles, getStatusColor, formatDuration, parseStyle } from './ReelsManager.styles';
import { CreateReelModal } from './modals/CreateReelModal';
import { ClipsManagementModal } from './modals/ClipsManagementModal';
import { ShareModal } from './modals/ShareModal';

export default function ReelsManager() {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) {
    return <div>Error: Project ID not found</div>;
  }

  const {
    reels,
    isLoading,
    selectedReel,
    shareUrl,
    createModalOpen,
    shareModalOpen,
    clipsModalOpen,
    handleNavigateToClips,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleOpenShareModal,
    handleCloseShareModal,
    handleOpenClipsModal,
    handleCloseClipsModal,
    handleDeleteReel,
    handleCompileReel,
    handleCopyShareLink,
  } = useReelsManagerLogic(projectId);

  return (
    <div style={parseStyle(styles.container)}>
      <div style={parseStyle(styles.header.wrapper)}>
        <h1 style={parseStyle(styles.header.title)}>Reels</h1>
        <div style={parseStyle(styles.header.actions)}>
          <button
            className="button button-secondary"
            onClick={handleNavigateToClips}
          >
            Manage Clips
          </button>
          <button
            className="button button-primary"
            onClick={handleOpenCreateModal}
          >
            <Plus size={20} />
            Create Reel
          </button>
        </div>
      </div>

      {/* Reels Grid */}
      <div style={parseStyle(styles.grid.wrapper)}>
        {isLoading ? (
          <div style={parseStyle(styles.loadingState.wrapper)}>Loading reels...</div>
        ) : reels.length === 0 ? (
          <div style={parseStyle(styles.emptyState.wrapper)}>
            <Film size={48} style={parseStyle(styles.emptyState.icon)} />
            <p style={parseStyle(styles.emptyState.text)}>No reels created yet</p>
            <p style={parseStyle(styles.emptyState.muted)}>
              Create reels to compile your clips into presentations
            </p>
          </div>
        ) : (
          reels.map((reel) => (
            <div key={reel.id} className="card" style={parseStyle(styles.card.wrapper)}>
              <div style={parseStyle(styles.card.header.wrapper)}>
                <h3 style={parseStyle(styles.card.header.title)}>{reel.name}</h3>
                <span
                  style={{
                    ...parseStyle(styles.statusDot),
                    backgroundColor: getStatusColor(reel.status),
                  }}
                  title={reel.status}
                />
              </div>

              {reel.description && (
                <p style={parseStyle(styles.card.description)}>{reel.description}</p>
              )}

              <div style={parseStyle(styles.card.meta.wrapper)}>
                <span style={parseStyle(styles.card.meta.item)}>
                  Purpose: {reel.purpose}
                </span>
                <span style={parseStyle(styles.card.meta.item)}>
                  {reel.items?.length || 0} clips
                </span>
                {reel.total_duration && (
                  <span style={parseStyle(styles.card.meta.item)}>
                    Duration: {formatDuration(reel.total_duration)}
                  </span>
                )}
              </div>

              <div style={parseStyle(styles.card.specs.wrapper)}>
                <span style={parseStyle(styles.card.specs.badge)}>{reel.resolution}</span>
                <span style={parseStyle(styles.card.specs.badge)}>{reel.aspect_ratio}</span>
                <span style={parseStyle(styles.card.specs.badge)}>{reel.format}</span>
              </div>

              <div style={parseStyle(styles.card.actions.wrapper)}>
                {reel.status === 'ready' && (
                  <>
                    <button className="button button-sm" title="Play">
                      <Play size={16} />
                    </button>
                    <button className="button button-sm" title="Download">
                      <Download size={16} />
                    </button>
                  </>
                )}
                <button
                  className="button button-sm"
                  onClick={() => handleOpenShareModal(reel)}
                  title="Share"
                >
                  <Share2 size={16} />
                </button>
                <button
                  className="button button-sm"
                  onClick={() => handleOpenClipsModal(reel)}
                  title="Manage Clips"
                >
                  <Film size={16} />
                </button>
                <button
                  className="button button-sm"
                  onClick={() => handleOpenClipsModal(reel)}
                  title="Settings"
                >
                  <Settings size={16} />
                </button>
                {reel.status === 'draft' && (
                  <button
                    className="button button-sm button-accent"
                    onClick={() => handleCompileReel(reel.id)}
                    title="Compile Reel"
                  >
                    Compile
                  </button>
                )}
                <button
                  className="button button-sm button-danger"
                  onClick={() => handleDeleteReel(reel.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateReelModal
        isOpen={createModalOpen}
        onClose={handleCloseCreateModal}
        projectId={projectId}
        onSuccess={(reelId) => handleOpenClipsModal({ id: reelId } as any)}
      />

      {selectedReel && (
        <ClipsManagementModal
          isOpen={clipsModalOpen}
          onClose={handleCloseClipsModal}
          reelId={selectedReel.id}
          projectId={projectId}
          onCompile={() => handleCompileReel(selectedReel.id)}
        />
      )}

      {selectedReel && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={handleCloseShareModal}
          reelName={selectedReel.name}
          shareUrl={shareUrl}
          onCopyLink={handleCopyShareLink}
        />
      )}
    </div>
  );
}
