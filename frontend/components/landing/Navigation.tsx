'use client';

import { AppBar, Toolbar, Container, Typography, Button, Box, Stack, IconButton, Drawer, List, ListItem } from '@mui/material';
import { Menu as MenuIcon, Close } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MotionAppBar = motion(AppBar);

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileOpen(false);
  };

  return (
    <>
      <MotionAppBar
        position="fixed"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          background: scrolled
            ? 'rgba(255, 255, 255, 0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
          transition: 'all 0.3s ease-in-out',
          py: scrolled ? 0 : 1,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box
              component="a"
              href="/"
              sx={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.5rem',
                }}
              >
                Qual Engine
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
              }}
            >
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  sx={{
                    color: scrolled ? 'text.primary' : 'text.primary',
                    fontWeight: 600,
                    px: 2,
                    '&:hover': {
                      background: 'rgba(0, 102, 255, 0.08)',
                      color: 'primary.main',
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>

            {/* CTA Buttons */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Link href="/login" passHref style={{ textDecoration: 'none' }}>
                <Button
                  variant="text"
                  sx={{
                    color: scrolled ? 'text.primary' : 'text.primary',
                    fontWeight: 600,
                    display: { xs: 'none', sm: 'inline-flex' },
                    '&:hover': {
                      background: 'rgba(0, 102, 255, 0.08)',
                      color: 'primary.main',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/login" passHref style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(90deg, #0066FF 0%, #8B5CF6 100%)',
                    fontWeight: 600,
                    px: 3,
                    display: { xs: 'none', sm: 'inline-flex' },
                    boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #0052CC 0%, #7C3AED 100%)',
                      boxShadow: '0 6px 20px rgba(0, 102, 255, 0.4)',
                    },
                  }}
                >
                  Get Started
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  display: { md: 'none' },
                  color: scrolled ? 'text.primary' : 'text.primary',
                }}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </MotionAppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'white',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Qual Engine
            </Typography>
            <IconButton onClick={handleDrawerToggle}>
              <Close />
            </IconButton>
          </Stack>

          <List>
            {navLinks.map((link) => (
              <ListItem key={link.label} disablePadding sx={{ mb: 1 }}>
                <Button
                  fullWidth
                  onClick={() => scrollToSection(link.href)}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.5,
                    px: 2,
                    color: 'text.primary',
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                      background: 'rgba(0, 102, 255, 0.08)',
                      color: 'primary.main',
                    },
                  }}
                >
                  {link.label}
                </Button>
              </ListItem>
            ))}
          </List>

          <Stack spacing={2} sx={{ mt: 4, px: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              href="/login"
              sx={{
                borderWidth: 2,
                borderColor: 'primary.main',
                color: 'primary.main',
                fontWeight: 600,
                py: 1.5,
                '&:hover': {
                  borderWidth: 2,
                  background: 'rgba(0, 102, 255, 0.08)',
                },
              }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              fullWidth
              href="/login"
              sx={{
                background: 'linear-gradient(90deg, #0066FF 0%, #8B5CF6 100%)',
                fontWeight: 600,
                py: 1.5,
                boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #0052CC 0%, #7C3AED 100%)',
                },
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
