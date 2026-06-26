/**
 * Electric Sparks Effect Component
 * Animated electric sparks traveling between elements
 */

import React from 'react';
import { motion } from 'framer-motion';

interface ElectricSparksProps {
  className?: string;
  count?: number;
}

export const ElectricSparks: React.FC<ElectricSparksProps> = React.memo(({
  className = '',
  count = 5
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-0.5 w-24"
          style={{
            left: `${20 + (i * 15)}%`,
            top: `${30 + (i * 10)}%`,
            background: 'linear-gradient(90deg, transparent, #00FFFF, transparent)',
            boxShadow: '0 0 10px #00FFFF',
          }}
          animate={{
            scaleX: [0, 1, 0],
            rotate: [0, 45, 90],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
});

ElectricSparks.displayName = 'ElectricSparks';
