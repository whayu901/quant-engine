'use client';

import { Box, Container, Typography, Grid, Card, CardContent, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Mic,
  Language,
  AutoAwesome,
  Speed,
  Security,
  CloudDone,
  TrendingUp,
  Psychology,
} from '@mui/icons-material';
import SmartImage from '@/components/common/SmartImage';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const features = [
  {
    icon: Mic,
    iconImage: '/assets/higgsfield/features/ai-transcription.png',
    title: 'AI Transcription',
    description: 'Industry-leading transcription accuracy with speaker identification and timestamps.',
    color: '#0066FF',
    gradient: 'linear-gradient(135deg, #0066FF 0%, #4A90FF 100%)',
  },
  {
    icon: Language,
    iconImage: '/assets/higgsfield/features/multi-language.png',
    title: '40+ Languages',
    description: 'Support for over 40 languages with automatic language detection and translation.',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
  },
  {
    icon: AutoAwesome,
    iconImage: '/assets/higgsfield/features/smart-analytics.png',
    title: 'Smart Analysis',
    description: 'AI-powered theme extraction, sentiment analysis, and pattern recognition.',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
  },
  {
    icon: Speed,
    iconImage: '/assets/higgsfield/features/real-time.png',
    title: 'Lightning Fast',
    description: 'Process hours of interviews in minutes with real-time transcription.',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  },
  {
    icon: Security,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, GDPR compliance, and SOC 2 Type II certified.',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  },
  {
    icon: CloudDone,
    title: 'Cloud-Based',
    description: 'Access your research from anywhere with automatic syncing and backups.',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  },
  {
    icon: TrendingUp,
    title: 'Advanced Analytics',
    description: 'Interactive dashboards with customizable reports and data visualization.',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #C084FC 100%)',
  },
  {
    icon: Psychology,
    title: 'AI Insights',
    description: 'Discover hidden insights with machine learning-powered recommendations.',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #F9A8D4 100%)',
  },
];

export default function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #FAFBFC 0%, #FFFFFF 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '-10%',
          width: '40%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
        },
      }}
    >
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          sx={{ textAlign: 'center', mb: 8 }}
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
            FEATURES
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
            Everything You Need to Excel
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400, lineHeight: 1.7 }}
          >
            Powerful features designed to transform how you conduct and analyze qualitative research
          </Typography>
        </MotionBox>

        <Grid container spacing={4}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      borderColor: feature.color,
                      boxShadow: `0 8px 32px ${feature.color}20`,
                      transform: 'translateY(-8px)',
                      '& .feature-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                        background: feature.gradient,
                      },
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Box
                        className="feature-icon"
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `${feature.color}10`,
                          transition: 'all 0.3s ease-in-out',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {feature.iconImage ? (
                          <SmartImage
                            src={feature.iconImage}
                            alt={`${feature.title} Icon`}
                            fallback={<Icon sx={{ fontSize: 40, color: feature.color }} />}
                            width="100%"
                            height="100%"
                            objectFit="contain"
                            sx={{
                              p: 1,
                            }}
                          />
                        ) : (
                          <Icon sx={{ fontSize: 40, color: feature.color }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {feature.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </MotionCard>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
