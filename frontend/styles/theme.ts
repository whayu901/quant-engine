'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

// Brand colors from previous Tailwind config
const brandColors = {
  velocityBlue: '#0066FF',
  neuralPurple: '#8B5CF6',
  accentCoral: '#FF6B6B',
  accentMint: '#4ECDC4',
  accentGold: '#FFD93D',
  accentLavender: '#C084FC',
  aiCyan: '#00FFFF',
  aiPurple: '#9333EA',
  aiPink: '#EC4899',
  aiNeonGreen: '#39FF14',
};

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: brandColors.velocityBlue,
      light: '#3d85ff',
      dark: '#0052cc',
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.neuralPurple,
      light: '#a47ff8',
      dark: '#6b46c4',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#EF4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3B82F6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0px 2px 4px rgba(0, 0, 0, 0.08)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 8px 16px rgba(0, 0, 0, 0.08)',
    '0px 12px 24px rgba(0, 0, 0, 0.08)',
    '0px 16px 32px rgba(0, 0, 0, 0.08)',
    '0px 20px 40px rgba(0, 0, 0, 0.08)',
    '0px 24px 48px rgba(0, 0, 0, 0.08)',
    '0px 28px 56px rgba(0, 0, 0, 0.08)',
    '0px 32px 64px rgba(0, 0, 0, 0.08)',
    '0px 36px 72px rgba(0, 0, 0, 0.08)',
    '0px 40px 80px rgba(0, 0, 0, 0.08)',
    '0px 44px 88px rgba(0, 0, 0, 0.08)',
    '0px 48px 96px rgba(0, 0, 0, 0.08)',
    '0px 52px 104px rgba(0, 0, 0, 0.08)',
    '0px 56px 112px rgba(0, 0, 0, 0.08)',
    '0px 60px 120px rgba(0, 0, 0, 0.08)',
    '0px 64px 128px rgba(0, 0, 0, 0.08)',
    '0px 68px 136px rgba(0, 0, 0, 0.08)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          transition: 'box-shadow 0.3s ease-in-out',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover fieldset': {
              borderColor: brandColors.velocityBlue,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
};

export const theme = createTheme(themeOptions);
