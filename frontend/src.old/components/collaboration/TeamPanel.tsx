import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Eye,
  Edit,
  Trash,
  MoreVertical,
  X,
  Crown,
  Activity,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import useCollaborationStore from '../../lib/stores/collaborationStore';
import type { TeamMember } from '../../types/collaboration';
import { formatRelativeTime } from '../../lib/utils/format';
import { cn } from '../../lib/utils';

interface TeamPanelProps {
  projectId: string;
  onInvite?: () => void;
  className?: string;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  analyst: Edit,
  viewer: Eye,
};

const roleColors = {
  owner: 'text-amber-500',
  admin: 'text-purple-500',
  analyst: 'text-blue-500',
  viewer: 'text-gray-500',
};

export function TeamPanel({ projectId, onInvite, className }: TeamPanelProps) {
  const {
    teamMembers,
    activeUsers,
    currentUserRole,
    showTeamPanel,
    toggleTeamPanel,
    removeTeamMember,
    updateMemberRole,
  } = useCollaborationStore();

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'analyst' | 'viewer'>('analyst');

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleInvite = () => {
    if (onInvite) {
      onInvite();
    }
    // Reset form
    setInviteEmail('');
    setInviteRole('analyst');
    setShowInviteForm(false);
  };

  const isUserOnline = (userId: string) => {
    return activeUsers.some((u) => u.user_id === userId);
  };

  return (
    <>
      {/* Team Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTeamPanel}
        className="relative"
      >
        <Users className="h-4 w-4 mr-2" />
        Team ({teamMembers.length})
        {activeUsers.length > 0 && (
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Team Panel Drawer */}
      <AnimatePresence>
        {showTeamPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={toggleTeamPanel}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 25 }}
              className={cn(
                'fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50',
                'border-l border-gray-200',
                className
              )}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-700" />
                    <h2 className="text-lg font-semibold">Team Members</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTeamPanel}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Active Users Indicator */}
                {activeUsers.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                    <Activity className="h-3 w-3" />
                    {activeUsers.length} member{activeUsers.length !== 1 && 's'} online
                  </div>
                )}
              </div>

              {/* Invite Button */}
              {canManageTeam && (
                <div className="p-4 border-b border-gray-200">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowInviteForm(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </Button>
                </div>
              )}

              {/* Team Members List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {teamMembers.map((member) => {
                  const RoleIcon = roleIcons[member.role];
                  const isOnline = isUserOnline(member.user_id);

                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        'p-3 bg-gray-50 rounded-lg',
                        'hover:bg-gray-100 transition-colors',
                        'relative group'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative">
                            {member.avatar_url ? (
                              <img
                                src={member.avatar_url}
                                alt={member.name}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            {isOnline && (
                              <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>

                          {/* Member Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {member.name}
                              </span>
                              <RoleIcon
                                className={cn('h-3 w-3', roleColors[member.role])}
                              />
                            </div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                            {member.last_active && !isOnline && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(member.last_active)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {canManageTeam && member.role !== 'owner' && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                setSelectedMember(
                                  selectedMember === member.id ? null : member.id
                                )
                              }
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Dropdown Menu */}
                      {selectedMember === member.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-2 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                        >
                          <button
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => {
                              updateMemberRole(
                                member.user_id,
                                member.role === 'admin' ? 'analyst' : 'admin'
                              );
                              setSelectedMember(null);
                            }}
                          >
                            <Shield className="h-3 w-3" />
                            Change to {member.role === 'admin' ? 'Analyst' : 'Admin'}
                          </button>
                          <button
                            className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            onClick={() => {
                              removeTeamMember(member.user_id);
                              setSelectedMember(null);
                            }}
                          >
                            <Trash className="h-3 w-3" />
                            Remove from team
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Invite Form Modal */}
              {showInviteForm && (
                <div className="absolute inset-0 bg-white z-20 p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Invite Team Member</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInviteForm(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@company.com"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={inviteRole}
                        onChange={(e) =>
                          setInviteRole(e.target.value as typeof inviteRole)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="admin">Admin - Can manage team & data</option>
                        <option value="analyst">Analyst - Can analyze & comment</option>
                        <option value="viewer">Viewer - Can only view</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={handleInvite}
                        disabled={!inviteEmail}
                        className="flex-1"
                      >
                        Send Invitation
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowInviteForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}