"""
Phase 6 Pydantic Schemas for API Validation
Media Processing and AI Enhancement Features
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ============= Enums =============

class MediaProcessingStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ModelTypeEnum(str, Enum):
    CLASSIFIER = "classifier"
    NER = "ner"
    SENTIMENT = "sentiment"
    TOPIC = "topic"
    SUMMARIZATION = "summarization"
    CODE_MIXING = "code_mixing"
    CUSTOM = "custom"


class MediaQualityEnum(str, Enum):
    ORIGINAL = "original"
    HIGH = "1080p"
    MEDIUM = "720p"
    LOW = "480p"
    MOBILE = "360p"


# ============= Media File Schemas =============

class MediaFileBase(BaseModel):
    original_filename: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None


class MediaFileCreate(MediaFileBase):
    project_id: str


class MediaFileResponse(MediaFileBase):
    id: str
    project_id: str
    transcript_id: Optional[str] = None
    processing_status: MediaProcessingStatusEnum
    duration: Optional[float] = None
    video_resolution: Optional[str] = None
    audio_sample_rate: Optional[int] = None
    waveform_data_url: Optional[str] = None
    vtt_file_path: Optional[str] = None
    detected_languages: List[str] = []
    has_code_mixing: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Waveform Schemas =============

class WaveformPeak(BaseModel):
    min: float = Field(..., ge=-1, le=1)
    max: float = Field(..., ge=-1, le=1)


class WaveformDataResponse(BaseModel):
    peaks: List[WaveformPeak]
    duration: float
    sample_rate: int
    resolution: int
    normalized: bool = True
    generated_at: str
    version: str


class WaveformSegment(BaseModel):
    start: float
    end: float
    activity_level: str  # silent, low, medium, high
    amplitude: float


# ============= Video Sync Schemas =============

class TimelineEntry(BaseModel):
    id: str
    start: float
    end: float
    text: str
    speaker: Optional[str] = None
    sentiment: Optional[str] = None
    sentiment_score: Optional[float] = None
    language: Optional[str] = None
    languages: Optional[List[str]] = None
    confidence: Optional[float] = None
    important: Optional[bool] = None
    words: Optional[List[Dict]] = None


class Chapter(BaseModel):
    start: float
    end: float
    title: str
    summary: str
    speaker: str


class Speaker(BaseModel):
    id: str
    name: str
    segment_count: int
    total_duration: float
    first_appearance: float


class VideoSyncResponse(BaseModel):
    timeline: List[TimelineEntry]
    chapters: List[Chapter]
    speakers: List[Speaker]
    vtt_content: str
    srt_content: str
    vtt_path: Optional[str] = None
    srt_path: Optional[str] = None
    timeline_path: Optional[str] = None
    has_code_mixing: bool
    language: str


# ============= Video Highlights Schemas =============

class VideoHighlightBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: float = Field(..., ge=0)
    end_time: float = Field(..., ge=0)
    importance_score: float = Field(0.5, ge=0, le=1)
    tags: List[str] = []
    category: Optional[str] = None
    sentiment: Optional[str] = None

    @validator('end_time')
    def validate_end_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be greater than start_time')
        return v


class VideoHighlightCreate(VideoHighlightBase):
    media_file_id: str


class VideoHighlightResponse(VideoHighlightBase):
    id: str
    media_file_id: str
    project_id: str
    duration: float
    transcript_text: Optional[str] = None
    auto_detected: bool
    detection_method: Optional[str] = None
    clip_file_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Highlight Reel Schemas =============

class HighlightReelCreate(BaseModel):
    project_id: str
    title: str
    description: Optional[str] = None
    highlight_ids: List[str]
    transition_type: str = "crossfade"
    transition_duration: float = Field(0.5, ge=0, le=2)
    include_captions: bool = True
    include_speaker_labels: bool = True
    export_quality: MediaQualityEnum = MediaQualityEnum.HIGH
    export_format: str = "mp4"


class HighlightReelResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    highlight_ids: List[str]
    total_duration: Optional[float] = None
    reel_file_path: Optional[str] = None
    generation_status: MediaProcessingStatusEnum
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Media Processing Job Schemas =============

class MediaProcessingJobResponse(BaseModel):
    id: str
    media_file_id: str
    job_type: str
    status: MediaProcessingStatusEnum
    progress_percentage: float
    current_step: Optional[str] = None
    total_steps: Optional[int] = None
    error_message: Optional[str] = None
    processing_time_seconds: Optional[float] = None
    estimated_cost_usd: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= Multimodal Analysis Schemas =============

class MultimodalAnalysisRequest(BaseModel):
    project_id: str
    transcript_id: Optional[str] = None
    media_file_id: Optional[str] = None
    analysis_types: List[str] = ["sentiment", "topics"]
    use_audio: bool = False
    use_video: bool = False
    model_id: Optional[str] = None
    custom_model_id: Optional[str] = None


class SentimentResult(BaseModel):
    overall: str
    scores: Dict[str, float]
    timeline: List[Dict[str, Any]]
    audio_emotion: Optional[Dict[str, float]] = None


class TopicResult(BaseModel):
    topic: str
    relevance: float
    count: int


class EmotionResult(BaseModel):
    detected_emotions: List[Dict[str, Any]]
    dominant_emotion: str


class CodeMixingResult(BaseModel):
    detected: bool
    languages: List[str]
    mixing_ratio: float
    examples: List[str]


class MultimodalAnalysisResponse(BaseModel):
    analysis_id: str
    results: Dict[str, Any]
    confidence_scores: Dict[str, float]
    summary: str
    created_at: datetime


# ============= Custom Model Schemas =============

class CustomModelTrainingRequest(BaseModel):
    model_name: str
    model_type: ModelTypeEnum
    base_model: str = "bert-base-uncased"
    languages: List[str] = ["en"]
    training_data: Dict[str, Any]  # Dataset configuration
    hyperparameters: Dict[str, Any] = {}


class CustomModelResponse(BaseModel):
    id: str
    org_id: str
    model_name: str
    model_type: ModelTypeEnum
    base_model: Optional[str] = None
    model_version: str
    supported_languages: List[str]
    handles_code_mixing: bool
    validation_accuracy: Optional[float] = None
    validation_f1_score: Optional[float] = None
    is_deployed: bool
    deployment_endpoint: Optional[str] = None
    training_cost_usd: float
    inference_cost_per_1k: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============= AI Analysis Result Schemas =============

class AIAnalysisResultResponse(BaseModel):
    id: str
    project_id: str
    transcript_id: Optional[str] = None
    media_file_id: Optional[str] = None
    analysis_type: str
    model_used: str
    results: Dict[str, Any]
    confidence_scores: Optional[Dict[str, float]] = None
    summary: Optional[str] = None
    key_findings: List[str] = []
    recommendations: List[str] = []
    processing_time_seconds: Optional[float] = None
    cost_usd: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Batch Processing Schemas =============

class BatchProcessingRequest(BaseModel):
    media_ids: List[str]
    operations: List[str]  # waveform, transcript, sync, highlights
    priority: int = Field(5, ge=1, le=10)


class BatchProcessingResponse(BaseModel):
    job_ids: List[str]
    total_jobs: int
    estimated_completion_time: datetime
    status: str