# Landing Page Component Tree

```
app/landing/page.tsx (Main Landing Page)
│
├── Navigation.tsx (Sticky Header)
│   ├── Logo/Brand
│   ├── Desktop Menu
│   │   ├── Features Link
│   │   ├── How It Works Link
│   │   ├── Pricing Link
│   │   ├── Testimonials Link
│   │   └── FAQ Link
│   ├── CTA Buttons
│   │   ├── Sign In
│   │   └── Get Started
│   └── Mobile Drawer
│       ├── Menu Items
│       └── CTA Buttons
│
├── HeroSection.tsx
│   ├── Background Effects
│   │   ├── Gradient Overlay
│   │   ├── Floating Orbs (animated)
│   │   └── Radial Gradients
│   ├── Content (Left Column)
│   │   ├── Badge ("AI-Powered Research Platform")
│   │   ├── Headline (h1 with gradient)
│   │   ├── Subheadline (descriptive text)
│   │   ├── CTA Buttons
│   │   │   ├── "Start Free Trial"
│   │   │   └── "View Demo"
│   │   └── Statistics Bar
│   │       ├── 40+ Languages
│   │       ├── 98% Accuracy
│   │       └── 10x Faster
│   └── Dashboard Preview (Right Column)
│       ├── Mockup Container
│       ├── Chart Visualization
│       │   └── Animated Bars
│       └── Stats Cards
│
├── FeaturesSection.tsx
│   ├── Section Header
│   │   ├── Overline ("FEATURES")
│   │   ├── Title (h2)
│   │   └── Description
│   └── Feature Grid (8 Cards)
│       ├── AI Transcription Card
│       │   ├── Icon (Mic)
│       │   ├── Title
│       │   └── Description
│       ├── Languages Card
│       │   ├── Icon (Language)
│       │   ├── Title
│       │   └── Description
│       ├── Smart Analysis Card
│       │   ├── Icon (AutoAwesome)
│       │   ├── Title
│       │   └── Description
│       ├── Speed Card
│       │   ├── Icon (Speed)
│       │   ├── Title
│       │   └── Description
│       ├── Security Card
│       │   ├── Icon (Security)
│       │   ├── Title
│       │   └── Description
│       ├── Cloud Card
│       │   ├── Icon (CloudDone)
│       │   ├── Title
│       │   └── Description
│       ├── Analytics Card
│       │   ├── Icon (TrendingUp)
│       │   ├── Title
│       │   └── Description
│       └── AI Insights Card
│           ├── Icon (Psychology)
│           ├── Title
│           └── Description
│
├── HowItWorksSection.tsx
│   ├── Section Header
│   │   ├── Overline ("HOW IT WORKS")
│   │   ├── Title (h2)
│   │   └── Description
│   ├── Connection Line (desktop only)
│   ├── Steps Grid (4 Steps)
│   │   ├── Step 1: Upload
│   │   │   ├── Icon Avatar (CloudUpload)
│   │   │   ├── Step Number Badge
│   │   │   ├── Title
│   │   │   └── Description
│   │   ├── Step 2: Process
│   │   │   ├── Icon Avatar (AutoAwesome)
│   │   │   ├── Step Number Badge
│   │   │   ├── Title
│   │   │   └── Description
│   │   ├── Step 3: Extract
│   │   │   ├── Icon Avatar (Insights)
│   │   │   ├── Step Number Badge
│   │   │   ├── Title
│   │   │   └── Description
│   │   └── Step 4: Export
│   │       ├── Icon Avatar (Download)
│   │       ├── Step Number Badge
│   │       ├── Title
│   │       └── Description
│   └── CTA Section
│       ├── Headline
│       ├── Description
│       └── "Get Started Free" Button
│
├── TestimonialsSection.tsx
│   ├── Section Header
│   │   ├── Overline ("TESTIMONIALS")
│   │   ├── Title (h2)
│   │   └── Description
│   ├── Testimonials Grid (6 Cards)
│   │   ├── Testimonial 1
│   │   │   ├── Quote Icon
│   │   │   ├── Rating (5 stars)
│   │   │   ├── Content (quote)
│   │   │   └── Author
│   │   │       ├── Avatar
│   │   │       ├── Name
│   │   │       └── Role
│   │   ├── Testimonial 2 (same structure)
│   │   ├── Testimonial 3 (same structure)
│   │   ├── Testimonial 4 (same structure)
│   │   ├── Testimonial 5 (same structure)
│   │   └── Testimonial 6 (same structure)
│   └── Statistics Panel
│       ├── 50K+ Hours Transcribed
│       ├── 2,500+ Active Researchers
│       ├── 98% Customer Satisfaction
│       └── 40+ Languages Supported
│
├── PricingSection.tsx
│   ├── Section Header
│   │   ├── Overline ("PRICING")
│   │   ├── Title (h2)
│   │   └── Description
│   ├── Pricing Grid (3 Plans)
│   │   ├── Starter Plan
│   │   │   ├── Plan Name
│   │   │   ├── Description
│   │   │   ├── Price ($29/month)
│   │   │   ├── CTA Button ("Get Started")
│   │   │   └── Features List (6 items)
│   │   ├── Professional Plan
│   │   │   ├── "Most Popular" Badge
│   │   │   ├── Plan Name
│   │   │   ├── Description
│   │   │   ├── Price ($99/month)
│   │   │   ├── CTA Button ("Get Started")
│   │   │   └── Features List (8 items)
│   │   └── Enterprise Plan
│   │       ├── Plan Name
│   │       ├── Description
│   │       ├── Price (Custom)
│   │       ├── CTA Button ("Contact Sales")
│   │       └── Features List (9 items)
│   └── Trust Section
│       ├── "All plans include:" text
│       └── Trust Badges
│           ├── 14-day free trial
│           ├── No credit card required
│           ├── Cancel anytime
│           └── Money-back guarantee
│
├── FAQSection.tsx
│   ├── Section Header
│   │   ├── Overline ("FAQ")
│   │   ├── Title (h2)
│   │   └── Description
│   ├── Accordion List (10 FAQs)
│   │   ├── FAQ 1: Accuracy
│   │   │   ├── Question
│   │   │   └── Answer
│   │   ├── FAQ 2: File Formats
│   │   │   ├── Question
│   │   │   └── Answer
│   │   ├── FAQ 3: Transcription Time
│   │   │   ├── Question
│   │   │   └── Answer
│   │   ├── FAQ 4: Security
│   │   │   ├── Question
│   │   │   └── Answer
│   │   ├── FAQ 5: Languages
│   │   │   ├── Question
│   │   │   └── Answer
│   │   ├── FAQ 6: AI Analysis
│   │   │   ├── Question
│   │   │   └── Answer
│   │   ├── FAQ 7: Collaboration
│   │   │   ├── Question
│   │   │   └── Answer
│   │   ├── FAQ 8: Free Trial
│   │   │   ├── Question
│   │   │   └── Answer
│   │   ├── FAQ 9: Exports
│   │   │   ├── Question
│   │   │   └── Answer
│   │   └── FAQ 10: Overage
│   │       ├── Question
│   │       └── Answer
│   └── Support CTA
│       ├── Headline ("Still have questions?")
│       ├── Description
│       └── "Contact Support" Button
│
└── Footer.tsx
    ├── Main Footer Content
    │   ├── Brand Section
    │   │   ├── Logo/Brand Name
    │   │   ├── Description
    │   │   ├── Contact Info
    │   │   │   ├── Email
    │   │   │   ├── Phone
    │   │   │   └── Address
    │   │   └── Social Links
    │   │       ├── Twitter
    │   │       ├── LinkedIn
    │   │       ├── GitHub
    │   │       └── YouTube
    │   ├── Product Links
    │   │   ├── Features
    │   │   ├── Pricing
    │   │   ├── Use Cases
    │   │   ├── Integrations
    │   │   └── API
    │   ├── Company Links
    │   │   ├── About Us
    │   │   ├── Careers
    │   │   ├── Blog
    │   │   ├── Press Kit
    │   │   └── Contact
    │   ├── Resources Links
    │   │   ├── Documentation
    │   │   ├── Help Center
    │   │   ├── Community
    │   │   ├── Tutorials
    │   │   └── Status
    │   └── Legal Links
    │       ├── Privacy Policy
    │       ├── Terms of Service
    │       ├── Cookie Policy
    │       ├── GDPR
    │       └── Security
    └── Bottom Bar
        ├── Copyright Notice
        └── Legal Links
            ├── Privacy
            ├── Terms
            └── Cookies
```

## Data Flow

```
User Interaction → Navigation → Smooth Scroll → Section
                                               ↓
                                    Intersection Observer
                                               ↓
                                    Trigger Animations
                                               ↓
                                    Framer Motion
                                               ↓
                                    Render Animated Content
```

## Animation Flow

```
Page Load
  ↓
Navigation: Slide Down
  ↓
Hero: Fade In + Scale
  ↓
User Scrolls
  ↓
Intersection Observer Detects
  ↓
Features: Staggered Fade In
  ↓
How It Works: Sequential Animation
  ↓
Testimonials: Grid Animation
  ↓
Pricing: Scale + Fade
  ↓
FAQ: Smooth Accordion
  ↓
Footer: Final Fade In
```

## State Management

```
Navigation Component
├── scrolled (boolean) - tracks scroll position
└── mobileOpen (boolean) - drawer state

FAQSection Component
└── expanded (string | false) - active accordion panel

All Section Components
└── inView (boolean) - intersection observer state
```

## Styling Architecture

```
MUI Theme (styles/theme.ts)
  ↓
Brand Colors
  ↓
Component Styles (sx prop)
  ↓
Responsive Breakpoints
  ↓
Animation Keyframes
  ↓
Final Rendered Styles
```

## File Dependencies

```
app/landing/page.tsx
  ├── imports: components/landing/*
  └── uses: MUI Box, Container

components/landing/Navigation.tsx
  ├── imports: MUI components
  ├── imports: Material Icons
  ├── imports: framer-motion
  └── depends: React hooks

components/landing/HeroSection.tsx
  ├── imports: MUI components
  ├── imports: Material Icons
  ├── imports: framer-motion
  ├── imports: react-intersection-observer
  └── depends: MUI theme

components/landing/FeaturesSection.tsx
  ├── imports: MUI components
  ├── imports: Material Icons
  ├── imports: framer-motion
  └── imports: react-intersection-observer

[Pattern repeats for other sections]

lib/higgsfields.ts
  └── standalone utility (no dependencies)
```

## Key Interactions

1. **Navigation Scroll**
   ```
   User Clicks Nav Link → scrollToSection() → element.scrollIntoView()
   ```

2. **Scroll Animations**
   ```
   User Scrolls → useInView triggers → inView = true → Framer Motion animates
   ```

3. **Accordion FAQ**
   ```
   User Clicks Question → handleChange() → setExpanded() → Accordion opens
   ```

4. **Drawer Menu**
   ```
   User Clicks Menu Icon → handleDrawerToggle() → setMobileOpen() → Drawer opens
   ```

5. **CTA Buttons**
   ```
   User Clicks CTA → Navigate to /login or /signup → Auth flow
   ```

## Responsive Behavior

```
Mobile (xs, sm)
├── Single column layouts
├── Hamburger menu
├── Stacked elements
└── Touch-optimized

Tablet (md)
├── 2-column layouts
├── Partial navigation
├── Adjusted spacing
└── Mixed layouts

Desktop (lg, xl)
├── 3-column layouts
├── Full navigation
├── Optimal spacing
└── Advanced animations
```
