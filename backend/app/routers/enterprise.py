"""
Enterprise API Router
Phase 5: Premium enterprise features for SEA market leadership
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, BackgroundTasks, Request
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
import json

from ..deps import get_db, get_current_user, require_role
from ..models import User, Project, Org
from ..models_enterprise import (
    WhiteLabelConfig, AuditLog, DataExportJob, DataImportJob,
    SystemMetric, UsageQuota, IntegrationConfig, CustomField, CustomFieldValue
)
from ..services.audit_service import AuditService
from ..services.export_import_service import DataExportService, DataImportService
from ..schemas import PaginatedResponse
from ..config import settings

router = APIRouter(prefix="/api/v1/enterprise", tags=["enterprise"])


# ======================== Schemas ========================

class WhiteLabelConfigRequest(BaseModel):
    brand_name: str = Field(..., min_length=1, max_length=100)
    brand_logo_url: Optional[str] = None
    brand_favicon_url: Optional[str] = None
    brand_colors: Optional[Dict[str, str]] = None
    custom_domain: Optional[str] = None
    email_from_name: Optional[str] = None
    email_from_address: Optional[str] = None
    default_language: Optional[str] = Field("en", pattern="^(en|id|ms|th|vi|tl)$")
    supported_languages: Optional[List[str]] = ["en"]
    currency: Optional[str] = Field("USD", pattern="^[A-Z]{3}$")
    timezone: Optional[str] = "Asia/Singapore"
    enable_ai_insights: Optional[bool] = True
    enable_video_processing: Optional[bool] = True
    enable_collaboration: Optional[bool] = True
    enable_statistical_analysis: Optional[bool] = True
    enable_code_mixing: Optional[bool] = True
    enable_concept_testing: Optional[bool] = True


class WhiteLabelConfigResponse(BaseModel):
    id: str
    org_id: str
    brand_name: str
    brand_logo_url: Optional[str]
    brand_favicon_url: Optional[str]
    brand_colors: Dict[str, str]
    custom_domain: Optional[str]
    default_language: str
    supported_languages: List[str]
    currency: str
    timezone: str
    features: Dict[str, bool]
    created_at: datetime
    updated_at: datetime


class ExportRequest(BaseModel):
    export_type: str = Field(..., pattern="^(full|project|gdpr|analysis)$")
    format: str = Field(..., pattern="^(json|csv|xlsx|pdf|spss|nvivo|maxqda)$")
    project_ids: Optional[List[str]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    include_transcripts: Optional[bool] = True
    include_analysis: Optional[bool] = True
    include_media: Optional[bool] = False
    include_deleted: Optional[bool] = False
    anonymize_pii: Optional[bool] = False
    language: Optional[str] = "en"
    timezone: Optional[str] = "UTC"


class ImportRequest(BaseModel):
    import_type: str = Field(..., pattern="^(transcripts|analysis|codebook|migration)$")
    source_format: str = Field(..., pattern="^(json|csv|xlsx|nvivo|maxqda|atlas)$")
    source_system: Optional[str] = None
    field_mappings: Optional[Dict[str, str]] = None
    default_values: Optional[Dict[str, Any]] = None
    validate_only: Optional[bool] = False
    skip_duplicates: Optional[bool] = True
    merge_strategy: Optional[str] = Field("skip", pattern="^(skip|replace|merge)$")


class AuditLogResponse(BaseModel):
    id: str
    org_id: str
    user_id: str
    user_email: Optional[str]
    action: str
    entity_type: str
    entity_id: Optional[str]
    entity_name: Optional[str]
    ip_address: Optional[str]
    country_code: Optional[str]
    response_status: Optional[int]
    response_time_ms: Optional[float]
    data_classification: Optional[str]
    contains_pii: bool
    gdpr_relevant: bool
    created_at: datetime


class UsageQuotaResponse(BaseModel):
    org_id: str
    storage: Dict[str, float]
    users: Dict[str, int]
    projects: Dict[str, int]
    ai: Dict[str, int]
    processing: Dict[str, int]
    exports: Dict[str, int]
    billing_tier: str
    next_reset_date: Optional[datetime]


class IntegrationConfigRequest(BaseModel):
    integration_type: str = Field(..., pattern="^(slack|teams|zapier|webhook)$")
    integration_name: str = Field(..., min_length=1, max_length=100)
    config: Dict[str, Any]
    webhook_url: Optional[str] = None
    webhook_events: Optional[List[str]] = None
    is_active: Optional[bool] = True


class CustomFieldRequest(BaseModel):
    field_name: str = Field(..., min_length=1, max_length=50, pattern="^[a-z_][a-z0-9_]*$")
    field_label: str = Field(..., min_length=1, max_length=100)
    field_type: str = Field(..., pattern="^(text|number|date|select|multiselect)$")
    entity_type: str = Field(..., pattern="^(project|transcript|participant)$")
    is_required: Optional[bool] = False
    validation_rules: Optional[Dict[str, Any]] = None
    options: Optional[List[str]] = None
    display_order: Optional[int] = 0
    translations: Optional[Dict[str, str]] = None


# ======================== White Label Configuration ========================

@router.get("/white-label", response_model=WhiteLabelConfigResponse)
async def get_white_label_config(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get white-label configuration for organization"""

    config = db.query(WhiteLabelConfig).filter_by(org_id=current_user.org_id).first()

    if not config:
        raise HTTPException(status_code=404, detail="White-label configuration not found")

    # Log action
    await AuditService.log_action(
        db, current_user, "read", "white_label_config", config.id,
        request=request, response_status=200
    )

    return WhiteLabelConfigResponse(
        id=config.id,
        org_id=config.org_id,
        brand_name=config.brand_name,
        brand_logo_url=config.brand_logo_url,
        brand_favicon_url=config.brand_favicon_url,
        brand_colors=config.brand_colors,
        custom_domain=config.custom_domain,
        default_language=config.default_language,
        supported_languages=config.supported_languages,
        currency=config.currency,
        timezone=config.timezone,
        features={
            "ai_insights": config.enable_ai_insights,
            "video_processing": config.enable_video_processing,
            "collaboration": config.enable_collaboration,
            "statistical_analysis": config.enable_statistical_analysis,
            "code_mixing": config.enable_code_mixing,
            "concept_testing": config.enable_concept_testing
        },
        created_at=config.created_at,
        updated_at=config.updated_at
    )


@router.put("/white-label", response_model=WhiteLabelConfigResponse)
async def update_white_label_config(
    request_data: WhiteLabelConfigRequest,
    request: Request,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Update white-label configuration (admin only)"""

    config = db.query(WhiteLabelConfig).filter_by(org_id=current_user.org_id).first()

    if not config:
        # Create new config
        from ..models import _uid
        config = WhiteLabelConfig(
            id=_uid(),
            org_id=current_user.org_id
        )
        db.add(config)

    # Store old values for audit
    old_values = {
        "brand_name": config.brand_name,
        "custom_domain": config.custom_domain
    }

    # Update fields
    config.brand_name = request_data.brand_name
    if request_data.brand_logo_url is not None:
        config.brand_logo_url = request_data.brand_logo_url
    if request_data.brand_favicon_url is not None:
        config.brand_favicon_url = request_data.brand_favicon_url
    if request_data.brand_colors:
        config.brand_colors = request_data.brand_colors
    if request_data.custom_domain is not None:
        config.custom_domain = request_data.custom_domain
    if request_data.email_from_name is not None:
        config.email_from_name = request_data.email_from_name
    if request_data.email_from_address is not None:
        config.email_from_address = request_data.email_from_address

    config.default_language = request_data.default_language
    config.supported_languages = request_data.supported_languages
    config.currency = request_data.currency
    config.timezone = request_data.timezone

    config.enable_ai_insights = request_data.enable_ai_insights
    config.enable_video_processing = request_data.enable_video_processing
    config.enable_collaboration = request_data.enable_collaboration
    config.enable_statistical_analysis = request_data.enable_statistical_analysis
    config.enable_code_mixing = request_data.enable_code_mixing
    config.enable_concept_testing = request_data.enable_concept_testing

    config.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(config)

    # Log action
    await AuditService.log_action(
        db, current_user, "update", "white_label_config", config.id,
        request=request, old_values=old_values,
        new_values={"brand_name": config.brand_name, "custom_domain": config.custom_domain},
        response_status=200
    )

    return WhiteLabelConfigResponse(
        id=config.id,
        org_id=config.org_id,
        brand_name=config.brand_name,
        brand_logo_url=config.brand_logo_url,
        brand_favicon_url=config.brand_favicon_url,
        brand_colors=config.brand_colors,
        custom_domain=config.custom_domain,
        default_language=config.default_language,
        supported_languages=config.supported_languages,
        currency=config.currency,
        timezone=config.timezone,
        features={
            "ai_insights": config.enable_ai_insights,
            "video_processing": config.enable_video_processing,
            "collaboration": config.enable_collaboration,
            "statistical_analysis": config.enable_statistical_analysis,
            "code_mixing": config.enable_code_mixing,
            "concept_testing": config.enable_concept_testing
        },
        created_at=config.created_at,
        updated_at=config.updated_at
    )


# ======================== Audit Logging ========================

@router.get("/audit-logs", response_model=PaginatedResponse)
async def get_audit_logs(
    request: Request,
    user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    ip_address: Optional[str] = Query(None),
    contains_pii: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Get audit logs with filters (admin only)"""

    # Query logs
    logs, total = AuditService.query_logs(
        db, current_user.org_id, user_id, action, entity_type, entity_id,
        date_from, date_to, ip_address, contains_pii, limit, skip
    )

    # Format response
    items = []
    for log in logs:
        user = db.query(User).filter_by(id=log.user_id).first()
        items.append(AuditLogResponse(
            id=log.id,
            org_id=log.org_id,
            user_id=log.user_id,
            user_email=user.email if user else "Unknown",
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            entity_name=log.entity_name,
            ip_address=log.ip_address,
            country_code=log.country_code,
            response_status=log.response_status,
            response_time_ms=log.response_time_ms,
            data_classification=log.data_classification,
            contains_pii=log.contains_pii,
            gdpr_relevant=log.gdpr_relevant,
            created_at=log.created_at
        ))

    # Log this audit query
    await AuditService.log_action(
        db, current_user, "read", "audit_logs", None,
        request=request, response_status=200
    )

    return PaginatedResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total
    )


@router.get("/audit-logs/summary/{user_id}")
async def get_user_activity_summary(
    user_id: str,
    days: int = Query(30, ge=1, le=365),
    request: Request = None,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Get user activity summary (admin only)"""

    summary = AuditService.get_user_activity_summary(
        db, current_user.org_id, user_id, days
    )

    # Log action
    await AuditService.log_action(
        db, current_user, "read", "audit_summary", user_id,
        request=request, response_status=200
    )

    return summary


@router.get("/audit-logs/compliance-report")
async def get_compliance_report(
    date_from: datetime,
    date_to: datetime,
    request: Request = None,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Generate compliance report (admin only)"""

    report = AuditService.get_compliance_report(
        db, current_user.org_id, date_from, date_to
    )

    # Log action
    await AuditService.log_action(
        db, current_user, "export", "compliance_report", None,
        request=request, response_status=200
    )

    return report


# ======================== Data Export/Import ========================

@router.post("/export")
async def create_export_job(
    export_request: ExportRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a data export job"""

    # Check export quota
    quota = db.query(UsageQuota).filter_by(org_id=current_user.org_id).first()
    if quota and quota.exports_used >= quota.exports_quota:
        raise HTTPException(status_code=429, detail="Export quota exceeded")

    # Create export job
    job = DataExportService.create_export_job(
        db, current_user,
        export_request.export_type,
        export_request.format,
        export_request.project_ids,
        export_request.date_from,
        export_request.date_to,
        export_request.include_transcripts,
        export_request.include_analysis,
        export_request.include_media,
        export_request.include_deleted,
        export_request.anonymize_pii,
        export_request.language,
        export_request.timezone
    )

    # Update quota
    if quota:
        quota.exports_used += 1
        db.commit()

    # Log action
    await AuditService.log_action(
        db, current_user, "export", "data", None,
        entity_name=f"{export_request.export_type} export in {export_request.format}",
        request=request, response_status=200
    )

    return {
        "job_id": job.id,
        "status": job.status,
        "message": "Export job created successfully"
    }


@router.get("/export/{job_id}")
async def get_export_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get export job status"""

    job = db.query(DataExportJob).filter_by(
        id=job_id,
        org_id=current_user.org_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Export job not found")

    return {
        "job_id": job.id,
        "status": job.status,
        "progress": job.progress,
        "file_size_mb": job.file_size_mb,
        "download_url": job.download_url,
        "download_expires": job.download_expires,
        "error_message": job.error_message,
        "created_at": job.created_at,
        "completed_at": job.completed_at
    }


@router.get("/export/{job_id}/download")
async def download_export(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download exported data"""

    job = db.query(DataExportJob).filter_by(
        id=job_id,
        org_id=current_user.org_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Export job not found")

    if job.status != "completed":
        raise HTTPException(status_code=400, detail="Export not yet completed")

    if not job.file_path:
        raise HTTPException(status_code=404, detail="Export file not found")

    # Update download count
    job.download_count += 1
    db.commit()

    # Return file
    return FileResponse(
        path=job.file_path,
        filename=f"export_{job.id}.{job.format}",
        media_type="application/octet-stream"
    )


@router.post("/import")
async def create_import_job(
    import_request: ImportRequest,
    file: UploadFile = File(...),
    request: Request = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a data import job"""

    # Save uploaded file
    import tempfile
    import shutil
    from pathlib import Path

    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
        shutil.copyfileobj(file.file, tmp_file)
        temp_path = tmp_file.name

    # Validate file
    valid, errors = DataImportService.validate_import_file(temp_path, import_request.source_format)
    if not valid:
        Path(temp_path).unlink()  # Delete temp file
        raise HTTPException(status_code=400, detail=f"Invalid file: {', '.join(errors)}")

    # Create import job
    job = DataImportService.create_import_job(
        db, current_user,
        import_request.import_type,
        import_request.source_format,
        temp_path,
        import_request.field_mappings,
        import_request.default_values,
        import_request.validate_only,
        import_request.skip_duplicates,
        import_request.merge_strategy
    )

    # Log action
    await AuditService.log_action(
        db, current_user, "import", "data", None,
        entity_name=f"{import_request.import_type} import from {import_request.source_format}",
        request=request, response_status=200
    )

    return {
        "job_id": job.id,
        "status": job.status,
        "message": "Import job created successfully"
    }


@router.get("/import/{job_id}")
async def get_import_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get import job status"""

    job = db.query(DataImportJob).filter_by(
        id=job_id,
        org_id=current_user.org_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Import job not found")

    return {
        "job_id": job.id,
        "status": job.status,
        "progress": job.progress,
        "records_processed": job.records_processed,
        "records_imported": job.records_imported,
        "records_skipped": job.records_skipped,
        "records_failed": job.records_failed,
        "validation_errors": job.validation_errors,
        "error_message": job.error_message,
        "created_at": job.created_at,
        "completed_at": job.completed_at
    }


# ======================== Usage & Quotas ========================

@router.get("/usage", response_model=UsageQuotaResponse)
async def get_usage_quota(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get organization usage and quotas"""

    quota = db.query(UsageQuota).filter_by(org_id=current_user.org_id).first()

    if not quota:
        raise HTTPException(status_code=404, detail="Usage quota not found")

    return UsageQuotaResponse(
        org_id=quota.org_id,
        storage={
            "quota_gb": quota.storage_quota_gb,
            "used_gb": quota.storage_used_gb,
            "percentage": (quota.storage_used_gb / quota.storage_quota_gb * 100) if quota.storage_quota_gb > 0 else 0
        },
        users={
            "quota": quota.user_quota,
            "active": quota.users_active,
            "remaining": quota.user_quota - quota.users_active
        },
        projects={
            "quota": quota.project_quota,
            "active": quota.projects_active,
            "remaining": quota.project_quota - quota.projects_active
        },
        ai={
            "calls_quota": quota.ai_calls_quota,
            "calls_used": quota.ai_calls_used,
            "tokens_quota": quota.ai_tokens_quota,
            "tokens_used": quota.ai_tokens_used
        },
        processing={
            "video_minutes_quota": quota.video_processing_minutes_quota,
            "video_minutes_used": quota.video_processing_minutes_used,
            "audio_minutes_quota": quota.audio_processing_minutes_quota,
            "audio_minutes_used": quota.audio_processing_minutes_used
        },
        exports={
            "quota": quota.exports_quota,
            "used": quota.exports_used,
            "remaining": quota.exports_quota - quota.exports_used
        },
        billing_tier=quota.billing_tier,
        next_reset_date=quota.next_reset_date
    )


# ======================== Custom Fields ========================

@router.post("/custom-fields")
async def create_custom_field(
    field_request: CustomFieldRequest,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Create a custom field (admin only)"""

    # Check if field already exists
    existing = db.query(CustomField).filter_by(
        org_id=current_user.org_id,
        entity_type=field_request.entity_type,
        field_name=field_request.field_name
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Field already exists")

    from ..models import _uid
    field = CustomField(
        id=_uid(),
        org_id=current_user.org_id,
        field_name=field_request.field_name,
        field_label=field_request.field_label,
        field_type=field_request.field_type,
        entity_type=field_request.entity_type,
        is_required=field_request.is_required,
        validation_rules=field_request.validation_rules,
        options=field_request.options,
        display_order=field_request.display_order,
        translations=field_request.translations,
        created_by=current_user.id
    )

    db.add(field)
    db.commit()
    db.refresh(field)

    return {
        "id": field.id,
        "field_name": field.field_name,
        "message": "Custom field created successfully"
    }


@router.get("/custom-fields/{entity_type}")
async def get_custom_fields(
    entity_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get custom fields for an entity type"""

    fields = db.query(CustomField).filter_by(
        org_id=current_user.org_id,
        entity_type=entity_type,
        is_active=True
    ).order_by(CustomField.display_order).all()

    return [
        {
            "id": field.id,
            "field_name": field.field_name,
            "field_label": field.field_label,
            "field_type": field.field_type,
            "is_required": field.is_required,
            "validation_rules": field.validation_rules,
            "options": field.options,
            "translations": field.translations
        }
        for field in fields
    ]


# ======================== Integrations ========================

@router.post("/integrations")
async def create_integration(
    integration_request: IntegrationConfigRequest,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Configure a third-party integration (admin only)"""

    # Check if integration already exists
    existing = db.query(IntegrationConfig).filter_by(
        org_id=current_user.org_id,
        integration_type=integration_request.integration_type,
        integration_name=integration_request.integration_name
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Integration already exists")

    from ..models import _uid
    integration = IntegrationConfig(
        id=_uid(),
        org_id=current_user.org_id,
        integration_type=integration_request.integration_type,
        integration_name=integration_request.integration_name,
        config=integration_request.config,
        webhook_url=integration_request.webhook_url,
        webhook_events=integration_request.webhook_events,
        is_active=integration_request.is_active,
        created_by=current_user.id
    )

    db.add(integration)
    db.commit()
    db.refresh(integration)

    return {
        "id": integration.id,
        "integration_type": integration.integration_type,
        "integration_name": integration.integration_name,
        "is_active": integration.is_active,
        "message": "Integration configured successfully"
    }


@router.get("/integrations")
async def get_integrations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all configured integrations"""

    integrations = db.query(IntegrationConfig).filter_by(
        org_id=current_user.org_id
    ).all()

    return [
        {
            "id": integration.id,
            "integration_type": integration.integration_type,
            "integration_name": integration.integration_name,
            "is_active": integration.is_active,
            "last_sync_at": integration.last_sync_at,
            "error_count": integration.error_count,
            "created_at": integration.created_at
        }
        for integration in integrations
    ]


@router.delete("/integrations/{integration_id}")
async def delete_integration(
    integration_id: str,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Delete an integration (admin only)"""

    integration = db.query(IntegrationConfig).filter_by(
        id=integration_id,
        org_id=current_user.org_id
    ).first()

    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    db.delete(integration)
    db.commit()

    return {"message": "Integration deleted successfully"}