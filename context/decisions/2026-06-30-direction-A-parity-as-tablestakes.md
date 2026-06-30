---
tags: [decision]
date: 2026-06-30
---
# Decision · Direction A — parity is table-stakes, build the wedge next

## Context
Cloned the repo (now public). Findings: CoLoop-parity qual platform already built (Phase 0-7:
analysis grid, RAG/chat, concept testing, content analysis, open-ends, clips, live recorder,
integrations); **Fieldwork QC wedge absent in code**; **no CLAUDE.md**; context scattered across 40+
inconsistent root docs (one states the goal as "compete with coloop.ai" — superseded). This is the
drift made concrete: agents executed an old strategy with no anchor.

## Decision (Direction A)
1. Treat the existing qual-parity build as a **table-stakes base** — keep it, **stop expanding it as
   the differentiator.**
2. **Next priority = Fieldwork QC / Verifier wedge**, then the **SEA layer** (integrations, hosting,
   compliance, currency).
3. Beating CoLoop broadly on qual + deeper quant = **later**, only after the wedge + SEA.
4. Install `CLAUDE.md` + `context/` vault as the **single source of truth**; the 40+ root docs are
   historical/reference only (vault wins on conflict).

## Why
Avoids shipping a me-too with no moat; reuses the built infra; aligns with the only hard
differentiator (data-collection integrity), validated by real Kadence work (600+ files verified/day).

## Status
Wedge **not yet built**. Next concrete step: a focused spec for the Fieldwork QC module, grounded in
the real backend (models/routers), fed to the Claude Code agents to build. See [[build-status]].
