from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, usage as usage_mod
from ..database import get_db
from ..deps import get_current_user, require_role, owned_or_404
from ..tasks import run_analysis

router = APIRouter(tags=["analyses"])


@router.post("/transcripts/{transcript_id}/analyses", response_model=schemas.AnalysisOut)
def start_analysis(transcript_id: str,
                   user: models.User = Depends(require_role("admin", "researcher")),
                   db: Session = Depends(get_db)):
    t = owned_or_404(db, models.Transcript, transcript_id, user.org_id)

    if t.transcription_status in ("pending", "running"):
        raise HTTPException(409, "Transcript is still being transcribed.")
    if not (t.content or "").strip():
        raise HTTPException(422, "Transcript has no text to analyze.")

    # SaaS usage gate
    used = usage_mod.month_count(db, user.org_id)
    limit = usage_mod.plan_limit(user.org.plan)
    if used >= limit:
        raise HTTPException(402, f"Monthly plan limit reached ({limit}). Upgrade to continue.")

    a = models.Analysis(org_id=user.org_id, transcript_id=t.id, status="pending")
    db.add(a); db.commit(); db.refresh(a)
    run_analysis.delay(a.id)
    db.refresh(a)
    return a


@router.get("/analyses/{analysis_id}", response_model=schemas.AnalysisOut)
def get_analysis(analysis_id: str, user: models.User = Depends(get_current_user),
                 db: Session = Depends(get_db)):
    return owned_or_404(db, models.Analysis, analysis_id, user.org_id)


@router.get("/transcripts/{transcript_id}/analyses", response_model=List[schemas.AnalysisSummary])
def list_analyses(transcript_id: str, user: models.User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    owned_or_404(db, models.Transcript, transcript_id, user.org_id)
    return (db.query(models.Analysis)
            .filter(models.Analysis.transcript_id == transcript_id)
            .order_by(models.Analysis.created_at.desc()).all())
