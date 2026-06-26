/**
 * Scanning Line Effect Component
 * Creates a scanning line effect for futuristic UI
 */

import React from 'react';
import { motion } from 'framer-motion';

interface ScanningLineProps {
  className?: string;
  color?: string;
}

export const ScanningLine: React.FC<ScanningLineProps> = React.memo(({
  className = '',
  color = '#00FFFF'
}) => {
  return (
    <motion.div
      className={`absolute left-0 right-0 h-0.5 pointer-events-none ${className}`}
      style={{
        background: `linear-gradient(to right, transparent, ${color}, transparent)`,
        boxShadow: `0 0 20px ${color}`,
      }}
      animate={{
        top: ['0%', '100%'],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
});

ScanningLine.displayName = 'ScanningLine';
