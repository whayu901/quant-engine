'use client';

import { Box, Container, Typography, Grid, Stack, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CloudUpload, AutoAwesome, Insights, Download } from '@mui/icons-material';

const MotionBox = motion(Box);

const steps = [
  {
    icon: CloudUpload,
    title: 'Upload Your Files',
    description: 'Drag and drop your audio or video files. Support for MP3, WAV, MP4, and more.',
    color: '#0066FF',
    step: 1,
  },
  {
    icon: AutoAwesome,
    title: 'AI Processing',
    description: 'Our AI transcribes and analyzes your content with speaker identification.',
    color: '#8B5CF6',
    step: 2,
  },
  {
    icon: Insights,
    title: 'Extract Insights',
    description: 'Review themes, sentiments, and patterns automatically detected by our AI.',
    color: '#EC4899',
    step: 3,
  },
  {
    icon: Download,
    title: 'Export & Share',
    description: 'Download reports in multiple formats or share insights with your team.',
    color: '#10B981',
    step: 4,
  },
];

export default function HowItWorksSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', mb: 10 }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.9375rem',
              letterSpacing: 1.5,
              mb: 2,
              display: 'block',
            }}
          >
            HOW IT WORKS
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.75rem' },
              background: 'linear-gradient(135deg, #111827 0%, #4B5563 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Simple Process, Powerful Results
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400, lineHeight: 1.7 }}
          >
            From upload to insights in just four easy steps
          </Typography>
        </MotionBox>

        <Box sx={{ position: 'relative' }}>
          {/* Connection Lines */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              top: '60px',
              left: '12.5%',
              right: '12.5%',
              height: 2,
              background: 'linear-gradient(90deg, #0066FF 0%, #8B5CF6 33%, #EC4899 66%, #10B981 100%)',
              opacity: 0.2,
              zIndex: 0,
            }}
          />

          <Grid container spacing={4}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <MotionBox
                    initial={{ opacity: 0, y: 50 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    sx={{ position: 'relative', zIndex: 1 }}
                  >
                    <Stack spacing={3} alignItems="center" textAlign="center">
                      {/* Step Number & Icon */}
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}CC 100%)`,
                            boxShadow: `0 8px 32px ${step.color}40`,
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: -4,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${step.color}40 0%, transparent 100%)`,
                              animation: 'pulse-ring 2s ease-in-out infinite',
                            },
                            '@keyframes pulse-ring': {
                              '0%, 100%': {
                                opacity: 0.4,
                                transform: 'scale(1)',
                              },
                              '50%': {
                                opacity: 0.8,
                                transform: 'scale(1.05)',
                              },
                            },
                          }}
                        >
                          <Icon sx={{ fontSize: 48 }} />
                        </Avatar>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `3px solid ${step.color}`,
                            fontWeight: 700,
                            fontSize: '1.125rem',
                            color: step.color,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          {step.step}
                        </Box>
                      </Box>

                      {/* Content */}
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            mb: 1.5,
                            color: 'text.primary',
                          }}
                        >
                          {step.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ lineHeight: 1.7, fontSize: '0.9375rem' }}
                        >
                          {step.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </MotionBox>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* CTA Section */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          sx={{
            mt: 10,
            p: 6,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            border: '1px solid',
            borderColor: 'primary.main',
            borderWidth: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Ready to transform your research workflow?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.125rem' }}>
            Join thousands of researchers who trust Qual Engine
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Box
              component="a"
              href="/login"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(90deg, #0066FF 0%, #8B5CF6 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.125rem',
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 8px 24px rgba(0, 102, 255, 0.35)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(0, 102, 255, 0.45)',
                },
              }}
            >
              Get Started Free
            </Box>
          </Stack>
        </MotionBox>
      </Container>
    </Box>
  );
}
