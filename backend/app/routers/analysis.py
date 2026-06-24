"""
Phase 2: Analysis API endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field, validator
from datetime import datetime
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..deps import get_db, get_current_user, require_role
from ..models import User, Project
from ..models_phase2 import (
    AnalysisGrid, GridCell, Evidence, ContentAnalysisReport,
    AnalysisType, GridType, AnalysisTheme, Insight
)
from ..analysis_grid import AnalysisGridService, EvidenceService
from ..content_analysis import ContentAnalysisService
from ..validators_phase2 import (
    validate_grid_name, validate_markets, validate_comparison_dimensions,
    validate_evidence_content, validate_theme_data, validate_insight_data,
    validate_report_title, sanitize_cell_content, validate_grid_config,
    GridCellValidator, ReportExportValidator, validate_search_params,
    MAX_EXPORT_SIZE
)
from ..schemas import PaginatedResponse

# Create rate limiter
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])


# Schemas with validation
class CreateGridRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    grid_type: GridType
    analysis_type: AnalysisType = AnalysisType.BASIC
    config: Optional[dict] = None

    @validator('name')
    def validate_name(cls, v):
        valid, error = validate_grid_name(v)
        if not valid:
            raise ValueError(error)
        return v

    @validator('config')
    def validate_config(cls, v):
        if v:
            valid, error = validate_grid_config(v)
            if not valid:
                raise ValueError(error)
        return v


class CreateComparativeGridRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    grid_type: GridType
    comparison_dimensions: List[str] = Field(..., min_items=1, max_items=10)
    config: Optional[dict] = None

    @validator('name')
    def validate_name(cls, v):
        valid, error = validate_grid_name(v)
        if not valid:
            raise ValueError(error)
        return v

    @validator('comparison_dimensions')
    def validate_dimensions(cls, v):
        valid, error = validate_comparison_dimensions(v)
        if not valid:
            raise ValueError(error)
        return v


class CreateMultimarketGridRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    markets: List[str] = Field(..., min_items=1, max_items=20)
    grid_type: GridType = GridType.THEMES

    @validator('name')
    def validate_name(cls, v):
        valid, error = validate_grid_name(v)
        if not valid:
            raise ValueError(error)
        return v

    @validator('markets')
    def validate_markets_list(cls, v):
        valid, error = validate_markets(v)
        if not valid:
            raise ValueError(error)
        return v


class AddCellRequest(BaseModel):
    row_id: str = Field(..., min_length=1)
    column_id: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1, max_length=10000)
    evidence_ids: Optional[List[str]] = Field(None, max_items=100)
    metadata: Optional[dict] = None

    @validator('content')
    def sanitize_content(cls, v):
        return sanitize_cell_content(v)

    @validator('*', pre=True)
    def validate_cell(cls, v, values):
        if 'row_id' in values and 'column_id' in values and 'content' in values:
            valid, error = GridCellValidator.validate_cell_data(
                values['row_id'], values['column_id'], values['content'],
                values.get('evidence_ids')
            )
            if not valid:
                raise ValueError(error)
        return v


class PopulateGridRequest(BaseModel):
    transcript_ids: List[str] = Field(..., min_items=1, max_items=50)


class CompareMarketsRequest(BaseModel):
    markets: List[str] = Field(..., min_items=1, max_items=20)

    @validator('markets')
    def validate_markets_list(cls, v):
        valid, error = validate_markets(v)
        if not valid:
            raise ValueError(error)
        return v


class CreateEvidenceRequest(BaseModel):
    source_type: str = Field(..., min_length=1, max_length=50)
    source_id: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1, max_length=10000)
    evidence_type: str = Field("quote", pattern="^(quote|observation|insight|data_point|image|video)$")
    segment_id: Optional[str] = None
    speaker: Optional[str] = Field(None, max_length=100)
    themes: Optional[List[str]] = Field(None, max_items=20)
    significance: Optional[str] = Field("medium", pattern="^(low|medium|high|critical)$")
    market: Optional[str] = Field(None, max_length=50)

    @validator('content')
    def validate_evidence(cls, v):
        valid, error = validate_evidence_content(v)
        if not valid:
            raise ValueError(error)
        return sanitize_cell_content(v)


class ExtractEvidenceRequest(BaseModel):
    transcript_id: str = Field(..., min_length=1)
    themes: Optional[List[str]] = Field(None, max_items=20)


class GenerateReportRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    report_type: str = Field("executive", pattern="^(executive|detailed|summary|comparative)$")
    grid_id: Optional[str] = None
    include_markets: Optional[List[str]] = Field(None, max_items=20)

    @validator('title')
    def validate_title(cls, v):
        valid, error = validate_report_title(v)
        if not valid:
            raise ValueError(error)
        return v


class CreateThemeRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    parent_id: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")

    @validator('*', pre=True)
    def validate_theme(cls, v, values):
        if 'name' in values and 'description' in values:
            valid, error = validate_theme_data(values['name'], values['description'])
            if not valid:
                raise ValueError(error)
        return v


class CreateInsightRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    category: str = Field(..., min_length=1, max_length=50)
    themes: List[str] = Field(..., min_items=1, max_items=10)
    priority: str = Field("medium", pattern="^(low|medium|high|critical)$")
    evidence_ids: Optional[List[str]] = Field(None, max_items=50)
    markets: Optional[List[str]] = Field(None, max_items=20)

    @validator('*', pre=True)
    def validate_insight(cls, v, values):
        if 'title' in values and 'description' in values and 'themes' in values:
            valid, error = validate_insight_data(
                values['title'], values['description'], values['themes']
            )
            if not valid:
                raise ValueError(error)
        return v


# Grid Endpoints

@router.post("/grids/{project_id}")
@limiter.limit("10/minute")
async def create_grid(
    request: Request,
    project_id: str,
    body: CreateGridRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new analysis grid"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    service = AnalysisGridService(db)
    grid = await service.create_grid(
        project_id=project_id,
        name=body.name,
        grid_type=body.grid_type,
        analysis_type=body.analysis_type,
        config=body.config
    )

    return {"grid_id": grid.id, "status": "created"}


@router.post("/grids/{project_id}/comparative")
async def create_comparative_grid(
    project_id: str,
    request: CreateComparativeGridRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comparative analysis grid"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    service = AnalysisGridService(db)
    grid = await service.create_comparative_grid(
        project_id=project_id,
        name=request.name,
        grid_type=request.grid_type,
        comparison_dimensions=request.comparison_dimensions,
        config=request.config
    )

    return {"grid_id": grid.id, "status": "created"}


@router.post("/grids/{project_id}/multimarket")
async def create_multimarket_grid(
    project_id: str,
    request: CreateMultimarketGridRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a multi-market comparison grid"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    service = AnalysisGridService(db)
    grid = await service.create_multimarket_grid(
        project_id=project_id,
        name=request.name,
        markets=request.markets,
        grid_type=request.grid_type
    )

    return {"grid_id": grid.id, "status": "created", "markets": request.markets}


@router.get("/grids/{project_id}", response_model=PaginatedResponse)
async def list_grids(
    project_id: str,
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all grids for a project with pagination"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get total count
    total = db.query(func.count(AnalysisGrid.id)).filter_by(project_id=project_id).scalar()

    # Get paginated grids
    grids = (db.query(AnalysisGrid)
            .filter_by(project_id=project_id)
            .order_by(AnalysisGrid.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all())

    items = [
        {
            "id": g.id,
            "name": g.name,
            "type": g.grid_type,
            "analysis_type": g.analysis_type,
            "created_at": g.created_at.isoformat()
        }
        for g in grids
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total
    )


@router.get("/grids/detail/{grid_id}")
async def get_grid(
    grid_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get grid details with cells"""
    grid = db.query(AnalysisGrid).filter_by(id=grid_id).first()

    if not grid:
        raise HTTPException(status_code=404, detail="Grid not found")

    # Verify access
    if grid.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    cells = db.query(GridCell).filter_by(grid_id=grid_id).all()

    return {
        "grid": {
            "id": grid.id,
            "name": grid.name,
            "type": grid.grid_type,
            "analysis_type": grid.analysis_type,
            "columns": grid.columns,
            "rows": grid.rows,
            "config": grid.config
        },
        "cells": [
            {
                "id": c.id,
                "row_id": c.row_id,
                "column_id": c.column_id,
                "content": c.content,
                "evidence_ids": c.evidence_ids
            }
            for c in cells
        ]
    }


class UpdateGridRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    config: Optional[dict] = None

    @validator('name')
    def validate_name(cls, v):
        if v:
            valid, error = validate_grid_name(v)
            if not valid:
                raise ValueError(error)
        return v

    @validator('config')
    def validate_config(cls, v):
        if v:
            valid, error = validate_grid_config(v)
            if not valid:
                raise ValueError(error)
        return v


@router.put("/grids/{grid_id}")
async def update_grid(
    grid_id: str,
    request: UpdateGridRequest,
    current_user: User = Depends(require_role("admin", "researcher")),
    db: Session = Depends(get_db)
):
    """Update an existing grid"""
    grid = db.query(AnalysisGrid).filter_by(id=grid_id).first()

    if not grid:
        raise HTTPException(status_code=404, detail="Grid not found")

    # Verify access
    if grid.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Update fields if provided
    if request.name is not None:
        grid.name = request.name
    if request.config is not None:
        grid.config = request.config

    grid.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(grid)

    return {"grid_id": grid.id, "status": "updated"}


@router.delete("/grids/{grid_id}")
async def delete_grid(
    grid_id: str,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Delete a grid and all associated data"""
    grid = db.query(AnalysisGrid).filter_by(id=grid_id).first()

    if not grid:
        raise HTTPException(status_code=404, detail="Grid not found")

    # Verify access
    if grid.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Delete associated cells
    db.query(GridCell).filter_by(grid_id=grid_id).delete()

    # Delete the grid
    db.delete(grid)
    db.commit()

    return {"grid_id": grid_id, "status": "deleted"}


@router.post("/grids/{grid_id}/cells")
async def add_grid_cell(
    grid_id: str,
    request: AddCellRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add or update a cell in the grid"""
    grid = db.query(AnalysisGrid).filter_by(id=grid_id).first()

    if not grid:
        raise HTTPException(status_code=404, detail="Grid not found")

    if grid.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    service = AnalysisGridService(db)
    cell = await service.add_cell(
        grid_id=grid_id,
        row_id=request.row_id,
        column_id=request.column_id,
        content=request.content,
        evidence_ids=request.evidence_ids,
        metadata=request.metadata
    )

    return {"cell_id": cell.id, "status": "saved"}


@router.post("/grids/{grid_id}/populate")
async def populate_grid(
    grid_id: str,
    request: PopulateGridRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Auto-populate grid from transcripts"""
    grid = db.query(AnalysisGrid).filter_by(id=grid_id).first()

    if not grid:
        raise HTTPException(status_code=404, detail="Grid not found")

    if grid.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    service = AnalysisGridService(db)
    result = await service.populate_from_transcripts(
        grid_id=grid_id,
        transcript_ids=request.transcript_ids
    )

    return result


@router.post("/grids/{grid_id}/compare")
async def compare_markets(
    grid_id: str,
    request: CompareMarketsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate market comparison for grid"""
    grid = db.query(AnalysisGrid).filter_by(id=grid_id).first()

    if not grid:
        raise HTTPException(status_code=404, detail="Grid not found")

    if grid.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    service = AnalysisGridService(db)
    result = await service.compare_markets(
        grid_id=grid_id,
        markets=request.markets
    )

    return result


# Evidence Endpoints

@router.post("/evidence/{project_id}")
async def create_evidence(
    project_id: str,
    request: CreateEvidenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new evidence entry"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    service = EvidenceService(db)
    evidence = await service.create_evidence(
        project_id=project_id,
        source_type=request.source_type,
        source_id=request.source_id,
        content=request.content,
        evidence_type=request.evidence_type,
        segment_id=request.segment_id,
        speaker=request.speaker,
        themes=request.themes,
        significance=request.significance,
        market=request.market
    )

    return {"evidence_id": evidence.id, "status": "created"}


@router.post("/evidence/extract")
async def extract_evidence(
    request: ExtractEvidenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Extract evidence from transcript"""
    # Verify transcript access
    from ..models import Transcript

    transcript = db.query(Transcript).filter_by(
        id=request.transcript_id,
        org_id=current_user.org_id
    ).first()

    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    service = EvidenceService(db)
    evidence_list = await service.extract_from_transcript(
        transcript_id=request.transcript_id,
        themes=request.themes
    )

    return {
        "evidence_extracted": len(evidence_list),
        "evidence_ids": [e.id for e in evidence_list]
    }


@router.get("/evidence/{project_id}", response_model=PaginatedResponse)
async def search_evidence(
    project_id: str,
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    themes: Optional[str] = Query(None, description="Comma-separated theme IDs"),
    evidence_type: Optional[str] = Query(None),
    market: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search evidence with filters and pagination"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate search parameters
    theme_list = themes.split(",") if themes else None
    valid, error = validate_search_params(theme_list, evidence_type, market)
    if not valid:
        raise HTTPException(status_code=400, detail=error)

    # Build query
    query = db.query(Evidence).filter_by(project_id=project_id)

    if theme_list:
        query = query.filter(Evidence.themes.contains(theme_list))
    if evidence_type:
        query = query.filter_by(evidence_type=evidence_type)
    if market:
        query = query.filter_by(market=market)

    # Get total count
    total = query.count()

    # Get paginated results
    evidence = query.order_by(Evidence.created_at.desc()).offset(skip).limit(limit).all()

    items = [
        {
            "id": e.id,
            "content": e.content,
            "source_type": e.source_type,
            "evidence_type": e.evidence_type,
            "speaker": e.speaker,
            "themes": e.themes,
            "significance": e.significance,
            "market": e.market
        }
        for e in evidence
    ]

    return PaginatedResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total
    )


# Report Endpoints

@router.post("/reports/{project_id}")
async def generate_report(
    project_id: str,
    request: GenerateReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate content analysis report"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    service = ContentAnalysisService(db)
    report = await service.generate_report(
        project_id=project_id,
        title=request.title,
        report_type=request.report_type,
        grid_id=request.grid_id,
        include_markets=request.include_markets
    )

    return {
        "report_id": report.id,
        "status": "generated",
        "title": report.title
    }


@router.get("/reports/{project_id}")
async def list_reports(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all reports for a project"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    reports = db.query(ContentAnalysisReport).filter_by(
        project_id=project_id
    ).all()

    return {
        "reports": [
            {
                "id": r.id,
                "title": r.title,
                "type": r.report_type,
                "generated_at": r.generated_at.isoformat()
            }
            for r in reports
        ]
    }


@router.get("/reports/detail/{report_id}")
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get full report details"""
    report = db.query(ContentAnalysisReport).filter_by(id=report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        "report": {
            "id": report.id,
            "title": report.title,
            "type": report.report_type,
            "executive_summary": report.executive_summary,
            "methodology": report.methodology,
            "key_findings": report.key_findings,
            "themes_analysis": report.themes_analysis,
            "recommendations": report.recommendations,
            "market_comparison": report.market_comparison,
            "regional_patterns": report.regional_patterns,
            "statistics": report.statistics,
            "generated_at": report.generated_at.isoformat()
        }
    }


@router.get("/reports/{report_id}/export")
@limiter.limit("5/minute")  # Limit export requests
async def export_report(
    request: Request,
    report_id: str,
    format: str = Query("docx", pattern="^(docx|pdf|pptx|xlsx|json)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export report in specified format with size validation"""
    report = db.query(ContentAnalysisReport).filter_by(id=report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Validate export format
    valid, error = validate_export_format(format)
    if not valid:
        raise HTTPException(status_code=400, detail=error)

    # Estimate report size
    import json
    report_data = {
        "title": report.title,
        "executive_summary": report.executive_summary,
        "methodology": report.methodology,
        "key_findings": report.key_findings,
        "themes_analysis": report.themes_analysis,
        "recommendations": report.recommendations,
        "market_comparison": report.market_comparison,
        "regional_patterns": report.regional_patterns,
        "statistics": report.statistics
    }
    estimated_size = len(json.dumps(report_data))

    # Check size limits
    valid, error = ReportExportValidator.validate_export_request(estimated_size, format)
    if not valid:
        raise HTTPException(status_code=413, detail=error)

    service = ContentAnalysisService(db)

    try:
        content = await service.export_report(report_id, format)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

    # Check actual content size
    if len(content) > MAX_EXPORT_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Generated report exceeds maximum size limit of {MAX_EXPORT_SIZE // (1024*1024)}MB"
        )

    # Return file response
    from fastapi.responses import Response

    content_type_map = {
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "pdf": "application/pdf",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "json": "application/json"
    }

    # Sanitize filename
    import re
    safe_title = re.sub(r'[^a-zA-Z0-9\s\-_]', '', report.title)[:100]

    return Response(
        content=content,
        media_type=content_type_map[format],
        headers={
            "Content-Disposition": f'attachment; filename="{safe_title}.{format}"',
            "Content-Length": str(len(content))
        }
    )


# Theme Endpoints

@router.post("/themes/{project_id}")
async def create_theme(
    project_id: str,
    request: CreateThemeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new theme"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    from ..models import _uid

    theme = AnalysisTheme(
        id=_uid(),
        project_id=project_id,
        name=request.name,
        description=request.description,
        parent_id=request.parent_id,
        color=request.color
    )

    db.add(theme)
    db.commit()

    return {"theme_id": theme.id, "status": "created"}


@router.get("/themes/{project_id}")
async def list_themes(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all themes for a project"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    themes = db.query(AnalysisTheme).filter_by(project_id=project_id).all()

    return {
        "themes": [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "parent_id": t.parent_id,
                "frequency": t.frequency,
                "color": t.color
            }
            for t in themes
        ]
    }


# Insight Endpoints

@router.post("/insights/{project_id}")
async def create_insight(
    project_id: str,
    request: CreateInsightRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new insight"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    from ..models import _uid

    insight = Insight(
        id=_uid(),
        project_id=project_id,
        title=request.title,
        description=request.description,
        category=request.category,
        themes=request.themes,
        priority=request.priority,
        evidence_ids=request.evidence_ids or [],
        markets=request.markets or [],
        created_by=current_user.id
    )

    db.add(insight)
    db.commit()

    return {"insight_id": insight.id, "status": "created"}


@router.get("/insights/{project_id}")
async def list_insights(
    project_id: str,
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List insights for a project"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(Insight).filter_by(project_id=project_id)

    if priority:
        query = query.filter_by(priority=priority)
    if category:
        query = query.filter_by(category=category)

    insights = query.all()

    return {
        "insights": [
            {
                "id": i.id,
                "title": i.title,
                "description": i.description,
                "category": i.category,
                "priority": i.priority,
                "themes": i.themes,
                "markets": i.markets,
                "validated": i.validated
            }
            for i in insights
        ]
    }