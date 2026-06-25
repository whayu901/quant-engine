# Qual Engine: Executive Summary
## Building the Dominant Qualitative Research Platform for Southeast Asia

**Date**: June 2026
**Status**: Product Strategy Complete, Ready for Implementation
**Target Market**: Southeast Asia (6 countries)
**Primary Competitor**: Coloop.ai (Western-focused)

---

## THE OPPORTUNITY

**Market**: USD 86M/year qualitative research spend across SEA
**Software penetration**: 15-20% currently using software tools
**Addressable software market**: USD 17M/year
**Growth rate**: 12% CAGR (fastest-growing region for qual research)

**Why now?**
- Regulation tightening (PDPA, UU PDP) = data residency becoming mandatory
- FDI wave = multinational companies establishing regional research centers
- E-commerce boom = companies need faster research cycles
- Tech adoption accelerating post-pandemic
- No strong local competitor (Coloop has <100 customers in entire SEA)

---

## THE STRATEGY: LOCAL-FIRST, NOT GLOBAL-FIRST

### Three Pillars of Competitive Advantage

**1. Language & Cultural Fit**
- Only platform that detects code-mixing (Taglish, Singlish, bahasa gaul)
- Analysis in source language (not forced to English)
- 6 SEA languages support + English
- Researchers feel understood ("finally a tool for us")
- **Viral hook**: Code-mixing badge on first analysis

**2. Local Infrastructure & Compliance**
- Data residency in Singapore/Jakarta (not US-only)
- PDPA-compliant by design
- DPA support for enterprise customers
- Built by people who understand SEA regulations
- **Enterprise moat**: Hard for international tools to replicate

**3. SEA-Appropriate Pricing**
- SGD 49-249/user/month (vs. SGD 300-800 from Coloop)
- 50-70% cheaper than Western competitors
- Still maintains strong unit economics (LTV:CAC > 40:1)
- Enables team adoption (all researchers can afford seats)

### Secondary Advantages

- **Mobile-first design** — 85% of SEA internet is mobile
- **Local integrations** — WhatsApp, SurveyToGo, regional payment methods
- **Speed to market** — 12-week MVP vs. 6-month for competitors
- **Partnership ecosystem** — Agencies, universities, associations
- **Community** — SEA researcher network from day one

---

## THE PRODUCT

### MVP (Weeks 1-12)
**Core value loop**: Upload transcript → Get AI analysis → Ask questions → Export insights

**Core features**:
- Transcript upload (audio, video, text)
- Auto-transcription + diarization
- AI-powered theme extraction
- Analysis grid (themes × participants)
- Evidence panel (exact quotes with timestamps)
- Chat over transcripts (RAG)
- Export to CSV/PDF
- Mobile responsive design
- Code-mixing detection badge
- Multi-language support

**Stack**: Next.js + React, TypeScript, Tailwind CSS, FastAPI backend (70% built)

### Phase 1A (Months 4-6): Growth & Expansion
- Concept testing (stimulus tagging)
- Open Ends bulk coding (CSV upload, 1K-10K rows)
- Video interview support (click transcript → jump to timestamp)
- Clips & Reels (export video quotes)
- Collaborative comments
- Knowledge Base (cross-project search)
- SEA localization (full UI in Bahasa Indonesia)

### Phase 1B (Months 7-9): Enterprise
- SSO (SAML/OpenID)
- Custom roles & permissions
- Audit logs
- Compliance reporting
- Multimarket analysis
- APIs & webhooks
- Live recording (Recall.ai)
- Fieldwork QC (fieldwork integration)

### Phase 2 (Months 10-18): Consolidation
- AI-generated insights (autonomous)
- Integration marketplace (15+ SaaS tools)
- Advanced reporting
- Analytics dashboard
- Vertical specialization (CPG, retail, fintech)

---

## THE BUSINESS MODEL

### Pricing Tiers

```
STARTER          PROFESSIONAL        ENTERPRISE
SGD 49/mo        SGD 99/mo          SGD 249+/mo
───────────────────────────────────────────
3 seats          8 seats            Unlimited
1 project        5 projects         Unlimited
100 min/mo       600 min/mo         3,000 min/mo
20 analyses/mo   200 analyses/mo    2,000 analyses/mo
5 GB storage     50 GB storage      500 GB storage

Target split: 15% Starter, 70% Professional, 15% Enterprise
```

### Financial Projections (First 6 Months)

| Month | Signups | Customers | MRR | ARR |
|---|---|---|---|---|
| Month 1 (MVP) | 1,000 | 40 | SGD 4K | SGD 48K |
| Month 2 | 1,500 | 100 | SGD 10K | SGD 120K |
| Month 3 | 1,800 | 150 | SGD 15K | SGD 180K |
| Month 4 | 2,000 | 250 | SGD 25K | SGD 300K |
| Month 5 | 2,200 | 350 | SGD 35K | SGD 420K |
| Month 6 | 2,500 | 400+ | SGD 50K | SGD 600K |

**Year 2 projection**: SGD 3-5M ARR (feasible given market size + growth rate)

---

## THE VALUE LOOP (Why Users Stay)

### Activation (Week 1)
- Upload transcript (5 min)
- See themes auto-extracted (2 min)
- **Aha moment**: "Other tools take 30 hours; this took 7 minutes"

### Engagement (Week 1-4)
- Click theme → see exact quotes
- Ask chat questions (iterative)
- Collaborate with team (comments)
- Export for client presentation
- **Stickiness**: Saves 30-40 hours per project

### Retention (Months 2+)
- Second project adoption (60% of users)
- Multi-transcript comparative analysis
- Knowledge base search (saves hours)
- Team habits form (switching cost increases)
- **Lock-in**: Multi-project + team adoption = high switching cost

**Target metrics**:
- Activation rate (signup → first analysis): 40%
- Week 1 retention: 60%
- Month 1 retention: 50%
- Month 3 retention: 40%
- NPS: 40+ by Month 3

---

## GO-TO-MARKET STRATEGY

### Country-by-Country Launch

**Singapore (Q1, Week 1-4)**: Establish beachhead
- Product Hunt launch
- Press outreach (TechInAsia, Geek Culture)
- Webinar series
- Target: 300 signups, 25-30 paid customers

**Indonesia (Q1, Week 2-12)**: Leverage local language advantage
- Bahasa Indonesia UI
- LinkedIn campaign in Bahasa
- WhatsApp community outreach
- Target: 200 signups, 10+ paid customers
- **Key differentiator**: Code-mixing detection works in Bahasa

**Malaysia + Thailand (Q2, Month 4)**: Simultaneous launch
**Vietnam (Q2, Month 5)**: High-growth market
**Philippines (Q2, Month 6)**: Buffer/organic growth

### Partnerships (Critical for go-to-market)

**Tier 1: Co-marketing** (Associations, Media)
- Indonesia: Komunitas Riset Pasar Indonesia, Marketeers.com
- Singapore: Singapore Market Research Society
- Thailand, Malaysia, Vietnam: Local marketing associations
- **Expected result**: 20-30 signups per partnership, media coverage

**Tier 2: Channel Partners** (Agencies, Resellers)
- Target: 10-15 qual research agencies
- Pitch: White-label + 20% revenue share
- **Expected result**: 30-50 customers per agency

**Tier 3: Strategic** (Universities, Platforms)
- Partner with 5-6 universities (free tier for students)
- Zapier, n8n, Stripe integrations
- **Expected result**: Talent pipeline + viral adoption

**Target by Month 6**: 20+ partnerships active, 200+ customers from partnerships (30% of total)

---

## COMPETITIVE ADVANTAGE & MOATS

### Why We Win vs. Coloop

| Dimension | Qual Engine | Coloop | Winner |
|---|---|---|---|
| **Code-mixing detection** | Yes (Taglish, Singlish, bahasa gaul) | No | Qual Engine |
| **Languages** | 6 SEA + English | English dominant | Qual Engine |
| **Pricing** | SGD 99/mo | SGD 300-800/mo | Qual Engine |
| **Data residency** | SG/Jakarta | US only | Qual Engine |
| **PDPA compliance** | Native | Reactive | Qual Engine |
| **Local support** | Yes | No | Qual Engine |
| **Features** | Parity | Parity | Tie |
| **Mobile first** | Yes | No | Qual Engine |

### Defensible Moats

1. **Code-mixing database** — By Month 12, we've analyzed 10,000+ SEA code-mixed transcripts; our ML models are SEA-specific
2. **Regulatory expertise** — We understand PDPA/UU PDP deeply; competitors catch up in 12+ months
3. **Community** — SEA researcher network becomes sticky; hard to poach
4. **Team adoption** — Multi-seat adoption creates higher switching costs
5. **Ecosystem** — 20+ integrations by Month 6; competitors start from 0

**Time to replicate**: 12-18 months for determined competitor

---

## RISKS & MITIGATION

### Market Risk
**Risk**: Coloop launches SEA product, undercuts our pricing
**Mitigation**: (1) Move fast (establish 800+ customers by Month 9), (2) Build moats (code-mixing, compliance), (3) Community (switching cost high)
**Fallback**: Double down on enterprise segment (higher LTV, compliance premium)

### Execution Risk
**Risk**: Frontend MVP takes 6 months instead of 3
**Mitigation**: Hire experienced Next.js engineer, ruthless scope control, ship weekly
**Fallback**: Launch with fewer charts, add in Phase 1

### Unit Economics Risk
**Risk**: CAC higher than expected, churn higher
**Mitigation**: Focus on activation in Month 1-2, track LTV:CAC weekly
**Fallback**: Raise prices, focus on high-ARPU enterprise first

### Talent Risk
**Risk**: Hard to hire experienced engineers in SEA
**Mitigation**: Mix of remote + local hires, founder-led hiring, equity incentives
**Fallback**: Outsource non-core work, focus on high-impact features

---

## KEY SUCCESS METRICS (6 Months)

### Growth Metrics
- **Signups**: 1,000+ by Week 12, 2,500+ by Month 6
- **Customers**: 40+ by Week 12, 400+ by Month 6 (10x growth)
- **MRR**: SGD 4K by Week 12, SGD 50K by Month 6 (12.5x growth)
- **Geographic split**: SG 50%, ID 30%, others 20%

### Engagement Metrics
- **Activation rate**: 40%+ (signup → first analysis)
- **Aha moment time**: <10 minutes (from upload to analysis viewed)
- **Chat usage**: 60%+ of active users
- **Clips created**: 15%+ of teams

### Retention Metrics
- **Week 1 retention**: 60%+
- **Week 4 retention**: 50%+
- **Month 2 retention**: 50%+
- **Month 3 retention**: 40%+
- **Churn rate**: <10% monthly

### Product Metrics
- **NPS**: 30+ by Month 1, 40+ by Month 3
- **Feature adoption**: Chat 60%, Concept testing 20%, Clips 15%
- **Code-mixing badge**: 80%+ of analyses
- **Mobile usage**: 40%+ of traffic

### Financial Metrics
- **ARPU**: SGD 99 (all Professional)
- **LTV:CAC**: >40:1
- **Gross margin**: >85%
- **Customer concentration**: No single customer >5% of revenue

---

## IMMEDIATE NEXT STEPS (This Week)

### Product (Priority 1)
- [ ] Finalize frontend MVP scope (cut ruthlessly)
- [ ] Design system freeze
- [ ] Sprint planning (Week 1 kickoff)

### Marketing (Priority 2)
- [ ] Product Hunt campaign outline (due Friday)
- [ ] Press list finalization
- [ ] Social media strategy approved

### Operations (Priority 3)
- [ ] Analytics setup (Mixpanel/Amplitude)
- [ ] Payment system (Stripe) configured
- [ ] Support system selected + configured

### Fundraising (If applicable)
- [ ] Investor pitch deck updated with strategy
- [ ] Financial model locked (6-month, 12-month projections)
- [ ] Meetings scheduled (if raising)

---

## BOTTOM LINE

**Qual Engine is positioned to become the dominant qualitative research platform in Southeast Asia** because:

1. **We're built FOR the region**, not retrofitted for it
2. **We own defensible moats** (code-mixing, compliance, community)
3. **We have a 12-month window** before international competitors react
4. **The TAM is huge** (USD 86M/year qual research spend, 12% growth)
5. **Unit economics work** (LTV:CAC > 40:1, clear path to profitability)
6. **Our team is ready** (backend 70% done, strong execution track record)

**6-month goal**: 400+ customers, SGD 600K ARR, clear product-market fit in Singapore & Indonesia, platform for 2,000+ customers by Month 12.

**18-month goal**: 5,000+ customers, SGD 12M+ ARR, 60% market share in SEA, defensible market leader position.

**This is an exceptional opportunity with a clear playbook and strong execution team.** The window is open; we must move fast.

---

## FILES CREATED

For full details, see:

1. **`PRODUCT_STRATEGY.md`** — Complete product strategy, roadmap, pricing, OKRs
2. **`MARKET_ANALYSIS_AND_COMPETITIVE_PLAYBOOK.md`** — Market sizing, competitor analysis, go-to-market playbook
3. **`EXECUTIVE_SUMMARY.md`** — This document

These documents provide everything needed to:
- Brief investors or board
- Align team on direction
- Execute quarterly planning
- Track progress vs. targets
- Respond to competitive threats

**Questions or clarifications?** All strategies are designed to be iterable; we review and adjust quarterly based on actual metrics.
