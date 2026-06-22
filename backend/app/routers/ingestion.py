"""
Phase 1: Ingestion API endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..deps import get_db, get_current_user
from ..models import User, Project
from ..ingestion import (
    XLSXParser,
    TranscriptEditor,
    TranscriptTranslator,
    WhatsAppImporter
)


router = APIRouter(prefix="/api/v1/ingestion", tags=["ingestion"])


# Schemas
class SegmentCorrection(BaseModel):
    segment_id: str
    corrected_text: str


class TranslateRequest(BaseModel):
    transcript_id: str
    target_language: str


class ProjectBriefUpdate(BaseModel):
    brief: str


# Endpoints

@router.post("/upload/xlsx/{project_id}")
async def upload_xlsx_openends(
    project_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload Excel file with open-ended responses"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Parse and import
    result = await XLSXParser.parse_openends(file, project_id, db)
    return result


@router.post("/upload/whatsapp/{project_id}")
async def upload_whatsapp_chat(
    project_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload WhatsApp chat export"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Import chat
    result = await WhatsAppImporter.import_chat(file, project_id, db)
    return result


@router.post("/transcript/correct")
async def correct_transcript_segment(
    correction: SegmentCorrection,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Correct/edit a transcript segment"""
    # Note: Should verify segment belongs to user's org
    result = await TranscriptEditor.correct_segment(
        correction.segment_id,
        correction.corrected_text,
        db
    )
    return result


@router.post("/transcript/translate")
async def translate_transcript(
    request: TranslateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Translate transcript to target language"""
    result = await TranscriptTranslator.translate_transcript(
        request.transcript_id,
        request.target_language,
        db
    )
    return result


@router.patch("/project/{project_id}/brief")
async def update_project_brief(
    project_id: str,
    brief_update: ProjectBriefUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update project brief for AI context"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Add brief to project (extend model if needed)
    if not hasattr(project, 'brief'):
        # For now, store in description
        project.description = f"BRIEF: {brief_update.brief}\n\n{project.description}"
    else:
        project.brief = brief_update.brief

    db.commit()

    return {
        'status': 'success',
        'project_id': project_id,
        'brief': brief_update.brief
    }