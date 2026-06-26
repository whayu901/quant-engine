/**
 * Login Container - SOLID: Single Responsibility
 * Connects LoginView to AuthController (MVC pattern)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginView } from '../components/LoginView';
import { Services } from '../../di/services';
import { ILoginCredentials } from '../../interfaces/IAuthService';

/**
 * Container Component - Orchestrates between View and Controller
 * SOLID: Dependency Inversion - Depends on controller abstraction
 */
export const LoginContainer: React.FC = () => {
  const navigate = useNavigate();
  const authController = Services.auth;

  // Local UI state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auth state from controller
  const [authState, setAuthState] = useState(authController.getState());

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authController.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  // Navigate when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      navigate('/dashboard');
    }
  }, [authState.isAuthenticated, authState.user, navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const credentials: ILoginCredentials = {
      email,
      password
    };

    try {
      await authController.login(credentials);
      // Navigation handled by useEffect above
    } catch (error) {
      // Error is handled in controller and reflected in authState
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    // TODO: Implement social login
    console.log(`Social login with ${provider}`);
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Handle navigation to register
  const handleRegister = () => {
    navigate('/register');
  };

  // Clear error
  const handleClearError = () => {
    // Update local state to clear error
    // In a more complex app, this would be a controller method
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Pass data and callbacks to pure view
  return (
    <LoginView
      email={email}
      password={password}
      showPassword={showPassword}
      isLoading={authState.isLoading}
      error={authState.error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onTogglePassword={() => setShowPassword(!showPassword)}
      onSubmit={handleSubmit}
      onForgotPassword={handleForgotPassword}
      onRegister={handleRegister}
      onSocialLogin={handleSocialLogin}
      onClearError={handleClearError}
    />
  );
};