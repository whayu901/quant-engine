import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Clock, Globe, Shield, Users, ChevronRight,
  CheckCircle, ArrowRight, Play, Star, TrendingUp,
  MessageSquare, FileText, BarChart3
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TimeSavedBadge } from '../components/ui/TimeSavedBadge';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [transcriptCount, setTranscriptCount] = useState(1);
  const [timePerTranscript, setTimePerTranscript] = useState(8);
  const [calculatedSavings, setCalculatedSavings] = useState({ hours: 0, minutes: 0 });
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate time savings
  useEffect(() => {
    const manualTime = transcriptCount * timePerTranscript * 60; // in minutes
    const qualEngineTime = transcriptCount * 5; // 5 minutes per transcript
    const savedMinutes = manualTime - qualEngineTime;

    setCalculatedSavings({
      hours: Math.floor(savedMinutes / 60),
      minutes: savedMinutes % 60
    });
  }, [transcriptCount, timePerTranscript]);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 1500);
  };

  const features = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "SEA Language Support",
      description: "Perfect transcription for Taglish, Singlish, Bahasa + English mixing",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "5-Minute Analysis",
      description: "AI-powered themes and insights in minutes, not hours",
      color: "from-velocity-blue to-neural-purple"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "PDPA Compliant",
      description: "Data stays in Southeast Asia, full compliance guaranteed",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Work together in real-time, share insights instantly",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Research Director, Singapore",
      company: "Insights Asia",
      quote: "Qual Engine transformed our workflow. What used to take 2 days now takes 2 hours.",
      rating: 5,
      saved: { hours: 48, minutes: 0 }
    },
    {
      name: "Dina Wijaya",
      role: "Senior Researcher, Jakarta",
      company: "Market Pulse Indonesia",
      quote: "Finally, a tool that understands code-mixing! Our Bahasa-English FGDs are perfectly captured.",
      rating: 5,
      saved: { hours: 36, minutes: 30 }
    },
    {
      name: "Marco Santos",
      role: "Freelance Consultant, Manila",
      company: "Independent",
      quote: "The pricing is perfect for freelancers like me. I can now take on 3x more projects.",
      rating: 5,
      saved: { hours: 24, minutes: 0 }
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "$79",
      currency: "USD",
      period: "/month",
      description: "Perfect for small agencies",
      users: "3-5 users",
      features: [
        "100 minutes/month",
        "20 analyses",
        "5 GB storage",
        "Email support",
        "All SEA languages"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "$149",
      currency: "USD",
      period: "/month",
      description: "Most popular for agencies",
      users: "6-10 users",
      features: [
        "600 minutes/month",
        "200 analyses",
        "50 GB storage",
        "Priority support",
        "All SEA languages",
        "Custom branding",
        "API access"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$299+",
      currency: "USD",
      period: "/month",
      description: "For large organizations",
      users: "Unlimited users",
      features: [
        "3000+ minutes/month",
        "Unlimited analyses",
        "500 GB storage",
        "24/7 phone support",
        "All features",
        "SSO & compliance",
        "Custom integrations",
        "Training included"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheet to-paper">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <motion.div
                className="text-2xl font-bold bg-gradient-to-r from-velocity-blue to-neural-purple bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                ⚡ Qual Engine
              </motion.div>
              <span className="text-sm text-slate-500">SEA's #1 Research Platform</span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/features" className="text-slate-700 hover:text-velocity-blue transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-slate-700 hover:text-velocity-blue transition-colors">
                Pricing
              </Link>
              <Link to="/about" className="text-slate-700 hover:text-velocity-blue transition-colors">
                About
              </Link>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                size="sm"
              >
                Sign In
              </Button>
              <Button
                variant="speed"
                onClick={() => navigate('/register')}
                size="sm"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-velocity-blue/10 border border-velocity-blue/20 mb-6"
            >
              <TrendingUp className="w-4 h-4 text-velocity-blue" />
              <span className="text-sm font-semibold text-slate-700">
                Trusted by 500+ researchers across Southeast Asia
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="block text-slate-900">Turn </span>
              <span className="block bg-gradient-to-r from-velocity-blue to-neural-purple bg-clip-text text-transparent">
                8-hour analysis
              </span>
              <span className="block text-slate-900">into 5 minutes</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              AI-powered qualitative research platform built for Southeast Asia.
              Perfect transcription for Taglish, Singlish, and all SEA languages.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                variant="speed"
                size="lg"
                onClick={() => navigate('/register')}
                className="min-w-[200px]"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
                className="min-w-[200px]"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch 2-min Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Time Savings Calculator */}
      <section className="py-16 bg-white" id="calculator">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-4">
              Calculate Your Time Savings
            </h2>
            <p className="text-xl text-slate-600 text-center mb-12">
              See how much time you'll save with Qual Engine
            </p>

            <div className="bg-gradient-to-br from-velocity-blue/5 to-neural-purple/5 rounded-3xl p-8 border border-slate-200">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Number of transcripts per month
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={transcriptCount}
                      onChange={(e) => setTranscriptCount(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-600 mt-1">
                      <span>1</span>
                      <span className="font-bold text-velocity-blue text-lg">{transcriptCount}</span>
                      <span>100</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Hours spent per transcript (manual analysis)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="24"
                      value={timePerTranscript}
                      onChange={(e) => setTimePerTranscript(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-600 mt-1">
                      <span>1h</span>
                      <span className="font-bold text-neural-purple text-lg">{timePerTranscript}h</span>
                      <span>24h</span>
                    </div>
                  </div>

                  <Button
                    variant="speed"
                    size="lg"
                    onClick={handleCalculate}
                    className="w-full"
                  >
                    Calculate Savings
                    <Zap className="ml-2 w-5 h-5" />
                  </Button>
                </div>

                {/* Results */}
                <div className="flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isCalculating ? (
                      <motion.div
                        key="calculating"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center"
                      >
                        <div className="w-16 h-16 border-4 border-velocity-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-600">Calculating your savings...</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-center"
                      >
                        <p className="text-sm text-slate-600 mb-4">You'll save</p>
                        <TimeSavedBadge
                          hours={calculatedSavings.hours}
                          minutes={calculatedSavings.minutes}
                          variant="hero"
                          animated={true}
                        />
                        <p className="text-lg text-slate-700 mt-6">
                          That's{' '}
                          <span className="font-bold text-velocity-blue">
                            {Math.round((calculatedSavings.hours * 60 + calculatedSavings.minutes) / (transcriptCount * timePerTranscript * 60) * 100)}%
                          </span>
                          {' '}faster than manual analysis!
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                          Qual Engine: {transcriptCount * 5} minutes total
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-4">
              Built for Southeast Asian Researchers
            </h2>
            <p className="text-xl text-slate-600 text-center mb-12">
              Everything you need to analyze qualitative data, 10x faster
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 text-center mb-12">
              From upload to insights in 3 simple steps
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  icon: <FileText className="w-8 h-8" />,
                  title: "Upload Your Recording",
                  description: "Drop your audio/video file or import from WhatsApp. Supports all formats.",
                  time: "30 seconds"
                },
                {
                  step: 2,
                  icon: <MessageSquare className="w-8 h-8" />,
                  title: "AI Transcribes & Analyzes",
                  description: "Perfect transcription with code-mixing support. AI extracts themes instantly.",
                  time: "2-3 minutes"
                },
                {
                  step: 3,
                  icon: <BarChart3 className="w-8 h-8" />,
                  title: "Get Actionable Insights",
                  description: "View themes, sentiment, and evidence. Export client-ready reports.",
                  time: "1 minute"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-velocity-blue/10 to-neural-purple/10 rounded-full flex items-center justify-center">
                      <div className="text-velocity-blue">{item.icon}</div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-velocity-blue to-neural-purple rounded-full flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 mb-2">
                    {item.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm text-velocity-blue font-semibold">
                    <Clock className="w-4 h-4" />
                    {item.time}
                  </span>

                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 -right-4 text-slate-300">
                      <ChevronRight className="w-8 h-8" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-50 border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-semibold">
                  Total time: Under 5 minutes
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-4">
              Loved by Researchers Across SEA
            </h2>
            <p className="text-xl text-slate-600 text-center mb-12">
              Join 500+ researchers saving 30+ hours every week
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-slate-700 mb-6 italic">
                    "{testimonial.quote}"
                  </p>

                  <TimeSavedBadge
                    hours={testimonial.saved.hours}
                    minutes={testimonial.saved.minutes}
                    variant="default"
                    className="mb-4"
                  />

                  <div className="border-t pt-4">
                    <p className="font-semibold text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {testimonial.role}
                    </p>
                    <p className="text-sm text-slate-500">
                      {testimonial.company}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white" id="pricing">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 text-center mb-12">
              50% cheaper than Western competitors. Team-based pricing for SEA.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={cn(
                    "relative bg-white rounded-2xl p-8 border-2 transition-all hover:shadow-xl",
                    tier.popular
                      ? "border-velocity-blue shadow-lg scale-105"
                      : "border-slate-200"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-velocity-blue to-neural-purple text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {tier.description}
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-slate-900">
                        {tier.price}
                      </span>
                      <span className="text-slate-600">
                        {tier.period}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      {tier.users}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={tier.popular ? "speed" : "secondary"}
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="w-full"
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-slate-600">
                All plans include 14-day free trial • No credit card required • Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-velocity-blue to-neural-purple">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to save 30+ hours every week?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join 500+ researchers across Southeast Asia who've transformed their workflow
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-velocity-blue hover:bg-slate-100 min-w-[200px]"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-white hover:bg-white/10 min-w-[200px]"
              >
                Schedule Demo
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚡</span>
                <span className="font-bold text-xl">Qual Engine</span>
              </div>
              <p className="text-slate-400">
                AI-powered qualitative research platform built for Southeast Asia
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-white">Integrations</Link></li>
                <li><Link to="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/compliance" className="hover:text-white">PDPA Compliance</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© 2026 Qual Engine. All rights reserved. Built with ❤️ for SEA researchers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;