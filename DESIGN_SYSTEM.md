# Qual Engine - Visual Identity & Design System

**Created:** 2026-06-25
**Version:** 1.0
**Target Market:** Southeast Asian Research Professionals
**Brand Essence:** Fast, Smart, Trustworthy, Built for SEA

---

## 1. BRAND IDENTITY

### Core Visual Strategy

Qual Engine's visual identity communicates **SPEED** and **INTELLIGENCE** while remaining approachable and trustworthy. We differentiate from cold enterprise tools (Dovetail) and international-first platforms (CoLoop) through:

- **Speed-first visual language** - Motion, gradients, and dynamic elements that suggest velocity
- **SEA warmth** - Professional but not cold; colors that work across cultures
- **Trust through clarity** - Clean layouts, generous whitespace, transparent AI processes
- **Mobile-first refinement** - Touch-friendly, readable on small screens

### Brand Personality

- **Fast** - Lightning bolt energy, quick transitions, immediate feedback
- **Smart** - AI-powered but human-guided, sophisticated yet accessible
- **Trustworthy** - Evidence-based, source-traceable, transparent processing
- **SEA-native** - Understands code-mixing, local workflows, regional nuances

---

## 2. COLOR PALETTE

### Primary Palette (Speed & Intelligence)

```
Velocity Blue (Primary Action)
#0A7AFF - Main CTA, links, progress indicators
RGB: 10, 122, 255
Tints: #3D95FF (hover), #75B3FF (light), #D4E8FF (ultra-light)
Shades: #0861CC (pressed), #064A99 (deep)

Use: Primary buttons, active states, progress bars, time-saved highlights
Cultural Note: Blue = trust, technology across all SEA markets
```

```
Neural Purple (AI/Intelligence)
#7B4FFF - AI processing, analysis in progress, smart features
RGB: 123, 79, 255
Tints: #9975FF (hover), #BFA5FF (light), #EDE4FF (ultra-light)
Shades: #623FCC (pressed), #4A2F99 (deep)

Use: AI badges, processing states, "magic" moments, theme extraction
Cultural Note: Purple = wisdom, innovation; no negative connotations in SEA
```

```
Speed Gradient (Hero, Time-Saved Moments)
Linear: #0A7AFF → #7B4FFF (45deg)
Use: Hero sections, celebration moments, "X hours saved" displays
```

### Secondary Palette (Existing + Enhanced)

```
Petrol (Existing - Keep for Completion States)
#0F4C45 - Success, completed analyses, verified data
Tints: #2A6B63, #E8F3F1 (light bg)
Use: Success states, completion badges, trust indicators
```

```
Amber (Existing - Keep for Processing)
#C8881E - In-progress, pending, warnings
Tints: #D6A04F, #FDF5E6 (light bg)
Use: Processing states, pending uploads, time estimates
```

```
Sunset Orange (SEA Warmth)
#FF6B35 - Warm accents, highlights, energy
RGB: 255, 107, 53
Use: Accent highlights, notification badges, feature callouts
Cultural Note: Orange = energy, optimism across SEA
```

### Neutrals (Editorial Foundation)

```
Ink (Text)
#17191C - Primary text, headings

Charcoal
#2C2E33 - Secondary text, labels

Slate
#6B6F76 - Muted text, helper text, timestamps

Paper (Body Background)
#F4F3EE - Main background (warm, reduces eye strain)

Sheet (Card Background)
#FCFCFA - Cards, panels, elevated surfaces

Hairline
#E2E0D9 - Borders, dividers

Cloud
#F8F9FA - Subtle backgrounds, hover states
```

### Semantic Colors

```
Success
#10B981 - Completed, verified, uploaded successfully
Background: #D1FAE5

Error
#EF4444 - Failed, rejected, critical issues
Background: #FEE2E2

Warning
#F59E0B - Caution, review needed, approaching limits
Background: #FEF3C7

Info
#3B82F6 - Tips, information, guidance
Background: #DBEAFE
```

### Data Visualization Palette

```
Theme Colors (For Analysis Grids)
#0A7AFF (Blue) - Theme 1
#7B4FFF (Purple) - Theme 2
#10B981 (Green) - Theme 3
#FF6B35 (Orange) - Theme 4
#EC4899 (Pink) - Theme 5
#F59E0B (Amber) - Theme 6
#06B6D4 (Cyan) - Theme 7
#8B5CF6 (Violet) - Theme 8

Sentiment Colors
Positive: #10B981 (Green)
Neutral: #6B7280 (Gray)
Negative: #EF4444 (Red)
Mixed: #F59E0B (Amber)
```

---

## 3. TYPOGRAPHY

### Font Stack

```css
/* UI & Body Copy */
--font-sans: 'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont,
             'Segoe UI', 'Roboto', 'Noto Sans', sans-serif;

/* Display & Headlines */
--font-display: 'Cal Sans', 'Inter', system-ui, sans-serif;

/* Code, Labels, Metrics */
--font-mono: 'IBM Plex Mono', 'SF Mono', 'Monaco', 'Consolas', monospace;

/* Quotes, Transcripts */
--font-serif: 'Newsreader', 'Georgia', 'Times New Roman', serif;
```

### Type Scale (Mobile-First)

```
Display XL
Font: Cal Sans / Display
Mobile: 32px / 1.1 / -0.02em / 700
Desktop: 56px / 1.1 / -0.03em / 700
Use: Landing hero, major feature announcements

Display L
Mobile: 28px / 1.2 / -0.02em / 700
Desktop: 44px / 1.2 / -0.02em / 700
Use: Page headers, dashboard greeting

Display M
Mobile: 24px / 1.3 / -0.01em / 600
Desktop: 36px / 1.3 / -0.02em / 600
Use: Section headers, modal titles

Heading L
Mobile: 20px / 1.4 / -0.01em / 600
Desktop: 28px / 1.4 / -0.01em / 600
Use: Card headers, panel titles

Heading M
Mobile: 18px / 1.4 / 0 / 600
Desktop: 22px / 1.4 / -0.01em / 600
Use: List headers, subsections

Heading S
Mobile: 16px / 1.5 / 0 / 600
Desktop: 18px / 1.5 / 0 / 600
Use: Item titles, small headers

Body L
Mobile: 16px / 1.6 / 0 / 400
Desktop: 18px / 1.7 / 0 / 400
Use: Main content, descriptions

Body M (Base)
Mobile: 14px / 1.6 / 0 / 400
Desktop: 16px / 1.6 / 0 / 400
Use: Standard UI text, labels

Body S
Mobile: 13px / 1.5 / 0 / 400
Desktop: 14px / 1.5 / 0 / 400
Use: Helper text, captions

Label (Mono)
Font: IBM Plex Mono
Mobile: 11px / 1.4 / 0.08em / 500 / UPPERCASE
Desktop: 12px / 1.4 / 0.08em / 500 / UPPERCASE
Use: Eyebrows, status labels, metrics

Micro
Mobile: 11px / 1.4 / 0 / 400
Desktop: 12px / 1.4 / 0 / 400
Use: Timestamps, tiny labels
```

### Readability Optimizations for SEA

```
- Latin + SEA scripts: Use Inter (excellent Thai/Vietnamese support)
- Code-mixed text: Preserve both scripts cleanly in same line
- Mobile-first line heights: 1.6-1.7 for easy scanning
- CJK fallbacks: 'Noto Sans CJK', 'Microsoft YaHei' for Chinese
- Maximum line length: 65-75 characters for readability
```

---

## 4. SPACING & LAYOUT SYSTEM

### Spacing Scale (8px base)

```
4px   - xs   - Icon gaps, tight padding
8px   - sm   - Form field spacing, compact lists
12px  - md   - Card padding (mobile), button padding
16px  - lg   - Default gap, section spacing
24px  - xl   - Card padding (desktop), between sections
32px  - 2xl  - Major section gaps
48px  - 3xl  - Page section dividers
64px  - 4xl  - Hero spacing, major breaks
96px  - 5xl  - Page top/bottom padding
```

### Grid System

```
Mobile (< 768px)
- 1 column
- 16px side margins
- 12px gap between cards

Tablet (768px - 1024px)
- 2 columns
- 24px side margins
- 16px gap between cards

Desktop (> 1024px)
- 12-column grid (max-width: 1280px)
- 32px side margins
- 24px gap between cards
- Center-aligned content
```

### Container Widths

```
Full Width: 100%
Content: 1280px (main app content)
Reading: 720px (reports, long-form)
Narrow: 560px (modals, forms)
XS: 420px (auth cards)
```

---

## 5. COMPONENT LIBRARY

### Buttons

```tsx
// Primary (Speed/Action)
<button className="btn-primary">
  Start Analysis
</button>

Styles:
- Background: Velocity Blue (#0A7AFF)
- Text: White, 15px, 600 weight
- Padding: 12px 24px (mobile), 14px 28px (desktop)
- Border-radius: 10px
- Hover: Scale 1.02, background #3D95FF
- Active: Scale 0.98
- Loading: Show spinner, opacity 0.7, disabled
- Transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)

// Secondary (Ghost)
<button className="btn-secondary">
  Cancel
</button>

Styles:
- Background: Transparent
- Border: 1.5px solid Hairline (#E2E0D9)
- Text: Charcoal (#2C2E33)
- Hover: Border = Ink, background = Cloud

// AI/Smart Action
<button className="btn-ai">
  Extract Themes
</button>

Styles:
- Background: Neural Purple gradient
- Icon: Sparkle/Wand (lucide-react)
- Glow effect on hover

// Sizes
btn-sm: 10px 18px, 14px text
btn-md: 12px 24px, 15px text (default)
btn-lg: 14px 32px, 16px text

// States
disabled: opacity 0.5, cursor not-allowed
loading: spinner + "Processing..."
```

### Cards

```tsx
// Base Card
<div className="card">
  <div className="card-header">
    <h3>Project Name</h3>
    <StatusBadge status="active" />
  </div>
  <div className="card-body">
    ...content...
  </div>
  <div className="card-footer">
    <button>View Details</button>
  </div>
</div>

Styles:
- Background: Sheet (#FCFCFA)
- Border: 1px solid Hairline (#E2E0D9)
- Border-radius: 16px (mobile), 20px (desktop)
- Padding: 16px (mobile), 24px (desktop)
- Shadow: 0 2px 8px rgba(23, 25, 28, 0.04)
- Hover: Shadow 0 4px 16px rgba(23, 25, 28, 0.08), translate -2px
- Transition: all 0.25s ease

// Elevated Card (Modals, Important)
card-elevated:
- Shadow: 0 8px 32px rgba(23, 25, 28, 0.12)
- Border: none
- Backdrop: blur(8px)

// Interactive Card (Clickable)
card-interactive:
- Cursor: pointer
- Scale: 1.01 on hover
- Active feedback: scale 0.99
```

### Inputs & Forms

```tsx
// Text Input
<div className="field">
  <label className="field-label">
    <span>Project Name</span>
    <span className="field-hint">Give it a descriptive name</span>
  </label>
  <input
    type="text"
    className="input"
    placeholder="Q3 2026 Focus Groups"
  />
</div>

Styles:
- Height: 44px (mobile), 48px (desktop)
- Padding: 12px 16px
- Border: 1.5px solid Hairline
- Border-radius: 10px
- Font: 15px, -apple-system font smoothing
- Focus: Border = Velocity Blue, shadow 0 0 0 4px #D4E8FF
- Error: Border = Error red, shadow error tint
- Disabled: Background #F8F9FA, cursor not-allowed

// Textarea
textarea.input:
- Min-height: 120px
- Resize: vertical
- Font: Newsreader serif (for content input)

// Select
select.input:
- Arrow icon: Custom SVG
- Options: 48px height each
```

### Status Indicators

```tsx
// Status Badge
<span className="badge-success">Completed</span>
<span className="badge-processing">Analyzing...</span>
<span className="badge-error">Failed</span>

Styles:
- success: Green bg (#D1FAE5), green text (#10B981)
- processing: Amber bg (#FEF3C7), amber text (#F59E0B)
- error: Red bg (#FEE2E2), red text (#EF4444)
- Padding: 6px 12px
- Border-radius: 6px
- Font: 12px, 600 weight, mono

// Status Dot
<div className="status-dot-success"></div>

Styles:
- Size: 8px circle
- Animated pulse for processing states
- Colors match semantic palette
```

### Progress Indicators

```tsx
// Linear Progress (Speed Emphasis)
<div className="progress-bar">
  <div className="progress-fill" style={{width: '65%'}}>
    <span className="progress-label">65% • 2m 15s remaining</span>
  </div>
</div>

Styles:
- Height: 8px (mobile), 10px (desktop)
- Background: Cloud (#F8F9FA)
- Fill: Speed gradient (Blue → Purple)
- Border-radius: 999px
- Animated: Moving gradient for processing
- Label: Above bar, mono font, 12px

// Circular Progress (Loading)
<div className="spinner">
  <svg>...</svg>
</div>

Styles:
- Size: 24px (sm), 40px (md), 64px (lg)
- Color: Velocity Blue
- Animation: 0.8s linear infinite rotate
- Thickness: 3px
```

---

## 6. ANIMATIONS & MICRO-INTERACTIONS

### Core Principles

1. **Speed Perception** - Fast transitions (150-250ms) reinforce brand promise
2. **Purposeful Motion** - Every animation communicates state or progress
3. **Performance First** - Use transforms/opacity, avoid layout shifts
4. **Accessibility** - Respect prefers-reduced-motion

### Timing Functions

```css
/* Speed Curve (Default) */
--ease-speed: cubic-bezier(0.4, 0, 0.2, 1);
/* 150ms for micro-interactions */

/* Bounce (Celebrations) */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
/* 400ms for success moments */

/* Smooth (Page transitions) */
--ease-smooth: cubic-bezier(0.4, 0, 0.6, 1);
/* 300ms for page/view changes */

/* Entrance */
--ease-entrance: cubic-bezier(0, 0, 0.2, 1);
/* 250ms for content appearing */

/* Exit */
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
/* 200ms for content leaving */
```

### Key Animations

#### 1. Upload Progress (Emphasize Speed)

```
State: File selected
Animation:
- File preview fades in (200ms ease-entrance)
- Progress bar appears (150ms ease-speed)
- Gradient moves along bar (1.5s linear infinite)
- Time estimate updates every second
- On completion: Checkmark bounce (400ms ease-bounce)
- Success glow pulse (800ms, 2 cycles)

Visual:
- Speed gradient fills from left
- Time saved counter increments visibly
- "3x faster than manual" badge appears
```

#### 2. Theme Extraction (AI Magic)

```
State: Analysis started
Animation:
- Modal opens with backdrop blur (250ms ease-smooth)
- Neural Purple glow pulses around content (2s infinite)
- Particle effect: Small dots move upward (subtle, 3s stagger)
- Progress: "Analyzing..." → "Extracting themes..." → "Generating insights..."
- Each phase: Icon morphs + text crossfade (300ms)

On completion:
- Modal content slides up, fades out (250ms ease-exit)
- Results grid fades in row-by-row (stagger 80ms each)
- Each theme card: Slide up + fade (300ms ease-entrance)
```

#### 3. Time Saved Celebration

```
Trigger: Analysis complete
Animation:
- Large time-saved number scales in (500ms ease-bounce)
- Background: Subtle confetti particles fall (2s)
- Gradient shimmer across "8 hours saved" text (1.5s)
- CTA button pulses gently (1s ease-smooth, 3 cycles)

Visual:
- Before/After comparison slides in
- Savings meter fills with speed gradient
```

#### 4. Page Transitions

```
Route Change:
- Old content: Fade out + slight scale down (200ms ease-exit)
- New content: Fade in + slide up 20px (300ms ease-entrance, delay 100ms)
- Preserve scroll position on back navigation

Smooth, never jarring
```

#### 5. Hover States

```
Cards:
- Translate: -2px Y
- Shadow: Increase blur + spread
- Duration: 200ms ease-speed
- Transform: scale(1.01)

Buttons:
- Primary: Scale 1.02, shadow glow
- Secondary: Border color transition, background tint
- Duration: 150ms ease-speed

Links:
- Underline slides in from left (200ms ease-speed)
- Color: Velocity Blue
```

#### 6. Loading States (Don't Feel Slow)

```
Strategy: Optimistic UI + Skeleton screens

Skeleton:
- Base: Cloud gray (#F8F9FA)
- Shimmer: Linear gradient animation (1.5s infinite)
- Blur edges for organic feel
- Match actual content dimensions

Inline spinners:
- Small (16px), subtle
- Only for actions taking > 500ms
- Always show progress text: "Loading...", "Saving...", "Analyzing..."
```

### Performance Budget

```
- Page transition: < 300ms
- Micro-interaction: < 200ms
- Upload feedback: Instant (0ms perceived)
- 60fps minimum for all animations
- GPU-accelerated (transform, opacity only)
- Lazy-load heavy animations (Lottie files)
```

---

## 7. KEY UI PATTERNS

### Dashboard (Speed & Time-Savings Front-Center)

```
Layout:
┌─────────────────────────────────────────┐
│ Welcome back, Sarah                      │
│ You've saved 127 hours this month        │ ← Hero metric
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│ │ 12 hrs  │ │ 45 mins │ │ 8 proj. │    │ ← Stat cards
│ │ saved   │ │ avg time│ │ active  │    │
│ └─────────┘ └─────────┘ └─────────┘    │
├─────────────────────────────────────────┤
│ Quick Actions                            │
│ [+ New Project] [Upload Recording]       │
├─────────────────────────────────────────┤
│ Recent Projects                          │
│ [Project Card] [Project Card] ...        │
└─────────────────────────────────────────┘

Design Details:
- Time saved: Display XL, Speed gradient text
- Stats: Neural Purple icons, mono numbers
- Cards: Grid, hover lift effect
- Empty state: Friendly illustration + clear CTA
```

### Upload Flow (Speed Showcase)

```
Step 1: File Selection
- Drag-drop zone: Dashed border, cloud upload icon
- Supported formats visible: "Audio, Video, .docx, .txt"
- Max size: "Up to 2GB per file"

Step 2: Upload Progress
- Large progress bar with speed gradient
- Time estimate: "2 minutes remaining"
- Speed indicator: "15 MB/s • 65% complete"
- Preview: File thumbnail + metadata

Step 3: Processing
- Auto-transition after upload
- "Transcribing audio..." with Neural Purple glow
- Estimated completion: Real-time countdown
- Background: Can navigate away, notification when done

Step 4: Success
- Checkmark animation (bounce)
- "Ready in 3 minutes - That's 8x faster than manual!"
- CTA: "Start Analysis" (Primary button, pulsing)
```

### Analysis Grid (Powerful but Not Overwhelming)

```
Layout:
┌──────────────┬──────────┬──────────┬──────────┐
│ Theme / Part │ Person A │ Person B │ Person C │
├──────────────┼──────────┼──────────┼──────────┤
│ Theme 1      │ Summary  │ Summary  │ Summary  │
│ Trust        │ + 3 ev.  │ + 5 ev.  │ + 2 ev.  │
├──────────────┼──────────┼──────────┼──────────┤
│ Theme 2      │ ...      │ ...      │ ...      │
└──────────────┴──────────┴──────────┴──────────┘

Features:
- Fixed header row (sticky on scroll)
- Theme colors: Left border stripe per theme
- Evidence count: Clickable, opens Evidence Panel
- Cell hover: Slight lift, shows full text preview
- Empty cells: Subtle "No data" with light gray bg
- Export: CSV button, downloads formatted grid

Mobile:
- Horizontal scroll for columns
- Collapsible rows
- Tap cell → Full screen view
```

### Evidence Panel (Build Trust)

```
Trigger: Click evidence count in grid

Panel:
┌─────────────────────────────────────┐
│ Evidence for "Trust" - Participant A │
│ ✕ Close                              │
├─────────────────────────────────────┤
│ "I really trust this brand because   │ ← Quote (serif)
│  they've been around for years."     │
│                                      │
│ Speaker: Participant A • 02:34       │ ← Metadata (mono)
│ [Play Audio Clip]                    │ ← Playback CTA
├─────────────────────────────────────┤
│ "The security features make me feel  │
│  safe using their app."              │
│                                      │
│ Speaker: Participant A • 08:12       │
│ [Play Audio Clip]                    │
├─────────────────────────────────────┤
│ + 1 more evidence                    │
└─────────────────────────────────────┘

Design:
- Slide in from right (300ms ease-smooth)
- Backdrop blur overlay
- Quotes: Newsreader serif, 16px, highlighted with theme color
- Timestamps: Clickable, jumps to that moment in transcript
- Play button: Immediate playback, waveform visualization
- Mobile: Full-screen overlay
```

### Time-Saving Calculator (Interactive Landing Page)

```
Section:
┌─────────────────────────────────────────┐
│ How much time will Qual Engine save you?│
├─────────────────────────────────────────┤
│ Interviews per month: [Slider: 1-50]    │ ← Interactive
│ Hours per interview: [Slider: 1-12]     │
├─────────────────────────────────────────┤
│ Manual Analysis Time:                   │
│ 240 hours/month                         │ ← Real-time calc
│                                         │
│ With Qual Engine:                       │
│ 30 hours/month ⚡                       │
│                                         │
│ You'll save:                            │
│ 210 HOURS                               │ ← Big, gradient
│ That's 26 working days!                 │
├─────────────────────────────────────────┤
│ [Start Free Trial]                      │
└─────────────────────────────────────────┘

Interaction:
- Sliders: Real-time update, smooth animation
- Numbers: Count up animation when changed
- Savings: Speed gradient, pulse effect
- CTA: Primary button, always visible
```

### Before/After Comparison

```
Split View:
┌──────────────────┬──────────────────┐
│ Manual Analysis  │ With Qual Engine │
├──────────────────┼──────────────────┤
│ ⏱ 8 hours        │ ⚡ 5 minutes      │
│ 📊 Basic themes  │ 🎯 Deep insights │
│ 📝 Manual notes  │ 🤖 AI-powered    │
│ 🔍 Hard to find  │ 🔎 Instant search│
│ 😰 Tedious       │ 😊 Enjoyable     │
└──────────────────┴──────────────────┘

Visual:
- Side-by-side on desktop, stacked on mobile
- Left: Grayscale, slower animations
- Right: Full color, speed gradient accents
- Divider: Animated vertical line with arrows
- Hover each side: Slight tilt toward that side
```

---

## 8. LAYOUT PATTERNS FOR KEY SCREENS

### Landing Page Hero

```
Layout:
┌─────────────────────────────────────────┐
│         NAVIGATION (sticky)              │
├─────────────────────────────────────────┤
│                                          │
│   Turn 8-hour analysis into 5 minutes   │ ← Display XL
│                                          │
│   AI-powered qualitative research        │ ← Body L
│   platform built for Southeast Asia      │
│                                          │
│   [Start Free Trial] [Watch Demo]        │ ← CTAs
│                                          │
│   ┌──────────────────────────┐          │
│   │  Product Screenshot       │          │ ← Animated
│   │  (Dashboard with metrics) │          │   scrolling
│   └──────────────────────────┘          │
│                                          │
└─────────────────────────────────────────┘

Design:
- Background: Subtle gradient (Paper → lighter Paper)
- Speed gradient: Behind headline (blur, low opacity)
- Screenshot: Slight perspective tilt, shadow depth
- Animated: Gradient shifts slowly, screenshot parallax scroll
- Trust badges: "ISO 27001 • PDPA Compliant • SEA Data Residency"
```

### Project Dashboard (Mobile-First)

```
Mobile Layout:
┌─────────────────┐
│ ☰  Qual Engine  │ ← Header
├─────────────────┤
│ Projects (12)   │ ← Title + Count
│ [+ New]         │
├─────────────────┤
│ ┌─────────────┐ │
│ │ Project 1   │ │ ← Card
│ │ 5 trans.    │ │
│ │ Active      │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ Project 2   │ │
│ └─────────────┘ │
└─────────────────┘

Desktop Layout:
┌──────┬────────────────────────────────┐
│      │ Projects                        │
│ Nav  │ [Search] [Filter] [+ New]       │
│ ─    ├────────────────────────────────┤
│ Proj │ ┌──────┐ ┌──────┐ ┌──────┐     │
│ KB   │ │ Proj │ │ Proj │ │ Proj │     │ ← 3-col grid
│ Set  │ └──────┘ └──────┘ └──────┘     │
│      │ ┌──────┐ ┌──────┐              │
│      │ │ Proj │ │ Proj │              │
│      │ └──────┘ └──────┘              │
└──────┴────────────────────────────────┘

Features:
- Side nav: Collapsible on desktop, hamburger on mobile
- Grid: Responsive (3 → 2 → 1 cols)
- Cards: Lift on hover, smooth transitions
- Empty state: Large icon, "Create your first project"
```

### Transcript Viewer (Reading Experience)

```
Layout:
┌──────────────────────────────────────┐
│ Transcript: Q3 Focus Group 1         │
│ [Export] [Edit] [Translate]          │
├──────────────────────────────────────┤
│ ┌────────────────────────────┐       │
│ │ 00:00:34 Moderator          │       │
│ │ "Tell me about your         │       │ ← Speaker turn
│ │  experience with..."        │       │
│ │ [Play]                      │       │
│ └────────────────────────────┘       │
│ ┌────────────────────────────┐       │
│ │ 00:01:12 Participant A      │       │
│ │ "I've been using it for     │       │
│ │  about 3 months now and..." │ ← Highlighted
│ │ [Play] [Mark as Evidence]   │   (theme color)
│ └────────────────────────────┘       │
└──────────────────────────────────────┘

Design:
- Font: Newsreader serif for transcript text
- Speakers: Bold, with avatar/initial circle
- Timestamps: Mono, clickable to play audio
- Highlighting: Theme colors with low opacity bg
- Line height: 1.75 for easy reading
- Max width: 720px for readability
- Sticky header with controls
```

### Modal Patterns

```
Standard Modal:
┌─────────────────────────────────────┐
│ ◀ Back         Create Project    ✕ │ ← Header
├─────────────────────────────────────┤
│                                     │
│ [Form Fields]                       │ ← Body
│                                     │
│                                     │
├─────────────────────────────────────┤
│          [Cancel] [Create Project]  │ ← Footer
└─────────────────────────────────────┘

Overlay:
- Backdrop: rgba(23, 25, 28, 0.5), blur(4px)
- Modal: Max-width 560px, centered
- Entry: Scale 0.95 → 1 + fade in (250ms)
- Exit: Scale 1 → 0.98 + fade out (200ms)
- Mobile: Full screen slide up from bottom
- Focus trap: Keyboard navigation contained
- ESC to close, click backdrop to close
```

---

## 9. EYE-CATCHING ELEMENTS

### Hero Section (Landing Page)

```
Component: <HeroSection />

Visual:
- Gradient mesh background (Blue → Purple, animated)
- 3D floating elements: Cards, charts, upload icons (subtle parallax)
- Headline: Display XL with gradient text fill
- Subheadline: Body L, muted color
- CTAs: Primary + Ghost, generous spacing
- Product screenshot: Perspective tilt, auto-scroll demo
- Animated metrics: "210 hours saved" counts up on view

Implementation:
- Intersection Observer for count-up trigger
- requestAnimationFrame for smooth counts
- GPU-accelerated transforms for 3D elements
- Lazy-load background elements
```

### Time-Saved Badge (Throughout App)

```
Component: <TimeSavedBadge time={480} />

Visual:
┌──────────────────────┐
│ ⚡ 8 Hours Saved      │ ← Large, gradient text
│ vs. manual analysis  │ ← Small, muted
└──────────────────────┘

Styles:
- Background: Speed gradient, 20% opacity
- Border: 2px gradient stroke
- Icon: Lightning bolt, animated pulse
- Number: Display M, mono font
- Appears on: Analysis complete, dashboard cards
- Animation: Scale bounce on first render
```

### Social Proof Section

```
Component: <SocialProofGrid />

Layout:
┌────────────────────────────────────┐
│ Trusted by 500+ research teams     │
│ across Southeast Asia              │
├────────────────────────────────────┤
│ ⭐⭐⭐⭐⭐ 4.9/5                     │
│ "Cut our analysis time by 85%"     │ ← Testimonial
│ — Sarah Chen, Research Director    │   cards
├────────────────────────────────────┤
│ [Logo] [Logo] [Logo] [Logo]        │ ← Client logos
└────────────────────────────────────┘

Features:
- Testimonial carousel: Auto-rotate, swipe on mobile
- Star ratings: Animated fill on scroll into view
- Logos: Grayscale, color on hover
- Stats: "500+ projects • 10,000+ hours saved"
```

### Pricing Cards

```
Component: <PricingTier />

Layout:
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Starter      │ │ Pro ⭐       │ │ Enterprise   │
│ $79/mo       │ │ $199/mo      │ │ Custom       │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ 5 projects   │ │ 25 projects  │ │ Unlimited    │
│ 3 seats      │ │ 10 seats     │ │ Unlimited    │
│ 600 min/mo   │ │ 3,000 min/mo │ │ Custom       │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ [Start Free] │ │ [Start Free] │ │ [Contact Us] │
└──────────────┘ └──────────────┘ └──────────────┘

Design:
- Recommended: Gradient border, slight elevation
- Hover: Scale 1.03, shadow increase
- Feature list: Checkmarks, mono labels
- CTA: Primary for recommended, secondary for others
- Value highlight: "Most popular" badge
- Mobile: Horizontal scroll, snap to card
```

### Feature Showcase (Interactive)

```
Component: <FeatureShowcase />

Layout:
┌────────────────────────────────────┐
│ Tabs: [Upload] [Analyze] [Report]  │ ← Tab navigation
├────────────────────────────────────┤
│ ┌──────────────┐  Upload           │
│ │ Screenshot   │  Smart, Fast      │ ← Split view
│ │ (animated)   │                   │
│ │              │  Drag & drop or   │
│ └──────────────┘  browse files...  │
└────────────────────────────────────┘

Interaction:
- Tab switch: Content crossfade + screenshot change
- Screenshot: Actual app UI, subtle hover interactions
- Auto-rotate tabs every 5s (pause on hover)
- Mobile: Stacked, screenshots full-width
```

---

## 10. SEA CULTURAL CONSIDERATIONS

### Color Meanings Across SEA

```
✅ Safe Colors:
- Blue (#0A7AFF): Universal trust, technology
- Purple (#7B4FFF): Innovation, wisdom (positive everywhere)
- Green (#10B981): Success, growth, prosperity
- Orange (#FF6B35): Energy, optimism (warm, friendly)

⚠️ Use with Care:
- Red: Luck in Chinese cultures, danger in others
  Solution: Use for errors only, not primary actions
- White: Purity but also mourning in some contexts
  Solution: Use off-white (Paper #F4F3EE) for backgrounds
- Yellow: Royalty (Thailand), caution elsewhere
  Solution: Use amber for warnings, not primary brand

Cultural Adaptations:
- Indonesia: Green = Islam, use appropriately
- Thailand: Yellow = monarchy, avoid as primary
- Vietnam: Red + gold = festive, use in celebrations only
- Philippines: Bright colors = welcomed, can be bolder
- Singapore: Professional restraint, not too flashy
```

### Icon & Symbol Choices

```
✅ Universal Icons (Clear across SEA):
- Upload: Cloud with up arrow
- Success: Checkmark, thumbs up
- Error: X, exclamation mark
- Speed: Lightning bolt, rocket
- AI: Sparkle, brain, wand
- Time: Clock, stopwatch
- Search: Magnifying glass
- Settings: Gear
- User: Person silhouette

❌ Avoid (Cultural confusion):
- Hand gestures (meanings vary)
- Animal symbols (different connotations)
- Religious symbols
- Flags (sensitive in mixed markets)

SEA-Specific:
- WhatsApp icon: Very familiar, use for integrations
- Mobile-first icons: Phone, SMS recognized
- Voice: Microphone (voice notes popular in SEA)
```

### Professional but Warm (Not Cold Enterprise)

```
Visual Balance:
- Professional: Clean layouts, clear hierarchy, data-driven
- Warm: Rounded corners (not sharp), friendly microcopy, human photos

Tone Comparisons:
❄️ Cold (Western Enterprise):
"Optimize qualitative data workflows"
☀️ Warm (SEA-Friendly):
"Turn hours of interviews into insights in minutes"

❄️ Cold: "Leverage AI-powered thematic extraction"
☀️ Warm: "Let AI find the themes while you focus on insights"

UI Warmth:
- Illustrations: Hand-drawn feel, not corporate stock
- Empty states: Friendly, encouraging ("No projects yet - let's create one!")
- Error messages: Helpful, not blaming ("Oops, something went wrong. Let's try again.")
- Success messages: Celebratory ("Amazing! Your analysis is ready.")
```

### Mobile-First Design (85% SEA Mobile Usage)

```
Priorities:
1. Touch targets: Minimum 44x44px
2. Thumb zone: Important actions in bottom third
3. One-handed use: Nav at bottom, hamburger reachable
4. Readable text: Minimum 14px, high contrast
5. Fast loading: Lazy-load images, critical CSS inline
6. Offline support: Cache recent projects, queue uploads
7. Data-conscious: Show upload sizes, allow quality selection

Mobile Patterns:
- Bottom navigation: Project, Search, Upload, Profile
- Swipe gestures: Back, delete, archive
- Pull-to-refresh: Update project list
- Long-press: Context menus
- Floating action button: Primary action (+ New Project)

Mobile Optimizations:
- Images: WebP, responsive srcset
- Fonts: Variable fonts for size flexibility
- Animations: Reduce on slow devices (matchMedia)
- Forms: Native inputs (tel, email), autofill-ready
```

---

## 11. DESIGN PRINCIPLES TO GUIDE DEVELOPMENT

### 1. Speed is Our Superpower

**Every design decision should reinforce the speed promise.**

✅ Do:
- Show time estimates prominently
- Use fast animations (150-250ms)
- Display "X hours saved" metrics everywhere
- Optimistic UI updates (don't wait for server)
- Progress indicators for any action > 1s
- Celebrate time-saved moments

❌ Don't:
- Long animations (> 500ms)
- Blocking modals for non-critical actions
- Hide progress feedback
- Make users wait without explanation

### 2. Trust Through Transparency

**Users need to trust AI insights are grounded in their data.**

✅ Do:
- Always show evidence sources
- Link insights to exact transcript quotes
- Display AI confidence levels
- Allow editing/correcting AI outputs
- Show processing steps ("Analyzing... Extracting... Generating...")
- Cite speaker, timestamp for every insight

❌ Don't:
- Show AI output without sources
- Hide how insights were generated
- Present AI as infallible
- Make changes without user confirmation

### 3. Mobile-First, Always

**85% of SEA users are mobile-first. Design for them.**

✅ Do:
- Design mobile layout first, then scale up
- Touch targets ≥ 44px
- Test on 375px width (iPhone SE)
- One-handed navigation
- Fast load times (< 3s on 3G)
- Offline-capable where possible

❌ Don't:
- Design desktop-first then cram into mobile
- Require two-handed use for common tasks
- Hover-only interactions
- Assume fast WiFi

### 4. Clarity Over Cleverness

**SEA users value clear, direct communication.**

✅ Do:
- Plain language, avoid jargon
- Clear labels on all actions
- Obvious CTAs (no mystery meat)
- Explain AI features simply
- Show, don't just tell (tooltips, demos)

❌ Don't:
- Overly clever microcopy
- Hidden features
- Assume users know our terminology
- Bury important actions

### 5. Delight in Details

**Micro-interactions build brand love.**

✅ Do:
- Smooth page transitions
- Satisfying button feedback
- Playful empty states
- Celebratory success animations
- Thoughtful loading states
- Polished error handling

❌ Don't:
- Generic spinners everywhere
- Abrupt state changes
- Boring empty states
- Harsh error messages

### 6. Consistency Builds Trust

**Visual consistency = professional, reliable.**

✅ Do:
- Use design tokens (colors, spacing, type)
- Component library for all UI elements
- Same patterns for similar actions
- Predictable navigation
- Standardized error/success states

❌ Don't:
- One-off component styles
- Inconsistent spacing
- Different patterns for same action
- Surprise users with layout changes

### 7. Accessibility = Inclusive Design

**Good for everyone, essential for many.**

✅ Do:
- WCAG 2.1 AA contrast ratios (4.5:1 text, 3:1 UI)
- Keyboard navigation for all features
- Screen reader-friendly markup
- Captions for all video content
- Reduce motion option (prefers-reduced-motion)
- Focus indicators visible

❌ Don't:
- Color as only differentiator
- Keyboard traps
- Missing alt text
- Auto-playing media
- Motion-only feedback

---

## 12. COMPONENT STATES CHECKLIST

For every interactive component, design these states:

### Required States

```
□ Default (Rest)
□ Hover (Desktop)
□ Active (Pressed)
□ Focus (Keyboard)
□ Disabled
□ Loading
□ Error
□ Success
```

### Example: Button States

```css
/* Default */
.btn-primary {
  background: #0A7AFF;
  color: white;
  transform: scale(1);
  transition: all 0.2s var(--ease-speed);
}

/* Hover */
.btn-primary:hover {
  background: #3D95FF;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(10, 122, 255, 0.3);
}

/* Active */
.btn-primary:active {
  transform: scale(0.98);
}

/* Focus */
.btn-primary:focus-visible {
  outline: 3px solid #D4E8FF;
  outline-offset: 2px;
}

/* Disabled */
.btn-primary:disabled {
  background: #E2E0D9;
  color: #6B6F76;
  cursor: not-allowed;
  transform: scale(1);
  box-shadow: none;
}

/* Loading */
.btn-primary.loading {
  opacity: 0.7;
  pointer-events: none;
}
.btn-primary.loading::before {
  content: '';
  /* spinner animation */
}
```

---

## 13. DARK MODE (Future Phase)

### Color Adaptations

```
Dark Palette:
- Background: #0D0E10 (deep ink)
- Surface: #1A1C1E (elevated)
- Text: #E8E9EA (off-white)
- Muted: #9CA3AF
- Borders: #2C2E33

Adjusted Colors:
- Velocity Blue: #3D95FF (lighter for dark bg)
- Neural Purple: #9975FF (lighter)
- Success: #34D399 (lighter green)
- Error: #F87171 (lighter red)

Strategy:
- Preserve brand gradients
- Increase elevation shadows (glow instead of drop)
- Reduce contrast (not pure white on black)
- Test for OLED burn-in (avoid persistent bright elements)
```

---

## 14. IMPLEMENTATION GUIDELINES

### CSS Architecture

```
Structure:
/styles
  /tokens
    colors.css
    typography.css
    spacing.css
    shadows.css
    animations.css
  /components
    button.css
    card.css
    input.css
    modal.css
    ...
  /layouts
    dashboard.css
    auth.css
    project.css
  /utilities
    spacing.css
    text.css
    flexbox.css
  main.css (imports all)

Methodology:
- CSS Custom Properties for tokens
- BEM naming (block__element--modifier)
- Mobile-first media queries
- Component-scoped styles where possible
```

### Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --color-velocity-blue: #0A7AFF;
  --color-neural-purple: #7B4FFF;
  --color-petrol: #0F4C45;
  --color-amber: #C8881E;
  --color-sunset: #FF6B35;

  --color-ink: #17191C;
  --color-charcoal: #2C2E33;
  --color-slate: #6B6F76;
  --color-paper: #F4F3EE;
  --color-sheet: #FCFCFA;
  --color-hairline: #E2E0D9;
  --color-cloud: #F8F9FA;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 24px;
  --space-2xl: 32px;
  --space-3xl: 48px;

  /* Typography */
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-display: 'Cal Sans', 'Inter', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  --font-serif: 'Newsreader', Georgia, serif;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(23, 25, 28, 0.04);
  --shadow-md: 0 4px 16px rgba(23, 25, 28, 0.08);
  --shadow-lg: 0 8px 32px rgba(23, 25, 28, 0.12);
  --shadow-xl: 0 16px 64px rgba(23, 25, 28, 0.16);

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Transitions */
  --ease-speed: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth: cubic-bezier(0.4, 0, 0.6, 1);
}

/* Dark mode (future) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-paper: #0D0E10;
    --color-sheet: #1A1C1E;
    --color-ink: #E8E9EA;
    /* ... */
  }
}
```

### React Component Pattern

```tsx
// LoadingButton.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingButton.css';

interface LoadingButtonProps {
  variant?: 'primary' | 'secondary' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function LoadingButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${loading ? 'btn--loading' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <Loader2 className="btn__spinner" />
      )}
      <span className="btn__text">{children}</span>
    </button>
  );
}
```

```css
/* LoadingButton.css */
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-family: var(--font-sans);
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s var(--ease-speed);
  white-space: nowrap;
}

.btn--primary {
  background: var(--color-velocity-blue);
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: #3D95FF;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(10, 122, 255, 0.3);
}

.btn--md {
  padding: 12px 24px;
  font-size: 15px;
}

.btn--loading {
  opacity: 0.7;
  pointer-events: none;
}

.btn__spinner {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn:disabled {
  background: var(--color-hairline);
  color: var(--color-slate);
  cursor: not-allowed;
  transform: scale(1);
}

.btn:focus-visible {
  outline: 3px solid var(--color-velocity-blue);
  outline-offset: 2px;
}
```

### Responsive Utilities

```css
/* Mobile-first breakpoints */
@media (min-width: 768px) {
  .md\:hidden { display: none; }
  .md\:grid-2 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .lg\:grid-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:text-lg { font-size: 18px; }
}
```

---

## 15. BRAND ASSETS CHECKLIST

### Logo Variations Needed

```
□ Wordmark (full color)
□ Wordmark (white)
□ Wordmark (black)
□ Icon only (app icon, favicon)
□ Icon + wordmark (horizontal)
□ Icon + wordmark (vertical)
□ Minimum size: 24px (icon), 120px (wordmark)
□ Safe area: 16px clear space
```

### Logo Concept Direction

```
Concept: "Lightning Q" or "Fast Forward Q"

Icon:
- Letter "Q" with lightning bolt integrated
- Or: Stopwatch with "Q" in center
- Or: Forward arrows forming a "Q" shape
- Style: Geometric, modern, clean lines
- Colors: Velocity Blue + Neural Purple gradient

Wordmark:
- Font: Custom based on Inter/Cal Sans
- Weight: 700 (bold)
- Letterform: Slightly condensed
- "Qual Engine" or "QualEngine" (one word)
- Optional tagline: "Research. Faster."

App Icon:
- 1024x1024 master
- Rounded square (iOS), circle (Android)
- High contrast for small sizes
- Recognizable at 16px
```

### Illustration Style

```
Approach: Semi-abstract, friendly

Characteristics:
- Rounded, organic shapes
- Speed lines, motion blur accents
- Gradient overlays (brand colors)
- 3D depth with shadows
- Hand-drawn feel (not photo-realistic)
- Diverse, inclusive people illustrations

Use Cases:
- Empty states
- Onboarding
- Error pages
- Feature showcases
- Marketing materials

Examples:
- Upload: Cloud with upward motion lines
- Analysis: Brain with connecting nodes
- Insights: Lightbulb with sparkles
- Speed: Rocket or lightning
```

### Photography Guidelines

```
If using photos:
- Real people, diverse SEA representation
- Candid, not overly posed
- Natural lighting, bright
- Workplace and mobile contexts
- Show people using product (if applicable)
- Avoid: Generic stock, all-white backgrounds, overly corporate

Treatment:
- Slight warmth adjustment
- High contrast for clarity on mobile
- Subtle overlay with brand color (5-10% opacity)
```

---

## SUMMARY: WHEN SOMEONE SEES QUAL ENGINE

### They should immediately think:

✅ **FAST** - Speed gradient, lightning motifs, time-saved metrics, snappy animations
✅ **SMART** - Neural purple accents, AI badges, evidence-based insights, clean data viz
✅ **TRUSTWORTHY** - Source citations, transparent processing, professional layout, clear hierarchy
✅ **BUILT FOR SEA** - Warm (not cold), mobile-optimized, culturally appropriate, local focus

### Visual DNA:

- **Colors:** Velocity Blue + Neural Purple speed gradient (primary), warm neutrals (foundation)
- **Type:** Inter (UI), Cal Sans (display), IBM Plex Mono (labels), Newsreader (content)
- **Motion:** Fast (150-250ms), purposeful, celebratory on success
- **Layout:** Clean, generous whitespace, mobile-first, card-based
- **Voice:** Helpful, clear, encouraging, data-driven

### Differentiation:

- **vs. Dovetail:** Warmer, faster, SEA-focused (not Western enterprise cold)
- **vs. CoLoop:** Local-first, speed-obsessed, better SEA language support
- **vs. Manual Analysis:** 8 hours → 5 minutes (always visible), AI-powered but human-guided

---

## FILE LOCATIONS

```
/frontend/src/styles/
  tokens/
    colors.css
    typography.css
    spacing.css
    animations.css
  components/
    button.css
    card.css
    input.css
    badge.css
    modal.css
    progress.css
  layouts/
    dashboard.css
    auth.css
    landing.css
  main.css

/frontend/public/
  fonts/
    Inter-*.woff2
    CalSans-*.woff2
    IBMPlexMono-*.woff2
    Newsreader-*.woff2
  icons/
    logo.svg
    logo-icon.svg
    favicon.ico
  images/
    illustrations/
    screenshots/
```

---

**Design System Version:** 1.0
**Last Updated:** 2026-06-25
**Maintained By:** UI/UX Design Team
**Questions?** Contact design@qualengine.com
