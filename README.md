# Qual Engine — Backend (Drop 1)

Server-side qualitative-research analysis engine. Takes an FGD/IDI transcript and
produces coded themes, source-traceable verbatims, an executive topline, and business
implications — built as a multi-tenant SaaS from day one.

> Drop 1 = backend + infrastructure. Drop 2 (React frontend) is next.

## Architecture

```
React (Drop 2) ──HTTPS──> FastAPI ──> Postgres
                             │
                             ├─> Anthropic (Claude)   3-stage pipeline (server-side)
                             └─> Celery + Redis        async analysis jobs

Auth: JWT  ·  Multi-tenant: every row scoped by org_id  ·  Usage metered per org/month
```

**Pipeline (runs in the worker):** transcript → ① code themes → ② extract verbatims
(copied verbatim from the transcript, not invented) → ③ topline + implications.

## What's included

- **Auth & tenancy** — register (creates an org + admin), login (JWT), `/auth/me`. Every
  query is scoped by `org_id`; cross-org access returns 404 (verified by smoke test).
- **Roles** — `admin` / `researcher` / `viewer`, enforced per endpoint.
- **Projects → Transcripts → Analyses** — full CRUD, `.txt` / `.docx` upload + paste.
- **Async analysis** — Celery task; poll `GET /analyses/{id}` for `status` + results.
- **Usage metering** — per-org monthly count + plan limit gate (HTTP 402 when exceeded).
- **Audit-friendly** — verbatims stored with their quote + speaker, traceable to source.

## Run it

### Option A — Docker (Postgres + Redis + API + worker)
```bash
cp .env.example .env          # then set ANTHROPIC_API_KEY and SECRET_KEY
docker compose up --build
# API at http://localhost:8000  ·  docs at http://localhost:8000/docs
```

### Option B — Local dev (SQLite, no broker)
```bash
cd backend
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
export CELERY_TASK_ALWAYS_EAGER=true   # run jobs inline, no Redis needed
export DATABASE_URL=sqlite:///./qualengine.db
uvicorn app.main:app --reload
```

### Smoke test (mocked LLM, no key needed)
```bash
cd backend && PYTHONPATH=. python tests/smoke.py
```

## API tour

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | create org + admin, returns JWT |
| POST | `/auth/login` | get JWT |
| GET  | `/auth/me` | current user |
| POST | `/projects` | create project |
| GET  | `/projects` | list org projects |
| POST | `/projects/{id}/transcripts` | add transcript (JSON) |
| POST | `/projects/{id}/transcripts/upload` | upload `.txt`/`.docx` |
| POST | `/transcripts/{id}/analyses` | start analysis (async) |
| GET  | `/analyses/{id}` | status + full results |
| GET  | `/usage` | plan, month count, remaining |

Interactive docs: `http://localhost:8000/docs`.

## Stubbed / next (honest list)

- **Migrations** — boot uses `create_all`. Add **Alembic** before production.
- **Billing** — plan tiers are metered but not wired to Stripe.
- **Audio → transcription**, cross-FGD synthesis, SSO — roadmap.
- **Verbatim highlighting** — frontend concern (Drop 2).

## Security notes

- Anthropic key lives **server-side** (env), never exposed to the browser.
- Tenant isolation is enforced at query time via `org_id` — critical for client/NDA data.
- Change `SECRET_KEY` and DB credentials for any real deployment; put the API behind TLS.

---

## Frontend (Drop 2)

React + Vite SPA in `frontend/`. Talks to the FastAPI API; JWT stored client-side.

Pages: login/register · projects (with usage meter) · project detail (add/paste
transcript, start analysis) · analysis results (status polling, **transcript
highlighted per theme**, topline, verbatims, business implications).

```bash
cd frontend
cp .env.example .env        # set VITE_API_URL (default http://localhost:8000)
npm install && npm run dev   # http://localhost:5173
```

## n8n pipeline

See `n8n/README.md` — importable workflow that runs the same 3-stage pipeline on the
n8n canvas (demo / ecosystem use). The product hot path stays on FastAPI + Celery.

---

## Phase 1 — Ingestion + Transcription (build log)

Adds the front of the CoLoop blueprint on top of the existing backend:

- **Media upload** — `POST /projects/{id}/media` (audio/video) → stored via a pluggable
  storage layer (local dev / S3 / MinIO) → creates a Transcript with
  `transcription_status=pending` → async transcription job.
- **Transcription providers** (`app/transcription.py`, pluggable via `TRANSCRIPTION_PROVIDER`):
  `mock` (offline dev/test), `deepgram`, `assemblyai`, `whisper_local` (faster-whisper).
  Returns normalized `{language, text, segments[], duration}` with **speaker diarization**.
- **Segments with timestamps** — stored as `TranscriptSegment` rows (speaker, start, end,
  text). This is the foundation for clips/reels and timestamped evidence in later phases.
- **Translation** — `TRANSLATE_TO_ENGLISH=true` (provider-side) or per-transcript language.
- **Guard** — analysis is blocked until transcription completes and text exists.

Flow: upload recording → poll `GET /transcripts/{id}` until `transcription_status=done`
→ run analysis as before. Smoke test covers media→transcript→segments→analysis with the
mock provider (no external keys needed).

> `whisper_local` needs `pip install faster-whisper` (kept out of base requirements as
> it's heavy). Real providers (Deepgram/AssemblyAI) need their key + outbound network.
