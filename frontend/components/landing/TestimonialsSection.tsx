'use client';

import { Box, Container, Typography, Card, CardContent, Stack, Avatar, Rating } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FormatQuote } from '@mui/icons-material';
import SmartImage from '@/components/common/SmartImage';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Head of Research, TechCorp',
    avatar: 'SM',
    avatarImage: '/assets/higgsfield/testimonials/avatar-1.png',
    rating: 5,
    content: 'Qual Engine has revolutionized how we conduct user research. What used to take weeks now takes days. The AI insights are incredibly accurate and save us countless hours.',
    color: '#0066FF',
  },
  {
    name: 'David Chen',
    role: 'UX Researcher, DesignStudio',
    avatar: 'DC',
    avatarImage: '/assets/higgsfield/testimonials/avatar-2.png',
    rating: 5,
    content: 'The multi-language support is a game-changer for our global research. The transcription accuracy is better than anything else we\'ve tried.',
    color: '#8B5CF6',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Product Manager, StartupXYZ',
    avatar: 'ER',
    avatarImage: '/assets/higgsfield/testimonials/avatar-3.png',
    rating: 5,
    content: 'As a small team, Qual Engine gives us enterprise-level capabilities. The automated analysis helps us make data-driven decisions faster.',
    color: '#EC4899',
  },
  {
    name: 'Michael Johnson',
    role: 'Market Research Director',
    avatar: 'MJ',
    avatarImage: '/assets/higgsfield/testimonials/avatar-4.png',
    rating: 5,
    content: 'The sentiment analysis and theme extraction features are phenomenal. It\'s like having an extra team member dedicated to analyzing interviews.',
    color: '#10B981',
  },
  {
    name: 'Lisa Park',
    role: 'Academic Researcher',
    avatar: 'LP',
    avatarImage: '/assets/higgsfield/testimonials/avatar-5.png',
    rating: 5,
    content: 'For academic research, the accuracy and detailed transcriptions are essential. Qual Engine delivers on both fronts consistently.',
    color: '#F59E0B',
  },
  {
    name: 'James Wilson',
    role: 'Consulting Partner',
    avatar: 'JW',
    avatarImage: '/assets/higgsfield/testimonials/avatar-6.png',
    rating: 5,
    content: 'Our clients are impressed with how quickly we turn around insights. The collaborative features make it easy to share findings with stakeholders.',
    color: '#3B82F6',
  },
];

export default function TestimonialsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%)',
        position: 'relative',
        overflow: 'hidden',
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
            TESTIMONIALS
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
            Loved by Researchers Worldwide
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400, lineHeight: 1.7 }}
          >
            See what our customers have to say about their experience
          </Typography>
        </MotionBox>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {testimonials.map((testimonial, index) => (
            <MotionCard
              key={index}
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
                  borderColor: testimonial.color,
                  boxShadow: `0 8px 32px ${testimonial.color}20`,
                  transform: 'translateY(-4px)',
                  '& .quote-icon': {
                    transform: 'rotate(-10deg) scale(1.1)',
                    color: testimonial.color,
                  },
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  {/* Quote Icon */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      opacity: 0.1,
                    }}
                  >
                    <FormatQuote
                      className="quote-icon"
                      sx={{
                        fontSize: 64,
                        color: testimonial.color,
                        transition: 'all 0.3s ease-in-out',
                      }}
                    />
                  </Box>

                  {/* Rating */}
                  <Rating value={testimonial.rating} readOnly size="small" />

                  {/* Content */}
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      color: 'text.primary',
                      fontSize: '0.9375rem',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    "{testimonial.content}"
                  </Typography>

                  {/* Author */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    {testimonial.avatarImage ? (
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: `3px solid ${testimonial.color}30`,
                          boxShadow: `0 4px 12px ${testimonial.color}20`,
                        }}
                      >
                        <SmartImage
                          src={testimonial.avatarImage}
                          alt={testimonial.name}
                          fallback={
                            <Avatar
                              sx={{
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(135deg, ${testimonial.color} 0%, ${testimonial.color}CC 100%)`,
                                fontWeight: 700,
                                fontSize: '1.125rem',
                              }}
                            >
                              {testimonial.avatar}
                            </Avatar>
                          }
                          width="100%"
                          height="100%"
                          objectFit="cover"
                        />
                      </Box>
                    ) : (
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          background: `linear-gradient(135deg, ${testimonial.color} 0%, ${testimonial.color}CC 100%)`,
                          fontWeight: 700,
                          fontSize: '1.125rem',
                        }}
                      >
                        {testimonial.avatar}
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </MotionCard>
          ))}
        </Box>

        {/* Stats Section */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          sx={{ mt: 10 }}
        >
          <Box
            sx={{
              borderRadius: 4,
              background: 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 100%)',
              p: { xs: 4, md: 6 },
              color: 'white',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={4}
              divider={
                <Box
                  sx={{
                    width: { xs: '100%', md: 1 },
                    height: { xs: 1, md: 'auto' },
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                  }}
                />
              }
            >
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  50K+
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Hours Transcribed
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  2,500+
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Active Researchers
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  98%
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Customer Satisfaction
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                  40+
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Languages Supported
                </Typography>
              </Box>
            </Stack>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
}
