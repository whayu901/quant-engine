# Quant Engine — Project Memory

> Claude Code loads this file every session. Read it first, then re-anchor before acting.

**What this is:** a Southeast-Asia-first AI platform for market-research operations, built to
win **Kadence International** as a client by doing what CoLoop.ai can't.

## Session-start protocol (every time)
1. Read `context/00-START-HERE.md`, `context/goals.md`, `context/strategy-vs-coloop.md`,
   `context/build-status.md`.
2. Don't rebuild or re-decide settled things; check `context/decisions/` for the *why*.
3. If a request conflicts with `goals.md` or its non-goals, flag it and ask. Do not silently drift.

## Source of truth — read this twice
`context/` is the **single source of truth**. The 40+ `*.md` files at the repo root are
**historical / working notes** — do NOT treat them as current strategy. If anything conflicts
with `context/goals.md` or `context/strategy-vs-coloop.md`, **the vault wins.** (One old doc
literally says the goal is to "compete with coloop.ai" on qual — that is the superseded strategy.)

## The rule that prevents drift (Direction A — locked 2026-06-30)
The codebase ALREADY contains CoLoop-parity qual features (analysis grids, concept testing,
content analysis, open-ends, RAG/chat, clips, live recorder, integrations). **These are DONE and
count as table-stakes — do NOT keep expanding them as the differentiator.**

The next priority is the layer CoLoop structurally can't reach:
1. **Fieldwork QC / Verifier** — the wedge. NOT built yet. Highest leverage.
2. **The Southeast Asia layer** — code-mix ASR, in-region hosting/compliance, local integrations.

Competing with CoLoop broadly on qual is a **LATER** phase, not now. If you're adding more
qual-analysis parity features "to beat CoLoop," stop — that's the drift we are correcting.

## Keeping this memory fresh
- Meaningful decision -> append a dated note to `context/decisions/`.
- Build state changed -> update `context/build-status.md`.
- You edit the vault with normal file tools (it's in this repo; no MCP needed). Human edits in Obsidian.

## Stack (summary; see `context/architecture.md` and `context/build-status.md`)
FastAPI + Postgres/SQLite + Alembic + Celery + Redis (multi-tenant, JWT/RBAC, usage metering) ·
React + Vite frontend · pgvector RAG · pluggable ASR + S3/MinIO · n8n (demo conductor only).
