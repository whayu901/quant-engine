# Qual Engine: Quick Reference Card
## Print this. Laminate it. Keep it on your desk.

---

## VISION IN ONE SENTENCE

**Qual Engine is the AI-powered research intelligence platform built FOR Southeast Asia, not retrofitted for it.**

---

## THREE CORE DIFFERENTIATORS

1. **Code-mixing detection** (Taglish, Singlish, bahasa gaul) — Only platform that gets this right
2. **SEA data residency & compliance** (PDPA, UU PDP) — In-region hosting, local expertise
3. **50-70% cheaper pricing** (SGD 49-249 vs SGD 300-800) — Fair pricing for SEA budgets

---

## NORTH STAR METRIC

**Monthly Recurring Revenue (MRR)**

Target: SGD 4K (Month 1) → SGD 50K (Month 6) → SGD 1M+ (Year 1)

---

## THE VALUE LOOP

```
Activation (Week 1):
  Upload transcript → Themes auto-extracted → "Wow, saved 30 hours"

Engagement (Week 1-4):
  Click theme → See quotes → Ask AI → Export for client → Team sees it

Retention (Months 2+):
  Second project → Comparative analysis → Knowledge base → Can't switch
```

---

## MVP FEATURE CHECKLIST

**MUST HAVE** (12 weeks):
- [x] Authentication (JWT)
- [x] Dashboard (project list, stats, usage)
- [x] Upload (audio, video, txt, docx)
- [x] Transcript viewer (with timestamps)
- [x] Analysis grid (themes x participants)
- [x] Evidence panel (quotes with sources)
- [x] Chat (RAG over transcripts)
- [x] Export (CSV, PDF)
- [x] Mobile responsive
- [x] Code-mixing badge
- [x] Multi-language (EN, ID)

**NOT MVP** (Phase 1A):
- Concept testing
- Open ends coding
- Video player
- Clips & reels
- Live recording
- Knowledge base

---

## PRICING (Locked for 6 Months)

| Tier | Price | Seats | Projects | Min/mo | Analyses/mo | Storage |
|---|---|---|---|---|---|---|
| **Starter** | SGD 49 | 3 | 1 | 100 | 20 | 5 GB |
| **Professional** | SGD 99 | 8 | 5 | 600 | 200 | 50 GB |
| **Enterprise** | SGD 249+ | ∞ | ∞ | 3,000 | 2,000 | 500 GB |

Target mix: 15% Starter, 70% Professional, 15% Enterprise

---

## 6-MONTH TARGETS

| Metric | Target | Notes |
|---|---|---|
| **Signups** | 2,500+ | From 0 to 2.5K |
| **Customers** | 400+ | 10x growth |
| **MRR** | SGD 50K | From SGD 4K |
| **ARR** | SGD 600K | Run rate |
| **Activation rate** | 40%+ | Signup → first analysis |
| **30-day retention** | 50%+ | Month 1 cohort alive in Month 2 |
| **NPS** | 40+ | Customer satisfaction |
| **CAC** | <SGD 50 | Customer acquisition cost |
| **LTV:CAC** | >40:1 | Healthy unit economics |
| **Partnerships** | 20+ | Agencies, universities, integrations |

---

## GO-TO-MARKET (Country Launch Order)

1. **Singapore** (Week 1-4): Product Hunt, webinars, agencies
2. **Indonesia** (Week 2-12): Bahasa localization, WhatsApp, communities
3. **Malaysia + Thailand** (Month 4): Simultaneous launch
4. **Vietnam** (Month 5): High-growth market
5. **Philippines** (Month 6): Organic growth + buffer

---

## COMPETITIVE POSITIONING

**If prospects ask: "Why not Coloop?"**

| Coloop Says | We Say |
|---|---|
| "Advanced AI analysis" | Same Claude API + **code-mixing detection** |
| "Transcription" | Same providers + **Thai/Vietnamese specialists** |
| "USD 400-600/user/month" | SGD 99/user/month (70% cheaper) |
| "Global data centers" | SG/Jakarta data centers (**PDPA compliant**) |
| "Great support" | Local support **in your timezone & language** |

**Key phrase**: "We're not cheaper because we're worse. We're cheaper because we're built FOR SEA, not retrofitted for it."

---

## WEEKLY STANDUP AGENDA (Monday 9 AM SGT)

1. **What shipped last week?** (demo) — 20 min
2. **Metrics check** (vs target) — 15 min
3. **This week's priorities** (top 3) — 20 min
4. **Blockers & dependencies** — 20 min
5. **Next week preview** — 15 min

---

## WEEKLY METRICS CHECK

Every Monday, update these numbers:

```
Week X Metrics:
- Signups: ____ (target: ____)
- Activated users: ____% (target: 40%+)
- New customers: ____ (target: ____)
- MRR: SGD ____ (target: SGD ____)
- 7-day retention: ____% (target: 60%+)
- CAC: SGD ____ (target: <50)
- NPS: _____ (target: 30+)
```

If any metric >20% off target for 2+ weeks → investigate + adjust

---

## DECISION MAKING

### When to Ship a Feature
- ✓ 3+ customers requested it
- ✓ RICE score >200
- ✓ Aligned with value loop
- ✓ Team committed to it

### When to Hire
- ✓ Team blocking each other
- ✓ Metrics show growth > team capacity
- ✓ Clear ROI on the hire

### When to Adjust Roadmap
- ✓ Metric >20% off target for 2+ weeks
- ✓ 5+ customers request same feature
- ✓ Competitive threat emerges
- ✓ Key partnership opportunity

### When to Pivot
- ✗ Single customer complaint (document + continue)
- ✗ Feature is harder than expected (ship lighter version)
- ✗ Team dislikes direction (build it anyway, they'll like it post-launch)

**Default**: Ship, measure, learn, iterate. Don't plan endlessly.

---

## ANTI-PATTERNS (DON'T DO THESE)

1. **Feature creep** — "We also need X, Y, Z" → No. MVP only. 12 weeks.
2. **Copying Coloop** — They add feature X, so we panic and build it → No. Differentiate on what only we have.
3. **Premature optimization** — "Let's architect this for 10M users" → No. 100 users first, then scale.
4. **Over-engineering** — 4 weeks on scalability for 10 users → No. Ship first, optimize at 80% capacity.
5. **Skipping customers** — "We know what they need" → No. Talk to customers every week.
6. **Chasing metrics** — "NPS is 35, let's panic!" → No. Review trends, not single numbers.
7. **Analysis paralysis** — 20 customer interviews before deciding → No. 5 interviews, make call, move forward.

---

## FOUNDER'S MINDSET

```
Shipping > perfecting
Speed > strategy (if forced to choose)
Users > team preferences
Data > opinions
Learning > planning
Iterate > plan endlessly
```

**When in doubt: Ship it and iterate.**

---

## THE 12-WEEK MVP SPRINT

```
Week 1-2:   Foundation (setup, planning, design system)
Week 3-4:   Auth + Dashboard
Week 5-6:   Upload + Transcript viewer
Week 7-8:   Analysis grid + Evidence panel
Week 9-10:  Chat interface + Mobile optimization
Week 11:    Polish + QA
Week 12:    Soft launch + Beta feedback
```

**Critical path items** (must ship):
- Authentication ✓
- Upload & transcription ✓
- Analysis grid ✓
- Evidence panel ✓
- Chat ✓
- Mobile responsive ✓

**Can slip if needed** (but preferred in MVP):
- Export to PDF (CSV OK for MVP)
- Multi-language (English OK for MVP)
- Code-mixing badge (nice-to-have, high impact)

---

## SUCCESS LOOKS LIKE

**Month 1:**
- 1,000+ signups
- 40+ paid customers
- Product Hunt top 10
- 2-3 press mentions

**Month 3:**
- 2,000 signups (total)
- 150+ customers
- SGD 15K MRR
- 40% activation rate
- 4 case studies

**Month 6:**
- 2,500 signups (this month)
- 400+ customers (total)
- SGD 50K MRR
- Product-market fit signal
- 20+ partnerships
- Team doubled (10-12 people)

---

## YOUR JOB THIS WEEK

**If you're the PM:**
1. [ ] Read EXECUTIVE_SUMMARY.md
2. [ ] Copy IMPLEMENTATION_CHECKLIST.md Week 1-2 section
3. [ ] Assign tasks to team
4. [ ] Set up Monday/Friday meeting
5. [ ] Create metrics dashboard

**If you're an Engineer:**
1. [ ] Read EXECUTIVE_SUMMARY.md sections 1-2
2. [ ] Review IMPLEMENTATION_CHECKLIST.md Weeks 1-4
3. [ ] Start Week 1 tasks (environment setup, design review)

**If you're a Designer:**
1. [ ] Read EXECUTIVE_SUMMARY.md section 2 (product)
2. [ ] Review PRODUCT_STRATEGY.md Feature Prioritization Matrix
3. [ ] Create Figma file with component library starter

**If you're a Marketer:**
1. [ ] Read EXECUTIVE_SUMMARY.md section 5 (go-to-market)
2. [ ] Review MARKET_ANALYSIS_AND_COMPETITIVE_PLAYBOOK.md section 5
3. [ ] Draft Product Hunt page outline

---

## DOCUMENTS YOU NEED (Print These)

- [ ] STRATEGY_INDEX.md (reference guide)
- [ ] QUICK_REFERENCE.md (this file, print and laminate)
- [ ] IMPLEMENTATION_CHECKLIST.md (this week's section)
- [ ] METRICS_AND_DASHBOARDS.md (targets)

---

## MONTHLY CHECKLIST

**First day of month:**
- [ ] Review MRR (vs. target)
- [ ] Review customer count & churn
- [ ] Check activation rate
- [ ] Check retention by cohort
- [ ] Share results with team

**Day 10 of month:**
- [ ] Call 5 customers (power user, churn, new, partner, detractor)
- [ ] Document themes
- [ ] Add feature requests to backlog with RICE scores

**Day 20 of month:**
- [ ] Are we on track?
- [ ] Do we need to adjust next month's plan?
- [ ] Any competitive threats?
- [ ] Any partnership opportunities?

---

## QUARTERLY CHECKLIST

- [ ] Review OKRs (did we hit them?)
- [ ] Review metrics (vs. targets)
- [ ] Customer feedback synthesis
- [ ] Competitive analysis update
- [ ] Set new OKRs
- [ ] Adjust roadmap (if needed)
- [ ] Allocate resources
- [ ] Identify risks
- [ ] Team retrospective

---

## IF YOU GET STUCK

| Problem | Solution | Document |
|---|---|---|
| "What should I build?" | Check RICE matrix | PRODUCT_STRATEGY.md |
| "How do I compete with Coloop?" | Check competitive playbook | MARKET_ANALYSIS.md |
| "Am I on track?" | Check target vs. actual | METRICS_AND_DASHBOARDS.md |
| "What's my role this week?" | Check implementation checklist | IMPLEMENTATION_CHECKLIST.md |
| "When should I hire?" | Check decision framework | PM_README.md |
| "Should we pivot?" | Check red flags | PM_README.md |
| "What's the pricing?" | It's locked | PRODUCT_STRATEGY.md section 4 |
| "Which country to launch first?" | Singapore, then Indonesia | PRODUCT_STRATEGY.md section 6 |
| "What are this week's tasks?" | Copy checklist | IMPLEMENTATION_CHECKLIST.md |

---

## CONTACT & ESCALATION

**Stuck on a product decision?**
- Reference PRODUCT_STRATEGY.md section 2 (Feature Prioritization)
- If not there, use RICE framework
- If still unclear, bring to Monday standup

**Stuck on a market decision?**
- Reference MARKET_ANALYSIS_AND_COMPETITIVE_PLAYBOOK.md
- If not there, escalate to founder

**Stuck on execution?**
- Reference IMPLEMENTATION_CHECKLIST.md
- If blocked, unblock immediately (don't wait)

**Stuck on metrics?**
- Reference METRICS_AND_DASHBOARDS.md
- If target seems wrong, discuss in monthly review

---

## ONE-LINER PITCHES

**For investors**: "We're building the AI-powered research platform FOR Southeast Asia, not retrofitted for it. Code-mixing detection, local compliance, 70% cheaper pricing. USD 86M market, 12% growth, zero local competition."

**For customers**: "Analyze qualitative research in minutes, not days. Understand code-mixing (Taglish, Singlish, bahasa gaul). Your data stays in ASEAN. Fair pricing. Join 400+ researchers."

**For team**: "We're building the dominant qual research platform in Southeast Asia. 6-month goal: 400 customers, product-market fit. If we execute this playbook, we win."

**For press**: "New SEA startup tackles $86M qual research market. Leverages code-mixing AI + local compliance + pricing 70% below Coloop to dominate emerging market."

---

## KEY DATES

| Milestone | Date | Target | Status |
|---|---|---|---|
| MVP Launch | Week 12 | Product Hunt top 10 | Planned |
| Month 1 Review | Day 30 | 40+ customers, SGD 4K MRR | Track |
| Month 3 Review | Day 90 | 150+ customers, SGD 15K MRR | Track |
| Month 6 Review | Day 180 | 400+ customers, SGD 50K MRR | Track |
| Year 1 Review | Day 365 | 2,000+ customers, SGD 3-5M ARR | Plan |

---

## PRINT & LAMINATE

This page is designed to fit on a single laminated 8.5"x11" card.

**Hang it above your desk.**

**Reference it every day.**

**Share with new team members (on-day 1).**

---

**Good luck. Now go build.** 🚀
