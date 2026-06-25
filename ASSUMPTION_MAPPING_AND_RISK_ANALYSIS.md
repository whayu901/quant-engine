# Qual Engine - Assumption Mapping & Risk-Driven Validation Strategy

**Date:** June 25, 2026
**Project Status:** Backend 70% complete, Frontend starting
**Target Market:** Southeast Asia qualitative research (competing with coloop.ai)
**Pricing:** $49-149/user/month

---

## Executive Summary

You've built 70% of a sophisticated backend before validating core market assumptions. This is **dangerously backward**. The good news: you haven't launched yet. The critical task now is to **test assumptions before investing another dollar in frontend development**.

**CRITICAL FINDING:** You have at least 5 assumptions that could kill the business, and zero evidence for most of them. We need to validate the riskiest 3 before building more features.

---

## Part 1: Complete Assumption Map (VUBF Framework)

### VALUE RISK (Will SEA researchers want this?)

| ID | Assumption | Importance | Current Evidence | Risk Level |
|---|---|---|---|---|
| V1 | **SEA researchers struggle with Western tools due to language barriers** | CRITICAL | NONE - No user interviews, no competitor user research | HIGH |
| V2 | **Local language support (code-mixing) is a key differentiator** | CRITICAL | NONE - Assumption based, no validation | HIGH |
| V3 | **No strong local competitor exists** | CRITICAL | WEAK - Cursory competitor scan only | HIGH |
| V4 | **Researchers will switch from current solutions (coloop, Dovetail, Excel)** | CRITICAL | NONE - No switching cost analysis | HIGH |
| V5 | **The pain is analysis, not just transcription** | HIGH | NONE - No job-to-be-done research | HIGH |
| V6 | **Researchers need AI analysis vs manual coding** | HIGH | NONE - No workflow observation | MEDIUM |
| V7 | **Code-mixing is a real problem in transcript analysis** | HIGH | NONE - Anecdotal only | MEDIUM |
| V8 | **Cross-transcript analysis/Knowledge Base is valuable** | MEDIUM | NONE - Feature assumption | MEDIUM |
| V9 | **Sentiment analysis adds value to qual research** | MEDIUM | NONE - Qual is interpretive, not sentiment-driven | MEDIUM |
| V10 | **Enterprises will pay for a SEA-specific solution** | HIGH | NONE - No enterprise buyer interviews | HIGH |

### USABILITY RISK (Can they figure it out?)

| ID | Assumption | Importance | Current Evidence | Risk Level |
|---|---|---|---|---|
| U1 | **Researchers can use the platform without training** | HIGH | NONE - No usability testing | MEDIUM |
| U2 | **The analysis output format matches their reporting needs** | HIGH | NONE - No output validation | HIGH |
| U3 | **Upload → transcribe → analyze workflow is intuitive** | MEDIUM | NONE - Complex backend, no UX testing | MEDIUM |
| U4 | **Mobile-first is critical for SEA users** | HIGH | WEAK - General market assumption | MEDIUM |
| U5 | **Users trust AI-generated themes/codes** | HIGH | NONE - Qual researchers may distrust automation | HIGH |
| U6 | **The terminology (themes, verbatims, grids) matches user mental models** | MEDIUM | NONE - Built from competitor teardown, not user research | MEDIUM |

### BUSINESS VIABILITY RISK (Can we build a business?)

| ID | Assumption | Importance | Current Evidence | Risk Level |
|---|---|---|---|---|
| B1 | **Price sensitivity is high in SEA - $49-149 is acceptable** | CRITICAL | NONE - No pricing research | HIGH |
| B2 | **Enterprises will trust a local solution over Western brands** | HIGH | NONE - May prefer established Western brands | HIGH |
| B3 | **Market size is sufficient (research agencies + enterprises + universities)** | CRITICAL | WEAK - No TAM/SAM analysis | HIGH |
| B4 | **CAC will be low enough to achieve profitability** | CRITICAL | NONE - No go-to-market strategy | HIGH |
| B5 | **Usage-based pricing model fits researcher budgets** | HIGH | NONE - May prefer per-project or seats-only | MEDIUM |
| B6 | **Free tier converts to paid at reasonable rates** | MEDIUM | NONE - No freemium benchmark | MEDIUM |
| B7 | **SEA enterprises have budget for qual tools (not just CAPI/quant)** | HIGH | NONE - Qual may be Excel/manual in SEA | HIGH |
| B8 | **Margins after AI API costs are positive** | HIGH | WEAK - Anthropic costs could eat 40-60% of revenue | HIGH |
| B9 | **Researchers buy software (vs services/agencies doing analysis)** | HIGH | NONE - SEA may prefer full-service agencies | HIGH |
| B10 | **Annual contracts vs month-to-month is viable** | MEDIUM | NONE - No contract preference data | LOW |

### FEASIBILITY RISK (Can we build/operate it?)

| ID | Assumption | Importance | Current Evidence | Risk Level |
|---|---|---|---|---|
| F1 | **Anthropic/Claude API costs are sustainable at $49-149 price point** | CRITICAL | WEAK - No unit economics model | HIGH |
| F2 | **Transcription accuracy for SEA languages is acceptable** | CRITICAL | WEAK - Deepgram/AssemblyAI SEA support unclear | HIGH |
| F3 | **Code-mixing detection works reliably** | HIGH | NONE - Built but not validated | MEDIUM |
| F4 | **Can build frontend to match backend complexity** | MEDIUM | STRONG - Already 70% backend done | LOW |
| F5 | **Team can support 6 languages + code-mixing** | MEDIUM | WEAK - No native speakers on team? | MEDIUM |
| F6 | **Infrastructure costs allow profitability** | HIGH | NONE - No cost modeling | MEDIUM |
| F7 | **Can deliver acceptable response times with AI processing** | MEDIUM | WEAK - Built but not load-tested | LOW |
| F8 | **Data residency/compliance requirements are achievable** | MEDIUM | MEDIUM - AWS SEA regions exist | LOW |

---

## Part 2: The 5 Assumptions That Could Kill The Business

### KILLER ASSUMPTION #1: "SEA researchers struggle with Western tools due to language barriers"

**Why it's deadly:** This is your ENTIRE positioning. If false, you're just another coloop clone with worse brand recognition.

**What we don't know:**
- Do SEA researchers actually use Western tools? Or do they use Excel + manual analysis?
- What % of their work involves non-English transcripts?
- Do they struggle with language, or with cost/complexity?
- Are they currently dissatisfied enough to switch?

**Current evidence:** ZERO. This is a hypothesis presented as fact.

**What happens if it's wrong:** You're competing head-to-head with funded Western players who have better brand, more features, and enterprise trust. You lose.

---

### KILLER ASSUMPTION #2: "No strong local competitor exists"

**Why it's deadly:** You're building a complex product assuming a clear field. A funded local player could crush you.

**What we don't know:**
- Have you actually talked to SEA research buyers?
- Are there local players you haven't found? (They may not have English websites)
- Are there agency in-house tools that fill this need?
- Is anyone building this right now? (Stealth competitors)

**Current evidence:** Cursory Google search. Not systematic.

**What happens if it's wrong:** Competitor has 2-year head start, local relationships, and cheaper pricing. You're DOA.

---

### KILLER ASSUMPTION #3: "Enterprises will trust a local solution over Western ones"

**Why it's deadly:** You're betting on "local = trust." This is often BACKWARDS in enterprise software.

**What we don't know:**
- Do SEA enterprises prefer local vendors (less common in SaaS)?
- Do they trust "made in SEA" for AI/data tools?
- Will they perceive you as less secure/reliable vs Dovetail/coloop?
- Do procurement departments have "approved vendor" lists that exclude unknowns?

**Current evidence:** ZERO. Likely based on non-software market assumptions.

**What happens if it's wrong:** Enterprises buy Western brands despite higher cost. SMBs can't afford you. No segment.

---

### KILLER ASSUMPTION #4: "Price sensitivity is high / $49-149 is the right range"

**Why it's deadly:** You're 50% below Western pricing, which could signal "cheap/inferior" or still be too expensive.

**What we don't know:**
- What do SEA researchers currently pay for qual tools?
- What's their total qual research budget per project?
- Is the comparison "cheaper than coloop" or "too expensive vs manual"?
- Will they pay monthly SaaS vs project-based?

**Current evidence:** NONE. Random price points.

**What happens if it's wrong:**
- If too cheap: Perception of low quality, can't cover AI costs, death spiral
- If too expensive: "We'll just use Excel" or hire a VA to code transcripts

---

### KILLER ASSUMPTION #5: "Researchers buy software (vs agencies doing the analysis)"

**Why it's deadly:** SEA qual market may be service-led, not tool-led.

**What we don't know:**
- Do researchers do their own analysis, or outsource to specialists?
- Are agencies the real buyers (not individual researchers)?
- Do they want a tool, or a "done-for-you" service?
- Is Excel + human coding "good enough" that software isn't needed?

**Current evidence:** NONE. Assumed software-first market.

**What happens if it's wrong:** You've built a DIY tool for a market that wants full-service. Product-market fit = 0.

---

## Part 3: Prioritization Grid

```
                    │  WEAK EVIDENCE  │  STRONG EVIDENCE
                    │                 │
HIGH IMPORTANCE     │   TEST NOW      │   MONITOR
                    │   V1, V2, V3    │   (None yet)
                    │   V4, V10, B1   │
                    │   B2, B3, B4    │
                    │   B7, B8, B9    │
                    │   U2, U5, F1    │
                    │   F2            │
────────────────────┼─────────────────┼──────────────────
MEDIUM/LOW          │   TEST LATER    │   IGNORE
IMPORTANCE          │   V6-V9, U1-U4  │   F4, F8
                    │   B5, B6, F3    │
                    │                 │
```

---

## Part 4: Validation Experiments (Ranked by Priority)

### PRIORITY 1 - TEST IMMEDIATELY (Before building ANY frontend)

#### Experiment 1A: "Language Barrier" Pain Interview (Value Risk V1)

**Hypothesis:** SEA researchers struggle significantly with English-only qual tools when analyzing local-language transcripts.

**Cheapest test:**
1. Interview 10 SEA qual researchers (agencies + in-house) in next 7 days
2. Ask: "Walk me through your last qual project from recording to report"
3. Observe: Where do they use tools? Where do they struggle?
4. Ask: "How do you handle Indonesian/Thai/mixed-language transcripts today?"

**Budget:** $0-500 (recruiter fees)
**Time:** 1 week

**Success criteria (validates):**
- 7+ of 10 mention language/translation as top-3 pain point
- Currently using workarounds (manual translation, junior staff, offshore)
- Express frustration with English-only tools

**Failure criteria (invalidates):**
- Language is mentioned, but not a top pain (cost, time, recruiting is bigger)
- They don't use qual tools at all (Excel + PowerPoint)
- They outsource analysis to specialists anyway

**If invalidated:** You have the wrong value prop. May need to pivot to general qual analysis platform, not language-specific.

---

#### Experiment 1B: Competitor Landscape Deep Dive (Value Risk V3)

**Hypothesis:** No strong local SEA qual tool exists.

**Cheapest test:**
1. Systematic competitor research in next 3 days:
   - Search in Bahasa Indonesia, Thai, Malay (not just English)
   - Talk to 5 SEA research agencies: "What tools do you use for qual analysis?"
   - Check LinkedIn for "qual research platform" + SEA location
   - Ask in SEA market research Facebook groups

**Budget:** $0-200
**Time:** 3 days

**Success criteria (validates):**
- No direct local competitors found
- Agencies use Excel, Dovetail, coloop, or manual methods only
- No SEA-built alternatives with traction

**Failure criteria (invalidates):**
- Find 1+ funded local competitors with users
- Discover agencies built in-house tools and won't switch
- Find a stealth competitor about to launch

**If invalidated:** Need to differentiate beyond "local + language" OR partner/acquire the competitor OR exit.

---

#### Experiment 1C: Pricing/Willingness-to-Pay Survey (Business Risk B1, B3)

**Hypothesis:** SEA researchers will pay $49-149/user/month for qual analysis software.

**Cheapest test:**
1. Create a landing page with 3 tiers (Free, $49, $149) in next 2 days
2. Run LinkedIn/Facebook ads to "qualitative researcher" + SEA location
3. Track clicks on pricing tiers (Van Westendorp pricing model)
4. Email 50 warm leads from Experiment 1A: "Which plan would you choose?"

**Budget:** $200-500 (ads)
**Time:** 1 week

**Success criteria (validates):**
- 30%+ click on paid tiers (vs Free only)
- 5+ express interest in $149 tier
- Average acceptable price > $75/user

**Failure criteria (invalidates):**
- 90%+ only click Free tier
- Comments: "Too expensive" or "We'd use free version forever"
- Acceptable price < $30/user (unsustainable)

**If invalidated:** Need to rethink pricing (lower cost model, per-project, enterprise-only) OR test agency/service model.

---

### PRIORITY 2 - TEST BEFORE LAUNCH (After frontend MVP)

#### Experiment 2A: Concierge MVP (Usability Risk U2, U5)

**Hypothesis:** Researchers will trust and use AI-generated analysis output in their reports.

**Cheapest test:**
1. Recruit 3 beta users from Experiment 1A
2. Manually process their transcripts using Claude (behind the scenes)
3. Deliver analysis in Excel/PowerPoint (NOT via software)
4. Ask: "Would you use this in a client report? What would you change?"

**Budget:** $200 (beta user incentives) + $50 (Claude API)
**Time:** 2 weeks

**Success criteria (validates):**
- 2+ of 3 users say "I'd use this output with minor edits"
- They cite specific parts they'd include in client reports
- Request: "When can I access this myself?"

**Failure criteria (invalidates):**
- "This is interesting, but I wouldn't show clients"
- "I'd have to redo all the coding anyway"
- Trust issues: "How do I know AI didn't miss something?"

**If invalidated:** Need human-in-the-loop coding, explainability features, or position as "assistant" not "autopilot."

---

#### Experiment 2B: Code-Mixing Accuracy Test (Feasibility Risk F2, Value Risk V7)

**Hypothesis:** Your transcription + analysis handles SEA code-mixing accurately.

**Cheapest test:**
1. Get 5 real Indonesian/Taglish/Singlish transcripts from beta users
2. Run through your pipeline (Deepgram/AssemblyAI + Claude)
3. Have native speaker review: accuracy score, meaning preserved?

**Budget:** $100 (reviewers) + $50 (API costs)
**Time:** 1 week

**Success criteria (validates):**
- 80%+ transcription accuracy on code-mixed speech
- Analysis correctly interprets mixed-language sentiment/themes
- Verbatims preserve original language (not force-translated)

**Failure criteria (invalidates):**
- <70% accuracy (unusable)
- Analysis misses nuance due to translation
- Code-mixing breaks the LLM's thematic coding

**If invalidated:** Need better ASR provider, human transcription step, or language-specific models.

---

#### Experiment 2C: Feature Value Ranking (Value Risk V6, V8)

**Hypothesis:** The features you built (grids, cross-project KB, sentiment, etc.) are what users want.

**Cheapest test:**
1. Show 10 researchers a feature list (with mockups)
2. Ask: "Rank these 1-10 by value to your work"
3. Ask: "Which 3 would you pay extra for?"
4. Ask: "Which would you never use?"

**Budget:** $500 (incentives)
**Time:** 1 week

**Success criteria (validates):**
- Top features match what you built (themes, verbatims, grids)
- Low variance in rankings (market agrees on value)
- Willingness to pay for advanced features

**Failure criteria (invalidates):**
- "Nice to have" but not must-have
- Key features you haven't built rank highest
- High variance (no clear consensus on value)

**If invalidated:** Roadmap is wrong. Build what they actually want, not competitor parity.

---

### PRIORITY 3 - TEST BEFORE SCALING (Post-launch)

#### Experiment 3A: Enterprise Trust Test (Business Risk B2)

**Hypothesis:** SEA enterprises prefer local vendors for qual research tools.

**Cheapest test:**
1. Outreach to 10 SEA enterprise researchers (via LinkedIn)
2. Position as "local alternative to coloop"
3. Track: Do they respond? Do they prefer "local" or "proven Western brand"?

**Budget:** $0-200
**Time:** 2 weeks

**Success criteria (validates):**
- 5+ interested in trying "because it's local/SEA-focused"
- Concerns about data residency, local support are mentioned
- Preference for dealing with local team

**Failure criteria (invalidates):**
- "We only use approved vendors" (Gartner Magic Quadrant companies)
- "Local is nice, but we need proven track record"
- Preference for Western brand = perceived quality

**If invalidated:** Target SMBs/agencies first, build case studies, then go enterprise. Or partner with Western brand for SEA.

---

#### Experiment 3B: Unit Economics Stress Test (Business Risk B8, Feasibility Risk F1)

**Hypothesis:** Margins are positive after AI API costs at $49-149 pricing.

**Test:**
1. Run 100 real analyses (from beta users)
2. Measure: API cost per analysis, storage cost, compute cost
3. Calculate: LTV (customer lifetime value) vs CAC + COGS

**Budget:** $500 (API costs)
**Time:** 1 month (during beta)

**Success criteria (validates):**
- Gross margin > 60% after AI costs
- LTV:CAC > 3:1 at assumed retention/churn
- Break-even within 12 months at modeled growth

**Failure criteria (invalidates):**
- Gross margin < 40% (AI costs too high)
- LTV:CAC < 2:1 (unsustainable)
- Need to raise prices or reduce AI usage

**If invalidated:** Optimize AI calls, switch to cheaper models, increase prices, or add usage limits.

---

## Part 5: Decision Rules & Pivot Strategies

### Decision Tree

```
START
  │
  ├─ Language barrier validated (Exp 1A)?
  │   ├─ YES → Continue with language-first positioning
  │   └─ NO  → PIVOT: Generic qual platform (compete on UX/speed, not language)
  │
  ├─ Competitors found (Exp 1B)?
  │   ├─ NONE → Continue (clear field)
  │   ├─ WEAK → Continue (can compete)
  │   └─ STRONG → DECISION:
  │                 • Partner/acquire
  │                 • Differentiate heavily (niches)
  │                 • Exit
  │
  ├─ Pricing validated (Exp 1C)?
  │   ├─ $49-149 works → Continue
  │   ├─ Too expensive → PIVOT: Lower pricing tier ($29) or freemium-heavy
  │   └─ Too cheap → PIVOT: Enterprise-first ($299+) or per-project pricing
  │
  ├─ Trust in AI output (Exp 2A)?
  │   ├─ YES → Continue with AI-first
  │   └─ NO  → PIVOT: Human-in-loop, explainability, "assistant" positioning
  │
  └─ Unit economics work (Exp 3B)?
      ├─ YES → Scale
      └─ NO  → PIVOT: Usage limits, tiered AI features, or raise prices
```

---

### Pivot Strategies by Invalidated Assumption

| Invalidated Assumption | Pivot Strategy |
|---|---|
| **V1: Language barrier is not the pain** | Pivot to general qual analysis platform competing on speed/UX, not language |
| **V3: Strong local competitor exists** | Partner (integrate), niche down (vertical-specific), or pivot to agency service model |
| **V4: Switching costs too high** | Build migration tools, offer done-for-you onboarding, or co-exist (integrate with incumbents) |
| **B1: Price too high** | Freemium-heavy, lower tiers, or per-project pricing (not per-user subscription) |
| **B2: Enterprises prefer Western brands** | Target agencies/SMBs first, build case studies, enterprise later |
| **B7: Qual budgets don't exist** | Pivot to quant+qual combo tool (where budget exists) or service model |
| **B8: Margins negative** | Reduce AI usage, switch to open-source LLMs, or increase prices |
| **B9: Buyers want services, not software** | Add "done-for-you" analysis tier, white-label for agencies, or full-service pivot |
| **U5: Don't trust AI analysis** | Human-in-loop workflow, explainability, audit trails, or "assistant" not "autopilot" |
| **F2: Code-mixing doesn't work** | Human transcription step, language-specific models, or English-only markets first |

---

## Part 6: Minimum Viable Test (MVT) - What to Build Now

### STOP building the frontend as planned. Instead:

#### Week 1-2: Validation Sprint

**Build:** Landing page + email capture (not full app)

**Content:**
- Headline: "The First Qual Research Platform Built for Southeast Asia"
- Subhead: "Analyze Indonesian, Thai, and code-mixed transcripts in minutes"
- 3 tiers: Free, Pro ($49), Enterprise ($149)
- CTA: "Join Beta" (email signup)

**Run:**
- Experiments 1A, 1B, 1C simultaneously
- Target: 50 qualified leads (researchers who'd actually buy)

**Spend:** $1,000 total
**Time:** 2 weeks

---

#### Week 3-4: Concierge MVP

**For the 5 best beta leads from Week 1-2:**

**Build:** Nothing. Manual process.

**Process:**
1. They send you a transcript
2. You run it through existing backend (manually)
3. You send them formatted output in Excel/PowerPoint
4. You interview them: "Would you use this? What's wrong?"

**Goal:** Validate U2, U5, V6 before building ANY frontend UI.

**Spend:** $500 (incentives)
**Time:** 2 weeks

---

#### Week 5-8: Build MVP Frontend (IF VALIDATED)

**Only build IF:**
- ≥5 beta users say "I'd pay for this"
- Pricing validated at $49+
- No strong competitor found
- Language pain confirmed

**Minimum feature set:**
- Login
- Upload transcript
- View analysis (themes, verbatims, topline)
- Export to PowerPoint/Excel
- Billing (Stripe)

**DO NOT BUILD:**
- Grids
- Cross-project KB
- Sentiment
- Charts
- Collaboration
- Media upload
- Real-time features
- Mobile app

(These are features, not core value. Test core first.)

---

## Part 7: Early Warning Indicators

### 🚨 RED FLAGS (Stop building, validate immediately)

| Indicator | What It Means | Action |
|---|---|---|
| Beta signups < 50 in first month | No market interest | Re-validate problem |
| Email open rate < 20% | Wrong audience or message | Pivot positioning |
| Demo requests but no trials | Tire-kickers, not buyers | Qualify harder |
| Trials but no activation | Onboarding broken OR no real pain | Fix UX OR validate pain |
| Activation but no retention | Not solving real problem | Deep user interviews |
| "Interesting but too expensive" | Pricing model broken | Test lower tiers or freemium |
| "We'll stick with Excel" | Pain not acute enough | Validate problem again |
| Competitor launches in SEA | Market validation BUT threat | Differentiate or partner |
| Enterprise ghosting | Trust/brand issue | SMB-first strategy |
| High API costs | Unit economics broken | Optimize or raise prices |

---

### ✅ GREEN LIGHTS (You're on track)

| Indicator | What It Means | Confidence Level |
|---|---|---|
| 100+ beta signups/month | Market pull exists | MEDIUM |
| 30%+ trial → paid conversion | Value prop resonates | HIGH |
| NPS > 40 from early users | Product-market fit signal | MEDIUM |
| Word-of-mouth referrals | Organic growth loop | HIGH |
| Agencies asking for white-label | B2B2C potential | MEDIUM |
| Enterprise inbound leads | Market maturing | MEDIUM |
| Users exporting to client reports | Real workflow integration | HIGH |
| <$10 CAC via content | Organic channel working | HIGH |
| 80%+ gross margin | Unit economics healthy | HIGH |
| Retention > 80% month 3+ | Sticky product | VERY HIGH |

---

## Part 8: Validation Roadmap (Timeline)

```
MONTH 1 (NOW)
├─ Week 1-2: Run Experiments 1A, 1B, 1C (interviews, competitor scan, pricing)
│              DECISION GATE: Continue or pivot/exit?
├─ Week 3-4: Concierge MVP with 5 beta users
│              DECISION GATE: Build frontend or redesign?

MONTH 2 (IF VALIDATED)
├─ Week 1-4: Build minimal frontend (login, upload, view analysis, export)
└─ Week 4:   Private beta launch (50 users)
              DECISION GATE: Product-market fit signals?

MONTH 3
├─ Week 1-2: Run Experiments 2A, 2B, 2C (trust, code-mixing, feature value)
├─ Week 3:   Iterate based on feedback
└─ Week 4:   Expand beta (200 users)

MONTH 4-6 (IF STRONG SIGNALS)
├─ Public launch
├─ Experiment 3A, 3B (enterprise, unit economics)
└─ Scale or pivot based on data

MONTH 6 DECISION GATE:
├─ 500+ paying users, >$20K MRR, 70%+ retention → SCALE
├─ 100-500 users, break-even, mixed signals → ITERATE
└─ <100 users, burn rate high, no PMF → PIVOT OR EXIT
```

---

## Part 9: Critical Mistakes You're Making Right Now

### Mistake #1: Building features before validating demand
**Why it's wrong:** You've built grids, sentiment, chat, visualizations, collaboration... without knowing if anyone wants them.
**Cost:** 6-8 months of wasted dev time, $200K in opportunity cost.
**Fix:** Validate core value prop (transcription → analysis → export) FIRST. Add features AFTER retention is proven.

---

### Mistake #2: Assuming "SEA market" is homogeneous
**Why it's wrong:** Indonesia ≠ Singapore ≠ Thailand in buying behavior, budgets, qual maturity.
**Cost:** Wrong positioning for all markets.
**Fix:** Pick ONE country to start (likely Indonesia = largest). Nail it. Then expand.

---

### Mistake #3: Competitor analysis = Google search
**Why it's wrong:** Local competitors may not have English websites. Stealth competitors exist. In-house tools are invisible.
**Cost:** Blindsided by competition.
**Fix:** Talk to 20 agencies in next 2 weeks. Ask: "What do you use? Who else is building this?"

---

### Mistake #4: Pricing based on "50% below Western tools"
**Why it's wrong:** No idea what SEA researchers actually pay or value.
**Cost:** Either leaving money on table OR pricing yourself out.
**Fix:** Van Westendorp pricing study + willingness-to-pay interviews BEFORE you lock in pricing.

---

### Mistake #5: Building for 3 customer types (agencies, enterprises, universities) simultaneously
**Why it's wrong:** These have totally different buying processes, budgets, needs.
**Cost:** Diluted positioning, complex sales.
**Fix:** Pick ONE segment (likely agencies = highest volume, lowest sales friction). Dominate. Then expand.

---

### Mistake #6: Technology-first vs customer-first
**Why it's wrong:** You've built pgvector, RAG, real-time collaboration... but have you watched a researcher work for 1 hour?
**Cost:** Solving the wrong problem elegantly.
**Fix:** 10 hours of user observation > 100 hours of coding.

---

### Mistake #7: Assuming language = differentiator
**Why it's wrong:** IF researchers don't struggle with language, your entire moat collapses.
**Cost:** Competing on features vs established players = you lose.
**Fix:** Validate the language pain is REAL and ACUTE in next 7 days.

---

## Part 10: The Hard Questions

Before you write another line of frontend code, answer these:

1. **Name 3 people who would pay $49/month TODAY for this.**
   (If you can't, you have a demand problem, not a product problem.)

2. **What's the last time you watched a SEA researcher analyze a transcript?**
   (If never, you're guessing about the workflow.)

3. **Why will they switch from Excel/coloop/Dovetail to you?**
   (If the answer is "features," that's not enough. Switching costs are high.)

4. **What happens if Dovetail launches SEA language support next month?**
   (If you have no answer, you have no moat.)

5. **Can you survive on 50 customers at $49/month?**
   (If no, your pricing or cost structure is broken.)

6. **What's your CAC?**
   (If you don't know, you can't model profitability.)

7. **Who's your first enterprise customer and why will they buy?**
   (If you can't name them, enterprise is not your market yet.)

8. **What's your marginal cost per user?**
   (If API costs eat >40% of revenue, your unit economics are broken.)

9. **Why hasn't anyone built this already?**
   (The answer is NOT "they didn't think of it." Either the market is too small, too hard, or not painful enough.)

10. **If you only had $10K left, what would you do?**
    (If the answer is "build more features," you're doing it wrong. It should be "talk to 50 customers.")

---

## Part 11: Recommended Action Plan (Next 30 Days)

### Day 1-7: STOP BUILDING. START VALIDATING.

**DO:**
- Interview 10 SEA qual researchers (Experiment 1A)
- Deep competitor scan in local languages (Experiment 1B)
- Create pricing test landing page (Experiment 1C)

**DON'T:**
- Write any new code
- Design frontend screens
- Set up infrastructure

**BUDGET:** $500
**DELIVERABLE:** Validation report with recordings, competitor map, pricing data

---

### Day 8-14: CONCIERGE MVP

**DO:**
- Recruit 5 beta users from Week 1 interviews
- Manually process their transcripts using your backend
- Deliver analysis in Excel/PowerPoint
- 1-hour feedback interview each

**DON'T:**
- Build any UI
- Automate anything

**BUDGET:** $500 (user incentives)
**DELIVERABLE:** 5 case studies, feature priority list, revised roadmap

---

### Day 15-21: DECISION GATE

**ANALYZE:**
- Is language pain real? (50%+ of users confirm)
- Is pricing acceptable? (30%+ willing to pay $49+)
- Are competitors weak? (No funded direct local competitor)
- Do they trust AI output? (Would use in client reports)
- Will they switch? (Top-2 box intent = 60%+)

**DECIDE:**
- GO: If 4/5 above are YES → Build minimal frontend
- PIVOT: If 2-3 are YES → Adjust positioning/pricing/features
- STOP: If 0-1 are YES → Wrong market or wrong problem

---

### Day 22-30: BUILD (IF VALIDATED) OR PIVOT

**IF VALIDATED:**
- Build only: Login, Upload, View Analysis, Export, Billing
- Launch private beta to 20 users
- Set success metrics: 50% activation, 30% W2 retention

**IF NOT VALIDATED:**
- Pivot based on learnings
- Re-validate new direction
- Consider partnership, service model, or different market

---

## Part 12: Success Metrics by Phase

### Phase 1: Validation (Month 1)
- 50+ beta signups
- 10+ interview completions
- 5+ concierge MVP users
- 3+ would pay $49+ (confirmed)
- 0 strong local competitors found

### Phase 2: Private Beta (Month 2-3)
- 100 active users
- 30% trial → paid conversion
- 70% W2 retention
- NPS > 30
- <$20 CAC

### Phase 3: Public Launch (Month 4-6)
- 500 paying users
- $25K MRR
- 80% M3 retention
- 60%+ gross margin
- 3+ case studies/testimonials

### Phase 4: Scale (Month 7-12)
- 2,000 paying users
- $100K MRR
- LTV:CAC > 3:1
- Expansion revenue > 20%
- 1+ enterprise customer ($10K+ ARR)

---

## Conclusion: You're at a Critical Junction

### The Good News:
- You've built a sophisticated technical foundation
- 70% backend complete means fast iteration IF validated
- Haven't spent marketing $ yet (no sunk cost)
- Haven't launched, so no reputation risk

### The Bad News:
- You have ZERO evidence for your core assumptions
- You're about to spend 3-6 months on frontend that might be wrong
- You've optimized for scale before proving demand
- You've built features before validating core value

### The Path Forward:

**Option A: VALIDATE FIRST (Recommended)**
- Spend next 30 days running experiments above
- $2K budget, 0 new code
- Decision gate: Build, pivot, or stop
- IF validated: 6-8 weeks to MVP frontend
- THEN scale

**Option B: RISK IT (Not Recommended)**
- Build frontend as planned
- Launch and pray
- High chance of pivoting after 6 months
- 10x more expensive to change later

### The Brutal Truth:

You've built an impressive backend for a product that might not have a market. The best engineering in the world doesn't matter if no one wants it.

**Stop coding. Start talking to customers. You're 30 conversations away from knowing if this will work.**

---

## Appendix: Key Resources

### Files to Reference:
- `/Users/wahyusetiawan/Documents/office/kadence/qual-engine/SPEC.md` - Original requirements
- `/Users/wahyusetiawan/Documents/office/kadence/qual-engine/PROJECT_CONTEXT.md` - Build context
- `/Users/wahyusetiawan/Documents/office/kadence/qual-engine/CONTEXT_AND_PROGRESS.md` - Current status

### Validation Tools:
- **Mom Test** (book) - How to interview users correctly
- **Value Prop Canvas** - Map features to jobs-to-be-done
- **Competitor Battlecards** - Systematic competitive intelligence
- **Van Westendorp Pricing** - Pricing sensitivity analysis
- **Concierge MVP** - Manual service before automation

### Questions for Next Session:
1. Do you have ANY existing relationships with SEA researchers to interview?
2. What's your total remaining budget for this project?
3. Are you willing to pivot if assumptions are invalidated?
4. What's your timeline constraint (investor deadline, runway, etc.)?
5. Do you have a co-founder/team or is this solo?

---

**Next Steps:**
1. Review this document
2. Decide: Validate-first or risk-it approach
3. If validate-first: Schedule 10 user interviews this week
4. Report back findings before ANY new development

**Remember:** The best way to fail is to build the wrong thing perfectly. You're dangerously close to that. Let's course-correct NOW while it's still cheap.
