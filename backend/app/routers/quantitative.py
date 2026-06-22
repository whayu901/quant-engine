"""
Phase 4: Quantitative Analysis API
Open Ends coding and Concept Testing endpoints
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import json
import csv
import io

from ..deps import get_db, get_current_user
from ..models import User, Project
from ..models_phase4 import (
    OpenEndQuestion, OpenEndResponse, CodeFrame,
    ConceptTest, ConceptEvaluation, ProjectMember
)
from ..open_ends import OpenEndsCodingService
from ..concept_testing import ConceptTestingService


router = APIRouter(prefix="/api/v1/quant", tags=["quantitative"])


# Request/Response Schemas
class ImportOpenEndsRequest(BaseModel):
    question_code: str
    question_text: str
    wave: int = 1
    responses: List[Dict[str, Any]]


class CodeFrameRequest(BaseModel):
    codes: List[Dict[str, Any]]


class AutoCodeRequest(BaseModel):
    sample_size: Optional[int] = None


class CreateConceptTestRequest(BaseModel):
    name: str
    concepts: List[Dict[str, Any]]
    metrics: List[str]
    test_type: str = "monadic"
    target_audience: Optional[str] = None
    markets: Optional[List[str]] = None


class AddEvaluationRequest(BaseModel):
    respondent_id: str
    concept_id: str
    ratings: Dict[str, float]
    qualitative_feedback: Dict[str, str]
    demographics: Optional[Dict[str, Any]] = None


# Helper to check project access
def check_project_access(project_id: str, user: User, db: Session, require_edit: bool = False):
    """Check if user has access to project"""
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if require_edit:
        # Check if user can edit
        member = db.query(ProjectMember).filter_by(
            project_id=project_id,
            user_id=user.id
        ).first()

        if member and not (member.can_edit_transcripts or member.can_run_analysis):
            raise HTTPException(status_code=403, detail="No edit permissions for this project")

    return project


# Open Ends Coding Endpoints
@router.post("/projects/{project_id}/open-ends")
async def import_open_ends(
    project_id: str,
    request: ImportOpenEndsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import open-ended survey responses"""

    project = check_project_access(project_id, current_user, db, require_edit=True)

    service = OpenEndsCodingService(db)
    question = await service.import_responses(
        project_id=project_id,
        question_code=request.question_code,
        question_text=request.question_text,
        responses=request.responses,
        wave=request.wave
    )

    return {
        "question_id": question.id,
        "question_code": question.question_code,
        "total_responses": question.total_responses
    }


@router.post("/projects/{project_id}/open-ends/csv")
async def import_open_ends_csv(
    project_id: str,
    file: UploadFile = File(...),
    question_column: str = Query(...),
    response_column: str = Query(...),
    respondent_column: Optional[str] = Query(None),
    wave: int = Query(1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import open-ended responses from CSV file"""

    project = check_project_access(project_id, current_user, db, require_edit=True)

    # Read CSV
    content = await file.read()
    csv_reader = csv.DictReader(io.StringIO(content.decode('utf-8')))

    # Group responses by question
    questions_data = {}
    for row in csv_reader:
        question_text = row.get(question_column)
        response_text = row.get(response_column)
        respondent_id = row.get(respondent_column, '') if respondent_column else ''

        if question_text not in questions_data:
            questions_data[question_text] = []

        questions_data[question_text].append({
            'respondent_id': respondent_id,
            'text': response_text
        })

    # Import each question
    service = OpenEndsCodingService(db)
    results = []

    for idx, (question_text, responses) in enumerate(questions_data.items()):
        question_code = f"Q{idx + 1}"  # Generate question code

        question = await service.import_responses(
            project_id=project_id,
            question_code=question_code,
            question_text=question_text,
            responses=responses,
            wave=wave
        )

        results.append({
            'question_id': question.id,
            'question_code': question_code,
            'response_count': len(responses)
        })

    return {
        "status": "imported",
        "questions": results,
        "total_questions": len(results)
    }


@router.get("/projects/{project_id}/open-ends")
async def list_open_end_questions(
    project_id: str,
    wave: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List open-ended questions in project"""

    project = check_project_access(project_id, current_user, db)

    query = db.query(OpenEndQuestion).filter_by(project_id=project_id)

    if wave:
        query = query.filter_by(wave=wave)

    questions = query.order_by(OpenEndQuestion.question_code).all()

    return {
        "questions": [
            {
                "id": q.id,
                "code": q.question_code,
                "text": q.question_text,
                "wave": q.wave,
                "total_responses": q.total_responses,
                "coded_responses": q.coded_responses,
                "completion_rate": (q.coded_responses / q.total_responses * 100)
                                  if q.total_responses > 0 else 0
            }
            for q in questions
        ]
    }


@router.post("/open-ends/{question_id}/code-frame")
async def create_code_frame(
    question_id: str,
    request: CodeFrameRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update code frame for question"""

    question = db.query(OpenEndQuestion).filter_by(id=question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    project = check_project_access(question.project_id, current_user, db, require_edit=True)

    service = OpenEndsCodingService(db)
    code_frames = await service.create_code_frame(
        question_id=question_id,
        codes=request.codes
    )

    return {
        "status": "created",
        "code_frame_size": len(code_frames)
    }


@router.post("/open-ends/{question_id}/auto-code")
async def auto_code_responses(
    question_id: str,
    request: AutoCodeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Automatically code responses using AI"""

    question = db.query(OpenEndQuestion).filter_by(id=question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    project = check_project_access(question.project_id, current_user, db, require_edit=True)

    service = OpenEndsCodingService(db)
    result = await service.auto_code_responses(
        question_id=question_id,
        sample_size=request.sample_size
    )

    return result


@router.get("/open-ends/{question_id}/export")
async def export_coded_data(
    question_id: str,
    format: str = Query("csv", regex="^(csv|spss|json)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export coded responses"""

    question = db.query(OpenEndQuestion).filter_by(id=question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    project = check_project_access(question.project_id, current_user, db)

    # Check export permission
    member = db.query(ProjectMember).filter_by(
        project_id=question.project_id,
        user_id=current_user.id
    ).first()

    if member and not member.can_export:
        raise HTTPException(status_code=403, detail="No export permission")

    service = OpenEndsCodingService(db)
    data = await service.export_coded_data(
        question_id=question_id,
        format=format
    )

    if format == "csv":
        from fastapi.responses import Response
        return Response(
            content=data,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={question.question_code}.csv"}
        )
    elif format == "spss":
        from fastapi.responses import Response
        return Response(
            content=data,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={question.question_code}.sps"}
        )
    else:
        return data


# Concept Testing Endpoints
@router.post("/projects/{project_id}/concept-tests")
async def create_concept_test(
    project_id: str,
    request: CreateConceptTestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new concept test"""

    project = check_project_access(project_id, current_user, db, require_edit=True)

    service = ConceptTestingService(db)
    test = await service.create_test(
        project_id=project_id,
        name=request.name,
        concepts=request.concepts,
        metrics=request.metrics,
        test_type=request.test_type,
        target_audience=request.target_audience,
        markets=request.markets
    )

    return {
        "test_id": test.id,
        "name": test.name,
        "status": test.status
    }


@router.get("/projects/{project_id}/concept-tests")
async def list_concept_tests(
    project_id: str,
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List concept tests in project"""

    project = check_project_access(project_id, current_user, db)

    query = db.query(ConceptTest).filter_by(project_id=project_id)

    if status:
        query = query.filter_by(status=status)

    tests = query.order_by(ConceptTest.created_at.desc()).all()

    return {
        "tests": [
            {
                "id": t.id,
                "name": t.name,
                "test_type": t.test_type,
                "n_concepts": len(t.concepts),
                "n_metrics": len(t.metrics),
                "status": t.status,
                "created_at": t.created_at.isoformat()
            }
            for t in tests
        ]
    }


@router.post("/concept-tests/{test_id}/evaluations")
async def add_concept_evaluation(
    test_id: str,
    request: AddEvaluationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add evaluation for a concept"""

    test = db.query(ConceptTest).filter_by(id=test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Concept test not found")

    # Anyone in org can add evaluations
    if test.org_id != current_user.org_id:
        raise HTTPException(status_code=403, detail="Access denied")

    service = ConceptTestingService(db)
    evaluation = await service.add_evaluation(
        test_id=test_id,
        respondent_id=request.respondent_id,
        concept_id=request.concept_id,
        ratings=request.ratings,
        qualitative_feedback=request.qualitative_feedback,
        demographics=request.demographics
    )

    return {
        "evaluation_id": evaluation.id,
        "overall_rating": evaluation.overall_rating
    }


@router.get("/concept-tests/{test_id}/analysis")
async def analyze_concept_test(
    test_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get concept test analysis"""

    test = db.query(ConceptTest).filter_by(id=test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Concept test not found")

    project = check_project_access(test.project_id, current_user, db)

    service = ConceptTestingService(db)
    analysis = await service.analyze_concept_performance(test_id)

    return analysis


@router.get("/concept-tests/{test_id}/report")
async def generate_concept_report(
    test_id: str,
    format: str = Query("json", regex="^(json|html|pptx)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate concept test report"""

    test = db.query(ConceptTest).filter_by(id=test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Concept test not found")

    project = check_project_access(test.project_id, current_user, db)

    service = ConceptTestingService(db)
    report = await service.generate_report(
        test_id=test_id,
        format=format
    )

    if format == "html":
        from fastapi.responses import HTMLResponse
        return HTMLResponse(content=report)
    elif format == "pptx":
        from fastapi.responses import Response
        return Response(
            content=report,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f"attachment; filename={test.name}.pptx"}
        )
    else:
        return report


# Coding Progress Dashboard
@router.get("/projects/{project_id}/coding-dashboard")
async def get_coding_dashboard(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get coding progress dashboard"""

    project = check_project_access(project_id, current_user, db)

    # Open ends stats
    open_ends = db.query(OpenEndQuestion).filter_by(project_id=project_id).all()

    total_responses = sum(q.total_responses for q in open_ends)
    coded_responses = sum(q.coded_responses for q in open_ends)

    # Concept test stats
    concept_tests = db.query(ConceptTest).filter_by(project_id=project_id).all()
    evaluations_count = db.query(ConceptEvaluation).join(ConceptTest).filter(
        ConceptTest.project_id == project_id
    ).count()

    return {
        "open_ends": {
            "total_questions": len(open_ends),
            "total_responses": total_responses,
            "coded_responses": coded_responses,
            "completion_rate": (coded_responses / total_responses * 100) if total_responses > 0 else 0,
            "questions": [
                {
                    "code": q.question_code,
                    "text": q.question_text[:100],
                    "completion": (q.coded_responses / q.total_responses * 100) if q.total_responses > 0 else 0
                }
                for q in open_ends
            ]
        },
        "concept_tests": {
            "total_tests": len(concept_tests),
            "total_evaluations": evaluations_count,
            "active_tests": sum(1 for t in concept_tests if t.status == "active"),
            "tests": [
                {
                    "name": t.name,
                    "status": t.status,
                    "n_concepts": len(t.concepts)
                }
                for t in concept_tests
            ]
        }
    }