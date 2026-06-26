/**
 * Main App Component - SOLID: Dependency Inversion
 * Initializes DI container and routes
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeApp } from './di/setup';
import { useAuth } from './hooks/useController';

// Pages - MVC/SOLID compliant
import { LandingPage } from './views/pages/LandingPage';
import { LoginPage } from './views/pages/LoginPage';
import { RegisterPage } from './views/pages/RegisterPage';
import { DashboardPage } from './views/pages/DashboardPage';
import { ProjectsPage } from './views/pages/ProjectsPage';
import { ProjectDetailPage } from './views/pages/ProjectDetailPage';
import { AdminPage } from './views/pages/AdminPage';
import { SettingsPage } from './views/pages/SettingsPage';
import { AnalysisPage } from './views/pages/AnalysisPage';
import { ChatPage } from './views/pages/ChatPage';
import { ReportsPage } from './views/pages/ReportsPage';
import { BillingPage } from './views/pages/BillingPage';

// Initialize Dependency Injection on app start
initializeApp();

/**
 * Protected Route Component
 * SOLID: Single Responsibility - Only handles auth check
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Public Route Component
 * Redirects to dashboard if already authenticated
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Loading Screen Component
 */
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-full mb-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-slate-600">Loading...</p>
    </div>
  </div>
);

/**
 * Main App Component
 * SOLID: Open/Closed - New routes can be added without modifying existing code
 */
export const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <BillingPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
                <p className="text-slate-600 mb-8">Page not found</p>
                <a
                  href="/dashboard"
                  className="text-velocity-blue hover:text-velocity-blue-dark font-medium"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;