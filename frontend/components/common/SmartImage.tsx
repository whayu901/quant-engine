'use client';

import { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SmartImageProps {
  src: string;
  alt: string;
  fallback?: string | React.ReactNode;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  priority?: boolean;
  blur?: boolean;
  shimmer?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  sx?: any;
}

const MotionBox = motion(Box);

export default function SmartImage({
  src,
  alt,
  fallback,
  width = '100%',
  height = 'auto',
  aspectRatio,
  objectFit = 'cover',
  priority = false,
  blur = true,
  shimmer = true,
  onLoad,
  onError,
  sx = {},
}: SmartImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
    setLoading(true);
    setError(false);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
    onError?.();
  };

  // Shimmer effect for loading state
  const shimmerStyles = shimmer ? {
    background: `
      linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.3) 50%,
        rgba(255, 255, 255, 0) 100%
      )
    `,
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite',
    '@keyframes shimmer': {
      '0%': {
        backgroundPosition: '-200% 0',
      },
      '100%': {
        backgroundPosition: '200% 0',
      },
    },
  } : {};

  // Render fallback if error or no src
  if (error || !src) {
    if (typeof fallback === 'string') {
      return (
        <Box
          sx={{
            width,
            height,
            aspectRatio,
            background: fallback,
            borderRadius: 'inherit',
            ...sx,
          }}
        />
      );
    }
    return fallback || null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        aspectRatio,
        overflow: 'hidden',
        borderRadius: 'inherit',
        ...sx,
      }}
    >
      {/* Loading skeleton with shimmer */}
      <AnimatePresence>
        {loading && (
          <MotionBox
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 2,
            }}
          >
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation={shimmer ? false : 'wave'}
              sx={{
                borderRadius: 'inherit',
                ...shimmerStyles,
              }}
            />
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Actual image */}
      <MotionBox
        initial={{ opacity: 0, scale: blur ? 1.05 : 1 }}
        animate={{
          opacity: loading ? 0 : 1,
          scale: 1,
        }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        }}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <Image
          src={imageSrc}
          alt={alt}
          fill
          style={{
            objectFit,
          }}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          quality={95}
        />
      </MotionBox>
    </Box>
  );
}
