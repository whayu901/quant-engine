/**
 * Landing Page Component - MVC/SOLID
 * Public-facing marketing page for Qual Engine
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-lg" />
              <span className="text-xl font-bold text-slate-900">Qual Engine</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-gradient-to-r from-velocity-blue to-neural-purple text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center px-3 py-1 bg-velocity-blue/10 text-velocity-blue rounded-full text-sm font-medium mb-6">
              🚀 Beat Coloop.ai to Market - Launching June 2026
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Transform 8 Hours of Analysis
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-velocity-blue to-neural-purple">
                Into 5 Minutes of Insights
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              AI-powered qualitative research platform built for Southeast Asian markets.
              Transcribe, analyze, and extract insights from interviews in 7 SEA languages.
            </p>

            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/register"
                className="px-8 py-3 bg-gradient-to-r from-velocity-blue to-neural-purple text-white rounded-lg font-medium hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start Free Trial
              </Link>
              <a
                href="#demo"
                className="px-8 py-3 bg-white text-slate-900 rounded-lg font-medium border border-slate-200 hover:border-slate-300 transition-colors"
              >
                Watch Demo
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
              <div>
                <div className="text-3xl font-bold text-slate-900">94%</div>
                <div className="text-sm text-slate-600">Time Saved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">7</div>
                <div className="text-sm text-slate-600">SEA Languages</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">5min</div>
                <div className="text-sm text-slate-600">To Insights</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Built for Southeast Asian Research Teams
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to conduct qualitative research at lightning speed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-lg mb-4 flex items-center justify-center text-white text-2xl">
                🎙️
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Smart Transcription
              </h3>
              <p className="text-slate-600">
                Upload audio/video and get accurate transcripts in Bahasa Indonesia, English, Thai, Vietnamese, Filipino, Malay, and Khmer.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-lg mb-4 flex items-center justify-center text-white text-2xl">
                🤖
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                AI-Powered Analysis
              </h3>
              <p className="text-slate-600">
                Extract themes, sentiments, and insights automatically. Our AI understands cultural nuances across SEA markets.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-velocity-blue to-neural-purple rounded-lg mb-4 flex items-center justify-center text-white text-2xl">
                📊
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Instant Reports
              </h3>
              <p className="text-slate-600">
                Generate professional reports with one click. Export to PowerPoint, PDF, or share insights directly with stakeholders.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              From Interview to Insight in 3 Steps
            </h2>
            <p className="text-xl text-slate-600">
              Our streamlined process saves you 94% of your analysis time
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-velocity-blue shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Upload</h3>
              <p className="text-slate-600">
                Upload your interview recordings or paste transcripts directly
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-velocity-blue shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analyze</h3>
              <p className="text-slate-600">
                AI processes your data and extracts key themes and insights
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-velocity-blue shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Report</h3>
              <p className="text-slate-600">
                Get professional reports ready for presentation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-velocity-blue to-neural-purple">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Research Process?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join leading research teams across Southeast Asia who save 94% of their analysis time
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-velocity-blue rounded-lg font-medium hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-white/10 text-white rounded-lg font-medium border border-white/30 hover:bg-white/20 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-velocity-blue to-neural-purple rounded" />
              <span className="text-white font-medium">Qual Engine</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2026 Qual Engine. Built for Southeast Asia.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};