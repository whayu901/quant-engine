"""
Phase 5: Pydantic schemas for Clips and Reels
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime


# Clip schemas
class ClipCreate(BaseModel):
    transcript_id: str
    name: str
    description: Optional[str] = None
    start_time: float = Field(..., ge=0, description="Start time in seconds")
    end_time: float = Field(..., ge=0, description="End time in seconds")
    segment_ids: List[str] = []
    tags: Optional[List[str]] = []
    theme_ids: Optional[List[str]] = []

    @validator('end_time')
    def validate_times(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be greater than start_time')
        return v


class ClipUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    theme_ids: Optional[List[str]] = None


class ClipResponse(BaseModel):
    id: str
    org_id: str
    project_id: str
    transcript_id: str
    name: str
    description: Optional[str]
    start_time: float
    end_time: float
    duration: float
    segment_ids: List[str]
    source_media_id: Optional[str]
    clip_media_id: Optional[str]
    tags: List[str]
    theme_ids: List[str]
    status: str
    error_message: Optional[str]
    usage_count: int
    last_used: Optional[datetime]
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Reel schemas
class ReelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    purpose: Optional[str] = Field(None, pattern="^(highlight|evidence|presentation|social)$")
    transition_style: Optional[str] = Field("fade", pattern="^(fade|cut|dissolve)$")
    transition_duration: Optional[float] = Field(0.5, ge=0, le=5)
    intro_text: Optional[str] = None
    outro_text: Optional[str] = None
    watermark: Optional[bool] = False
    resolution: Optional[str] = Field("1080p", pattern="^(720p|1080p|4k)$")
    aspect_ratio: Optional[str] = Field("16:9", pattern="^(16:9|9:16|1:1|4:3)$")
    format: Optional[str] = Field("mp4", pattern="^(mp4|webm|mov)$")


class ReelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    purpose: Optional[str] = None
    transition_style: Optional[str] = None
    transition_duration: Optional[float] = None
    intro_text: Optional[str] = None
    outro_text: Optional[str] = None
    watermark: Optional[bool] = None
    resolution: Optional[str] = None
    aspect_ratio: Optional[str] = None
    format: Optional[str] = None


class ReelResponse(BaseModel):
    id: str
    org_id: str
    project_id: str
    name: str
    description: Optional[str]
    purpose: Optional[str]
    transition_style: str
    transition_duration: float
    intro_text: Optional[str]
    outro_text: Optional[str]
    watermark: bool
    resolution: str
    aspect_ratio: str
    format: str
    reel_media_id: Optional[str]
    total_duration: Optional[float]
    status: str
    error_message: Optional[str]
    is_public: bool
    share_token: Optional[str]
    share_expires: Optional[datetime]
    view_count: int
    created_by: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
    items: List['ReelItemResponse'] = []

    class Config:
        orm_mode = True


# Reel Item schemas
class ReelItemCreate(BaseModel):
    clip_id: str
    position: Optional[int] = None
    title_overlay: Optional[str] = None
    subtitle_overlay: Optional[str] = None
    trim_start: Optional[float] = Field(0, ge=0)
    trim_end: Optional[float] = Field(0, ge=0)
    playback_speed: Optional[float] = Field(1.0, ge=0.25, le=4.0)
    transition_in: Optional[str] = None
    transition_out: Optional[str] = None
    annotations: Optional[List[Dict[str, Any]]] = []


class ReelItemResponse(BaseModel):
    id: str
    reel_id: str
    clip_id: str
    position: int
    title_overlay: Optional[str]
    subtitle_overlay: Optional[str]
    trim_start: float
    trim_end: float
    playback_speed: float
    transition_in: Optional[str]
    transition_out: Optional[str]
    annotations: List[Dict[str, Any]]
    created_at: datetime
    clip: Optional[ClipResponse] = None

    class Config:
        orm_mode = True


# Template schemas
class ClipTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = None
    max_duration: Optional[float] = Field(30.0, ge=1, le=300)
    include_context_before: Optional[float] = Field(2.0, ge=0, le=30)
    include_context_after: Optional[float] = Field(2.0, ge=0, le=30)
    title_template: Optional[str] = None
    subtitle_template: Optional[str] = None
    overlay_style: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = False


class ClipTemplateResponse(BaseModel):
    id: str
    org_id: str
    name: str
    description: Optional[str]
    category: Optional[str]
    criteria: Optional[Dict[str, Any]]
    max_duration: float
    include_context_before: float
    include_context_after: float
    title_template: Optional[str]
    subtitle_template: Optional[str]
    overlay_style: Optional[Dict[str, Any]]
    is_public: bool
    usage_count: int
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Share schemas
class ShareLinkCreate(BaseModel):
    target_type: str = Field(..., pattern="^(clip|reel)$")
    target_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    password: Optional[str] = None
    allow_download: Optional[bool] = False
    require_email: Optional[bool] = False
    expires_at: Optional[datetime] = None
    max_views: Optional[int] = Field(None, ge=1)


class ShareLinkResponse(BaseModel):
    id: str
    org_id: str
    target_type: str
    target_id: str
    token: str
    title: Optional[str]
    description: Optional[str]
    allow_download: bool
    require_email: bool
    expires_at: Optional[datetime]
    max_views: Optional[int]
    view_count: int
    unique_viewers: int
    last_viewed: Optional[datetime]
    created_by: str
    created_at: datetime
    updated_at: datetime
    url: Optional[str] = None  # Generated URL

    class Config:
        orm_mode = True


# Media processing schemas
class MediaJobResponse(BaseModel):
    id: str
    org_id: str
    job_type: str
    target_type: str
    target_id: str
    celery_task_id: Optional[str]
    status: str
    progress: int
    result: Optional[Dict[str, Any]]
    error_message: Optional[str]
    error_details: Optional[Dict[str, Any]]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    duration_seconds: Optional[float]
    input_size_mb: Optional[float]
    output_size_mb: Optional[float]
    created_at: datetime
    created_by: str

    class Config:
        orm_mode = True


# Forward references update
ReelResponse.update_forward_refs()