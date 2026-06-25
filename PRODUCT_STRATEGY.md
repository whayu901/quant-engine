# Qual Engine Product Strategy & Roadmap
## Building the Dominant Qualitative Research Platform for Southeast Asia

**Author**: Product Strategy
**Date**: June 2026
**Status**: Active Product Strategy
**Target Market**: Southeast Asia (Singapore, Indonesia, Malaysia, Thailand, Vietnam, Philippines)
**Primary Competitor**: coloop.ai (Western-focused)

---

## EXECUTIVE SUMMARY

Qual Engine is positioned to become the **dominant qualitative research platform in Southeast Asia** by being fundamentally built FOR the region, not retrofitted for it. While competitors like coloop.ai are English-first and international, we leverage:

1. **Native SEA language support** with code-mixing detection (Taglish, Singlish, bahasa gaul)
2. **Local compliance & data residency** (PDPA, UU PDP, Vietnam law)
3. **Regional pricing** (50% below Western competitors)
4. **Mobile-first design** (critical for SEA mobile-primary users)
5. **Local integrations** (WhatsApp, SurveyToGo, regional payment methods)

**6-Month Goal**: Establish product-market fit in Singapore & Indonesia with 5,000+ paying customers, 70%+ retention, and clear path to $5M ARR.

---

# 1. PRODUCT VISION & POSITIONING

## Vision Statement

*"Qual Engine is the AI-powered research intelligence platform built for Southeast Asia. We turn conversations (interviews, focus groups, communities, surveys) into actionable insights faster and more insightfully than any international tool—because we understand SEA's languages, cultures, regulations, and budgets."*

## Core Positioning

### **Primary**: The SEA-First Research Platform
- **Target**: Research teams, agencies, brands in Southeast Asia
- **Insight**: Competitors optimize for English/Western workflows; we optimize for SEA
- **Proof**: Native code-mixing, regional languages, local compliance, SEA pricing

### **Secondary**: The Mobile-First Alternative
- **Insight**: 75% of SEA internet is mobile; international tools assume desktop-first workflows
- **Positioning**: Designed for mobile researchers in the field, not just office workers
- **Advantage**: WhatsApp integration, field-optimized transcripts, mobile-native uploads

### **Tertiary**: The Fair-Priced Enterprise Tool
- **Insight**: Western enterprise SaaS is 3x the price of what SEA organizations can justify
- **Positioning**: Enterprise-grade features at SME prices
- **Advantage**: $49-149/user/month vs. $300-600 from Western competitors

## Differentiation Matrix vs. Coloop.ai

| Dimension | Qual Engine | Coloop.ai | Winner |
|---|---|---|---|
| **Code-mixing detection** | Yes (Taglish, Singlish, bahasa gaul) | No | Qual Engine |
| **Languages** | 6 SEA + English | English dominant | Qual Engine |
| **Data residency** | Singapore/Jakarta default | US-only | Qual Engine |
| **Mobile optimization** | Field-first, <50KB payloads | Desktop-centric | Qual Engine |
| **Pricing (SGD)** | SGD 49-199/user/mo | SGD 300-800/user/mo | Qual Engine |
| **WhatsApp integration** | Built-in | None | Qual Engine |
| **Thai/Vietnamese support** | First-class | No | Qual Engine |
| **PDPA/UU PDP compliance** | Native | Reactive | Qual Engine |
| **Real-time chat** | Yes | Yes | Tie |
| **Video analysis** | Yes | Yes | Tie |
| **API access** | Pro+ | Enterprise | Coloop |

## Why This Positioning Works

1. **No strong local competitor** → First-mover advantage in SEA
2. **Growing research spend** → IDR 500B+ annual qual spend in Southeast Asia
3. **International tools are expensive** → 70% of agencies can't afford $600/user/month
4. **Regulation tightening** → Data residency becoming mandatory
5. **Mobile adoption** → 85% of internet access in SEA is mobile
6. **Local hiring** → Researchers prefer tools with local support + compliance

---

# 2. FEATURE PRIORITIZATION MATRIX FOR FRONTEND MVP

## MoSCoW Prioritization + RICE Scoring

### **MUST HAVE (MVP Launch in 60 days)**

#### Tier 1: Core Workflows
| Feature | RICE Score | Effort (days) | Impact | Adoption | Urgency |
|---|---|---|---|---|---|
| **Login & Authentication** | 280 | 3 | Critical | 100% | P0 |
| **Project Dashboard** | 240 | 5 | Critical | 100% | P0 |
| **Transcript Upload** | 320 | 8 | Critical | 100% | P0 |
| **Transcript Viewer** (with timestamps) | 260 | 6 | Critical | 100% | P0 |
| **Basic Analysis Grid** (themes x participants) | 300 | 10 | Critical | 90% | P0 |
| **Evidence Panel** (click theme → see quotes) | 280 | 8 | Critical | 85% | P0 |
| **Export to CSV/PDF** | 200 | 5 | High | 80% | P0 |
| **Mobile-responsive layout** | 240 | 10 | Critical | 100% | P0 |

**Subtotal MUST HAVE**: 30 days of engineering effort

#### Tier 2: Essential for Core Value Loop
| Feature | RICE Score | Effort (days) | Impact | Adoption | Urgency |
|---|---|---|---|---|---|
| **Chat over transcripts** (RAG-powered) | 320 | 8 | Critical | 75% | P0 |
| **Participant management** | 200 | 4 | High | 70% | P0 |
| **Code-mixing detection badge** | 160 | 4 | Medium | 60% | P0 |
| **Language indicator** | 120 | 2 | Medium | 50% | P0 |
| **Basic billing & usage meter** | 180 | 6 | High | 85% | P1 |

**Subtotal Tier 2**: 24 days

**MVP Effort Total**: ~54 days (9 weeks with QA, testing, polish)

---

### **SHOULD HAVE (First Enhancement Cycle, 30 days post-MVP)**

| Feature | RICE Score | Effort (days) | Rationale |
|---|---|---|---|
| **Open Ends Coding** (upload CSV, AI tagging) | 280 | 10 | High-value for agencies (2nd use case) |
| **Concept Testing** (stimulus tagging) | 240 | 8 | High-value for CPG/FMCG |
| **Comparative Grid** (by market/segment) | 220 | 8 | Key differentiator: multimarket studies |
| **Video player + timestamps** | 200 | 6 | Essential for video interviews |
| **Clips & Reels** (export quotes as video) | 180 | 8 | Viral + LinkedIn shareable |
| **SEA language picker** (ID, TH, VI, TL) | 140 | 4 | Localization impact (High) |
| **Collaborative comments** | 160 | 6 | Team workflows |

---

### **COULD HAVE (Growth/Polish Phase)**

| Feature | Value | Effort | Target Timeline |
|---|---|---|---|
| **Live recorder** (Recall.ai integration) | High | 12 | Month 3 |
| **Knowledge Base** (cross-project search) | High | 10 | Month 3 |
| **Guest sharing & permissions** | Medium | 8 | Month 4 |
| **API & webhooks** | High | 10 | Month 4 (Enterprise tier) |
| **SSO (SAML/OIDC)** | Medium | 8 | Month 5 |
| **Advanced analytics dashboard** | Medium | 10 | Month 5 |
| **Workflow automation** (Zapier, n8n) | Medium | 12 | Month 5 |

---

## Frontend MVP Feature Breakdown

### **1. Authentication & Onboarding** (3 days)
```
- Sign up with email verification
- Login with JWT
- Role-based access (admin, researcher, viewer)
- Company name + language preference on signup
- Test with 3 personas: researcher, agency manager, client
```

### **2. Dashboard** (5 days)
```
- Project list with status indicators
- Quick stats: transcripts uploaded, analyses run, team members
- Recent activity feed
- Usage meter (transcription min, analyses, storage GB)
- CTA: Create new project, Upload transcript
- Mobile: Card-based layout, stacked on small screens
```

### **3. Project Management** (4 days)
```
- Create project (name, description, language, market)
- Edit project details
- Invite team members (email-based)
- Archive project
- Settings: language, data region, participants
```

### **4. Transcript Upload & Viewer** (8 days)
```
[CRITICAL FOR CORE VALUE LOOP]
- Upload: drag-drop audio/video/docx/txt
- Show transcription status + progress
- Transcript viewer:
  * Speaker turns with timestamps
  * Click timestamp → plays media (audio/video)
  * Editable text (manual correction)
  * Language indicator
  * Code-mixing detection badge ("Mixed: Bahasa + English")
- Search within transcript
- Side-by-side with analysis (on desktop)
```

### **5. Analysis Grid** (10 days)
```
[CORE VALUE LOOP]
- Create grid: select theme columns, participant rows
- Each cell shows:
  * Summary text
  * Evidence count
  * Click cell → Evidence Panel
- Evidence Panel:
  * Exact quote with timestamps
  * Speaker name
  * Play button (goto timestamp in media)
  * Copy quote button
- Export grid to CSV/PDF
- Comparative grid (by market/segment)
```

### **6. Evidence Panel** (4 days)
```
[CRITICAL FOR CREDIBILITY]
- Shows exact quotes from transcript
- Links back to timestamp
- Shows speaker + turn context
- Copy-paste ready formatting
- Timestamp link jumps to media player
```

### **7. Chat Interface** (8 days)
```
- Ask questions over current project
- Answers cite segments + evidence
- Show sources with "From Participant X, Min 3:45"
- Follow-up questions
- Save favorite Q&As
- Toggle: Thematic / Quantitative ("How many mentioned X?")
```

### **8. Mobile Optimization** (10 days, integrated throughout)
```
- Responsive breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
- Touch-friendly: bigger tap targets (48px+)
- Gesture support: swipe to next transcript
- Optimized media player (vertical video)
- Bottom sheet modals (not center modals on mobile)
- <50KB initial payload
- Offline mode for local transcripts (phase 2)
```

### **9. SEA Localization** (4 days)
```
- i18n setup (English, Bahasa Indonesia at launch)
- Language picker in header
- Currency display (IDR, SGD, MYR, THB, VND, PHP)
- Format numbers per locale
- Dropdown: Select market (Singapore, Indonesia, Malaysia, etc.)
```

### **10. Basic Billing UI** (6 days)
```
- Show current plan (Free, Starter, Pro, Enterprise)
- Usage bars:
  * Transcription: X / Y minutes used
  * Analyses: X / Y used
  * Storage: X GB / Y GB used
- Upgrade CTA with pricing table
- Monthly renewal date display
```

---

## Frontend Tech Stack (Locked)

```
Framework: Next.js 15 (App Router) + React 18
Language: TypeScript
Styling: Tailwind CSS
Charts: Recharts
Icons: Lucide React
Tables: TanStack Table (React Table)
Video: react-player
State: Zustand (or Context API)
API: TanStack Query (React Query)
Auth: JWT in localStorage + secure httpOnly cookies
Form: React Hook Form + Zod validation
Deployment: Vercel (SEA-optimized with CDN)
```

---

# 3. THE CORE VALUE LOOP THAT DRIVES RETENTION

## User Journey Mapping

### **Activation Loop** (Gets user to first aha moment)

```
New Researcher
        ↓
Sign up (3 min) → Invited to project by manager (1 day)
        ↓
Upload transcript (5 min) → See transcription status (polling)
        ↓
Wait for transcription (1-10 min depending on length)
        ↓
View transcript (2 min) → Code-mixing badge makes them feel "oh, it gets SEA"
        ↓
Click "Run Analysis" (1 click)
        ↓
See themes auto-extracted (2 min) → AHA MOMENT: "Wow, 30 minutes of work in 2 minutes"
        ↓
Click theme → See evidence → Read actual quotes
        ↓
Ask AI a question in chat → Get cited answer
        ↓
Export to PowerPoint for client meeting
```

**Key Metrics**:
- **Activation Rate**: % of uploads → first analysis viewed (target: 85%)
- **Aha Moment**: Time to first insight generation (target: <10 min from upload)
- **Confidence**: % of users who trust the auto-coded themes enough to use them (target: 70%)

---

### **Engagement Loop** (Keeps them coming back)

```
Daily Use
   ↓
Monday: Upload new transcript for project
   ↓
Tuesday: Run comparative analysis (Friday's + Monday's)
   ↓
Wednesday: Chat with AI, ask specific questions
   ↓
Thursday: Team reviews findings together (comments, annotations)
   ↓
Friday: Export for client presentation
   ↓
Next Week: Client feedback → New questions → Chat again
   ↓
(REPEAT weekly while project is active)
```

**Engagement Drivers**:
1. **Weekly deliverables** - Researchers present findings 1-2x per week
2. **Comparative insights** - Multi-transcript analysis is 10x more valuable
3. **Collaboration** - Team comments/reactions create social loops
4. **External validation** - Client questions drive back-and-forth

**Key Metrics**:
- **Weekly Active Users** (WAU): % of all users active in any given week (target: 50% WAU)
- **Project Lifecycle Engagement**: Days from project creation → final export (target: 30-45 days)
- **Chat Frequency**: Avg chats per active user per week (target: 3-5 questions/week)

---

### **Retention Loop** (Keeps them on the platform long-term)

```
Project 1 Complete (Month 2)
   ↓
Export presentation → Client loves insights
   ↓
Client asks: "Can you do the same for market X?" → New Project
   ↓
Upload Project 2 transcripts (multi-market)
   ↓
Comparative grid: Compare market findings side-by-side
   ↓
Deeper insights (market segmentation, regional patterns)
   ↓
(MORE VALUABLE than single-project work)
   ↓
Project 3: New product concept testing
   ↓
User becomes "power user" = multi-project habits
```

**Retention Drivers**:
1. **Multi-project workflows** - Second project adoption is critical (hooks them for longer contracts)
2. **Comparative analysis** - Cross-project work increases platform stickiness 3x
3. **Knowledge base** - Ability to search across past projects saves them hours
4. **Team collaboration** - If multiple people use it, org can't easily switch
5. **Custom analysis templates** - As teams learn the tool, they create shortcuts
6. **Institutional knowledge** - Over time, the platform becomes "how we do qual"

**Key Metrics**:
- **Month 2 Retention**: % of active Month 1 users still active in Month 2 (target: 75%)
- **Month 3+ Retention**: Cohort retention (target: 60% by Month 6)
- **Project Count per User**: Avg # of projects per researcher (target: 3+ in Year 1)
- **Multi-project Adoption**: % of teams with 2+ concurrent projects (target: 60%)
- **Accounts Expansion**: % of free/starter accounts upgrading to paid (target: 25% → Pro)

---

## What Drives The Loop

### **Activation** (Mobile + Speed + SEA-ness)
- **Speed**: From upload to first insight in <10 minutes (vs. 2-3 hours manual work)
- **Mobile**: Team can upload from field on phone, review on train ride
- **Code-mixing badge**: "Oh, they get us" moment (non-English tools don't detect this)
- **Local language**: UI in Indonesian feels more comfortable than all-English
- **Export-ready**: Insights formatted for client presentation immediately

### **Engagement** (Collaboration + Multi-format)
- **Comments & reactions**: Team can discuss findings in real-time
- **Video + transcript**: Can watch and re-watch specific moments
- **Multiple data types**: Audio interviews, videos, open-end surveys in same analysis
- **Chat loop**: Iterative Q&A feels like having an analyst on the team
- **Shared insight**: When one person finds something, team can see it immediately

### **Retention** (Knowledge + Comparison + Growth)
- **Knowledge base**: "Can we search across Project 1 & 2?" → Yes → Stickiness increases
- **Multimarket analysis**: "Show me which countries mentioned X" → Only possible in our tool
- **Custom codes/templates**: As team uses it, they customize it → Switching cost increases
- **Institutional knowledge**: New team member onboarding references past analyses → Network effect
- **Expansion**: Client asks for more markets, more projects, more team members → Account growth

---

## Activation Metrics Dashboard (Week 1-2)

```
Sign-up Funnel:
  Signup → Email Verified: 95%
  Email Verified → First Login: 85%
  First Login → Create Project: 75%
  Create Project → Upload Transcript: 65%

Aha Moment (Upload → Analysis View):
  Upload Started → Transcription Complete: 95% (wait time = median 4 min)
  Transcription Complete → Analysis Requested: 78%
  Analysis Requested → Analysis Viewed: 92%
  Time from Upload → Analysis Viewed: 10.5 min (median)

Confidence (First Experience):
  Viewed Analysis → Clicked on Evidence: 65%
  Clicked Evidence → Read Quotes: 90%
  Read Quotes → Asked Chat Question: 32%
  Asked Chat → Trusted Answer (scroll to end): 78%

Export (Activation Success):
  Analysis Viewed → Exported: 45%
  Exported → Shared with Team: 62%
  Shared with Team → Colleague Viewed: 55%
  Colleague Viewed → Colleague Used Tool: 42%
```

**Target**: 40% of sign-ups → first export within 2 weeks = product-market fit signal

---

# 4. PRICING TIERS & PACKAGING STRATEGY FOR SEA

## Pricing Philosophy

**"Enterprise features at SME prices. Pay for what you use. Scale with us."**

Three pillars:
1. **Affordability**: 50-70% below Western competitors
2. **Predictability**: Seat + usage-based hybrid (not overwhelming overage)
3. **Growth**: Clear upgrade path; no surprises at scale

---

## Pricing Tiers (Monthly, Annual)

### **STARTER (IDR 600K / SGD 49)**
*For individual researchers & small teams (<3 people)*

**Limits**:
- 3 team members (seats)
- 1 concurrent project
- 100 minutes transcription/month
- 20 analyses/month
- 5 GB storage
- 500 chat queries/month

**Features**:
- Basic transcript upload (txt, docx)
- Single-language analysis (English or 1 SEA lang)
- Export to CSV/PDF
- Mobile app (view-only)
- Email support

**Price Breakdown**:
- IDR: IDR 600K/mo = ~$40 USD | IDR 6M/yr (-20%)
- SGD: SGD 49/mo | SGD 490/yr (-17%)
- MYR: MYR 200/mo | MYR 2K/yr
- THB: THB 1,700/mo | THB 17K/yr
- VND: VND 1.2M/mo | VND 12M/yr
- PHP: PHP 2,500/mo | PHP 25K/yr

---

### **PROFESSIONAL (IDR 1.5M / SGD 99)**
*For agency teams & in-house researchers (3-10 people)*

**Limits**:
- 8 team members
- 5 concurrent projects
- 600 minutes transcription/month (50 hours)
- 200 analyses/month
- 50 GB storage
- 3,000 chat queries/month
- 1 multimarket analysis/month

**Features**:
- Audio + video upload
- Multi-language analysis (all SEA languages)
- Code-mixing detection (Taglish, Singlish, bahasa gaul)
- Comparative grids (by segment/market)
- Video player with timestamps
- Concept testing (basic)
- Collaborative comments + reactions
- API access (read-only)
- Native mobile app (upload + view)
- Priority email support
- Monthly group office hours
- Custom data region (Singapore or Indonesia)

**Best For**:
- Qual research agencies (2-15 researchers)
- In-house teams at medium CPG/retail brands
- Research departments with 1-2 projects running simultaneously

---

### **ENTERPRISE (IDR 3M+ / SGD 249+)**
*For organizations with multiple teams & custom needs*

**Limits**:
- Unlimited team members
- Unlimited projects
- 3,000 minutes transcription/month (250 hours)
- 2,000 analyses/month
- 500 GB storage
- 50,000 chat queries/month
- Unlimited multimarket analysis

**Features**:
- Everything in Professional, plus:
- Live recording (via Recall.ai) — Zoom/Meet/Teams/Webex
- Cross-project knowledge base
- Advanced concept testing (vision-based stimulus tagging)
- Clips + Reels (export video quotes)
- Open-ends bulk coding (CSV upload, 10k+ rows)
- WhatsApp community import
- Custom roles & permissions
- SSO (SAML 2.0 / OIDC)
- Data residency (any SEA region)
- Audit logs + compliance reports (PDPA/UU PDP)
- Dedicated account manager
- Custom onboarding (4 weeks)
- SLA: 99.5% uptime
- Quarterly business reviews

**Customization Options** (add-ons):
- Extra team seats: +IDR 100K / +SGD 8/mo per seat
- Extra storage: +IDR 50K / +SGD 4 per 10GB/mo
- Extra transcription: +IDR 50K / +SGD 4 per 100 min/mo
- Private on-premise deployment: custom quote

**Best For**:
- Multi-office research agencies
- Corporate research teams (Unilever, Nestlé, etc.)
- Market research firms with 10+ researchers
- Organizations with strict data residency requirements

---

## Pricing Comparison Table

| Feature | Starter | Professional | Enterprise |
|---|---|---|---|
| **Price** | SGD 49 | SGD 99 | SGD 249+ |
| **Seats** | 3 | 8 | Unlimited |
| **Projects** | 1 | 5 | Unlimited |
| **Transcription Min/mo** | 100 | 600 | 3,000 |
| **Analyses/mo** | 20 | 200 | 2,000 |
| **Storage** | 5 GB | 50 GB | 500 GB |
| **Chat Queries** | 500 | 3,000 | 50,000 |
| **Code-mixing Detection** | English only | Yes | Yes |
| **Multi-language** | 1 language | All SEA langs | All SEA langs |
| **Video Player** | No | Yes | Yes |
| **Comparative Grid** | No | Yes | Yes |
| **Concept Testing** | No | Basic | Advanced |
| **Knowledge Base** | No | No | Yes |
| **Live Recorder** | No | No | Yes |
| **WhatsApp Import** | No | No | Yes |
| **API Access** | No | Read-only | Full |
| **SSO** | No | No | Yes |
| **Custom Data Region** | No | IDC-1/2 | Any |
| **Audit Logs** | No | No | Yes |
| **Support** | Email | Priority Email + OH | Dedicated + SLA |

---

## Packaging Strategy

### **Go-to-Market Positioning**

1. **Starter**: DIY researchers, freelance consultants, students
   - **Positioning**: "Start free, upgrade as you grow"
   - **Free tier**: 7-day trial, 1 small project (30 min transcript limit)
   - **Conversion CTA**: "Ready to scale? Upgrade to Professional"

2. **Professional**: Target market (70% of revenue target)
   - **Positioning**: "Everything you need to scale qual research in Southeast Asia"
   - **Discount**: -17% annual (lock in commitment)
   - **Bundle**: Professional + 1 extra seat free if annual

3. **Enterprise**: Expansion / high-revenue customers (20% of revenue)
   - **Positioning**: "Custom, compliant, enterprise-grade"
   - **Sales motion**: Direct sales with proof of concept
   - **Discount**: Volume discounts at 5+ seats

---

## Billing Model

### **Hybrid: Seats + Usage**

```
Monthly bill = Base price + Overage

Base Price:
  Starter: SGD 49
  Professional: SGD 99
  Enterprise: SGD 249

Overage (if exceeded):
  Extra team seat: +SGD 8
  Extra 100 transcription min: +SGD 5
  Extra 10 analyses: +SGD 3
  Extra 10 GB storage: +SGD 4
  Extra 1,000 chat queries: +SGD 2

Example Professional user Month 1:
  Base: SGD 99
  Used 650 min transcription (50 min over): +SGD 2.50
  Total: SGD 101.50
```

**Overage pricing is soft** — first 10% overage is free; user gets warning at 90%; blocking only at 150%.

---

## Annual Billing Incentive

```
Starter:   SGD 490/year = 17% discount
Professional: SGD 792/year (8 mo at price) = 33% discount
Enterprise: SGD 2,490/year (10 mo at price) = 17% discount
```

**Goal**: 60% of users on annual plans (better cash flow, higher retention).

---

## Free Tier Strategy

**NOT a separate tier. Instead: Generous 14-day trial**

```
Sign up → 14-day trial of PROFESSIONAL plan
  No credit card required
  Full access: 5 projects, 600 min transcription, 200 analyses

End of trial:
  Option A: Pay (SGD 99/mo Professional)
  Option B: Downgrade to Starter (limited, but usable forever)
  Option C: Ask for extension (for enterprises/students)
```

**Why not a free tier?**
- Free tiers attract users with low intent (low conversion)
- Trial with generosity drives conversion through value, not entrapment
- Our pricing ($49/mo) is so low, people will pay if they've seen value
- Focus engineering on paid user experience, not free user optimization

---

## Regional Currency Pricing

**How we set prices by region**:

1. **Base**: SGD 49 Professional → convert to each currency using PPP (purchasing power parity)
2. **Adjustment**: Per-country affordability index

| Country | Professional | Monthly | Annual | Reasoning |
|---|---|---|---|---|
| **Singapore** | SGD 99 | SGD 99 | SGD 792 | Base reference |
| **Malaysia** | MYR 200 | ~SGD 60 | ~SGD 480 | PPP 0.6x |
| **Indonesia** | IDR 1.5M | ~SGD 105 | ~SGD 840 | PPP 1.1x (large market, higher adoption) |
| **Thailand** | THB 3,400 | ~SGD 95 | ~SGD 760 | PPP 0.97x |
| **Vietnam** | VND 2.4M | ~SGD 105 | ~SGD 840 | PPP 1.1x (growing market) |
| **Philippines** | PHP 5,000 | ~SGD 100 | ~SGD 800 | PPP 1.0x |

---

## Top-Up Purchases (For Overage-Heavy Users)

```
Additional transcription package: 500 min for SGD 20
  Useful for: Researchers doing unexpected surge projects

Additional storage: 100 GB for SGD 15
  Useful for: Archiving past projects

Additional analyses: 200 for SGD 12
  Useful for: Agencies with burst projects

Annual prepay discount:
  Buy SGD 1,000 annual credit → Get 20% bonus (SGD 1,200)
```

---

# 5. SUCCESS METRICS & OKRs FOR FIRST 6 MONTHS

## Company OKRs (Qual Engine)

### **Q1 2026 (Months 1-3): Product-Market Fit in Singapore**

**Objective 1: Launch MVP and establish beachhead in Singapore**

```
Key Results:
1. Launch public beta (Product Hunt, TechInAsia) with 1,000+ signups
   Target: 1,000 signup email addresses, 50% email confirmed

2. Achieve 40% activation rate (signup → first analysis created)
   Target: 400 users create at least 1 analysis

3. Reach 10% conversion rate (free trial → paid Professional)
   Target: 40 paying users on Professional by end of Q1

4. Establish 60%+ 2-week retention
   Target: Of 400 activated users, 240 are still active in week 2

5. Baseline NPS of 30+ from beta users
   Target: 100 surveyed users, NPS > 30 (benchmark: 50 for growth SaaS)

6. 4 case studies from early customers
   Target: 4 detailed write-ups published (1 agency, 1 in-house team, 1 CPG brand, 1 startup)
```

**How we measure activation**:
```
Signup → Email verified (Day 0-1)
  → Create project (Day 1-2)
  → Upload transcript (Day 2-4)
  → Transcription complete (Day 2-5)
  → View analysis (Day 3-5)
  → Click evidence panel (Day 3-6)
  = ACTIVATED
```

---

**Objective 2: Establish SEA language as competitive moat**

```
Key Results:
1. 80%+ of analyzed transcripts use code-mixing detection
   Target: Of 1,000+ analyses, 800+ are multi-language

2. Zero customer complaints about language/code-mixing accuracy
   Target: 0 high-priority support tickets related to lang detection

3. 5+ customer testimonials mentioning "finally a tool for us"
   Target: Customer quotes in case studies + reviews

4. 60%+ of signups are from Indonesia/Malaysia/Thailand
   Target: Geographic breakdown shows strong SEA adoption
```

---

**Objective 3: Build foundation for network effects**

```
Key Results:
1. 30% of Professional plans include 3+ team members
   Target: Multi-seat adoption (shows team/org buy-in)

2. Avg 2 projects per active user
   Target: Power users are already repeating workflows

3. 80% of users invite at least 1 team member
   Target: Viral coefficient baseline established

4. 50+ customers using chat feature actively
   Target: 2+ chats per week per active user
```

---

### **Q2 2026 (Months 4-6): Scale Singapore, Penetrate Indonesia**

**Objective 1: Achieve product-market fit metrics**

```
Key Results:
1. 500+ paying Professional/Enterprise customers (100x from Month 1)
   Target: ARR $240K+ (500 * SGD 99 * 12 months)

2. 50%+ month-over-month customer growth (Month 3→4, 4→5, 5→6)
   Target: March = 40, April = 60, May = 90, June = 135

3. 70%+ 30-day retention (cohort of Month 4 users alive in Month 5)
   Target: Stabilize retention metric

4. LTV:CAC ratio of 3:1+
   Target: Average customer lifetime value (18 mo * price) > 3x customer acquisition cost

5. NPS improves to 45+ (from 30+)
   Target: Increased user satisfaction as product matures
```

**Calculations**:
```
Typical LTV (18-month horizon, assuming 70% retention every month):
  Customer pays SGD 99/mo, stays 18 months average
  LTV = SGD 99 * 18 = SGD 1,782

CAC (via SEA partnerships, communities, influencers):
  Assume 40% adoption from organic + 60% from paid acquisition
  Paid CAC = SGD 50 per user (low, because PRD + word-of-mouth)
  Blended CAC = SGD 50 * 0.6 = SGD 30

LTV:CAC = SGD 1,782 / SGD 30 = 59:1 (excellent)
```

---

**Objective 2: Geographic expansion**

```
Key Results:
1. 40% of customers are Indonesia-based
   Target: Double from 20% in Q1

2. Launch marketing campaign in 3 SEA languages (ID, TH, VI)
   Target: Website + ads in 3 languages

3. 100+ customers in Indonesia (out of 500 total)
   Target: Establish Indonesia as equal market to Singapore

4. 20+ agency partnerships (SEA-based research firms)
   Target: Referral agreements for revenue share
```

---

**Objective 3: Feature expansion driving adoption**

```
Key Results:
1. 60%+ of active users use chat feature (up from 40%)
   Target: Engagement loops working

2. 40%+ of Professional users upgrade to multimarket analysis
   Target: Comparative grid adoption

3. 30+ agencies using Open Ends bulk coding feature
   Target: 2nd use case adoption

4. 80% of customers complete onboarding call with success manager
   Target: Proper implementation = higher retention
```

---

## Detailed Metrics Dashboard (Track Weekly)

### **Customer Acquisition Metrics**

```
KPI                              | Target Q1 | Target Q2 | How We Track
================================|===========|===========|================
Weekly signups                   | 50-100/wk | 150-200/wk| Analytics
Signups from each channel:       |           |           |
  - Organic (search)             | 40%       | 45%       | UTM tags
  - Partnerships/PR              | 30%       | 35%       | Referral codes
  - Ads (Google, LinkedIn)       | 20%       | 15%       | Paid tracking
  - Community/word-of-mouth      | 10%       | 5%        | Survey
Email confirmation rate          | 85%       | 90%       | Auth logs
Trial completion rate            | 60%       | 70%       | Event tracking
Paid conversion rate (trial→paid)| 10%       | 15%       | Billing system
CAC (blended)                    | <SGD 50   | <SGD 40   | (Total mktg spend) / (new customers)
```

---

### **Activation & Engagement Metrics**

```
KPI                              | Target Q1 | Target Q2 | How We Track
================================|===========|===========|================
Activation rate (signup→analysis)| 40%       | 50%       | Event funnel
Aha moment time (upload→view)    | <10 min   | <8 min    | Session timing
% analyzed transcripts w/ code-mix| 80%      | 85%       | Analysis metadata
Chat feature adoption            | 40%       | 60%       | Feature usage
Evidence panel clicks (% of grid views) | 70%| 80%      | Click events
Avg chats per active user/week   | 1.5       | 2.5       | Query counts
Avg projects per user            | 1.2       | 2.0       | Project table
% users who invite team member   | 35%       | 55%       | Invite events
Multi-seat adoption (3+ seats)   | 15%       | 30%       | Org size tracking
```

---

### **Retention & Expansion Metrics**

```
KPI                              | Target Q1 | Target Q2 | How We Track
================================|===========|===========|================
Day 7 retention (% of D1 active) | 60%       | 70%       | Cohort retention
Day 30 retention                 | 45%       | 55%       | Cohort retention
Month 2 retention                | 50%       | 60%       | Cohort retention
Month 3 retention                | 40%       | 50%       | Cohort retention
Upgrade rate (Starter→Prof)      | 8%        | 12%       | Plan changes
Enterprise sales pipeline        | 3-5 deals | 10+ deals | Salesforce
Annual plan adoption             | 30%       | 50%       | Billing data
Seat expansion (avg seats/org)   | 1.5       | 2.5       | Org members
```

---

### **Revenue Metrics**

```
KPI                              | Target Q1 | Target Q2 | How We Track
================================|===========|===========|================
MRR (monthly recurring revenue)  | SGD 4K    | SGD 40K   | Billing system
ARR (annualized)                 | SGD 48K   | SGD 480K  | (MRR * 12)
Avg revenue per user (ARPU)      | SGD 99    | SGD 110   | MRR / paid users
Customer count (Starter+Prof+Ent)| 40        | 400       | Subscription data
Starter customers                | 10        | 100       | Filter by plan
Professional customers           | 28        | 280       | Filter by plan
Enterprise customers             | 2         | 20        | Filter by plan
Churn rate (% customers lost/mo) | <10%      | <8%       | (Lost/Start of month)
LTV:CAC ratio                    | 30:1      | 40:1      | (LTV) / (CAC)
Gross margin                     | 85%       | 87%       | (Revenue - COGS) / Revenue
```

---

### **Product Quality Metrics**

```
KPI                              | Target Q1 | Target Q2 | How We Track
================================|===========|===========|================
API uptime                       | 99.0%     | 99.5%     | Monitoring (Datadog)
Avg API response time            | <200ms    | <150ms    | Performance logs
Transcription success rate       | 95%       | 98%       | Transcription logs
Analysis generation success      | 95%       | 98%       | Analysis logs
NPS (Net Promoter Score)         | 30+       | 45+       | Monthly survey
Customer satisfaction (CSAT)     | 75%       | 85%       | Post-interaction survey
Support ticket response time     | <4 hours  | <2 hours  | Support system
Monthly active features per user | 2.5       | 3.5       | Event tracking
```

---

### **Geographic Metrics**

```
Country        | Q1 Target | Q2 Target | % of Total Q2 | Revenue Contribution
===============|===========|===========|===============|====================
Singapore      | 200       | 150       | 30%           | SGD 150K
Indonesia      | 100       | 150       | 30%           | SGD 150K
Malaysia       | 50        | 75        | 15%           | SGD 75K
Thailand       | 30        | 50        | 10%           | SGD 50K
Vietnam        | 10        | 30        | 6%            | SGD 30K
Philippines    | 10        | 25        | 5%            | SGD 25K
Other          | --        | 20        | 4%            | SGD 20K
===============|===========|===========|===============|====================
TOTAL          | 400       | 500       | 100%          | SGD 500K
```

---

# 6. GO-TO-MARKET STRATEGY FOR EACH SEA COUNTRY

## Market Entry Framework

**Approach**: Simultaneous launch in Singapore (English) + Indonesia (Bahasa), staggered to others.

---

## SINGAPORE (Q1 2026 - Days 1-90)
**Market Size**: IDR 30B/year qual research spend | **Competition**: Coloop, Dovetail (both present)

### **Positioning**
*"The research platform built for Southeast Asia. Code-mixing detection. Local data residency. Fair pricing."*

### **Target Customer Profile**
- **Primary**: Agencies (8-20 person teams), in-house teams at MNCs
- **Secondary**: Startups in fintech, e-commerce, healthtech
- **Buyer**: Research Directors, heads of insight, project managers
- **Mindset**: Frustrated with expensive/slow international tools, want local support

### **Launch Activities**

**Pre-launch (Week 1-2)**
```
☐ Product Hunt launch (Friday of Week 1)
  - Killer video demo (60 sec, Taglish/English code-mixing example)
  - First 100 upvoters get 3-month Professional free
  - Community post: "Built for Southeast Asia, by people who understand your data"

☐ TechInAsia + Geek Culture interviews (Week 1-2)
  - Pitch: "How code-mixing detection changes qual research"
  - Founder story: Why we built this for SEA

☐ Influencer outreach (Week 1-2)
  - 5-10 respected insight leads, research directors in SG
  - Early access + beta partnership
  - Incentive: Co-create case study, public testimonial
```

**Launch Week (Week 3)**
```
☐ Webinar: "From 30 hours of work to 2 hours" (Tuesday, 4 PM SGT)
  - Freemium tier: 100 registrations target
  - Founder + customer (live demo)
  - Free 14-day Professional access for attendees

☐ LinkedIn campaign (Week 3-4)
  - Daily posts: tips for qual researchers
  - Case study snippets (animated)
  - Founder engagement in comments

☐ Email to warm list (Week 3)
  - Advisors, early testers, connections
  - Personal invite to beta
```

**First 30 Days (Weeks 4-8)**
```
☐ Agency partnerships (target 5)
  - Direct outreach to 10 mid-size qual agencies
  - Pitch: White-label or referral discount program
  - Value: Agencies can offer "AI analysis" as new service

☐ Corporate research teams (MNCs in SG)
  - Target: Unilever, Nestlé, P&G regional offices
  - Pitch: Internal research tool + cost vs. coloop
  - Value: 70% cheaper per seat

☐ University partnerships (NUS, SMU)
  - Approach: Business school + grad programs
  - Free tier for students/faculty
  - Build pipeline for future hires + customers

☐ Community building
  - Join qual research Facebook groups (100+ members each)
  - Post case studies, tips (not promotional)
  - Sponsorship of 1-2 industry events
```

**Months 2-3 (Weeks 9-13)**
```
☐ Paid acquisition (Google Ads + LinkedIn)
  - Budget: SGD 5K/month for Q1
  - Keywords: "qual analysis", "transcription software", "market research tools"
  - Audience: Research directors, insight managers (job titles)

☐ Referral program launch
  - Incentive: SGD 100 credit for each new referral
  - Target: 10% of new customers via referral by end of Q1

☐ Content marketing
  - Blog: 2 posts/week (qual research + SEA focus)
  - Video tutorials: 5 videos on key features
  - Testimonials: Publish 4-5 case studies from Q1 customers
```

### **Success Metrics (Singapore, End Q1)**
```
Signups:                 300+
Email confirmed:         255+ (85%)
Trial conversions:       25+ (10% of confirmed)
Professional customers:  20+
Monthly revenue:         SGD 2K+
NPS:                     30+
```

---

## INDONESIA (Q1 2026 - Days 30-90)
**Market Size**: IDR 250B/year qual research spend | **Competition**: None (coloop has <5% awareness)

### **Positioning**
*"Platform untuk riset kualitatif di Indonesia. Bahasa Gaul. Ketenangan data lokal. Harga yang wajar."*
Translation: *"Qual platform for Indonesia. Code-mixing. Local data peace of mind. Fair pricing."*

### **Target Customer Profile**
- **Primary**: Agencies in Jakarta, Bandung, Surabaya (60% of qual market)
- **Secondary**: In-house teams at food/beverage, e-commerce, telco
- **Buyer**: Research managers, team leads (often multilingual English-Bahasa)
- **Pain point**: Most use Google Sheets + WhatsApp for collaboration; manual coding is standard

### **Launch Activities**

**Pre-launch (Day 30-45 after SG launch)**
```
☐ Language localization
  - Product: ID translation (UI + onboarding + error messages) ✓
  - Website: Full ID content ✓
  - Docs: API docs in English + ID summary

☐ Local PR outreach
  - Reach out to:
    * Marketing Magazine Indonesia
    * Marketeers.com
    * Komunitas Riset Pasar Indonesia (association)
  - Story: "Startup Indonesia bikin tool riset lokal vs. Coloop barat"

☐ Influencer recruitment
  - 10-15 respected research leaders in Indonesia
  - Offer: Beta access + revenue share (5% of referrals)
  - Platforms: LinkedIn, WhatsApp groups, Facebook researcher communities
```

**Launch Week (Day 45-52)**
```
☐ LinkedIn campaign in Bahasa Indonesia
  - Stories about code-mixing (humor + education)
  - Poll: "What's your biggest qual research pain point?"
  - Engagement: Reply to every comment for 7 days

☐ WhatsApp community groups
  - Find + join 5-10 private research manager groups
  - Provide value: Tips, tools, research insights (not sales pitch)
  - Strategic: 1 post/week with soft CTA

☐ Facebook group sponsorship
  - Find large "Researchers Indonesia" or "Market Research" groups
  - Sponsor 1 post per week for Q1
  - Content: Case studies, tips, customer stories

☐ Webinar in Bahasa (Friday, 7 PM WIB)
  - "Dari 30 jam kerja jadi 2 jam" (translation of SG webinar)
  - Target 200+ registrations
  - Live demo with code-mixing example (Bahasa + English interview)
```

**First 30 Days (Day 52-82)**
```
☐ Agency partnerships (target 8-10)
  - Jakarta-based agencies are key (30% of qual market)
  - Pitch: White-label + referral discount
  - List: Major firms like Penta, Ogilvy, JWT research teams

☐ Corporate teams (target 10-15)
  - Telcos (Indosat, Telkomsel), FMCG (Unilever Indo, Nestlé), e-commerce (Tokopedia, Bukalapak)
  - Pitch: Internal tool, 80% cheaper than coloop
  - Value: No foreign dependency, local data

☐ Academic partnerships
  - Universitas Indonesia, BINUS, Trisakti business schools
  - Free tier for students + faculty
  - Build loyalty with next generation of researchers

☐ Media partnerships
  - Sponsorship of 1-2 webinars/virtual events hosted by industry associations
  - Guest article in Marketeers.com or Marketing Magazine
```

**Months 2-3 (Day 82-90)**
```
☐ Paid acquisition (Google Ads + LinkedIn)
  - Budget: IDR 5M/month (~SGD 400) for Q1
  - Keywords: "analisis transkip", "software riset", "transcription Indonesia"
  - Target: Research directors, insight managers

☐ Grassroots community
  - Build WhatsApp group: "Qual Engine Users Indonesia" (goal: 100+ members)
  - Monthly mini-workshops (1 hour, free) on qual techniques + tool tips
  - Community vote: Feature request voting

☐ Content in Bahasa
  - 2-3 blog posts/week (qual research + bahasa gaul insights)
  - 3-4 video tutorials in Bahasa
  - Customer stories: 3-4 case studies from Indonesian customers
```

### **Success Metrics (Indonesia, End Q1)**
```
Signups:                 200+ (target lower due to awareness gap)
Email confirmed:         160+ (80%)
Trial conversions:       12+ (7.5%, lower = awareness building phase)
Professional customers:  10+
Monthly revenue:         IDR 1M+ (~SGD 80)
NPS:                     35+ (higher engagement due to localization)
```

---

## MALAYSIA (Q2 2026 - Months 4-6)

### **Positioning**
*"The qualitative research platform for Malaysia. Understands Manglish. Compliant with PDPA. Fair pricing."*

### **Launch Strategy**
```
Timing: Start Month 4, after establishing SG + ID

Pre-launch (Month 4, Week 1-2):
  ☐ Language support (Bahasa Malaysia + English)
  ☐ Influencer outreach (5-8 research directors in Kuala Lumpur)
  ☐ PR to local media (Digital News Asia, Berita Harian Business)

Launch (Month 4, Week 3):
  ☐ LinkedIn campaign in Bahasa Malaysia (Manglish tone)
  ☐ Webinar: "Malaysian Researchers Deserve Malaysian Tools"
  ☐ Email to warm list from SG network (cross-border researchers)

Growth (Month 4-6, Weeks 4-13):
  ☐ 4-5 agency partnerships (Kuala Lumpur + Penang)
  ☐ 3-5 corporate teams (telco, banking, FMCG)
  ☐ University tie-ups (UM, UPM)
  ☐ Paid ads: Google + LinkedIn (Budget: MYR 3K/month)

Target by end of Q2:
  Signups:           100+
  Customers:         8+
  Monthly revenue:   MYR 600+
```

---

## THAILAND (Q2 2026 - Months 4-6)

### **Positioning**
*"The AI platform for Thai qualitative research. Supports Thai + Denglish. Data stays in ASEAN."*

### **Special Considerations**
- **Language**: Thai is challenging for most ASR providers; emphasize whisper_local capability
- **Cultural**: Thai society is hierarchical; positioning emphasizes efficiency + respect for traditional methods
- **Market**: Bangkok-centric; most research spend in Bangkok + 2-3 regional cities
- **Integration**: WhatsApp is huge; CAPI tools (SurveyToGo) are common

### **Launch Strategy**
```
Timing: Start Month 4

Partnerships first (Month 4, Week 1-3):
  ☐ Thai insight associations
  ☐ 5-8 research agencies in Bangkok
  ☐ 3-4 corporate research teams
  ☐ Research schools (Chulalongkorn, Thammasat)

Paid acquisition (Month 4-6):
  ☐ Google Ads (Thai language keywords)
  ☐ LinkedIn targeted to Thai researchers
  ☐ Budget: THB 20K/month (~SGD 600)

Content (Month 4-6):
  ☐ Thai-language marketing materials
  ☐ 2 webinars in Thai
  ☐ 3-4 case studies with Thai companies

Target by end of Q2:
  Signups:           75+
  Customers:         5+
  Monthly revenue:   THB 15K+
```

---

## VIETNAM (Q2 2026 - Months 5-6)

### **Positioning**
*"Nền tảng nghiên cứu định tính cho Việt Nam. Hỗ trợ tiếng Anh-Việt. Dữ liệu lưu trong ASEAN."*
Translation: *"Qual platform for Vietnam. English-Vietnamese support. Data stays in ASEAN."*

### **Market Characteristics**
- **Growth**: Fastest-growing qual market in SEA (FDI driving market research demand)
- **Language**: Vietnamese + English code-mixing in urban areas
- **Market**: Ho Chi Minh City + Hanoi (90% of qual research spend)
- **Adoption**: Tech-savvy market, fast to adopt new tools

### **Launch Strategy**
```
Timing: Start Month 5 (late entry = more confidence after SG/ID)

Partnerships (Month 5-6, Week 1-4):
  ☐ Vietnamese qual research associations
  ☐ 4-6 agencies in HCMC + Hanoi
  ☐ 2-3 tech/fintech companies with research teams
  ☐ Universities (NUS Vietnam, local business schools)

Paid acquisition (Month 5-6):
  ☐ Google Ads + LinkedIn (Vietnamese keywords)
  ☐ Budget: VND 300M/month (~SGD 150)

Content (Month 5-6):
  ☐ Vietnamese website + UI
  ☐ 1-2 webinars in Vietnamese
  ☐ 2-3 case studies with Vietnamese companies

Target by end of Q2:
  Signups:           50+
  Customers:         3+
  Monthly revenue:   VND 150M+
```

---

## PHILIPPINES (Q2 2026 - Month 6 Buffer)

### **Positioning**
*"The Taglish-friendly qual research platform. For Filipino researchers."*

### **Market Characteristics**
- **Taglish dominance**: English-Tagalog code-mixing is cultural norm; positioning around this
- **Smaller market**: ~5% of SEA qual research spend; lower priority than SG/ID/TH/VN
- **Opportunity**: Finance + BPO companies doing customer research

### **Launch Strategy** (Minimal for Q1-Q2)
```
Timeline: Hold until Month 6 or Q3

Organic growth (Month 6):
  ☐ Tag-based social media (Facebook researcher groups)
  ☐ Email campaigns to Filipino researchers in SG/ID who might be clients
  ☐ YouTube videos with Taglish examples

Official launch (Q3):
  ☐ Philippines-specific marketing campaign
  ☐ Partnership with BPO research associations
  ☐ Targeted ads to Filipino insight professionals
```

---

## Geographic Go-to-Market Timeline

```
Month 1 (Q1, Week 1-4):  Singapore launch (organic + word-of-mouth)
Month 1-2 (Q1, Week 2-8): Indonesia soft launch (partnerships + communities)
Month 2-3 (Q1-Q2, Week 8-13): Singapore + Indonesia growth + referral programs
Month 4 (Q2, Week 1-4):  Malaysia + Thailand launch (simultaneous)
Month 5 (Q2, Week 5-8):  Vietnam launch
Month 6 (Q2, Week 9-13): Philippines buffer + optimization

ARR by end of Q2:
  Singapore:  SGD 180K (60 customers)
  Indonesia:  SGD 150K (50 customers)
  Malaysia:   SGD 60K (20 customers)
  Thailand:   SGD 50K (15 customers)
  Vietnam:    SGD 40K (10 customers)
  Philippines: SGD 20K (5 customers)
  ─────────────────────────────────
  TOTAL:      SGD 500K (160 customers)
```

---

# 7. PRODUCT HOOKS & VIRAL FEATURES

## Hook 1: Code-Mixing Detection Badge (Immediate "Wow")

**Why it hooks users:**
- No international tool detects code-mixing
- First time a researcher uploads Taglish/bahasa gaul transcript, they see the badge
- Creates instant "Oh! They GET us" moment
- Emotional response → Share with team → Adoption

**How it works:**
```
Researcher uploads transcript with:
  "Serbuan pelanggan kami very good, tapi service bagus sekali"
  (Indonesian + English mix)

Platform detects:
  [Mixed: Bahasa Indonesia + English detected]
  [Code-mixing preserved in analysis for authenticity]

Researcher reaction:
  "Wait, other tools don't even recognize this mix exists"
  → Screenshot + shares on WhatsApp team group
  → Team sees it → "Wow, we need this"
```

**Virality mechanism**:
- Emotional response (feeling understood) > rational benefit
- Screenshot-able moment (badge is visual)
- Word-of-mouth multiplier (team members ask "what tool is that?")

**Target**: 60%+ of SEA transcripts use code-mixing; badge appears in 80% of analyses → shared in team chats

---

## Hook 2: "Insights in Minutes, Not Days" Comparative Visualization

**Why it hooks users:**
- Traditional qual research takes weeks: transcribe → code → compare → present
- Qual Engine shows multi-project comparative analysis in real-time
- Researcher can ask "Show me Indonesia vs. Malaysia findings" and get answer in seconds
- Saves 30-40 hours per project

**How it works:**
```
Researcher uploads 3 transcripts:
  - Indonesia focus group (5 participants)
  - Malaysia focus group (5 participants)
  - Thailand focus group (4 participants)

Instead of:
  Week 1-2: Manual transcription
  Week 3-4: Manual coding (themes)
  Week 5: Create comparison spreadsheet
  Week 6: Prepare presentation
  → 4 weeks + 40 hours

Qual Engine does:
  Day 0: Upload all 3 (auto-transcription)
  Day 0-1: Run analysis on all 3 (auto-coded themes)
  Day 1: Ask "What are differences between markets?"
  → Get grid showing themes side-by-side with evidence
  → Export to PowerPoint
  → Client meeting same day
  → 1 day + 2 hours of work

User reaction:
  "I just saved a month of work. This is insane."
  → Becomes evangelist
  → Pitches to colleagues
  → Team adoption
```

**Virality mechanism**:
- Time saved is quantifiable ("I saved a month!")
- Makes researcher look good to their manager
- Creates efficiency gain that scales with team size
- Economic value is clear ($2,000+ per researcher per project)

**Target**: 70%+ of paid customers using comparative grid by Month 3 → NPS spike

---

## Hook 3: Chat That Actually Understands Context (RAG Credibility)

**Why it hooks users:**
- Researchers ask specific questions about their data
- AI answers with EXACT quotes from their transcripts
- They can click quote → hear original audio at timestamp
- Trust > spreadsheet AI

**How it works:**
```
Researcher working on CPG project asks:
  Q: "What did customers say about product texture when testing variant 2?"

Typical LLM response (hallucination risk):
  "Customers mentioned texture was smooth and creamy"
  (Made up, not verifiable)

Qual Engine response (RAG grounded):
  "From your 3 variant tests, 7 mentions of texture for variant 2:
   1. "Sangat smooth, creamy feeling" - Mumbai, F45, 6:32 → [PLAY]
   2. "Nope, too heavy" - Participant C, 8:15 → [PLAY]
   3. "Better than original" - Jakarta, 12:03 → [PLAY]

   Sentiment: 57% positive, 29% neutral, 14% negative"

Researcher reaction:
  "I can hear it in their voice. This is actually true."
  → Trust in AI increases
  → Uses chat for every project insight
  → Becomes habitual
```

**Virality mechanism**:
- Credibility = trust = adoption
- Team members validate findings together (social)
- Saves hours of transcript-searching manually
- Creates lock-in (switching costs increase as they rely on it)

**Target**: 80%+ of active users use chat weekly by Month 3

---

## Hook 4: Mobile Upload = Research Anywhere

**Why it hooks users:**
- Researchers are often in field or traveling
- Can upload directly from phone while doing FGD
- Status notifications in real-time
- Work while waiting (transcription happens async)

**How it works:**
```
Timeline of typical qual research in SEA:

OLD WAY (no mobile):
  Day 1: Conduct FGD in Jakarta office
  Day 1-2: Travel home
  Day 2: Transfer audio file to laptop
  Day 2-3: Upload (slow wifi) + wait for transcription
  Day 3-4: Review + code
  → 3 days before results

NEW WAY (mobile):
  Day 1: During FGD, phone upload starts
    (WiFi in office, or LTE)
    → Transcription starts in background
  Day 1 evening: Notification "Your FGD is transcribed"
  Day 1 evening: Open app, review themes while on flight home
  Day 2: Client call with insights ready
  → Same day insights

Critical for:
  ✓ Multinational studies (jump between countries)
  ✓ Fieldwork teams (CAPI/diary integration)
  ✓ Quick turnarounds (client wants findings in 48h)
  ✓ Researcher efficiency (less desk time)
```

**Virality mechanism**:
- Enables new workflows (same-day insights)
- Reduces friction (upload from phone = normal)
- Improves researcher quality of life (less laptop bound)
- Team adoption follows naturally

**Target**: 60%+ of uploads from mobile by Month 4

---

## Hook 5: "Your team's research knowledge base" (Network Effect)

**Why it hooks users:**
- After 3-5 projects, team has a searchable library of insights
- New team members onboarded faster (can search past findings)
- Brands recognize patterns across customer groups
- Knowledge compounds; switching cost increases

**How it works:**
```
Month 1: Team does Project A (50 hours of research)
Month 2: Team does Project B (50 hours of research)
Month 3: Team lead searches: "What did customers say about reliability?"
  → Results from Project A + Project B combined
  → Cross-project patterns emerge
  → Deeper insights than any single project

Month 4: New team member joins
  → Can access all past research in 1 place
  → Onboarding time reduced from 2 weeks to 2 days
  → Can't achieve this with other tools

Network effect:
  More projects → Better library → More valuable → Hard to leave
  → Enterprise features (access control, archiving) become sticky
```

**Virality mechanism**:
- Compound value (projects accumulate knowledge)
- Institutional stickiness (team learns workflows)
- New hire onboarding (knowledge transfer)
- Org-level lock-in (can't easily extract 18 months of research)

**Target**: 50% of Professional teams have 3+ projects by Month 4

---

## Hook 6: Export as Animated Clips (LinkedIn-Shareable)

**Why it hooks users:**
- Qual researchers create insights; they want credit
- Being able to create polished video clips from transcripts is rare
- LinkedIn clips go viral (qual researchers share insights)
- Platform gets free marketing

**How it works:**
```
Researcher finds great quote in chat:
  "We would switch if price dropped 20%" - Customer interview

With Qual Engine:
  Click "Make clip" → 30 seconds
  → Animated quote with speaker audio + name
  → Export as MP4
  → Post on LinkedIn: "Key finding from our research: [clip]"
  → Colleagues comment, repost
  → Company's research visibility increases
  → Tool gets natural mentions

Without tool:
  Researcher manually:
    1. Find audio timestamp
    2. Record video of screen
    3. Add subtitle
    4. Edit + render
    → 30 minutes for 1 clip
    → Unlikely to do it
```

**Virality mechanism**:
- Researcher ego/credit (they want to show their work)
- Social sharing (LinkedIn amplifies)
- Free marketing (Qual Engine branded in clips)
- Team adoption (colleagues see clips, ask for tool)

**Target**: 20% of Professional teams create 1+ clip per month by Month 4

---

## Hook 7: WhatsApp Integration (Local Attachment)

**Why it hooks users:**
- WhatsApp is the primary collaboration tool in SEA for teams
- Not US-centric email culture
- Being able to share findings directly to WhatsApp group is natural
- Integration shows deep local understanding

**How it works:**
```
Researcher finishes analysis:
  Clicks "Share to WhatsApp" → QR code or link
  → Team group chat gets instant notification
  → Link opens analysis in app (or web)
  → Entire team can comment + react
  → No "forward email, check your email, open link" friction

Vs. traditional:
  Email → "Check this out" → Team members forget → Lost

WhatsApp:
  Share → Instant notification → Team sees it + reacts immediately
  → 3x higher engagement
```

**Virality mechanism**:
- Meets users where they already are (WhatsApp)
- Reduces friction to collaboration
- Makes tool feel local/native (not foreign)
- Natural sharing within teams

**Target**: 70%+ of team users share insights via WhatsApp by Month 3

---

## Summary: Hooks Prioritization

| Hook | Virality Strength | Impl. Cost | Timeline | Impact |
|---|---|---|---|---|
| Code-mixing badge | Very High | 2 days | MVP | Immediate SEA appeal |
| Comparative vis. | High | 10 days | Phase 1 | Time-saving moat |
| Chat credibility | Very High | 8 days | MVP | Daily usage driver |
| Mobile upload | High | 12 days | Phase 1 | Workflow unlock |
| Knowledge base | Medium | 20 days | Phase 2 | Retention moat |
| Clip export | High | 14 days | Phase 1 | Free marketing |
| WhatsApp share | High | 5 days | Phase 1 | Local adoption |

---

# 8. PARTNERSHIP OPPORTUNITIES WITH LOCAL COMPANIES & UNIVERSITIES

## Partnership Strategy Framework

**Goal**: Each partnership adds 2-3 customer channels (direct referral + credibility + co-marketing).

**Three partnership tiers**:
1. **Co-marketing partners** (low effort, 2-week engagement): Associations, media, communities
2. **Channel partners** (medium effort, 3-month onboarding): Agencies, resellers
3. **Strategic partners** (high effort, 6+ month integration): Platforms, integrations, enterprises

---

## TIER 1: Co-Marketing & Community Partners

### Indonesia

**Partner 1: Komunitas Riset Pasar Indonesia (Association)**
- What: Primary qual research professional association in Indonesia
- Size: 500+ members (research directors, agency leads)
- Value exchange:
  - We sponsor: Monthly webinar series (Qual Engine pays for platform + promotion)
  - They sponsor: Feature us in newsletter, monthly member discount (10%)
- Timeline: 2 weeks to negotiate, 1 month to launch first webinar
- Expected ROI: 20-30 signups per month

**Partner 2: Marketeers.com (Media)**
- What: Largest digital marketing publication in Indonesia
- Value exchange:
  - We sponsor: Monthly thought-leadership column ("Qual research insights")
  - They feature: 3-4 guest posts/year, newsletter mentions
- Timeline: 2 weeks negotiation
- Expected ROI: 50+ signups from content (6-month lag)

**Partner 3: Indonesian Startup Community (Facebook + LinkedIn)**
- What: Active research/startup community (~10K members)
- Value exchange:
  - Sponsor monthly challenge: "Best research insight of the month"
  - Prize: Free annual Professional subscription
  - Cross-promotion: Qual Engine featured in newsletter
- Timeline: 1 week to setup
- Expected ROI: 100+ signups, brand awareness

---

### Singapore

**Partner 1: Singapore Market Research Society (Association)**
- What: SMRS - professional body for market researchers
- Size: 300+ members
- Value exchange:
  - We sponsor: Annual conference (booth + workshop)
  - They feature: Monthly spotlight feature, member discount (15%)
- Timeline: 3 weeks negotiation
- Expected ROI: 30-40 qualified leads

**Partner 2: Temasek Foundation's Grow Asia Initiative**
- What: Supports SMEs across ASEAN
- Value exchange:
  - We offer: Special pricing for Grow Asia member companies
  - They feature: Case study of how Qual Engine supports SME growth
- Timeline: 4 weeks
- Expected ROI: 10-20 enterprise leads, credibility

---

### Other Markets

**Thailand**: Thai Marketing Research Association + Marketing Association of Thailand
**Vietnam**: Vietnam Market Research Association + Digital Marketing Association
**Malaysia**: Marketing Institute of Malaysia (MIM)
**Philippines**: Market Research Association of the Philippines

**Timeline**: Partner with 1-2 associations per country in Months 2-4

---

## TIER 2: Channel Partners (Agencies & Resellers)

### Indonesia - Qual Research Agencies

**Target Partners** (10-15 mid-size agencies):
```
Top Targets:
  1. Penta (Jakarta-based, 25 researchers)
  2. Ogilvy Indonesia (global + local)
  3. JWT Indonesia
  4. Creed (boutique qual agency)
  5. Insight Dynamics

Pitch:
  "Add AI-powered analysis to your service offerings.
   White-label Qual Engine for your projects.
   You own the client relationship + brand.
   We provide tech + 24/7 support.
   Revenue share: 20% of their usage."
```

**Timeline**: Months 2-4 (staggered)
**Expected Outcome**: 3-5 agency partnerships
**ROI**: 30-50 customers per agency (2,000+ annual analyses per agency)

---

### Singapore - Larger Agencies

**Target Partners** (5-8 premium agencies):
```
Top Targets:
  1. Qualtrics (not an agency, but key integrator)
  2. Kantar Singapore (global + local)
  3. Ipsos Singapore
  4. Horizon (boutique)
  5. Lightbulb (boutique)

Pitch:
  "Integrate Qual Engine into your project workflows.
   Your clients get faster insights.
   You reduce delivery time by 70%.
   Revenue share: 30% of new revenue."
```

**Timeline**: Months 1-3
**Expected ROI**: 2-3 partnerships, 20-30 referred customers

---

### Cross-SEA - E-commerce & Tech Companies (Inline Users)

**Target Partners** (2-3 per country):
```
Indonesia:
  - Tokopedia (research team, 10+ researchers)
  - Bukalapak
  - Gojek
  - Grab

Malaysia:
  - Lazada Malaysia (research team)
  - Grab Malaysia
  - AEON (retail research)

Thailand:
  - Lazada Thailand
  - Grab Thailand
  - Central Group

Vietnam:
  - Tiki.vn (research team)
  - Grab Vietnam
  - Viettel (telecom research)

Pitch:
  "Internal research tool to accelerate insights
   for product, marketing, and growth teams.
   Enterprise pricing: 10-50 seats at custom rate."
```

**Timeline**: Q2 2026 (enterprise sales starting Month 4)
**Expected ROI**: 3-5 enterprise contracts at SGD 3K-10K/month each

---

## TIER 3: Strategic Partnerships (Deep Integrations)

### Integration Partners

**Partner 1: Deepgram / AssemblyAI (ASR Providers)**
- Current status: We use their API (or mock)
- Opportunity:
  - Official integration partnership
  - Co-marketing: "Best ASR for SEA languages"
  - Revenue: We pay them per minute; can become reseller if high volume
- Timeline: Month 3-4 (after we're clearly successful)

**Partner 2: Recall.ai (Live Recording)**
- Current status: Planned feature for Phase 1 Module A
- Opportunity:
  - Co-launch: "Qual Engine + Recall.ai = seamless live recording"
  - Marketing: Joint case study
  - Revenue: Affiliate (per recording session)
- Timeline: Month 5-6

**Partner 3: Zapier / n8n (Automation Platforms)**
- Opportunity:
  - Qual Engine connector in Zapier marketplace
  - Enable workflows: "When transcript finishes → Send Slack notification"
  - Revenue: Usage-based (small, but brand visibility high)
- Timeline: Month 4-5

**Partner 4: Stripe (Payments)**
- Current status: For billing
- Opportunity:
  - Feature in Stripe case study (SME SaaS in SEA)
  - Cross-promotion to SME audience
- Timeline: Month 2-3

---

### University Partnerships (Talent + Credibility)

**Target Universities** (1 per country):

```
Indonesia:
  Universitas Indonesia (UI) - Jakarta
  → Business school + research program
  → 300+ grad students in market research

Singapore:
  National University of Singapore (NUS)
  → Business school + design school
  → 200+ grad students in research/design

Malaysia:
  Universiti Malaya (UM)
  → Research + business school
  → 150+ grad students

Thailand:
  Chulalongkorn University
  → Business school + research programs
  → 100+ grad students

Vietnam:
  National Economics University (NEU)
  → Business school
  → 200+ grad students
```

**Partnership structure**:
```
What we offer:
  - Free Qual Engine Enterprise tier for faculty + students
  - Co-teach 1 elective: "AI for Research" (semester course)
  - Internship program: 2-3 interns/semester

What they offer:
  - Case studies: Student research using Qual Engine
  - Student ambassadors: 5-10 students who become power users
  - Alumni network effect: Grad students join companies, bring tool with them
  - Faculty research: Publications using Qual Engine

Timeline: Months 2-4 (approach + negotiate)
Expected ROI:
  - 100+ free student users
  - 20-30% convert to paying customers after graduation
  - Brand credibility (featured in university research)
  - Talent pipeline: Hire top interns
```

---

## Market-Specific Partnership Roadmap

### Month 1-2 (Singapore + Indonesia Focus)

```
Week 1-2:
  ☐ Contact Komunitas Riset Pasar Indonesia
  ☐ Pitch to Singapore Market Research Society
  ☐ Outreach to 5 Indonesian qual agencies

Week 3-4:
  ☐ First co-marketing deals signed (2-3)
  ☐ First agency partnership negotiation (1-2)
  ☐ University outreach: UI, NUS (email + call)

End of Month 2:
  ✓ 3-4 co-marketing partnerships signed
  ✓ 1-2 agency partnerships in negotiation
  ✓ 1 university partnership started
```

---

### Month 3-4 (Indonesia Growth + Malaysia/Thailand Launch)

```
Month 3:
  ☐ Launch first co-marketing webinar (Komunitas Riset)
  ☐ Finalize 2-3 agency partnerships (Indonesia)
  ☐ University partnerships signed + first batch of free accounts
  ☐ Approach Stripe + Deepgram for integrations

Month 4:
  ☐ Malaysia: Partner with Marketing Institute of Malaysia
  ☐ Thailand: Partner with Thai Marketing Research Association
  ☐ 5-8 total agency/reseller partnerships active
  ☐ 2 university co-teach programs launched

End of Month 4:
  ✓ 10+ total partnership relationships
  ✓ 200+ referred customers from partnerships
  ✓ 3 university programs active
  ✓ 2 integration partnerships negotiating
```

---

### Month 5-6 (Expansion + Integration Launch)

```
Month 5:
  ☐ Vietnam: Partner with Vietnam Market Research Association
  ☐ Launch Zapier integration
  ☐ Philippines: Soft launch partnerships

Month 6:
  ☐ Recall.ai integration live
  ☐ 15+ total partnerships active
  ☐ University students using tool (2-3 universities)
  ☐ Enterprise deals from corporate partners closing

End of Month 6:
  ✓ 300+ customers from partnership channels (30% of total)
  ✓ 5 enterprise contracts active
  ✓ 3 integrations live
  ✓ Pipeline for 20+ new partnerships in Q3
```

---

# 9. PRODUCT ROADMAP FOR ACHIEVING MARKET LEADERSHIP

## Vision: From MVP → Market Leader in 18 Months

**Q1 2026**: Validate PMF in Singapore + Indonesia
**Q2 2026**: Expand to all SEA + establish key partnerships
**Q3-Q4 2026**: Enterprise sales + advanced features
**Q1-Q2 2027**: Market consolidation + dominance positioning

---

## Phase-by-Phase Roadmap

### **PHASE 0: MVP (Current, Weeks 1-12 of development)**

#### Goals:
- Launch public beta
- Validate SEA positioning
- Hit 40% activation rate
- Achieve 10% conversion to paid

#### Features:
```
Authentication & Onboarding:
  ✓ Email signup/login
  ✓ Role-based access
  ✓ Company setup + language preference
  ✓ 14-day Professional trial

Core Value Loop:
  ✓ Transcript upload (audio/video/txt/docx)
  ✓ Auto-transcription (mock or Deepgram)
  ✓ Theme extraction (Claude API)
  ✓ Analysis grid (themes × participants)
  ✓ Evidence panel (quotes + timestamps)
  ✓ Export to CSV/PDF
  ✓ Chat over transcript (RAG)

SEA Features:
  ✓ Code-mixing detection
  ✓ Multi-language support (EN, ID)
  ✓ Mobile responsive design
  ✓ Currency display (SEA currencies)

Monetization:
  ✓ Billing integration (Stripe stub/real)
  ✓ Usage metering
  ✓ Plan enforcement

Infrastructure:
  ✓ Multi-tenant auth
  ✓ Database migrations
  ✓ API documentation
  ✓ Monitoring + error tracking
```

#### Success Metrics:
```
Signups: 1,000+
Activation rate: 40%+
Trial-to-paid: 10%+
Paid customers: 40+
MRR: SGD 4K+
NPS: 30+
```

#### Timeline: Weeks 1-12 (3 months)
#### Owner: Full stack team (backend 70% done, frontend starting)

---

### **PHASE 1A: Enhancement & Growth (Q1 2026, Weeks 13-26, Months 4-6)**

#### Goals:
- Hit 400+ paid customers
- Establish 50%+ 30-day retention
- Prove unit economics (LTV > 3x CAC)
- Launch in Indonesia + Malaysia

#### Features:

**Tier 1 Priority** (Weeks 13-17):
```
Concept Testing:
  ✓ Upload stimulus deck (images/PDFs)
  ✓ Vision-based tagging (Claude vision)
  ✓ Mention extraction
  ✓ Summary per concept

Open Ends Bulk Coding:
  ✓ Upload CSV (1K-10K rows)
  ✓ AI-generate codeframe (sample 100)
  ✓ User review + edit codes
  ✓ Apply codes to all responses
  ✓ Sentiment analysis
  ✓ Export coded data

Video Interview Support:
  ✓ Video player with transcript sync
  ✓ Click transcript → jump to timestamp in video
  ✓ Speaker face tracking (optional)
  ✓ Timestamp clips (select 10-30 sec)
```

**Tier 2 Priority** (Weeks 18-22):
```
Clips & Reels:
  ✓ Create clips from transcript + video (ffmpeg)
  ✓ Auto-subtitle clips
  ✓ Assemble into reels (video montages)
  ✓ Export as MP4
  ✓ Share to LinkedIn/YouTube
  ✓ Shareable links with analytics

Collaborative Features:
  ✓ Inline comments on transcript
  ✓ Reactions (emoji)
  ✓ Comment threading
  ✓ @mention team members
  ✓ Real-time presence (who's viewing)

SEA Localization:
  ✓ Full UI in Bahasa Indonesia
  ✓ i18n framework ready for Thai/Vietnamese
  ✓ Currency switcher (automatic per region)
  ✓ Date/number formatting per locale
```

**Tier 3 Priority** (Weeks 23-26):
```
Knowledge Base (Cross-project):
  ✓ Vector embeddings (pgvector)
  ✓ Search all org transcripts
  ✓ RAG chat over KB
  ✓ Cited results
  ✓ Access control (visibility)

Participant Management:
  ✓ Add participants to project
  ✓ Metadata per participant (demographics)
  ✓ Segment definitions (by city, age, etc.)
  ✓ Grid filtering by segment

Advanced Reporting:
  ✓ Generate text report (findings + evidence)
  ✓ Export to PowerPoint
  ✓ PDF reports with branding
  ✓ Executive summary + appendix
```

#### Success Metrics:
```
Customers: 400+ (10x from MVP)
30-day retention: 50%+
Upgrade rate (to Pro): 10%
Monthly revenue: SGD 40K+
LTV:CAC: 40:1+
NPS: 40+
Geographic:
  Singapore: 200 customers
  Indonesia: 150 customers
  Malaysia: 50 customers
Engagement:
  Chat usage: 60%+ of active users
  Concept testing: 20%+ of teams
  Clips created: 15%+ of teams
```

#### Timeline: 14 weeks (Months 4-6)
#### Owner: Product + Engineering (full team)

---

### **PHASE 1B: Enterprise Features (Q2-Q3 2026, Months 7-10)**

#### Goals:
- Establish Enterprise sales motion
- Win 10+ enterprise contracts (5+ seats)
- Hit SGD 250K+ MRR
- Prove multi-project + network effect retention

#### Features:

**Enterprise Access & Governance**:
```
  ✓ Custom roles (beyond admin/researcher/viewer)
  ✓ Permission matrix per role
  ✓ IP whitelisting
  ✓ Audit logs (all actions)
  ✓ Session management (log out all, timeout)
  ✓ Data export (bulk GDPR/compliance)

  ✓ SSO (SAML 2.0 / OpenID Connect)
  ✓ Auto-join by email domain
  ✓ Just-in-time provisioning

  ✓ Compliance reports (PDPA, UU PDP)
  ✓ Data residency selection (Singapore, Jakarta)
  ✓ PII masking policies
  ✓ DPA + BAA support
```

**Advanced Analysis**:
```
  ✓ Multimarket grids (compare findings across markets)
  ✓ Longitudinal analysis (wave 1 vs. wave 2 vs. wave 3)
  ✓ Subgroup analysis (by segment + market)
  ✓ Cross-project synthesis (find patterns across 5+ projects)
  ✓ Hypothesis testing (test specific claims)
  ✓ Statistical aggregation (if quant data tied in)
```

**Integrations & APIs**:
```
  ✓ REST API (read/write all entities)
  ✓ OAuth 2.0 (third-party apps)
  ✓ Webhooks (real-time events)
  ✓ Zapier official connector
  ✓ n8n official connector
  ✓ CSV import/export (pluggable)
  ✓ Integration with SurveyToGo (fieldwork import)
  ✓ Integration with Dooblo
```

**Live Recording & Collaboration**:
```
  ✓ Live recorder bot (Recall.ai integration)
  ✓ Join Zoom/Meet/Teams/Webex meeting
  ✓ Auto-record + upload to Qual Engine
  ✓ Transcription + analysis same day
  ✓ Multi-cam support

  ✓ Real-time collaboration (WebSocket)
  ✓ Shared playback (watch transcript + video together)
  ✓ Live annotations (during playback)
```

**Fieldwork QC Module** (Optional, high-effort):
```
  ✓ Integration with SurveyToGo / tSurvey CAPI
  ✓ Import recorded audio + structured answers
  ✓ Cross-check: Does audio match recorded answers?
  ✓ Anomaly detection (speeders, straightliners, curbstoning)
  ✓ QC review queue (prioritized by risk)
  ✓ Reconciliation workflow

  ✓ This becomes the competitive moat vs. analysis-only tools
```

#### Success Metrics:
```
Customers: 800+ (total)
Enterprise contracts: 10+
Enterprise MRR: SGD 30K+
Total MRR: SGD 80K+
Average team size: 3+ (multi-seat expansion)
2nd project adoption: 60%+
NPS: 50+
Churn rate: <5% monthly
```

#### Timeline: 16 weeks (Months 7-10)
#### Owner: Product (2 engineers, 1 PM, 1 designer)

---

### **PHASE 2: Market Consolidation (Q4 2026 - Q1 2027, Months 11-18)**

#### Goals:
- Achieve 2,000+ customers
- Establish market leadership position
- Hit SGD 400K+ MRR
- Expand to other SEA markets (Laos, Cambodia, Myanmar)

#### Features:

**AI-Powered Insights (Next-generation)**:
```
  ✓ Auto-generated insights (without user prompting)
  ✓ Surprising findings (anomalies + outliers)
  ✓ Quantified impact (if revenue data available)
  ✓ Competitive intelligence (if competitor data exists)
  ✓ Trend detection (across projects + time)

  ✓ All findings citable with evidence
```

**Market Research Stack Integration**:
```
  ✓ Import from Dscout
  ✓ Import from Discuss.io
  ✓ Import from Recollective (online communities)
  ✓ Import from Qualtrics (survey data)
  ✓ Import from Typeform / SurveyMonkey
  ✓ WhatsApp community import (thread export)

  ✓ Unified analysis across all sources
```

**Presentation & Sharing**:
```
  ✓ Interactive reports (web-based, shareable)
  ✓ Presentation mode (deck of insights)
  ✓ Animated visualizations
  ✓ Embed findings in external docs
  ✓ Public + private sharing links
  ✓ Client portal (restricted view)
```

**Analytics & Optimization**:
```
  ✓ Platform analytics (usage, adoption, churn)
  ✓ Health dashboard (per-customer metrics)
  ✓ User journey analytics
  ✓ Feature adoption tracking
  ✓ Benchmarking (vs. other teams)
```

#### Success Metrics:
```
Customers: 2,000+
MRR: SGD 400K+
ARR: SGD 4.8M+
Geographic spread: 6 countries
Customer segments: Agencies, In-house teams, Enterprises
NPS: 55+
LTV: SGD 2,500+
Churn: <4% monthly
```

#### Timeline: 24 weeks (Months 11-18)
#### Owner: Full team expansion (hiring 5-10 more people)

---

### **PHASE 3: Moat Building & Dominance (Q2-Q3 2027, Months 19-24)**

#### Goals:
- Defensible market position
- Network effects established
- Brand dominant in SEA
- SGD 1M+ MRR (on path to $10M+ ARR)

#### Features:

**Network Effects & Marketplace**:
```
  ✓ Qual Engine marketplace
  ✓ Buy/sell pre-built analysis templates
  ✓ Researcher directory (crowdsource insights)
  ✓ Project resale (insights as products)
  ✓ Qual Intelligence services (human + AI)
```

**Vertical Specialization**:
```
  ✓ CPG-specific templates
  ✓ Fintech-specific workflows
  ✓ Retail-specific dashboards
  ✓ E-commerce-specific reporting
  ✓ Healthtech-specific compliance
```

**Competitive Moats**:
```
  1. Code-mixing database (learned patterns improve over time)
  2. SEA researcher community (2,000+ using platform)
  3. Institutional knowledge base (petabytes of analyzed research)
  4. Regulatory/compliance expertise (PDPA, UU PDP, etc.)
  5. Integration ecosystem (100+ integrations)
  6. Trained AI models on SEA-specific language patterns
```

#### Success Metrics:
```
Customers: 5,000+
MRR: SGD 1,000K+ (SGD 1M)
ARR: SGD 12M+
Market share in SEA: 60%+
NPS: 65+
Brand recognition: Household name for qual research in SEA
```

#### Timeline: 24 weeks (Months 19-24)

---

## High-Level Roadmap Timeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    QUAL ENGINE PRODUCT ROADMAP                      │
│                        18 Month Path to Market Leader               │
└─────────────────────────────────────────────────────────────────────┘

Q1 2026 (Jan-Mar): PHASE 0 - MVP LAUNCH
  Week 1-4:    Backend completion + Frontend MVP development
  Week 5-8:    Core features (upload, analysis, grid, chat)
  Week 9-12:   Polish + launch (public beta, launch marketing)
  Target:      1,000 signups, 40+ paid customers, PMF validation

Q2 2026 (Apr-Jun): PHASE 1A - GROWTH & EXPANSION
  Week 13-17:  Concept testing, Open Ends, Video support
  Week 18-22:  Clips & Reels, Collaboration, Localization
  Week 23-26:  Knowledge Base, Participants, Reporting
  Target:      400+ customers, SGD 40K MRR, 4 SEA countries

Q3 2026 (Jul-Sep): PHASE 1B - ENTERPRISE
  Week 27-35:  Enterprise access, SSO, Audit, Compliance
  Week 36-42:  Advanced analysis, APIs, Live recording, Integrations
  Target:      800+ customers, 10 enterprise contracts, SGD 80K MRR

Q4 2026-Q1 2027: PHASE 2 - CONSOLIDATION
  Months 11-18: AI insights, Stack integrations, Presentations, Analytics
  Target:      2,000+ customers, 6 SEA countries, SGD 400K MRR

Q2-Q3 2027: PHASE 3 - DOMINANCE
  Months 19-24: Marketplace, Specialization, Moats, Community
  Target:      5,000+ customers, 60% market share, SGD 1M+ MRR

KEY PARALLEL ACTIVITIES:
  Ongoing:     Customer success, Support, Community
  Every month: Product review, Metric analysis, Iteration
  Every Q:     Strategic review, Plan adjustment, Planning cycle
```

---

## Quarterly Review & Iteration Framework

### Every Quarter:

1. **Metric Review**
   - Check all metrics against targets
   - Identify 2-3 underperforming areas
   - Hypothesize root causes

2. **Feedback Analysis**
   - NPS feedback themes
   - Support ticket patterns
   - Customer interview themes

3. **Competitive Landscape**
   - Track coloop.ai releases
   - Monitor new entrants
   - Benchmark feature set

4. **Backlog Reprioritization**
   - RICE score remaining features
   - Adjust next quarter based on learnings
   - Communicate changes to team

5. **Stakeholder Communication**
   - Board/investor update
   - Team all-hands
   - Customer advisory board (if formed)

---

## Risk Mitigation

### **Execution Risk**
- **Risk**: Frontend MVP takes longer than expected
- **Mitigation**: Hire senior Next.js engineer, strict scope management, weekly shipping
- **Fallback**: Ship with fewer charts, add in Phase 1

### **Market Risk**
- **Risk**: Coloop.ai launches in SEA and drops prices
- **Mitigation**: Establish brand + retention moat before they react (first 6 months critical)
- **Fallback**: Differentiate harder on code-mixing + local compliance

### **Unit Economics Risk**
- **Risk**: CAC higher than projected, churn higher
- **Mitigation**: Heavy focus on activation + retention in Q1, track LTV:CAC weekly
- **Fallback**: Raise prices, target higher-ARPU segments (Enterprise first)

### **Competitive Risk**
- **Risk**: International competitors catch up on SEA language support
- **Mitigation**: Build proprietary code-mixing training data, maintain local engineer presence
- **Fallback**: Double down on enterprise/compliance moats (harder to replicate)

---

# SUMMARY & NEXT STEPS

## What Makes This Strategy Work

1. **Local-first, not global-first** — We win by being FOR Southeast Asia, not retrofitted for it
2. **Meaningful differentiation** — Code-mixing, data residency, pricing (not just feature parity)
3. **Network effects** — Multi-project + team adoption creates switching costs
4. **Fast execution** — MVP in 12 weeks, not 6 months
5. **Partnerships** — Go-to-market multiplier (agencies, universities, associations)
6. **Unit economics** — Low CAC (word-of-mouth + referral), high LTV (sticky platform)

## Go-to-Market Phasing

```
Week 1-12:   Product MVP (tight scope, SEA language focus)
Week 13-26:  Expansion features + Growth (agencies, universities, partnerships)
Week 27-42:  Enterprise motion + Geographic expansion
Week 43-78:  Market consolidation + Moat building
```

## Financial Projections (6-Month Horizon)

```
Month 1 (MVP):           SGD 4K MRR    (40 customers @ SGD 99)
Month 2 (Growth):        SGD 8K MRR    (100 customers)
Month 3 (Expansion):     SGD 15K MRR   (150 customers)
Month 4 (New Markets):   SGD 25K MRR   (250 customers)
Month 5 (Partnerships):  SGD 35K MRR   (350 customers)
Month 6 (Consolidation): SGD 50K MRR   (400+ customers, SGD 600K ARR)
```

**Assumptions**:
- 50% Singapore, 30% Indonesia, 15% Malaysia/Thailand, 5% other
- 80% Professional, 15% Starter, 5% Enterprise (ramping)
- 50% annual vs. 50% monthly billing (improving to 60/40 by Month 6)
- LTV:CAC ratio of 40:1+ (strong unit economics)

## Immediate Next Steps (This Week)

1. **Week 1**: Frontend MVP sprint planning
   - Finalize feature scope (cut ruthlessly)
   - Design system review
   - Timeline commitment

2. **Week 2**: Marketing prep
   - Product Hunt campaign outline
   - Press list for launch
   - Partnership outreach templates

3. **Week 3-4**: Soft launch to beta users
   - Internal testing + QA
   - Iterate on activation flow
   - Gather initial feedback

---

**End of Product Strategy Document**

This strategy provides a clear path to becoming the dominant qualitative research platform in Southeast Asia. The key differentiators are:

1. **Being built FOR SEA** (not adapted for it)
2. **Solving real local problems** (code-mixing, mobile, pricing)
3. **Moving fast** (MVP in 12 weeks, not 6 months)
4. **Building network effects** (multi-project + team adoption)
5. **Establishing partnerships** (agencies, universities, integrations)

Success metrics are clear, quarterly reviews will drive iteration, and risk mitigation is baked into the plan. The team is ready to execute.
