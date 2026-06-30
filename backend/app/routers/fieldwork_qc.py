"""
Fieldwork QC / Verifier API — the wedge (Direction A).

Verifies fieldwork data integrity at scale. Every endpoint is tenant-scoped via
owned_or_404 / org_id filter; mutations require admin or researcher role.

Phase 1: batch CRUD (create / list / get). Import, detectors, scoring, report
and audio-vs-answers land in later phases.
"""

from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..models import _uid
from ..models_fieldwork import FieldworkBatch, Interview, QCFlag, InterviewerScore
from ..models_phase1 import ImportJob, Integration
from ..schemas_fieldwork import (
    FieldworkBatchIn, FieldworkBatchOut, InterviewOut, FieldworkImportOut,
    InterviewDetailOut, QCFlagOut, InterviewerScoreOut, FlagResolveIn,
    FieldworkReportOut, ImportFromIntegrationIn,
)
from ..database import get_db
from ..deps import get_current_user, require_role, owned_or_404
from ..storage import storage
from ..tasks import import_fieldwork_batch, run_fieldwork_qc, verify_interview_audio
from .. import fieldwork_qc

router = APIRouter(prefix="/api/v1/fieldwork-qc", tags=["fieldwork-qc"])

ALLOWED_IMPORT_EXT = (".csv", ".xlsx", ".xlsm", ".xls")


@router.post("/batches", response_model=FieldworkBatchOut)
def create_batch(body: FieldworkBatchIn,
                 user: models.User = Depends(require_role("admin", "researcher")),
                 db: Session = Depends(get_db)):
    """Create a QC batch. Validates the project belongs to the caller's org."""
    owned_or_404(db, models.Project, body.project_id, user.org_id)
    batch = FieldworkBatch(
        org_id=user.org_id,
        project_id=body.project_id,
        market_id=body.market_id,
        integration_id=body.integration_id,
        name=body.name,
        source=body.source,
        rules=body.rules,
        status="pending",
    )
    db.add(batch); db.commit(); db.refresh(batch)
    return batch


@router.get("/batches", response_model=schemas.PaginatedResponse[FieldworkBatchOut])
def list_batches(
    project_id: str = Query(None, description="Filter by project"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List QC batches for the caller's org, newest first."""
    q = db.query(FieldworkBatch).filter(FieldworkBatch.org_id == user.org_id)
    if project_id:
        q = q.filter(FieldworkBatch.project_id == project_id)

    total = q.with_entities(func.count(FieldworkBatch.id)).scalar()
    items = (q.order_by(FieldworkBatch.created_at.desc())
             .offset(skip).limit(limit).all())

    return schemas.PaginatedResponse(
        items=items, total=total, skip=skip, limit=limit,
        has_more=(skip + limit) < total,
    )


@router.get("/batches/{batch_id}", response_model=FieldworkBatchOut)
def get_batch(batch_id: str,
              user: models.User = Depends(get_current_user),
              db: Session = Depends(get_db)):
    """Batch detail + result_summary (pass/flag/reject counts, trend)."""
    return owned_or_404(db, FieldworkBatch, batch_id, user.org_id)


@router.post("/batches/{batch_id}/import", response_model=FieldworkImportOut)
async def import_batch(batch_id: str,
                       file: UploadFile = File(...),
                       user: models.User = Depends(require_role("admin", "researcher")),
                       db: Session = Depends(get_db)):
    """Upload a CSV/XLSX of fielding data → parse into Interview rows (async).

    Dispatches `import_fieldwork_batch` which tracks progress on an ImportJob.
    In dev (Celery eager) the job runs inline, so the response already carries
    the import counts.
    """
    batch = owned_or_404(db, FieldworkBatch, batch_id, user.org_id)

    filename = file.filename or ""
    if not filename.lower().endswith(ALLOWED_IMPORT_EXT):
        raise HTTPException(400, f"Unsupported file type; expected one of {ALLOWED_IMPORT_EXT}")

    content = await file.read()
    if not content:
        raise HTTPException(400, "Empty file")

    storage_key = f"fieldwork/{user.org_id}/{batch_id}/{_uid()}_{filename}"
    storage.save(storage_key, content)

    job = ImportJob(
        org_id=user.org_id,
        project_id=batch.project_id,
        batch_id=batch_id,
        source=batch.source,
        status="pending",
        payload_ref=storage_key,
    )
    db.add(job)
    batch.status = "importing"
    db.commit()
    db.refresh(job)

    import_fieldwork_batch.delay(job.id)

    db.refresh(job)
    return FieldworkImportOut(
        import_job_id=job.id,
        batch_id=batch_id,
        status=job.status,
        result_summary=job.result_summary,
        error=job.error,
    )


@router.post("/batches/{batch_id}/import-from-integration", response_model=FieldworkImportOut)
def import_from_integration(
    batch_id: str,
    body: ImportFromIntegrationIn,
    user: models.User = Depends(require_role("admin", "researcher")),
    db: Session = Depends(get_db),
):
    """Pull interview rows from a registered Integration into a batch.

    Tenant-scopes both the batch and the integration. Creates an ImportJob
    and dispatches ``import_fieldwork_batch`` which calls the source provider
    (mock, surveytogo, dooblo …). Provider errors surface as
    ``job.status='failed'`` rather than HTTP 500 — callers should inspect the
    returned ``status`` and ``error`` fields.
    """
    batch = owned_or_404(db, FieldworkBatch, batch_id, user.org_id)
    integration = owned_or_404(db, Integration, body.integration_id, user.org_id)

    job = ImportJob(
        org_id=user.org_id,
        project_id=batch.project_id,
        batch_id=batch_id,
        integration_id=integration.id,
        source=integration.kind,
        status="pending",
    )
    db.add(job)
    batch.status = "importing"
    db.commit()
    db.refresh(job)

    job_id = job.id
    import_fieldwork_batch.delay(job_id)

    # Re-fetch by PK: the task may have rolled back and re-committed (failure path),
    # which expunges the original ORM instance — db.get() is safe in both outcomes.
    job = db.get(ImportJob, job_id)
    return FieldworkImportOut(
        import_job_id=job.id,
        batch_id=batch_id,
        status=job.status,
        result_summary=job.result_summary,
        error=job.error,
    )


@router.post("/batches/{batch_id}/run", response_model=FieldworkBatchOut)
def run_batch(batch_id: str,
              user: models.User = Depends(require_role("admin", "researcher")),
              db: Session = Depends(get_db)):
    """Run the heuristic QC detectors over the batch (async, idempotent)."""
    batch = owned_or_404(db, FieldworkBatch, batch_id, user.org_id)
    batch.status = "running"
    db.commit()
    run_fieldwork_qc.delay(batch_id)
    db.refresh(batch)
    return batch


@router.get("/interviews/{interview_id}", response_model=InterviewDetailOut)
def get_interview(interview_id: str,
                  user: models.User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    """Interview detail: answers, gps, audio ref, qc_status/score, and flags."""
    iv = owned_or_404(db, Interview, interview_id, user.org_id)
    flags = (db.query(QCFlag)
             .filter(QCFlag.interview_id == interview_id)
             .order_by(QCFlag.severity.desc(), QCFlag.check.asc())
             .all())
    out = InterviewDetailOut.model_validate(iv)
    out.flags = [QCFlagOut.model_validate(f) for f in flags]
    return out


@router.post("/interviews/{interview_id}/verify-audio", response_model=InterviewDetailOut)
def verify_audio(interview_id: str,
                 user: models.User = Depends(require_role("admin", "researcher")),
                 db: Session = Depends(get_db)):
    """Phase 5: trigger the audio-vs-answers fabrication check for one interview.

    Tenant-scoped (owned_or_404) and role-gated (admin/researcher). Dispatches
    `verify_interview_audio` which is idempotent and degrades gracefully when no
    audio is linked. In dev/eager mode the task runs inline so the response
    already reflects any new `audio_mismatch` flag and the recomputed qc_status.
    """
    owned_or_404(db, Interview, interview_id, user.org_id)
    verify_interview_audio.delay(interview_id)
    # Re-fetch after the (possibly inline) task so the response is up-to-date.
    iv = db.get(Interview, interview_id)
    db.refresh(iv)
    flags = (db.query(QCFlag)
             .filter(QCFlag.interview_id == interview_id)
             .order_by(QCFlag.severity.desc(), QCFlag.check.asc())
             .all())
    out = InterviewDetailOut.model_validate(iv)
    out.flags = [QCFlagOut.model_validate(f) for f in flags]
    return out


@router.get("/batches/{batch_id}/interviews",
            response_model=schemas.PaginatedResponse[InterviewOut])
def list_interviews(
    batch_id: str,
    status: str = Query(None, description="Filter by qc_status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List interviews in a batch (paginated), tenant-scoped."""
    owned_or_404(db, FieldworkBatch, batch_id, user.org_id)

    q = (db.query(Interview)
         .filter(Interview.org_id == user.org_id, Interview.batch_id == batch_id))
    if status:
        q = q.filter(Interview.qc_status == status)

    total = q.with_entities(func.count(Interview.id)).scalar()
    items = (q.order_by(Interview.created_at.asc(), Interview.external_id.asc())
             .offset(skip).limit(limit).all())

    return schemas.PaginatedResponse(
        items=items, total=total, skip=skip, limit=limit,
        has_more=(skip + limit) < total,
    )


# ---------------------------------------------------------------------------
# Phase 4 — interviewer anomaly, report, reviewer console
# ---------------------------------------------------------------------------

def _active_checks_by_interview(db, batch_id):
    """Map interview.id -> set of non-dismissed check names for a batch."""
    rows = (db.query(QCFlag.interview_id, QCFlag.check)
            .filter(QCFlag.batch_id == batch_id, QCFlag.status != "dismissed")
            .all())
    out = {}
    for interview_id, check in rows:
        out.setdefault(interview_id, set()).add(check)
    return out


@router.get("/batches/{batch_id}/interviewers", response_model=list[InterviewerScoreOut])
def list_interviewers(batch_id: str,
                      user: models.User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    """Per-interviewer anomaly scores, ranked most-anomalous first."""
    owned_or_404(db, FieldworkBatch, batch_id, user.org_id)
    return (db.query(InterviewerScore)
            .filter(InterviewerScore.org_id == user.org_id,
                    InterviewerScore.batch_id == batch_id)
            .order_by(InterviewerScore.anomaly_score.desc(),
                      InterviewerScore.interviewer_id.asc())
            .all())


@router.get("/batches/{batch_id}/report", response_model=FieldworkReportOut)
def get_report(batch_id: str,
               user: models.User = Depends(get_current_user),
               db: Session = Depends(get_db)):
    """Read-only QC report computed from stored statuses + active flags."""
    owned_or_404(db, FieldworkBatch, batch_id, user.org_id)
    interviews = (db.query(Interview)
                  .filter(Interview.org_id == user.org_id,
                          Interview.batch_id == batch_id).all())
    checks_by_iv = _active_checks_by_interview(db, batch_id)
    return fieldwork_qc.build_report(interviews, checks_by_iv)


@router.post("/flags/{flag_id}/resolve", response_model=QCFlagOut)
def resolve_flag(flag_id: str, body: FlagResolveIn,
                 user: models.User = Depends(require_role("admin", "researcher")),
                 db: Session = Depends(get_db)):
    """Reviewer decision on a flag; recomputes the interview's qc_status.

    The interview is re-scored from its non-dismissed flags (an override path):
    dismiss every flag on an interview and it falls back to `pass`.
    """
    if body.status not in ("confirmed", "dismissed"):
        raise HTTPException(422, "status must be 'confirmed' or 'dismissed'")

    flag = owned_or_404(db, QCFlag, flag_id, user.org_id)
    flag.status = body.status
    flag.reviewer_id = user.id
    if body.note:
        flag.detail = {**(flag.detail or {}), "reviewer_note": body.note}

    # Recompute the interview from its remaining (non-dismissed) flags. Filter in
    # Python so the just-updated flag is honoured regardless of session autoflush.
    interview = db.get(Interview, flag.interview_id)
    all_flags = db.query(QCFlag).filter(QCFlag.interview_id == interview.id).all()
    active = [f for f in all_flags if f.status != "dismissed"]
    qc_status, qc_score = fieldwork_qc.score(
        [{"check": f.check, "severity": f.severity} for f in active])
    interview.qc_status = qc_status
    interview.qc_score = qc_score

    db.commit(); db.refresh(flag)
    return flag
