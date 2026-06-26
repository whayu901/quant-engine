import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  X,
  Check,
  Reply,
  MoreVertical,
  Edit2,
  Trash2,
  AtSign,
  Smile,
} from 'lucide-react';
import { Button } from '../ui/Button';
import useCollaborationStore from '../../lib/stores/collaborationStore';
import useAuthStore from '../../lib/stores/authStore';
import type { Comment } from '../../types/collaboration';
import { formatRelativeTime } from '../../lib/utils/format';
import { cn } from '../../lib/utils';

interface CommentThreadProps {
  targetId: string;
  targetType: Comment['target_type'];
  position?: { x: number; y: number };
  onClose?: () => void;
  className?: string;
}

const reactionEmojis = ['👍', '❤️', '🎉', '🤔', '👎'];

export function CommentThread({
  targetId,
  targetType,
  position,
  onClose,
  className,
}: CommentThreadProps) {
  const { user } = useAuthStore();
  const {
    comments,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
    teamMembers,
  } = useCollaborationStore();

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const threadComments = comments[targetId] || [];
  const rootComments = threadComments.filter((c) => !c.parent_id);
  const unresolvedCount = threadComments.filter((c) => !c.is_resolved).length;

  // Auto-focus input when replying
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  // Handle @mentions
  const handleInputChange = (value: string) => {
    setNewComment(value);

    // Check for @ symbol
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true);
      setMentionSearch('');
    } else if (lastAtIndex !== -1) {
      const afterAt = value.slice(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      if (spaceIndex === -1) {
        setShowMentions(true);
        setMentionSearch(afterAt);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMention = (member: any) => {
    const lastAtIndex = newComment.lastIndexOf('@');
    const beforeAt = newComment.slice(0, lastAtIndex);
    setNewComment(`${beforeAt}@${member.name} `);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!newComment.trim() || !user) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      project_id: targetId.split('-')[0], // Extract project ID
      user_id: user.id,
      user_name: user.name || user.email,
      user_avatar: user.avatar_url,
      content: newComment,
      target_type: targetType,
      target_id: targetId,
      parent_id: replyingTo || undefined,
      created_at: new Date().toISOString(),
      reactions: [],
    };

    addComment(targetId, comment);
    setNewComment('');
    setReplyingTo(null);
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingId) return;
    updateComment(editingId, editContent);
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteComment(targetId, commentId);
    }
  };

  const handleReaction = (commentId: string, emoji: string) => {
    // This would typically make an API call
    console.log('Adding reaction', emoji, 'to comment', commentId);
    setShowEmojiPicker(null);
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isEditing = editingId === comment.id;
    const replies = threadComments.filter((c) => c.parent_id === comment.id);
    const isAuthor = user?.id === comment.user_id;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('group', isReply && 'ml-10')}
      >
        <div
          className={cn(
            'flex gap-3',
            comment.is_resolved && 'opacity-60'
          )}
        >
          {/* Avatar */}
          {comment.user_avatar ? (
            <img
              src={comment.user_avatar}
              alt={comment.user_name}
              className="h-8 w-8 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">
              {comment.user_name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <span className="font-medium text-sm">{comment.user_name}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {formatRelativeTime(comment.created_at)}
                </span>
                {comment.updated_at && (
                  <span className="text-xs text-gray-400 ml-1">(edited)</span>
                )}
              </div>

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                {!comment.is_resolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => resolveComment(comment.id)}
                    title="Resolve"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                {isAuthor && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEdit(comment)}
                      title="Edit"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDelete(comment.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Comment Body */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveEdit}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>

                {/* Reactions & Reply */}
                <div className="flex items-center gap-3 mt-2">
                  {/* Reactions */}
                  {comment.reactions && comment.reactions.length > 0 && (
                    <div className="flex items-center gap-1">
                      {Object.entries(
                        comment.reactions.reduce((acc, r) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
                          onClick={() => handleReaction(comment.id, emoji)}
                        >
                          <span>{emoji}</span>
                          <span className="text-gray-600">{count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Add Reaction */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() =>
                        setShowEmojiPicker(
                          showEmojiPicker === comment.id ? null : comment.id
                        )
                      }
                    >
                      <Smile className="h-3 w-3 mr-1" />
                      React
                    </Button>

                    {showEmojiPicker === comment.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-8 left-0 flex gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10"
                      >
                        {reactionEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            className="hover:bg-gray-100 rounded p-1 transition-colors"
                            onClick={() => handleReaction(comment.id, emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Reply */}
                  {!isReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}

                  {/* Resolved Badge */}
                  {comment.is_resolved && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      Resolved
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => renderComment(reply, true))}
          </div>
        )}

        {/* Reply Input */}
        {replyingTo === comment.id && (
          <div className="ml-11 mt-3">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div className="flex flex-col gap-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment('');
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      ref={threadRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={position ? { top: position.y, left: position.x } : undefined}
      className={cn(
        'bg-white rounded-lg shadow-xl border border-gray-200',
        'w-96 max-h-[500px] flex flex-col',
        position && 'absolute z-50',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-700" />
            <h3 className="font-semibold">Comments</h3>
            {unresolvedCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                {unresolvedCount} unresolved
              </span>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {rootComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-1">Be the first to comment</p>
          </div>
        ) : (
          rootComments.map((comment) => renderComment(comment))
        )}
      </div>

      {/* New Comment Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={newComment}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Write a comment... (@ to mention)"
            className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            className="absolute bottom-2 right-2"
          >
            <Send className="h-4 w-4" />
          </Button>

          {/* Mentions Dropdown */}
          {showMentions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-0 mb-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-32 overflow-y-auto"
            >
              {teamMembers
                .filter((m) =>
                  m.name.toLowerCase().includes(mentionSearch.toLowerCase())
                )
                .map((member) => (
                  <button
                    key={member.id}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => handleMention(member)}
                  >
                    <AtSign className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{member.name}</span>
                  </button>
                ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}