'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
} from '@mui/material';
import { CheckCircle2, XCircle, Mail } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { authService } from '@/lib/services/auth-service';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Invalid or missing verification token.');
        setIsVerifying(false);
        return;
      }

      try {
        await authService.verifyEmail({ token });
        setIsSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Email verification failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  if (isVerifying) {
    return (
      <AuthLayout title="Verifying Email" subtitle="Please wait...">
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="body1" color="text.secondary">
            We&apos;re verifying your email address...
          </Typography>
        </Box>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Email Verified!" subtitle="Your account is now active">
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
            Your email has been successfully verified. You can now access all features of Qual Engine.
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
              mb: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #0052CC 0%, #7C3AED 100%)',
              },
            }}
          >
            Continue to Login
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.push('/dashboard')}
            sx={{
              height: 48,
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verification Failed" subtitle="We couldn't verify your email">
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            mb: 3,
          }}
        >
          <XCircle size={40} color="white" />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left', borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        <Alert severity="info" icon={<Mail size={20} />} sx={{ mb: 3, textAlign: 'left', borderRadius: '12px' }}>
          <Typography variant="body2">
            <strong>Possible reasons:</strong>
            <br />
            • The verification link has expired
            <br />
            • The link has already been used
            <br />• The link is invalid or corrupted
          </Typography>
        </Alert>

        <Button
          fullWidth
          variant="contained"
          onClick={() => router.push('/register')}
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
          Create New Account
        </Button>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => router.push('/login')}
          sx={{
            height: 48,
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          Back to Login
        </Button>
      </Box>
    </AuthLayout>
  );
}
