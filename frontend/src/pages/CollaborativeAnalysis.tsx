import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Grid3x3,
  MessageSquare,
  Users,
  Activity,
  Zap,
  Download,
  Share2,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TimeSavedBadge } from '../components/ui/TimeSavedBadge';
import { AnalysisGrid } from '../components/analysis/AnalysisGrid';
import { EvidencePanel } from '../components/analysis/EvidencePanel';
import { ChatInterface } from '../components/chat/ChatInterface';
import { TeamPanel } from '../components/collaboration/TeamPanel';
import { ActivityFeed } from '../components/collaboration/ActivityFeed';
import { CommentThread } from '../components/collaboration/CommentThread';
import {
  CollaborationCursors,
  CollaborationSelection,
} from '../components/collaboration/CollaborationCursors';
import { useCollaborationWebSocket } from '../hooks/useCollaborationWebSocket';
import useCollaborationStore from '../lib/stores/collaborationStore';
import useAuthStore from '../lib/stores/authStore';
import api from '../lib/api/client';
import { cn } from '../lib/utils';

interface AnalysisProject {
  id: string;
  name: string;
  description: string;
  time_saved: number;
  total_transcripts: number;
  total_insights: number;
  created_at: string;
  updated_at: string;
}

export function CollaborativeAnalysis() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();
  const {
    teamMembers,
    activeUsers,
    showComments,
    toggleComments,
    currentUserRole,
    setTeamMembers,
  } = useCollaborationStore();

  const [project, setProject] = useState<AnalysisProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{
    row: string;
    column: string;
  } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [commentTarget, setCommentTarget] = useState<{
    id: string;
    type: 'analysis' | 'theme' | 'insight' | 'transcript';
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  const {
    connectionStatus,
    sendCursorPosition,
    sendSelection,
    sendActivity,
    sendComment,
  } = useCollaborationWebSocket(projectId || null);

  // Load project data
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        const [projectData, membersData] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/members`),
        ]);

        setProject(projectData);
        setTeamMembers(membersData.members);

        // Set current user role
        const currentMember = membersData.members.find(
          (m: any) => m.user_id === user?.id
        );
        if (currentMember) {
          useCollaborationStore.setState({
            currentUserRole: currentMember.role,
          });
        }

        setLoading(false);

        // Log activity
        sendActivity({
          action: 'created',
          target_type: 'project',
          target_id: projectId,
          target_name: projectData.name,
          description: `opened project for analysis`,
        });
      } catch (error) {
        console.error('Failed to load project:', error);
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, user]);

  // Track mouse movement for cursors
  useEffect(() => {
    if (!containerRef.current) return;

    let throttleTimer: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return;

      throttleTimer = setTimeout(() => {
        const rect = containerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        sendCursorPosition(x, y, `analysis-${projectId}`);
        throttleTimer = null as any;
      }, 50); // Throttle to 20fps
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    return () => {
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [projectId, sendCursorPosition]);

  // Handle cell selection
  const handleCellClick = (rowId: string, columnId: string, event?: React.MouseEvent) => {
    setSelectedCell({ row: rowId, column: columnId });
    sendSelection(`${rowId}-${columnId}`, 'cell');

    // Show comment thread at click position
    if (event && showComments) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setCommentPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        setCommentTarget({
          id: `${rowId}-${columnId}`,
          type: 'analysis',
        });
      }
    }

    // Log activity
    sendActivity({
      action: 'analyzed',
      target_type: 'analysis',
      target_id: `${rowId}-${columnId}`,
      target_name: 'Analysis Cell',
      description: 'selected analysis cell',
    });
  };

  // Handle export
  const handleExport = async () => {
    if (!projectId) return;

    try {
      const response = await api.get(`/projects/${projectId}/export`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project?.name || 'analysis'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Log activity
      sendActivity({
        action: 'created',
        target_type: 'project',
        target_id: projectId,
        target_name: project?.name || '',
        description: 'exported analysis results',
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading collaborative analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" ref={containerRef}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Project Info */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  {project?.name}
                  <TimeSavedBadge hours={project?.time_saved || 0} size="sm" />
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{project?.total_transcripts} transcripts</span>
                  <span>{project?.total_insights} insights</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {teamMembers.length} collaborators
                  </span>
                  {connectionStatus === 'open' && activeUsers.length > 0 && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Activity className="h-3 w-3" />
                      {activeUsers.length} active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Collaboration Controls */}
              <ActivityFeed projectId={projectId || ''} />
              <TeamPanel projectId={projectId || ''} />

              <div className="h-6 w-px bg-gray-300 mx-2" />

              {/* Analysis Controls */}
              <Button
                variant={showComments ? 'primary' : 'outline'}
                size="sm"
                onClick={toggleComments}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </Button>

              <Button
                variant={showChat ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowChat(!showChat)}
              >
                <Zap className="h-4 w-4 mr-2" />
                AI Chat
              </Button>

              <div className="h-6 w-px bg-gray-300 mx-2" />

              {/* Export/Share */}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              {currentUserRole === 'owner' && (
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Analysis Grid */}
        <div className="flex-1 p-6 overflow-auto relative">
          {/* Collaboration Cursors Overlay */}
          <CollaborationCursors
            containerRef={containerRef}
            viewportId={`analysis-${projectId}`}
          />

          {/* Analysis Grid with Selections */}
          <div className="relative">
            <AnalysisGrid
              projectId={projectId || ''}
              onCellClick={handleCellClick}
              renderCellWrapper={(cellContent, cellId) => (
                <div className="relative">
                  <CollaborationSelection
                    targetId={cellId}
                    targetType="cell"
                    isSelected={
                      selectedCell?.row === cellId.split('-')[0] &&
                      selectedCell?.column === cellId.split('-')[1]
                    }
                  />
                  {cellContent}
                </div>
              )}
            />
          </div>

          {/* Floating Comment Thread */}
          {commentTarget && commentPosition && showComments && (
            <CommentThread
              targetId={commentTarget.id}
              targetType={commentTarget.type}
              position={commentPosition}
              onClose={() => {
                setCommentTarget(null);
                setCommentPosition(null);
              }}
              className="absolute"
            />
          )}
        </div>

        {/* Side Panels */}
        {selectedCell && (
          <div className="w-96 border-l border-gray-200 bg-white">
            <EvidencePanel
              projectId={projectId || ''}
              rowId={selectedCell.row}
              columnId={selectedCell.column}
              onClose={() => setSelectedCell(null)}
            />
          </div>
        )}

        {showChat && (
          <div className="w-96 border-l border-gray-200 bg-white">
            <ChatInterface
              projectId={projectId || ''}
              sessionId={`${projectId}-${user?.id}`}
              onClose={() => setShowChat(false)}
            />
          </div>
        )}
      </div>

      {/* Connection Status */}
      {connectionStatus !== 'open' && (
        <div className="fixed bottom-4 left-4 bg-amber-100 text-amber-800 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse" />
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Reconnecting...'}
          </div>
        </div>
      )}
    </div>
  );
}