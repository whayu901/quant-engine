"""
Phase 1 Models - Ingestion & Transcription Enhancements
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, JSON, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from .models import _uid


# Phase 1: Recording & Import Models

class RecordingSession(Base):
    """Live recording sessions via Recall.ai or similar"""
    __tablename__ = "recording_sessions"

    id = Column(String(32), primary_key=True, default=_uid)
    project_id = Column(String(32), ForeignKey("projects.id"), nullable=False)
    platform = Column(String(32), nullable=False)  # zoom | meet | teams | webex
    meeting_url = Column(Text)
    status = Column(String(32), default="scheduled")  # scheduled | recording | completed | failed
    media_id = Column(String(32), ForeignKey("media_assets.id"), nullable=True)
    scheduled_at = Column(DateTime)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Integration(Base):
    """Integration configurations for data imports"""
    __tablename__ = "integrations"

    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False)
    kind = Column(String(32), nullable=False)  # dscout | discussio | fieldnotes | etc
    name = Column(String(255), nullable=False)
    config = Column(JSON)  # API keys, settings, etc (encrypted in prod)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ImportJob(Base):
    """Track import jobs from various sources"""
    __tablename__ = "import_jobs"

    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(32), ForeignKey("projects.id"), nullable=False)
    integration_id = Column(String(32), ForeignKey("integrations.id"), nullable=True)
    batch_id = Column(String(32), ForeignKey("fieldwork_batches.id"), nullable=True)  # Fieldwork QC import target
    source = Column(String(32), nullable=False)  # excel | json | api | community
    status = Column(String(32), default="pending")  # pending | running | completed | failed
    payload_ref = Column(Text)  # File path or API reference
    result_summary = Column(JSON)  # Stats about what was imported
    error = Column(Text)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class Market(Base):
    """Markets for multi-market studies"""
    __tablename__ = "markets"

    id = Column(String(32), primary_key=True, default=_uid)
    project_id = Column(String(32), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    country = Column(String(32), nullable=False)  # ID | MY | SG | TH | VN | PH
    language = Column(String(32), nullable=False)  # id | ms | th | vi | fil | en
    created_at = Column(DateTime, default=datetime.utcnow)


class CommunityThread(Base):
    """Online qualitative / community data"""
    __tablename__ = "community_threads"

    id = Column(String(32), primary_key=True, default=_uid)
    project_id = Column(String(32), ForeignKey("projects.id"), nullable=False)
    source = Column(String(32))  # whatsapp | forum | diary | etc
    topic = Column(Text)
    posts = Column(JSON)  # Array of {author, ts, text, attachments}
    imported_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


# Extend existing models with new fields

def extend_project_model():
    """Add new fields to Project model for Phase 1"""
    from .models import Project

    # Add brief field for AI context
    if not hasattr(Project, 'brief'):
        Project.brief = Column(Text)

    # Add study mode
    if not hasattr(Project, 'study_mode'):
        Project.study_mode = Column(String(32), default="interview")  # interview | online_qual | concept | multimarket

    # Add market context
    if not hasattr(Project, 'market_context'):
        Project.market_context = Column(JSON)  # SEA specific context


def extend_transcript_model():
    """Add wave field to Transcript for longitudinal studies"""
    from .models import Transcript

    if not hasattr(Transcript, 'wave'):
        Transcript.wave = Column(Integer, default=1)

    if not hasattr(Transcript, 'market_id'):
        Transcript.market_id = Column(String(32), ForeignKey("markets.id"), nullable=True)


def extend_org_model():
    """Add SEA specific fields to Org"""
    from .models import Org

    if not hasattr(Org, 'country'):
        Org.country = Column(String(32))  # ID | MY | SG | TH | VN | PH

    if not hasattr(Org, 'currency'):
        Org.currency = Column(String(32))  # IDR | SGD | MYR | THB | VND | PHP | USD

    if not hasattr(Org, 'data_region'):
        Org.data_region = Column(String(32))  # ap-southeast-1 | ap-southeast-3

    if not hasattr(Org, 'auto_join_domain'):
        Org.auto_join_domain = Column(String(255))  # e.g. @company.com