# Qual Engine - Assumption Map Executive Summary
## One-Page Risk Overview & Critical Next Steps

**Date:** June 25, 2026
**Status:** Backend 70% complete | Frontend NOT started | ZERO customer validation
**Burn Rate:** High (6-8 months invested) | **Risk Level:** CRITICAL

---

## The Brutal Truth in 3 Sentences

1. You've built 70% of a sophisticated backend for a product **with zero evidence anyone wants it**.
2. You have **5 killer assumptions** that could invalidate the entire business, and you've tested **none of them**.
3. You're about to spend 3-6 months building a frontend for a market that **might not exist**.

---

## Visual Assumption Map

```
                    EVIDENCE QUALITY
                    ←─────────────────→
                    WEAK        STRONG

    ┌────────────────────────────────────────┐
    │  HIGH RISK ASSUMPTIONS (Test NOW)     │
I   │                                        │
M   │  💀 V1: Language barrier is real pain │
P   │  💀 V3: No local competitors exist    │
O   │  💀 B1: $49-149 pricing acceptable    │
R   │  💀 B2: Enterprises trust local       │
T   │  💀 B9: Buyers want software not      │
A   │         services                       │
N   │  💀 U2: Analysis output is usable     │
C   │  💀 U5: Users trust AI coding         │
E   │  💀 F1: API costs sustainable         │
    │                                        │
    │  📊 TOTAL: 15 assumptions             │
    │  ✅ TESTED: 0                         │
    │  ❌ INVALIDATE BUSINESS IF WRONG: 5   │
    └────────────────────────────────────────┘
    │                                        │
    │  MEDIUM RISK (Test After MVP)         │
M   │                                        │
E   │  ⚠️ U1: Can use without training      │
D   │  ⚠️ V6: AI analysis valued over manual│
    │  ⚠️ B8: Margins positive after AI     │
I   │  ⚠️ F2: SEA transcription accurate    │
U   │                                        │
M   └────────────────────────────────────────┘
    │                                        │
    │  LOW RISK (Monitor)                   │
L   │                                        │
O   │  ✓ F4: Team can build frontend        │
W   │  ✓ F8: Data residency achievable      │
    │                                        │
    └────────────────────────────────────────┘
```

---

## The 5 Killer Assumptions (Detailed)

| # | Assumption | Why It's Deadly | Current Evidence | What Happens If Wrong |
|---|---|---|---|---|
| **1** | **SEA researchers struggle with English-only tools due to language barriers** | Your ENTIRE positioning and moat | **ZERO** - No user interviews | Competing head-to-head with funded Western players = you lose |
| **2** | **No strong local competitor exists** | Building assuming clear field | **WEAK** - Cursory Google search only | Competitor has 2-year head start + local relationships = DOA |
| **3** | **Enterprises trust local solutions over Western brands** | Betting on "local = trust" (often backwards in SaaS) | **ZERO** - No buyer interviews | Enterprises buy Western brands despite higher cost = no segment |
| **4** | **$49-149 pricing is acceptable in SEA market** | 50% below Western pricing = "cheap" or still too expensive? | **ZERO** - Random price points | Too cheap = low quality perception, too expensive = "we'll use Excel" |
| **5** | **Researchers buy software vs agencies doing analysis** | SEA qual market may be service-led, not tool-led | **ZERO** - Assumed software-first | Built DIY tool for market that wants full-service = PMF 0 |

---

## Risk Exposure Assessment

### Financial Risk
- **Sunk Cost:** 6-8 months development (~$200K opportunity cost)
- **At Risk:** 3-6 months frontend dev (~$100K-150K more)
- **Total Exposure:** ~$350K if all assumptions wrong

### Time Risk
- **Current Burn:** 6-8 months to 70% backend
- **Projected:** +3-6 months for frontend
- **Pivot Cost:** If validated wrong AFTER frontend = 9-14 months total wasted

### Competitive Risk
- **Unknown Competitors:** May exist but not found (non-English websites, in-house tools)
- **Emerging Threats:** Stealth competitors building same thing
- **Incumbent Response:** coloop/Dovetail could add SEA languages faster than you can launch

### Market Risk
- **TAM Unknown:** No idea if market is 100 or 10,000 potential customers
- **Willingness to Pay Unknown:** Price sensitivity completely assumed
- **Buying Behavior Unknown:** Software vs service preference not validated

---

## Validation Priority Ranking

```
┌─────────────────────────────────────────────────┐
│ WEEK 1-2: VALIDATE OR DIE                      │
├─────────────────────────────────────────────────┤
│ ✅ Experiment 1A: Language Pain Interviews     │
│    → 10 SEA researchers, $500, 7 days          │
│    → VALIDATES: V1, V4, V10                    │
│                                                 │
│ ✅ Experiment 1B: Competitor Deep Dive         │
│    → Systematic search + agency calls, $200    │
│    → VALIDATES: V3                             │
│                                                 │
│ ✅ Experiment 1C: Pricing Landing Page         │
│    → $500 ads, track plan clicks               │
│    → VALIDATES: B1, B3                         │
├─────────────────────────────────────────────────┤
│ GATE 1 (Day 14): GO / PIVOT / STOP Decision   │
└─────────────────────────────────────────────────┘
            ↓ IF VALIDATED ↓
┌─────────────────────────────────────────────────┐
│ WEEK 3-4: CONCIERGE MVP (Manual Service)       │
├─────────────────────────────────────────────────┤
│ ✅ Experiment 2A: Manual Analysis for 5 Users  │
│    → Process transcripts manually, $500        │
│    → VALIDATES: U2, U5, B9                     │
├─────────────────────────────────────────────────┤
│ GATE 2 (Day 28): BUILD FRONTEND or PIVOT      │
└─────────────────────────────────────────────────┘
            ↓ IF VALIDATED ↓
┌─────────────────────────────────────────────────┐
│ MONTH 2-3: BUILD MINIMAL FRONTEND MVP          │
│ → ONLY: Login, Upload, View, Export, Billing  │
│ → NO: Grids, Charts, Collaboration, Media     │
└─────────────────────────────────────────────────┘
```

---

## Cost-Benefit Analysis: Validate vs Risk It

### Option A: VALIDATE FIRST (Recommended)

| Phase | Timeline | Cost | Risk |
|---|---|---|---|
| Experiments 1A-1C | Week 1-2 | $1,200 | LOW - Cheap to pivot |
| Concierge MVP (2A) | Week 3-4 | $500 | LOW - Manual service |
| **Decision Gate** | **Day 28** | - | **GO/PIVOT/STOP** |
| Build MVP Frontend | Month 2-3 | $0* | LOW - Validated demand |
| **(IF validated)** | | | |
| **TOTAL** | **3 months** | **$1,700** | **MINIMAL** |

**Outcome if assumptions wrong:** Pivot or stop at $1,700 cost, 1 month sunk

---

### Option B: RISK IT (Current Plan)

| Phase | Timeline | Cost | Risk |
|---|---|---|---|
| Build Full Frontend | Month 1-3 | $0* | HIGH - Unvalidated |
| Launch & Pray | Month 4 | $5K (marketing) | VERY HIGH |
| Realize no PMF | Month 5-6 | - | - |
| Scramble to Pivot | Month 7-9 | $10K+ | EXTREME |
| **TOTAL** | **9 months** | **$15K+** | **CATASTROPHIC** |

**Outcome if assumptions wrong:** 9-14 months wasted, high sunk cost, hard to pivot

---

## Critical Mistakes Analysis

| Mistake | Severity | Cost | Fix |
|---|---|---|---|
| **Built features before validating demand** | 🔴 CRITICAL | 6-8 months | Stop building, start validating |
| **Zero customer conversations** | 🔴 CRITICAL | Unknown market | 10 interviews THIS WEEK |
| **Competitor analysis = Google search** | 🔴 CRITICAL | Blind to threats | Systematic local-language scan |
| **Pricing based on "50% below Western"** | 🟠 HIGH | Wrong revenue model | Van Westendorp study |
| **Building for 3 segments simultaneously** | 🟠 HIGH | Diluted positioning | Pick ONE (agencies) |
| **Optimized for scale before proving demand** | 🟡 MEDIUM | Over-engineering | MVP mentality |
| **Assumed SEA market is homogeneous** | 🟡 MEDIUM | Wrong positioning | Pick ONE country (Indonesia) |

---

## Recommended Action Plan (Next 30 Days)

### Days 1-7: STOP BUILDING, START VALIDATING

**DO:**
- [ ] Interview 10 SEA qual researchers (Experiment 1A)
- [ ] Systematic competitor scan in Indonesian, Thai, Malay (Experiment 1B)
- [ ] Build pricing test landing page, run ads (Experiment 1C)

**DON'T:**
- [ ] Write ANY new code
- [ ] Design frontend screens
- [ ] Set up infrastructure

**Investment:** $1,200 | **Output:** Validation data or pivot signal

---

### Days 8-14: ANALYZE & DECIDE

**Questions to Answer:**
1. Is language pain REAL and ACUTE? (7+ of 10 researchers confirm)
2. Are competitors ABSENT or WEAK? (No funded local players found)
3. Is pricing ACCEPTABLE? (30%+ interested in $49+ plans)
4. Will they SWITCH? (6+ express strong intent)

**Decision Gate:**
- ✅ **4/4 YES** → Proceed to Concierge MVP
- ⚠️ **2-3 YES** → Pivot positioning/pricing/features, re-validate
- ❌ **0-1 YES** → STOP or major pivot (different market/problem)

---

### Days 15-28: CONCIERGE MVP (If Validated)

**DO:**
- [ ] Recruit 5 beta users from Week 1 interviews
- [ ] Manually process their transcripts using existing backend
- [ ] Deliver Excel/PowerPoint reports
- [ ] Deep feedback interviews

**DON'T:**
- [ ] Build any UI yet
- [ ] Automate anything

**Investment:** $500 | **Output:** Trust validation + feature prioritization

---

### Days 29-30: FINAL GO/NO-GO

**Build Frontend IF:**
- ✅ 3+ beta users would use output in client reports
- ✅ Trust score >7/10
- ✅ Willingness to pay >$40/month
- ✅ Time savings >2 hours per transcript

**Pivot/Stop IF:**
- ❌ Trust score <5/10 → Pivot to human-in-loop, not AI autopilot
- ❌ "Would never use in reports" → Wrong output format or value prop
- ❌ WTP <$30/month → Unit economics broken

---

## Success Metrics by Validation Phase

### Phase 1: Problem Validation (Week 1-2)
- **Target:** 50 beta signups, 10 interviews completed
- **Pass:** Language is top-3 pain for 7+, no strong competitors, 30%+ interested in paid plans
- **Fail:** Language not mentioned, strong competitor found, 90%+ only want free

### Phase 2: Solution Validation (Week 3-4)
- **Target:** 5 concierge MVP users
- **Pass:** 3+ would use in client reports, trust >7/10, WTP >$40
- **Fail:** <2 would use, trust <5/10, WTP <$30

### Phase 3: Product Validation (Month 2-3)
- **Target:** 100 active users, 30% trial→paid
- **Pass:** 70%+ W2 retention, NPS >30, <$20 CAC
- **Fail:** <50% retention, NPS <10, CAC >$50

---

## Early Warning Signals

### 🚨 STOP IMMEDIATELY IF:
- Can't recruit 10 researchers for interviews (no market)
- 0 researchers mention language as a pain (wrong problem)
- Strong funded competitor found (late to market)
- All beta users say "too expensive" even at $29 (pricing model broken)
- Concierge MVP users won't pay anything (no value perceived)

### ⚠️ PIVOT IF:
- Language is a pain but not top-3 (adjust positioning)
- Pricing needs to be <$40 to work (different tier structure)
- They want service, not software (add done-for-you option)
- Trust issues with AI (human-in-loop features)

### ✅ GREEN LIGHT IF:
- 50+ beta signups in Week 1
- 7+ researchers confirm language pain
- 0 strong local competitors
- 30%+ interested in paid plans
- 3+ concierge users love the output

---

## The Hard Question

**If you only had $10,000 left, what would you do?**

**WRONG ANSWER:** "Build more features"
**RIGHT ANSWER:** "Talk to 50 potential customers and validate demand"

**If you only had 30 days left, what would you do?**

**WRONG ANSWER:** "Rush to launch"
**RIGHT ANSWER:** "Run the 3 validation experiments and decide based on data"

---

## Immediate Next Steps (This Week)

### Monday-Tuesday
1. [ ] Read full assumption analysis: `ASSUMPTION_MAPPING_AND_RISK_ANALYSIS.md`
2. [ ] Read experiment playbook: `VALIDATION_EXPERIMENT_PLAYBOOK.md`
3. [ ] Create contact list of 20 SEA researchers to interview
4. [ ] Draft recruitment email (template in playbook)

### Wednesday-Friday
1. [ ] Send 20 interview recruitment emails
2. [ ] Build landing page (2 hours using Carrd/Webflow)
3. [ ] Set up LinkedIn/Facebook ads ($10/day)
4. [ ] Start competitor scan (local languages)

### Weekend
1. [ ] Conduct first 5 interviews
2. [ ] Analyze competitor scan results
3. [ ] Review landing page signup data

### Monday Week 2
1. [ ] Make GO/PIVOT/STOP decision based on data
2. [ ] Report findings to team/stakeholders
3. [ ] Either: Start Concierge MVP OR Pivot plan OR Stop

---

## Key Documents

1. **This Document** - Executive summary & action plan
2. **ASSUMPTION_MAPPING_AND_RISK_ANALYSIS.md** - Complete assumption map, experiments, pivot strategies
3. **VALIDATION_EXPERIMENT_PLAYBOOK.md** - Copy-paste scripts, templates, tracking sheets

**Read all 3 before making ANY decisions.**

---

## Final Recommendation

### DO THIS NOW:
**STOP building. START validating.**

Spend $1,700 and 30 days to de-risk a $350K investment.

If the assumptions are TRUE, you'll build with confidence.
If they're FALSE, you'll pivot before wasting 6 more months.
Either way, you WIN.

### DON'T DO THIS:
Build the frontend as planned and hope it works.

Hope is not a strategy. Data is.

---

## Contact & Questions

When you're ready to start validation:

1. **Set up interview tracking sheet** (template in playbook)
2. **Schedule first 5 interviews** (this week)
3. **Build landing page** (2 hours)
4. **Run first ads** ($10/day)

**Report back findings in 7 days for decision gate.**

---

**Remember:** The best way to fail is to build the wrong thing perfectly.

**You're 30 customer conversations away from knowing if this will work.**

**Start today.**

---

## Appendix: Quick Stats

| Metric | Current | Target (Validated) |
|---|---|---|
| Customer interviews | 0 | 10+ |
| Beta signups | 0 | 50+ |
| Paying customers | 0 | 5+ (concierge) |
| Competitors identified | 2 (Western) | All local scanned |
| Pricing validation | None | 30%+ paid interest |
| Trust score | Unknown | >7/10 |
| WTP (willingness to pay) | Assumed $49 | Measured >$40 |
| Market size (TAM) | Unknown | Estimated |
| Unit economics | Unknown | Modeled |
| Product-market fit score | 0% | >40% "very disappointed" |

**Current PMF Score: 0%**
**Target PMF Score: 40%+ (before scaling)**

**Gap: You're not ready to scale. You're barely ready to launch. Validate first.**

---

*Last Updated: June 25, 2026*
*Status: CRITICAL - Validation required before proceeding*
*Next Review: Day 14 (Decision Gate 1)*
