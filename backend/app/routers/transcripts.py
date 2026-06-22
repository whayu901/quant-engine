import io
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_role, owned_or_404
from ..storage import storage
from ..tasks import transcribe_media

router = APIRouter(tags=["transcripts"])

AUDIO_VIDEO = ("audio/", "video/")


def _extract_text(filename: str, raw: bytes) -> str:
    name = (filename or "").lower()
    if name.endswith(".docx"):
        import docx
        doc = docx.Document(io.BytesIO(raw))
        return "\n".join(p.text for p in doc.paragraphs)
    return raw.decode("utf-8", errors="ignore")


@router.post("/projects/{project_id}/media", response_model=schemas.TranscriptOut)
def upload_media(project_id: str, file: UploadFile = File(...),
                 method: str = "FGD", language: str = "",
                 user: models.User = Depends(require_role("admin", "researcher")),
                 db: Session = Depends(get_db)):
    """Upload an audio/video recording -> transcribe asynchronously."""
    owned_or_404(db, models.Project, project_id, user.org_id)
    ctype = file.content_type or ""
    kind = "video" if ctype.startswith("video/") else "audio"
    if not ctype.startswith(AUDIO_VIDEO):
        # fall back on extension for clients that don't send a content-type
        if not file.filename.lower().endswith(
                (".mp3", ".mp4", ".wav", ".m4a", ".aac", ".ogg", ".mov", ".webm")):
            raise HTTPException(400, "Expected an audio or video file")

    raw = file.file.read()
    media = models.MediaAsset(org_id=user.org_id, project_id=project_id,
                              filename=file.filename, content_type=ctype, kind=kind)
    db.add(media); db.flush()
    media.storage_key = storage.save(f"{user.org_id}/{media.id}/{file.filename}", raw)

    t = models.Transcript(org_id=user.org_id, project_id=project_id, title=file.filename,
                          method=method, content="", source_media_id=media.id,
                          source_filename=file.filename, language=language or None,
                          transcription_status="pending")
    db.add(t); db.commit(); db.refresh(t)
    transcribe_media.delay(t.id)
    db.refresh(t)
    return t


@router.post("/projects/{project_id}/transcripts", response_model=schemas.TranscriptOut)
def create_transcript(project_id: str, body: schemas.TranscriptIn,
                      user: models.User = Depends(require_role("admin", "researcher")),
                      db: Session = Depends(get_db)):
    owned_or_404(db, models.Project, project_id, user.org_id)
    t = models.Transcript(org_id=user.org_id, project_id=project_id, title=body.title,
                          method=body.method, content=body.content)
    db.add(t); db.commit(); db.refresh(t)
    return t


@router.post("/projects/{project_id}/transcripts/upload", response_model=schemas.TranscriptOut)
def upload_transcript(project_id: str, file: UploadFile = File(...),
                      method: str = "FGD",
                      user: models.User = Depends(require_role("admin", "researcher")),
                      db: Session = Depends(get_db)):
    owned_or_404(db, models.Project, project_id, user.org_id)
    raw = file.file.read()
    content = _extract_text(file.filename, raw)
    if not content.strip():
        raise HTTPException(400, "Empty or unreadable file")
    t = models.Transcript(org_id=user.org_id, project_id=project_id,
                          title=file.filename, method=method, content=content,
                          source_filename=file.filename)
    db.add(t); db.commit(); db.refresh(t)
    return t


@router.get("/projects/{project_id}/transcripts", response_model=List[schemas.TranscriptOut])
def list_transcripts(project_id: str, user: models.User = Depends(get_current_user),
                     db: Session = Depends(get_db)):
    owned_or_404(db, models.Project, project_id, user.org_id)
    return (db.query(models.Transcript)
            .filter(models.Transcript.project_id == project_id)
            .order_by(models.Transcript.created_at.desc()).all())


@router.get("/transcripts/{transcript_id}", response_model=schemas.TranscriptDetail)
def get_transcript(transcript_id: str, user: models.User = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    return owned_or_404(db, models.Transcript, transcript_id, user.org_id)
