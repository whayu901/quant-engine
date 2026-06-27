'use client';

import React from 'react';
import { Box, LinearProgress, Typography, useTheme } from '@mui/material';
import { CheckCircle2, Circle } from 'lucide-react';
import { validatePasswordStrength } from '@/lib/validation/auth-schemas';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const theme = useTheme();
  const strength = validatePasswordStrength(password);

  const getStrengthColor = (score: number): string => {
    if (score <= 1) return theme.palette.error.main;
    if (score <= 3) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getStrengthLabel = (score: number): string => {
    if (score === 0) return 'Very Weak';
    if (score === 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Good';
    if (score === 4) return 'Strong';
    return 'Very Strong';
  };

  if (!password) return null;

  const strengthColor = getStrengthColor(strength.score);
  const strengthLabel = getStrengthLabel(strength.score);
  const strengthPercentage = (strength.score / 5) * 100;

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
          Password Strength
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: strengthColor,
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {strengthLabel}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={strengthPercentage}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            bgcolor: strengthColor,
            borderRadius: 3,
          },
        }}
      />

      {strength.feedback.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1, fontSize: '0.875rem' }}>
            Password must include:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {[
              { key: 'hasMinLength', label: 'At least 8 characters' },
              { key: 'hasUpperCase', label: 'One uppercase letter' },
              { key: 'hasLowerCase', label: 'One lowercase letter' },
              { key: 'hasNumber', label: 'One number' },
              { key: 'hasSpecialChar', label: 'One special character' },
            ].map(({ key, label }) => {
              const isValid = strength[key as keyof typeof strength];
              return (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {isValid ? (
                    <CheckCircle2
                      size={16}
                      style={{ color: theme.palette.success.main }}
                    />
                  ) : (
                    <Circle
                      size={16}
                      style={{ color: theme.palette.grey[400] }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: isValid ? theme.palette.success.main : theme.palette.text.secondary,
                      fontSize: '0.8125rem',
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
