"""
Multimodal Analysis Router for Phase 6
Combines text, audio, and video features for comprehensive analysis
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import io

from app.database import get_db
from app.deps import get_current_user, get_current_active_user
from app.models import User, Project, Transcript
from app.models_phase6 import (
    MediaFile, MediaProcessingJob, VideoHighlight,
    HighlightReel, CustomAIModel, AIAnalysisResult,
    MediaProcessingStatus, MediaQuality
)
from app.schemas_phase6 import (
    MediaFileResponse, MediaFileCreate, MediaProcessingJobResponse,
    WaveformDataResponse, VideoSyncResponse, VideoHighlightCreate,
    VideoHighlightResponse, HighlightReelCreate, HighlightReelResponse,
    MultimodalAnalysisRequest, MultimodalAnalysisResponse,
    CustomModelTrainingRequest, CustomModelResponse
)
from app.services.waveform_service import waveform_service
from app.services.video_sync_service import video_sync_service
from app.services.media_processor import MediaProcessor
from app.tasks import process_media_file, generate_highlights
from app.utils import check_project_access

router = APIRouter(prefix="/api/v1/multimodal", tags=["multimodal"])

media_processor = MediaProcessor()


# ============= Media Upload & Processing =============

@router.post("/upload", response_model=MediaFileResponse)
async def upload_media_file(
    background_tasks: BackgroundTasks,
    project_id: str = Query(..., description="Project ID"),
    file: UploadFile = File(..., description="Media file to upload"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload and process a media file (video/audio).
    Triggers automatic transcription, waveform generation, and analysis.
    """
    # Check project access
    project = check_project_access(db, project_id, current_user)

    # Validate file type
    allowed_extensions = {'.mp4', '.mp3', '.wav', '.m4a', '.mov', '.avi', '.webm'}
    file_ext = '.' + file.filename.split('.')[-1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not supported")

    # Check file size (max 500MB for now)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > 500 * 1024 * 1024:  # 500MB
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 500MB")

    # Create media file record
    media_file = MediaFile(
        project_id=project_id,
        original_filename=file.filename,
        file_type=file_ext[1:],
        file_size=file_size,
        processing_status=MediaProcessingStatus.PENDING
    )

    db.add(media_file)
    db.commit()
    db.refresh(media_file)

    # Save file to storage
    storage_path = f"media/{project_id}/{media_file.id}{file_ext}"
    # In production, upload to S3
    # For now, save locally
    import os
    os.makedirs(os.path.dirname(f"storage/{storage_path}"), exist_ok=True)

    with open(f"storage/{storage_path}", "wb") as f:
        f.write(file.file.read())

    media_file.original_path = storage_path
    db.commit()

    # Queue processing tasks
    background_tasks.add_task(
        process_media_file,
        media_file_id=media_file.id,
        user_id=current_user.id
    )

    return MediaFileResponse.from_orm(media_file)


@router.get("/media/{media_id}", response_model=MediaFileResponse)
async def get_media_file(
    media_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get media file details and processing status"""
    media_file = db.query(MediaFile).filter(MediaFile.id == media_id).first()
    if not media_file:
        raise HTTPException(status_code=404, detail="Media file not found")

    # Check access
    check_project_access(db, media_file.project_id, current_user)

    return MediaFileResponse.from_orm(media_file)


# ============= Waveform Generation =============

@router.get("/media/{media_id}/waveform", response_model=WaveformDataResponse)
async def get_waveform_data(
    media_id: str,
    resolution: int = Query(1000, ge=100, le=10000, description="Number of waveform peaks"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get waveform visualization data for a media file.
    Returns peaks array optimized for mobile display.
    """
    media_file = db.query(MediaFile).filter(MediaFile.id == media_id).first()
    if not media_file:
        raise HTTPException(status_code=404, detail="Media file not found")

    # Check access
    check_project_access(db, media_file.project_id, current_user)

    # Check if waveform already generated
    if media_file.waveform_data_url:
        # Load from cache
        waveform_data = waveform_service.get_cached_waveform(
            media_file.original_path,
            resolution
        )
        if waveform_data:
            return WaveformDataResponse(**waveform_data)

    # Generate waveform
    if not media_file.audio_path and not media_file.original_path:
        raise HTTPException(status_code=400, detail="No audio available for waveform generation")

    audio_path = media_file.audio_path or media_file.original_path
    waveform_data = waveform_service.generate_waveform_data(
        f"storage/{audio_path}",
        resolution=resolution
    )

    # Update database with waveform path
    if 'cache_file' in waveform_data:
        media_file.waveform_data_url = waveform_data['cache_file']
        media_file.waveform_resolution = resolution
        media_file.waveform_generated_at = datetime.utcnow()
        db.commit()

    return WaveformDataResponse(**waveform_data)


@router.get("/media/{media_id}/waveform.png")
async def get_waveform_image(
    media_id: str,
    width: int = Query(1000, ge=100, le=4000),
    height: int = Query(200, ge=50, le=1000),
    color: str = Query("#1976D2", description="Waveform color"),
    background: str = Query("#FFFFFF", description="Background color"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate and return waveform as PNG image"""
    media_file = db.query(MediaFile).filter(MediaFile.id == media_id).first()
    if not media_file:
        raise HTTPException(status_code=404, detail="Media file not found")

    # Check access
    check_project_access(db, media_file.project_id, current_user)

    # Get waveform data
    audio_path = media_file.audio_path or media_file.original_path
    waveform_data = waveform_service.generate_waveform_data(f"storage/{audio_path}")

    # Generate image
    image_bytes = waveform_service.generate_waveform_image(
        waveform_data,
        width=width,
        height=height,
        color=color,
        background=background
    )

    if not image_bytes:
        raise HTTPException(status_code=500, detail="Failed to generate waveform image")

    return StreamingResponse(io.BytesIO(image_bytes), media_type="image/png")


# ============= Video Sync & Timeline =============

@router.get("/media/{media_id}/sync", response_model=VideoSyncResponse)
async def get_video_sync(
    media_id: str,
    include_speakers: bool = Query(True, description="Include speaker labels"),
    include_sentiment: bool = Query(True, description="Include sentiment markers"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get synchronized transcript timeline for video player.
    Returns WebVTT, chapters, and speaker information.
    """
    media_file = db.query(MediaFile).filter(MediaFile.id == media_id).first()
    if not media_file:
        raise HTTPException(status_code=404, detail="Media file not found")

    # Check access
    check_project_access(db, media_file.project_id, current_user)

    # Get transcript
    if not media_file.transcript_id:
        raise HTTPException(status_code=400, detail="No transcript available for this media")

    transcript = db.query(Transcript).filter(Transcript.id == media_file.transcript_id).first()
    if not transcript or not transcript.segments:
        raise HTTPException(status_code=400, detail="Transcript segments not available")

    # Generate sync data
    sync_data = video_sync_service.sync_transcript_to_video(
        media_file.original_path,
        transcript.segments,
        language=media_file.detected_languages[0] if media_file.detected_languages else 'en',
        include_speakers=include_speakers,
        include_sentiment=include_sentiment
    )

    # Update database
    media_file.vtt_file_path = sync_data.get('vtt_path')
    media_file.srt_file_path = sync_data.get('srt_path')
    media_file.timeline_json_path = sync_data.get('timeline_path')
    media_file.chapters_generated = bool(sync_data.get('chapters'))
    db.commit()

    return VideoSyncResponse(**sync_data)


# ============= Video Highlights & Reels =============

@router.post("/highlights", response_model=VideoHighlightResponse)
async def create_video_highlight(
    highlight: VideoHighlightCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a video highlight clip"""
    # Validate media file
    media_file = db.query(MediaFile).filter(MediaFile.id == highlight.media_file_id).first()
    if not media_file:
        raise HTTPException(status_code=404, detail="Media file not found")

    # Check access
    check_project_access(db, media_file.project_id, current_user)

    # Create highlight
    db_highlight = VideoHighlight(
        **highlight.dict(),
        project_id=media_file.project_id,
        duration=highlight.end_time - highlight.start_time,
        created_by=current_user.id
    )

    db.add(db_highlight)
    db.commit()
    db.refresh(db_highlight)

    return VideoHighlightResponse.from_orm(db_highlight)


@router.post("/highlights/auto-detect")
async def auto_detect_highlights(
    background_tasks: BackgroundTasks,
    media_id: str = Query(..., description="Media file ID"),
    methods: List[str] = Query(["sentiment", "keywords"], description="Detection methods"),
    min_importance: float = Query(0.7, ge=0, le=1, description="Minimum importance score"),
    max_highlights: int = Query(10, ge=1, le=50, description="Maximum number of highlights"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Automatically detect important moments in media for highlights.
    Uses AI to identify key segments based on sentiment, keywords, and audio features.
    """
    media_file = db.query(MediaFile).filter(MediaFile.id == media_id).first()
    if not media_file:
        raise HTTPException(status_code=404, detail="Media file not found")

    # Check access
    check_project_access(db, media_file.project_id, current_user)

    # Create processing job
    job = MediaProcessingJob(
        media_file_id=media_id,
        job_type="highlight_detection",
        status=MediaProcessingStatus.PENDING
    )
    db.add(job)
    db.commit()

    # Queue task
    background_tasks.add_task(
        generate_highlights,
        media_id=media_id,
        job_id=job.id,
        methods=methods,
        min_importance=min_importance,
        max_highlights=max_highlights,
        user_id=current_user.id
    )

    return {
        "message": "Highlight detection started",
        "job_id": job.id,
        "status": "processing"
    }


@router.post("/reels", response_model=HighlightReelResponse)
async def create_highlight_reel(
    reel: HighlightReelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a highlight reel from multiple clips"""
    # Validate project access
    check_project_access(db, reel.project_id, current_user)

    # Validate all highlights exist
    for highlight_id in reel.highlight_ids:
        highlight = db.query(VideoHighlight).filter(VideoHighlight.id == highlight_id).first()
        if not highlight:
            raise HTTPException(status_code=404, detail=f"Highlight {highlight_id} not found")

    # Create reel
    db_reel = HighlightReel(
        **reel.dict(),
        created_by=current_user.id
    )

    db.add(db_reel)
    db.commit()
    db.refresh(db_reel)

    return HighlightReelResponse.from_orm(db_reel)


# ============= Multimodal Analysis =============

@router.post("/analyze", response_model=MultimodalAnalysisResponse)
async def analyze_multimodal(
    request: MultimodalAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Perform multimodal analysis combining text, audio, and video features.
    SEA-specific: Detects cultural gestures, emotional tone in context.
    """
    # Check project access
    check_project_access(db, request.project_id, current_user)

    # Validate transcript
    transcript = None
    if request.transcript_id:
        transcript = db.query(Transcript).filter(Transcript.id == request.transcript_id).first()
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")

    # Validate media file
    media_file = None
    if request.media_file_id:
        media_file = db.query(MediaFile).filter(MediaFile.id == request.media_file_id).first()
        if not media_file:
            raise HTTPException(status_code=404, detail="Media file not found")

    # Perform analysis based on requested types
    results = {}

    for analysis_type in request.analysis_types:
        if analysis_type == "sentiment":
            results["sentiment"] = await _analyze_sentiment_multimodal(
                transcript, media_file, db
            )
        elif analysis_type == "topics":
            results["topics"] = await _analyze_topics_multimodal(
                transcript, media_file, db
            )
        elif analysis_type == "emotions":
            results["emotions"] = await _analyze_emotions_multimodal(
                transcript, media_file, db
            )
        elif analysis_type == "code_mixing":
            results["code_mixing"] = await _analyze_code_mixing(
                transcript, db
            )

    # Store results
    ai_result = AIAnalysisResult(
        project_id=request.project_id,
        transcript_id=request.transcript_id,
        media_file_id=request.media_file_id,
        analysis_type=",".join(request.analysis_types),
        model_used=request.model_id or "default",
        custom_model_id=request.custom_model_id,
        used_text=bool(transcript),
        used_audio=request.use_audio and bool(media_file),
        used_video=request.use_video and bool(media_file),
        results=results,
        created_by=current_user.id
    )

    db.add(ai_result)
    db.commit()
    db.refresh(ai_result)

    return MultimodalAnalysisResponse(
        analysis_id=ai_result.id,
        results=results,
        confidence_scores=ai_result.confidence_scores or {},
        summary=_generate_analysis_summary(results),
        created_at=ai_result.created_at
    )


async def _analyze_sentiment_multimodal(transcript, media_file, db):
    """Analyze sentiment using text and audio features"""
    sentiment_results = {
        "overall": "neutral",
        "scores": {"positive": 0, "negative": 0, "neutral": 0},
        "timeline": []
    }

    if transcript and transcript.segments:
        # Text-based sentiment
        for segment in transcript.segments:
            # In production, use actual sentiment model
            # For now, mock sentiment
            sentiment = "positive" if "good" in segment.get("text", "").lower() else "neutral"
            sentiment_results["timeline"].append({
                "start": segment.get("start", 0),
                "end": segment.get("end", 0),
                "sentiment": sentiment,
                "text": segment.get("text", "")[:100]
            })

    if media_file and media_file.audio_path:
        # Audio-based emotion (prosody, tone)
        # In production, analyze audio features
        sentiment_results["audio_emotion"] = {
            "arousal": 0.5,  # Mock values
            "valence": 0.5
        }

    return sentiment_results


async def _analyze_topics_multimodal(transcript, media_file, db):
    """Extract topics from transcript"""
    topics = []

    if transcript and transcript.segments:
        # In production, use topic modeling
        # For now, extract mock topics
        text = " ".join([s.get("text", "") for s in transcript.segments])

        # Mock topic extraction
        topics = [
            {"topic": "customer experience", "relevance": 0.8, "count": 5},
            {"topic": "product features", "relevance": 0.6, "count": 3}
        ]

    return topics


async def _analyze_emotions_multimodal(transcript, media_file, db):
    """Analyze emotions from audio and video"""
    emotions = {
        "detected_emotions": [],
        "dominant_emotion": "neutral"
    }

    if media_file:
        # In production, analyze facial expressions from video
        # and voice emotions from audio
        emotions["detected_emotions"] = [
            {"emotion": "happy", "confidence": 0.7, "timestamp": 10.5},
            {"emotion": "surprised", "confidence": 0.5, "timestamp": 25.3}
        ]

    return emotions


async def _analyze_code_mixing(transcript, db):
    """Detect code-mixing in transcript"""
    code_mixing_results = {
        "detected": False,
        "languages": [],
        "mixing_ratio": 0,
        "examples": []
    }

    if transcript and transcript.segments:
        # In production, use language detection model
        # For now, simple heuristic
        for segment in transcript.segments:
            text = segment.get("text", "")
            # Check for mixed scripts or keywords
            if any(word in text.lower() for word in ["lah", "lor", "sia", "bagus", "boleh"]):
                code_mixing_results["detected"] = True
                code_mixing_results["languages"] = ["en", "ms"]
                code_mixing_results["examples"].append(text[:100])

    return code_mixing_results


def _generate_analysis_summary(results: Dict) -> str:
    """Generate summary of analysis results"""
    summary_parts = []

    if "sentiment" in results:
        sentiment = results["sentiment"]["overall"]
        summary_parts.append(f"Overall sentiment is {sentiment}")

    if "topics" in results and results["topics"]:
        top_topic = results["topics"][0]["topic"]
        summary_parts.append(f"Main topic discussed: {top_topic}")

    if "code_mixing" in results and results["code_mixing"]["detected"]:
        languages = ", ".join(results["code_mixing"]["languages"])
        summary_parts.append(f"Code-mixing detected between {languages}")

    return ". ".join(summary_parts) if summary_parts else "Analysis complete"


# ============= Custom Model Training =============

@router.post("/models/train", response_model=CustomModelResponse)
async def train_custom_model(
    request: CustomModelTrainingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Train a custom AI model on organization data.
    Requires enterprise plan.
    """
    # Check if user's org has enterprise plan
    # This is simplified - in production, check actual plan

    # Create model record
    custom_model = CustomAIModel(
        org_id=current_user.org_id,
        model_name=request.model_name,
        model_type=request.model_type,
        base_model=request.base_model,
        supported_languages=request.languages,
        created_by=current_user.id
    )

    db.add(custom_model)
    db.commit()
    db.refresh(custom_model)

    # Queue training job
    # In production, this would trigger actual model training
    background_tasks.add_task(
        train_model_task,
        model_id=custom_model.id,
        dataset=request.training_data,
        hyperparameters=request.hyperparameters
    )

    return CustomModelResponse.from_orm(custom_model)


async def train_model_task(model_id: str, dataset: Dict, hyperparameters: Dict):
    """Background task to train model"""
    # In production, this would:
    # 1. Load dataset from S3
    # 2. Fine-tune model using Hugging Face or similar
    # 3. Evaluate on validation set
    # 4. Save model to S3
    # 5. Update database with results
    pass


@router.get("/models", response_model=List[CustomModelResponse])
async def list_custom_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all custom models for the organization"""
    models = db.query(CustomAIModel).filter(
        CustomAIModel.org_id == current_user.org_id,
        CustomAIModel.is_active == True
    ).all()

    return [CustomModelResponse.from_orm(m) for m in models]


# ============= Processing Status =============

@router.get("/jobs/{job_id}", response_model=MediaProcessingJobResponse)
async def get_processing_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get status of a media processing job"""
    job = db.query(MediaProcessingJob).filter(MediaProcessingJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check access via media file
    media_file = db.query(MediaFile).filter(MediaFile.id == job.media_file_id).first()
    if media_file:
        check_project_access(db, media_file.project_id, current_user)

    return MediaProcessingJobResponse.from_orm(job)