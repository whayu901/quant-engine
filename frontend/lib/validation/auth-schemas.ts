import { z } from 'zod';

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Email validation schema
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Retail registration schema
export const retailRegistrationSchema = z.object({
  accountType: z.literal('retail'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: 'You must accept the privacy policy',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RetailRegistrationFormData = z.infer<typeof retailRegistrationSchema>;

// Enterprise registration schema
export const enterpriseRegistrationSchema = z.object({
  accountType: z.literal('enterprise'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.string().min(1, 'Company size is required'),
  adminName: z.string().min(2, 'Admin name must be at least 2 characters'),
  adminEmail: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  acceptPrivacy: z.boolean().refine((val) => val === true, {
    message: 'You must accept the privacy policy',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type EnterpriseRegistrationFormData = z.infer<typeof enterpriseRegistrationSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Helper function to validate password strength
export const validatePasswordStrength = (password: string) => {
  const strength = {
    score: 0,
    feedback: [] as string[],
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };

  // Calculate score
  if (strength.hasMinLength) strength.score++;
  if (strength.hasUpperCase) strength.score++;
  if (strength.hasLowerCase) strength.score++;
  if (strength.hasNumber) strength.score++;
  if (strength.hasSpecialChar) strength.score++;

  // Generate feedback
  if (!strength.hasMinLength) strength.feedback.push('At least 8 characters');
  if (!strength.hasUpperCase) strength.feedback.push('One uppercase letter');
  if (!strength.hasLowerCase) strength.feedback.push('One lowercase letter');
  if (!strength.hasNumber) strength.feedback.push('One number');
  if (!strength.hasSpecialChar) strength.feedback.push('One special character');

  return strength;
};

// Enterprise email domains for SSO detection
export const enterpriseDomains = [
  'ibm.com',
  'microsoft.com',
  'oracle.com',
  'sap.com',
  'salesforce.com',
  'amazon.com',
  'google.com',
  'apple.com',
  // Add more enterprise domains as needed
];

export const detectEnterpriseEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? enterpriseDomains.includes(domain) : false;
};
