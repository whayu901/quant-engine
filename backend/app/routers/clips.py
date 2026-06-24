"""
Phase 5: Clips and Reels API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, timedelta
from ..security import hash_pw, verify_pw
import uuid
import secrets
import os

from ..database import get_db
from ..deps import get_current_user
from ..models import User, Project, Transcript, TranscriptSegment, MediaAsset
from ..models_phase5 import (
    Clip, Reel, ReelItem, ClipTemplate,
    MediaProcessingJob, ShareLink
)
from ..services.media_processor import MediaProcessor
from ..tasks import process_clip_extraction, process_reel_compilation
from ..storage import get_storage
from ..schemas_phase5 import (
    ClipCreate, ClipUpdate, ClipResponse,
    ReelCreate, ReelUpdate, ReelResponse,
    ReelItemCreate, ReelItemResponse,
    ClipTemplateCreate, ClipTemplateResponse,
    ShareLinkCreate, ShareLinkResponse,
    MediaJobResponse
)

router = APIRouter(prefix="/api/v1", tags=["clips"])
media_processor = MediaProcessor()
storage = get_storage()


# Clips endpoints
@router.post("/projects/{project_id}/clips", response_model=ClipResponse)
async def create_clip(
    project_id: str,
    clip_data: ClipCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new clip from transcript segments"""

    # Verify project access
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.org_id == current_user.org_id
        )
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Verify transcript exists
    transcript = db.query(Transcript).filter(
        and_(
            Transcript.id == clip_data.transcript_id,
            Transcript.project_id == project_id
        )
    ).first()

    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    # Create clip record
    clip = Clip(
        id=str(uuid.uuid4()),
        org_id=current_user.org_id,
        project_id=project_id,
        transcript_id=clip_data.transcript_id,
        name=clip_data.name,
        description=clip_data.description,
        start_time=clip_data.start_time,
        end_time=clip_data.end_time,
        duration=clip_data.end_time - clip_data.start_time,
        segment_ids=clip_data.segment_ids,
        source_media_id=transcript.source_media_id,
        tags=clip_data.tags or [],
        theme_ids=clip_data.theme_ids or [],
        status="pending",
        created_by=current_user.id
    )

    db.add(clip)
    db.commit()

    # Create processing job
    job = MediaProcessingJob(
        id=str(uuid.uuid4()),
        org_id=current_user.org_id,
        job_type="clip_extraction",
        target_type="clip",
        target_id=clip.id,
        status="pending",
        created_by=current_user.id
    )

    db.add(job)
    db.commit()

    # Queue async processing
    if transcript.source_media_id:
        background_tasks.add_task(
            process_clip_extraction,
            clip_id=clip.id,
            job_id=job.id
        )
    else:
        # No media, mark as ready (text-only clip)
        clip.status = "ready"
        job.status = "completed"
        db.commit()

    return clip


@router.get("/projects/{project_id}/clips", response_model=List[ClipResponse])
async def list_clips(
    project_id: str,
    transcript_id: Optional[str] = None,
    status: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all clips in a project"""

    # Verify project access
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.org_id == current_user.org_id
        )
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(Clip).filter(Clip.project_id == project_id)

    if transcript_id:
        query = query.filter(Clip.transcript_id == transcript_id)

    if status:
        query = query.filter(Clip.status == status)

    if tag:
        query = query.filter(Clip.tags.contains([tag]))

    clips = query.order_by(Clip.created_at.desc()).all()

    return clips


@router.get("/clips/{clip_id}", response_model=ClipResponse)
async def get_clip(
    clip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific clip"""

    clip = db.query(Clip).filter(
        and_(
            Clip.id == clip_id,
            Clip.org_id == current_user.org_id
        )
    ).first()

    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    # Increment usage counter
    clip.usage_count += 1
    clip.last_used = datetime.utcnow()
    db.commit()

    return clip


@router.put("/clips/{clip_id}", response_model=ClipResponse)
async def update_clip(
    clip_id: str,
    clip_update: ClipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update clip metadata"""

    clip = db.query(Clip).filter(
        and_(
            Clip.id == clip_id,
            Clip.org_id == current_user.org_id
        )
    ).first()

    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    # Update fields if provided
    for field in ["name", "description", "tags", "theme_ids"]:
        if hasattr(clip_update, field) and getattr(clip_update, field) is not None:
            setattr(clip, field, getattr(clip_update, field))

    clip.updated_at = datetime.utcnow()
    db.commit()

    return clip


@router.delete("/clips/{clip_id}")
async def delete_clip(
    clip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a clip"""

    clip = db.query(Clip).filter(
        and_(
            Clip.id == clip_id,
            Clip.org_id == current_user.org_id
        )
    ).first()

    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    # Check if clip is used in any reels
    reel_items = db.query(ReelItem).filter(ReelItem.clip_id == clip_id).count()

    if reel_items > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Clip is used in {reel_items} reel(s). Remove from reels before deleting."
        )

    # Delete associated media if exists
    if clip.clip_media_id:
        media = db.query(MediaAsset).filter(MediaAsset.id == clip.clip_media_id).first()
        if media:
            storage.delete(media.storage_key)
            db.delete(media)

    db.delete(clip)
    db.commit()

    return {"message": "Clip deleted successfully"}


# Reels endpoints
@router.post("/projects/{project_id}/reels", response_model=ReelResponse)
async def create_reel(
    project_id: str,
    reel_data: ReelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new reel"""

    # Verify project access
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.org_id == current_user.org_id
        )
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create reel
    reel = Reel(
        id=str(uuid.uuid4()),
        org_id=current_user.org_id,
        project_id=project_id,
        name=reel_data.name,
        description=reel_data.description,
        purpose=reel_data.purpose,
        transition_style=reel_data.transition_style or "fade",
        transition_duration=reel_data.transition_duration or 0.5,
        intro_text=reel_data.intro_text,
        outro_text=reel_data.outro_text,
        watermark=reel_data.watermark or False,
        resolution=reel_data.resolution or "1080p",
        aspect_ratio=reel_data.aspect_ratio or "16:9",
        format=reel_data.format or "mp4",
        status="draft",
        created_by=current_user.id
    )

    db.add(reel)
    db.commit()

    return reel


@router.get("/projects/{project_id}/reels", response_model=List[ReelResponse])
async def list_reels(
    project_id: str,
    status: Optional[str] = None,
    purpose: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all reels in a project"""

    # Verify project access
    project = db.query(Project).filter(
        and_(
            Project.id == project_id,
            Project.org_id == current_user.org_id
        )
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(Reel).filter(Reel.project_id == project_id)

    if status:
        query = query.filter(Reel.status == status)

    if purpose:
        query = query.filter(Reel.purpose == purpose)

    reels = query.order_by(Reel.created_at.desc()).all()

    return reels


@router.get("/reels/{reel_id}", response_model=ReelResponse)
async def get_reel(
    reel_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific reel with its items"""

    reel = db.query(Reel).filter(
        and_(
            Reel.id == reel_id,
            Reel.org_id == current_user.org_id
        )
    ).first()

    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    return reel


@router.put("/reels/{reel_id}", response_model=ReelResponse)
async def update_reel(
    reel_id: str,
    reel_update: ReelUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update reel settings"""

    reel = db.query(Reel).filter(
        and_(
            Reel.id == reel_id,
            Reel.org_id == current_user.org_id
        )
    ).first()

    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    # Update fields if provided
    update_fields = [
        "name", "description", "purpose", "transition_style",
        "transition_duration", "intro_text", "outro_text",
        "watermark", "resolution", "aspect_ratio", "format"
    ]

    for field in update_fields:
        if hasattr(reel_update, field) and getattr(reel_update, field) is not None:
            setattr(reel, field, getattr(reel_update, field))

    reel.updated_at = datetime.utcnow()
    db.commit()

    return reel


@router.post("/reels/{reel_id}/items", response_model=ReelItemResponse)
async def add_reel_item(
    reel_id: str,
    item_data: ReelItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a clip to a reel"""

    # Verify reel access
    reel = db.query(Reel).filter(
        and_(
            Reel.id == reel_id,
            Reel.org_id == current_user.org_id
        )
    ).first()

    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    # Verify clip exists and is ready
    clip = db.query(Clip).filter(
        and_(
            Clip.id == item_data.clip_id,
            Clip.org_id == current_user.org_id
        )
    ).first()

    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    if clip.status != "ready":
        raise HTTPException(status_code=400, detail="Clip is not ready for use")

    # Get next position
    max_position = db.query(func.max(ReelItem.position)).filter(
        ReelItem.reel_id == reel_id
    ).scalar() or 0

    # Create reel item
    item = ReelItem(
        id=str(uuid.uuid4()),
        reel_id=reel_id,
        clip_id=item_data.clip_id,
        position=item_data.position if item_data.position is not None else max_position + 1,
        title_overlay=item_data.title_overlay,
        subtitle_overlay=item_data.subtitle_overlay,
        trim_start=item_data.trim_start or 0,
        trim_end=item_data.trim_end or 0,
        playback_speed=item_data.playback_speed or 1.0,
        transition_in=item_data.transition_in,
        transition_out=item_data.transition_out,
        annotations=item_data.annotations or []
    )

    db.add(item)

    # Reset reel status if it was compiled
    if reel.status == "ready":
        reel.status = "draft"

    db.commit()

    return item


@router.put("/reels/{reel_id}/items/{item_id}", response_model=ReelItemResponse)
async def update_reel_item(
    reel_id: str,
    item_id: str,
    item_update: ReelItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a reel item"""

    # Verify reel access
    reel = db.query(Reel).filter(
        and_(
            Reel.id == reel_id,
            Reel.org_id == current_user.org_id
        )
    ).first()

    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    # Get reel item
    item = db.query(ReelItem).filter(
        and_(
            ReelItem.id == item_id,
            ReelItem.reel_id == reel_id
        )
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Reel item not found")

    # Update fields
    for field in [
        "position", "title_overlay", "subtitle_overlay",
        "trim_start", "trim_end", "playback_speed",
        "transition_in", "transition_out", "annotations"
    ]:
        if hasattr(item_update, field) and getattr(item_update, field) is not None:
            setattr(item, field, getattr(item_update, field))

    # Reset reel status if it was compiled
    if reel.status == "ready":
        reel.status = "draft"

    db.commit()

    return item


@router.delete("/reels/{reel_id}/items/{item_id}")
async def remove_reel_item(
    reel_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a clip from a reel"""

    # Verify reel access
    reel = db.query(Reel).filter(
        and_(
            Reel.id == reel_id,
            Reel.org_id == current_user.org_id
        )
    ).first()

    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    # Get and delete reel item
    item = db.query(ReelItem).filter(
        and_(
            ReelItem.id == item_id,
            ReelItem.reel_id == reel_id
        )
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Reel item not found")

    # Reorder remaining items
    db.query(ReelItem).filter(
        and_(
            ReelItem.reel_id == reel_id,
            ReelItem.position > item.position
        )
    ).update({ReelItem.position: ReelItem.position - 1})

    db.delete(item)

    # Reset reel status if it was compiled
    if reel.status == "ready":
        reel.status = "draft"

    db.commit()

    return {"message": "Item removed from reel"}


@router.post("/reels/{reel_id}/compile")
async def compile_reel(
    reel_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compile a reel from its clips"""

    # Verify reel access
    reel = db.query(Reel).filter(
        and_(
            Reel.id == reel_id,
            Reel.org_id == current_user.org_id
        )
    ).first()

    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    # Check if reel has items
    item_count = db.query(ReelItem).filter(ReelItem.reel_id == reel_id).count()

    if item_count == 0:
        raise HTTPException(status_code=400, detail="Reel has no clips")

    # Create processing job
    job = MediaProcessingJob(
        id=str(uuid.uuid4()),
        org_id=current_user.org_id,
        job_type="reel_compilation",
        target_type="reel",
        target_id=reel.id,
        status="pending",
        created_by=current_user.id
    )

    db.add(job)

    # Update reel status
    reel.status = "processing"
    db.commit()

    # Queue async processing
    background_tasks.add_task(
        process_reel_compilation,
        reel_id=reel.id,
        job_id=job.id
    )

    return {
        "message": "Reel compilation started",
        "job_id": job.id
    }


@router.delete("/reels/{reel_id}")
async def delete_reel(
    reel_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a reel"""

    reel = db.query(Reel).filter(
        and_(
            Reel.id == reel_id,
            Reel.org_id == current_user.org_id
        )
    ).first()

    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    # Delete associated media if exists
    if reel.reel_media_id:
        media = db.query(MediaAsset).filter(MediaAsset.id == reel.reel_media_id).first()
        if media:
            storage.delete(media.storage_key)
            db.delete(media)

    # Delete share links
    db.query(ShareLink).filter(
        and_(
            ShareLink.target_type == "reel",
            ShareLink.target_id == reel_id
        )
    ).delete()

    db.delete(reel)
    db.commit()

    return {"message": "Reel deleted successfully"}


# Share endpoints
@router.post("/share", response_model=ShareLinkResponse)
async def create_share_link(
    share_data: ShareLinkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a shareable link for a clip or reel"""

    # Verify target exists and user has access
    if share_data.target_type == "clip":
        target = db.query(Clip).filter(
            and_(
                Clip.id == share_data.target_id,
                Clip.org_id == current_user.org_id
            )
        ).first()
    elif share_data.target_type == "reel":
        target = db.query(Reel).filter(
            and_(
                Reel.id == share_data.target_id,
                Reel.org_id == current_user.org_id
            )
        ).first()
    else:
        raise HTTPException(status_code=400, detail="Invalid target type")

    if not target:
        raise HTTPException(status_code=404, detail=f"{share_data.target_type.capitalize()} not found")

    # Generate unique token
    token = secrets.token_urlsafe(32)

    # Create share link
    share_link = ShareLink(
        id=str(uuid.uuid4()),
        org_id=current_user.org_id,
        target_type=share_data.target_type,
        target_id=share_data.target_id,
        token=token,
        title=share_data.title or target.name,
        description=share_data.description or target.description,
        password=hash_pw(share_data.password) if share_data.password else None,  # Hash password before storing
        allow_download=share_data.allow_download or False,
        require_email=share_data.require_email or False,
        expires_at=share_data.expires_at,
        max_views=share_data.max_views,
        created_by=current_user.id
    )

    db.add(share_link)
    db.commit()

    # Construct share URL
    base_url = os.getenv("BASE_URL", "http://localhost:5174")
    share_link.url = f"{base_url}/share/{token}"

    return share_link


@router.get("/share/{token}")
async def get_shared_content(
    token: str,
    password: Optional[str] = None,
    email: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Access shared content via token"""

    # Find share link
    share_link = db.query(ShareLink).filter(ShareLink.token == token).first()

    if not share_link:
        raise HTTPException(status_code=404, detail="Share link not found")

    # Check expiry
    if share_link.expires_at and share_link.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Share link has expired")

    # Check max views
    if share_link.max_views and share_link.view_count >= share_link.max_views:
        raise HTTPException(status_code=410, detail="Maximum views reached")

    # Check password
    if share_link.password and password:
        if not verify_pw(password, share_link.password):
            raise HTTPException(status_code=401, detail="Invalid password")
    elif share_link.password and not password:
        raise HTTPException(status_code=401, detail="Password required")

    # Require email if configured
    if share_link.require_email and not email:
        raise HTTPException(status_code=400, detail="Email required to access content")

    # Track view
    share_link.view_count += 1
    share_link.last_viewed = datetime.utcnow()

    if email and share_link.require_email:
        if email not in share_link.viewer_emails:
            share_link.viewer_emails.append(email)
            share_link.unique_viewers += 1

    db.commit()

    # Get target content
    if share_link.target_type == "clip":
        content = db.query(Clip).filter(Clip.id == share_link.target_id).first()
    else:
        content = db.query(Reel).filter(Reel.id == share_link.target_id).first()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    return {
        "type": share_link.target_type,
        "title": share_link.title,
        "description": share_link.description,
        "content": content,
        "allow_download": share_link.allow_download
    }


# Media processing status
@router.get("/jobs/{job_id}", response_model=MediaJobResponse)
async def get_job_status(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get media processing job status"""

    job = db.query(MediaProcessingJob).filter(
        and_(
            MediaProcessingJob.id == job_id,
            MediaProcessingJob.org_id == current_user.org_id
        )
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return job


# Templates
@router.post("/templates/clips", response_model=ClipTemplateResponse)
async def create_clip_template(
    template_data: ClipTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a reusable clip template"""

    template = ClipTemplate(
        id=str(uuid.uuid4()),
        org_id=current_user.org_id,
        name=template_data.name,
        description=template_data.description,
        category=template_data.category,
        criteria=template_data.criteria,
        max_duration=template_data.max_duration or 30.0,
        include_context_before=template_data.include_context_before or 2.0,
        include_context_after=template_data.include_context_after or 2.0,
        title_template=template_data.title_template,
        subtitle_template=template_data.subtitle_template,
        overlay_style=template_data.overlay_style,
        is_public=template_data.is_public or False,
        created_by=current_user.id
    )

    db.add(template)
    db.commit()

    return template


@router.get("/templates/clips", response_model=List[ClipTemplateResponse])
async def list_clip_templates(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List available clip templates"""

    query = db.query(ClipTemplate).filter(
        and_(
            ClipTemplate.org_id == current_user.org_id,
            or_(
                ClipTemplate.is_public == True,
                ClipTemplate.created_by == current_user.id
            )
        )
    )

    if category:
        query = query.filter(ClipTemplate.category == category)

    templates = query.order_by(ClipTemplate.created_at.desc()).all()

    return templates