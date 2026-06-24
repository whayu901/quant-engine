"""
Phase 6 Database Models for Qual Engine
Media Processing and AI Enhancement Features
"""

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, JSON,
    ForeignKey, DateTime, Enum, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database import Base


def _uid():
    """Generate UUID for primary keys"""
    return str(uuid.uuid4())


class MediaProcessingStatus(str, enum.Enum):
    """Status for media processing jobs"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ModelType(str, enum.Enum):
    """Types of AI models"""
    CLASSIFIER = "classifier"
    NER = "ner"
    SENTIMENT = "sentiment"
    TOPIC = "topic"
    SUMMARIZATION = "summarization"
    CODE_MIXING = "code_mixing"
    CUSTOM = "custom"


class MediaQuality(str, enum.Enum):
    """Media quality levels"""
    ORIGINAL = "original"
    HIGH = "1080p"
    MEDIUM = "720p"
    LOW = "480p"
    MOBILE = "360p"


# ============= Media Processing Models =============

class MediaFile(Base):
    """Store media file information and processing status"""
    __tablename__ = "media_files"

    id = Column(String(36), primary_key=True, default=_uid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    transcript_id = Column(String(36), ForeignKey("transcripts.id", ondelete="SET NULL"))

    # File information
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(10))  # mp4, mp3, wav, etc.
    file_size = Column(Integer)  # in bytes
    duration = Column(Float)  # in seconds

    # Storage paths
    original_path = Column(String(500))  # S3 or local path
    processed_paths = Column(JSON, default={})  # {"720p": "path", "480p": "path"}
    audio_path = Column(String(500))
    thumbnail_path = Column(String(500))
    waveform_path = Column(String(500))

    # Video metadata
    video_codec = Column(String(50))
    video_bitrate = Column(Integer)
    video_resolution = Column(String(20))  # "1920x1080"
    video_fps = Column(Float)

    # Audio metadata
    audio_codec = Column(String(50))
    audio_sample_rate = Column(Integer)
    audio_channels = Column(Integer)
    audio_bitrate = Column(Integer)

    # Processing status
    processing_status = Column(Enum(MediaProcessingStatus), default=MediaProcessingStatus.PENDING)
    processing_started_at = Column(DateTime)
    processing_completed_at = Column(DateTime)
    processing_error = Column(Text)

    # Waveform data
    waveform_data_url = Column(String(500))
    waveform_resolution = Column(Integer, default=1000)
    waveform_generated_at = Column(DateTime)

    # Transcript sync
    vtt_file_path = Column(String(500))
    srt_file_path = Column(String(500))
    timeline_json_path = Column(String(500))
    chapters_generated = Column(Boolean, default=False)

    # Quality metrics
    video_quality_score = Column(Float)  # 0-1 scale
    audio_quality_score = Column(Float)  # 0-1 scale

    # SEA-specific
    detected_languages = Column(JSON, default=[])  # ["en", "id", "ms"]
    has_code_mixing = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="media_files")
    transcript = relationship("Transcript", back_populates="media_file")
    processing_jobs = relationship("MediaProcessingJob", back_populates="media_file")
    highlights = relationship("VideoHighlight", back_populates="media_file")

    # Indexes
    __table_args__ = (
        Index('idx_media_project', 'project_id'),
        Index('idx_media_status', 'processing_status'),
        Index('idx_media_created', 'created_at'),
    )


class MediaProcessingJob(Base):
    """Track individual media processing tasks"""
    __tablename__ = "media_processing_jobs"

    id = Column(String(36), primary_key=True, default=_uid)
    media_file_id = Column(String(36), ForeignKey("media_files.id", ondelete="CASCADE"), nullable=False)

    # Job details
    job_type = Column(String(50), nullable=False)  # transcription, waveform, thumbnail, etc.
    celery_task_id = Column(String(255))
    priority = Column(Integer, default=5)  # 1-10, higher is more important

    # Status
    status = Column(Enum(MediaProcessingStatus), default=MediaProcessingStatus.PENDING)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)

    # Progress tracking
    progress_percentage = Column(Float, default=0)
    current_step = Column(String(100))
    total_steps = Column(Integer)

    # Results
    result_data = Column(JSON)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)

    # Performance metrics
    processing_time_seconds = Column(Float)
    cpu_usage_percent = Column(Float)
    memory_usage_mb = Column(Float)

    # Cost tracking
    api_calls_made = Column(Integer, default=0)
    estimated_cost_usd = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    media_file = relationship("MediaFile", back_populates="processing_jobs")


class VideoHighlight(Base):
    """Store video highlight clips and reels"""
    __tablename__ = "video_highlights"

    id = Column(String(36), primary_key=True, default=_uid)
    media_file_id = Column(String(36), ForeignKey("media_files.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    # Highlight details
    title = Column(String(255))
    description = Column(Text)

    # Time boundaries
    start_time = Column(Float, nullable=False)  # in seconds
    end_time = Column(Float, nullable=False)
    duration = Column(Float)

    # Associated transcript
    transcript_segment_ids = Column(JSON, default=[])  # List of segment IDs
    transcript_text = Column(Text)

    # Importance scoring
    importance_score = Column(Float, default=0.5)  # 0-1 scale
    auto_detected = Column(Boolean, default=False)
    detection_method = Column(String(50))  # sentiment, keyword, ai, manual

    # Tags and categorization
    tags = Column(JSON, default=[])
    category = Column(String(50))
    sentiment = Column(String(20))  # positive, negative, neutral

    # Output file
    clip_file_path = Column(String(500))
    thumbnail_path = Column(String(500))

    # Analytics
    view_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)

    created_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    media_file = relationship("MediaFile", back_populates="highlights")
    project = relationship("Project")
    creator = relationship("User")


class HighlightReel(Base):
    """Compilation of multiple highlights into a reel"""
    __tablename__ = "highlight_reels"

    id = Column(String(36), primary_key=True, default=_uid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    # Reel details
    title = Column(String(255), nullable=False)
    description = Column(Text)

    # Included highlights (ordered)
    highlight_ids = Column(JSON, default=[])  # Ordered list of VideoHighlight IDs

    # Reel settings
    transition_type = Column(String(50), default="crossfade")
    transition_duration = Column(Float, default=0.5)  # seconds
    include_captions = Column(Boolean, default=True)
    include_speaker_labels = Column(Boolean, default=True)

    # Output
    reel_file_path = Column(String(500))
    total_duration = Column(Float)
    thumbnail_path = Column(String(500))

    # Branding
    logo_path = Column(String(500))
    intro_text = Column(Text)
    outro_text = Column(Text)

    # Export settings
    export_quality = Column(Enum(MediaQuality), default=MediaQuality.HIGH)
    export_format = Column(String(10), default="mp4")

    # Status
    generation_status = Column(Enum(MediaProcessingStatus), default=MediaProcessingStatus.PENDING)

    created_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project")
    creator = relationship("User")


# ============= AI Model Management =============

class CustomAIModel(Base):
    """Store custom AI models trained on organization data"""
    __tablename__ = "custom_ai_models"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)

    # Model metadata
    model_name = Column(String(100), nullable=False)
    model_type = Column(Enum(ModelType), nullable=False)
    base_model = Column(String(100))  # e.g., "bert-base-uncased", "xlm-roberta"
    framework = Column(String(20))  # huggingface, openai, anthropic, tensorflow

    # Training data
    training_dataset_id = Column(String(36))
    training_samples = Column(Integer, default=0)
    validation_samples = Column(Integer, default=0)
    test_samples = Column(Integer, default=0)

    # Model performance
    validation_accuracy = Column(Float)
    validation_f1_score = Column(Float)
    validation_precision = Column(Float)
    validation_recall = Column(Float)
    confusion_matrix = Column(JSON)

    # Model storage
    model_storage_path = Column(String(500))  # S3 or local path
    model_size_mb = Column(Float)
    model_version = Column(String(20), default="1.0.0")
    model_checksum = Column(String(64))  # SHA256 hash

    # Inference performance
    inference_time_ms = Column(Float)
    throughput_samples_per_sec = Column(Float)

    # SEA-specific capabilities
    supported_languages = Column(JSON, default=["en"])
    handles_code_mixing = Column(Boolean, default=False)
    dialect_support = Column(JSON, default=[])  # ["sg-en", "my-en", etc.]

    # Training configuration
    hyperparameters = Column(JSON)
    training_duration_hours = Column(Float)
    epochs_trained = Column(Integer)
    best_epoch = Column(Integer)

    # Cost tracking
    training_cost_usd = Column(Float, default=0.0)
    inference_cost_per_1k = Column(Float, default=0.0)
    storage_cost_monthly = Column(Float, default=0.0)

    # Deployment
    is_deployed = Column(Boolean, default=False)
    deployment_endpoint = Column(String(500))
    deployment_region = Column(String(50))  # ap-southeast-1, etc.

    # Usage tracking
    total_predictions = Column(Integer, default=0)
    last_used_at = Column(DateTime)

    # Versioning
    is_active = Column(Boolean, default=True)
    deprecated_at = Column(DateTime)
    replacement_model_id = Column(String(36))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(36), ForeignKey("users.id"))

    # Relationships
    organization = relationship("Org", back_populates="custom_models")
    creator = relationship("User")
    training_jobs = relationship("ModelTrainingJob", back_populates="model")

    # Indexes and constraints
    __table_args__ = (
        UniqueConstraint('org_id', 'model_name', 'model_version', name='uq_org_model_version'),
        Index('idx_model_org', 'org_id'),
        Index('idx_model_type', 'model_type'),
        Index('idx_model_active', 'is_active'),
    )


class ModelTrainingJob(Base):
    """Track model training jobs"""
    __tablename__ = "model_training_jobs"

    id = Column(String(36), primary_key=True, default=_uid)
    model_id = Column(String(36), ForeignKey("custom_ai_models.id", ondelete="CASCADE"))
    org_id = Column(String(36), ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)

    # Job configuration
    job_type = Column(String(50))  # train, fine_tune, evaluate
    experiment_name = Column(String(100))
    mlflow_run_id = Column(String(100))

    # Dataset
    dataset_path = Column(String(500))
    dataset_size = Column(Integer)
    class_distribution = Column(JSON)

    # Status
    status = Column(Enum(MediaProcessingStatus), default=MediaProcessingStatus.PENDING)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)

    # Progress
    current_epoch = Column(Integer, default=0)
    total_epochs = Column(Integer)
    training_loss = Column(Float)
    validation_loss = Column(Float)

    # Resources
    gpu_type = Column(String(50))  # T4, V100, A100, etc.
    gpu_count = Column(Integer, default=1)
    memory_usage_gb = Column(Float)

    # Results
    final_metrics = Column(JSON)
    model_artifacts_path = Column(String(500))
    logs_path = Column(String(500))

    # Error handling
    error_message = Column(Text)
    error_traceback = Column(Text)

    # Cost
    compute_cost_usd = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    model = relationship("CustomAIModel", back_populates="training_jobs")
    organization = relationship("Org")


class AIAnalysisResult(Base):
    """Store results from AI analysis (multi-modal, custom models)"""
    __tablename__ = "ai_analysis_results"

    id = Column(String(36), primary_key=True, default=_uid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    transcript_id = Column(String(36), ForeignKey("transcripts.id", ondelete="CASCADE"))
    media_file_id = Column(String(36), ForeignKey("media_files.id", ondelete="CASCADE"))

    # Analysis type
    analysis_type = Column(String(50))  # sentiment, topics, emotions, code_mixing, custom
    model_used = Column(String(100))  # Model name or ID
    custom_model_id = Column(String(36), ForeignKey("custom_ai_models.id"))

    # Multi-modal flags
    used_text = Column(Boolean, default=True)
    used_audio = Column(Boolean, default=False)
    used_video = Column(Boolean, default=False)

    # Results
    results = Column(JSON)  # Flexible structure for different analysis types
    confidence_scores = Column(JSON)

    # Segment-level results
    segment_results = Column(JSON)  # Array of per-segment analysis

    # Aggregated insights
    summary = Column(Text)
    key_findings = Column(JSON, default=[])
    recommendations = Column(JSON, default=[])

    # Visualizations
    visualization_data = Column(JSON)  # Data for charts/graphs
    visualization_type = Column(String(50))  # line_chart, bar_chart, word_cloud, etc.

    # Processing metadata
    processing_time_seconds = Column(Float)
    tokens_used = Column(Integer)
    api_calls_made = Column(Integer)
    cost_usd = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(36), ForeignKey("users.id"))

    # Relationships
    project = relationship("Project")
    transcript = relationship("Transcript")
    media_file = relationship("MediaFile")
    custom_model = relationship("CustomAIModel")
    creator = relationship("User")

    # Indexes
    __table_args__ = (
        Index('idx_ai_analysis_project', 'project_id'),
        Index('idx_ai_analysis_type', 'analysis_type'),
        Index('idx_ai_analysis_created', 'created_at'),
    )


# ============= Update existing models with Phase 6 relationships =============

# Add these imports at the top of your main models file
# from app.models_phase6 import MediaFile, CustomAIModel

# Then add these relationships to existing models:

# In Project model:
# media_files = relationship("MediaFile", back_populates="project")

# In Transcript model:
# media_file = relationship("MediaFile", back_populates="transcript", uselist=False)

# In Org model:
# custom_models = relationship("CustomAIModel", back_populates="organization")