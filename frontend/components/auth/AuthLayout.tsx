'use client';

import React from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: theme.palette.background.default,
      }}
    >
      {/* Brand Panel - 40% */}
      {!isMobile && (
        <Box
          sx={{
            width: '40%',
            background: 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 100%)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Animated Background Orbs */}
          <Box
            component={motion.div}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            sx={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <Box
            component={motion.div}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            sx={{
              position: 'absolute',
              bottom: '10%',
              right: '10%',
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />

          {/* Brand Content */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              textAlign: 'center',
              px: 6,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h1"
                sx={{
                  color: 'white',
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2,
                  textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                Qual Engine
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 400,
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                AI-Powered Research Intelligence
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.9)',
                    }}
                  />
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                    Automated Qualitative Analysis
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.9)',
                    }}
                  />
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                    Real-time Insights Dashboard
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'rgba(255,255,255,0.9)',
                    }}
                  />
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                    Enterprise-Grade Security
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Box>
        </Box>
      )}

      {/* Form Panel - 60% */}
      <Box
        sx={{
          width: isMobile ? '100%' : '60%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              {isMobile && (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Qual Engine
                </Typography>
              )}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>

            {children}
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
