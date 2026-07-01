---
tags: [anchor, status]
---

# Build Status

_Updated 2026-06-30 — the Fieldwork QC wedge is now end-to-end (backend + UI), tech debt cleared, all merged to main._

## Built — THE MOAT: Fieldwork QC / Verifier ✅ (new)

End-to-end and **validated against synthetic ground truth** (52 interviews; detector output matches
the answer key exactly). Detectors are **deterministic → demoable now without a real LLM**.

- **Backend (Phase 1–4):** models (FieldworkBatch / Interview / QCFlag / InterviewerScore, Alembic);
  CSV/XLSX import (ImportJob, idempotent); **9 detectors** (speeder, too_long, straightlining,
  gps_out_of_area, gps_identical, duplicate_openend, audio_presence, cadence_impossible, eligibility);
  QC scoring + status; interviewer-anomaly scoring; report (**fraud separated from eligibility**);
  reviewer console (resolve flags → recompute). Tenant-scoped, role-gated.
- **Frontend (Phase 6, Next.js + MUI):** batch list; batch dashboard (stat cards, per-check bar,
  trend line, anomaly leaderboard, GPS map with sampling-bbox overlay); interview table; interview
  detail (answers, map, flags + Confirm/Dismiss). Read-only + resolve.

## Built — CoLoop-parity base (table-stakes, Phase 0–7)

Auth/RBAC; ingestion (multi-format, SEA langs); analysis grid; chat/RAG (pgvector); quant
(surveys/stats); collaboration/enterprise (teams, SSO, audit); media; visualization. Backend
FastAPI + Postgres/SQLite + Alembic + Celery/Redis; frontend Next.js + MUI.

- Note: built largely against a **mock LLM** (`llm_mock.py`) — verify with real keys.

## Cleared — tech debt ✅

- Migration chain runs from an empty DB (`alembic upgrade head` green; single head).
- **Postgres verified (2026-07-01):** full stack now boots via `docker-compose up` on Postgres 16
  (backend `/health` 200; db/redis/minio healthy). Fixed several SQLite-only migration/seed bugs
  (`sa.DATETIME()`→`sa.DateTime()`, dropped a btree index on a JSON column, seed model-registration +
  field drift + FK-order flushes, added missing `slowapi` dep). Note: host 5432 is usually taken by a
  native Postgres → `db` container remapped to host 5433 (backend reaches `db:5432` internally).
- Frontend builds clean (`next build` green, no `ignoreBuildErrors`); dead Tailwind code removed.
- Open item: orphan `frontend/src/` is gitignored (harmless to CI/deploy; tidy up locally so local == repo).

## NOT built — needs an external input before it's worth doing

- **Phase 5 (audio-vs-answers):** needs real silent-audio + ASR. `audio_ref` is a placeholder.
  Buildable mock-first, but low real value until real audio exists.
- **Live integrations (SurveyToGo/Dooblo, tSurvey, KOINS, WhatsApp):** need API access/creds.
  The adapter can be **stubbed/pluggable now** (mock provider), real creds later.
- **Deploy + real LLM + UU PDP/PDPA hardening:** needs a hosting target, API keys
  (Anthropic/Deepgram), and a compliance pass.

## Next (GTM-first — see goals.md / strategy-vs-coloop.md)

The wedge is done. Highest-value next is **NOT more features** — it's making the wedge demoable and
pitching Kadence as a design partner. Heavy infra (Phase 5, live integrations, deploy) only earns its
cost **after** a partner is interested.
