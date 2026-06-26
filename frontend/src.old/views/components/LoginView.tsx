/**
 * Login View Component - SOLID: Single Responsibility
 * Pure presentation component - No business logic
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Zap } from 'lucide-react';

export interface LoginViewProps {
  // Data
  email: string;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  error: string | null;

  // Events (Callbacks)
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onSocialLogin: (provider: 'google' | 'facebook') => void;
  onClearError: () => void;
}

/**
 * Pure View Component - No business logic, only presentation
 * SOLID: Interface Segregation - Props interface only contains what's needed
 */
export const LoginView: React.FC<LoginViewProps> = ({
  email,
  password,
  showPassword,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
  onRegister,
  onSocialLogin,
  onClearError
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-full mb-4"
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back
        </h1>
        <p className="text-slate-600">
          Sign in to save 30+ hours every week
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <ErrorAlert
            message={error}
            onClose={onClearError}
          />
        )}

        {/* Email Field */}
        <EmailField
          value={email}
          onChange={onEmailChange}
          disabled={isLoading}
        />

        {/* Password Field */}
        <PasswordField
          value={password}
          showPassword={showPassword}
          onChange={onPasswordChange}
          onToggleVisibility={onTogglePassword}
          disabled={isLoading}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <RememberMeCheckbox />
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-velocity-blue hover:text-velocity-blue-dark"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <SubmitButton
          isLoading={isLoading}
        />

        {/* Divider */}
        <Divider text="Or continue with" />

        {/* Social Login */}
        <SocialLoginButtons
          onGoogleLogin={() => onSocialLogin('google')}
          onFacebookLogin={() => onSocialLogin('facebook')}
          disabled={isLoading}
        />

        {/* Sign Up Link */}
        <p className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onRegister}
            className="font-medium text-velocity-blue hover:text-velocity-blue-dark"
            disabled={isLoading}
          >
            Start your free trial
          </button>
        </p>
      </form>
    </motion.div>
  );
};

/**
 * Sub-components - SOLID: Single Responsibility
 * Each component has one specific presentation concern
 */

const ErrorAlert: React.FC<{ message: string; onClose: () => void }> = ({
  message,
  onClose
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
  >
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm text-red-800">{message}</p>
    </div>
    <button
      type="button"
      onClick={onClose}
      className="text-red-600 hover:text-red-800"
      aria-label="Close error"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  </motion.div>
);

const EmailField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => (
  <div>
    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
      Email address
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Mail className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="email"
        id="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="email"
        placeholder="you@example.com"
        className="block w-full pl-10 pr-3 py-2.5 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-velocity-blue focus:border-transparent border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  </div>
);

const PasswordField: React.FC<{
  value: string;
  showPassword: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
  disabled?: boolean;
}> = ({ value, showPassword, onChange, onToggleVisibility, disabled }) => (
  <div>
    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
      Password
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Lock className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type={showPassword ? 'text' : 'password'}
        id="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete="current-password"
        placeholder="Enter your password"
        className="block w-full pl-10 pr-10 py-2.5 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-velocity-blue focus:border-transparent border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        disabled={disabled}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
        ) : (
          <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
        )}
      </button>
    </div>
  </div>
);

const RememberMeCheckbox: React.FC = () => (
  <label className="flex items-center">
    <input
      type="checkbox"
      className="h-4 w-4 text-velocity-blue border-slate-300 rounded focus:ring-velocity-blue"
    />
    <span className="ml-2 text-sm text-slate-700">Remember me</span>
  </label>
);

const SubmitButton: React.FC<{ isLoading: boolean }> = ({ isLoading }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-xl text-white bg-gradient-to-r from-velocity-blue to-neural-purple hover:from-velocity-blue-dark hover:to-neural-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-velocity-blue disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
  >
    {isLoading ? (
      <>
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        Signing in...
      </>
    ) : (
      'Sign in'
    )}
  </button>
);

const Divider: React.FC<{ text: string }> = ({ text }) => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-slate-300" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-slate-500">{text}</span>
    </div>
  </div>
);

const SocialLoginButtons: React.FC<{
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
  disabled?: boolean;
}> = ({ onGoogleLogin, onFacebookLogin, disabled }) => (
  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={onGoogleLogin}
      disabled={disabled}
      className="flex justify-center items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <GoogleIcon />
      <span className="text-sm font-medium text-slate-700">Google</span>
    </button>

    <button
      type="button"
      onClick={onFacebookLogin}
      disabled={disabled}
      className="flex justify-center items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FacebookIcon />
      <span className="text-sm font-medium text-slate-700">Facebook</span>
    </button>
  </div>
);

const GoogleIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);