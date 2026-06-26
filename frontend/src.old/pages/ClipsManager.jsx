import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  Download,
  Share2,
  Edit,
  Trash2,
  Plus,
  Film,
  Clock,
  Tag,
} from "lucide-react";
import { api } from "../api";

export default function ClipsManager() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [clips, setClips] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [selectedTranscript, setSelectedTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedClip, setSelectedClip] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // New clip form state
  const [newClip, setNewClip] = useState({
    name: "",
    description: "",
    transcript_id: "",
    start_time: 0,
    end_time: 10,
    tags: [],
  });

  useEffect(() => {
    loadClips();
    loadTranscripts();
  }, [projectId]);

  const loadClips = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${projectId}/clips`);
      setClips(response.data);
    } catch (error) {
      console.error("Error loading clips:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTranscripts = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/transcripts`);
      setTranscripts(response.data);
    } catch (error) {
      console.error("Error loading transcripts:", error);
    }
  };

  const handleCreateClip = async () => {
    try {
      setCreating(true);
      await api.post(`/projects/${projectId}/clips`, newClip);
      await loadClips();
      // Reset form
      setNewClip({
        name: "",
        description: "",
        transcript_id: "",
        start_time: 0,
        end_time: 10,
        tags: [],
      });
    } catch (error) {
      console.error("Error creating clip:", error);
      alert(
        "Error creating clip: " +
          (error.response?.data?.detail || error.message),
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClip = async (clipId) => {
    if (!confirm("Are you sure you want to delete this clip?")) return;

    try {
      await api.delete(`/clips/${clipId}`);
      await loadClips();
    } catch (error) {
      console.error("Error deleting clip:", error);
      alert(
        "Error deleting clip: " +
          (error.response?.data?.detail || error.message),
      );
    }
  };

  const handleUpdateClip = async () => {
    if (!selectedClip) return;

    try {
      await api.put(`/clips/${selectedClip.id}`, {
        name: selectedClip.name,
        description: selectedClip.description,
        tags: selectedClip.tags,
      });
      await loadClips();
      setEditModalOpen(false);
      setSelectedClip(null);
    } catch (error) {
      console.error("Error updating clip:", error);
      alert(
        "Error updating clip: " +
          (error.response?.data?.detail || error.message),
      );
    }
  };

  const handleShare = async (clip) => {
    try {
      const response = await api.post("/share", {
        target_type: "clip",
        target_id: clip.id,
        title: clip.name,
        description: clip.description,
        allow_download: true,
      });

      setSelectedClip({ ...clip, shareUrl: response.data.url });
      setShareModalOpen(true);
    } catch (error) {
      console.error("Error creating share link:", error);
      alert(
        "Error creating share link: " +
          (error.response?.data?.detail || error.message),
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ready":
        return "var(--color-accent)";
      case "processing":
        return "var(--color-amber)";
      case "failed":
        return "#dc3545";
      default:
        return "var(--color-muted)";
    }
  };

  return (
    <div className="clips-manager">
      <div className="page-header">
        <h1>Clips</h1>
        <button
          className="button button-primary"
          onClick={() => navigate(`/projects/${projectId}/reels`)}
        >
          <Film size={20} />
          Manage Reels
        </button>
      </div>

      {/* Create Clip Form */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2>Create New Clip</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Transcript</label>
            <select
              value={newClip.transcript_id}
              onChange={(e) =>
                setNewClip({ ...newClip, transcript_id: e.target.value })
              }
              required
            >
              <option value="">Select transcript...</option>
              {transcripts.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title || `Transcript ${t.id.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Clip Name</label>
            <input
              type="text"
              value={newClip.name}
              onChange={(e) => setNewClip({ ...newClip, name: e.target.value })}
              placeholder="Enter clip name..."
              required
            />
          </div>

          <div className="form-group">
            <label>Start Time (seconds)</label>
            <input
              type="number"
              value={newClip.start_time}
              onChange={(e) =>
                setNewClip({
                  ...newClip,
                  start_time: parseFloat(e.target.value),
                })
              }
              min="0"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label>End Time (seconds)</label>
            <input
              type="number"
              value={newClip.end_time}
              onChange={(e) =>
                setNewClip({ ...newClip, end_time: parseFloat(e.target.value) })
              }
              min="0"
              step="0.1"
            />
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Description</label>
            <textarea
              value={newClip.description}
              onChange={(e) =>
                setNewClip({ ...newClip, description: e.target.value })
              }
              placeholder="Optional description..."
              rows="3"
            />
          </div>

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              value={newClip.tags.join(", ")}
              onChange={(e) =>
                setNewClip({
                  ...newClip,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t),
                })
              }
              placeholder="e.g., highlight, evidence, key-moment"
            />
          </div>
        </div>

        <button
          className="button button-primary"
          onClick={handleCreateClip}
          disabled={creating || !newClip.name || !newClip.transcript_id}
        >
          <Plus size={20} />
          {creating ? "Creating..." : "Create Clip"}
        </button>
      </div>

      {/* Clips List */}
      <div className="clips-grid">
        {loading ? (
          <div className="loading-state">Loading clips...</div>
        ) : clips.length === 0 ? (
          <div className="empty-state">
            <Film size={48} />
            <p>No clips created yet</p>
            <p className="muted">
              Create clips from your transcripts to build highlight reels
            </p>
          </div>
        ) : (
          clips.map((clip) => (
            <div key={clip.id} className="clip-card card">
              <div className="clip-header">
                <h3>{clip.name}</h3>
                <span
                  className="status-dot"
                  style={{ backgroundColor: getStatusColor(clip.status) }}
                  title={clip.status}
                />
              </div>

              {clip.description && (
                <p className="clip-description">{clip.description}</p>
              )}

              <div className="clip-meta">
                <span className="meta-item">
                  <Clock size={16} />
                  {formatTime(clip.duration)}
                </span>
                {clip.tags.length > 0 && (
                  <span className="meta-item">
                    <Tag size={16} />
                    {clip.tags.length} tags
                  </span>
                )}
              </div>

              <div className="clip-actions">
                {clip.status === "ready" && (
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
                  onClick={() => handleShare(clip)}
                  title="Share"
                >
                  <Share2 size={16} />
                </button>
                <button
                  className="button button-sm"
                  onClick={() => {
                    setSelectedClip(clip);
                    setEditModalOpen(true);
                  }}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="button button-sm button-danger"
                  onClick={() => handleDeleteClip(clip.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedClip && (
        <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Clip</h2>
              <button
                className="button button-ghost"
                onClick={() => setEditModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={selectedClip.name}
                  onChange={(e) =>
                    setSelectedClip({ ...selectedClip, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={selectedClip.description || ""}
                  onChange={(e) =>
                    setSelectedClip({
                      ...selectedClip,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Tags</label>
                <input
                  type="text"
                  value={selectedClip.tags.join(", ")}
                  onChange={(e) =>
                    setSelectedClip({
                      ...selectedClip,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t),
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="button button-secondary"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                onClick={handleUpdateClip}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && selectedClip?.shareUrl && (
        <div
          className="modal-backdrop"
          onClick={() => setShareModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share Clip</h2>
              <button
                className="button button-ghost"
                onClick={() => setShareModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p>Share this clip using the link below:</p>
              <div className="share-link-container">
                <input
                  type="text"
                  value={selectedClip.shareUrl}
                  readOnly
                  className="share-link-input"
                />
                <button
                  className="button button-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedClip.shareUrl);
                    alert("Link copied to clipboard!");
                  }}
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .clips-manager {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--color-hairline);
          border-radius: 4px;
        }

        .clips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .clip-card {
          padding: 1.5rem;
        }

        .clip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .clip-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .clip-description {
          color: var(--color-muted);
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .clip-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: var(--color-muted);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .clip-actions {
          display: flex;
          gap: 0.5rem;
        }

        .button-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }

        .button-danger {
          background: #dc3545;
        }

        .button-danger:hover {
          background: #c82333;
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-hairline);
        }

        .modal-header h2 {
          margin: 0;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid var(--color-hairline);
        }

        .share-link-container {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .share-link-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid var(--color-hairline);
          border-radius: 4px;
          font-family: monospace;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--color-muted);
        }

        .empty-state p {
          margin: 0.5rem 0;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
