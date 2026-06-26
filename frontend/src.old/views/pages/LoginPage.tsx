/**
 * Login Page - SOLID: Single Responsibility
 * Page layout component
 */

import React from 'react';
import { LoginContainer } from '../containers/LoginContainer';

/**
 * Page Component - Handles layout only
 * SOLID: Single Responsibility - Only responsible for page structure
 */
export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <LoginContainer />
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center">
        <p className="text-xs text-slate-500">
          © 2026 Qual Engine. All rights reserved.
        </p>
        <div className="mt-2 flex justify-center space-x-4 text-xs">
          <a href="/privacy" className="text-slate-500 hover:text-slate-700">
            Privacy Policy
          </a>
          <span className="text-slate-300">|</span>
          <a href="/terms" className="text-slate-500 hover:text-slate-700">
            Terms of Service
          </a>
          <span className="text-slate-300">|</span>
          <a href="/support" className="text-slate-500 hover:text-slate-700">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
};