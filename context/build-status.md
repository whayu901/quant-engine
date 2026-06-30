---
tags: [anchor, status]
---
# Build Status

_Source: cloned repo, 2026-06-30. Update whenever build state changes._

## Built — the CoLoop-parity base (table-stakes, Phase 0-7)
- **Auth/Setup:** JWT, RBAC, 9 test users, Alembic migrations.
- **Ingestion:** multi-format upload (audio/video/docs), transcripts, SEA language support.
- **Analysis grid:** theme extraction, evidence, cross-transcript analysis.
- **Chat/RAG:** pgvector embeddings, semantic search, conversational AI.
- **Quantitative:** surveys, statistics (`quantitative.py`).
- **Collaboration/Enterprise:** teams, SSO, audit.
- **Media:** video/audio processing, waveforms, multimodal.
- **Visualization:** charts/graphs, caching, perf for large datasets.
- Backend FastAPI + Postgres/SQLite + Alembic + Celery/Redis; React+Vite frontend; n8n; docker-compose.
- Note: built largely against a **mock LLM** (`llm_mock.py`) — verify behaviour with real keys.

## NOT built — the moat (Direction A priority)
- (STAR) **Fieldwork QC / Verifier** (the wedge). Does not exist in code. **Build next.**
- **SEA layer (live):** SurveyToGo/Dooblo, tSurvey, KOINS, WhatsApp integrations; in-region
  hosting + UU PDP/PDPA hardening; local currency/pricing.

## Later (after the wedge + SEA)
- Broader CoLoop-parity polish; deeper quant (crosstabs/weighting); billing (Stripe — likely stub).

## Reconciliation note
The 40+ root `*.md` docs (PROJECT_CONTEXT, CONTEXT_AND_PROGRESS, PRODUCT_STRATEGY, etc.) are
historical and **inconsistent** (different phase counts, names "Qualitas/Qual Engine", a Dec-2024
"compete with coloop.ai" goal). They are reference only. **This vault is canonical.**
