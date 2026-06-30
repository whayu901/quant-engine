"""Pydantic schemas for the Fieldwork QC / Verifier module."""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class FieldworkBatchIn(BaseModel):
    """Create a fieldwork QC batch."""
    project_id: str
    name: str
    source: str = "excel"            # surveytogo | dooblo | excel | api
    market_id: Optional[str] = None
    integration_id: Optional[str] = None
    rules: Optional[Dict[str, Any]] = None   # thresholds + eligibility rules


class FieldworkBatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    org_id: str
    project_id: str
    market_id: Optional[str] = None
    integration_id: Optional[str] = None
    name: str
    source: str
    status: str
    rules: Optional[Dict[str, Any]] = None
    result_summary: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class InterviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    org_id: str
    project_id: str
    batch_id: str
    external_id: Optional[str] = None
    interviewer_id: Optional[str] = None
    respondent_ref: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_sec: Optional[int] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    media_id: Optional[str] = None
    answers: Optional[Dict[str, Any]] = None
    qc_status: str
    qc_score: Optional[float] = None
    created_at: datetime


class FieldworkImportOut(BaseModel):
    """Status of an import job kicked off via POST /batches/{id}/import."""
    import_job_id: str
    batch_id: str
    status: str                                  # pending | running | completed | failed
    result_summary: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class QCFlagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    interview_id: str
    batch_id: str
    check: str
    severity: str                                # info | warn | critical
    detail: Optional[Dict[str, Any]] = None
    status: str                                  # open | confirmed | dismissed
    reviewer_id: Optional[str] = None
    created_at: datetime


class InterviewDetailOut(InterviewOut):
    """Interview detail with its QC flags."""
    flags: list[QCFlagOut] = []


class InterviewerScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    batch_id: str
    interviewer_id: str
    n_interviews: int
    avg_duration_sec: Optional[float] = None
    flag_rate: Optional[float] = None
    anomaly_score: Optional[float] = None
    computed_at: Optional[datetime] = None


class FlagResolveIn(BaseModel):
    """Reviewer decision on a QC flag."""
    status: str                                  # confirmed | dismissed
    note: Optional[str] = None


class InterviewerSummary(BaseModel):
    interviewer_id: str
    n_interviews: int
    avg_duration_sec: Optional[float] = None
    flag_rate: Optional[float] = None
    anomaly_score: Optional[float] = None


class TrendPoint(BaseModel):
    time: str
    approved: int
    rejected: int


class FieldworkReportOut(BaseModel):
    """Read-only QC report (fraud separated from eligibility screen-outs)."""
    interviews_total: int
    approved: int
    fraud_rejected: int
    ineligible: int
    needs_review: int
    by_check: Dict[str, int]
    interviewers: list[InterviewerSummary]
    trend: list[TrendPoint]
