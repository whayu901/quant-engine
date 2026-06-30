# FIELDWORK QC / VERIFIER — Build Spec (the wedge)

> Feed this to Claude Code. Build it **on top of** the existing backend — reuse the models and
> patterns named below, do not duplicate them. Read `context/strategy-vs-coloop.md` first: this
> module is the moat (the layer CoLoop structurally can't reach). Everything else is table-stakes.

## 0. Goal
Verify that fieldwork data is **real and clean** at scale, the way Kadence already does manually
(e.g. MyPertamina: 600+ files/day verified, 1,000+ registrants validated). CoLoop starts at the
transcript and never touches *how data was collected* — this module owns exactly that gap:
interview-happened verification, anti-curbstoning / fabrication detection, audio-vs-answers
cross-check, and registrant/file validation. Output: per-interview QC status + evidence + a
reviewable QC report.

## 1. Reuse what already exists (do NOT rebuild)
- `MediaAsset` — silent-audio / recordings.
- `Transcript` + `TranscriptSegment` (`segment_index`-ordered, `text` + `metadata` JSON) — for the
  audio-vs-answers check (transcribe the silent audio, compare to recorded answers).
- `Integration` (`kind`, `config` JSON, `is_active`) — add `kind="surveytogo"` / `"dooblo"`.
- `ImportJob` (`source`, `status`, `payload_ref`, `result_summary`) — for batch import.
- `Market` (`country`, `language`) — tie a QC batch to an SEA market.
- Deps: `get_current_user`, `require_role(*roles)`, `owned_or_404(db, model, id, org_id)`.
- Async: `@celery_app.task(name=...)` in `app/tasks.py`, dispatched with `.delay(id)` (eager in dev).
- Router registration: append the new module to the `routers = [...]` list in `app/main.py`.
- Model conventions: `id = Column(String(32), primary_key=True, default=_uid)`, `org_id` FK to
  `orgs.id` (index=True) on every tenant-owned table, `created_at = Column(DateTime, default=datetime.utcnow)`.

## 2. New data model — `app/models_fieldwork.py`
Follow the existing conventions exactly (String(32) ids, org_id tenancy, JSON config, status strings).

- **FieldworkBatch** — a fielding dataset to verify.
  `id, org_id, project_id, market_id(nullable), integration_id(nullable), name,
   source` (`surveytogo|dooblo|excel|api`), `status` (`pending|importing|running|completed|failed`),
  `rules` JSON (thresholds + eligibility rules), `result_summary` JSON (counts: pass/flag/reject,
  approved/rejected trend), `created_at, completed_at`.
- **Interview** — one respondent record to verify.
  `id, org_id, project_id, batch_id(FK), external_id` (SurveyToGo respondent id), `interviewer_id`
  (the field interviewer), `respondent_ref, started_at, ended_at, duration_sec,
   gps_lat, gps_lng, media_id(FK→media_assets, nullable), answers` JSON (the survey responses),
  `qc_status` (`pending|pass|flag|reject|review`), `qc_score` (float 0–1), `created_at`.
- **QCFlag** — one issue found on an interview.
  `id, org_id, interview_id(FK), batch_id(FK), check` (detector name), `severity`
  (`info|warn|critical`), `detail` JSON (the evidence), `status` (`open|confirmed|dismissed`),
  `reviewer_id(nullable), created_at`.
- **InterviewerScore** — per-interviewer aggregate for anomaly detection (can be recomputed).
  `id, org_id, batch_id(FK), interviewer_id, n_interviews, avg_duration_sec, flag_rate,
   anomaly_score` (float), `computed_at`.

Wire models into the metadata/`Base` the same way the other `models_*` files are, and add an
**Alembic migration** (the repo already uses Alembic — do not rely on create_all).

## 3. The detectors — `app/fieldwork_qc.py`
Pure, deterministic, **explainable** functions (no LLM needed for most — a QC/audit tool must be
auditable). Each takes interview(s) + the batch `rules` and returns a list of `QCFlag` dicts with
`detail` evidence. Thresholds come from `batch.rules` (per-study configurable).

**A. Interview-happened**
- `duration_check` — `duration_sec` vs expected min/max → too short / implausibly long.
- `gps_check` — point inside the market's sampling area; not all-identical coords; not the
  interviewer's repeated home point.
- `cadence_check` — gaps between consecutive interviews by the same `interviewer_id`
  (impossible back-to-back / impossible travel time).
- `audio_presence_check` — `media_id` exists and audio length is plausible vs `duration_sec`.

**B. Fabrication / curbstoning**
- `speeder_check` — completion time below threshold.
- `straightlining_check` — identical answer across a matrix/grid block.
- `duplicate_check` — near-duplicate `answers` patterns (esp. same interviewer).
- `interviewer_anomaly` — per-interviewer flag-rate / duration-distribution outliers vs peers
  (feeds `InterviewerScore.anomaly_score`).

**C. Audio-vs-answers cross-check** (the distinctive one)
- `audio_match_check` — transcribe the silent audio (reuse the existing transcription task →
  `Transcript`/`TranscriptSegment`), then check the recorded `answers` are actually supported by the
  audio (keyword / semantic overlap between segments and answers). Flag "answer recorded but not
  heard." Degrade gracefully when no audio.

**D. Registrant / file validation at scale** (MyPertamina-style)
- `eligibility_check` — validate each record against `batch.rules.eligibility` (declarative
  criteria) → approved / rejected, with the failing criterion in `detail`.

**Scoring:** combine flags by severity weights → `qc_score`; map to `qc_status`
(`pass | flag | review | reject`). Never auto-reject without a confirmable flag + audit trail.

## 4. Async tasks — add to `app/tasks.py`
- `@celery_app.task(name="import_fieldwork_batch")` `import_fieldwork_batch(import_job_id)` —
  pull from SurveyToGo/Dooblo via `Integration` (or parse an uploaded Excel/CSV) → create
  `Interview` rows; update `ImportJob.result_summary`.
- `@celery_app.task(name="run_fieldwork_qc")` `run_fieldwork_qc(batch_id)` — run all detectors over
  the batch's interviews, write `QCFlag`s, compute `qc_score`/`qc_status` + `InterviewerScore`,
  roll up `FieldworkBatch.result_summary`.
- `@celery_app.task(name="verify_interview_audio")` `verify_interview_audio(interview_id)` —
  transcribe silent audio + run `audio_match_check`.

## 5. API — `app/routers/fieldwork_qc.py`
`router = APIRouter(prefix="/api/v1/fieldwork-qc", tags=["fieldwork-qc"])`. Every endpoint:
`current_user = Depends(get_current_user)`, `db = Depends(get_db)`, tenant-scoped via
`owned_or_404` / `org_id` filter. Mutations gated with `require_role("admin","researcher")`.

- `POST /batches` — create a batch (optional `integration_id`, `market_id`, `rules`).
- `POST /batches/{id}/import` — upload Excel/CSV **or** trigger `Integration` pull → `import_fieldwork_batch.delay(...)`.
- `POST /batches/{id}/run` — `run_fieldwork_qc.delay(id)`.
- `GET  /batches/{id}` — batch + `result_summary` (pass/flag/reject counts, approved/rejected trend).
- `GET  /batches/{id}/interviews?status=flag` — interviews + their flags (paginated).
- `GET  /interviews/{id}` — detail: answers, gps, audio/transcript link, flags.
- `POST /flags/{id}/resolve` — `{status: confirmed|dismissed}` (reviewer; writes `reviewer_id`).
- `GET  /batches/{id}/interviewers` — `InterviewerScore` list (anomaly ranking).
- `GET  /batches/{id}/report` — exportable QC report (approved/rejected, per-interviewer, trend).

## 6. Frontend (after the API works)
A **Fieldwork QC** section reusing the existing brand tokens (IBM Plex + Newsreader, petrol/amber):
- Batch dashboard: pass/flag/reject donut + approved/rejected trend; status dots petrol/amber.
- Interview table filtered by status; row → detail drawer (answers, map pin, audio player,
  transcript, flags with evidence) + confirm/dismiss buttons.
- Interviewer anomaly leaderboard.

## 7. Build order — run + test + PAUSE after each phase
1. **Models + migration + router wired + `POST/GET /batches`.** Test: create + list a batch.
2. **Import (Excel/CSV → Interviews) + `ImportJob`.** Test with a sample file of fake field data.
3. **Heuristic detectors** (duration, gps, speeder, straightlining, duplicate, cadence) + `run` task
   + flags + batch stats. Test with **synthetic clean + fabricated** rows → assert the right flags fire.
4. **Interviewer anomaly scoring + `/report`.** Test the rollup.
5. **Audio-vs-answers** (`verify_interview_audio`, reuse transcription) — last; mock the transcript
   in tests so it runs offline.
6. **SurveyToGo/Dooblo `Integration` import** path (stub creds first; real later).

## 8. Quality bar
- Deterministic + **explainable**: every flag carries `detail` evidence. No black-box rejection.
- **Human-in-the-loop**: reviewer confirms/dismisses; full audit trail (`reviewer_id`, status).
- **Config-driven**: thresholds + eligibility rules live in `batch.rules` (per study/market).
- **Mock-first / offline**: detectors are heuristic and run without external services; audio check
  degrades gracefully when there's no audio and uses a mocked transcript in tests.
- **Tenant-safe**: every query scoped by `org_id` (use `owned_or_404`), like the rest of the app.

## 9. Out of scope (do not drift)
No new qual-analysis / CoLoop-parity features here. No quant tabulation. This module is *only* the
fieldwork-integrity wedge. When this works end-to-end, update `context/build-status.md`.
