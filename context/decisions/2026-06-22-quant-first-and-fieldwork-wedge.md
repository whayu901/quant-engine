---
tags: [decision]
date: 2026-06-22
---
# Decision · Wedge = Fieldwork QC; don't fight CoLoop on qual

## Context
CoLoop.ai already covers nearly the entire qualitative-analysis chain (transcription, grids,
RAG repository, open-end coding, concept testing, clips, Skills, compliance). Building a CoLoop
competitor on analysis is a losing race.

## Decision
1. The differentiator is **Fieldwork QC / data-collection integrity** — a layer CoLoop
   structurally doesn't touch. This is the priority module to build.
2. Position the whole product **Southeast-Asia-first** (code-mix, in-region hosting/compliance,
   local integrations) as the reason to exist vs a global tool.
3. The qual-analysis pipeline already built is **proof of capability**, not the moat.
4. Domain **Skills** (derived from real Kadence roles) are a thin layer that comes **after** the
   wedge — not a substitute for it.

## Why
Validated by real Kadence work (e.g. quant team verifying 600+ registration files/day). It's
quant-side (matches Kadence's actual workforce), painful, high-volume, and unserved by incumbents.

## Status
Wedge **not yet built**. See [[build-status]].
