/**
 * Higgsfields-inspired Asset Generation Utility
 *
 * This utility provides programmatic generation of gradients, patterns,
 * and visual assets for the landing page using CSS and Canvas APIs.
 *
 * Note: For production use with actual Higgsfields API, replace these
 * implementations with API calls to Higgsfields service.
 */

export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic';
  angle?: number;
  colors: string[];
  stops?: number[];
}

export interface PatternConfig {
  type: 'dots' | 'grid' | 'waves' | 'noise';
  color?: string;
  size?: number;
  opacity?: number;
}

/**
 * Generate CSS gradient string from configuration
 */
export function generateGradient(config: GradientConfig): string {
  const { type, angle = 135, colors, stops } = config;

  const colorStops = colors.map((color, i) => {
    const stop = stops?.[i] ?? (i / (colors.length - 1)) * 100;
    return `${color} ${stop}%`;
  }).join(', ');

  switch (type) {
    case 'linear':
      return `linear-gradient(${angle}deg, ${colorStops})`;
    case 'radial':
      return `radial-gradient(circle, ${colorStops})`;
    case 'conic':
      return `conic-gradient(from ${angle}deg, ${colorStops})`;
    default:
      return `linear-gradient(${angle}deg, ${colorStops})`;
  }
}

/**
 * Generate background pattern as data URL
 */
export function generatePattern(config: PatternConfig): string {
  const { type, color = '#0066FF', size = 20, opacity = 0.1 } = config;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  canvas.width = size * 2;
  canvas.height = size * 2;

  ctx.fillStyle = `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;

  switch (type) {
    case 'dots':
      ctx.beginPath();
      ctx.arc(size, size, size / 4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'grid':
      ctx.fillRect(0, 0, 1, size * 2);
      ctx.fillRect(0, 0, size * 2, 1);
      break;

    case 'waves':
      ctx.beginPath();
      ctx.moveTo(0, size);
      ctx.quadraticCurveTo(size / 2, size / 2, size, size);
      ctx.quadraticCurveTo(size * 1.5, size * 1.5, size * 2, size);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case 'noise':
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * size * 2;
        const y = Math.random() * size * 2;
        ctx.fillRect(x, y, 1, 1);
      }
      break;
  }

  return canvas.toDataURL();
}

/**
 * Predefined brand gradients for Qual Engine
 */
export const brandGradients = {
  primary: generateGradient({
    type: 'linear',
    angle: 135,
    colors: ['#0066FF', '#8B5CF6'],
  }),
  secondary: generateGradient({
    type: 'linear',
    angle: 135,
    colors: ['#8B5CF6', '#EC4899'],
  }),
  success: generateGradient({
    type: 'linear',
    angle: 135,
    colors: ['#10B981', '#34D399'],
  }),
  hero: generateGradient({
    type: 'linear',
    angle: 135,
    colors: ['#0066FF', '#8B5CF6', '#EC4899'],
    stops: [0, 50, 100],
  }),
  subtle: generateGradient({
    type: 'linear',
    angle: 180,
    colors: ['rgba(0, 102, 255, 0.05)', 'rgba(139, 92, 246, 0.05)'],
  }),
  mesh: generateGradient({
    type: 'radial',
    colors: ['rgba(0, 102, 255, 0.1)', 'transparent'],
  }),
};

/**
 * Generate animated gradient keyframes
 */
export function generateAnimatedGradient(name: string, _colors: string[]): string {
  return `
    @keyframes ${name} {
      0%, 100% {
        background-position: 0% 50%;
      }
      50% {
        background-position: 100% 50%;
      }
    }
  `;
}

/**
 * Create a mesh gradient background
 */
export function createMeshGradient(colors: string[]): string {
  const gradients = colors.map((color, i) => {
    const angle = (360 / colors.length) * i;
    return `radial-gradient(at ${50 + Math.cos(angle) * 30}% ${50 + Math.sin(angle) * 30}%, ${color} 0px, transparent 50%)`;
  });

  return gradients.join(', ');
}

/**
 * Generate a glassmorphism effect
 */
export function createGlassmorphism(config?: {
  background?: string;
  blur?: number;
  opacity?: number;
}): Record<string, string | number> {
  const { background = 'rgba(255, 255, 255, 0.7)', blur = 10, opacity = 0.8 } = config || {};

  return {
    background,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: '1px solid rgba(255, 255, 255, 0.5)',
    opacity,
  };
}

/**
 * Generate particle effect data
 */
export function generateParticles(count: number = 50): Array<{
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}> {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));
}

/**
 * Generate blob/organic shape SVG
 */
export function generateBlobSVG(config?: {
  width?: number;
  height?: number;
  fill?: string;
}): string {
  const { width = 400, height = 400, fill = '#0066FF' } = config || {};

  // Generate random blob path
  const points = 8;
  const radius = Math.min(width, height) / 2;
  const centerX = width / 2;
  const centerY = height / 2;

  let path = 'M ';
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const randomRadius = radius * (0.7 + Math.random() * 0.3);
    const x = centerX + Math.cos(angle) * randomRadius;
    const y = centerY + Math.sin(angle) * randomRadius;

    if (i === 0) {
      path += `${x},${y} `;
    } else {
      const prevAngle = ((i - 1) / points) * Math.PI * 2;
      const prevRadius = radius * (0.7 + Math.random() * 0.3);
      const cpx1 = centerX + Math.cos(prevAngle + 0.5) * prevRadius;
      const cpy1 = centerY + Math.sin(prevAngle + 0.5) * prevRadius;
      path += `Q ${cpx1},${cpy1} ${x},${y} `;
    }
  }
  path += 'Z';

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <path d="${path}" fill="${fill}" opacity="0.1">
        <animate attributeName="d" dur="10s" repeatCount="indefinite" />
      </path>
    </svg>
  `;
}

export default {
  generateGradient,
  generatePattern,
  brandGradients,
  generateAnimatedGradient,
  createMeshGradient,
  createGlassmorphism,
  generateParticles,
  generateBlobSVG,
};
