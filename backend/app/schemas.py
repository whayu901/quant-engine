from datetime import datetime
from typing import List, Optional, Generic, TypeVar
from pydantic import BaseModel, EmailStr, ConfigDict

T = TypeVar('T')


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    name: Optional[str] = None
    role: str
    org_id: str


class AuthResponse(BaseModel):
    """Complete authentication response with user data and tokens"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
    status: str = "success"


class RegisterRetailIn(BaseModel):
    """Registration for individual/retail users"""
    account_type: str = "retail"
    name: str
    email: EmailStr
    password: str
    accept_terms: bool = True
    accept_privacy: bool = True


class RegisterEnterpriseIn(BaseModel):
    """Registration for enterprise/organization users"""
    account_type: str = "enterprise"
    organization_name: str
    industry: Optional[str] = None
    company_size: Optional[str] = None
    admin_name: str
    admin_email: EmailStr
    password: str
    accept_terms: bool = True
    accept_privacy: bool = True


class RegisterIn(BaseModel):
    """Legacy registration schema for backwards compatibility"""
    email: EmailStr
    password: str
    org_name: str


class LoginIn(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str
    remember_me: bool = False


class OrgOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    plan: str


class ProjectIn(BaseModel):
    name: str
    description: str = ""


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    description: Optional[str] = ""
    created_at: datetime


class TranscriptIn(BaseModel):
    title: str
    method: str = "FGD"
    content: str


class TranscriptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    method: str
    project_id: str
    language: Optional[str] = None
    transcription_status: str = "ready"
    transcription_error: Optional[str] = ""
    created_at: datetime


class SegmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    idx: int
    speaker: Optional[str] = None
    start_sec: Optional[float] = None
    end_sec: Optional[float] = None
    text: Optional[str] = None


class TranscriptDetail(TranscriptOut):
    content: str
    segments: List[SegmentOut] = []


class VerbatimOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    quote: Optional[str] = None
    speaker: Optional[str] = None


class ThemeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: Optional[str] = None
    description: Optional[str] = None
    prevalence: Optional[str] = None
    sentiment: Optional[str] = None
    verbatims: List[VerbatimOut] = []


class ImplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    text: Optional[str] = None


class AnalysisSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    status: str
    transcript_id: str
    created_at: datetime
    completed_at: Optional[datetime] = None


class AnalysisOut(AnalysisSummary):
    topline: Optional[str] = ""
    error: Optional[str] = ""
    respondent_count: Optional[int] = None
    input_tokens: Optional[int] = 0
    output_tokens: Optional[int] = 0
    themes: List[ThemeOut] = []
    implications: List[ImplicationOut] = []


class UsageOut(BaseModel):
    plan: str
    month_count: int
    limit: int
    remaining: int


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic pagination response schema"""
    items: List[T]
    total: int
    skip: int
    limit: int
    has_more: bool
