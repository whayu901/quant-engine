/**
 * Enhanced Effects Wrapper for Landing Page
 * Adds all cutting-edge visual effects to existing landing page
 */

import React from 'react';
import { MatrixRain, DataStream, AIEye, HolographicText, MagneticButton } from '../effects';

/**
 * Background Effects Layer
 * Combines multiple background effects
 */
export const BackgroundEffects: React.FC<{ variant?: 'full' | 'minimal' }> = ({ variant = 'full' }) => {
  if (variant === 'minimal') {
    return (
      <>
        <div className="aurora-bg absolute inset-0 opacity-20" />
        <div className="circuit-pattern absolute inset-0 opacity-10" />
      </>
    );
  }

  return (
    <>
      {/* Matrix Rain - Hidden on mobile for performance */}
      <div className="hidden lg:block">
        <MatrixRain density={0.3} speed={0.8} />
      </div>

      {/* Data Streams */}
      <DataStream count={15} className="opacity-20" />

      {/* Aurora Background */}
      <div className="aurora-bg absolute inset-0 opacity-20" />

      {/* Circuit Pattern */}
      <div className="circuit-pattern absolute inset-0 opacity-10" />
    </>
  );
};

/**
 * Enhanced Hero Title
 * Holographic text with advanced effects
 */
export const EnhancedHeroTitle: React.FC<{ children: string; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <HolographicText
      text={children}
      enableRGBSplit={true}
      className={className}
    />
  );
};

/**
 * Enhanced CTA Button
 * Magnetic button with glow effects
 */
export const EnhancedCTAButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary';
}> = ({ children, onClick, href, variant = 'primary' }) => {
  const baseClasses = 'px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300';
  const primaryClasses = 'bg-gradient-to-r from-ai-cyan to-ai-purple text-white shadow-2xl hover:shadow-ai-cyan/50';
  const secondaryClasses = 'border-2 border-ai-cyan text-ai-cyan hover:bg-ai-cyan/10';

  const className = `${baseClasses} ${variant === 'primary' ? primaryClasses : secondaryClasses}`;

  if (href) {
    return (
      <MagneticButton strength={20} className={className}>
        <a href={href}>{children}</a>
      </MagneticButton>
    );
  }

  return (
    <MagneticButton strength={20} onClick={onClick} className={className}>
      {children}
    </MagneticButton>
  );
};

/**
 * Decorative AI Eye
 * Positioned AI eye with optional position
 */
export const DecorativeAIEye: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
}> = ({ position = 'bottom-right', size = 180 }) => {
  const positionClasses = {
    'top-left': 'top-10 left-10',
    'top-right': 'top-10 right-10',
    'bottom-left': 'bottom-10 left-10',
    'bottom-right': 'bottom-10 right-10',
  };

  return (
    <div className={`absolute hidden xl:block ${positionClasses[position]}`}>
      <AIEye size={size} />
    </div>
  );
};

/**
 * Feature Card with Enhanced Effects
 * Card with scanning line and tilt effects
 */
export const EnhancedFeatureCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
}> = ({ icon: Icon, title, description, gradient }) => {
  return (
    <div className="relative group">
      <div className="relative tilt-card bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 overflow-hidden hover:border-ai-cyan/50 transition-all duration-300">
        {/* Scanning Line Effect */}
        <div className="scan-line" />

        {/* Icon with Morph Effect */}
        <div
          className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 morph-icon group-hover:animate-glow-pulse`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:neon-cyan transition-all">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-ai-cyan/0 via-ai-cyan/5 to-ai-purple/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );
};

/**
 * Binary Code Background Section
 * Section wrapper with binary background
 */
export const BinaryBackgroundSection: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const binaryText = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 50; i++) {
      let line = '';
      for (let j = 0; j < 100; j++) {
        line += Math.random() > 0.5 ? '1' : '0';
      }
      lines.push(line);
    }
    return lines.join('\n');
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Binary Background */}
      <div className="binary-bg absolute inset-0 overflow-hidden">
        <div className="binary-line font-mono text-xs leading-tight opacity-10">
          {binaryText}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * Quantum Particles Effect
 * Floating quantum particles
 */
export const QuantumParticles: React.FC<{ count?: number }> = ({ count = 10 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="quantum-particle absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * ML Training Visualization
 * Animated nodes simulating ML training
 */
export const MLTrainingViz: React.FC = () => {
  const nodes = 8;

  return (
    <div className="flex items-center justify-center gap-4 py-8">
      {Array.from({ length: nodes }).map((_, i) => (
        <div
          key={i}
          className="ml-node"
          style={{
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Sound Wave Visualization
 * Animated sound bars
 */
export const SoundWaveViz: React.FC = () => {
  return (
    <div className="sound-wave">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="sound-bar" />
      ))}
    </div>
  );
};

/**
 * Diagonal Section Wrapper
 * Section with diagonal clip-path
 */
export const DiagonalSection: React.FC<{
  children: React.ReactNode;
  variant?: 'top' | 'bottom' | 'both';
  className?: string;
}> = ({ children, variant = 'top', className = '' }) => {
  const clipClasses = {
    top: 'diagonal-top',
    bottom: 'diagonal-bottom',
    both: 'diagonal-both',
  };

  return (
    <div className={`${clipClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Masonry Testimonials Grid
 * Pinterest-style testimonial layout
 */
export const MasonryTestimonials: React.FC<{
  testimonials: Array<{
    name: string;
    role: string;
    content: string;
    image: string;
    rating: number;
  }>;
}> = ({ testimonials }) => {
  return (
    <div className="masonry-grid">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="masonry-item">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full border-2 border-ai-cyan"
              />
              <div>
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </div>

            <div className="flex gap-1 mb-3">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>

            <p className="text-gray-300 italic leading-relaxed">
              "{testimonial.content}"
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton Loader
 * Loading state with shimmer effect
 */
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`skeleton bg-gray-700 rounded ${className}`} />
  );
};

/**
 * Custom Cursor
 * Futuristic custom cursor
 */
export const CustomCursor: React.FC = () => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = React.useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      setIsPointer(
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') !== null ||
        target.closest('a') !== null
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div
        className="cursor-dot"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: isPointer ? 'scale(1.5)' : 'scale(1)',
        }}
      />
      <div
        className="cursor-outline"
        style={{
          left: `${position.x - 20}px`,
          top: `${position.y - 20}px`,
          transform: isPointer ? 'scale(1.5)' : 'scale(1)',
        }}
      />
    </>
  );
};

export default {
  BackgroundEffects,
  EnhancedHeroTitle,
  EnhancedCTAButton,
  DecorativeAIEye,
  EnhancedFeatureCard,
  BinaryBackgroundSection,
  QuantumParticles,
  MLTrainingViz,
  SoundWaveViz,
  DiagonalSection,
  MasonryTestimonials,
  SkeletonLoader,
  CustomCursor,
};
