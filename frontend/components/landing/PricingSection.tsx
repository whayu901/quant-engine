'use client';

import { Box, Container, Typography, Card, CardContent, Stack, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Star } from '@mui/icons-material';
import Link from 'next/link';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const plans = [
  {
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for individual researchers',
    features: [
      '5 hours of transcription/month',
      'Basic AI analysis',
      '3 active projects',
      'Single language support',
      'Email support',
      'Standard security',
    ],
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    popular: false,
  },
  {
    name: 'Professional',
    price: 99,
    period: 'month',
    description: 'For growing research teams',
    features: [
      '25 hours of transcription/month',
      'Advanced AI analysis',
      'Unlimited projects',
      'Multi-language support (40+)',
      'Priority support',
      'Team collaboration',
      'Custom integrations',
      'Advanced security',
    ],
    color: '#0066FF',
    gradient: 'linear-gradient(135deg, #0066FF 0%, #4A90FF 100%)',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: null,
    period: 'Custom',
    description: 'For large organizations',
    features: [
      'Unlimited transcription',
      'Enterprise AI features',
      'Unlimited projects',
      'All languages + custom models',
      '24/7 dedicated support',
      'Advanced team features',
      'Custom API access',
      'SOC 2 + GDPR compliance',
      'Custom deployment',
    ],
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
    popular: false,
  },
];

export default function PricingSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
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
            PRICING
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
            Choose Your Perfect Plan
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', fontWeight: 400, lineHeight: 1.7 }}
          >
            Flexible pricing designed to scale with your research needs
          </Typography>
        </MotionBox>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
            alignItems: 'stretch',
          }}
        >
          {plans.map((plan, index) => (
            <MotionCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              sx={{
                position: 'relative',
                border: '2px solid',
                borderColor: plan.popular ? plan.color : 'grey.200',
                transform: plan.popular ? { md: 'scale(1.05)' } : 'none',
                zIndex: plan.popular ? 2 : 1,
                '&:hover': {
                  borderColor: plan.color,
                  boxShadow: `0 12px 40px ${plan.color}30`,
                  transform: plan.popular ? { md: 'scale(1.08)' } : { md: 'scale(1.03)' },
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {plan.popular && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                  }}
                >
                  <Chip
                    icon={<Star sx={{ fontSize: 16 }} />}
                    label="Most Popular"
                    sx={{
                      background: plan.gradient,
                      color: 'white',
                      fontWeight: 700,
                      px: 2,
                      boxShadow: `0 4px 12px ${plan.color}40`,
                    }}
                  />
                </Box>
              )}

              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  {/* Plan Header */}
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: plan.color,
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.description}
                    </Typography>
                  </Box>

                  {/* Pricing */}
                  <Box>
                    {plan.price ? (
                      <Stack direction="row" alignItems="baseline" spacing={1}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                          }}
                        >
                          ${plan.price}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          /{plan.period}
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          color: 'text.primary',
                        }}
                      >
                        Custom
                      </Typography>
                    )}
                  </Box>

                  {/* CTA Button */}
                  <Link
                    href={plan.price ? '/login' : '/contact-sales'}
                    passHref
                    style={{ textDecoration: 'none', width: '100%' }}
                  >
                    <Button
                      variant={plan.popular ? 'contained' : 'outlined'}
                      size="large"
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 700,
                        ...(plan.popular
                          ? {
                              background: plan.gradient,
                              boxShadow: `0 4px 14px ${plan.color}40`,
                              '&:hover': {
                                background: plan.gradient,
                                boxShadow: `0 6px 20px ${plan.color}50`,
                              },
                            }
                          : {
                              borderWidth: 2,
                              borderColor: plan.color,
                              color: plan.color,
                              '&:hover': {
                                borderWidth: 2,
                                borderColor: plan.color,
                                background: `${plan.color}08`,
                              },
                            }),
                      }}
                    >
                      {plan.price ? 'Get Started' : 'Contact Sales'}
                    </Button>
                  </Link>

                  {/* Features */}
                  <Box sx={{ pt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                      What's included:
                    </Typography>
                    <Stack spacing={1.5}>
                      {plan.features.map((feature, idx) => (
                        <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                          <Check
                            sx={{
                              fontSize: 20,
                              color: plan.color,
                              mt: 0.25,
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {feature}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </MotionCard>
          ))}
        </Box>

        {/* Trust Section */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          sx={{ mt: 8, textAlign: 'center' }}
        >
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            All plans include:
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            flexWrap="wrap"
          >
            {['14-day free trial', 'No credit card required', 'Cancel anytime', 'Money-back guarantee'].map(
              (item, idx) => (
                <Stack key={idx} direction="row" spacing={1} alignItems="center">
                  <Check sx={{ fontSize: 20, color: 'success.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item}
                  </Typography>
                </Stack>
              )
            )}
          </Stack>
        </MotionBox>
      </Container>
    </Box>
  );
}
