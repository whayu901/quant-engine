/**
 * Asset Manifest
 * Central registry for all AI-generated assets from Higgsfield
 */

export interface AssetMetadata {
  id: string;
  name: string;
  path: string;
  generationId: string;
  prompt: string;
  type: 'hero' | 'feature-icon' | 'testimonial' | 'background' | 'product';
  aspectRatio: string;
  status: 'pending' | 'ready' | 'failed';
  fallback?: string;
}

export const assetManifest: Record<string, AssetMetadata> = {
  // Hero Section
  'hero-background': {
    id: 'hero-background',
    name: 'Hero Background',
    path: '/assets/generated/hero/hero-background.png',
    generationId: 'b2d62e5d-07d2-410a-bdcb-c4a7c3c43d7b',
    prompt: 'Futuristic AI-powered transcription dashboard interface, floating holographic waveforms with purple and blue gradient background',
    type: 'hero',
    aspectRatio: '16:9',
    status: 'pending',
    fallback: 'linear-gradient(135deg, rgba(0, 102, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)',
  },

  // Feature Icons
  'icon-transcription': {
    id: 'icon-transcription',
    name: 'AI Transcription Icon',
    path: '/assets/generated/features/icon-transcription.png',
    generationId: 'fdaf1889-4fd4-493f-93ba-7ad36cf6012e',
    prompt: '3D glass morphism icon for AI transcription feature, floating sound waves transforming into text',
    type: 'feature-icon',
    aspectRatio: '1:1',
    status: 'pending',
  },

  'icon-language': {
    id: 'icon-language',
    name: 'Multi-Language Icon',
    path: '/assets/generated/features/icon-language.png',
    generationId: '3858581b-95b9-4595-a0da-67fbb140f1ba',
    prompt: '3D glass morphism icon for multi-language support, floating globe with language symbols',
    type: 'feature-icon',
    aspectRatio: '1:1',
    status: 'pending',
  },

  'icon-analysis': {
    id: 'icon-analysis',
    name: 'Smart Analysis Icon',
    path: '/assets/generated/features/icon-analysis.png',
    generationId: 'fabbfc89-45cf-492a-b7c0-5a1037861d08',
    prompt: '3D glass morphism icon for AI smart analysis, floating brain with neural connections',
    type: 'feature-icon',
    aspectRatio: '1:1',
    status: 'pending',
  },

  'icon-speed': {
    id: 'icon-speed',
    name: 'Lightning Fast Icon',
    path: '/assets/generated/features/icon-speed.png',
    generationId: '35844de9-baa6-4469-913b-f4856f3948ed',
    prompt: '3D glass morphism icon for lightning fast processing, dynamic speed lines',
    type: 'feature-icon',
    aspectRatio: '1:1',
    status: 'pending',
  },

  // Testimonial Avatars
  'avatar-sarah': {
    id: 'avatar-sarah',
    name: 'Sarah Mitchell Avatar',
    path: '/assets/generated/testimonials/avatar-sarah.png',
    generationId: '500b34c9-8737-4d12-a85c-06af5302067b',
    prompt: 'Professional business headshot portrait, confident researcher woman with glasses',
    type: 'testimonial',
    aspectRatio: '1:1',
    status: 'pending',
  },

  'avatar-david': {
    id: 'avatar-david',
    name: 'David Chen Avatar',
    path: '/assets/generated/testimonials/avatar-david.png',
    generationId: '448c4419-9784-46c1-b89a-8e90072202e1',
    prompt: 'Professional business headshot portrait, confident UX researcher man',
    type: 'testimonial',
    aspectRatio: '1:1',
    status: 'pending',
  },
};

/**
 * Get asset by ID
 */
export function getAsset(id: string): AssetMetadata | undefined {
  return assetManifest[id];
}

/**
 * Get assets by type
 */
export function getAssetsByType(type: AssetMetadata['type']): AssetMetadata[] {
  return Object.values(assetManifest).filter(asset => asset.type === type);
}

/**
 * Update asset status
 */
export function updateAssetStatus(id: string, status: AssetMetadata['status']) {
  if (assetManifest[id]) {
    assetManifest[id].status = status;
  }
}

/**
 * Check if all assets are ready
 */
export function areAllAssetsReady(): boolean {
  return Object.values(assetManifest).every(asset => asset.status === 'ready');
}

/**
 * Get fallback for asset
 */
export function getAssetFallback(id: string): string | undefined {
  return assetManifest[id]?.fallback;
}
