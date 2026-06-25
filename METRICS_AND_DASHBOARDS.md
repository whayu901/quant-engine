# Qual Engine: Metrics & Dashboard Framework
## Comprehensive Tracking for Product-Market Fit & Growth

**Purpose**: Define exact metrics, targets, and dashboards for tracking Qual Engine's success
**Audience**: Product, Finance, Leadership
**Update Frequency**: Weekly (operational), Monthly (strategic), Quarterly (planning)

---

# NORTH STAR METRIC

## Primary: Monthly Recurring Revenue (MRR)

**Definition**: Predictable revenue from active paid subscriptions (monthly recurring only)

**Formula**:
```
MRR = (# Professional customers × SGD 99)
    + (# Enterprise customers × avg SGD XXX)

Example Month 3:
  150 Professional @ SGD 99 = SGD 14,850
  2 Enterprise @ SGD 500 = SGD 1,000
  + Overages SGD 500
  = SGD 16,350 MRR
```

**Target progression**:
```
Month 1: SGD 4K
Month 2: SGD 10K
Month 3: SGD 15K
Month 4: SGD 25K
Month 5: SGD 35K
Month 6: SGD 50K
```

**Why MRR?** It captures growth, retention, and unit economics in one metric.

---

# CUSTOMER ACQUISITION METRICS

## Tier 1: Funnel Metrics (Track Weekly)

### Sign-up Funnel

```
Metric                        | Week 1 | Week 4 | Month 3 | Month 6 | Target %
═══════════════════════════════════════════════════════════════════════════
Landing page views            | 1,000  | 5,000  | 20,000  | 50,000  | Base
Sign-up page views            | 400    | 1,500  | 6,000   | 15,000  | 40%
Sign-ups (email)              | 100    | 500    | 2,000   | 5,000   | 25%
Email verified                | 85     | 450    | 1,700   | 4,250   | 85%
Create project                | 65     | 315    | 1,190   | 3,000   | 65%
Upload transcript             | 50     | 225    | 850     | 1,950   | 50%
Transcription complete        | 47     | 213    | 808     | 1,851   | 95%
Run first analysis            | 40     | 180    | 680     | 1,570   | 80%
ACTIVATED                     | 40     | 160    | 680     | 1,680   | 40%
                              |        |        |         |         |
Trial → Paid conversion       | 4      | 16     | 68      | 168     | 10%
PAID CUSTOMER                 | 4      | 16     | 68      | 168     |
```

**Conversion rate targets**:
- Landing → signup: 40%
- Signup → email verified: 85%
- Verified → create project: 65%
- Create project → upload: 75%
- Upload → activated: 80%
- **Overall signup → activated**: 40%
- **Trial → paid**: 10% (60 paid from 600 trialed)

### Trial Funnel (14-day professional tier)

```
Metric                        | Target
═════════════════════════════════════════════
Trial starts (signup day)     | 100%
Trial: Day 3 (30% drop off)   | 70%
Trial: Day 7 (50% drop off)   | 50%
Trial: Day 10 (60% drop off)  | 40%
Trial: Day 14 (75% drop off)  | 25%
  ├─ Convert to paid          | 10% (of day 14)
  ├─ Downgrade to Starter     | 10% (of day 14)
  └─ Churn                    | 5% (of day 14)
```

### Paid Customer Acquisition Channels

```
Channel                | Week 12 | Month 3 | Month 6 | % of Total | CAC
════════════════════════════════════════════════════════════════════════
Organic (search/blog)  | 20      | 50      | 120     | 30%        | <SGD 0
Product Hunt           | 5       | 5       | 5       | 1.25%      | SGD 20
Partnerships/agencies  | 8       | 30      | 120     | 30%        | SGD 15
Influencer/word-mouth  | 5       | 20      | 80      | 20%        | SGD 10
Paid ads (SEM/social)  | 2       | 20      | 75      | 19%        | SGD 60
Direct (email)         | —       | —       | —       | —          | $0
════════════════════════════════════════════════════════════════════════
TOTAL                  | 40      | 125     | 400     | 100%       | ~SGD 30
```

**Target CAC**: <SGD 50 (blended)
**Why**: With LTV of SGD 1,800+ (18 mo × SGD 99), 40:1 LTV:CAC ratio = excellent

---

## Tier 2: Campaign Metrics (Track Monthly)

### Marketing Campaign Performance

**Launch Campaign (Week 12)**
```
Campaign: Product Hunt Launch

Metrics:
  Reach (impressions)           | 50,000
  Engagement rate               | 15%
  Click-through rate (CTR)      | 5%
  Clicks to site                | 2,500
  Sign-ups from PH              | 300 (12% of clicks)
  Paid conversion               | 30 (10% of signups)
  CAC                           | SGD 20

Success criteria:
  ☐ Top 10 on Product Hunt (top 3 ideal)
  ☐ 100+ upvotes
  ☐ 50+ positive comments
  ☐ 300+ signups (threshold)
  ☐ NPS from PH users >35
```

**Ongoing Campaign Metrics**
```
Blog post efficiency:
  Views per post        | 500
  Sign-ups per post     | 25 (5% click-through)
  % posts getting 500+ views | 75%

Webinar efficiency:
  Registrations         | 200 per webinar
  Attendance rate       | 60% (120 actual)
  Sign-ups post-webinar | 30 (15% of attendees)
  Paid conversion       | 3 (10% of sign-ups)

LinkedIn post efficiency:
  Impressions per post  | 5,000
  Engagement rate       | 10%
  Click-through rate    | 2%
  Sign-ups per 1K impressions | 2.5
```

---

# ACTIVATION METRICS

## Goal: Get user to first aha moment

### Definition: Aha Moment for Qual Engine
**User uploads transcript → sees themes auto-extracted → realizes "This saved me 30 hours"**

### Activation Rate & Funnel

```
Metric                              | Target | How to Track
═════════════════════════════════════════════════════════════════════════════
Signup → Email verified             | 85%    | Auth events
Email verified → Create project     | 65%    | Project events
Create project → Upload transcript  | 75%    | Ingestion events
Upload started → Upload completed   | 95%    | Upload events
Transcription started               | 90%    | Transcription events
Transcription completed             | 95%    | Transcription events
Analysis started                    | 78%    | Analysis events
Analysis completed                  | 92%    | Analysis events
Analysis viewed                     | 99%    | Page view events
ACTIVATED                           | 40%    | Conversion event
═════════════════════════════════════════════════════════════════════════════

Overall: 40% of sign-ups → activation in first week
```

### Aha Moment Timing

```
Metric                                    | Target | Current
═══════════════════════════════════════════════════════════════════
Time from sign-up to first login         | <1 min | Track
Time from login to create project        | <5 min | Track
Time from create project to upload       | <10 min| Track
Time from upload to transcription start  | <1 min | Track
Transcription time (median)              | <5 min | Track
Time from transcription to analysis view | <2 min | Track
═══════════════════════════════════════════════════════════════════
TOTAL: Sign-up to aha moment             | <30 min| TARGET: <20 min

Stretch goal: <15 min
```

**Why timing matters**: If user reaches aha moment in <20 min, activation rate >45%. If >30 min, activation rate drops to <30%.

### Feature Engagement on Day 1

```
Feature                      | % of Activated Users | Benchmark
═══════════════════════════════════════════════════════════════════
Viewed transcript            | 100%                | Baseline
Clicked on a theme           | 70%+                | Good
Viewed evidence panel        | 65%+                | Good
Asked chat question          | 30%+                | Excellent
Shared analysis with team    | 15%+                | Good
Created a second analysis    | 5%+                 | Excellent
═══════════════════════════════════════════════════════════════════
```

---

# ENGAGEMENT METRICS

## Goal: Users come back & use more features

### Daily/Weekly Active Users

```
Metric                                  | Week 1 | Week 4 | Month 3 | Month 6
═════════════════════════════════════════════════════════════════════════════════
Daily Active Users (DAU)                | 10     | 50     | 200     | 500
Weekly Active Users (WAU)               | 25     | 140    | 500     | 1,200
Monthly Active Users (MAU)              | 40     | 160    | 680     | 1,680
WAU/MAU ratio (engagement)              | 63%    | 88%    | 73%     | 71%
Median session length                   | 8 min  | 12 min | 15 min  | 15 min
Sessions per user per week              | 1.5    | 2.5    | 2.0     | 1.8
```

**Target**: 50% of users are active weekly (WAU/MAU = 50%+)

### Feature Adoption (% of Active Users)

```
Feature                  | Week 4 | Month 3 | Month 6 | Target
════════════════════════════════════════════════════════════════════
Chat                     | 40%    | 55%     | 60%     | 70% by M6
Analysis grid            | 90%    | 92%     | 93%     | 95%
Evidence panel           | 70%    | 78%     | 82%     | 85%
Export (CSV/PDF)         | 45%    | 55%     | 60%     | 70%
Team comments            | 15%    | 25%     | 35%     | 40% by M6
Video player             | 20%    | 35%     | 45%     | 50% by M6
Concept testing          | 5%     | 12%     | 20%     | 25% by M6
Open ends coding         | 3%     | 8%      | 15%     | 20% by M6
Clips created            | 0%     | 2%      | 10%     | 15% by M6
Knowledge base search    | 0%     | 0%      | 15%     | 30% by M6
════════════════════════════════════════════════════════════════════
```

### Engagement by Project Lifecycle

```
Stage                    | % of Users | Activity | NPS
════════════════════════════════════════════════════════════════════════
Project 1 (first week)   | 100%       | Very high | 35
Project 1 (week 2-4)     | 70%        | High      | 40
Project 1 (month 2)      | 45%        | Moderate  | 38
Project 1 (month 3+)     | 25%        | Low       | 35
                         |            |           |
Project 2 (first week)   | 60%        | Very high | 45
Project 2 (ongoing)      | 40%        | Moderate  | 42
                         |            |           |
Project 3+               | 30%        | High      | 50
════════════════════════════════════════════════════════════════════════
```

**Key insight**: Users with multiple projects have higher engagement + NPS. Target: 60% of customers with 2+ concurrent projects by Month 6.

### Chat Usage

```
Metric                                    | Week 4 | Month 3 | Month 6 | Target
═════════════════════════════════════════════════════════════════════════════════════
% of users using chat                    | 40%    | 55%     | 60%     | 70%
Avg chats per user per week               | 1.2    | 1.8     | 2.5     | 3.0
Chats with >1 follow-up question (%)      | 35%    | 45%     | 55%     | 60%
Users who cited answer (%)                | 85%    | 88%     | 90%     | 95%
Average response time (sec)               | 3      | 2       | 1.5     | <2
User satisfaction (ease of use)           | 4.0/5  | 4.3/5   | 4.5/5   | 4.5+
═════════════════════════════════════════════════════════════════════════════════════
```

---

# RETENTION METRICS

## Goal: Users keep paying month-to-month

### Cohort Retention (% Active in Month N)

```
Cohort    | Week 1 | Week 2 | Week 3 | Week 4 | M2 | M3 | M4 | M5 | M6
═════════════════════════════════════════════════════════════════════════
Sign-ups | 100%   | 65%    | 55%    | 50%    | 50%| 40%| 35%| 30%| —
         |        |        |        |        |    |    |    |    |
Week 1   | 100%   | 70%    | 60%    | 55%    | 50%| 45%| 40%| —  | —
↓        |        |        |        |        |    |    |    |    |
Week 4   |        | 100%   | 75%    | 65%    | 60%| 55%| 50%| —  | —
         |        |        |        |        |    |    |    |    |
Month 2  |        |        | 100%   | 78%    | 70%| 65%| —  | —  | —
         |        |        |        |        |    |    |    |    |
Month 3  |        |        |        | 100%   | 80%| 75%| —  | —  | —
         |        |        |        |        |    |    |    |    |
Target:  | 100%   | 70%    | 60%    | 55%    | 50%| 45%| 40%| —  | —
═════════════════════════════════════════════════════════════════════════
```

**Key**: Month 1 retention (Month 1 → Month 2) is critical. If >50%, strong signal of retention.

### Churn Analysis

```
Metric                           | Target
═══════════════════════════════════════════════════════════════════════════════
Monthly churn rate               | <10% (Months 1-3)
                                 | <8% (Months 4-6)
Reasons for churn (% breakdown)  |
  └─ Project ended               | 50%
  └─ Price too high              | 20%
  └─ Features missing            | 15%
  └─ Product issues              | 10%
  └─ Switching to competitor     | 5%

Churn prediction:
  Users with 0 chats in week 3   | 30% churn rate
  Users with 0 analyses in M2    | 25% churn rate
  Users without 2nd project      | 15% churn rate
  Users with team comments       | 5% churn rate
═══════════════════════════════════════════════════════════════════════════════
```

### Expansion/Upgrade Metrics

```
Metric                          | Target
═════════════════════════════════════════════════════════════════════
% Starter users upgrading       | 5-10%
% Pro users adding seats        | 20%+
% Pro users upgrading to Ent.   | 3-5%
Avg seats per customer          | Month 1: 1.0
                                | Month 3: 1.5
                                | Month 6: 2.0
Multi-project adoption          | Month 1: 20%
                                | Month 3: 45%
                                | Month 6: 60%
Expansion MRR (from existing)   | Month 3: +SGD 500
                                | Month 6: +SGD 2K
═════════════════════════════════════════════════════════════════════
```

---

# UNIT ECONOMICS METRICS

## Customer Acquisition Cost (CAC)

```
Formula: CAC = Total Marketing & Sales Spend / New Customers Acquired

Components:
  - Paid ads (Google, LinkedIn)
  - Content creation
  - Tools (analytics, email)
  - Sales/BD salaries
  - Partnerships/sponsorships

Calculation by channel:

Channel              | Spend      | Customers | CAC
═══════════════════════════════════════════════════════════════════════
Organic              | $0         | 120       | $0
Product Hunt         | $500       | 30        | $17
Partnerships         | $2,000     | 120       | $17
Paid ads             | $3,000     | 50        | $60
Content/blog         | $1,000     | 80        | $12
════════════════════════════════════════════════════════════════════════
TOTAL Month 6        | $6,500     | 400       | ~$16 (SGD 22)

Target CAC: <SGD 50
Actual CAC: ~SGD 30 (blended, Month 6)
```

## Customer Lifetime Value (LTV)

```
Formula: LTV = ARPU × Gross Margin × Average Customer Lifespan (months)

Calculation:

Component              | Value      | Notes
══════════════════════════════════════════════════════════════════════════
ARPU (avg revenue)     | SGD 105    | 70% Pro@99, 15% Starter@49, 15% Ent@300
Gross Margin           | 85%        | Server costs ~10%, payment processing 5%
Retention (Month 1-6)  | 50%        | Month 1 retention rate
Avg lifespan (months)  | 18         | Assuming 50% churn rate compounds
══════════════════════════════════════════════════════════════════════════
LTV = 105 × 0.85 × 18 = SGD 1,607

LTV:CAC ratio = 1,607 / 30 = 53:1 (Excellent)
Target: >3:1 (we're at 53:1, very healthy)
```

## Payback Period

```
Formula: CAC Payback = CAC / (ARPU × Gross Margin)

Calculation:
  CAC = SGD 30
  ARPU = SGD 105
  Gross Margin = 85%

  Payback = 30 / (105 × 0.85) = 30 / 89 = 0.34 months (10 days)

Target: <3 months
Actual: <1 month (excellent)

Interpretation: Each customer pays for their acquisition in 10 days.
Everything after that is profit. Highly scalable model.
```

---

# NETWORK EFFECTS METRICS

## Measuring Product-Market Fit

### Virality Coefficient

```
Formula: VC = (# invites per customer) × (% of invites accepted) × (% who become paid)

Example Month 6:
  Invites per customer      | 3.5
  Acceptance rate           | 40%
  Paid conversion from team | 30% (of accepted)

  VC = 3.5 × 0.40 × 0.30 = 0.42

Target VC: >0.3 indicates viral growth potential
Actual: 0.42 (good, but not yet self-sustaining at 1.0)
```

### Viral Loop Metrics

```
Metric                              | Baseline | Target
═════════════════════════════════════════════════════════════════════════
% of users who invite teammates    | 35%      | 55%+
Avg team size (new orgs)            | 1.0      | 2.0+
% of teams with 3+ members         | 10%      | 30%+
Organic growth (% of signups)       | 40%      | 60%+
Referral coefficient (referrals)    | 0.1      | 0.3+
═════════════════════════════════════════════════════════════════════════
```

### Multi-Project Adoption (Stickiness Indicator)

```
Metric                              | Target
═════════════════════════════════════════════════════════════════════════
% with 1 project only               | <20% (these churn easily)
% with 2 projects                   | 40%
% with 3+ projects                  | 40% (power users, <5% churn)

Days to 2nd project (median)        | <45 days
Retention for single-project users  | 30%
Retention for multi-project users   | 80%

Action: Drive 60%+ of customers to 2nd project by Month 6
```

---

# QUALITY METRICS

## Product Quality

### API & Performance

```
Metric                              | Target
═════════════════════════════════════════════════════════════════════════
API uptime                          | 99.5%
API response time (p50)             | <100ms
API response time (p99)             | <500ms
Frontend page load (p50)            | <2 sec
Frontend page load (p99)            | <5 sec
Error rate (5xx errors)             | <0.1%
Database query latency (p99)        | <100ms
```

### Feature Quality

```
Metric                              | Target
═════════════════════════════════════════════════════════════════════════
Transcription accuracy              | 95%+
Theme extraction accuracy           | 80%+ (vs. manual coding)
Chat answer relevance               | 85%+ (in user surveys)
Evidence precision (correct quotes) | 95%+
Code-mixing detection accuracy      | 90%+
Export file quality                 | 100% (no corruption)
```

### Reliability

```
Metric                              | Target
═════════════════════════════════════════════════════════════════════════
Transcription completion rate       | 99%+
Analysis generation success         | 98%+
Payment failure rate                | <0.5%
Data loss incidents                 | 0
Security incidents                  | 0
```

---

# CUSTOMER SATISFACTION METRICS

## NPS (Net Promoter Score)

### Quarterly NPS Survey

```
Question: "How likely are you to recommend Qual Engine to a colleague?"
(Scale: 0-10)

Segments & Targets:
  Overall NPS                       | 30 (Month 1) → 50 (Month 6)
  By customer segment:
    └─ Agencies                     | 45+
    └─ In-house teams               | 40+
    └─ Enterprises                  | 50+
  By geography:
    └─ Singapore                    | 45+
    └─ Indonesia                    | 40+
    └─ Others                       | 35+
  By feature usage:
    └─ Heavy users (3+ features)    | 55+
    └─ Medium users                 | 40+
    └─ Light users                  | 25+
```

### NPS Feedback Analysis

```
Promoters (9-10):
  Main quote: "Saves me so much time"
  Key drivers: Speed, ease of use, code-mixing detection

Passives (7-8):
  Main quote: "Good tool, missing a few features"
  Key drivers: Specific feature requests, support response time

Detractors (0-6):
  Main quote: "Too expensive for what it does" / "Buggy"
  Key drivers: Pricing, feature gaps, reliability issues
```

## CSAT (Customer Satisfaction)

```
Question: "How satisfied are you with Qual Engine?" (1-5 scale)

Target: >4.0 / 5.0 average

Dimensions:
  Ease of use              | 4.3
  Feature completeness     | 3.9
  Speed/performance        | 4.2
  Support quality          | 4.1
  Price/value              | 4.4
  Overall                  | 4.2
```

## Support Metrics

```
Metric                              | Target
═════════════════════════════════════════════════════════════════════════
First response time                 | <4 hours (Month 1-3)
                                    | <2 hours (Month 4+)
Resolution time                     | <24 hours (95% of tickets)
Ticket volume per 100 users         | <5/month
Customer satisfaction (support)     | >4.5/5
Repeat tickets (% that resurface)   | <5%
```

---

# FINANCIAL METRICS

## Revenue & Profitability

```
Month    | Customers | MRR     | ARR      | Gross Profit | COGS | Op Exp | Net
═════════════════════════════════════════════════════════════════════════════════
Month 1  | 40        | 4,000   | 48,000   | 3,400        | 600  | 5,000  | -2,200
Month 2  | 100       | 10,000  | 120,000  | 8,500        | 1,500| 6,000  | +1,000
Month 3  | 150       | 15,000  | 180,000  | 12,750       | 2,250| 7,000  | +3,500
Month 4  | 250       | 25,000  | 300,000  | 21,250       | 3,750| 8,000  | +9,500
Month 5  | 350       | 35,000  | 420,000  | 29,750       | 5,250| 10,000 | +14,500
Month 6  | 400       | 50,000  | 600,000  | 42,500       | 7,500| 12,000 | +23,000
```

**COGS**: Infrastructure costs (Stripe fees 2.9%, hosting 2%, misc 0.1%)
**Op Exp**: Team, tools, marketing, support
**Target**: Break even by Month 3, profitable by Month 4

---

# COMPETITIVE METRICS

## Market Share Tracking

```
Metric                                  | Month 1 | Month 3 | Month 6
═════════════════════════════════════════════════════════════════════════════════
Qual Engine market share (SEA)          | 0.2%    | 0.8%    | 2.4%
Coloop market share (SEA)               | 0.5%    | 0.5%    | 0.8%
Manual research (still majority)        | 99.3%   | 98.7%   | 96.8%

Market share calculation:
  Our revenue: SGD 600K/year
  SEA qual software market: ~SGD 25M/year
  = 2.4% market share by Month 6
```

## Feature Parity Scorecard

```
Feature                         | Qual Engine | Coloop | Dovetail | Winner
═════════════════════════════════════════════════════════════════════════════
Transcription                   | ✓           | ✓      | ✓        | Tie
Analysis grids                  | ✓           | ✓      | ✓        | Tie
Chat over transcript            | ✓           | ✓      | ✓        | Tie
Code-mixing detection           | ✓           | ✗      | ✗        | QE
Bahasa Indonesia support        | ✓           | ✗      | ✗        | QE
Data residency (SEA)            | ✓           | ✗      | ✗        | QE
PDPA compliance                 | ✓           | Partial| ✗        | QE
Pricing (SGD/user)              | 99          | 500    | 600      | QE
Support in local language       | ✓           | ✗      | ✗        | QE
WhatsApp integration            | ✓           | ✗      | ✗        | QE

Score:
  Feature parity: 7/10 vs Coloop (70% on features they have)
  Differentiation: 10/10 (6 features only we have)
```

---

# DASHBOARD IMPLEMENTATION

## Weekly Dashboard (Every Monday)

### 1. Acquisition
- New signups (this week + cumulative)
- New paid customers (this week + cumulative)
- Activation rate (%)
- Acquisition channels (breakdown)

### 2. Engagement
- WAU / DAU ratio (%)
- Sessions per active user (avg)
- Chat usage (% of users, avg queries)
- Feature adoption (grid, clips, open ends %)

### 3. Retention
- 7-day retention (current cohort)
- 30-day retention (previous cohort)
- Churn rate (%)
- Expansion MRR (from upsells)

### 4. Unit Economics
- MRR (current)
- CAC (blended)
- LTV (estimate)
- LTV:CAC ratio

### 5. Health
- API uptime (%)
- Support response time (avg)
- NPS trend
- Critical bugs open

---

## Monthly Dashboard (First day of month)

### 1. Full P&L
- MRR
- ARR (annualized)
- Gross profit
- Operating expenses
- Net profit/loss

### 2. Cohort Analysis
- Retention by signup month
- LTV by cohort
- Churn by cohort
- Most valuable cohort

### 3. Customer Segments
- By plan (Starter, Pro, Enterprise)
- By geography
- By industry
- By use case

### 4. Key Metrics
- NPS (with breakdown)
- CSAT (by dimension)
- Support metrics
- Feature adoption

### 5. Forecast
- Revenue forecast (next 3 months)
- Customer forecast
- Churn forecast
- Growth rate trend

---

## Quarterly Dashboard (Every 13 weeks)

### 1. Strategic Review
- Progress vs. Q plan
- New learnings
- Competitive moves observed
- Market changes

### 2. Full Metrics Review
- All KPIs vs. targets
- Cohort analysis (full)
- Segment performance
- Profitability analysis

### 3. Unit Economics Deep Dive
- CAC by channel (actual)
- LTV by segment
- Payback period
- Gross margin trend

### 4. Customer Stories
- 3-4 case studies
- Customer quotes
- Use cases
- Testimonials

### 5. Planning for Next Q
- Adjusted forecast
- Risk/opportunities
- Resource allocation
- Top priorities

---

# TOOLS & SETUP

## Recommended Tools

| Function | Recommended Tool | Alternative |
|---|---|---|
| **Analytics** | Mixpanel or Amplitude | Segment, Heap |
| **BI/Dashboards** | Metabase (self-hosted) | Looker, Tableau |
| **NPS Surveys** | Delighted or Promoter.io | NPS.com, Slido |
| **Cohort Analysis** | Built into Mixpanel | Custom SQL queries |
| **Financial** | Stripe (native) | Chargebee, Paddle |
| **CRM** | Salesforce or Pipedrive | HubSpot, Zendesk |
| **Documentation** | Notion | Confluence, GitBook |

## Event Tracking Schema

**Core events to track** (in analytics tool):

```
Authentication:
  - user_signed_up
  - user_logged_in
  - user_verified_email

Projects:
  - project_created
  - project_deleted
  - project_archived

Transcripts:
  - transcript_uploaded
  - transcription_started
  - transcription_completed
  - transcript_viewed

Analysis:
  - analysis_started
  - analysis_completed
  - analysis_viewed
  - theme_clicked (evidence panel)

Chat:
  - chat_message_sent
  - chat_response_received
  - chat_helpful (user confirms answer is correct)

Features:
  - clips_created
  - open_ends_coded
  - concept_testing_started
  - knowledge_base_searched
  - team_comment_added

Engagement:
  - session_started
  - session_ended
  - page_viewed

Billing:
  - trial_started
  - trial_ended
  - subscription_created
  - subscription_upgraded
  - subscription_downgraded
  - subscription_cancelled
```

---

# CONCLUSION

**These metrics and dashboards are your product heartbeat.**

- Track them obsessively
- Update weekly (operational) and monthly (strategic)
- Share with team in Friday reviews
- Use to drive product decisions
- Adjust targets based on learnings (but don't move them wildly)

**Key principle**: Metrics should tell a story. If you see churn spike, dig into why. If activation drops, test your flow. If engagement plateaus, evaluate features.

**Good luck! Monitor relentlessly. Iterate fearlessly.** 🚀
