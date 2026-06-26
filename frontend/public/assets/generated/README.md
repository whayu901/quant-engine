# AI-Generated Assets for Qual Engine Landing Page

This directory contains high-quality assets generated using Higgsfield AI to enhance the visual appeal and user experience of the Qual Engine landing page.

## Asset Inventory

### Hero Section
- **hero-background.png** (8.0MB, 3840x2160, 4K)
  - Futuristic AI-powered transcription dashboard interface
  - Floating holographic waveforms with purple and blue gradient
  - Neural network visualization with modern tech aesthetic
  - Used with parallax scrolling effect and soft-light blend mode

### Feature Icons (All 2048x2048, 2K)
- **icon-transcription.png** (5.2MB)
  - 3D glass morphism icon for AI transcription
  - Sound waves transforming into text particles
  - Purple and blue gradient with transparent glass effect

- **icon-language.png** (6.2MB)
  - 3D glass morphism icon for multi-language support
  - Floating globe with language symbols and speech bubbles
  - Purple gradient with modern tech aesthetic

- **icon-analysis.png** (6.4MB)
  - 3D glass morphism icon for AI smart analysis
  - Floating brain with neural connections and data particles
  - Pink and purple gradient with glowing highlights

- **icon-speed.png** (5.8MB)
  - 3D glass morphism icon for lightning fast processing
  - Dynamic speed lines and energy particles
  - Green gradient with motion blur effect

### Testimonial Avatars (All 2048x2048, 2K)
- **avatar-sarah.png** (6.9MB)
  - Professional headshot portrait
  - Confident researcher woman with glasses
  - Modern office background with natural lighting

- **avatar-david.png** (7.8MB)
  - Professional headshot portrait
  - Confident UX researcher man
  - Modern tech office background with natural lighting

## Generation Details

All assets were generated using:
- **Model**: Higgsfield GPT Image 2 (videotape-alpha)
- **Quality**: High
- **Date**: June 26, 2026
- **Total Credits Used**: ~7 credits

## Implementation

Assets are integrated into the landing page using the SmartImage component with:
- Lazy loading for optimal performance
- Shimmer loading effects
- Fallback support for failed loads
- Next.js Image optimization (AVIF/WebP)
- Responsive sizing

## Optimization

Images are automatically optimized by Next.js:
- Format conversion (AVIF/WebP)
- Multiple device sizes
- Cache-Control headers
- Progressive loading

## Usage

```tsx
import SmartImage from '@/components/common/SmartImage';

<SmartImage
  src="/assets/generated/hero/hero-background.png"
  alt="AI-Powered Dashboard"
  fallback="linear-gradient(...)"
  objectFit="cover"
  priority
/>
```

## Asset Performance

- Hero background: Parallax effect with reduced opacity (0.4) and soft-light blend
- Feature icons: Hover effects with scale and rotation transforms
- Avatars: Circular crop with colored borders and shadows

## Future Assets

Potential assets to generate:
- Product screenshots/mockups
- Background patterns/textures
- Additional feature icons
- Team member avatars
- Case study images
- Social media graphics

## Credits Remaining

484.72 credits available for additional asset generation.

## Contact

For asset regeneration or modifications, use the Higgsfield CLI with the generation IDs stored in `/lib/assets/assetManifest.ts`.
