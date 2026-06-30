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
from ..models_fieldwork import FieldworkBatch, Interview
from ..models_phase1 import ImportJob
from ..schemas_fieldwork import (
    FieldworkBatchIn, FieldworkBatchOut, InterviewOut, FieldworkImportOut,
)
from ..database import get_db
from ..deps import get_current_user, require_role, owned_or_404
from ..storage import storage
from ..tasks import import_fieldwork_batch

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
        source=batch.source,
        status="pending",
        payload_ref=storage_key,
        result_summary={"batch_id": batch_id, "filename": filename},
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
