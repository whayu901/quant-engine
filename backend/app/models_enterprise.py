"""
Enterprise Models for Qual Engine
Phase 5: Enterprise-grade features for SEA market domination
Competitive advantage over coloop.ai
"""

from sqlalchemy import (
    Column, String, Boolean, Integer, Float, DateTime, Text, JSON,
    ForeignKey, Index, UniqueConstraint, CheckConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional, Dict, Any, List
from .database import Base
from .models import _uid


class WhiteLabelConfig(Base):
    """White-label configuration for enterprise clients"""
    __tablename__ = "white_label_configs"

    id = Column(String, primary_key=True, default=_uid)
    org_id = Column(String, ForeignKey("orgs.id"), nullable=False, unique=True)

    # Branding
    brand_name = Column(String(100), nullable=False)
    brand_logo_url = Column(String(500))
    brand_favicon_url = Column(String(500))
    brand_colors = Column(JSON, default={
        "primary": "#007bff",
        "secondary": "#6c757d",
        "success": "#28a745",
        "danger": "#dc3545",
        "warning": "#ffc107",
        "info": "#17a2b8"
    })

    # Custom domain
    custom_domain = Column(String(255))
    ssl_certificate = Column(Text)  # SSL cert for custom domain
    ssl_key = Column(Text)  # SSL key (encrypted)

    # Email configuration
    email_from_name = Column(String(100))
    email_from_address = Column(String(255))
    email_smtp_host = Column(String(255))
    email_smtp_port = Column(Integer)
    email_smtp_user = Column(String(255))
    email_smtp_password = Column(Text)  # Encrypted
    email_template_header = Column(Text)
    email_template_footer = Column(Text)

    # SEA-specific features
    default_language = Column(String(10), default="en")  # en, id, ms, th, vi, tl
    supported_languages = Column(JSON, default=["en"])
    currency = Column(String(3), default="USD")  # SGD, IDR, MYR, THB, PHP, VND
    timezone = Column(String(50), default="Asia/Singapore")

    # Feature toggles
    enable_ai_insights = Column(Boolean, default=True)
    enable_video_processing = Column(Boolean, default=True)
    enable_collaboration = Column(Boolean, default=True)
    enable_statistical_analysis = Column(Boolean, default=True)
    enable_code_mixing = Column(Boolean, default=True)  # SEA-specific
    enable_concept_testing = Column(Boolean, default=True)
    custom_features = Column(JSON, default={})  # Org-specific features

    # Limits
    max_users = Column(Integer, default=100)
    max_projects = Column(Integer, default=1000)
    max_storage_gb = Column(Float, default=100.0)
    max_ai_calls_per_month = Column(Integer, default=10000)

    # Legal/Compliance
    terms_url = Column(String(500))
    privacy_url = Column(String(500))
    gdpr_compliant = Column(Boolean, default=True)
    pdpa_compliant = Column(Boolean, default=True)  # SEA Personal Data Protection Act

    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    org = relationship("Org", back_populates="white_label_config")

    __table_args__ = (
        Index("ix_white_label_org_id", "org_id"),
        Index("ix_white_label_custom_domain", "custom_domain"),
    )


class AuditLog(Base):
    """Comprehensive audit logging for enterprise compliance"""
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=_uid)
    org_id = Column(String, ForeignKey("orgs.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Action details
    action = Column(String(50), nullable=False)  # create, read, update, delete, export, share
    entity_type = Column(String(50), nullable=False)  # project, transcript, analysis, etc.
    entity_id = Column(String)
    entity_name = Column(String(255))

    # Request details
    ip_address = Column(String(45))  # IPv4 or IPv6
    user_agent = Column(String(500))
    session_id = Column(String(100))
    request_method = Column(String(10))  # GET, POST, PUT, DELETE
    request_path = Column(String(500))
    request_params = Column(JSON)  # Query parameters
    request_body = Column(JSON)  # Body (sanitized, no sensitive data)

    # Response details
    response_status = Column(Integer)
    response_time_ms = Column(Float)
    error_message = Column(Text)

    # Data changes (for update/delete)
    old_values = Column(JSON)
    new_values = Column(JSON)

    # Compliance fields
    data_classification = Column(String(20))  # public, internal, confidential, restricted
    contains_pii = Column(Boolean, default=False)
    gdpr_relevant = Column(Boolean, default=False)

    # Geographic info (SEA-specific)
    country_code = Column(String(2))  # SG, ID, MY, TH, PH, VN
    region = Column(String(50))

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User")
    org = relationship("Org")

    __table_args__ = (
        Index("ix_audit_org_user", "org_id", "user_id"),
        Index("ix_audit_entity", "entity_type", "entity_id"),
        Index("ix_audit_action", "action"),
        Index("ix_audit_created", "created_at"),
        Index("ix_audit_ip", "ip_address"),
    )


class DataExportJob(Base):
    """Track data export jobs for compliance and portability"""
    __tablename__ = "data_export_jobs"

    id = Column(String, primary_key=True, default=_uid)
    org_id = Column(String, ForeignKey("orgs.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Export configuration
    export_type = Column(String(50), nullable=False)  # full, project, gdpr, analysis
    format = Column(String(20), nullable=False)  # json, csv, xlsx, pdf, spss

    # Scope
    project_ids = Column(JSON)  # List of project IDs to export
    date_from = Column(DateTime)
    date_to = Column(DateTime)
    include_transcripts = Column(Boolean, default=True)
    include_analysis = Column(Boolean, default=True)
    include_media = Column(Boolean, default=False)
    include_deleted = Column(Boolean, default=False)

    # Options
    anonymize_pii = Column(Boolean, default=False)
    language = Column(String(10), default="en")
    timezone = Column(String(50), default="UTC")

    # Status
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    progress = Column(Integer, default=0)
    celery_task_id = Column(String(100))

    # Output
    file_path = Column(String(500))
    file_size_mb = Column(Float)
    download_url = Column(String(500))
    download_expires = Column(DateTime)
    download_count = Column(Integer, default=0)

    # Performance
    records_exported = Column(Integer, default=0)
    processing_time_seconds = Column(Float)

    # Error handling
    error_message = Column(Text)
    error_details = Column(JSON)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)

    # Relationships
    user = relationship("User")
    org = relationship("Org")

    __table_args__ = (
        Index("ix_export_org_user", "org_id", "user_id"),
        Index("ix_export_status", "status"),
        Index("ix_export_created", "created_at"),
    )


class DataImportJob(Base):
    """Track data import jobs for migration and bulk operations"""
    __tablename__ = "data_import_jobs"

    id = Column(String, primary_key=True, default=_uid)
    org_id = Column(String, ForeignKey("orgs.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Import configuration
    import_type = Column(String(50), nullable=False)  # transcripts, analysis, codebook, migration
    source_format = Column(String(20), nullable=False)  # json, csv, xlsx, nvivo, maxqda
    source_system = Column(String(50))  # coloop, nvivo, maxqda, atlas.ti, custom

    # File details
    file_name = Column(String(255))
    file_size_mb = Column(Float)
    file_hash = Column(String(64))  # SHA256 hash

    # Mapping configuration
    field_mappings = Column(JSON)  # How to map source fields to our schema
    default_values = Column(JSON)  # Default values for missing fields

    # Options
    validate_only = Column(Boolean, default=False)  # Dry run
    skip_duplicates = Column(Boolean, default=True)
    merge_strategy = Column(String(20), default="skip")  # skip, replace, merge

    # Status
    status = Column(String(20), default="pending")
    progress = Column(Integer, default=0)
    celery_task_id = Column(String(100))

    # Results
    records_processed = Column(Integer, default=0)
    records_imported = Column(Integer, default=0)
    records_skipped = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)

    # Validation results
    validation_errors = Column(JSON)
    validation_warnings = Column(JSON)

    # Created entities
    created_projects = Column(JSON)  # List of created project IDs
    created_transcripts = Column(JSON)  # List of created transcript IDs

    # Performance
    processing_time_seconds = Column(Float)

    # Error handling
    error_message = Column(Text)
    error_details = Column(JSON)
    failed_records = Column(JSON)  # Sample of failed records

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)

    # Relationships
    user = relationship("User")
    org = relationship("Org")

    __table_args__ = (
        Index("ix_import_org_user", "org_id", "user_id"),
        Index("ix_import_status", "status"),
        Index("ix_import_created", "created_at"),
    )


class SystemMetric(Base):
    """System metrics for monitoring and optimization"""
    __tablename__ = "system_metrics"

    id = Column(String, primary_key=True, default=_uid)
    org_id = Column(String, ForeignKey("orgs.id"))  # Nullable for system-wide metrics

    # Metric details
    metric_type = Column(String(50), nullable=False)  # api, ai, storage, processing
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String(20))  # ms, bytes, count, percentage

    # Context
    endpoint = Column(String(255))
    user_id = Column(String, ForeignKey("users.id"))
    project_id = Column(String, ForeignKey("projects.id"))

    # Performance
    response_time_p50 = Column(Float)
    response_time_p95 = Column(Float)
    response_time_p99 = Column(Float)
    error_rate = Column(Float)

    # Resource usage
    cpu_usage = Column(Float)
    memory_usage_mb = Column(Float)
    disk_io_mb = Column(Float)

    # AI-specific metrics
    tokens_used = Column(Integer)
    model_name = Column(String(50))
    ai_provider = Column(String(50))

    # Geographic distribution (SEA-specific)
    country_distribution = Column(JSON)  # {"SG": 30, "ID": 25, "MY": 20, ...}

    # Time window
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_metrics_org", "org_id"),
        Index("ix_metrics_type_name", "metric_type", "metric_name"),
        Index("ix_metrics_period", "period_start", "period_end"),
    )


class UsageQuota(Base):
    """Usage quotas and limits for organizations"""
    __tablename__ = "usage_quotas"

    id = Column(String, primary_key=True, default=_uid)
    org_id = Column(String, ForeignKey("orgs.id"), nullable=False, unique=True)

    # Storage quotas (in GB)
    storage_quota_gb = Column(Float, default=100.0)
    storage_used_gb = Column(Float, default=0.0)

    # User quotas
    user_quota = Column(Integer, default=100)
    users_active = Column(Integer, default=0)

    # Project quotas
    project_quota = Column(Integer, default=1000)
    projects_active = Column(Integer, default=0)

    # AI quotas (monthly)
    ai_calls_quota = Column(Integer, default=10000)
    ai_calls_used = Column(Integer, default=0)
    ai_tokens_quota = Column(Integer, default=1000000)
    ai_tokens_used = Column(Integer, default=0)

    # Processing quotas (monthly)
    video_processing_minutes_quota = Column(Integer, default=10000)
    video_processing_minutes_used = Column(Integer, default=0)
    audio_processing_minutes_quota = Column(Integer, default=50000)
    audio_processing_minutes_used = Column(Integer, default=0)

    # Export quotas (monthly)
    exports_quota = Column(Integer, default=100)
    exports_used = Column(Integer, default=0)

    # API quotas (per minute)
    api_rate_limit = Column(Integer, default=1000)

    # Billing
    billing_tier = Column(String(20), default="starter")  # starter, growth, enterprise
    billing_cycle = Column(String(20), default="monthly")  # monthly, annual
    next_reset_date = Column(DateTime)

    # Alerts
    storage_alert_threshold = Column(Float, default=0.8)  # Alert at 80%
    ai_alert_threshold = Column(Float, default=0.8)
    alert_emails = Column(JSON, default=[])

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_reset_at = Column(DateTime)

    # Relationships
    org = relationship("Org", back_populates="usage_quota")

    __table_args__ = (
        Index("ix_quota_org", "org_id"),
        CheckConstraint('storage_used_gb <= storage_quota_gb', name='check_storage_limit'),
        CheckConstraint('users_active <= user_quota', name='check_user_limit'),
        CheckConstraint('projects_active <= project_quota', name='check_project_limit'),
    )


class IntegrationConfig(Base):
    """Third-party integration configurations"""
    __tablename__ = "integration_configs"

    id = Column(String, primary_key=True, default=_uid)
    org_id = Column(String, ForeignKey("orgs.id"), nullable=False)

    # Integration details
    integration_type = Column(String(50), nullable=False)  # slack, teams, zapier, webhook
    integration_name = Column(String(100), nullable=False)

    # Configuration
    config = Column(JSON, nullable=False)  # Integration-specific config
    credentials = Column(JSON)  # Encrypted credentials

    # Webhooks
    webhook_url = Column(String(500))
    webhook_secret = Column(String(255))
    webhook_events = Column(JSON, default=[])  # List of events to send

    # OAuth (for Slack, Teams, etc.)
    oauth_token = Column(Text)  # Encrypted
    oauth_refresh_token = Column(Text)  # Encrypted
    oauth_expires_at = Column(DateTime)

    # Status
    is_active = Column(Boolean, default=True)
    last_sync_at = Column(DateTime)
    last_error = Column(Text)
    error_count = Column(Integer, default=0)

    # SEA-specific integrations
    supports_multilingual = Column(Boolean, default=False)
    default_language = Column(String(10), default="en")

    # Metadata
    created_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    org = relationship("Org")
    creator = relationship("User")

    __table_args__ = (
        Index("ix_integration_org", "org_id"),
        Index("ix_integration_type", "integration_type"),
        UniqueConstraint("org_id", "integration_type", "integration_name", name="uq_org_integration"),
    )


class CustomField(Base):
    """Custom fields for extending entities (projects, transcripts, etc.)"""
    __tablename__ = "custom_fields"

    id = Column(String, primary_key=True, default=_uid)
    org_id = Column(String, ForeignKey("orgs.id"), nullable=False)

    # Field definition
    field_name = Column(String(50), nullable=False)
    field_label = Column(String(100), nullable=False)
    field_type = Column(String(20), nullable=False)  # text, number, date, select, multiselect
    entity_type = Column(String(50), nullable=False)  # project, transcript, participant

    # Validation
    is_required = Column(Boolean, default=False)
    validation_rules = Column(JSON)  # Min/max, regex, etc.

    # Options (for select/multiselect)
    options = Column(JSON)  # List of valid options

    # Display
    display_order = Column(Integer, default=0)
    show_in_list = Column(Boolean, default=True)
    show_in_export = Column(Boolean, default=True)

    # SEA-specific
    translations = Column(JSON)  # {"id": "Nama Produk", "ms": "Nama Produk", ...}

    # Metadata
    is_active = Column(Boolean, default=True)
    created_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    org = relationship("Org")
    creator = relationship("User")

    __table_args__ = (
        Index("ix_custom_field_org_entity", "org_id", "entity_type"),
        UniqueConstraint("org_id", "entity_type", "field_name", name="uq_org_entity_field"),
    )


class CustomFieldValue(Base):
    """Values for custom fields"""
    __tablename__ = "custom_field_values"

    id = Column(String, primary_key=True, default=_uid)
    custom_field_id = Column(String, ForeignKey("custom_fields.id"), nullable=False)
    entity_id = Column(String, nullable=False)  # ID of the entity this value belongs to

    # Value storage (use appropriate column based on field type)
    text_value = Column(Text)
    number_value = Column(Float)
    date_value = Column(DateTime)
    json_value = Column(JSON)  # For multiselect and complex types

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("users.id"))

    # Relationships
    custom_field = relationship("CustomField")
    creator = relationship("User")

    __table_args__ = (
        Index("ix_custom_value_field_entity", "custom_field_id", "entity_id"),
        UniqueConstraint("custom_field_id", "entity_id", name="uq_field_entity"),
    )