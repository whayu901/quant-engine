# Qual Engine Landing Page

A stunning, conversion-focused landing page built with Material-UI and Next.js, featuring beautiful animations and modern design patterns.

## Overview

The landing page is designed to showcase Qual Engine's AI-powered transcription and research analysis capabilities with a focus on user engagement and conversion.

## Features

### 1. Hero Section
- **Eye-catching gradient backgrounds** with animated floating elements
- **Dynamic statistics** highlighting key metrics (40+ languages, 98% accuracy, 10x faster)
- **Interactive CTA buttons** with smooth hover effects
- **Dashboard preview mockup** with animated chart visualization
- Fully responsive design

### 2. Features Section
- **8 feature cards** showcasing core capabilities:
  - AI Transcription
  - 40+ Languages support
  - Smart Analysis
  - Lightning Fast processing
  - Enterprise Security
  - Cloud-Based platform
  - Advanced Analytics
  - AI Insights
- Animated card hover effects with gradient borders
- Color-coded icons for visual hierarchy

### 3. How It Works Section
- **4-step process visualization**:
  1. Upload Your Files
  2. AI Processing
  3. Extract Insights
  4. Export & Share
- Animated step indicators with custom icons
- Connection lines showing workflow progression
- Call-to-action section at the bottom

### 4. Testimonials Section
- **6 customer testimonials** with ratings
- Glassmorphism card effects
- Quote icon animations on hover
- Statistics panel showing platform metrics:
  - 50K+ hours transcribed
  - 2,500+ active researchers
  - 98% customer satisfaction
  - 40+ languages supported

### 5. Pricing Section
- **3 pricing tiers**:
  - Starter ($29/month)
  - Professional ($99/month) - Most Popular
  - Enterprise (Custom pricing)
- Feature comparison lists
- "Most Popular" badge with visual emphasis
- Trust badges (14-day trial, no credit card, cancel anytime)

### 6. FAQ Section
- **10 frequently asked questions**
- Expandable accordion interface
- Smooth animations and transitions
- Contact support CTA

### 7. Footer
- **Comprehensive site navigation**:
  - Product links
  - Company information
  - Resources
  - Legal pages
- Contact information with icons
- Social media links (Twitter, LinkedIn, GitHub, YouTube)
- Responsive grid layout

### 8. Navigation Bar
- **Sticky header** with blur effect on scroll
- Smooth scroll to sections
- Mobile-responsive drawer menu
- CTA buttons for Sign In and Get Started

## Technical Implementation

### Technologies Used

- **Next.js 13.5.6** - React framework with App Router
- **Material-UI (MUI) v5.18.0** - Component library
- **Framer Motion** - Animation library
- **React Intersection Observer** - Scroll animations
- **TypeScript** - Type safety

### File Structure

```
app/
├── landing/
│   └── page.tsx          # Main landing page
components/
├── landing/
│   ├── Navigation.tsx    # Sticky navigation bar
│   ├── HeroSection.tsx   # Hero with CTA
│   ├── FeaturesSection.tsx
│   ├── HowItWorksSection.tsx
│   ├── TestimonialsSection.tsx
│   ├── PricingSection.tsx
│   ├── FAQSection.tsx
│   ├── Footer.tsx
│   └── index.ts          # Exports
lib/
└── higgsfields.ts        # Asset generation utilities
```

### Styling Approach

All styling uses MUI's `sx` prop for consistency:
- No Tailwind CSS
- Type-safe styling with TypeScript
- Theme-aware colors and spacing
- Responsive breakpoints using MUI's system

### Animations

1. **Scroll-triggered animations** using `react-intersection-observer`
2. **Framer Motion** for:
   - Component entrance animations
   - Hover effects
   - Micro-interactions
3. **CSS animations** for:
   - Gradient backgrounds
   - Floating elements
   - Pulsing effects

### Higgsfields Integration

The `lib/higgsfields.ts` utility provides programmatic asset generation:

```typescript
import { generateGradient, brandGradients } from '@/lib/higgsfields';

// Use predefined brand gradients
const heroGradient = brandGradients.hero;

// Generate custom gradients
const customGradient = generateGradient({
  type: 'linear',
  angle: 135,
  colors: ['#0066FF', '#8B5CF6', '#EC4899'],
});
```

Available utilities:
- `generateGradient()` - Create CSS gradient strings
- `generatePattern()` - Generate repeating patterns
- `createMeshGradient()` - Complex mesh gradients
- `createGlassmorphism()` - Glassmorphism effects
- `generateParticles()` - Particle effect data
- `generateBlobSVG()` - Organic blob shapes

## Customization

### Brand Colors

Defined in `/styles/theme.ts`:
```typescript
const brandColors = {
  velocityBlue: '#0066FF',
  neuralPurple: '#8B5CF6',
  accentCoral: '#FF6B6B',
  accentMint: '#4ECDC4',
  // ... more colors
};
```

### Content Updates

1. **Features**: Edit `components/landing/FeaturesSection.tsx` - `features` array
2. **Testimonials**: Edit `components/landing/TestimonialsSection.tsx` - `testimonials` array
3. **Pricing**: Edit `components/landing/PricingSection.tsx` - `plans` array
4. **FAQ**: Edit `components/landing/FAQSection.tsx` - `faqs` array

### Adding New Sections

1. Create new component in `components/landing/`
2. Import in `app/landing/page.tsx`
3. Add navigation link in `components/landing/Navigation.tsx`

## Routing

The landing page is set up with automatic routing:

- **Unauthenticated users**: Redirected from `/` to `/landing`
- **Authenticated users**: Redirected from `/` to `/dashboard`
- **Direct access**: Available at `/landing`

Edit `app/page.tsx` to modify routing behavior.

## Performance Optimizations

1. **Static generation** - Page is pre-rendered at build time
2. **Image optimization** - Using Next.js Image component where applicable
3. **Code splitting** - Automatic with Next.js App Router
4. **Lazy loading** - Components load as user scrolls
5. **CSS-in-JS** - Emotion for MUI (no runtime CSS parsing)

## Accessibility

- **Semantic HTML** - Proper heading hierarchy
- **ARIA labels** - On interactive elements
- **Keyboard navigation** - Full keyboard support
- **Color contrast** - WCAG AA compliant
- **Focus indicators** - Visible focus states

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

The landing page is automatically included in the production build:

```bash
npm run build
npm start
```

Visit `http://localhost:5173/landing` to view.

## Future Enhancements

Potential improvements for future iterations:

1. **Video background** in hero section
2. **Live chat integration**
3. **A/B testing** for CTAs
4. **Analytics tracking** (Google Analytics, Mixpanel)
5. **Email capture** with newsletter signup
6. **Case studies** section
7. **Integration showcase** with popular tools
8. **Interactive product tour**
9. **Multi-language support** for landing page content
10. **Dark mode** toggle

## Credits

- **Design System**: Material-UI (MUI)
- **Animations**: Framer Motion
- **Icons**: Material Icons
- **Typography**: Inter font family

## License

Copyright © 2024 Qual Engine. All rights reserved.
