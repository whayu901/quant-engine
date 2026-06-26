/**
 * AI Eye/Iris Animation Component
 * Animated AI eye with iris scanning effect
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

interface AIEyeProps {
  className?: string;
  size?: number;
}

export const AIEye: React.FC<AIEyeProps> = React.memo(({
  className = '',
  size = 120
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer Eye Glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, #00FFFF 0%, #9333EA 100%)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.3)',
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Rotating Iris */}
      <motion.div
        className="absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, #fff 0%, #00FFFF 50%, #9333EA 100%)',
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {/* Pupil */}
        <div
          className="absolute top-1/2 left-1/2 rounded-full bg-black"
          style={{
            width: size * 0.17,
            height: size * 0.17,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
          }}
        />
      </motion.div>

      {/* Iris Details */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-px bg-ai-cyan"
          style={{
            height: size * 0.2,
            transformOrigin: '0 0',
            transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
            opacity: 0.6,
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}

      {/* Outer Rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute top-1/2 left-1/2 border-2 border-ai-cyan/30 rounded-full"
          style={{
            width: size * (0.7 + ring * 0.15),
            height: size * (0.7 + ring * 0.15),
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: ring * 0.3,
          }}
        />
      ))}
    </div>
  );
});

AIEye.displayName = 'AIEye';
