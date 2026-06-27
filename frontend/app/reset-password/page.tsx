'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validation/auth-schemas';
import { authService } from '@/lib/services/auth-service';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    try {
      setError(null);
      await authService.resetPassword({ ...data, token });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Password Reset Successful" subtitle="Your password has been updated">
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              mb: 3,
            }}
          >
            <CheckCircle2 size={40} color="white" />
          </Box>

          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Your password has been successfully reset. You can now log in with your new password.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={() => router.push('/login')}
            sx={{
              height: 48,
              background: 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 100%)',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #0052CC 0%, #7C3AED 100%)',
              },
            }}
          >
            Continue to Login
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Error Message */}
        {error && (
          <Alert
            severity="error"
            icon={<AlertCircle size={20} />}
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            {error}
          </Alert>
        )}

        {!token && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/forgot-password')}
              sx={{
                height: 48,
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Request New Reset Link
            </Button>
          </Box>
        )}

        {token && (
          <>
            {/* Password Field */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoFocus
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      height: 48,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Confirm Password Field */}
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      height: 48,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Password Strength Indicator */}
            <PasswordStrengthIndicator password={passwordValue} />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                height: 48,
                background: 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 100%)',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                mb: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #0052CC 0%, #7C3AED 100%)',
                },
                '&.Mui-disabled': {
                  background: 'linear-gradient(135deg, #A0C4FF 0%, #D4C5F9 100%)',
                  color: 'white',
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Reset Password'
              )}
            </Button>

            {/* Back to Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Link
                href="/login"
                underline="none"
                sx={{
                  fontSize: '0.9375rem',
                  color: 'text.secondary',
                  '& span': {
                    color: 'primary.main',
                    fontWeight: 600,
                    ml: 0.5,
                  },
                }}
              >
                Remember your password?
                <Box component="span">Sign in</Box>
              </Link>
            </Box>
          </>
        )}
      </Box>
    </AuthLayout>
  );
}
