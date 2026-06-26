# Landing Page Quick Reference Card

## 🚀 Quick Start

```bash
# Access the landing page
http://localhost:5173/landing

# Build for production
npm run build

# Start dev server
npm run dev
```

## 📁 File Locations

```
components/landing/       # All landing components
app/landing/page.tsx     # Main landing page
lib/higgsfields.ts       # Asset generation
styles/theme.ts          # MUI theme config
```

## 🎨 Brand Colors

```typescript
Primary Blue:    #0066FF
Secondary Purple: #8B5CF6
Accent Pink:     #EC4899
Success Green:   #10B981
Warning Orange:  #F59E0B
```

## 📝 Edit Content

### Hero Section
```typescript
File: components/landing/HeroSection.tsx
Lines: 77-83 (headline)
Lines: 89-97 (description)
```

### Features (8 cards)
```typescript
File: components/landing/FeaturesSection.tsx
Lines: 12-71 (features array)
```

### Pricing Plans
```typescript
File: components/landing/PricingSection.tsx
Lines: 11-75 (plans array)
```

### Testimonials
```typescript
File: components/landing/TestimonialsSection.tsx
Lines: 11-61 (testimonials array)
```

### FAQ
```typescript
File: components/landing/FAQSection.tsx
Lines: 12-51 (faqs array)
```

## 🔧 Common Tasks

### Add New Feature Card
```typescript
// In FeaturesSection.tsx, add to features array:
{
  icon: YourIcon,
  title: 'Feature Name',
  description: 'Feature description',
  color: '#0066FF',
  gradient: 'linear-gradient(135deg, #0066FF 0%, #4A90FF 100%)',
}
```

### Change CTA Button Text
```typescript
// HeroSection.tsx, line 103 or 117
<Button>Your New CTA Text</Button>
```

### Update Pricing
```typescript
// PricingSection.tsx, modify plans array
{
  name: 'Plan Name',
  price: 99,
  features: ['Feature 1', 'Feature 2'],
}
```

### Add New Section
```typescript
// 1. Create component in components/landing/
// 2. Import in app/landing/page.tsx
// 3. Add <NewSection /> between existing sections
// 4. Add nav link in Navigation.tsx
```

## 🎭 Animation Timing

```typescript
Initial delay: 0s
Stagger delay: 0.1s - 0.2s per item
Duration: 0.6s - 0.8s
Easing: 'easeOut' or 'ease-in-out'
```

## 📱 Breakpoints

```typescript
xs: 0px      // Mobile
sm: 600px    // Tablet (portrait)
md: 900px    // Tablet (landscape)
lg: 1200px   // Desktop
xl: 1536px   // Wide desktop
```

## 🎯 Section IDs

```typescript
#hero          // Hero section
#features      // Features section
#how-it-works  // How It Works
#testimonials  // Testimonials
#pricing       // Pricing
#faq           // FAQ
```

## 🖼️ Gradient Generator

```typescript
import { generateGradient } from '@/lib/higgsfields';

const gradient = generateGradient({
  type: 'linear',
  angle: 135,
  colors: ['#0066FF', '#8B5CF6'],
});
```

## 🔄 Update Navigation

```typescript
// Navigation.tsx, lines 13-19
const navLinks = [
  { label: 'Your Link', href: '#your-section' },
];
```

## 📊 Performance Tips

```bash
# Check bundle size
npm run build

# Analyze bundle
npm install -g @next/bundle-analyzer
```

## 🐛 Common Issues

### Build Error
```bash
# Clear cache
rm -rf .next
npm run build
```

### Animation Not Working
```typescript
// Check intersection observer setup
const [ref, inView] = useInView({
  triggerOnce: true,
  threshold: 0.1,
});
```

### Scroll Not Smooth
```css
/* Check globals.css has: */
html {
  scroll-behavior: smooth;
}
```

## 📦 Component Imports

```typescript
import {
  HeroSection,
  FeaturesSection,
  PricingSection,
} from '@/components/landing';
```

## 🎨 MUI Styling Pattern

```typescript
<Box
  sx={{
    background: 'linear-gradient(...)',
    borderRadius: 2,
    p: 3,           // padding
    mt: 2,          // marginTop
    mb: 4,          // marginBottom
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  }}
/>
```

## 📱 Responsive Styling

```typescript
sx={{
  fontSize: {
    xs: '1rem',    // mobile
    md: '1.5rem',  // desktop
  },
  display: {
    xs: 'none',    // hide on mobile
    md: 'block',   // show on desktop
  },
}}
```

## 🌈 Predefined Gradients

```typescript
import { brandGradients } from '@/lib/higgsfields';

brandGradients.primary    // Blue
brandGradients.secondary  // Purple
brandGradients.hero       // Multi-color
brandGradients.subtle     // Light overlay
```

## 🔗 Quick Links

| What | Where |
|------|-------|
| Full Docs | LANDING_PAGE.md |
| Guide | LANDING_PAGE_GUIDE.md |
| Summary | LANDING_PAGE_SUMMARY.md |
| Component Tree | COMPONENT_TREE.md |
| Theme Config | styles/theme.ts |

## 🚨 Pre-Deploy Checklist

- [ ] Update all placeholder text
- [ ] Replace demo testimonials
- [ ] Verify pricing info
- [ ] Add real contact details
- [ ] Test all CTAs
- [ ] Mobile testing
- [ ] Browser testing
- [ ] Performance check
- [ ] SEO meta tags
- [ ] Analytics setup

## 💡 Pro Tips

1. **Gradients**: Use `brandGradients` for consistency
2. **Animations**: Keep duration < 1s for snappiness
3. **Colors**: Stick to theme colors for brand unity
4. **Spacing**: Use MUI spacing units (multiples of 8px)
5. **Images**: Optimize before adding (WebP format)
6. **Icons**: Use Material Icons for consistency
7. **Typography**: Follow established variants (h1-h6, body1-2)
8. **Accessibility**: Always add aria-labels to icons
9. **Performance**: Lazy load below-fold content
10. **Mobile**: Test on real devices, not just DevTools

## 📞 Support Resources

- MUI Docs: https://mui.com
- Framer Motion: https://www.framer.com/motion/
- Next.js: https://nextjs.org/docs
- TypeScript: https://www.typescriptlang.org/docs

---

**Quick Access**: `http://localhost:5173/landing`
