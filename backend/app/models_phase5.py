"""
Phase 5: Module D - Clips and Reels
Media clips extraction and reel compilation for evidence presentation
"""

from sqlalchemy import (
    Column, String, Text, JSON, DateTime, Integer, Float,
    ForeignKey, Boolean, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base
from .models import _uid


class Clip(Base):
    """Individual media clips extracted from transcripts"""
    __tablename__ = "clips"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    transcript_id = Column(String(36), ForeignKey("transcripts.id"), nullable=False)

    # Clip details
    name = Column(String(256), nullable=False)
    description = Column(Text)

    # Time boundaries
    start_time = Column(Float, nullable=False)  # Start time in seconds
    end_time = Column(Float, nullable=False)    # End time in seconds
    duration = Column(Float, nullable=False)    # Duration in seconds

    # Associated segments
    segment_ids = Column(JSON, default=list)  # List of TranscriptSegment IDs

    # Media information
    source_media_id = Column(String(36), ForeignKey("media_assets.id"))
    clip_media_id = Column(String(36), ForeignKey("media_assets.id"))  # Generated clip file

    # Metadata
    tags = Column(JSON, default=list)  # List of tags
    theme_ids = Column(JSON, default=list)  # Associated theme IDs

    # Processing status
    status = Column(String(32), default="pending")  # pending, processing, ready, failed
    error_message = Column(Text)

    # Usage tracking
    usage_count = Column(Integer, default=0)
    last_used = Column(DateTime)

    # Creation info
    created_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reel_items = relationship("ReelItem", back_populates="clip", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_clip_project', 'project_id'),
        Index('idx_clip_transcript', 'transcript_id'),
        Index('idx_clip_status', 'status'),
        Index('idx_clip_created', 'created_at'),
    )


class Reel(Base):
    """Collection of clips assembled into a presentation reel"""
    __tablename__ = "reels"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    # Reel details
    name = Column(String(256), nullable=False)
    description = Column(Text)
    purpose = Column(String(64))  # highlight, evidence, presentation, social

    # Configuration
    transition_style = Column(String(32), default="fade")  # fade, cut, dissolve
    transition_duration = Column(Float, default=0.5)  # seconds

    # Branding
    intro_text = Column(Text)
    outro_text = Column(Text)
    watermark = Column(Boolean, default=False)

    # Output settings
    resolution = Column(String(32), default="1080p")  # 720p, 1080p, 4k
    aspect_ratio = Column(String(32), default="16:9")  # 16:9, 9:16, 1:1
    format = Column(String(32), default="mp4")  # mp4, webm, mov

    # Generated reel
    reel_media_id = Column(String(36), ForeignKey("media_assets.id"))
    total_duration = Column(Float)  # Total duration in seconds

    # Status
    status = Column(String(32), default="draft")  # draft, processing, ready, failed
    error_message = Column(Text)

    # Sharing
    is_public = Column(Boolean, default=False)
    share_token = Column(String(64))
    share_expires = Column(DateTime)
    view_count = Column(Integer, default=0)

    # Creation info
    created_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)

    # Relationships
    items = relationship("ReelItem", back_populates="reel", cascade="all, delete-orphan", order_by="ReelItem.position")

    __table_args__ = (
        Index('idx_reel_project', 'project_id'),
        Index('idx_reel_status', 'status'),
        Index('idx_reel_created', 'created_at'),
        Index('idx_reel_share_token', 'share_token'),
    )


class ReelItem(Base):
    """Individual items (clips) in a reel with ordering"""
    __tablename__ = "reel_items"

    id = Column(String(36), primary_key=True, default=_uid)
    reel_id = Column(String(36), ForeignKey("reels.id"), nullable=False)
    clip_id = Column(String(36), ForeignKey("clips.id"), nullable=False)

    # Ordering
    position = Column(Integer, nullable=False)  # Order in the reel

    # Customization per clip
    title_overlay = Column(Text)  # Text to overlay on this clip
    subtitle_overlay = Column(Text)  # Subtitle text

    # Timing adjustments
    trim_start = Column(Float, default=0)  # Additional trim from clip start (seconds)
    trim_end = Column(Float, default=0)    # Additional trim from clip end (seconds)
    playback_speed = Column(Float, default=1.0)  # Speed multiplier

    # Transitions
    transition_in = Column(String(32))   # Override reel default
    transition_out = Column(String(32))  # Override reel default

    # Annotations
    annotations = Column(JSON, default=list)  # List of text/graphic annotations

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    reel = relationship("Reel", back_populates="items")
    clip = relationship("Clip", back_populates="reel_items")

    __table_args__ = (
        UniqueConstraint('reel_id', 'position', name='uq_reel_item_position'),
        Index('idx_reel_item_reel', 'reel_id'),
        Index('idx_reel_item_clip', 'clip_id'),
    )


class ClipTemplate(Base):
    """Reusable templates for clip creation"""
    __tablename__ = "clip_templates"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)

    # Template details
    name = Column(String(256), nullable=False)
    description = Column(Text)
    category = Column(String(64))  # quote, evidence, highlight, comparison

    # Selection criteria
    criteria = Column(JSON)  # Rules for automatic clip selection

    # Clip settings
    max_duration = Column(Float, default=30.0)  # Maximum clip duration
    include_context_before = Column(Float, default=2.0)  # Seconds before segment
    include_context_after = Column(Float, default=2.0)   # Seconds after segment

    # Style settings
    title_template = Column(Text)
    subtitle_template = Column(Text)
    overlay_style = Column(JSON)  # CSS-like styling for overlays

    # Usage
    is_public = Column(Boolean, default=False)  # Available to all org users
    usage_count = Column(Integer, default=0)

    created_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_clip_template_org', 'org_id'),
        Index('idx_clip_template_category', 'category'),
    )


class MediaProcessingJob(Base):
    """Track async media processing jobs for clips and reels"""
    __tablename__ = "media_processing_jobs"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)

    # Job details
    job_type = Column(String(32), nullable=False)  # clip_extraction, reel_compilation
    target_type = Column(String(32), nullable=False)  # clip, reel
    target_id = Column(String(36), nullable=False)

    # Processing
    celery_task_id = Column(String(128))
    status = Column(String(32), default="pending")  # pending, processing, completed, failed
    progress = Column(Integer, default=0)  # 0-100

    # Results
    result = Column(JSON)
    error_message = Column(Text)
    error_details = Column(JSON)

    # Timing
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    duration_seconds = Column(Float)

    # Resources
    input_size_mb = Column(Float)
    output_size_mb = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(36), ForeignKey("users.id"))

    __table_args__ = (
        Index('idx_media_job_target', 'target_type', 'target_id'),
        Index('idx_media_job_status', 'status'),
        Index('idx_media_job_created', 'created_at'),
    )


class ShareLink(Base):
    """Shareable links for clips and reels"""
    __tablename__ = "share_links"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)

    # Target
    target_type = Column(String(32), nullable=False)  # clip, reel
    target_id = Column(String(36), nullable=False)

    # Share settings
    token = Column(String(64), nullable=False, unique=True)
    title = Column(String(256))
    description = Column(Text)

    # Access control
    password = Column(String(256))  # Optional password protection
    allow_download = Column(Boolean, default=False)
    require_email = Column(Boolean, default=False)  # Collect viewer email

    # Expiry
    expires_at = Column(DateTime)
    max_views = Column(Integer)  # Maximum number of views

    # Tracking
    view_count = Column(Integer, default=0)
    unique_viewers = Column(Integer, default=0)
    last_viewed = Column(DateTime)
    viewer_emails = Column(JSON, default=list)  # If require_email=True

    # Analytics
    view_analytics = Column(JSON, default=dict)  # Detailed view analytics

    created_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_share_link_token', 'token'),
        Index('idx_share_link_target', 'target_type', 'target_id'),
        Index('idx_share_link_expires', 'expires_at'),
    )