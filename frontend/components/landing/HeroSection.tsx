'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Stack, Grid } from '@mui/material';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PlayArrow, TrendingUp } from '@mui/icons-material';
import { useInView } from 'react-intersection-observer';
import SmartImage from '@/components/common/SmartImage';

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);

export default function HeroSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#FAFBFC',
      }}
    >
      {/* AI-Generated Hero Background with Parallax */}
      <MotionBox
        style={{ y }}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <SmartImage
          src="/assets/higgsfield/hero/hero-background.png"
          alt="AI-Powered Dashboard Interface"
          fallback="linear-gradient(135deg, rgba(0, 102, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)"
          objectFit="cover"
          priority
          sx={{
            opacity: 0.4,
            mixBlendMode: 'soft-light',
          }}
        />
      </MotionBox>

      {/* Gradient Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(135deg,
              rgba(0, 102, 255, 0.03) 0%,
              rgba(139, 92, 246, 0.03) 50%,
              rgba(236, 72, 153, 0.03) 100%
            )
          `,
          zIndex: 0,
        }}
      />

      {/* Animated floating orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '80%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(0, 102, 255, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 20s ease-in-out infinite',
          zIndex: 0,
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translate(0, 0) scale(1)',
            },
            '50%': {
              transform: 'translate(-20px, -20px) scale(1.05)',
            },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '60%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 25s ease-in-out infinite reverse',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <Stack spacing={3}>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 20,
                    background: 'linear-gradient(90deg, #0066FF 0%, #8B5CF6 100%)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    width: 'fit-content',
                    boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)',
                  }}
                >
                  AI-Powered Research Platform
                </Box>

                <MotionTypography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 50%, #EC4899 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Transform Interviews into Insights
                </MotionTypography>

                <MotionTypography
                  variant="h5"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '1.125rem', md: '1.25rem' },
                    lineHeight: 1.6,
                    fontWeight: 400,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Qual Engine uses advanced AI to transcribe, analyze, and extract meaningful patterns from your qualitative research in 40+ languages.
                </MotionTypography>

                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrow />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.125rem',
                        background: 'linear-gradient(90deg, #0066FF 0%, #8B5CF6 100%)',
                        boxShadow: '0 8px 24px rgba(0, 102, 255, 0.35)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #0052CC 0%, #7C3AED 100%)',
                          boxShadow: '0 12px 32px rgba(0, 102, 255, 0.45)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Start Free Trial
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<TrendingUp />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.125rem',
                        borderWidth: 2,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: 'primary.dark',
                          background: 'rgba(0, 102, 255, 0.05)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      View Demo
                    </Button>
                  </Stack>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        40+
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Languages
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                        98%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Accuracy
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                        10x
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Faster
                      </Typography>
                    </Box>
                  </Stack>
                </MotionBox>
              </Stack>
            </MotionBox>
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
              sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '120%',
                  height: '120%',
                  background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  borderRadius: '50%',
                  filter: 'blur(60px)',
                  animation: 'pulse 3s ease-in-out infinite',
                },
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 0.5,
                    transform: 'translate(-50%, -50%) scale(1)',
                  },
                  '50%': {
                    opacity: 0.8,
                    transform: 'translate(-50%, -50%) scale(1.1)',
                  },
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  p: 3,
                }}
              >
                {/* Dashboard Preview Mockup */}
                <Box
                  sx={{
                    background: 'white',
                    borderRadius: 2,
                    p: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box sx={{ width: 100, height: 24, bgcolor: '#F3F4F6', borderRadius: 1 }} />
                      <Box sx={{ width: 80, height: 24, bgcolor: '#F3F4F6', borderRadius: 1 }} />
                    </Stack>

                    {/* Chart Area */}
                    <Box
                      sx={{
                        height: 200,
                        background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 1,
                        p: 2,
                      }}
                    >
                      {[60, 80, 50, 90, 70, 85, 95].map((height, i) => (
                        <Box
                          key={i}
                          sx={{
                            flex: 1,
                            height: `${height}%`,
                            background: `linear-gradient(180deg, #0066FF ${i * 10}%, #8B5CF6 100%)`,
                            borderRadius: 1,
                            animation: `grow 1s ease-out ${i * 0.1}s both`,
                            '@keyframes grow': {
                              from: { height: 0 },
                            },
                          }}
                        />
                      ))}
                    </Box>

                    {/* Stats Cards */}
                    <Grid container spacing={2}>
                      {[1, 2, 3].map((_, i) => (
                        <Grid item xs={4} key={i}>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: '#F9FAFB',
                              borderRadius: 1,
                            }}
                          >
                            <Box sx={{ width: '100%', height: 8, bgcolor: '#E5E7EB', borderRadius: 0.5, mb: 1 }} />
                            <Box sx={{ width: '60%', height: 12, bgcolor: '#D1D5DB', borderRadius: 0.5 }} />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </Box>
              </Box>
            </MotionBox>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
