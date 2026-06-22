"""
Phase 2: Analysis API endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from ..deps import get_db, get_current_user
from ..models import User, Project
from ..models_phase2 import (
    AnalysisGrid, GridCell, Evidence, ContentAnalysisReport,
    AnalysisType, GridType, Theme, Insight
)
from ..analysis_grid import AnalysisGridService, EvidenceService
from ..content_analysis import ContentAnalysisService


router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])


# Schemas
class CreateGridRequest(BaseModel):
    name: str
    grid_type: GridType
    analysis_type: AnalysisType = AnalysisType.BASIC
    config: Optional[dict] = None


class CreateComparativeGridRequest(BaseModel):
    name: str
    grid_type: GridType
    comparison_dimensions: List[str]
    config: Optional[dict] = None


class CreateMultimarketGridRequest(BaseModel):
    name: str
    markets: List[str]
    grid_type: GridType = GridType.THEMES


class AddCellRequest(BaseModel):
    row_id: str
    column_id: str
    content: str
    evidence_ids: Optional[List[str]] = None
    metadata: Optional[dict] = None


class PopulateGridRequest(BaseModel):
    transcript_ids: List[str]


class CompareMarketsRequest(BaseModel):
    markets: List[str]


class CreateEvidenceRequest(BaseModel):
    source_type: str
    source_id: str
    content: str
    evidence_type: str = "quote"
    segment_id: Optional[str] = None
    speaker: Optional[str] = None
    themes: Optional[List[str]] = None
    significance: Optional[str] = "medium"
    market: Optional[str] = None


class ExtractEvidenceRequest(BaseModel):
    transcript_id: str
    themes: Optional[List[str]] = None


class GenerateReportRequest(BaseModel):
    title: str
    report_type: str = "executive"
    grid_id: Optional[str] = None
    include_markets: Optional[List[str]] = None


class CreateThemeRequest(BaseModel):
    name: str
    description: str
    parent_id: Optional[str] = None
    color: Optional[str] = None


class CreateInsightRequest(BaseModel):
    title: str
    description: str
    category: str
    themes: List[str]
    priority: str = "medium"
    evidence_ids: Optional[List[str]] = None
    markets: Optional[List[str]] = None


# Grid Endpoints

@router.post("/grids/{project_id}")
async def create_grid(
    project_id: str,
    request: CreateGridRequest,
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
        name=request.name,
        grid_type=request.grid_type,
        analysis_type=request.analysis_type,
        config=request.config
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


@router.get("/grids/{project_id}")
async def list_grids(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all grids for a project"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    grids = db.query(AnalysisGrid).filter_by(project_id=project_id).all()

    return {
        "grids": [
            {
                "id": g.id,
                "name": g.name,
                "type": g.grid_type,
                "analysis_type": g.analysis_type,
                "created_at": g.created_at.isoformat()
            }
            for g in grids
        ]
    }


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


@router.get("/evidence/{project_id}")
async def search_evidence(
    project_id: str,
    themes: Optional[str] = Query(None),
    evidence_type: Optional[str] = Query(None),
    market: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search evidence with filters"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    service = EvidenceService(db)

    theme_list = themes.split(",") if themes else None

    evidence = await service.search_evidence(
        project_id=project_id,
        themes=theme_list,
        evidence_type=evidence_type,
        market=market
    )

    return {
        "evidence": [
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
    }


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
async def export_report(
    report_id: str,
    format: str = Query("docx", regex="^(docx|pdf|pptx)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export report in specified format"""
    report = db.query(ContentAnalysisReport).filter_by(id=report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if report.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    service = ContentAnalysisService(db)
    content = await service.export_report(report_id, format)

    # Return file response
    from fastapi.responses import Response

    content_type_map = {
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "pdf": "application/pdf",
        "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    }

    return Response(
        content=content,
        media_type=content_type_map[format],
        headers={
            "Content-Disposition": f'attachment; filename="{report.title}.{format}"'
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

    theme = Theme(
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

    themes = db.query(Theme).filter_by(project_id=project_id).all()

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