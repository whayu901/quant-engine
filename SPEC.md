# Claude Code Build Prompt — "Qual Engine" (AI Qualitative Research Platform)

> Paste this whole file into Claude Code. Tell it: **"Read this spec, make a plan, then
> build Phase 0 → 1 → 2 … running tests after each phase. Pause after each phase for my
> review."** Provide your own keys in `.env` for real runs; mock providers work offline.

---

## 1. Role & goal

You are building a production-grade, **multi-tenant SaaS** web app called **Qual Engine** —
an AI platform for qualitative market research that turns interview / focus-group
recordings and survey data into **report-ready insights**. Capability target: parity with
CoLoop (transcription, analysis grids, chat/RAG over research, open-end coding, concept
testing, clips, cross-project knowledge base), plus enterprise trust (multi-tenancy, RBAC,
PII masking, data residency, audit).

**Target market: Southeast Asia first** (Indonesia, Malaysia, Singapore, Thailand, Vietnam,
Philippines). Where CoLoop is international / English-first, this product is built for SEA
realities — **code-mixed & regional languages, in-region hosting & compliance, local
integrations (WhatsApp, fieldwork stacks), and SEA-appropriate pricing.** See **§13** for
the SEA layer; treat it as first-class, not an afterthought.

Build the **complete backend and the complete frontend**. Work incrementally in the phases
in §9. After each phase: make it run, write + run tests, summarize changes, then continue.

## 2. Existing scaffold (extend — do not duplicate)

A partial implementation already exists in this repo (if absent, create it first from §4–§5):

```
backend/app/
  config.py database.py models.py schemas.py security.py deps.py
  llm.py            # 3-stage Claude pipeline: themes -> verbatims -> topline+implications
  storage.py        # pluggable media storage: local | s3/minio
  transcription.py  # pluggable ASR: mock | deepgram | assemblyai | whisper_local (+ diarization)
  celery_app.py tasks.py usage.py main.py
  routers/ auth.py projects.py transcripts.py analyses.py usage.py
backend/tests/smoke.py
frontend/ (React + Vite)
  src/ api.js auth.jsx App.jsx styles.css
  src/components/ Layout.jsx StatusDot.jsx
  src/pages/ Login.jsx Projects.jsx Project.jsx Analysis.jsx
docker-compose.yml  backend/Dockerfile  .env.example
```

Already working: JWT auth + multi-tenant orgs/roles (admin/researcher/viewer, every row
scoped by `org_id`, cross-org returns 404); projects; transcripts (paste, `.txt`/`.docx`
upload, **audio/video upload → async transcription → diarized `TranscriptSegment`s with
timestamps**); 3-stage analysis pipeline; Celery+Redis; usage metering + plan gate; React
UI for login/projects/project-detail/analysis (analysis page highlights the transcript per
theme). **Build on these. If a file exists, extend it.**

## 3. Tech stack (locked)

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2, Pydantic v2, Celery + Redis.
- **DB:** PostgreSQL + **pgvector** (for RAG embeddings). Use **Alembic** migrations
  (replace the dev-only `create_all`).
- **LLM:** Anthropic SDK behind a **model router** abstraction (support multiple
  providers/models; default `claude-sonnet-4-6`). Add a `mock` LLM mode for offline tests.
- **ASR:** keep the pluggable `transcription.py` (mock/deepgram/assemblyai/whisper_local).
- **Vision** (concept/stimulus tagging): Claude/GPT-4o vision via the same router.
- **Storage:** S3/MinIO in prod, local FS in dev (keep `storage.py`).
- **PII masking:** Microsoft Presidio (or LLM-based fallback).
- **Frontend:** React 18 + Vite + react-router-dom, plain CSS design system (§6). No CSS
  framework. JWT in `localStorage`. Talk only to the API.
- **Infra:** `docker compose` services = postgres, redis, minio, backend, worker, frontend.

## 4. Architecture

```
                         React SPA  (Vite)
                              │  REST/JSON + JWT
                        FastAPI (+ OAuth / API keys)
        ┌──────────────┬──────┴───────────┬────────────────┐
        ▼              ▼                  ▼                 ▼
  Ingestion svc   Analysis Engine     Chat/RAG svc      Media svc
  upload→storage  (Celery workers)    retrieve(pgvector) clips/reels
  ASR+diarize     grids · open-ends   ground + cite      forced-align
  translate       concept · topline   project + KB scope by segment ts
        └──────────────┴────────┬─────────┴────────────────┘
                                ▼
        Postgres (+pgvector)            Object storage (S3/MinIO)
        relational + embeddings         audio / video / stimulus
                                ▼
        LLM/Vision router (multi-model)   ·   Trust layer (RBAC · PII · residency · audit)
```

## 5. Data model (SQLAlchemy; UUID-hex string PKs; `org_id` on every tenant row)

Existing: `Org(plan)`, `User(role)`, `Project(visibility)`, `MediaAsset`,
`Transcript(language, transcription_status, source_media_id)`, `TranscriptSegment(speaker,
start_sec, end_sec, text, idx)`, `Analysis`, `Theme`, `Verbatim`, `Implication`,
`UsageRecord`.

Add:

- **Participant** `(id, project_id, transcript_id, label, metadata JSON)` — one row per
  speaker; `metadata` holds segment/demographic attributes.
- **SegmentDef** `(id, project_id, key, values JSON)` — project segment schema (e.g.
  city=[Jakarta,Surabaya]).
- **Grid** `(id, project_id, kind[basic|comparative], name, status)`,
  **GridColumn** `(id, grid_id, label, kind[theme|question], idx)`,
  **GridCell** `(id, grid_id, participant_id, column_id, summary, evidence JSON[segment_ids])`.
- **OpenEndSet** `(id, project_id, question, status)`,
  **Code** `(id, set_id, label, definition)`,
  **OpenEndResponse** `(id, set_id, respondent_ref, text, code_ids JSON, sentiment)`.
- **Concept** `(id, project_id, name, stimulus_media_id)` — tagging output stored as themes/segments.
- **KBChunk** `(id, org_id, project_id, transcript_id, segment_id, text, embedding VECTOR)`.
- **ChatSession** `(id, org_id, project_id NULLABLE→KB scope, title)`,
  **ChatMessage** `(id, session_id, role, content, citations JSON[segment/chunk ids])`.
- **Clip** `(id, project_id, transcript_id, segment_id, start_sec, end_sec, label, storage_key)`,
  **Reel** `(id, project_id, name, clip_ids JSON, storage_key)`.
- **Skill** `(id, org_id, scope[personal|org], name, prompt_template, created_by)` — reusable prompts.
- **ProjectShare** `(id, project_id, user_id, role)`, **GuestInvite** `(id, project_id, email, role, token)`.
- **ApiKey** `(id, org_id, name, hashed_key, created_at)`.
- **AuditLog** `(id, org_id, user_id, action, target_type, target_id, ts)`.

Add (gap fixes):

- **RecordingSession** `(id, project_id, platform[zoom|meet|teams|webex], meeting_url, status, media_id, scheduled_at)` — CoLoop-style live recorder (§7 A, via Recall.ai).
- **Integration** `(id, org_id, kind, config JSON)` + **ImportJob** `(id, org_id, project_id, source, status, payload_ref, error)` — pluggable importers (§7 A).
- **Market** `(id, project_id, name, country, language)` — multimarket studies; participants/transcripts reference a `market_id`.
- **Project** (extend): `brief` (rich AI-context brief, beyond `description`), `study_mode[interview|online_qual|concept|multimarket]`, `market_context`.
- **Transcript / OpenEndResponse** (extend): `wave INT default 1` — longitudinal additional waves.
- **Org** (extend): `country`, `currency`, `data_region` (e.g. ap-southeast-1/-3), `auto_join_domain`.
- **CreditLedger** `(id, org_id, kind[topup|debit], dimension, amount, balance_after, ts)` — top-ups / overage (§12).
- **CommunityThread** `(id, project_id, source, topic, posts JSON[{author, ts, text}])` — MROC / online-qual data.

## 6. Frontend — complete UI

**Design system** (match existing `styles.css`): fonts IBM Plex Sans (UI), IBM Plex Mono
(labels/eyebrows), Newsreader serif (headings, quotes, transcript). Palette: paper
`#F4F3EE`/`#EDEBE4`, sheet `#FCFCFA`, ink `#17191C`, muted `#6B6F76`, hairline `#E2E0D9`,
accent **petrol `#0F4C45`**, amber `#C8881E`. Status dots: petrol=done, amber=pending/running,
red=error. Rounded cards (12px), thin borders, generous whitespace, restrained — editorial,
not flashy. Every async op shows loading/empty/error states + polling.

**Pages & flows:**

- **Auth** — login / register (register creates org + admin).
- **App shell** — topbar + left nav: Projects · Knowledge Base · Settings; org/user menu.
- **Projects** — list + create; per-card status; usage meter (plan, X/limit this month).
- **Project detail** — tabbed:
  - **Sources** — upload audio/video/docx/txt/xlsx; transcription status; list of media.
  - **Transcripts** — transcript viewer: speaker turns + timestamps; click a turn to play
    media (AudioPlayer/VideoPlayer) if available; edit/correct text; set language/translate.
  - **Participants & Segments** — manage participants + segment attributes (drives grids).
  - **Grids** — create Analysis Grid (themes × participants) and Comparative Grid (by
    segment); cells show per-participant summary + a count; click cell → **Evidence Panel**
    (exact quotes + segments + timestamps). Export to CSV.
  - **Chat** — ask questions over the project; **cited answers** with an Evidence Panel;
    toggle thematic / conceptual / quantitative ("how many mentioned X") modes.
  - **Open Ends** — upload xlsx (≤10k rows), generate codeframe, review/edit codes, apply +
    sentiment, view grid, export.
  - **Concept Testing** — upload stimulus deck, run colour/concept tagging, view results.
  - **Clips** — create clips from verbatims/segments; assemble into a Reel; export/share.
  - **Reports** — topline + content-analysis report (by discussion-guide question ×
    segment); export PPT / PDF / Markdown.
- **Knowledge Base** — cross-project search + chat over all org research; cited answers.
- **Settings** — org profile; members (invite, roles, seats); guest access; **data residency**;
  **API keys**; plan & usage; **Skills** (create/manage reusable prompt templates).

**Reusable components:** `Layout`, `StatusDot`, `Spinner`, `Uploader` (drag-drop, progress),
`Tag`, `EvidencePanel`, `SegmentList`, `MediaPlayer`, `GridTable`, `ChatThread`,
`CitationChip`, `EmptyState`, `Modal`, `Toast`.

## 7. Backend modules — functional spec

For every AI skill: send a strict-JSON-only prompt, **parse robustly** (strip fences, slice
braces), persist results, and **attach traceable evidence** (segment ids + timestamps), never
invent quotes. Long ops run as Celery tasks with a `status` the frontend polls.

- **A · Ingestion + Transcription** (partly built) — finish + add:
  - xlsx parsing for open-ends; transcript correction endpoint; per-transcript translate.
  - **Live Recorder (CoLoop-style)** — bot joins Zoom / Google Meet / Teams / Webex,
    records the session, returns media → MediaAsset → transcription. Use **Recall.ai**
    (pluggable, mock in dev). Endpoints to schedule/start a `RecordingSession` + poll status.
  - **Online Qualitative / Community (MROC) ingestion** — import diary, ethnography,
    bulletin-board / online-community data into `CommunityThread`s, then analyzable like
    transcripts (each post = a unit with author + timestamp).
  - **Integrations framework** — a pluggable `Importer` interface + an `ImportJob` runner.
    Ship a generic CoLoop-style **JSON/Excel import contract** plus connectors for: Dscout,
    Discuss IO, Field Notes, Recollective, incling, Listen Labs, Qualzy, Yazi, and
    OneDrive/SharePoint. Stub connectors that aren't keyed; document the import format.
  - **Project brief as AI context** — a `brief` field (optionally AI-generated from a short
    prompt) that is injected as context into **every** analysis/grid/chat prompt to raise
    quality. Add an endpoint to generate/refine the brief.
  - **Additional waves** — append new `wave`s of transcripts/responses to an existing
    project/open-end set (longitudinal) without creating a new project.
- **B · Analysis Engine**
  - _Analysis Grid_: for each participant × column(theme/question), extract a grounded
    summary + evidence segments. Comparative grid aggregates by `SegmentDef`. **Multimarket
    grid**: compare findings across `Market`s (country/language), side by side.
  - _Content Analysis Report_: breakdown by discussion-guide question × segment, with counts.
  - _Topline_ (built) — keep; add export.
  - _Open Ends_: induce a codeframe from a sample, apply to all responses, add sentiment;
    handle up to 10k rows in batches; dedupe codes.
  - _Concept testing_: vision-tag a stimulus deck; map mentions to concepts; summarize per concept.
- **C · Chat / RAG**: embed transcript segments → `KBChunk` (pgvector); retrieve top-k by
  cosine within scope (project or whole org = KB); answer with citations to chunks/segments;
  support quant counting questions. Store sessions + messages.
- **D · Evidence + Media**: Evidence Panel API returns the exact segments behind any
  theme/cell/answer. Clips: cut media by segment timestamps (ffmpeg) → store; Reels: stitch
  clips → store; export/share links.
- **E · Collaboration + Access**: project sharing + roles, guest invites, visibility;
  **org auto-join by email domain** (`Org.auto_join_domain`); reusable Skills (personal/org)
  usable in chat/grids.
- **F · Platform / Trust**: API keys + OAuth client-credentials; **PII masking** on ingest
  (Presidio); **data residency** flag per org (storage region); **audit log** for sensitive
  actions; **multi-model router**; **plans, usage limits & billing — see §12** (server-side
  enforcement + Stripe, with a stub mode for dev).

## 8. Build-vs-buy / libraries

| Concern            | Decision                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| ASR + diarization  | **Buy**: Deepgram / AssemblyAI (mock for dev) — keep `transcription.py`. For SEA langs see §13 |
| Live recording bot | **Buy**: Recall.ai (joins Zoom/Meet/Teams/Webex); mock in dev                                  |
| Vector store       | **pgvector** in Postgres                                                                       |
| Embeddings         | provider embeddings (e.g. `voyage`/OpenAI) behind the router; mock in dev                      |
| LLM / Vision       | **router** (LiteLLM-style) → Anthropic default, pluggable                                      |
| Object storage     | **S3 / MinIO** (local FS dev) — keep `storage.py`                                              |
| Media cut/stitch   | **ffmpeg** (ffmpeg-python)                                                                     |
| PII masking        | **Presidio** (LLM fallback)                                                                    |
| docx / xlsx parse  | python-docx / openpyxl                                                                         |
| Migrations         | **Alembic**                                                                                    |

## 9. Build order (execute sequentially; run + test + pause after each)

0. **Scaffold check** — ensure §3 stack, **Alembic** (convert from `create_all`), seed
   script (demo org + sample project + sample transcript + segments). Make `docker compose up` work.
   Apply the **SEA defaults from §13** (data region, languages, currency) here.
1. **Module A** — xlsx ingest, transcript correction, translate; **project brief as AI
   context**; **Live Recorder** (Recall.ai); **Online-Qual/Community ingestion**;
   **integrations framework** + generic import contract (+ ≥2 connectors, rest stubbed).
2. **Module B-1** — Analysis Grid (basic + comparative + **multimarket**) + Content Analysis
   Report + Evidence Panel.
3. **Module C** — Chat/RAG (pgvector) for project scope, then cross-project Knowledge Base.
4. **Module B-2** — Open Ends coder (+ **additional waves**) + Concept testing (vision).
5. **Module D** — Clips + Reels (ffmpeg), export.
6. **Module E** — sharing, guest access, **domain auto-join**, roles UI, Skills.
7. **Module F** — PII masking, residency, audit, API keys/OAuth, multi-model router,
   **plans + usage limits + billing + top-ups (§12)**.
8. **Frontend** — build each page with its module (don't leave UI to the end); add the
   **§13 SEA UI** (language picker, market selector, currency); final pass for
   empty/loading/error states + the design system polish.
9. **Hardening** — full pytest suite per module, multi-tenant isolation tests, migrations,
   seed, docker, updated README.

After each phase: print a short changelog and run the tests. Ask me before any destructive
schema migration.

## 10. Quality bar

- `docker compose up` boots postgres + redis + minio + backend + worker + frontend.
- `.env.example` complete; no secret hardcoded; Anthropic key server-side only.
- Mock ASR + mock LLM let the whole app run offline for dev/test.
- Multi-tenant isolation enforced everywhere and covered by tests (no cross-org leakage).
- OpenAPI at `/docs`; frontend never calls third-party APIs directly.
- Every AI output is JSON-validated and carries traceable evidence.

## 11. Optional differentiator (build last, keep modular) — Fieldwork QC

A **Silent-Audio Verifier / Fieldwork QC** module aimed at CAPI field data (SurveyToGo /
tSurvey): ingest interview silent-audio + the recorded structured answers, transcribe,
**cross-check answers vs audio**, and flag anomalies (curbstoning, speeders, straightlining,
GPS/duration). Output a prioritized QC review queue with reasons. This is the competitive
moat vs analysis-only tools — keep it as its own module/service so it can ship independently.

---

## 12. Pricing, plans & usage limits

Plans are defined in code (`app/plans.py`) and **enforced server-side** on every gated
action. A blocked action returns **HTTP 402** (limit) or **403** (feature not in plan) with
`{detail, dimension, used, limit, plan, upgrade_to}`. Surface all limits in the UI as usage
bars. Prices below are **placeholders — make them configurable**; the limit structure is the
important part.

### Plan matrix

|                                     | **Free / Trial** | **Starter**  | **Pro**               | **Enterprise**  |
| ----------------------------------- | ---------------- | ------------ | --------------------- | --------------- |
| Price (placeholder)                 | $0               | $49 / mo     | $199 / mo             | Custom          |
| **Active projects**                 | **1**            | **5**        | **25**                | **Unlimited**   |
| Seats (users)                       | 1                | 3            | 10                    | Unlimited       |
| Transcription                       | 60 min / mo      | 600 min / mo | 3,000 min / mo        | Custom          |
| AI analyses + grids                 | 20 / mo          | 200 / mo     | 2,000 / mo (fair use) | Unlimited       |
| Chat queries                        | 50 / mo          | 1,000 / mo   | 10,000 / mo           | Unlimited       |
| Media storage                       | 2 GB             | 25 GB        | 100 GB                | Custom          |
| Open-ends rows / set                | 1,000            | 10,000       | 10,000                | Custom          |
| Knowledge Base (cross-project)      | —                | —            | ✓                     | ✓               |
| Concept testing · Clips/Reels       | —                | ✓            | ✓                     | ✓               |
| API / OAuth access                  | —                | —            | ✓                     | ✓               |
| Data residency · SSO · audit export | —                | —            | —                     | ✓               |
| PII masking                         | basic            | ✓            | ✓                     | ✓ + DPA         |
| Support                             | community        | email        | priority              | dedicated + SLA |

Metered dimensions: **projects** (live count, not monthly), **seats** (count),
**transcription minutes**, **analyses**, **chat queries**, **storage GB** (last three reset
monthly). Feature flags: `knowledge_base`, `concept_testing`, `clips`, `api`, `residency`,
`sso`.

### Enforcement points (return 402/403 before doing work)

- `POST /projects` → block if `active_projects ≥ plan.projects`.
- invite member → block if `seats ≥ plan.seats`.
- `POST /projects/{id}/media` → block if `transcription_minutes_this_month + file_minutes > plan`.
- `POST /transcripts/{id}/analyses` and grid build → block if `analyses_this_month ≥ plan`.
- chat send → block if `chat_this_month ≥ plan`.
- any upload → block if `storage_bytes + file_size > plan`.
- KB / concept / clips / API / residency / SSO endpoints → `403` if feature not in plan.

### Data / model

- `app/plans.py`: `PLANS = {"free": {...}, "starter": {...}, "pro": {...}, "enterprise": {...}}`
  with the numeric limits above and a `features` set per plan.
- `Org` (extend): `plan` (exists), `plan_renews_at`, `stripe_customer_id`, `stripe_subscription_id`.
- `usage.py` (extend): `active_projects(org)`, `transcription_minutes_this_month(org)`
  (sum `MediaAsset.duration_sec`/60), `analyses_this_month(org)`, `chat_this_month(org)`,
  `storage_bytes(org)`. Add `check_limit(org, dimension, incoming=0)` and
  `require_feature(org, feature)` helpers used by the routers.
- `UsageRecord.kind` values: `analysis`, `transcription_min`, `chat`, `storage`.

### Billing (Stripe, with stub mode)

- `BILLING_MODE=stub|stripe` (stub flips `Org.plan` directly so dev works without keys).
- `GET /plans` → the matrix above (for the pricing UI), priced in the org's **currency** (§13).
- `POST /billing/checkout {plan}` → Stripe Checkout Session URL (stub: set plan, return ok).
- `POST /billing/webhook` → handle `checkout.session.completed`,
  `customer.subscription.updated|deleted` → update `Org.plan` + `plan_renews_at`.
- `POST /billing/portal` → Stripe Billing Portal URL (manage/cancel).
- **Top-ups / overage** — `POST /billing/topup {dimension, amount}` buys one-time extra
  capacity (e.g. +600 transcription minutes) → recorded in `CreditLedger`; `check_limit`
  counts plan allowance **plus** available top-up credits before blocking. Show remaining
  credits in the UI.

### Frontend

- **Pricing page** (public + in-app): tier cards from `GET /plans`, current plan highlighted,
  upgrade CTA → checkout (or stub).
- **Settings → Billing & Usage**: current plan + renewal date; **usage bars** per metered
  dimension (e.g. "Projects 4 / 5", "Transcription 420 / 600 min", "Storage 12 / 25 GB");
  manage subscription (portal); upgrade / downgrade.
- **Inline limit UX**: on 402/403, show a modal stating which limit was hit + an upgrade
  button; disable actions at the cap with a tooltip (e.g. "Create project" greyed at limit).

> Add plan enforcement + `/plans` + Billing UI in **Phase 7** (Module F). Wire the usage
> bars into Settings during the Phase 8 frontend pass.

---

## 13. Southeast Asia focus & localization (first-class)

This product wins by being **built for SEA**, where international/English-first tools are
weakest. Implement these as real behavior, not labels.

### Languages — code-mixing is the killer feature

SEA qual data is rarely clean single-language. Handle:

- **National languages:** Bahasa Indonesia, Bahasa Melayu, Thai, Vietnamese, Filipino/Tagalog,
  - English; later Khmer, Burmese, Lao.
- **Code-mixing / colloquial:** Indonesian + English ("bahasa gaul"), **Taglish**, **Singlish**,
  Manglish — within a single utterance. Transcription **and** analysis prompts must preserve
  and correctly interpret mixed-language speech (don't force-translate away the nuance).
- **Regional languages:** Javanese, Sundanese, etc. — at least detect + flag.
- ASR provider selection per language: route to whichever provider transcribes that SEA
  language/accent best (config map `lang -> provider`); allow `whisper_local` (large model)
  fallback for under-served languages. Make the router pluggable so providers can be swapped
  as SEA support improves.
- AI prompts: instruct the model to analyze in the **source language**, then also provide an
  English gloss for reporting — keep verbatims in original language.

### Hosting & compliance (in-region = trust moat)

- Default **data region = ap-southeast** (Singapore `ap-southeast-1` / Jakarta `ap-southeast-3`).
  `Org.data_region` selectable; media + DB stay in-region.
- Compliance posture for: **Indonesia UU PDP**, **Singapore PDPA**, **Thailand PDPA**,
  **Vietnam** data-localization, **Philippines DPA**. Surface a per-org region + a DPA/PII
  stance in Settings. PII masking on by default (§7 F).

### Local integrations (in addition to §7 A connectors)

- **WhatsApp** ingestion — huge in SEA for diary studies / mobile communities: import a
  WhatsApp chat export (or via a provider) into `CommunityThread`s for analysis.
- **Fieldwork stacks** — import from **SurveyToGo (Dooblo)** and **tSurvey** (CAPI/online
  panel common in the region). This also sets up the §11 Fieldwork-QC differentiator.

### Currency & pricing (SEA-appropriate)

- `Org.currency` (IDR, SGD, MYR, THB, VND, PHP, USD). `GET /plans` returns prices in the
  org's currency. Set **SEA-appropriate price points** (lower than Western enterprise SaaS;
  amounts configurable per currency) and support local payment methods via Stripe where
  available. Keep the §12 limit structure; localize the numbers/prices.

### UI localization

- App UI available in **English + Bahasa Indonesia** at launch (i18n-ready for Thai/Vietnamese
  later). Language picker in the top bar; default from `Org.country`.

### Multimarket within SEA

- A study often spans several SEA countries. Use `Market` (§5) to group transcripts by
  country/language, transcribe/translate per market, and compare via the **multimarket grid**
  (§7 B). Reporting shows per-market + cross-market views.

> Apply SEA defaults in **Phase 0** (region, currency, language list) and build the SEA UI
> bits (language picker, market selector, currency) in the **Phase 8** frontend pass.
> Positioning: not "an international clone" but **the qual platform built for Southeast Asia**.
