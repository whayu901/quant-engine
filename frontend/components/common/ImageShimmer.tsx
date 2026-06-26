'use client';

import { Box, keyframes } from '@mui/material';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

interface ImageShimmerProps {
  width?: string | number;
  height?: string | number;
  aspectRatio?: string;
  borderRadius?: number | string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export default function ImageShimmer({
  width = '100%',
  height = '100%',
  aspectRatio,
  borderRadius = 0,
  variant = 'rectangular',
}: ImageShimmerProps) {
  const getBorderRadius = () => {
    if (variant === 'circular') return '50%';
    if (variant === 'rounded') return 2;
    return borderRadius;
  };

  return (
    <Box
      sx={{
        width,
        height,
        aspectRatio,
        borderRadius: getBorderRadius(),
        background: `
          linear-gradient(
            to right,
            #f0f0f0 0%,
            #f8f8f8 20%,
            #f0f0f0 40%,
            #f0f0f0 100%
          )
        `,
        backgroundSize: '1000px 100%',
        animation: `${shimmer} 2s linear infinite`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.5) 50%,
              rgba(255, 255, 255, 0) 100%
            )
          `,
          backgroundSize: '200% 100%',
          animation: `${shimmer} 1.5s ease-in-out infinite`,
        },
      }}
    />
  );
}
