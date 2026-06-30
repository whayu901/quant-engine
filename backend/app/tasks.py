from datetime import datetime
from .celery_app import celery_app
from .database import SessionLocal
from . import models, llm, usage as usage_mod
from . import transcription
from .storage import storage


@celery_app.task(name="run_fieldwork_qc")
def run_fieldwork_qc(batch_id: str):
    """Phase 3-4: run heuristic detectors over a batch's interviews.

    Idempotent — clears prior QCFlags + InterviewerScores and resets qc_status
    before recomputing, so a re-run never double-counts. Writes QCFlags, sets
    qc_status/qc_score per interview, recomputes per-interviewer anomaly scores,
    and rolls up batch.result_summary (counts per check + per status).
    """
    from .models_fieldwork import FieldworkBatch, Interview, QCFlag, InterviewerScore
    from . import fieldwork_qc

    db = SessionLocal()
    try:
        batch = db.get(FieldworkBatch, batch_id)
        if not batch:
            return
        batch.status = "running"
        db.commit()

        interviews = db.query(Interview).filter(Interview.batch_id == batch_id).all()

        # Idempotent reset: drop prior flags + scores + reset statuses.
        db.query(QCFlag).filter(QCFlag.batch_id == batch_id).delete(synchronize_session=False)
        db.query(InterviewerScore).filter(
            InterviewerScore.batch_id == batch_id).delete(synchronize_session=False)
        for iv in interviews:
            iv.qc_status = "pending"
            iv.qc_score = None
        db.flush()

        rules = fieldwork_qc.resolve_rules(batch.rules)
        flags_by_iv = {}
        checks_by_iv = {iv.id: set() for iv in interviews}
        by_check = {}
        for iv, flag in fieldwork_qc.run_all_detectors(interviews, rules):
            flags_by_iv.setdefault(id(iv), []).append(flag)
            checks_by_iv[iv.id].add(flag["check"])
            by_check[flag["check"]] = by_check.get(flag["check"], 0) + 1
            db.add(QCFlag(
                org_id=iv.org_id, interview_id=iv.id, batch_id=batch_id,
                check=flag["check"], severity=flag["severity"],
                detail=flag["detail"], status="open",
            ))

        by_status = {"pass": 0, "flag": 0, "review": 0, "reject": 0}
        for iv in interviews:
            status, qc_score = fieldwork_qc.score(flags_by_iv.get(id(iv), []))
            iv.qc_status = status
            iv.qc_score = qc_score
            by_status[status] = by_status.get(status, 0) + 1

        # Per-interviewer anomaly scores.
        for s in fieldwork_qc.compute_interviewer_scores(interviews, checks_by_iv):
            db.add(InterviewerScore(
                org_id=batch.org_id, batch_id=batch_id,
                interviewer_id=s["interviewer_id"], n_interviews=s["n_interviews"],
                avg_duration_sec=s["avg_duration_sec"], flag_rate=s["flag_rate"],
                anomaly_score=s["anomaly_score"],
            ))

        batch.result_summary = {
            "interviews": len(interviews),
            "by_check": by_check,
            "by_status": by_status,
            "flags_total": sum(by_check.values()),
        }
        batch.status = "completed"
        db.commit()
    except Exception as e:  # noqa
        db.rollback()
        b = db.get(FieldworkBatch, batch_id)
        if b:
            b.status = "failed"
            b.result_summary = {**(b.result_summary or {}), "error": str(e)[:1000]}
            db.commit()
    finally:
        db.close()


@celery_app.task(name="import_fieldwork_batch")
def import_fieldwork_batch(import_job_id: str):
    """Phase 2: parse an uploaded CSV/XLSX (or integration fetch) into Interview rows.

    The ImportJob carries either:
    - ``payload_ref`` (file-upload path): storage key read via ``storage.open``.
    - ``integration_id`` (integration path): credentials looked up from the
      Integration row; rows fetched via ``fieldwork_sources.fetch_interviews``.

    ``result_summary`` is output-only import stats. Any provider ValueError or
    NotImplementedError is caught by the outer except and recorded as
    job.status="failed" with job.error set to the exception message.
    """
    from .models_phase1 import ImportJob, Integration
    from .models_fieldwork import FieldworkBatch
    from . import fieldwork_import, fieldwork_sources

    db = SessionLocal()
    try:
        job = db.get(ImportJob, import_job_id)
        if not job:
            return
        batch = db.get(FieldworkBatch, job.batch_id) if job.batch_id else None
        if not batch:
            job.status = "failed"
            job.error = "Batch not found for import job"
            job.completed_at = datetime.utcnow()
            db.commit()
            return

        job.status = "running"
        job.started_at = job.started_at or datetime.utcnow()
        db.commit()

        if job.integration_id:
            # Integration path: fetch rows from the registered source provider.
            integration = db.get(Integration, job.integration_id)
            if not integration:
                raise ValueError("Integration not found")
            rows = fieldwork_sources.fetch_interviews(integration, batch)
            summary = fieldwork_import.import_rows_into_batch(db, batch, rows)
        else:
            # File-upload path (unchanged): read bytes from storage, parse.
            content = storage.open(job.payload_ref).read()
            # payload_ref ends with the original filename, so it carries the extension.
            summary = fieldwork_import.import_into_batch(db, batch, content, job.payload_ref)

        job.result_summary = summary
        job.status = "completed"
        job.completed_at = datetime.utcnow()
        batch.status = "pending"  # imported; awaiting QC run
        db.commit()
    except Exception as e:  # noqa
        db.rollback()
        job = db.get(ImportJob, import_job_id)
        if job:
            job.status = "failed"
            job.error = str(e)[:1000]
            job.completed_at = datetime.utcnow()
            if job.batch_id:
                b = db.get(FieldworkBatch, job.batch_id)
                if b:
                    b.status = "failed"
            db.commit()
    finally:
        db.close()


@celery_app.task(name="verify_interview_audio")
def verify_interview_audio(interview_id: str):
    """Phase 5: audio-vs-answers fabrication detector for a single interview.

    Reuses an existing Transcript (with segments) for the linked MediaAsset when
    one is already present; otherwise creates a Transcript and populates it via
    the configured ASR provider (default: mock, runs fully offline).

    Idempotent: any prior `audio_mismatch` QCFlag for the interview is deleted
    before new flags are written, so repeated calls converge to the same result.
    The interview's qc_status/qc_score is recomputed from ALL non-dismissed
    flags after the audio check so an audio finding flips the status to "reject"
    immediately.

    Degrades gracefully:
    - interview absent: return silently.
    - interview.media_id is None: return silently (no flag, no error; the
      interviewer may not have linked audio yet — Phase 3's audio_presence
      handles the "audio expected but missing" case).
    - MediaAsset absent: return silently.
    - Any unexpected error: rollback and swallow (no crash).
    """
    from .models_fieldwork import FieldworkBatch, Interview, QCFlag
    from . import fieldwork_qc

    db = SessionLocal()
    try:
        interview = db.get(Interview, interview_id)
        if not interview:
            return
        if interview.media_id is None:
            return  # no audio linked — not an error

        media = db.get(models.MediaAsset, interview.media_id)
        if not media:
            return  # media row missing — degrade silently

        # Transcript reuse: prefer an existing Transcript that already has
        # segments so we never re-transcribe unnecessarily.
        existing = (
            db.query(models.Transcript)
            .filter(models.Transcript.source_media_id == media.id)
            .first()
        )

        if existing and existing.segments:
            segments = list(existing.segments)
        else:
            # No usable transcript — call ASR (mock provider in dev/test).
            t = models.Transcript(
                org_id=interview.org_id,
                project_id=interview.project_id,
                title=f"Audio QC: {media.filename or media.id}",
                source_media_id=media.id,
                transcription_status="running",
                content="",
            )
            db.add(t)
            db.flush()

            result = transcription.transcribe(storage.local_path(media.storage_key))
            t.content = result.get("text", "")
            t.language = result.get("language", "") or ""
            t.transcription_status = "done"

            for i, seg in enumerate(result.get("segments", [])):
                db.add(models.TranscriptSegment(
                    transcript_id=t.id,
                    idx=i,
                    speaker=seg.get("speaker"),
                    start_sec=seg.get("start"),
                    end_sec=seg.get("end"),
                    text=seg.get("text"),
                ))
            db.flush()
            db.refresh(t)
            segments = list(t.segments)

        batch = db.get(FieldworkBatch, interview.batch_id)
        rules = fieldwork_qc.resolve_rules(batch.rules if batch else None)
        flags = fieldwork_qc.audio_match_check(interview, segments, rules)

        # Idempotent: drop any prior audio_mismatch flags for this interview.
        (db.query(QCFlag)
         .filter(
             QCFlag.interview_id == interview_id,
             QCFlag.check == fieldwork_qc.AUDIO_MISMATCH,
         )
         .delete(synchronize_session=False))

        for flag in flags:
            db.add(QCFlag(
                org_id=interview.org_id,
                interview_id=interview_id,
                batch_id=interview.batch_id,
                check=flag["check"],
                severity=flag["severity"],
                detail=flag["detail"],
                status="open",
            ))

        # Flush so the newly-written (or deleted) flags are visible to the
        # recompute query below, even when the session has autoflush=False.
        db.flush()

        # Recompute qc_status/qc_score from ALL non-dismissed flags so that an
        # audio finding immediately flips the interview to "reject".
        all_flags = (
            db.query(QCFlag)
            .filter(QCFlag.interview_id == interview_id, QCFlag.status != "dismissed")
            .all()
        )
        qc_status, qc_score = fieldwork_qc.score(
            [{"check": f.check, "severity": f.severity} for f in all_flags]
        )
        interview.qc_status = qc_status
        interview.qc_score = qc_score

        db.commit()
    except Exception:  # noqa
        db.rollback()
    finally:
        db.close()


@celery_app.task(name="transcribe_media")
def transcribe_media(transcript_id: str):
    """Phase 1: media -> transcript. Runs ASR + diarization, stores segments."""
    db = SessionLocal()
    try:
        t = db.get(models.Transcript, transcript_id)
        if not t or not t.source_media_id:
            return
        t.transcription_status = "running"
        db.commit()
        media = db.get(models.MediaAsset, t.source_media_id)
        path = storage.local_path(media.storage_key)
        result = transcription.transcribe(path, language=t.language or None)

        t.content = result.get("text", "")
        t.language = result.get("language") or t.language
        for i, seg in enumerate(result.get("segments", [])):
            db.add(models.TranscriptSegment(
                transcript_id=t.id, idx=i, speaker=seg.get("speaker"),
                start_sec=seg.get("start"), end_sec=seg.get("end"), text=seg.get("text"),
            ))
        if media and result.get("duration"):
            media.duration_sec = result["duration"]
        t.transcription_status = "done"
        db.commit()
    except Exception as e:  # noqa
        db.rollback()
        t = db.get(models.Transcript, transcript_id)
        if t:
            t.transcription_status = "error"
            t.transcription_error = str(e)[:1000]
            db.commit()
    finally:
        db.close()


@celery_app.task(name="run_analysis")
def run_analysis(analysis_id: str):
    db = SessionLocal()
    try:
        a = db.get(models.Analysis, analysis_id)
        if not a:
            return
        a.status = "running"
        db.commit()
        transcript = db.get(models.Transcript, a.transcript_id)
        in_tok = out_tok = 0

        # Stage 1 — themes
        d1, u1 = llm.code_themes(transcript.content)
        in_tok += u1[0]; out_tok += u1[1]
        a.respondent_count = d1.get("respondentCount")
        themes = []
        for i, th in enumerate(d1.get("themes", [])):
            tm = models.Theme(
                analysis_id=a.id, name=th.get("name"), description=th.get("description"),
                prevalence=th.get("prevalence"), sentiment=th.get("sentiment"), order_idx=i,
            )
            db.add(tm); db.flush()
            themes.append((th.get("id", i + 1), tm))
        db.commit()

        # Stage 2 — verbatims
        theme_list = [{"id": k, "name": tm.name} for k, tm in themes]
        idmap = {k: tm for k, tm in themes}
        d2, u2 = llm.extract_verbatims(transcript.content, theme_list)
        in_tok += u2[0]; out_tok += u2[1]
        for v in d2.get("verbatims", []):
            tm = idmap.get(v.get("themeId"))
            if tm:
                db.add(models.Verbatim(theme_id=tm.id, quote=v.get("quote"), speaker=v.get("speaker")))
        db.commit()

        # Stage 3 — topline + implications
        d3, u3 = llm.write_topline(transcript.content, theme_list)
        in_tok += u3[0]; out_tok += u3[1]
        a.topline = d3.get("topline", "")
        for i, imp in enumerate(d3.get("implications", [])):
            db.add(models.Implication(analysis_id=a.id, text=imp, order_idx=i))

        a.input_tokens = in_tok
        a.output_tokens = out_tok
        a.status = "done"
        a.completed_at = datetime.utcnow()
        db.commit()
        usage_mod.record_usage(db, a.org_id, a.id, in_tok, out_tok)
        db.commit()
    except Exception as e:  # noqa
        db.rollback()
        a = db.get(models.Analysis, analysis_id)
        if a:
            a.status = "error"
            a.error = str(e)[:1000]
            db.commit()
    finally:
        db.close()
