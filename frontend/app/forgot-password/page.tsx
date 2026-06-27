'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validation/auth-schemas';
import { authService } from '@/lib/services/auth-service';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const emailValue = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      await authService.forgotPassword(data);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout title="Check Your Email" subtitle="Password reset instructions sent">
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

          <Typography variant="body1" sx={{ mb: 1, color: 'text.primary' }}>
            We&apos;ve sent password reset instructions to:
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
            {emailValue}
          </Typography>

          <Alert severity="info" sx={{ mb: 3, textAlign: 'left', borderRadius: '12px' }}>
            <Typography variant="body2">
              <strong>Didn&apos;t receive the email?</strong>
              <br />
              • Check your spam or junk folder
              <br />
              • Make sure the email address is correct
              <br />• Wait a few minutes and try again
            </Typography>
          </Alert>

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
              mb: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #0052CC 0%, #7C3AED 100%)',
              },
            }}
          >
            Back to Login
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => setIsSuccess(false)}
            sx={{
              height: 48,
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Try Different Email
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Back to Login Link */}
        <Box sx={{ mb: 3 }}>
          <Link
            href="/login"
            underline="none"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* Info Message */}
        <Alert severity="info" icon={<Mail size={20} />} sx={{ mb: 3, borderRadius: '12px' }}>
          Enter the email address associated with your account and we&apos;ll send you a link to reset
          your password.
        </Alert>

        {/* Email Field */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Email Address"
              type="email"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  height: 48,
                },
              }}
            />
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{
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
            'Send Reset Link'
          )}
        </Button>

        {/* Sign Up Link */}
        <Box sx={{ textAlign: 'center' }}>
          <Link
            href="/register"
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
            Don&apos;t have an account?
            <Box component="span">Sign up</Box>
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
}
