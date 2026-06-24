"""
Phase 7: Advanced Visualization Models
Database models for visualization, caching, and analytics
"""

from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey,
    JSON, Enum as SQLEnum, Index, UniqueConstraint, CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from datetime import datetime
import enum
from .database import Base


class VisualizationType(enum.Enum):
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


class AggregationPeriod(enum.Enum):
    """Time periods for aggregation"""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class CacheStatus(enum.Enum):
    """Cache entry status"""
    FRESH = "fresh"
    STALE = "stale"
    REBUILDING = "rebuilding"
    ERROR = "error"


class ProjectVisualizationCache(Base):
    """
    Pre-computed visualization data for projects
    Reduces computation for complex visualizations
    """
    __tablename__ = "project_visualization_cache"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    visualization_type = Column(SQLEnum(VisualizationType), nullable=False)

    # Cache metadata
    cache_key = Column(String(255), nullable=False)  # Unique key for this visualization
    cache_status = Column(SQLEnum(CacheStatus), default=CacheStatus.FRESH, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)  # TTL for this cache
    last_accessed = Column(DateTime, default=datetime.utcnow)
    access_count = Column(Integer, default=0)

    # Cached data
    data = Column(JSONB, nullable=False)  # The actual visualization data
    metadata = Column(JSONB)  # Additional metadata (computation time, data points, etc.)

    # Performance metrics
    computation_time_ms = Column(Integer)  # Time taken to generate
    data_size_bytes = Column(Integer)  # Size of cached data

    # Relationships
    project = relationship("Project", back_populates="visualization_caches")

    # Indexes
    __table_args__ = (
        UniqueConstraint('project_id', 'visualization_type', 'cache_key', name='uq_project_viz_cache'),
        Index('idx_viz_cache_project', 'project_id'),
        Index('idx_viz_cache_type', 'visualization_type'),
        Index('idx_viz_cache_status', 'cache_status'),
        Index('idx_viz_cache_expires', 'expires_at'),
    )


class ThemeCooccurrence(Base):
    """
    Theme co-occurrence matrix for network graphs
    Pre-computed relationships between themes
    """
    __tablename__ = "theme_cooccurrences"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    # Theme relationships
    theme_a_id = Column(String(36), nullable=False)  # Reference to theme/code
    theme_b_id = Column(String(36), nullable=False)
    theme_a_name = Column(String(255), nullable=False)  # Denormalized for performance
    theme_b_name = Column(String(255), nullable=False)

    # Metrics
    cooccurrence_count = Column(Integer, default=0, nullable=False)
    confidence_score = Column(Float)  # 0.0 to 1.0
    lift_score = Column(Float)  # Association rule mining metric
    correlation = Column(Float)  # -1 to 1

    # Context
    transcript_ids = Column(ARRAY(String))  # Which transcripts contain both
    segment_ids = Column(ARRAY(String))  # Which segments contain both

    # Temporal data
    first_occurrence = Column(DateTime)
    last_occurrence = Column(DateTime)

    # Language-specific (for SEA markets)
    language = Column(String(10))  # en, id, ms, th, vi, tl
    is_code_mixed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project")

    __table_args__ = (
        UniqueConstraint('project_id', 'theme_a_id', 'theme_b_id', name='uq_theme_pair'),
        Index('idx_cooccur_project', 'project_id'),
        Index('idx_cooccur_count', 'cooccurrence_count'),
        Index('idx_cooccur_confidence', 'confidence_score'),
        CheckConstraint('theme_a_id < theme_b_id', name='check_theme_order'),  # Prevent duplicates
    )


class TimeSeriesMetric(Base):
    """
    Time series data for temporal visualizations
    Stores aggregated metrics over time periods
    """
    __tablename__ = "timeseries_metrics"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    # Temporal information
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    period_type = Column(SQLEnum(AggregationPeriod), nullable=False)

    # Metric identification
    metric_name = Column(String(100), nullable=False)  # sentiment, engagement, themes, etc.
    metric_category = Column(String(50))  # classification of metric type

    # Values
    value = Column(Float, nullable=False)
    count = Column(Integer, default=1)  # Number of data points in this period

    # Statistical measures
    min_value = Column(Float)
    max_value = Column(Float)
    avg_value = Column(Float)
    std_dev = Column(Float)
    percentile_25 = Column(Float)
    percentile_50 = Column(Float)  # Median
    percentile_75 = Column(Float)

    # Breakdown data
    breakdown = Column(JSONB)  # Detailed breakdown by category, speaker, etc.

    # SEA-specific
    language = Column(String(10))
    region = Column(String(50))  # Singapore, Indonesia, Malaysia, etc.

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project")

    __table_args__ = (
        UniqueConstraint('project_id', 'metric_name', 'period_start', 'period_type',
                        name='uq_timeseries_metric'),
        Index('idx_ts_project', 'project_id'),
        Index('idx_ts_metric', 'metric_name'),
        Index('idx_ts_period', 'period_start', 'period_end'),
        Index('idx_ts_type', 'period_type'),
    )


class GeographicMetric(Base):
    """
    Geographic data for map visualizations
    SEA-specific regional aggregations
    """
    __tablename__ = "geographic_metrics"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    # Geographic information
    country_code = Column(String(2), nullable=False)  # SG, ID, MY, TH, VN, PH
    country_name = Column(String(100), nullable=False)
    region = Column(String(100))  # State/Province
    city = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)

    # Metrics
    metric_name = Column(String(100), nullable=False)
    value = Column(Float, nullable=False)
    count = Column(Integer, default=1)

    # Population data (for normalization)
    population = Column(Integer)
    value_per_capita = Column(Float)

    # Additional data
    metadata = Column(JSONB)  # Additional geographic metadata

    # Time period (if applicable)
    period_start = Column(DateTime)
    period_end = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project")

    __table_args__ = (
        UniqueConstraint('project_id', 'country_code', 'region', 'city', 'metric_name',
                        name='uq_geo_metric'),
        Index('idx_geo_project', 'project_id'),
        Index('idx_geo_country', 'country_code'),
        Index('idx_geo_metric', 'metric_name'),
        Index('idx_geo_coords', 'latitude', 'longitude'),
    )


class WordFrequency(Base):
    """
    Word frequency data for word clouds and text analysis
    Supports multiple languages and code-mixing
    """
    __tablename__ = "word_frequencies"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    # Word information
    word = Column(String(100), nullable=False)
    normalized_word = Column(String(100), nullable=False)  # Lowercase, stemmed
    language = Column(String(10), nullable=False)  # en, id, ms, th, vi, tl

    # Frequency metrics
    frequency = Column(Integer, nullable=False)
    document_frequency = Column(Integer)  # Number of documents containing the word
    tf_idf_score = Column(Float)  # Term frequency-inverse document frequency

    # Context
    part_of_speech = Column(String(20))  # noun, verb, adjective, etc.
    is_stopword = Column(Boolean, default=False)
    is_entity = Column(Boolean, default=False)  # Named entity
    entity_type = Column(String(50))  # person, location, organization, etc.

    # Sentiment association
    avg_sentiment = Column(Float)  # Average sentiment when word appears
    positive_count = Column(Integer, default=0)
    negative_count = Column(Integer, default=0)
    neutral_count = Column(Integer, default=0)

    # Theme association
    theme_associations = Column(JSONB)  # {theme_id: count} mapping

    # Time period (for temporal word clouds)
    period_start = Column(DateTime)
    period_end = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project")

    __table_args__ = (
        UniqueConstraint('project_id', 'normalized_word', 'language', 'period_start',
                        name='uq_word_freq'),
        Index('idx_word_project', 'project_id'),
        Index('idx_word_frequency', 'frequency'),
        Index('idx_word_tfidf', 'tf_idf_score'),
        Index('idx_word_language', 'language'),
    )


class SentimentFlow(Base):
    """
    Sentiment progression over conversation/document
    For sentiment flow visualizations
    """
    __tablename__ = "sentiment_flows"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    transcript_id = Column(String(36), ForeignKey("transcripts.id", ondelete="CASCADE"))

    # Position in conversation
    position = Column(Integer, nullable=False)  # Sequential position
    timestamp = Column(Float)  # Time in seconds (for audio/video)

    # Sentiment values
    sentiment_score = Column(Float, nullable=False)  # -1 to 1
    sentiment_label = Column(String(20))  # positive, negative, neutral
    confidence = Column(Float)

    # Smoothed values (for visualization)
    smoothed_score = Column(Float)  # Moving average
    trend = Column(String(20))  # rising, falling, stable

    # Context
    speaker_id = Column(String(36))
    speaker_name = Column(String(255))
    text_snippet = Column(Text)  # The actual text at this position

    # Emotion detection (advanced)
    emotions = Column(JSONB)  # {joy: 0.8, anger: 0.2, ...}
    dominant_emotion = Column(String(50))

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project")
    transcript = relationship("Transcript")

    __table_args__ = (
        Index('idx_sentiment_project', 'project_id'),
        Index('idx_sentiment_transcript', 'transcript_id'),
        Index('idx_sentiment_position', 'position'),
        Index('idx_sentiment_timestamp', 'timestamp'),
    )


class EngagementMetric(Base):
    """
    User engagement metrics for analytics dashboard
    Tracks how users interact with the data
    """
    __tablename__ = "engagement_metrics"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"))

    # Engagement type
    action_type = Column(String(50), nullable=False)  # view, export, share, annotate, etc.
    target_type = Column(String(50))  # transcript, analysis, visualization, etc.
    target_id = Column(String(36))

    # Metrics
    duration_seconds = Column(Integer)  # Time spent
    interaction_count = Column(Integer, default=1)  # Number of interactions

    # Context
    session_id = Column(String(36))
    ip_address = Column(String(45))  # Anonymized
    user_agent = Column(Text)
    device_type = Column(String(20))  # mobile, tablet, desktop

    # Location (for regional analytics)
    country = Column(String(2))
    region = Column(String(100))

    # Performance
    load_time_ms = Column(Integer)
    render_time_ms = Column(Integer)

    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project")
    user = relationship("User")

    __table_args__ = (
        Index('idx_engagement_project', 'project_id'),
        Index('idx_engagement_user', 'user_id'),
        Index('idx_engagement_action', 'action_type'),
        Index('idx_engagement_timestamp', 'timestamp'),
        Index('idx_engagement_session', 'session_id'),
    )


class CustomVisualization(Base):
    """
    User-created custom visualizations
    Allows saving and sharing custom viz configurations
    """
    __tablename__ = "custom_visualizations"

    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Visualization details
    name = Column(String(255), nullable=False)
    description = Column(Text)
    visualization_type = Column(SQLEnum(VisualizationType), nullable=False)

    # Configuration
    config = Column(JSONB, nullable=False)  # Complete viz configuration
    filters = Column(JSONB)  # Applied filters

    # Sharing
    is_public = Column(Boolean, default=False)
    is_template = Column(Boolean, default=False)  # Can be used as template

    # Usage tracking
    view_count = Column(Integer, default=0)
    clone_count = Column(Integer, default=0)
    last_viewed = Column(DateTime)

    # Versioning
    version = Column(Integer, default=1)
    parent_id = Column(String(36))  # For cloned visualizations

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project")
    user = relationship("User")

    __table_args__ = (
        Index('idx_custom_viz_project', 'project_id'),
        Index('idx_custom_viz_user', 'user_id'),
        Index('idx_custom_viz_type', 'visualization_type'),
        Index('idx_custom_viz_public', 'is_public'),
    )


# Add relationships to existing models (to be added in Project model)
# Project.visualization_caches = relationship("ProjectVisualizationCache", back_populates="project", cascade="all, delete-orphan")
# Project.theme_cooccurrences = relationship("ThemeCooccurrence", cascade="all, delete-orphan")
# Project.timeseries_metrics = relationship("TimeSeriesMetric", cascade="all, delete-orphan")
# Project.geographic_metrics = relationship("GeographicMetric", cascade="all, delete-orphan")
# Project.word_frequencies = relationship("WordFrequency", cascade="all, delete-orphan")
# Project.sentiment_flows = relationship("SentimentFlow", cascade="all, delete-orphan")
# Project.engagement_metrics = relationship("EngagementMetric", cascade="all, delete-orphan")
# Project.custom_visualizations = relationship("CustomVisualization", cascade="all, delete-orphan")