import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float
from sqlalchemy.orm import relationship
from .database import Base


def _uid() -> str:
    return uuid.uuid4().hex


class Org(Base):
    __tablename__ = "orgs"
    id = Column(String(32), primary_key=True, default=_uid)
    name = Column(String(255), nullable=False)
    plan = Column(String(32), default="free", nullable=False)  # free | pro
    created_at = Column(DateTime, default=datetime.utcnow)
    users = relationship("User", back_populates="org", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="org", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"
    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(32), default="researcher", nullable=False)  # admin | researcher | viewer
    created_at = Column(DateTime, default=datetime.utcnow)
    org = relationship("Org", back_populates="users")


class Project(Base):
    __tablename__ = "projects"
    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    created_by = Column(String(32), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    org = relationship("Org", back_populates="projects")
    transcripts = relationship("Transcript", back_populates="project", cascade="all, delete-orphan")


class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    project_id = Column(String(32), ForeignKey("projects.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    method = Column(String(32), default="FGD")  # FGD | IDI | other
    content = Column(Text, nullable=False, default="")
    source_filename = Column(String(255))
    # Phase 1 — ingestion + transcription
    source_media_id = Column(String(32), ForeignKey("media_assets.id"))
    language = Column(String(16))
    transcription_status = Column(String(32), default="ready")  # ready|pending|running|done|error
    transcription_error = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    project = relationship("Project", back_populates="transcripts")
    media = relationship("MediaAsset", foreign_keys=[source_media_id])
    segments = relationship("TranscriptSegment", back_populates="transcript",
                            cascade="all, delete-orphan", order_by="TranscriptSegment.idx")
    analyses = relationship("Analysis", back_populates="transcript", cascade="all, delete-orphan")


class MediaAsset(Base):
    __tablename__ = "media_assets"
    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    project_id = Column(String(32), ForeignKey("projects.id"), nullable=False, index=True)
    filename = Column(String(255))
    content_type = Column(String(128))
    kind = Column(String(16))  # audio | video
    storage_key = Column(String(512))  # path/key in storage backend
    duration_sec = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class TranscriptSegment(Base):
    """Diarized segment with timestamps — powers clips, evidence, and alignment later."""
    __tablename__ = "transcript_segments"
    id = Column(String(32), primary_key=True, default=_uid)
    transcript_id = Column(String(32), ForeignKey("transcripts.id"), nullable=False, index=True)
    idx = Column(Integer, default=0)
    speaker = Column(String(64))
    start_sec = Column(Float)
    end_sec = Column(Float)
    text = Column(Text)
    transcript = relationship("Transcript", back_populates="segments")


class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    transcript_id = Column(String(32), ForeignKey("transcripts.id"), nullable=False, index=True)
    status = Column(String(32), default="pending", nullable=False)  # pending|running|done|error
    topline = Column(Text, default="")
    error = Column(Text, default="")
    respondent_count = Column(Integer)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    transcript = relationship("Transcript", back_populates="analyses")
    themes = relationship("Theme", back_populates="analysis", cascade="all, delete-orphan", order_by="Theme.order_idx")
    implications = relationship("Implication", back_populates="analysis", cascade="all, delete-orphan", order_by="Implication.order_idx")


class Theme(Base):
    __tablename__ = "themes"
    id = Column(String(32), primary_key=True, default=_uid)
    analysis_id = Column(String(32), ForeignKey("analyses.id"), nullable=False, index=True)
    name = Column(String(255))
    description = Column(Text)
    prevalence = Column(String(32))
    sentiment = Column(String(32))
    order_idx = Column(Integer, default=0)
    analysis = relationship("Analysis", back_populates="themes")
    verbatims = relationship("Verbatim", back_populates="theme", cascade="all, delete-orphan")


class Verbatim(Base):
    __tablename__ = "verbatims"
    id = Column(String(32), primary_key=True, default=_uid)
    theme_id = Column(String(32), ForeignKey("themes.id"), nullable=False, index=True)
    quote = Column(Text)
    speaker = Column(String(255))
    theme = relationship("Theme", back_populates="verbatims")


class Implication(Base):
    __tablename__ = "implications"
    id = Column(String(32), primary_key=True, default=_uid)
    analysis_id = Column(String(32), ForeignKey("analyses.id"), nullable=False, index=True)
    text = Column(Text)
    order_idx = Column(Integer, default=0)
    analysis = relationship("Analysis", back_populates="implications")


class UsageRecord(Base):
    __tablename__ = "usage_records"
    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    analysis_id = Column(String(32), ForeignKey("analyses.id"))
    kind = Column(String(32), default="analysis")
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
