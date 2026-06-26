/**
 * Data Stream Effect Component
 * Animated vertical data streams for tech aesthetic
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DataStreamProps {
  count?: number;
  className?: string;
}

export const DataStream: React.FC<DataStreamProps> = React.memo(({ count = 20, className = '' }) => {
  const streams = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i / count) * 100}%`,
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
        height: 50 + Math.random() * 100,
      })),
    [count]
  );

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {streams.map((stream) => (
        <motion.div
          key={stream.id}
          className="absolute w-px opacity-30"
          style={{
            left: stream.left,
            height: `${stream.height}px`,
            background: 'linear-gradient(to bottom, transparent, #00FFFF, transparent)',
          }}
          animate={{
            y: ['0vh', '100vh'],
          }}
          transition={{
            duration: stream.duration,
            repeat: Infinity,
            delay: stream.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
});

DataStream.displayName = 'DataStream';
