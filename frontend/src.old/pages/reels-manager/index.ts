// Reels Manager feature exports
export { default as ReelsManager } from './ReelsManager';

// Types
export type {
  Reel,
  Clip,
  ReelItem,
  CreateReelInput,
  UpdateReelInput,
  AddReelItemInput,
  UpdateReelItemInput,
  ShareInput,
  ShareResponse,
  CompileReelResponse,
} from './types';

// Hooks
export {
  useReels,
  useReel,
  useClips,
  useCreateReel,
  useUpdateReel,
  useDeleteReel,
  useCompileReel,
  useAddReelItem,
  useUpdateReelItem,
  useRemoveReelItem,
  useCreateShareLink,
} from './hooks/useReels';

// Service
export { reelsService } from './services/reels.service';
export type { IReelsService } from './services/reels.service';

// Modals
export { CreateReelModal } from './modals/CreateReelModal';
export { ClipsManagementModal } from './modals/ClipsManagementModal';
export { ShareModal } from './modals/ShareModal';
