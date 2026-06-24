"""
Phase 3: Chat/RAG API endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from ..deps import get_db, get_current_user
from ..models import User, Project
from ..models_phase3 import (
    ChatSession, ChatMessage, VectorStore,
    SavedPrompt, ChatTemplate, SemanticSearchLog
)
from ..rag import RAGService
from ..embeddings import VectorStoreService


router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


# Schemas
class CreateChatSessionRequest(BaseModel):
    project_id: str
    title: Optional[str] = None
    template_id: Optional[str] = None


class ChatMessageRequest(BaseModel):
    message: str
    use_rag: bool = True
    top_k: int = 5
    cross_project: bool = False
    project_ids: Optional[List[str]] = None


class SemanticSearchRequest(BaseModel):
    query: str
    source_types: Optional[List[str]] = None
    top_k: int = 5
    threshold: float = 0.0


class IndexContentRequest(BaseModel):
    source_type: str  # transcript, evidence, document
    source_id: str


class SavedPromptRequest(BaseModel):
    name: str
    description: Optional[str] = None
    prompt_template: str
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_public: bool = False


class ChatTemplateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    initial_messages: Optional[List[dict]] = None
    suggested_questions: Optional[List[str]] = None
    use_case: Optional[str] = None
    market_specific: bool = False
    target_markets: Optional[List[str]] = None


# Chat Session Endpoints

@router.post("/sessions")
async def create_chat_session(
    request: CreateChatSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chat session"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=request.project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rag_service = RAGService(db)
    session = await rag_service.create_chat_session(
        user_id=current_user.id,
        project_id=request.project_id,
        title=request.title,
        template_id=request.template_id
    )

    return {
        "session_id": session.id,
        "title": session.title,
        "created_at": session.created_at.isoformat()
    }


@router.get("/sessions")
async def list_chat_sessions(
    project_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's chat sessions"""
    query = db.query(ChatSession).filter_by(
        user_id=current_user.id,
        is_active=True
    )

    if project_id:
        # Verify project access
        project = db.query(Project).filter_by(
            id=project_id,
            org_id=current_user.org_id
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        query = query.filter_by(project_id=project_id)

    sessions = query.order_by(ChatSession.updated_at.desc()).all()

    return {
        "sessions": [
            {
                "id": s.id,
                "title": s.title,
                "project_id": s.project_id,
                "total_messages": s.total_messages,
                "created_at": s.created_at.isoformat(),
                "updated_at": s.updated_at.isoformat()
            }
            for s in sessions
        ]
    }


@router.get("/sessions/{session_id}")
async def get_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat session details with history"""
    session = db.query(ChatSession).filter_by(
        id=session_id,
        user_id=current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    rag_service = RAGService(db)
    history = await rag_service.get_chat_history(session_id)
    suggestions = await rag_service.get_suggested_questions(session_id)

    return {
        "session": {
            "id": session.id,
            "title": session.title,
            "project_id": session.project_id,
            "total_messages": session.total_messages,
            "total_tokens": session.total_tokens,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat()
        },
        "messages": history,
        "suggested_questions": suggestions
    }


@router.post("/sessions/{session_id}/messages")
async def send_chat_message(
    session_id: str,
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message in a chat session"""
    # Verify session ownership
    session = db.query(ChatSession).filter_by(
        id=session_id,
        user_id=current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    rag_service = RAGService(db)
    result = await rag_service.chat(
        session_id=session_id,
        message=request.message,
        use_rag=request.use_rag,
        top_k=request.top_k,
        cross_project=request.cross_project,
        project_ids=request.project_ids
    )

    return result


@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete (deactivate) a chat session"""
    session = db.query(ChatSession).filter_by(
        id=session_id,
        user_id=current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    session.is_active = False
    db.commit()

    return {"status": "deleted"}


# Semantic Search Endpoints

@router.post("/search/{project_id}")
async def semantic_search(
    project_id: str,
    request: SemanticSearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform semantic search on project content"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    vector_service = VectorStoreService(db)
    results = await vector_service.semantic_search(
        query=request.query,
        project_id=project_id,
        source_types=request.source_types,
        top_k=request.top_k,
        threshold=request.threshold
    )

    # Log search
    search_log = SemanticSearchLog(
        org_id=current_user.org_id,
        project_id=project_id,
        user_id=current_user.id,
        query_text=request.query,
        search_type='similarity',
        top_k=request.top_k,
        similarity_threshold=request.threshold,
        results_count=len(results),
        result_ids=[r['id'] for r in results],
        result_scores=[r['similarity'] for r in results]
    )
    db.add(search_log)
    db.commit()

    return {
        "query": request.query,
        "results": results,
        "total": len(results)
    }


@router.post("/search/cross-project")
async def cross_project_search(
    request: SemanticSearchRequest,
    project_ids: Optional[List[str]] = Query(None, description="Specific project IDs to search. If not provided, searches all accessible projects"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform semantic search across multiple projects"""
    # Get accessible projects
    accessible_projects = db.query(Project).filter_by(
        org_id=current_user.org_id
    )

    if project_ids:
        # Filter to specific projects if provided
        accessible_projects = accessible_projects.filter(Project.id.in_(project_ids))

    accessible_project_list = accessible_projects.all()

    if not accessible_project_list:
        raise HTTPException(status_code=404, detail="No accessible projects found")

    # Perform cross-project search
    vector_service = VectorStoreService(db)
    all_results = []

    for project in accessible_project_list:
        try:
            results = await vector_service.semantic_search(
                query=request.query,
                project_id=project.id,
                source_types=request.source_types,
                top_k=request.top_k,
                threshold=request.threshold
            )

            # Add project info to results
            for result in results:
                result['project_id'] = project.id
                result['project_name'] = project.name

            all_results.extend(results)
        except Exception as e:
            # Log error but continue with other projects
            print(f"Error searching project {project.id}: {e}")

    # Sort all results by similarity score and take top_k
    all_results.sort(key=lambda x: x.get('similarity', 0), reverse=True)
    final_results = all_results[:request.top_k]

    # Log cross-project search
    search_log = SemanticSearchLog(
        org_id=current_user.org_id,
        project_id=None,  # No specific project for cross-project search
        user_id=current_user.id,
        query_text=request.query,
        search_type='cross_project_similarity',
        top_k=request.top_k,
        similarity_threshold=request.threshold,
        results_count=len(final_results),
        result_ids=[r['id'] for r in final_results],
        result_scores=[r.get('similarity', 0) for r in final_results]
    )
    db.add(search_log)
    db.commit()

    return {
        "query": request.query,
        "projects_searched": len(accessible_project_list),
        "results": final_results,
        "total": len(final_results)
    }


# Vector Store Management

@router.post("/index")
async def index_content(
    request: IndexContentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Index content into vector store"""
    vector_service = VectorStoreService(db)

    # Verify access based on source type
    if request.source_type == 'transcript':
        from ..models import Transcript
        content = db.query(Transcript).filter_by(
            id=request.source_id,
            org_id=current_user.org_id
        ).first()
        if not content:
            raise HTTPException(status_code=404, detail="Transcript not found")

        chunks_created = await vector_service.index_transcript(request.source_id)

    elif request.source_type == 'evidence':
        from ..models_phase2 import Evidence
        content = db.query(Evidence).filter_by(
            id=request.source_id,
            org_id=current_user.org_id
        ).first()
        if not content:
            raise HTTPException(status_code=404, detail="Evidence not found")

        chunks_created = await vector_service.index_evidence(request.source_id)

    else:
        raise HTTPException(status_code=400, detail="Unsupported source type")

    return {
        "source_type": request.source_type,
        "source_id": request.source_id,
        "chunks_created": chunks_created
    }


@router.get("/index/{project_id}/status")
async def get_index_status(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get vector index status for a project"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get vector store stats
    total_chunks = db.query(VectorStore).filter_by(project_id=project_id).count()

    stats_by_type = db.query(
        VectorStore.source_type,
        db.func.count(VectorStore.id)
    ).filter_by(
        project_id=project_id
    ).group_by(VectorStore.source_type).all()

    return {
        "project_id": project_id,
        "total_chunks": total_chunks,
        "by_source_type": {
            source_type: count
            for source_type, count in stats_by_type
        }
    }


# Saved Prompts

@router.post("/prompts")
async def save_prompt(
    request: SavedPromptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a reusable prompt"""
    from ..models import _uid

    prompt = SavedPrompt(
        id=_uid(),
        org_id=current_user.org_id,
        name=request.name,
        description=request.description,
        prompt_template=request.prompt_template,
        category=request.category,
        tags=request.tags or [],
        is_public=request.is_public,
        created_by=current_user.id
    )

    db.add(prompt)
    db.commit()

    return {
        "prompt_id": prompt.id,
        "name": prompt.name,
        "created_at": prompt.created_at.isoformat()
    }


@router.get("/prompts")
async def list_saved_prompts(
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List saved prompts"""
    query = db.query(SavedPrompt).filter(
        db.or_(
            SavedPrompt.created_by == current_user.id,
            db.and_(
                SavedPrompt.org_id == current_user.org_id,
                SavedPrompt.is_public == True
            )
        )
    )

    if category:
        query = query.filter_by(category=category)

    prompts = query.order_by(SavedPrompt.usage_count.desc()).all()

    return {
        "prompts": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "category": p.category,
                "tags": p.tags,
                "usage_count": p.usage_count,
                "is_public": p.is_public,
                "created_at": p.created_at.isoformat()
            }
            for p in prompts
        ]
    }


# Chat Templates

@router.post("/templates")
async def create_chat_template(
    request: ChatTemplateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a chat template"""
    from ..models import _uid

    template = ChatTemplate(
        id=_uid(),
        org_id=current_user.org_id,
        name=request.name,
        description=request.description,
        system_prompt=request.system_prompt,
        initial_messages=request.initial_messages or [],
        suggested_questions=request.suggested_questions or [],
        use_case=request.use_case,
        market_specific=request.market_specific,
        target_markets=request.target_markets or [],
        created_by=current_user.id
    )

    db.add(template)
    db.commit()

    return {
        "template_id": template.id,
        "name": template.name,
        "created_at": template.created_at.isoformat()
    }


@router.get("/templates")
async def list_chat_templates(
    use_case: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List available chat templates"""
    query = db.query(ChatTemplate).filter_by(org_id=current_user.org_id)

    if use_case:
        query = query.filter_by(use_case=use_case)

    templates = query.order_by(ChatTemplate.usage_count.desc()).all()

    return {
        "templates": [
            {
                "id": t.id,
                "name": t.name,
                "description": t.description,
                "use_case": t.use_case,
                "market_specific": t.market_specific,
                "target_markets": t.target_markets,
                "usage_count": t.usage_count,
                "is_default": t.is_default
            }
            for t in templates
        ]
    }


# Auto-Indexing Management

@router.post("/index/auto")
async def trigger_auto_indexing(
    hours: Optional[int] = Query(24, description="Index content from last N hours"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger auto-indexing for recent content"""
    from ..auto_indexing import AutoIndexingService

    # Admin only
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    service = AutoIndexingService(db)
    stats = await service.index_recent_content(hours=hours)

    return {
        "status": "completed",
        "hours": hours,
        "indexed": stats
    }


@router.post("/index/all")
async def index_all_content(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Index all unindexed content"""
    from ..auto_indexing import AutoIndexingService

    # Admin only
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")

    service = AutoIndexingService(db)
    stats = await service.run_indexing_pipeline()

    return {
        "status": "completed",
        "indexed": stats
    }


@router.get("/index/stats")
async def get_indexing_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current indexing statistics"""
    from ..auto_indexing import AutoIndexingService

    service = AutoIndexingService(db)
    stats = service.get_indexing_stats()

    return stats


# Related Content

@router.get("/related/{source_type}/{source_id}")
async def find_related_content(
    source_type: str,
    source_id: str,
    top_k: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Find content related to a specific source"""
    vector_service = VectorStoreService(db)

    # Verify access to source
    # This is simplified - in production, verify based on source_type
    vector_entry = db.query(VectorStore).filter_by(
        source_type=source_type,
        source_id=source_id
    ).first()

    if not vector_entry:
        raise HTTPException(status_code=404, detail="Content not indexed")

    # Verify org access
    project = db.query(Project).filter_by(
        id=vector_entry.project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=403, detail="Access denied")

    results = await vector_service.find_related_content(
        content_id=source_id,
        source_type=source_type,
        top_k=top_k
    )

    return {
        "source": {
            "type": source_type,
            "id": source_id
        },
        "related": results,
        "total": len(results)
    }