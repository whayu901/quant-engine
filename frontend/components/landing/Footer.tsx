'use client';

import { Box, Container, Typography, Grid, Stack, IconButton, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import {
  Twitter,
  LinkedIn,
  GitHub,
  YouTube,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const MotionBox = motion(Box);

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Use Cases', href: '#use-cases' },
      { label: 'Integrations', href: '#integrations' },
      { label: 'API', href: '#api' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Blog', href: '#blog' },
      { label: 'Press Kit', href: '#press' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#docs' },
      { label: 'Help Center', href: '#help' },
      { label: 'Community', href: '#community' },
      { label: 'Tutorials', href: '#tutorials' },
      { label: 'Status', href: '#status' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
      { label: 'GDPR', href: '#gdpr' },
      { label: 'Security', href: '#security' },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: '#1DA1F2' },
  { icon: LinkedIn, href: 'https://linkedin.com', label: 'LinkedIn', color: '#0A66C2' },
  { icon: GitHub, href: 'https://github.com', label: 'GitHub', color: '#181717' },
  { icon: YouTube, href: 'https://youtube.com', label: 'YouTube', color: '#FF0000' },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
        borderTop: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Box sx={{ py: 8 }}>
          <Grid container spacing={4}>
            {/* Brand Section */}
            <Grid item xs={12} md={4}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Stack spacing={3}>
                  {/* Logo */}
                  <Box>
                    <Typography
                      variant="h5"
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
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      Transform interviews into insights with AI-powered transcription and analysis
                    </Typography>
                  </Box>

                  {/* Contact Info */}
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Email sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        hello@qualengine.com
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Phone sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        +1 (555) 123-4567
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <LocationOn sx={{ fontSize: 18, color: 'primary.main', mt: 0.25 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        123 Innovation Drive
                        <br />
                        San Francisco, CA 94105
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Social Links */}
                  <Stack direction="row" spacing={1}>
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <IconButton
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'text.secondary',
                            border: '1px solid',
                            borderColor: 'grey.200',
                            '&:hover': {
                              color: social.color,
                              borderColor: social.color,
                              background: `${social.color}08`,
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                          aria-label={social.label}
                        >
                          <Icon sx={{ fontSize: 20 }} />
                        </IconButton>
                      );
                    })}
                  </Stack>
                </Stack>
              </MotionBox>
            </Grid>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([key, section], sectionIndex) => (
              <Grid item xs={6} sm={6} md={2} key={key}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: 'text.primary',
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Stack spacing={1.5}>
                    {section.links.map((link, index) => (
                      <Box
                        key={index}
                        component="a"
                        href={link.href}
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'none',
                          fontSize: '0.9375rem',
                          display: 'inline-block',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            color: 'primary.main',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        {link.label}
                      </Box>
                    ))}
                  </Stack>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider />

        {/* Bottom Bar */}
        <Box
          sx={{
            py: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            © {new Date().getFullYear()} Qual Engine. All rights reserved.
          </Typography>

          <Stack
            direction="row"
            spacing={3}
            divider={<Box sx={{ width: 1, height: 16, bgcolor: 'grey.300' }} />}
            flexWrap="wrap"
            justifyContent={{ xs: 'center', sm: 'flex-end' }}
          >
            <Box
              component="a"
              href="#privacy"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                },
                transition: 'color 0.2s ease-in-out',
              }}
            >
              Privacy
            </Box>
            <Box
              component="a"
              href="#terms"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                },
                transition: 'color 0.2s ease-in-out',
              }}
            >
              Terms
            </Box>
            <Box
              component="a"
              href="#cookies"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  color: 'primary.main',
                },
                transition: 'color 0.2s ease-in-out',
              }}
            >
              Cookies
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
