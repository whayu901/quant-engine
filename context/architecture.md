---
tags: [reference, architecture]
---
# Architecture

> If this conflicts with the actual repo, the repo wins — update this file.

## Stack
- **Backend:** FastAPI (Python) — chosen over Node because the roadmap grows into quant/stats/ML.
- **Async:** Celery + Redis (transcription, analysis as tasks).
- **DB:** Postgres (prod) / SQLite (dev). Models scoped by `org_id` for multi-tenancy.
- **Storage:** pluggable local / S3 / MinIO.
- **ASR:** pluggable provider interface (mock / Deepgram / AssemblyAI / Whisper).
- **Frontend:** React + Vite, brand tokens (IBM Plex + Newsreader, petrol/amber).
- **Auth:** JWT, roles (admin / researcher / viewer).

## Core entities
Org · User · Project · MediaAsset · Transcript · TranscriptSegment · Analysis · Theme · Verbatim ·
Implication · UsageRecord. (Roadmap adds RecordingSession, Integration, Grid, KBChunk, CreditLedger...)

## Boundaries
- **FastAPI owns the product hot path** (auth, tenant, usage, NDA client data stays in-infra).
- **n8n** = ecosystem conductor + visible-demo pipeline only; never in the NDA hot path.
  ("FastAPI = instrument, n8n = conductor.")

## SEA-first requirements (see [[strategy-vs-coloop]])
In-region hosting (ap-southeast) + UU PDP/PDPA · code-mix ASR routing · local integrations
(SurveyToGo/Dooblo, tSurvey, KOINS, WhatsApp) · local currency/pricing · EN + Bahasa UI.
