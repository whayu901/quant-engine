'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import { loginSchema, type LoginFormData, detectEnterpriseEmail } from '@/lib/validation/auth-schemas';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/slices/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showSSOMessage, setShowSSOMessage] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const emailValue = watch('email');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Check for enterprise email domain
    if (emailValue && detectEnterpriseEmail(emailValue)) {
      setShowSSOMessage(true);
    } else {
      setShowSSOMessage(false);
    }
  }, [emailValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by Redux state
      console.error('Login error:', err);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'microsoft' | 'github') => {
    // TODO: Implement social auth
    console.log('Social auth with:', provider);
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue to your Qual Engine dashboard"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Social Auth Buttons */}
        <SocialAuthButtons
          mode="login"
          onGoogleAuth={() => handleSocialAuth('google')}
          onMicrosoftAuth={() => handleSocialAuth('microsoft')}
          onGithubAuth={() => handleSocialAuth('github')}
        />

        {/* SSO Message */}
        {showSSOMessage && (
          <Alert
            severity="info"
            icon={<AlertCircle size={20} />}
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            Your organization may use Single Sign-On. Contact your admin if you need help signing in.
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

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
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  height: 48,
                },
              }}
            />
          )}
        />

        {/* Password Field */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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

        {/* Remember Me & Forgot Password */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value}
                    size="small"
                  />
                }
                label="Remember me"
              />
            )}
          />
          <Link
            href="/forgot-password"
            underline="hover"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            Forgot password?
          </Link>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting || isLoading}
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
          {isSubmitting || isLoading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Sign In'
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
