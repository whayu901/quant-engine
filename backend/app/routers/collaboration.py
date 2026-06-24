"""
Phase 3: Real-time Collaboration API endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
from datetime import datetime
import json

from ..deps import get_db, get_current_user, require_role
from ..models import User, Project
from ..models_phase4 import (
    Comment, ProjectActivity,
    CollaborationSession, CollaborationEvent
)
from ..websocket_manager import manager
from ..schemas import PaginatedResponse

router = APIRouter(prefix="/api/v1/collaboration", tags=["collaboration"])


# Schemas
class CreateCommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    entity_type: str = Field(..., pattern="^(transcript|analysis|grid|theme|insight)$")
    entity_id: str
    parent_id: Optional[str] = None
    mentions: Optional[List[str]] = Field(None, max_items=10)


class UpdateCommentRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    resolved: Optional[bool] = None


class CommentResponse(BaseModel):
    id: str
    content: str
    author_id: str
    author_name: str
    entity_type: str
    entity_id: str
    parent_id: Optional[str]
    mentions: List[str]
    resolved: bool
    created_at: datetime
    updated_at: datetime
    replies_count: int = 0


class ActivityResponse(BaseModel):
    id: str
    user_id: str
    user_name: str
    action: str
    entity_type: str
    entity_id: str
    entity_name: Optional[str]
    metadata: dict
    created_at: datetime


class CollaborationSessionResponse(BaseModel):
    id: str
    project_id: str
    user_id: str
    user_name: str
    status: str
    last_activity: datetime
    metadata: dict


# Comment Endpoints

@router.post("/comments/{project_id}", response_model=CommentResponse)
async def create_comment(
    project_id: str,
    request: CreateCommentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new comment with real-time notification"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create comment
    from ..models import _uid
    comment = Comment(
        id=_uid(),
        project_id=project_id,
        user_id=current_user.id,
        entity_type=request.entity_type,
        entity_id=request.entity_id,
        content=request.content,
        parent_id=request.parent_id,
        mentions=request.mentions or []
    )

    db.add(comment)

    # Log activity
    activity = ProjectActivity(
        id=_uid(),
        project_id=project_id,
        user_id=current_user.id,
        action="comment_created",
        entity_type=request.entity_type,
        entity_id=request.entity_id,
        metadata={
            "comment_id": comment.id,
            "has_mentions": bool(request.mentions)
        }
    )
    db.add(activity)

    db.commit()
    db.refresh(comment)

    # Broadcast to WebSocket
    await manager.broadcast_comment_update(project_id, {
        "action": "created",
        "comment_id": comment.id,
        "author": current_user.email,
        "entity_type": request.entity_type,
        "entity_id": request.entity_id
    })

    # Count replies
    replies_count = db.query(func.count(Comment.id)).filter_by(
        parent_id=comment.id
    ).scalar() or 0

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        author_id=comment.user_id,
        author_name=current_user.email,
        entity_type=comment.entity_type,
        entity_id=comment.entity_id,
        parent_id=comment.parent_id,
        mentions=comment.mentions,
        resolved=comment.resolved,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        replies_count=replies_count
    )


@router.get("/comments/{project_id}", response_model=PaginatedResponse)
async def list_comments(
    project_id: str,
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    resolved: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List comments with filters and pagination"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Build query
    query = db.query(Comment).filter_by(project_id=project_id)

    if entity_type:
        query = query.filter_by(entity_type=entity_type)
    if entity_id:
        query = query.filter_by(entity_id=entity_id)
    if resolved is not None:
        query = query.filter_by(resolved=resolved)

    # Get total count
    total = query.count()

    # Get paginated results
    comments = query.order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()

    # Format response
    items = []
    for comment in comments:
        user = db.query(User).filter_by(id=comment.user_id).first()
        replies_count = db.query(func.count(Comment.id)).filter_by(
            parent_id=comment.id
        ).scalar() or 0

        items.append(CommentResponse(
            id=comment.id,
            content=comment.content,
            author_id=comment.user_id,
            author_name=user.email if user else "Unknown",
            entity_type=comment.entity_type,
            entity_id=comment.entity_id,
            parent_id=comment.parent_id,
            mentions=comment.mentions,
            resolved=comment.resolved,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            replies_count=replies_count
        ))

    return PaginatedResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total
    )


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: str,
    request: UpdateCommentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a comment"""
    comment = db.query(Comment).filter_by(id=comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Check ownership or admin role
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")

    # Update fields
    if request.content:
        comment.content = request.content
    if request.resolved is not None:
        comment.resolved = request.resolved

    comment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(comment)

    # Broadcast update
    await manager.broadcast_comment_update(comment.project_id, {
        "action": "updated",
        "comment_id": comment.id,
        "resolved": comment.resolved
    })

    # Get author name and reply count
    user = db.query(User).filter_by(id=comment.user_id).first()
    replies_count = db.query(func.count(Comment.id)).filter_by(
        parent_id=comment.id
    ).scalar() or 0

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        author_id=comment.user_id,
        author_name=user.email if user else "Unknown",
        entity_type=comment.entity_type,
        entity_id=comment.entity_id,
        parent_id=comment.parent_id,
        mentions=comment.mentions,
        resolved=comment.resolved,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        replies_count=replies_count
    )


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment"""
    comment = db.query(Comment).filter_by(id=comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Check ownership or admin role
    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    project_id = comment.project_id

    # Delete replies first
    db.query(Comment).filter_by(parent_id=comment_id).delete()

    # Delete comment
    db.delete(comment)
    db.commit()

    # Broadcast deletion
    await manager.broadcast_comment_update(project_id, {
        "action": "deleted",
        "comment_id": comment_id
    })

    return {"status": "deleted", "comment_id": comment_id}


# Activity Endpoints

@router.get("/activity/{project_id}", response_model=PaginatedResponse)
async def get_project_activity(
    project_id: str,
    user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project activity feed with real-time updates"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Build query
    query = db.query(ProjectActivity).filter_by(project_id=project_id)

    if user_id:
        query = query.filter_by(user_id=user_id)
    if action:
        query = query.filter_by(action=action)

    # Get total count
    total = query.count()

    # Get paginated results
    activities = query.order_by(ProjectActivity.created_at.desc()).offset(skip).limit(limit).all()

    # Format response
    items = []
    for activity in activities:
        user = db.query(User).filter_by(id=activity.user_id).first()

        items.append(ActivityResponse(
            id=activity.id,
            user_id=activity.user_id,
            user_name=user.email if user else "Unknown",
            action=activity.action,
            entity_type=activity.entity_type,
            entity_id=activity.entity_id,
            entity_name=activity.metadata.get("entity_name"),
            metadata=activity.metadata,
            created_at=activity.created_at
        ))

    return PaginatedResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total
    )


# Session Management

@router.get("/sessions/{project_id}/active")
async def get_active_sessions(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get active collaboration sessions (who's online)"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get active sessions from WebSocket manager
    online_users = manager.get_online_users(project_id)
    typing_users = manager.get_typing_users(project_id)

    # Get recent sessions from database
    sessions = db.query(CollaborationSession).filter_by(
        project_id=project_id,
        status="active"
    ).all()

    return {
        "online_users": online_users,
        "typing_users": typing_users,
        "active_sessions": [
            CollaborationSessionResponse(
                id=s.id,
                project_id=s.project_id,
                user_id=s.user_id,
                user_name=s.metadata.get("user_name", "Unknown"),
                status=s.status,
                last_activity=s.last_activity,
                metadata=s.metadata
            )
            for s in sessions
        ],
        "total_online": len(online_users)
    }


@router.post("/sessions/{project_id}/presence")
async def update_presence(
    project_id: str,
    status: str = Query(..., pattern="^(online|away|busy|offline)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user presence status"""
    # Verify project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Update or create session
    session = db.query(CollaborationSession).filter_by(
        project_id=project_id,
        user_id=current_user.id
    ).first()

    if not session:
        from ..models import _uid
        session = CollaborationSession(
            id=_uid(),
            project_id=project_id,
            user_id=current_user.id,
            status=status,
            metadata={"user_name": current_user.email}
        )
        db.add(session)
    else:
        session.status = status
        session.last_activity = datetime.utcnow()

    db.commit()

    return {"status": status, "user_id": current_user.id}