# Visual Effects Guide - Qual Engine Landing Page

## Overview
This guide documents the cutting-edge AI-themed visual effects implemented for the Qual Engine landing page. These effects create a futuristic, high-tech aesthetic that showcases the platform's advanced capabilities.

## Design System Colors

### AI-Themed Color Palette
```css
--ai-cyan: #00FFFF      /* Primary neon cyan */
--ai-purple: #9333EA    /* Deep purple */
--ai-pink: #EC4899      /* Hot pink */
--ai-neon-green: #39FF14 /* Bright neon green */
```

### Usage in Tailwind
```jsx
className="text-ai-cyan bg-ai-purple border-ai-pink"
```

## Effect Components

### 1. Matrix Rain Effect
**File:** `/src/components/effects/MatrixRain.tsx`

Creates a falling code effect similar to The Matrix movie.

**Usage:**
```jsx
import { MatrixRain } from '@/components/effects';

<MatrixRain density={0.5} speed={1} />
```

**Props:**
- `density`: Number (0-1) - Controls how many columns of characters
- `speed`: Number - Animation speed multiplier
- `className`: String - Additional CSS classes

### 2. Data Stream
**File:** `/src/components/effects/DataStream.tsx`

Vertical animated data streams flowing down the screen.

**Usage:**
```jsx
import { DataStream } from '@/components/effects';

<DataStream count={20} />
```

**Props:**
- `count`: Number - Number of data streams
- `className`: String - Additional CSS classes

### 3. Electric Sparks
**File:** `/src/components/effects/ElectricSparks.tsx`

Animated electric sparks traveling between elements.

**Usage:**
```jsx
import { ElectricSparks } from '@/components/effects';

<div className="relative">
  <ElectricSparks count={5} />
  {/* Your content */}
</div>
```

**Props:**
- `count`: Number - Number of spark animations
- `className`: String - Additional CSS classes

### 4. Scanning Line
**File:** `/src/components/effects/ScanningLine.tsx`

Creates a horizontal scanning line effect.

**Usage:**
```jsx
import { ScanningLine } from '@/components/effects';

<div className="relative">
  <ScanningLine color="#00FFFF" />
  {/* Your content */}
</div>
```

**Props:**
- `color`: String - Hex color for the scanning line
- `className`: String - Additional CSS classes

### 5. AI Eye
**File:** `/src/components/effects/AIEye.tsx`

Animated AI eye with rotating iris and pulsing effects.

**Usage:**
```jsx
import { AIEye } from '@/components/effects';

<AIEye size={120} />
```

**Props:**
- `size`: Number - Diameter in pixels
- `className`: String - Additional CSS classes

### 6. Holographic Text
**File:** `/src/components/effects/HolographicText.tsx`

Text with holographic shimmer and RGB split effects.

**Usage:**
```jsx
import { HolographicText } from '@/components/effects';

<HolographicText
  text="Transform Your Research"
  enableRGBSplit={true}
/>
```

**Props:**
- `text`: String - Text to display
- `enableRGBSplit`: Boolean - Enable RGB split glitch effect
- `className`: String - Additional CSS classes

### 7. Magnetic Button
**File:** `/src/components/effects/MagneticButton.tsx`

Interactive button that follows cursor with magnetic attraction.

**Usage:**
```jsx
import { MagneticButton } from '@/components/effects';

<MagneticButton
  strength={20}
  onClick={() => console.log('Clicked!')}
  className="px-8 py-4 bg-gradient-to-r from-ai-cyan to-ai-purple rounded-xl"
>
  Start Free Trial
</MagneticButton>
```

**Props:**
- `strength`: Number - Magnetic pull strength (default: 20)
- `onClick`: Function - Click handler
- `className`: String - Button styling classes

## CSS Animation Classes

### Holographic Effects
```css
.holographic-text
/* Usage: <span className="holographic-text">Text</span> */
/* Creates color-shifting holographic text */

.iridescent
/* Usage: <div className="iridescent">Content</div> */
/* Iridescent surface with color shifting */
```

### Neon Glow Colors
```css
.neon-cyan     /* Cyan neon glow */
.neon-purple   /* Purple neon glow */
.neon-pink     /* Pink neon glow */
.neon-green    /* Green neon glow */
```

**Example:**
```jsx
<h1 className="neon-cyan text-6xl font-bold">
  Qual Engine
</h1>
```

### Background Patterns
```css
.circuit-pattern    /* Animated circuit board pattern */
.aurora-bg          /* Aurora borealis gradient animation */
.binary-bg          /* Binary code background */
```

**Example:**
```jsx
<section className="relative py-20">
  <div className="circuit-pattern absolute inset-0 opacity-20" />
  <div className="relative z-10">
    {/* Content */}
  </div>
</section>
```

### Advanced Animations
```css
.float-slow        /* Slow floating animation */
.float-medium      /* Medium speed floating */
.float-fast        /* Fast floating animation */
.glow-pulse        /* Pulsing glow effect */
.rotate-slow       /* Slow rotation */
.shimmer           /* Shimmer effect */
.cyber-glitch      /* Cyberpunk glitch effect */
```

### Geometric Transformations
```css
.tilt-card         /* 3D perspective tilt on hover */
.morph-icon        /* Morphing icon animation */
```

### Sectioning Effects
```css
.diagonal-top      /* Diagonal top edge */
.diagonal-bottom   /* Diagonal bottom edge */
.diagonal-both     /* Both edges diagonal */
```

**Example:**
```jsx
<section className="diagonal-bottom bg-gradient-to-r from-gray-900 to-gray-800 py-32">
  {/* Content */}
</section>
```

### Layout Patterns
```css
.masonry-grid      /* Pinterest-style masonry grid */
.masonry-item      /* Individual masonry item */
```

**Example:**
```jsx
<div className="masonry-grid">
  <div className="masonry-item">Card 1</div>
  <div className="masonry-item">Card 2</div>
  <div className="masonry-item">Card 3</div>
</div>
```

### Blend Modes
```css
.blend-multiply
.blend-screen
.blend-overlay
.blend-difference
.blend-luminosity
```

## Animation Combinations

### Example 1: Futuristic Card
```jsx
<motion.div
  className="relative tilt-card glass-card p-8 rounded-2xl overflow-hidden"
  whileHover={{ scale: 1.05 }}
>
  <ScanningLine />
  <ElectricSparks count={3} />
  <div className="relative z-10">
    <h3 className="holographic-text text-2xl font-bold mb-4">
      AI-Powered Analysis
    </h3>
    <p className="text-gray-300">
      Advanced machine learning...
    </p>
  </div>
</motion.div>
```

### Example 2: Hero Section with All Effects
```jsx
<section className="relative min-h-screen overflow-hidden">
  {/* Background Effects */}
  <MatrixRain density={0.3} speed={0.8} />
  <DataStream count={15} />
  <div className="aurora-bg absolute inset-0" />

  {/* Circuit Pattern */}
  <div className="circuit-pattern absolute inset-0 opacity-10" />

  {/* Content */}
  <div className="relative z-10 container mx-auto px-6 py-20">
    <HolographicText
      text="Transform Your Research"
      className="text-6xl font-bold mb-6"
    />

    <MagneticButton
      strength={25}
      className="bg-gradient-to-r from-ai-cyan to-ai-purple px-8 py-4 rounded-xl text-white font-bold"
    >
      Get Started
    </MagneticButton>
  </div>

  {/* Decorative AI Eye */}
  <div className="absolute bottom-10 right-10">
    <AIEye size={200} />
  </div>
</section>
```

### Example 3: Feature Cards with Micro-interactions
```jsx
{features.map((feature, index) => (
  <motion.div
    key={index}
    className="relative feature-card tilt-card"
    whileHover={{ y: -10 }}
  >
    {/* Scanning effect on hover */}
    <ScanningLine />

    <motion.div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 morph-icon"
      style={{
        background: 'linear-gradient(135deg, #00FFFF, #9333EA)',
      }}
      whileHover={{ rotate: 360 }}
    >
      <feature.icon className="w-8 h-8 text-white" />
    </motion.div>

    <h3 className="text-xl font-bold neon-cyan mb-2">
      {feature.title}
    </h3>
    <p className="text-gray-400">{feature.description}</p>
  </motion.div>
))}
```

## Performance Optimization

### GPU Acceleration
Add these classes to animated elements for better performance:
```css
.gpu-accelerated
.will-change-transform
.will-change-opacity
```

### Example:
```jsx
<motion.div className="gpu-accelerated will-change-transform">
  {/* Animated content */}
</motion.div>
```

## Responsive Considerations

### Mobile Optimization
```jsx
{/* Show complex effects only on desktop */}
<div className="hidden lg:block">
  <MatrixRain />
  <DataStream />
</div>

{/* Simplified effects for mobile */}
<div className="lg:hidden">
  <div className="aurora-bg absolute inset-0" />
</div>
```

## Accessibility

### Reduced Motion Support
All animations respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Browser Support

All effects are tested and supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Tips for Best Results

1. **Layer Effects Carefully**: Don't use too many effects simultaneously
2. **Control Opacity**: Use opacity to prevent effects from overwhelming content
3. **Performance**: Test on mid-range devices to ensure smooth performance
4. **Color Harmony**: Stick to the AI color palette for consistency
5. **Animation Timing**: Vary animation durations to create visual interest
6. **Z-Index Management**: Always use proper z-index layering

## Example: Complete Landing Section

```jsx
import {
  MatrixRain,
  DataStream,
  AIEye,
  HolographicText,
  MagneticButton
} from '@/components/effects';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Effects Layer */}
      <MatrixRain density={0.4} speed={1} />
      <DataStream count={20} />

      {/* Aurora Background */}
      <div className="aurora-bg absolute inset-0 opacity-30" />

      {/* Circuit Pattern */}
      <div className="circuit-pattern absolute inset-0 opacity-10" />

      {/* Content Layer */}
      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-4xl">
          <HolographicText
            text="Transform 8 Hours of Analysis Into 5 Minutes"
            className="text-6xl font-bold mb-6"
          />

          <p className="text-xl text-gray-300 mb-8">
            AI-powered qualitative research platform built for
            <span className="neon-cyan font-semibold"> Southeast Asian markets</span>
          </p>

          <div className="flex gap-4">
            <MagneticButton
              strength={20}
              className="bg-gradient-to-r from-ai-cyan to-ai-purple px-8 py-4 rounded-xl text-white font-bold shadow-2xl"
            >
              Start Free Trial
            </MagneticButton>

            <button className="px-8 py-4 border-2 border-ai-cyan text-ai-cyan rounded-xl font-bold hover:bg-ai-cyan/10 transition-all">
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Decorative AI Eye */}
      <div className="absolute bottom-10 right-10 hidden xl:block">
        <AIEye size={180} />
      </div>
    </section>
  );
};
```

## Support

For questions or issues with visual effects:
1. Check browser console for errors
2. Verify all dependencies are installed
3. Ensure Framer Motion is properly configured
4. Test with reduced complexity first

---

**Last Updated:** June 2026
**Version:** 1.0.0
