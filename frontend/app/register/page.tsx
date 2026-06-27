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
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  Typography,
} from '@mui/material';
import { Eye, EyeOff, User, Building2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import {
  retailRegistrationSchema,
  enterpriseRegistrationSchema,
  type RetailRegistrationFormData,
  type EnterpriseRegistrationFormData,
} from '@/lib/validation/auth-schemas';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser } from '@/store/slices/authSlice';

type AccountType = 'retail' | 'enterprise';

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Other',
];

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
];

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const [accountType, setAccountType] = useState<AccountType>('retail');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isRetail = accountType === 'retail';

  const {
    control: retailControl,
    handleSubmit: handleRetailSubmit,
    watch: watchRetail,
    formState: { errors: retailErrors, isSubmitting: isRetailSubmitting },
  } = useForm<RetailRegistrationFormData>({
    resolver: zodResolver(retailRegistrationSchema),
    defaultValues: {
      accountType: 'retail',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const {
    control: enterpriseControl,
    handleSubmit: handleEnterpriseSubmit,
    watch: watchEnterprise,
    formState: { errors: enterpriseErrors, isSubmitting: isEnterpriseSubmitting },
  } = useForm<EnterpriseRegistrationFormData>({
    resolver: zodResolver(enterpriseRegistrationSchema),
    defaultValues: {
      accountType: 'enterprise',
      organizationName: '',
      industry: '',
      companySize: '',
      adminName: '',
      adminEmail: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const passwordValue = isRetail ? watchRetail('password') : watchEnterprise('password');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onRetailSubmit = async (data: RetailRegistrationFormData) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      router.push('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const onEnterpriseSubmit = async (data: EnterpriseRegistrationFormData) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      router.push('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'microsoft' | 'github') => {
    // TODO: Implement social auth
    console.log('Social auth with:', provider);
  };

  const control = isRetail ? retailControl : enterpriseControl;
  const errors = isRetail ? retailErrors : enterpriseErrors;
  const isSubmitting = isRetail ? isRetailSubmitting : isEnterpriseSubmitting;
  const handleFormSubmit = isRetail ? handleRetailSubmit(onRetailSubmit) : handleEnterpriseSubmit(onEnterpriseSubmit);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Qual Engine and start your research journey"
    >
      <Box>
        {/* Account Type Toggle */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={accountType}
            exclusive
            onChange={(_, value) => value && setAccountType(value)}
            sx={{
              width: '100%',
              '& .MuiToggleButton-root': {
                flex: 1,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0052CC 0%, #7C3AED 100%)',
                  },
                },
              },
            }}
          >
            <ToggleButton value="retail">
              <User size={20} style={{ marginRight: 8 }} />
              Individual
            </ToggleButton>
            <ToggleButton value="enterprise">
              <Building2 size={20} style={{ marginRight: 8 }} />
              Organization
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box component="form" onSubmit={handleFormSubmit} noValidate>
          {/* Social Auth Buttons */}
          <SocialAuthButtons
            mode="signup"
            onGoogleAuth={() => handleSocialAuth('google')}
            onMicrosoftAuth={() => handleSocialAuth('microsoft')}
            onGithubAuth={() => handleSocialAuth('github')}
          />

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {/* Retail Form */}
          {isRetail && (
            <>
              <Controller
                name="name"
                control={retailControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    autoComplete="name"
                    error={!!retailErrors.name}
                    helperText={retailErrors.name?.message}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': { height: 48 },
                    }}
                  />
                )}
              />

              <Controller
                name="email"
                control={retailControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    error={!!retailErrors.email}
                    helperText={retailErrors.email?.message}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': { height: 48 },
                    }}
                  />
                )}
              />
            </>
          )}

          {/* Enterprise Form */}
          {!isRetail && (
            <>
              <Controller
                name="organizationName"
                control={enterpriseControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Organization Name"
                    error={!!enterpriseErrors.organizationName}
                    helperText={enterpriseErrors.organizationName?.message}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': { height: 48 },
                    }}
                  />
                )}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Controller
                  name="industry"
                  control={enterpriseControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Industry"
                      error={!!enterpriseErrors.industry}
                      helperText={enterpriseErrors.industry?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': { height: 48 },
                      }}
                    >
                      {INDUSTRIES.map((industry) => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="companySize"
                  control={enterpriseControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Company Size"
                      error={!!enterpriseErrors.companySize}
                      helperText={enterpriseErrors.companySize?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': { height: 48 },
                      }}
                    >
                      {COMPANY_SIZES.map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Box>

              <Controller
                name="adminName"
                control={enterpriseControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Admin Name"
                    autoComplete="name"
                    error={!!enterpriseErrors.adminName}
                    helperText={enterpriseErrors.adminName?.message}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': { height: 48 },
                    }}
                  />
                )}
              />

              <Controller
                name="adminEmail"
                control={enterpriseControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Admin Email"
                    type="email"
                    autoComplete="email"
                    error={!!enterpriseErrors.adminEmail}
                    helperText={enterpriseErrors.adminEmail?.message}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': { height: 48 },
                    }}
                  />
                )}
              />
            </>
          )}

          {/* Password Fields (Common) */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { height: 48 },
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

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { height: 48 },
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

          {/* Terms and Privacy */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Controller
              name="acceptTerms"
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
                  label={
                    <Typography variant="body2">
                      I accept the{' '}
                      <Link href="/terms" target="_blank" underline="hover">
                        Terms and Conditions
                      </Link>
                    </Typography>
                  }
                  sx={{ mb: 1 }}
                />
              )}
            />
            {errors.acceptTerms && (
              <Typography variant="caption" color="error" sx={{ display: 'block', ml: 4, mt: -0.5, mb: 1 }}>
                {errors.acceptTerms.message}
              </Typography>
            )}

            <Controller
              name="acceptPrivacy"
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
                  label={
                    <Typography variant="body2">
                      I accept the{' '}
                      <Link href="/privacy" target="_blank" underline="hover">
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />
              )}
            />
            {errors.acceptPrivacy && (
              <Typography variant="caption" color="error" sx={{ display: 'block', ml: 4, mt: 0.5 }}>
                {errors.acceptPrivacy.message}
              </Typography>
            )}
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
              'Create Account'
            )}
          </Button>

          {/* Sign In Link */}
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
              Already have an account?
              <Box component="span">Sign in</Box>
            </Link>
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
}
