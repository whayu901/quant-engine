from datetime import datetime
from .celery_app import celery_app
from .database import SessionLocal
from . import models, llm, usage as usage_mod
from . import transcription
from .storage import storage


@celery_app.task(name="run_fieldwork_qc")
def run_fieldwork_qc(batch_id: str):
    """Phase 3: run heuristic detectors over a batch's interviews.

    Idempotent — clears prior QCFlags and resets qc_status before recomputing,
    so a re-run never double-counts. Writes QCFlags, sets qc_status/qc_score per
    interview, and rolls up batch.result_summary (counts per check + per status).
    """
    from .models_fieldwork import FieldworkBatch, Interview, QCFlag
    from . import fieldwork_qc

    db = SessionLocal()
    try:
        batch = db.get(FieldworkBatch, batch_id)
        if not batch:
            return
        batch.status = "running"
        db.commit()

        interviews = db.query(Interview).filter(Interview.batch_id == batch_id).all()

        # Idempotent reset: drop prior flags + reset statuses for a clean recompute.
        db.query(QCFlag).filter(QCFlag.batch_id == batch_id).delete(synchronize_session=False)
        for iv in interviews:
            iv.qc_status = "pending"
            iv.qc_score = None
        db.flush()

        rules = fieldwork_qc.resolve_rules(batch.rules)
        flags_by_iv = {}
        by_check = {}
        for iv, flag in fieldwork_qc.run_all_detectors(interviews, rules):
            flags_by_iv.setdefault(id(iv), []).append(flag)
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
    """Phase 2: parse an uploaded CSV/XLSX into Interview rows for a batch.

    The ImportJob carries the storage key in `payload_ref` and the target batch
    in its `batch_id` column. `result_summary` is output-only import stats.
    """
    from .models_phase1 import ImportJob
    from .models_fieldwork import FieldworkBatch
    from . import fieldwork_import

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
