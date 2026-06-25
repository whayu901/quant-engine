# Qual Engine - Visual Showcase

**A Visual Tour of the Design System**
**Version:** 1.0

This document provides visual examples of how Qual Engine's design comes together.

---

## Landing Page Hero

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                           [QUAL  ENGINE]                                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║                                                                            ║
║           Turn 8-hour analysis into 5 minutes                              ║
║                                                                            ║
║        AI-powered qualitative research platform built                      ║
║               for Southeast Asian markets                                  ║
║                                                                            ║
║     ┌─────────────────────┐  ┌──────────────────┐                        ║
║     │  Start Free Trial   │  │   Watch Demo     │                        ║
║     └─────────────────────┘  └──────────────────┘                        ║
║                                                                            ║
║    ┌──────────────────────────────────────────────────────┐               ║
║    │                                                       │               ║
║    │     [Dashboard Screenshot with Speed Metrics]        │               ║
║    │                                                       │               ║
║    │  ┌──────┐  ┌──────┐  ┌──────┐                       │               ║
║    │  │127hrs│  │ 45min│  │8proj │                       │               ║
║    │  │saved │  │ avg  │  │active│                       │               ║
║    │  └──────┘  └──────┘  └──────┘                       │               ║
║    │                                                       │               ║
║    └──────────────────────────────────────────────────────┘               ║
║                                                                            ║
║  🔒 ISO 27001  •  ✓ PDPA Compliant  •  🌏 SEA Data Residency             ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝

Design Notes:
- Background: Subtle gradient (Paper → lighter), animated gradient mesh
- Headline: Display XL (56px desktop), gradient text fill (Blue → Purple)
- CTAs: Primary button (Velocity Blue) + Ghost button
- Screenshot: Perspective tilt (-2deg), shadow depth, parallax scroll
- Trust badges: Small, mono font, subtle icons
```

---

## Dashboard (Desktop)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ☰  QUAL ENGINE          [Search]        [Notifications]  [Profile]        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Welcome back, Sarah                                                        │
│  ┌────────────────────────────────────────┐                                │
│  │  ⚡  127 Hours Saved                    │                                │
│  │     this month                          │                                │
│  └────────────────────────────────────────┘                                │
│                                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                 │
│  │  12 hours     │  │  45 minutes   │  │  8 projects   │                 │
│  │  saved today  │  │  avg analysis │  │  active       │                 │
│  └───────────────┘  └───────────────┘  └───────────────┘                 │
│                                                                             │
│  Quick Actions                                                              │
│  ┌──────────────┐  ┌──────────────────┐                                   │
│  │ + New Project│  │  Upload Recording│                                   │
│  └──────────────┘  └──────────────────┘                                   │
│                                                                             │
│  Recent Projects                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                    │
│  │ Q3 FGDs      │  │ Brand Study  │  │ UX Research  │                    │
│  │ 5 transcripts│  │ 3 transcripts│  │ 8 transcripts│                    │
│  │ ● Active     │  │ ● Processing │  │ ● Complete   │                    │
│  │ [View →]     │  │ [View →]     │  │ [View →]     │                    │
│  └──────────────┘  └──────────────┘  └──────────────┘                    │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘

Design Notes:
- Time saved badge: Gradient background (10% opacity), gradient border
- Stat cards: Neural Purple icons, mono numbers, hover lift
- Project cards: 3-column grid (desktop), hover shadow, status dots
- Colors: Petrol (complete), Amber (processing), Velocity Blue (active)
```

---

## Upload Flow

```
Step 1: File Selection
┌──────────────────────────────────────────────────┐
│  Upload Recording                            ✕   │
├──────────────────────────────────────────────────┤
│                                                   │
│   ┌─────────────────────────────────────────┐   │
│   │           ☁                              │   │
│   │                                          │   │
│   │    Drag & drop your files here          │   │
│   │    or click to browse                   │   │
│   │                                          │   │
│   │    Audio, Video, .docx, .txt            │   │
│   │    Up to 2GB per file                   │   │
│   │                                          │   │
│   └─────────────────────────────────────────┘   │
│                                                   │
└──────────────────────────────────────────────────┘

Step 2: Upload Progress
┌──────────────────────────────────────────────────┐
│  Uploading                                   ✕   │
├──────────────────────────────────────────────────┤
│                                                   │
│   📄  Interview_Recording_Q3.mp3                 │
│       245 MB                                     │
│                                                   │
│   ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░ 65% • 2m 15s remaining   │
│                                                   │
│   15 MB/s • Uploading                            │
│                                                   │
└──────────────────────────────────────────────────┘

Step 3: Processing
┌──────────────────────────────────────────────────┐
│  Processing                                  ✕   │
├──────────────────────────────────────────────────┤
│                                                   │
│   ✨  Transcribing audio...                      │
│                                                   │
│   ⚙️  Language detected: English (Taglish mix)   │
│   ⏱️  Estimated: 3 minutes                       │
│                                                   │
│   You can close this and we'll notify you        │
│   when it's ready                                │
│                                                   │
└──────────────────────────────────────────────────┘

Step 4: Success
┌──────────────────────────────────────────────────┐
│  ✓  Ready in 3 minutes!                          │
├──────────────────────────────────────────────────┤
│                                                   │
│   That's 8x faster than manual transcription!   │
│                                                   │
│   ┌────────────────────┐                         │
│   │  Start Analysis ⚡ │                         │
│   └────────────────────┘                         │
│                                                   │
└──────────────────────────────────────────────────┘

Design Notes:
- Progress bar: Speed gradient (Blue → Purple), animated shimmer
- Time estimate: Real-time countdown, mono font
- Processing: Neural Purple glow, pulsing animation
- Success: Checkmark bounce, CTA button pulses
```

---

## Analysis Grid (Evidence Panel)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Analysis Grid: Q3 Focus Groups                        [Export CSV]        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Theme / Participant   │  Sarah (25,SG)  │  Ahmad (32,MY)  │  Maria (28,PH)│
│  ─────────────────────────────────────────────────────────────────────────│
│  ║ Trust               │  Trusts brand   │  Needs proof    │  Very trusting│
│  ║                     │  due to history │  before buying  │  of reviews   │
│  ║                     │  3 evidence →   │  5 evidence →   │  2 evidence → │
│  ─────────────────────────────────────────────────────────────────────────│
│  ║ Price Sensitivity   │  Very price-    │  Willing to pay │  Looks for    │
│  ║                     │  conscious      │  for quality    │  discounts    │
│  ║                     │  4 evidence →   │  3 evidence →   │  6 evidence → │
│  ─────────────────────────────────────────────────────────────────────────│
│  ║ Digital Experience  │  Expects mobile │  Prefers app    │  Uses both    │
│  ║                     │  -first design  │  over website   │  equally      │
│  ║                     │  7 evidence →   │  4 evidence →   │  3 evidence → │
│  └─────────────────────────────────────────────────────────────────────────│

Click "3 evidence →" opens Evidence Panel:

                    ┌───────────────────────────────────────┐
                    │  Evidence: Trust - Sarah          ✕   │
                    ├───────────────────────────────────────┤
                    │                                       │
                    │  "I really trust this brand because   │
                    │   they've been around for years and   │
                    │   my friends always recommend them."  │
                    │                                       │
                    │  Speaker: Sarah • 02:34               │
                    │  [▶ Play Audio Clip]                  │
                    │  ───────────────────────────────────  │
                    │                                       │
                    │  "The security features make me       │
                    │   feel safe when using their app."    │
                    │                                       │
                    │  Speaker: Sarah • 08:12               │
                    │  [▶ Play Audio Clip]                  │
                    │  ───────────────────────────────────  │
                    │                                       │
                    │  + 1 more evidence                    │
                    │                                       │
                    └───────────────────────────────────────┘

Design Notes:
- Theme color: Left border stripe (each theme = different color)
- Cell hover: Lift -2px, show tooltip with full text
- Evidence button: Velocity Blue background (ultra-light), mono font
- Panel: Slide in from right (300ms), backdrop blur
- Quotes: Newsreader serif, 16px, theme color highlight
```

---

## Time-Saving Calculator (Landing Page)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  How much time will Qual Engine save you?                                  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Interviews per month:                                                      │
│  ├──────●────────────────────────┤  20                                     │
│   1                            50                                           │
│                                                                             │
│  Hours per interview:                                                       │
│  ├──────────●──────────────────┤  6                                        │
│   1                            12                                           │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────│
│                                                                             │
│  Manual Analysis Time:                                                      │
│  120 hours/month                                                            │
│                                                                             │
│  With Qual Engine:                                                          │
│  15 hours/month ⚡                                                          │
│                                                                             │
│  You'll save:                                                               │
│                                                                             │
│         105 HOURS                                                           │
│        That's 13 working days!                                              │
│                                                                             │
│  ┌──────────────────┐                                                      │
│  │ Start Free Trial │                                                      │
│  └──────────────────┘                                                      │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘

Design Notes:
- Sliders: Velocity Blue track, real-time update
- Savings number: Display XL, gradient text (Blue → Purple)
- Animation: Number counts up when slider changes (satisfying)
- CTA: Primary button, subtle pulse animation
```

---

## Before/After Comparison

```
┌───────────────────────────────┬───────────────────────────────┐
│  Manual Analysis              │  With Qual Engine             │
├───────────────────────────────┼───────────────────────────────┤
│                               │                               │
│  ⏱️  8 hours                   │  ⚡  5 minutes                │
│  per interview                │  per interview                │
│                               │                               │
│  📊  Basic themes only        │  🎯  Deep insights            │
│  Surface-level                │  AI-powered themes            │
│                               │                               │
│  📝  Manual note-taking       │  🤖  Auto transcription       │
│  Error-prone                  │  99% accuracy                 │
│                               │                               │
│  🔍  Hard to find quotes      │  🔎  Instant search           │
│  Ctrl+F through docs          │  Citation-linked              │
│                               │                               │
│  😰  Tedious, repetitive      │  😊  Fast, enjoyable          │
│  Burnout risk                 │  Focus on insights            │
│                               │                               │
└───────────────────────────────┴───────────────────────────────┘

Design Notes:
- Left side: Grayscale tint, slower reveal animation
- Right side: Full color (gradient accents), faster animation
- Divider: Animated vertical line with arrows
- Emojis: Add warmth, SEA-friendly visual language
```

---

## Mobile Dashboard

```
┌─────────────────────────┐
│  ☰  QUAL ENGINE    🔔 👤│
├─────────────────────────┤
│                         │
│  Welcome, Sarah         │
│                         │
│  ┌─────────────────────┐│
│  │  ⚡ 127 Hrs Saved   ││
│  │  this month         ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │  12 hrs             ││
│  │  saved today        ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │  45 mins            ││
│  │  avg analysis       ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │  8 projects         ││
│  │  active             ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │  + New Project      ││
│  └─────────────────────┘│
│                         │
│  Recent                 │
│  ┌─────────────────────┐│
│  │  Q3 FGDs            ││
│  │  5 transcripts      ││
│  │  ● Active           ││
│  │  [View →]           ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │  Brand Study        ││
│  │  3 transcripts      ││
│  │  ● Processing       ││
│  │  [View →]           ││
│  └─────────────────────┘│
│                         │
│  [Projects] [+] [Search]│
│  [Profile]              │
└─────────────────────────┘

Design Notes:
- 1 column layout, vertical scroll
- Large touch targets (≥44px)
- Bottom navigation (thumb-friendly)
- Swipe gestures: Swipe card left = delete
- Pull to refresh at top
```

---

## Pricing Cards (Desktop)

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Starter         │  │  Pro ⭐          │  │  Enterprise      │
│                  │  │  Most Popular    │  │                  │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│                  │  │                  │  │                  │
│  $79             │  │  $199            │  │  Custom          │
│  per month       │  │  per month       │  │  pricing         │
│                  │  │                  │  │                  │
│  ──────────────  │  │  ──────────────  │  │  ──────────────  │
│                  │  │                  │  │                  │
│  ✓ 5 projects    │  │  ✓ 25 projects   │  │  ✓ Unlimited     │
│  ✓ 3 seats       │  │  ✓ 10 seats      │  │  ✓ Unlimited     │
│  ✓ 600 min/mo    │  │  ✓ 3,000 min/mo  │  │  ✓ Custom        │
│  ✓ Analysis      │  │  ✓ Advanced AI   │  │  ✓ Dedicated     │
│  ✓ Basic support │  │  ✓ Priority      │  │  ✓ SLA           │
│                  │  │  ✓ API access    │  │  ✓ SSO           │
│                  │  │  ✓ Knowledge Base│  │  ✓ Data residency│
│                  │  │                  │  │  ✓ White-label   │
│                  │  │                  │  │                  │
│  ──────────────  │  │  ──────────────  │  │  ──────────────  │
│                  │  │                  │  │                  │
│  [Start Free]   │  │  [Start Free]   │  │  [Contact Sales] │
│                  │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
      Scale 1.0             Scale 1.03           Scale 1.0
   (on hover: 1.03)    (gradient border)     (on hover: 1.03)

Design Notes:
- Recommended (Pro): Gradient border (Blue → Purple), elevation
- Hover: Scale 1.03, shadow increase
- Feature list: Checkmarks (Success green), mono labels
- Value: "Most popular" badge (top right, gradient bg)
- Mobile: Horizontal scroll, snap to card center
```

---

## Color Palette Visual

```
PRIMARY COLORS

████ Velocity Blue      ████ Velocity Blue Hover  ████ V. Blue Light
#0A7AFF                 #3D95FF                   #75B3FF

████ Neural Purple      ████ Neural Purple Hover  ████ N. Purple Light
#7B4FFF                 #9975FF                   #BFA5FF

SPEED GRADIENT
████████████████████████████████████████████████
Linear: #0A7AFF → #7B4FFF (45deg)

SECONDARY COLORS

████ Petrol             ████ Amber                ████ Sunset Orange
#0F4C45                 #C8881E                   #FF6B35

NEUTRALS

████ Ink        ████ Charcoal   ████ Slate      ████ Paper
#17191C         #2C2E33         #6B6F76         #F4F3EE

████ Sheet      ████ Hairline   ████ Cloud
#FCFCFA         #E2E0D9         #F8F9FA

SEMANTIC

████ Success    ████ Error      ████ Warning    ████ Info
#10B981         #EF4444         #F59E0B         #3B82F6
```

---

## Typography Scale

```
DISPLAY XL (56px, Bold, -0.03em)
Turn hours into minutes

DISPLAY L (44px, Bold, -0.02em)
Welcome back, Sarah

DISPLAY M (36px, Semibold, -0.02em)
Recent Projects

HEADING L (28px, Semibold, -0.01em)
Analysis Results

HEADING M (22px, Semibold, -0.01em)
Evidence Panel

HEADING S (18px, Semibold)
Project Details

BODY L (18px, Regular, 1.7)
This is body large text for main content and important descriptions.

BODY M (16px, Regular, 1.6)
This is body medium text for standard UI text and labels.

BODY S (14px, Regular, 1.5)
This is body small text for helper text and captions.

LABEL (12px, Mono, UPPERCASE, 0.08em)
PROCESSING

MICRO (12px, Regular)
Timestamp • 2 min ago
```

---

## Button States

```
PRIMARY BUTTON

Default:        [  Start Analysis  ]     (Velocity Blue)
Hover:          [  Start Analysis  ]↑    (Brighter, scale 1.02, glow)
Active:         [  Start Analysis  ]↓    (Scale 0.98)
Focus:          [  Start Analysis  ]     (3px blue outline)
Disabled:       [  Start Analysis  ]     (Gray, cursor: not-allowed)
Loading:        [  ⚙️ Processing... ]    (Spinner, opacity 0.7)

SECONDARY BUTTON

Default:        [    Cancel    ]         (Border, transparent bg)
Hover:          [    Cancel    ]         (Background tint)

AI BUTTON

Default:        [  ✨ Extract Themes  ]  (Gradient bg)
Hover:          [  ✨ Extract Themes  ]  (Gradient shift, glow)
```

---

## Animation Examples

```
UPLOAD PROGRESS
┌────────────────────────────────┐
│ 📄 file.mp3                    │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░            │ ← Gradient fills, shimmer moves
│ 65% • 2m 15s remaining         │    across bar
└────────────────────────────────┘

THEME EXTRACTION (AI Processing)
┌────────────────────────────────┐
│  ✨                            │
│     Extracting themes...       │ ← Purple glow pulses (2s cycle)
│                                │    Sparkle icon pulses
│  ● ● ● ○ ○                    │ ← Dots fill sequentially
└────────────────────────────────┘

SUCCESS CELEBRATION
        ✓
┌────────────────────────────────┐
│  Analysis Complete!            │ ← Slides down from top
│  You saved 8 hours             │    (bounce easing)
│                                │
│  🎊 🎊 🎊 🎊 🎊               │ ← Confetti falls
└────────────────────────────────┘

SKELETON LOADING
┌────────────────────────────────┐
│ ████████                       │
│ ████████████████               │ ← Shimmer animation
│ ██████████████████             │    moves left to right
│ [████████████]                 │    (1.5s infinite)
└────────────────────────────────┘
```

---

## Responsive Breakpoints

```
MOBILE (< 768px)
┌─────────────┐
│   1 column  │
│   Stack all │
│   Bottom nav│
│   44px touch│
└─────────────┘

TABLET (768px - 1024px)
┌───────────────────────┐
│     2 columns         │
│     Side margins 24px │
│     16px gap          │
└───────────────────────┘

DESKTOP (> 1024px)
┌─────────────────────────────────┐
│        3+ columns               │
│        Max width 1280px         │
│        32px side margins        │
│        24px gap                 │
└─────────────────────────────────┘
```

---

## SEA Cultural Considerations

### Safe Colors Across SEA

```
✅ UNIVERSAL
Blue (Trust) • Purple (Innovation) • Green (Success)

⚠️ USE WITH CARE
Red (Luck vs Danger) • Yellow (Royalty in Thailand)

✅ WARMTH
Orange (Energy, optimistic) • Rounded corners, friendly icons
```

### Language Support

```
English:        Turn 8-hour analysis into 5 minutes
Bahasa Indo:    Ubah analisis 8 jam menjadi 5 menit
Filipino:       Gawing 5 minuto ang 8 oras na analisis

Code-mixing:    "Sobrang fast talaga, saves time!"
                (Taglish - common in PH)

Design: Preserve both scripts in same line, Inter font supports all
```

---

## Component Checklist

When creating a new component:

```
[ ] Default state designed
[ ] Hover state (desktop)
[ ] Active/pressed state
[ ] Focus state (keyboard navigation)
[ ] Disabled state
[ ] Loading state (if applicable)
[ ] Error state (if applicable)
[ ] Success state (if applicable)
[ ] Empty state (if applicable)
[ ] Mobile responsive (< 768px)
[ ] Tablet responsive (768-1024px)
[ ] Touch targets ≥ 44px (mobile)
[ ] Keyboard navigation works
[ ] Screen reader accessible
[ ] Color contrast ≥ 4.5:1 (text)
[ ] Animations respect prefers-reduced-motion
[ ] Design tokens used (no hardcoded values)
```

---

## Final Notes

### The Qual Engine Visual DNA:

1. **SPEED IS EVERYWHERE**
   - Fast animations (150-250ms)
   - Progress indicators
   - Time-saved metrics prominent
   - Speed gradient on key elements

2. **TRUSTWORTHY THROUGH TRANSPARENCY**
   - Evidence always visible
   - Source citations
   - Clear AI processing steps
   - Human-in-the-loop feeling

3. **MOBILE-FIRST, SEA-NATIVE**
   - 44px touch targets
   - Bottom navigation
   - Warm, not cold
   - Code-mixing support

4. **CELEBRATE SUCCESS**
   - Time-saved moments
   - Bounce animations
   - Confetti (subtle)
   - Encouraging copy

### When Someone Sees Qual Engine:

"That looks FAST, SMART, and PROFESSIONAL.
Built for me, not some Western market I don't care about."

---

**End of Visual Showcase**

For implementation details, see:
- `/DESIGN_SYSTEM.md` - Complete design system documentation
- `/DESIGN_IMPLEMENTATION_GUIDE.md` - Developer guide with code examples
- `/frontend/src/styles/` - CSS tokens and components

Questions? design@qualengine.com
