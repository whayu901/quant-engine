"""
Phase 2: Analysis Models (Module B-1)
Analysis Grid, Content Analysis Report, Evidence Panel
"""

from sqlalchemy import (
    Column, String, Text, JSON, DateTime, Integer, Float,
    ForeignKey, Boolean, Enum as SQLEnum, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .database import Base
from .models import _uid


class AnalysisType(str, enum.Enum):
    BASIC = "basic"
    COMPARATIVE = "comparative"
    MULTIMARKET = "multimarket"
    LONGITUDINAL = "longitudinal"  # Across waves
    SEGMENT = "segment"  # By demographic segments


class GridType(str, enum.Enum):
    THEMES = "themes"  # Theme-based grid
    QUESTIONS = "questions"  # Question-based grid
    CONCEPTS = "concepts"  # Concept testing grid
    JOURNEY = "journey"  # Customer journey grid
    PERSONAS = "personas"  # Persona-based grid


class AnalysisGrid(Base):
    """
    Analysis grid for organizing insights
    Can be basic (single data source) or comparative (multiple sources/markets)
    """
    __tablename__ = "analysis_grids"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    name = Column(String(256), nullable=False)
    description = Column(Text)

    analysis_type = Column(SQLEnum(AnalysisType), default=AnalysisType.BASIC)
    grid_type = Column(SQLEnum(GridType), default=GridType.THEMES)

    # Configuration
    config = Column(JSON, default=dict)  # Grid-specific settings
    columns = Column(JSON, default=list)  # Column definitions
    rows = Column(JSON, default=list)  # Row definitions

    # For comparative/multimarket grids
    comparison_dimensions = Column(JSON)  # What we're comparing (markets, segments, etc.)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(36), ForeignKey("users.id"))

    # Relationships
    cells = relationship("GridCell", back_populates="grid", cascade="all, delete-orphan")
    reports = relationship("ContentAnalysisReport", back_populates="grid")


class GridCell(Base):
    """Individual cell in an analysis grid"""
    __tablename__ = "grid_cells"

    id = Column(String(36), primary_key=True, default=_uid)
    grid_id = Column(String(36), ForeignKey("analysis_grids.id"), nullable=False)

    row_id = Column(String(128))  # Reference to row definition
    column_id = Column(String(128))  # Reference to column definition

    # Cell content
    content = Column(Text)  # Main insight/finding
    summary = Column(Text)  # Brief summary

    # Quantification
    frequency = Column(Integer)  # How often this theme appears
    percentage = Column(Float)  # Percentage of respondents
    sentiment_score = Column(Float)  # -1 to 1 sentiment

    # Evidence links
    evidence_ids = Column(JSON, default=list)  # List of Evidence IDs

    # For comparative grids
    comparison_dimension = Column(String(128))  # e.g., "Indonesia", "Wave1", "Segment A"

    # AI-generated insights
    ai_summary = Column(Text)
    ai_patterns = Column(JSON)  # Detected patterns

    meta_data = Column(JSON, default=dict)  # renamed from metadata to avoid SQLAlchemy conflict
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    grid = relationship("AnalysisGrid", back_populates="cells")

    # Indexes
    __table_args__ = (
        Index('idx_grid_cell_position', 'grid_id', 'row_id', 'column_id'),
    )


class Evidence(Base):
    """
    Evidence panel - quotes, clips, images that support insights
    Central repository for all supporting evidence
    """
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    # Source
    source_type = Column(String(32))  # transcript, media, document, survey
    source_id = Column(String(36))  # ID of source (transcript_id, media_id, etc.)

    # Evidence details
    evidence_type = Column(String(32))  # quote, clip, image, chart
    content = Column(Text)  # The actual quote or description

    # For quotes from transcripts
    segment_id = Column(String(36))  # TranscriptSegment ID if applicable
    speaker = Column(String(128))

    # For media clips
    start_time = Column(Float)
    end_time = Column(Float)
    thumbnail_url = Column(Text)

    # Context
    context = Column(Text)  # Surrounding context

    # Categorization
    themes = Column(JSON, default=list)  # Associated themes
    tags = Column(JSON, default=list)  # User-defined tags

    # Importance
    significance = Column(String(32))  # high, medium, low
    starred = Column(Boolean, default=False)

    # Market/segment info (for multimarket studies)
    market = Column(String(32))  # Country code
    segment = Column(String(128))  # Demographic segment
    wave = Column(Integer)  # For longitudinal studies

    # AI analysis
    ai_interpretation = Column(Text)
    sentiment = Column(Float)  # -1 to 1
    emotions = Column(JSON)  # Detected emotions

    meta_data = Column(JSON, default=dict)  # renamed from metadata to avoid SQLAlchemy conflict
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(36), ForeignKey("users.id"))

    # Indexes
    __table_args__ = (
        Index('idx_evidence_project', 'project_id'),
        Index('idx_evidence_themes', 'themes'),
    )


class ContentAnalysisReport(Base):
    """
    AI-generated content analysis reports
    Comprehensive analysis of themes, patterns, and insights
    """
    __tablename__ = "content_analysis_reports"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    title = Column(String(256), nullable=False)
    report_type = Column(String(32))  # executive, detailed, technical

    # Optional link to analysis grid
    grid_id = Column(String(36), ForeignKey("analysis_grids.id"))

    # Report sections (stored as structured JSON)
    executive_summary = Column(Text)
    methodology = Column(Text)
    key_findings = Column(JSON)  # List of main findings
    themes_analysis = Column(JSON)  # Detailed theme analysis
    recommendations = Column(JSON)  # Action items

    # Multimarket specific sections
    market_comparison = Column(JSON)  # Cross-market insights
    regional_patterns = Column(JSON)  # Regional trends

    # Statistical summary
    statistics = Column(JSON)  # Response rates, sample sizes, etc.

    # Visualizations
    charts = Column(JSON, default=list)  # Chart configurations

    # Evidence used
    evidence_ids = Column(JSON, default=list)

    # Generation metadata
    generated_at = Column(DateTime, default=datetime.utcnow)
    generation_params = Column(JSON)  # AI model parameters used
    version = Column(Integer, default=1)

    # Export
    export_formats = Column(JSON, default=list)  # Available formats
    last_exported = Column(DateTime)

    # Relationships
    grid = relationship("AnalysisGrid", back_populates="reports")


class AnalysisTheme(Base):
    """
    Themes extracted from analysis
    Can be hierarchical (parent/child themes)
    """
    __tablename__ = "analysis_themes"  # Different table from original themes table

    id = Column(String(36), primary_key=True, default=_uid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    name = Column(String(256), nullable=False)
    description = Column(Text)

    # Hierarchy
    parent_id = Column(String(36), ForeignKey("analysis_themes.id"))
    level = Column(Integer, default=0)  # 0=top level, 1=sub-theme, etc.

    # Quantification
    frequency = Column(Integer, default=0)
    percentage = Column(Float)

    # Color coding for visualization
    color = Column(String(7))  # Hex color

    # Associated evidence
    evidence_count = Column(Integer, default=0)

    # AI-generated
    ai_generated = Column(Boolean, default=False)
    confidence_score = Column(Float)  # AI confidence in theme

    created_at = Column(DateTime, default=datetime.utcnow)

    # Indexes
    __table_args__ = (
        Index('idx_theme_project', 'project_id'),
        Index('idx_theme_hierarchy', 'parent_id', 'level'),
    )


class Insight(Base):
    """
    Key insights derived from analysis
    Can be linked to multiple pieces of evidence
    """
    __tablename__ = "insights"

    id = Column(String(36), primary_key=True, default=_uid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)

    # Categorization
    category = Column(String(128))  # behavior, attitude, need, pain_point, opportunity
    themes = Column(JSON, default=list)

    # Importance
    priority = Column(String(32))  # critical, high, medium, low
    impact = Column(String(32))  # strategic, tactical, operational

    # Supporting evidence
    evidence_ids = Column(JSON, default=list)
    confidence_level = Column(Float)  # 0-1 confidence score

    # For multimarket
    markets = Column(JSON, default=list)  # Applicable markets
    is_regional = Column(Boolean, default=False)  # True if applies across region

    # Actionability
    actionable = Column(Boolean, default=True)
    recommendations = Column(Text)

    # Validation
    validated = Column(Boolean, default=False)
    validated_by = Column(String(36), ForeignKey("users.id"))
    validated_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(36), ForeignKey("users.id"))

    # Indexes
    __table_args__ = (
        Index('idx_insight_priority', 'project_id', 'priority'),
    )