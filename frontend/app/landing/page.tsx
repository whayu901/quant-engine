'use client';

import { Box } from '@mui/material';
import Navigation from '@/components/landing/Navigation';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <Navigation />

      {/* Hero Section */}
      <Box component="section" id="hero">
        <HeroSection />
      </Box>

      {/* Features Section */}
      <Box component="section" id="features">
        <FeaturesSection />
      </Box>

      {/* How It Works Section */}
      <Box component="section" id="how-it-works">
        <HowItWorksSection />
      </Box>

      {/* Testimonials Section */}
      <Box component="section" id="testimonials">
        <TestimonialsSection />
      </Box>

      {/* Pricing Section */}
      <Box component="section" id="pricing">
        <PricingSection />
      </Box>

      {/* FAQ Section */}
      <Box component="section" id="faq">
        <FAQSection />
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
