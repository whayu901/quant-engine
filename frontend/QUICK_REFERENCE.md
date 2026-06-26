# Quick Reference - Visual Effects

## Import Statements

```tsx
// Effect Components
import {
  MatrixRain,
  DataStream,
  ElectricSparks,
  ScanningLine,
  AIEye,
  HolographicText,
  MagneticButton
} from '@/components/effects';

// Enhanced Landing Components
import {
  BackgroundEffects,
  EnhancedHeroTitle,
  EnhancedCTAButton,
  DecorativeAIEye,
  EnhancedFeatureCard,
  BinaryBackgroundSection,
  QuantumParticles,
  MLTrainingViz,
  DiagonalSection,
} from '@/components/landing/EnhancedEffects';

// Icons
import { Brain, Sparkles, Zap } from 'lucide-react';
```

## Quick Code Snippets

### Background Layer
```tsx
<BackgroundEffects variant="full" />
```

### Holographic Title
```tsx
<HolographicText
  text="Your Title Here"
  enableRGBSplit={true}
  className="text-6xl font-bold"
/>
```

### Magnetic Button
```tsx
<MagneticButton
  strength={20}
  className="bg-gradient-to-r from-ai-cyan to-ai-purple px-8 py-4 rounded-xl"
>
  Click Me
</MagneticButton>
```

### Enhanced Feature Card
```tsx
<EnhancedFeatureCard
  icon={Brain}
  title="AI Analysis"
  description="Advanced machine learning"
  gradient="from-ai-cyan to-ai-purple"
/>
```

### AI Eye
```tsx
<AIEye size={120} />
```

### Binary Background
```tsx
<BinaryBackgroundSection>
  <p>Your content with binary background</p>
</BinaryBackgroundSection>
```

### Scanning Line
```tsx
<div className="relative">
  <ScanningLine color="#00FFFF" />
  {/* Content */}
</div>
```

### Diagonal Section
```tsx
<DiagonalSection variant="both" className="bg-gray-900 py-32">
  {/* Content */}
</DiagonalSection>
```

## CSS Classes

### Neon Colors
```tsx
className="neon-cyan"      // Cyan glow
className="neon-purple"    // Purple glow
className="neon-pink"      // Pink glow
className="neon-green"     // Green glow
```

### Backgrounds
```tsx
className="aurora-bg"         // Aurora gradient
className="circuit-pattern"   // Circuit board
className="binary-bg"         // Binary code
```

### Animations
```tsx
className="holographic-text"  // Holographic shimmer
className="tilt-card"         // 3D tilt on hover
className="morph-icon"        // Morphing animation
className="float-slow"        // Floating animation
className="animate-glow-pulse" // Pulsing glow
className="scan-line"         // Scanning line
```

### Effects
```tsx
className="iridescent"        // Color-shifting surface
className="shimmer"           // Shimmer effect
className="glitch"            // Glitch effect
className="skeleton"          // Loading skeleton
```

### Layout
```tsx
className="masonry-grid"      // Masonry layout
className="diagonal-top"      // Diagonal top edge
className="diagonal-bottom"   // Diagonal bottom
```

### Performance
```tsx
className="gpu-accelerated will-change-transform"
```

## Color Variables

```tsx
// Tailwind Classes
text-ai-cyan
text-ai-purple
text-ai-pink
text-ai-neon-green

bg-ai-cyan
bg-ai-purple
bg-ai-pink
bg-ai-neon-green

border-ai-cyan
border-ai-purple
border-ai-pink
```

## Complete Hero Example

```tsx
<section className="relative min-h-screen flex items-center overflow-hidden">
  {/* Background */}
  <BackgroundEffects variant="full" />

  {/* Content */}
  <div className="relative z-10 container mx-auto px-6">
    <HolographicText
      text="Transform Your Research"
      className="text-7xl font-bold mb-6"
    />

    <p className="text-xl text-gray-300 mb-8">
      AI-powered qualitative research platform
    </p>

    <div className="flex gap-4">
      <MagneticButton
        strength={20}
        className="bg-gradient-to-r from-ai-cyan to-ai-purple px-8 py-4 rounded-xl text-white font-bold"
      >
        Get Started
      </MagneticButton>

      <button className="border-2 border-ai-cyan text-ai-cyan px-8 py-4 rounded-xl font-bold hover:bg-ai-cyan/10">
        Learn More
      </button>
    </div>
  </div>

  {/* Decorative */}
  <DecorativeAIEye position="bottom-right" size={180} />
</section>
```

## Complete Feature Card Example

```tsx
<div className="grid md:grid-cols-3 gap-8">
  {[
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Advanced machine learning models",
      gradient: "from-ai-cyan to-ai-purple"
    },
    {
      icon: Languages,
      title: "Multi-Language",
      description: "Support for 7 SEA languages",
      gradient: "from-ai-purple to-ai-pink"
    },
    {
      icon: FileText,
      title: "Instant Reports",
      description: "Professional reports in seconds",
      gradient: "from-ai-pink to-orange-500"
    }
  ].map((feature, i) => (
    <EnhancedFeatureCard
      key={i}
      icon={feature.icon}
      title={feature.title}
      description={feature.description}
      gradient={feature.gradient}
    />
  ))}
</div>
```

## Animation Combinations

### Glowing Card
```tsx
<div className="tilt-card animate-glow-pulse relative">
  <div className="scan-line" />
  {/* Content */}
</div>
```

### Floating Icon
```tsx
<div className="float-slow morph-icon bg-gradient-to-br from-ai-cyan to-ai-purple w-16 h-16 rounded-2xl flex items-center justify-center">
  <Brain className="w-8 h-8 text-white" />
</div>
```

### Holographic Button
```tsx
<button className="relative px-8 py-4 rounded-xl font-bold overflow-hidden group">
  <span className="holographic-text">Click Me</span>
  <div className="absolute inset-0 bg-gradient-to-r from-ai-cyan to-ai-purple opacity-0 group-hover:opacity-20 transition-opacity" />
</button>
```

## Responsive Patterns

```tsx
{/* Desktop: Full effects */}
<div className="hidden lg:block">
  <MatrixRain />
  <DataStream />
</div>

{/* Mobile: Simplified */}
<div className="lg:hidden">
  <div className="aurora-bg absolute inset-0 opacity-20" />
</div>
```

## Performance Tips

1. **Always hide heavy effects on mobile**
   ```tsx
   <div className="hidden lg:block">
     <MatrixRain />
   </div>
   ```

2. **Add GPU acceleration to animated elements**
   ```tsx
   className="gpu-accelerated will-change-transform"
   ```

3. **Use backdrop blur sparingly**
   ```tsx
   className="backdrop-blur-sm" // Not backdrop-blur-xl
   ```

4. **Limit particle counts**
   ```tsx
   <DataStream count={10} /> // Not 50+
   ```

## Common Patterns

### Section with Effects
```tsx
<section className="relative py-32 overflow-hidden">
  {/* Background effect */}
  <div className="circuit-pattern absolute inset-0 opacity-10" />

  {/* Content */}
  <div className="relative z-10 container mx-auto">
    {/* Your content */}
  </div>
</section>
```

### Card with Hover Effects
```tsx
<motion.div
  className="tilt-card relative group"
  whileHover={{ scale: 1.05, y: -5 }}
>
  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 overflow-hidden">
    <div className="scan-line" />
    {/* Content */}
  </div>
</motion.div>
```

### Text with Glow
```tsx
<h2 className="text-5xl font-bold">
  <span className="neon-cyan">Powered by AI</span>
</h2>
```

---

**Pro Tip**: Don't use all effects at once. Choose 2-3 that work well together for each section.

**Quick Start**: Copy the "Complete Hero Example" above and customize from there.
