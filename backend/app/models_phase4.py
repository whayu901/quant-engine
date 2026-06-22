"""
Phase 4: Open Ends Coder + Concept Testing + Team Collaboration
Enhanced collaboration features with team structure and permissions
"""

from sqlalchemy import (
    Column, String, Text, JSON, DateTime, Integer, Float,
    ForeignKey, Boolean, Index, UniqueConstraint, Enum
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .database import Base
from .models import _uid


# Enums for better type safety
class TeamType(str, enum.Enum):
    QUAL = "qual"
    QUANT = "quant"
    DATA_PROCESSING = "data_processing"
    QC = "qc"
    FIELD = "field"
    PROJECT_MANAGEMENT = "pm"
    CLIENT = "client"


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"  # System-wide admin
    ORG_ADMIN = "org_admin"      # Organization admin
    TEAM_LEAD = "team_lead"      # Team leader
    RESEARCHER = "researcher"     # Regular researcher
    ANALYST = "analyst"           # Data analyst
    VIEWER = "viewer"            # Read-only access
    CLIENT = "client"            # External client access


class ProjectRole(str, enum.Enum):
    OWNER = "owner"              # Full control
    MANAGER = "manager"          # Can manage team
    EDITOR = "editor"            # Can edit content
    REVIEWER = "reviewer"        # Can review/approve
    VIEWER = "viewer"            # Read-only


# Enhanced User model fields (will be added via migration)
class UserEnhancement(Base):
    """Additional user fields for team collaboration"""
    __tablename__ = "user_enhancements"

    id = Column(String(36), primary_key=True, default=_uid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)

    # Team assignment
    team = Column(String(32))  # TeamType enum
    department = Column(String(128))
    job_title = Column(String(128))

    # Profile
    avatar_url = Column(String(512))
    bio = Column(Text)
    timezone = Column(String(64), default="Asia/Jakarta")
    language_preference = Column(String(10), default="en")

    # Permissions
    can_create_projects = Column(Boolean, default=False)
    can_manage_users = Column(Boolean, default=False)
    can_export_data = Column(Boolean, default=True)
    can_delete_content = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Project-level permissions
class ProjectMember(Base):
    """Project team members with specific roles"""
    __tablename__ = "project_members"

    id = Column(String(36), primary_key=True, default=_uid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    role = Column(String(32), default="viewer")  # ProjectRole enum

    # Specific permissions
    can_edit_transcripts = Column(Boolean, default=False)
    can_run_analysis = Column(Boolean, default=False)
    can_manage_team = Column(Boolean, default=False)
    can_export = Column(Boolean, default=True)
    can_delete = Column(Boolean, default=False)

    # Assignment info
    assigned_by = Column(String(36), ForeignKey("users.id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Activity
    last_accessed = Column(DateTime)
    access_count = Column(Integer, default=0)

    __table_args__ = (
        UniqueConstraint('project_id', 'user_id', name='uq_project_member'),
        Index('idx_project_member_user', 'user_id'),
        Index('idx_project_member_project', 'project_id'),
    )


# Open Ends Coding
class OpenEndQuestion(Base):
    """Open-ended survey questions for coding"""
    __tablename__ = "open_end_questions"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    # Question details
    question_code = Column(String(64), nullable=False)  # Q1, Q2a, etc.
    question_text = Column(Text, nullable=False)
    question_type = Column(String(32))  # single, multiple, numeric, text

    # Wave management for tracking
    wave = Column(Integer, default=1)
    survey_name = Column(String(256))

    # Coding scheme
    code_frame = Column(JSON)  # Predefined codes
    allow_multiple = Column(Boolean, default=True)
    other_specify = Column(Boolean, default=False)

    # Stats
    total_responses = Column(Integer, default=0)
    coded_responses = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(36), ForeignKey("users.id"))

    # Relationships
    responses = relationship("OpenEndResponse", back_populates="question", cascade="all, delete-orphan")
    code_frames = relationship("CodeFrame", back_populates="question", cascade="all, delete-orphan")


class OpenEndResponse(Base):
    """Individual open-ended responses"""
    __tablename__ = "open_end_responses"

    id = Column(String(36), primary_key=True, default=_uid)
    question_id = Column(String(36), ForeignKey("open_end_questions.id"), nullable=False)

    # Response details
    respondent_id = Column(String(128))  # Survey respondent ID
    response_text = Column(Text, nullable=False)
    language = Column(String(10))

    # Coding
    codes = Column(JSON, default=list)  # List of applied codes
    coded_by = Column(String(36), ForeignKey("users.id"))
    coded_at = Column(DateTime)

    # QC
    reviewed_by = Column(String(36), ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    review_status = Column(String(32))  # pending, approved, rejected
    review_notes = Column(Text)

    # AI assistance
    ai_suggested_codes = Column(JSON)
    ai_confidence = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    question = relationship("OpenEndQuestion", back_populates="responses")

    __table_args__ = (
        Index('idx_open_end_response_question', 'question_id'),
        Index('idx_open_end_response_respondent', 'respondent_id'),
    )


class CodeFrame(Base):
    """Code frame for categorizing responses"""
    __tablename__ = "code_frames"

    id = Column(String(36), primary_key=True, default=_uid)
    question_id = Column(String(36), ForeignKey("open_end_questions.id"), nullable=False)

    code = Column(String(64), nullable=False)
    label = Column(String(256), nullable=False)
    description = Column(Text)

    # Hierarchy
    parent_code = Column(String(64))
    level = Column(Integer, default=1)
    sort_order = Column(Integer)

    # Usage
    usage_count = Column(Integer, default=0)
    is_exclusive = Column(Boolean, default=False)  # Can't be combined with others

    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(36), ForeignKey("users.id"))

    # Relationships
    question = relationship("OpenEndQuestion", back_populates="code_frames")

    __table_args__ = (
        UniqueConstraint('question_id', 'code', name='uq_code_frame'),
        Index('idx_code_frame_question', 'question_id'),
    )


# Concept Testing
class ConceptTest(Base):
    """Concept testing configuration"""
    __tablename__ = "concept_tests"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)

    name = Column(String(256), nullable=False)
    description = Column(Text)

    # Test configuration
    test_type = Column(String(64))  # monadic, sequential, comparative
    concepts = Column(JSON)  # List of concept definitions

    # Metrics to evaluate
    metrics = Column(JSON, default=list)  # appeal, uniqueness, believability, etc.

    # Target
    target_audience = Column(Text)
    sample_size = Column(Integer)
    markets = Column(JSON, default=list)

    # Status
    status = Column(String(32), default="draft")  # draft, active, completed
    start_date = Column(DateTime)
    end_date = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(String(36), ForeignKey("users.id"))

    # Relationships
    evaluations = relationship("ConceptEvaluation", back_populates="test", cascade="all, delete-orphan")


class ConceptEvaluation(Base):
    """Individual concept evaluations"""
    __tablename__ = "concept_evaluations"

    id = Column(String(36), primary_key=True, default=_uid)
    test_id = Column(String(36), ForeignKey("concept_tests.id"), nullable=False)

    # Evaluation details
    respondent_id = Column(String(128))
    concept_id = Column(String(64))  # Which concept was evaluated

    # Ratings
    ratings = Column(JSON)  # {metric: score} pairs
    overall_rating = Column(Float)

    # Qualitative feedback
    likes = Column(Text)
    dislikes = Column(Text)
    suggestions = Column(Text)

    # Purchase intent
    purchase_intent = Column(Integer)  # 1-5 scale

    # Demographics
    demographic_data = Column(JSON)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    test = relationship("ConceptTest", back_populates="evaluations")

    __table_args__ = (
        Index('idx_concept_eval_test', 'test_id'),
        Index('idx_concept_eval_respondent', 'respondent_id'),
    )


# Collaboration Features
class Comment(Base):
    """Comments on any content"""
    __tablename__ = "comments"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)

    # Polymorphic reference
    target_type = Column(String(64), nullable=False)  # transcript, analysis, evidence, etc.
    target_id = Column(String(36), nullable=False)

    # Comment details
    content = Column(Text, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    # Threading
    parent_id = Column(String(36), ForeignKey("comments.id"))

    # Mentions
    mentioned_users = Column(JSON, default=list)  # List of user IDs

    # Status
    is_resolved = Column(Boolean, default=False)
    resolved_by = Column(String(36), ForeignKey("users.id"))
    resolved_at = Column(DateTime)

    # Edit history
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    replies = relationship("Comment", backref="parent", remote_side=[id])

    __table_args__ = (
        Index('idx_comment_target', 'target_type', 'target_id'),
        Index('idx_comment_user', 'user_id'),
        Index('idx_comment_parent', 'parent_id'),
    )


class ActivityLog(Base):
    """Track all user activities"""
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id"))

    # Who did what
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(64), nullable=False)  # created, edited, deleted, analyzed, etc.

    # On what
    target_type = Column(String(64))
    target_id = Column(String(36))
    target_name = Column(String(256))  # For display

    # Details
    details = Column(JSON)  # Additional context
    ip_address = Column(String(45))
    user_agent = Column(String(512))

    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('idx_activity_log_user', 'user_id'),
        Index('idx_activity_log_project', 'project_id'),
        Index('idx_activity_log_created', 'created_at'),
        Index('idx_activity_log_action', 'action'),
    )


class Notification(Base):
    """User notifications for collaboration"""
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=_uid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)

    # Notification details
    type = Column(String(64), nullable=False)  # mention, assignment, approval_needed, etc.
    title = Column(String(256), nullable=False)
    message = Column(Text)

    # Link to content
    link_type = Column(String(64))
    link_id = Column(String(36))

    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime)

    # Priority
    priority = Column(String(32), default="normal")  # low, normal, high, urgent

    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)

    __table_args__ = (
        Index('idx_notification_user', 'user_id', 'is_read'),
        Index('idx_notification_created', 'created_at'),
    )


# Admin Dashboard Stats
class OrganizationStats(Base):
    """Cached organization statistics for dashboard"""
    __tablename__ = "organization_stats"

    id = Column(String(36), primary_key=True, default=_uid)
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)

    # User stats
    total_users = Column(Integer, default=0)
    active_users_today = Column(Integer, default=0)
    active_users_week = Column(Integer, default=0)
    active_users_month = Column(Integer, default=0)

    # Project stats
    total_projects = Column(Integer, default=0)
    active_projects = Column(Integer, default=0)
    completed_projects = Column(Integer, default=0)

    # Content stats
    total_transcripts = Column(Integer, default=0)
    total_analyses = Column(Integer, default=0)
    total_evidence = Column(Integer, default=0)

    # Usage stats
    total_ai_calls = Column(Integer, default=0)
    total_chat_messages = Column(Integer, default=0)
    storage_used_mb = Column(Float, default=0.0)

    # Open ends stats
    total_questions = Column(Integer, default=0)
    total_responses = Column(Integer, default=0)
    coding_completion_rate = Column(Float, default=0.0)

    # Calculated at
    calculated_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('idx_org_stats', 'org_id', 'calculated_at'),
    )