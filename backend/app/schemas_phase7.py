"""
Phase 7: Advanced Visualization Schemas
Pydantic models for API requests and responses
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum


class VisualizationType(str, Enum):
    """Types of visualizations available"""
    WORD_CLOUD = "word_cloud"
    NETWORK_GRAPH = "network_graph"
    HEATMAP = "heatmap"
    TIMELINE = "timeline"
    GEOGRAPHIC = "geographic"
    SENTIMENT_FLOW = "sentiment_flow"
    THEME_RIVER = "theme_river"
    SPEAKER_METRICS = "speaker_metrics"
    CODE_MIXING = "code_mixing"
    ENGAGEMENT = "engagement"


# Word Cloud Schemas
class WordCloudWord(BaseModel):
    """Individual word in word cloud"""
    text: str
    value: float
    sentiment: Optional[float] = Field(None, ge=-1, le=1)
    language: Optional[str]
    tf_idf: Optional[float]


class WordCloudRequest(BaseModel):
    """Request for word cloud generation"""
    language: Optional[str] = None
    max_words: int = Field(100, ge=10, le=500)
    exclude_stopwords: bool = True
    time_range: Optional[str] = None
    theme_id: Optional[str] = None
    refresh_cache: bool = False


class WordCloudResponse(BaseModel):
    """Word cloud visualization response"""
    words: List[WordCloudWord]
    metadata: Dict[str, Any]


# Network Graph Schemas
class NetworkNode(BaseModel):
    """Node in network graph"""
    id: str
    label: str
    size: float
    connections: int
    x: Optional[float] = None
    y: Optional[float] = None
    color: Optional[str] = None
    group: Optional[str] = None


class NetworkEdge(BaseModel):
    """Edge in network graph"""
    source: str
    target: str
    weight: float
    confidence: Optional[float] = Field(None, ge=0, le=1)
    correlation: Optional[float] = Field(None, ge=-1, le=1)


class NetworkGraphRequest(BaseModel):
    """Request for network graph generation"""
    min_cooccurrence: int = Field(2, ge=1)
    max_nodes: int = Field(50, ge=10, le=200)
    layout: str = Field("force", regex="^(force|circular|hierarchical|raw)$")
    confidence_threshold: float = Field(0.5, ge=0, le=1)
    refresh_cache: bool = False


class NetworkGraphResponse(BaseModel):
    """Network graph visualization response"""
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]
    metadata: Dict[str, Any]


# Heatmap Schemas
class HeatmapRequest(BaseModel):
    """Request for heatmap generation"""
    metric: str = "sentiment"
    x_axis: str = "speaker"
    y_axis: str = "theme"
    aggregation: str = Field("mean", regex="^(mean|sum|count|max|min)$")
    normalize: bool = False


class HeatmapResponse(BaseModel):
    """Heatmap visualization response"""
    matrix: List[List[float]]
    x_labels: List[str]
    y_labels: List[str]
    metadata: Dict[str, Any]


# Timeline Schemas
class TimelineDataPoint(BaseModel):
    """Single point in timeline"""
    timestamp: str
    value: float
    count: Optional[int]
    min: Optional[float]
    max: Optional[float]
    avg: Optional[float]
    smoothed: Optional[bool] = False


class TimelineRequest(BaseModel):
    """Request for timeline generation"""
    metrics: List[str] = ["sentiment"]
    period: str = Field("daily", regex="^(hourly|daily|weekly|monthly)$")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    smoothing: Optional[str] = Field(None, regex="^(moving_avg|exponential)$")
    window_size: int = Field(3, ge=1, le=30)


class TimelineResponse(BaseModel):
    """Timeline visualization response"""
    series: Dict[str, List[TimelineDataPoint]]
    timestamps: List[str]
    metadata: Dict[str, Any]


# Geographic Schemas
class GeographicLocation(BaseModel):
    """Geographic location with metrics"""
    country: str
    country_code: str
    region: Optional[str]
    city: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    value: float
    count: int
    metadata: Optional[Dict[str, Any]]


class GeographicBounds(BaseModel):
    """Geographic bounds for map"""
    min_lat: float
    max_lat: float
    min_lng: float
    max_lng: float


class GeographicRequest(BaseModel):
    """Request for geographic visualization"""
    metric: str = "engagement"
    region: str = Field("sea", regex="^(sea|singapore|indonesia|malaysia|thailand|vietnam|philippines)$")
    resolution: str = Field("country", regex="^(country|state|city)$")
    normalize_population: bool = False


class GeographicResponse(BaseModel):
    """Geographic visualization response"""
    locations: List[GeographicLocation]
    bounds: GeographicBounds
    metadata: Dict[str, Any]


# Sentiment Flow Schemas
class SentimentFlowPoint(BaseModel):
    """Point in sentiment flow"""
    position: int
    timestamp: Optional[float]
    sentiment: float = Field(ge=-1, le=1)
    confidence: float = Field(ge=0, le=1)
    speaker: Optional[str]
    emotions: Optional[Dict[str, float]]
    smoothed: Optional[bool] = False


class SentimentFlowRequest(BaseModel):
    """Request for sentiment flow visualization"""
    transcript_id: Optional[str] = None
    resolution: int = Field(100, ge=10, le=1000)
    smoothing: str = Field("moving_avg", regex="^(moving_avg|exponential|none)$")
    window_size: int = Field(5, ge=1, le=50)
    include_emotions: bool = False


class SentimentFlowResponse(BaseModel):
    """Sentiment flow visualization response"""
    flow: List[SentimentFlowPoint]
    speakers: List[str]
    metadata: Dict[str, Any]


# Theme River Schemas
class ThemeRiverRequest(BaseModel):
    """Request for theme river visualization"""
    max_themes: int = Field(10, ge=3, le=30)
    period: str = Field("daily", regex="^(hourly|daily|weekly|monthly)$")
    stacked: bool = True
    normalize: bool = False


class ThemeRiverResponse(BaseModel):
    """Theme river visualization response"""
    themes: List[str]
    timestamps: List[str]
    values: List[List[float]]  # themes x timestamps matrix
    metadata: Dict[str, Any]


# Speaker Metrics Schemas
class SpeakerInfo(BaseModel):
    """Speaker information"""
    id: str
    name: str
    role: Optional[str]
    department: Optional[str]
    age_group: Optional[str]
    gender: Optional[str]
    location: Optional[str]


class SpeakerMetricValue(BaseModel):
    """Metric value for speaker"""
    mean: float
    sum: float
    min: float
    max: float


class SpeakerMetricsRequest(BaseModel):
    """Request for speaker metrics"""
    metrics: List[str] = ["speaking_time", "word_count", "sentiment"]
    group_by: str = Field("speaker", regex="^(speaker|role|department)$")
    include_demographics: bool = False


class SpeakerMetricsResponse(BaseModel):
    """Speaker metrics response"""
    speakers: Union[List[SpeakerInfo], List[str]]  # Depends on group_by
    metrics: Dict[str, Union[Dict[str, float], Dict[str, SpeakerMetricValue]]]
    metadata: Dict[str, Any]


# Custom Visualization Schemas
class CustomVizCreate(BaseModel):
    """Create custom visualization"""
    name: str = Field(..., max_length=255)
    description: Optional[str]
    visualization_type: VisualizationType
    config: Dict[str, Any]
    filters: Optional[Dict[str, Any]]
    is_public: bool = False
    is_template: bool = False


class CustomVizUpdate(BaseModel):
    """Update custom visualization"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str]
    config: Optional[Dict[str, Any]]
    filters: Optional[Dict[str, Any]]
    is_public: Optional[bool]


class CustomVizResponse(BaseModel):
    """Custom visualization response"""
    id: str
    name: str
    description: Optional[str]
    visualization_type: VisualizationType
    config: Dict[str, Any]
    filters: Optional[Dict[str, Any]]
    is_public: bool
    is_template: bool
    view_count: int = 0
    clone_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime]


# Engagement Tracking Schemas
class EngagementTrack(BaseModel):
    """Track user engagement"""
    project_id: str
    action_type: str = Field(..., max_length=50)
    target_type: Optional[str] = Field(None, max_length=50)
    target_id: Optional[str]
    duration_seconds: Optional[int]
    session_id: Optional[str]
    device_type: Optional[str] = Field(None, regex="^(mobile|tablet|desktop)$")
    country: Optional[str] = Field(None, max_length=2)
    load_time_ms: Optional[int]
    render_time_ms: Optional[int]


# Cache Management Schemas
class CacheEntry(BaseModel):
    """Cache entry information"""
    key: str
    visualization_type: VisualizationType
    status: str
    size_bytes: int
    created_at: datetime
    expires_at: datetime
    access_count: int


class CacheStatusResponse(BaseModel):
    """Cache status response"""
    total_entries: int
    fresh_entries: int
    stale_entries: int
    total_size_mb: float
    hit_rate: float
    avg_computation_time_ms: float
    top_accessed: List[CacheEntry]


# Export Schemas
class ExportRequest(BaseModel):
    """Request for visualization export"""
    format: str = Field("json", regex="^(json|csv|png|svg|pdf)$")
    config: Optional[Dict[str, Any]]
    include_metadata: bool = True


class ExportResponse(BaseModel):
    """Export response"""
    format: str
    data: Optional[str]  # Base64 for binary formats
    csv: Optional[str]
    image: Optional[str]  # Base64 encoded
    url: Optional[str]  # Download URL
    metadata: Optional[Dict[str, Any]]


# Aggregation Schemas
class AggregationConfig(BaseModel):
    """Configuration for data aggregation"""
    method: str = Field("mean", regex="^(mean|sum|count|min|max|median)$")
    group_by: List[str]
    filters: Optional[Dict[str, Any]]
    time_bucket: Optional[str]


# Filter Schemas
class VisualizationFilter(BaseModel):
    """Filters for visualization data"""
    date_range: Optional[Dict[str, datetime]]
    speakers: Optional[List[str]]
    themes: Optional[List[str]]
    languages: Optional[List[str]]
    sentiment_range: Optional[Dict[str, float]]
    confidence_threshold: Optional[float] = Field(None, ge=0, le=1)


# Response validators
class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    data: List[Any]
    total: int
    page: int
    page_size: int
    has_more: bool


class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str]
    code: Optional[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Batch Processing Schemas
class BatchVisualizationRequest(BaseModel):
    """Request multiple visualizations in batch"""
    visualizations: List[Dict[str, Any]]
    parallel: bool = True
    cache_results: bool = True


class BatchVisualizationResponse(BaseModel):
    """Batch visualization response"""
    results: List[Dict[str, Any]]
    errors: List[Dict[str, str]]
    processing_time_ms: int


# Real-time Updates Schema
class VisualizationUpdate(BaseModel):
    """Real-time visualization update via WebSocket"""
    project_id: str
    visualization_type: VisualizationType
    action: str = Field(..., regex="^(update|refresh|clear)$")
    data: Optional[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)