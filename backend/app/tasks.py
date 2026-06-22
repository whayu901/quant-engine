from datetime import datetime
from .celery_app import celery_app
from .database import SessionLocal
from . import models, llm, usage as usage_mod
from . import transcription
from .storage import storage


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
