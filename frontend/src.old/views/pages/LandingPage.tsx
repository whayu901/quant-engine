/**
 * Landing Page - AI-Themed Modern UI with Advanced Animations
 * Phase 1: Auth & Landing - Enhanced Version
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView, useMotionValue, useAnimation } from 'framer-motion';
import {
  Sparkles, Zap, Globe, Users, BarChart3, Shield,
  Clock, TrendingUp, CheckCircle, ArrowRight, Star,
  Play, ChevronRight, Menu, X, MessageSquare,
  FileText, Mic, Brain, Download, Languages,
  Cpu, Waves, Activity, Radar, Network
} from 'lucide-react';

// Neural Network Animation Component
const NeuralNetwork: React.FC<{ className?: string }> = React.memo(({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
    }

    const nodes: Node[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    let animationFrame: number;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Update nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.offsetWidth) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.offsetHeight) node.vy *= -1;
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.lineWidth = 1;

      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach((otherNode) => {
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.globalAlpha = 1 - distance / 120;
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      ctx.globalAlpha = 1;
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#8b5cf6';
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={`${className}`} style={{ width: '100%', height: '100%' }} />;
});

NeuralNetwork.displayName = 'NeuralNetwork';

// Particle Field Component
const ParticleField: React.FC = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }

    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    let animationFrame: number;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-40" />;
});

ParticleField.displayName = 'ParticleField';

// Animated Counter Component
const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = React.memo(({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return <div ref={ref}>{count}{suffix}</div>;
});

AnimatedCounter.displayName = 'AnimatedCounter';

// Floating Orb Component
const FloatingOrb: React.FC<{ delay?: number; color?: string; size?: string }> = React.memo(({
  delay = 0,
  color = 'bg-primary-300/20',
  size = 'w-72 h-72'
}) => (
  <motion.div
    className={`absolute ${size} ${color} rounded-full blur-3xl`}
    animate={{
      y: [0, 30, 0],
      x: [0, 20, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay: delay,
      ease: 'easeInOut',
    }}
  />
));

FloatingOrb.displayName = 'FloatingOrb';

// Glowing AI Brain Visualization
const AIBrainVisualization: React.FC = React.memo(() => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 border-2 border-primary-400/30 rounded-full"
            style={{
              width: `${(i + 1) * 80}px`,
              height: `${(i + 1) * 80}px`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.div>
      <motion.div
        className="relative z-10 w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center"
        animate={{
          boxShadow: [
            '0 0 20px rgba(139, 92, 246, 0.5)',
            '0 0 40px rgba(139, 92, 246, 0.8)',
            '0 0 20px rgba(139, 92, 246, 0.5)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <Brain className="w-10 h-10 text-white" />
      </motion.div>
    </div>
  );
});

AIBrainVisualization.displayName = 'AIBrainVisualization';

// Wave Animation Component
const WaveAnimation: React.FC = React.memo(() => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden opacity-20">
      <svg
        className="absolute bottom-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,64 C48,96 144,96 240,64 C336,32 432,32 528,64 C624,96 720,96 816,64 C912,32 1008,32 1104,64 L1104,120 L0,120 Z"
          fill="url(#gradient)"
          animate={{
            d: [
              "M0,64 C48,96 144,96 240,64 C336,32 432,32 528,64 C624,96 720,96 816,64 C912,32 1008,32 1104,64 L1104,120 L0,120 Z",
              "M0,32 C48,64 144,64 240,32 C336,0 432,0 528,32 C624,64 720,64 816,32 C912,0 1008,0 1104,32 L1104,120 L0,120 Z",
              "M0,64 C48,96 144,96 240,64 C336,32 432,32 528,64 C624,96 720,96 816,64 C912,32 1008,32 1104,64 L1104,120 L0,120 Z",
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
});

WaveAnimation.displayName = 'WaveAnimation';

// Main Landing Page Component
export const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Smooth scroll animations
  const smoothY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Head of Research, TechCorp Indonesia",
      content: "Qual Engine transformed our research process. What used to take weeks now takes hours. The AI insights are incredibly accurate for SEA markets.",
      rating: 5,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "Michael Tan",
      role: "UX Director, E-Commerce Malaysia",
      content: "The multi-language support is a game-changer. We can analyze feedback from across SEA without translation delays.",
      rating: 5,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
    },
    {
      name: "Priya Sharma",
      role: "Product Manager, FinTech Singapore",
      content: "94% time savings is real. Our team can now focus on strategy instead of manual analysis. ROI was immediate.",
      rating: 5,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-x-hidden relative">
      {/* Particle Background */}
      <ParticleField />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb delay={0} color="bg-primary-500/10" size="w-96 h-96" />
        <FloatingOrb delay={2} color="bg-purple-500/10" size="w-80 h-80" />
        <FloatingOrb delay={4} color="bg-pink-500/10" size="w-72 h-72" />

        {/* Gradient Mesh */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-primary-600/20 via-purple-600/20 to-pink-600/20 blur-3xl transform rotate-12" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-3xl transform -rotate-12" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl blur-lg"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Qual Engine
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white font-medium transition-colors relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white font-medium transition-colors relative group">
                How it Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#ai-capabilities" className="text-gray-300 hover:text-white font-medium transition-colors relative group">
                AI Capabilities
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-white font-medium transition-colors relative group">
                Testimonials
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-600 group-hover:w-full transition-all duration-300" />
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gradient-to-r from-primary-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl">
                  Start Free Trial
                </div>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-6 py-4 space-y-3">
                <a href="#features" className="block py-2 text-gray-300 hover:text-white">Features</a>
                <a href="#how-it-works" className="block py-2 text-gray-300 hover:text-white">How it Works</a>
                <a href="#ai-capabilities" className="block py-2 text-gray-300 hover:text-white">AI Capabilities</a>
                <a href="#testimonials" className="block py-2 text-gray-300 hover:text-white">Testimonials</a>
                <Link to="/login" className="block py-2 text-gray-300 hover:text-white">Sign In</Link>
                <Link to="/register" className="block text-center bg-gradient-to-r from-primary-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl">
                  Start Free Trial
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-20 pb-32 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
              }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/30 text-primary-300 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                <span className="relative">
                  Launching June 2026 • Beat Coloop.ai
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 opacity-0"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </span>
              </motion.div>

              {/* Heading */}
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="block">Transform</span>
                <motion.span
                  className="block bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  8 Hours
                </motion.span>
                <span className="block">of Analysis Into</span>
                <motion.span
                  className="block bg-gradient-to-r from-pink-400 via-purple-400 to-primary-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: 0.5,
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  5 Minutes
                </motion.span>
              </h1>

              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                AI-powered qualitative research platform built specifically for Southeast Asian markets.
                <span className="text-primary-400 font-semibold"> Transcribe, analyze, and extract insights</span> in 7 languages instantly.
              </p>

              {/* Stats with animated counters */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 backdrop-blur-sm"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                    <AnimatedCounter end={94} suffix="%" />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Time Saved</div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                    whileHover={{ opacity: 1 }}
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 backdrop-blur-sm"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    <AnimatedCounter end={7} />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Languages</div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                    whileHover={{ opacity: 1 }}
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-white/10 backdrop-blur-sm"
                >
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                    <AnimatedCounter end={5} suffix="min" />
                  </div>
                  <div className="text-sm text-gray-400 mt-1">To Insights</div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                    whileHover={{ opacity: 1 }}
                  />
                </motion.div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="relative group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl blur-lg"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  <motion.div
                    className="relative bg-gradient-to-r from-primary-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.div>
                </Link>

                <motion.button
                  className="relative bg-gray-800/50 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl border border-white/10 flex items-center hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5 mr-2" /> Watch Demo
                </motion.button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.img
                      key={i}
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-gray-800"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 + 1 }}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                    />
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 + 1.5 }}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Trusted by 500+ researchers</p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - AI Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
              style={{
                transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`,
              }}
            >
              <div className="relative">
                {/* Main Card */}
                <motion.div
                  className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Neural Network Background */}
                  <div className="absolute inset-0 opacity-30">
                    <NeuralNetwork />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 space-y-6">
                    {/* Processing Animation */}
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(139, 92, 246, 0.5)',
                            '0 0 40px rgba(139, 92, 246, 0.8)',
                            '0 0 20px rgba(139, 92, 246, 0.5)',
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <Mic className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"
                            style={{ backgroundSize: '200% 100%' }}
                          />
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Processing interview_jakarta_001.mp3</p>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                        <div className="text-2xl font-bold text-white">
                          <AnimatedCounter end={12} />
                        </div>
                        <div className="text-sm text-gray-400">Themes Found</div>
                      </motion.div>

                      <motion.div
                        className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <MessageSquare className="w-6 h-6 text-blue-400 mb-2" />
                        <div className="text-2xl font-bold text-white">
                          <AnimatedCounter end={47} />
                        </div>
                        <div className="text-sm text-gray-400">Key Insights</div>
                      </motion.div>
                    </div>

                    {/* Insight Cards */}
                    <div className="space-y-3">
                      {[
                        { text: "Price sensitivity highest in tier-2 cities", color: "primary", delay: 0.9 },
                        { text: "78% prefer sachet packaging", color: "purple", delay: 1.1 },
                        { text: "Morning consumption peaks at 7-9 AM", color: "pink", delay: 1.3 },
                      ].map((insight, index) => (
                        <motion.div
                          key={index}
                          className={`p-3 bg-gray-800/50 rounded-lg border border-${insight.color}-500/20 backdrop-blur-sm`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: insight.delay }}
                          whileHover={{ scale: 1.02, x: 5 }}
                        >
                          <p className="text-sm text-gray-300">
                            <span className={`font-semibold text-${insight.color}-400`}>
                              {index === 0 ? 'Theme:' : index === 1 ? 'Insight:' : 'Pattern:'}
                            </span>{' '}
                            {insight.text}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Live Demo Badge */}
                  <motion.div
                    className="absolute -top-4 -right-4 px-3 py-1 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full text-sm font-semibold shadow-lg"
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    Live Demo
                  </motion.div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-10 -left-10 w-20 h-20 bg-primary-500/20 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />
                <motion.div
                  className="absolute -bottom-10 -right-10 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: 0.5,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave Animation */}
        <WaveAnimation />
      </motion.section>

      {/* AI Capabilities Section */}
      <section id="ai-capabilities" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 border border-primary-500/30 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Brain className="w-4 h-4 mr-2 text-primary-400" />
              <span className="text-primary-300">Powered by Advanced AI</span>
            </motion.div>

            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              How Our AI Works
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              State-of-the-art machine learning models trained specifically for Southeast Asian languages and contexts
            </p>
          </motion.div>

          {/* AI Processing Pipeline */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20 hidden lg:block" />

            <div className="grid lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Mic,
                  title: "Speech Recognition",
                  description: "Advanced ASR models for 7 SEA languages with dialect support",
                  color: "from-primary-500 to-purple-600",
                  delay: 0.1,
                },
                {
                  icon: Languages,
                  title: "NLP Processing",
                  description: "Context-aware language understanding with code-switching detection",
                  color: "from-purple-500 to-pink-600",
                  delay: 0.2,
                },
                {
                  icon: Brain,
                  title: "Insight Extraction",
                  description: "Deep learning models identify themes, patterns, and sentiment",
                  color: "from-pink-500 to-orange-600",
                  delay: 0.3,
                },
                {
                  icon: FileText,
                  title: "Report Generation",
                  description: "AI-powered summarization creates actionable insights instantly",
                  color: "from-orange-500 to-red-600",
                  delay: 0.4,
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: step.delay }}
                  className="relative"
                >
                  <motion.div
                    className="relative z-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(139, 92, 246, 0.3)',
                          '0 0 40px rgba(139, 92, 246, 0.6)',
                          '0 0 20px rgba(139, 92, 246, 0.3)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: step.delay,
                      }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-3 text-center">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-center text-sm">
                      {step.description}
                    </p>

                    {/* Animated indicator */}
                    <motion.div
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: step.delay,
                      }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live AI Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-20 relative"
          >
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-12 rounded-2xl border border-white/10 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <NeuralNetwork />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-8">
                  <motion.div
                    className="w-32 h-32 relative"
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <AIBrainVisualization />
                  </motion.div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Real-Time AI Processing
                  </h3>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Our neural network processes your research data in real-time, continuously learning
                    and improving from every interaction to deliver increasingly accurate insights.
                  </p>
                </div>

                {/* Processing Stats */}
                <div className="grid grid-cols-4 gap-4 mt-12">
                  {[
                    { label: "Words/sec", value: 150, icon: Activity },
                    { label: "Accuracy", value: 98, suffix: "%", icon: CheckCircle },
                    { label: "Languages", value: 7, icon: Languages },
                    { label: "Models", value: 12, icon: Cpu },
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <stat.icon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-white">
                        <AnimatedCounter end={stat.value} suffix={stat.suffix || ''} />
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Built for Southeast Asian Research Teams
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to conduct qualitative research at lightning speed,
              with deep understanding of regional nuances
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 - Large */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 md:row-span-2 relative group"
            >
              <motion.div
                className="h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 opacity-10">
                  <NeuralNetwork />
                </div>

                <div className="relative z-10">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Languages className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-3xl font-bold text-white mb-4">
                    7 SEA Languages
                  </h3>
                  <p className="text-gray-400 mb-6 text-lg">
                    Native support for Bahasa Indonesia, English, Thai, Vietnamese, Filipino, Malay, and Khmer.
                    No translation needed.
                  </p>

                  <ul className="space-y-3">
                    {[
                      "Dialect recognition across regions",
                      "Code-switching support for mixed languages",
                      "Cultural context awareness built-in",
                    ].map((feature, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center text-gray-300"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Animated language badges */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    {['ID', 'EN', 'TH', 'VI', 'PH', 'MY', 'KH'].map((lang, index) => (
                      <motion.div
                        key={lang}
                        className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm font-semibold text-primary-300"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {lang}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ opacity: 1 }}
                />
              </motion.div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <motion.div
                className="h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(168, 85, 247, 0.3)',
                      '0 0 40px rgba(168, 85, 247, 0.6)',
                      '0 0 20px rgba(168, 85, 247, 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Brain className="w-7 h-7 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-3">
                  AI-Powered Analysis
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Advanced AI trained on SEA market research data
                </p>

                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Theme extraction
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Sentiment analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Pattern recognition
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              <motion.div
                className="h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(34, 197, 94, 0.3)',
                      '0 0 40px rgba(34, 197, 94, 0.6)',
                      '0 0 20px rgba(34, 197, 94, 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5,
                  }}
                >
                  <FileText className="w-7 h-7 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-3">
                  Instant Reports
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Professional reports in seconds
                </p>

                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Custom templates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Data visualization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    Executive summary
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Additional Features */}
            {[
              {
                icon: Clock,
                title: "Real-Time Processing",
                description: "Get results as your interview happens",
                color: "from-blue-500 to-cyan-600",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-level encryption and compliance",
                color: "from-indigo-500 to-blue-600",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Deep insights with visual dashboards",
                color: "from-pink-500 to-rose-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative group"
              >
                <motion.div
                  className="h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              From Interview to Insight in 3 Steps
            </h2>
            <p className="text-xl text-gray-400">
              Our streamlined process saves you 94% of your analysis time
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line with animated gradient */}
            <div className="absolute top-1/2 left-0 right-0 h-1 hidden lg:block overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ backgroundSize: '200% 200%' }}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
              {[
                {
                  step: 1,
                  title: "Upload",
                  description: "Drop your audio, video, or text files. Support for all major formats.",
                  color: "from-primary-500 to-purple-600",
                  icon: Download,
                },
                {
                  step: 2,
                  title: "Analyze",
                  description: "AI processes your data instantly, extracting themes and insights.",
                  color: "from-purple-500 to-pink-600",
                  icon: Brain,
                },
                {
                  step: 3,
                  title: "Report",
                  description: "Get professional reports ready for presentation in seconds.",
                  color: "from-pink-500 to-orange-600",
                  icon: FileText,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <motion.div
                    className="relative z-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10"
                    whileHover={{ scale: 1.05, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 relative`}
                      animate={{
                        boxShadow: [
                          '0 0 30px rgba(139, 92, 246, 0.4)',
                          '0 0 60px rgba(139, 92, 246, 0.7)',
                          '0 0 30px rgba(139, 92, 246, 0.4)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                    >
                      <span className="text-3xl font-bold text-white">{item.step}</span>

                      {/* Animated ring */}
                      <motion.div
                        className="absolute inset-0 border-2 border-white/30 rounded-2xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3,
                        }}
                      />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-center text-white mb-3">{item.title}</h3>
                    <p className="text-center text-gray-400">
                      {item.description}
                    </p>

                    {/* Icon badge */}
                    <motion.div
                      className="absolute top-4 right-4 w-10 h-10 bg-gray-800/80 rounded-lg flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon className="w-5 h-5 text-primary-400" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-white mb-6">
              Loved by Research Teams Across SEA
            </h2>
            <p className="text-xl text-gray-400">
              Join 500+ researchers who've transformed their workflow
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 md:p-12 rounded-2xl border border-white/10"
              >
                <div className="flex items-start space-x-4">
                  <motion.img
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    className="w-16 h-16 rounded-full border-2 border-primary-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-lg text-gray-300 mb-6 italic leading-relaxed">
                      "{testimonials[activeTestimonial].content}"
                    </p>
                    <div>
                      <p className="font-semibold text-white text-lg">
                        {testimonials[activeTestimonial].name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {testimonials[activeTestimonial].role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Navigation */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeTestimonial
                      ? 'w-8 bg-gradient-to-r from-primary-500 to-purple-600'
                      : 'w-2 bg-gray-600 hover:bg-gray-500'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-purple-600/20 to-pink-600/20" />

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 pattern-dots" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-block mb-8"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Sparkles className="w-16 h-16 text-primary-400 mx-auto" />
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your Research?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Join leading research teams saving 94% of their analysis time
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="relative group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl blur-xl"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <motion.div
                  className="relative bg-gradient-to-r from-primary-500 to-purple-600 text-white font-bold px-8 py-4 rounded-xl shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Free Trial
                </motion.div>
              </Link>

              <motion.button
                className="bg-gray-800/80 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-xl border-2 border-white/20 hover:bg-gray-700/80 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Demo
              </motion.button>
            </div>

            <p className="text-sm text-gray-400 mt-8">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-950 border-t border-white/10 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Qual Engine</span>
              </div>
              <p className="text-sm text-gray-500">
                AI-powered qualitative research for Southeast Asian markets.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm">
            <p className="text-gray-500">
              2026 Qual Engine. Built with love for Southeast Asia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
