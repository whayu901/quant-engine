# Fieldwork QC — Synthetic Test Dataset

A seeded, synthetic fielding dataset for building & testing the **Fieldwork QC / Verifier** module
(see `FIELDWORK_QC_SPEC.md`). 52 interviews across 7 interviewers: 24 clean, 28 with planted issues.
Every detector has something to catch, and `fieldwork_qc_expected.csv` is the answer key.

## Files
- **`fieldwork_qc_sample.csv`** — the interviews to verify. Import this in Phase 2 (Excel/CSV path).
- **`fieldwork_qc_expected.csv`** — `external_id -> expected_checks` (the flags that *should* fire).
- **`gen_fieldwork_data.py`** — the generator (seeded, deterministic). Re-run to regenerate or scale.

## Questionnaire (the columns)
- `q1_age` (band), `q2_gender`, `q3..q8` = 6-item Likert 1–5 matrix (this block drives straightlining),
  `q9_brand_word` (open-end → drives duplicate detection), `q10_nps` (0–10).
- Metadata: `external_id, interviewer_id, respondent_ref, started_at, ended_at, duration_sec,
  gps_lat, gps_lng, audio_ref` (empty = no audio captured).

## Rules used (mirror these into `FieldworkBatch.rules`)
```json
{
  "duration_sec": { "speeder_below": 240, "too_long_above": 2400, "legit": [300,1200] },
  "gps_sampling_bbox": { "lat": [-6.40,-6.05], "lng": [106.65,106.95] },
  "straightlining_block": ["q3_brand_quality","q4_value","q5_trust","q6_innovation","q7_service","q8_recommend"],
  "eligibility": { "q1_age_in": ["18-24","25-34","35-44"] },
  "cadence_min_gap_sec": 60
}
```

## Interviewer roster (what each one tests)
- **INT-001, 002, 003** — legit fieldworkers (clean). Good durations, Jakarta GPS spread, varied
  answers, audio present. *Plus* a couple of planted singletons: one missing-audio row and two
  eligibility failures (age `55+` / `<18`) to test those checks in isolation.
- **INT-004** — speeders (durations < 240s). One also fails eligibility.
- **INT-005** — straightliners (q3–q8 identical); one implausibly long interview (`too_long`).
- **INT-006** — GPS problems: out-of-area (Surabaya coords) + identical repeated coordinates.
- **INT-007** — **full curbstoner**: every interview is speeder + straightlined + identical GPS +
  duplicate open-end ("bagus") + no audio + impossible back-to-back cadence (~30s apart). Should
  top the **interviewer anomaly** ranking.

## How to use as a test
1. **Phase 2 (import):** load `fieldwork_qc_sample.csv` → creates `Interview` rows.
2. **Phase 3 (detectors):** run `run_fieldwork_qc` over the batch.
3. **Assert:** for each `external_id`, the `QCFlag`s produced match `expected_checks` in the answer
   key. `(clean)` rows must produce **no** flags (watch false positives).
4. **Interviewer anomaly:** `InterviewerScore` should rank **INT-007** highest, INT-004/005/006
   elevated, INT-001/002/003 low.
5. **Audio-vs-answers (Phase 5):** rows with empty `audio_ref` exercise `audio_presence`; for
   `audio_match_check`, mock a transcript in the test (no real ASR needed offline).

## Notes
- Deterministic: `random.seed(42)`. Change N per interviewer or the seed in the script to scale.
- Counts in this build: speeder×14, straightlining×13, gps_identical×12, audio_presence×9,
  duplicate_openend×8, cadence_impossible×8, eligibility×3, gps_out_of_area×2, too_long×1.
- This is **synthetic** — safe to commit as a test fixture (no real respondent data).
