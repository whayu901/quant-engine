/**
 * Holographic Text Effect Component
 * Creates shimmering holographic text with RGB split
 */

import React from 'react';
import { motion } from 'framer-motion';

interface HolographicTextProps {
  text: string;
  className?: string;
  enableRGBSplit?: boolean;
}

export const HolographicText: React.FC<HolographicTextProps> = React.memo(({
  text,
  className = '',
  enableRGBSplit = true
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main Text */}
      <motion.span
        className="relative inline-block"
        style={{
          background: 'linear-gradient(45deg, #00FFFF 0%, #9333EA 25%, #EC4899 50%, #00FFFF 75%, #9333EA 100%)',
          backgroundSize: '300% 300%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '50% 100%', '50% 0%', '0% 50%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {text}
      </motion.span>

      {/* RGB Split Effects */}
      {enableRGBSplit && (
        <>
          <motion.span
            className="absolute inset-0"
            style={{
              color: '#00FFFF',
              opacity: 0,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              x: [-2, 2, -2],
              y: [2, -2, 2],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            {text}
          </motion.span>

          <motion.span
            className="absolute inset-0"
            style={{
              color: '#EC4899',
              opacity: 0,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              x: [2, -2, 2],
              y: [-2, 2, -2],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 3,
              delay: 0.1,
            }}
          >
            {text}
          </motion.span>
        </>
      )}
    </div>
  );
});

HolographicText.displayName = 'HolographicText';
