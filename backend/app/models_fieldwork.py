"""
Fieldwork QC / Verifier models — the wedge (Direction A).

Verifies that fieldwork data is real and clean at scale: interview-happened
verification, anti-curbstoning / fabrication detection, audio-vs-answers
cross-check, and registrant/file validation. CoLoop starts at the transcript;
this module owns *how data was collected*.

Conventions follow the rest of the app exactly: String(32) ids, org_id tenancy
(indexed) on every tenant-owned table, JSON config/evidence, status strings,
created_at defaults. market_id / integration_id are stored as plain String(32)
references (no DB-level FK) because the markets/integrations tables are not
guaranteed to exist in every deployment.
"""

from datetime import datetime
from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Integer, Float, JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from .database import Base
from .models import _uid


class FieldworkBatch(Base):
    """A fielding dataset to verify."""
    __tablename__ = "fieldwork_batches"

    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    project_id = Column(String(32), ForeignKey("projects.id"), nullable=False, index=True)
    market_id = Column(String(32), nullable=True)        # -> markets.id (soft ref)
    integration_id = Column(String(32), nullable=True)   # -> integrations.id (soft ref)
    name = Column(String(255), nullable=False)
    source = Column(String(32), default="excel")         # surveytogo | dooblo | excel | api
    status = Column(String(32), default="pending")       # pending | importing | running | completed | failed
    rules = Column(JSON)                                 # thresholds + eligibility rules
    result_summary = Column(JSON)                        # counts: pass/flag/reject, approved/rejected trend
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    interviews = relationship("Interview", back_populates="batch",
                              cascade="all, delete-orphan")
    flags = relationship("QCFlag", back_populates="batch",
                         cascade="all, delete-orphan")
    interviewer_scores = relationship("InterviewerScore", back_populates="batch",
                                      cascade="all, delete-orphan")


class Interview(Base):
    """One respondent record to verify."""
    __tablename__ = "interviews"
    # (batch_id, external_id) is unique so re-importing a batch is idempotent.
    __table_args__ = (
        UniqueConstraint("batch_id", "external_id", name="uq_interviews_batch_external"),
    )

    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    project_id = Column(String(32), ForeignKey("projects.id"), nullable=False, index=True)
    batch_id = Column(String(32), ForeignKey("fieldwork_batches.id"), nullable=False, index=True)
    external_id = Column(String(128))                    # SurveyToGo respondent id
    interviewer_id = Column(String(128), index=True)     # the field interviewer
    respondent_ref = Column(String(128))
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    duration_sec = Column(Integer, nullable=True)
    gps_lat = Column(Float, nullable=True)
    gps_lng = Column(Float, nullable=True)
    audio_ref = Column(String, nullable=True)            # silent-audio filename pointer (Phase 5)
    media_id = Column(String(32), ForeignKey("media_assets.id"), nullable=True)
    answers = Column(JSON)                               # the survey responses (q1..q10 only)
    qc_status = Column(String(32), default="pending")    # pending | pass | flag | reject | review
    qc_score = Column(Float, nullable=True)              # 0..1
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("FieldworkBatch", back_populates="interviews")
    media = relationship("MediaAsset", foreign_keys=[media_id])
    flags = relationship("QCFlag", back_populates="interview",
                         cascade="all, delete-orphan")


class QCFlag(Base):
    """One issue found on an interview."""
    __tablename__ = "qc_flags"

    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    interview_id = Column(String(32), ForeignKey("interviews.id"), nullable=False, index=True)
    batch_id = Column(String(32), ForeignKey("fieldwork_batches.id"), nullable=False, index=True)
    check = Column(String(64), nullable=False)           # detector name
    severity = Column(String(16), default="warn")        # info | warn | critical
    detail = Column(JSON)                                # the evidence
    status = Column(String(16), default="open")          # open | confirmed | dismissed
    reviewer_id = Column(String(32), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    interview = relationship("Interview", back_populates="flags")
    batch = relationship("FieldworkBatch", back_populates="flags")


class InterviewerScore(Base):
    """Per-interviewer aggregate for anomaly detection (recomputable)."""
    __tablename__ = "interviewer_scores"

    id = Column(String(32), primary_key=True, default=_uid)
    org_id = Column(String(32), ForeignKey("orgs.id"), nullable=False, index=True)
    batch_id = Column(String(32), ForeignKey("fieldwork_batches.id"), nullable=False, index=True)
    interviewer_id = Column(String(128), nullable=False, index=True)
    n_interviews = Column(Integer, default=0)
    avg_duration_sec = Column(Float, nullable=True)
    flag_rate = Column(Float, nullable=True)
    anomaly_score = Column(Float, nullable=True)
    computed_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("FieldworkBatch", back_populates="interviewer_scores")
