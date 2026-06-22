"""
Phase 4: Admin Dashboard API
Administrative endpoints for user management and system monitoring
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from pydantic import BaseModel
from datetime import datetime, timedelta

from ..deps import get_db, get_current_user
from ..models import User, Org, Project
from ..models_phase4 import (
    UserEnhancement, ProjectMember, ActivityLog,
    OrganizationStats, TeamType, UserRole, ProjectRole,
    OpenEndQuestion, ConceptTest, Comment, Notification
)


router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


# Request/Response schemas
class CreateUserRequest(BaseModel):
    email: str
    name: str
    role: str = "researcher"
    team: Optional[str] = None
    department: Optional[str] = None
    can_create_projects: bool = False
    can_manage_users: bool = False


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    team: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None


class AssignProjectMemberRequest(BaseModel):
    user_id: str
    role: str = "viewer"
    can_edit_transcripts: bool = False
    can_run_analysis: bool = False
    can_manage_team: bool = False
    can_export: bool = True


class DashboardStatsResponse(BaseModel):
    users: dict
    projects: dict
    content: dict
    activity: dict
    teams: dict


# Helper functions
def is_admin(user: User) -> bool:
    """Check if user is admin"""
    return user.role in ["admin", "super_admin", "org_admin"]


def is_team_lead(user: User, db: Session) -> bool:
    """Check if user is team lead"""
    enhancement = db.query(UserEnhancement).filter_by(user_id=user.id).first()
    return user.role == "team_lead" or (enhancement and enhancement.can_manage_users)


# Dashboard Overview
@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DashboardStatsResponse:
    """Get admin dashboard statistics"""

    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    org_id = current_user.org_id
    now = datetime.utcnow()

    # User statistics
    total_users = db.query(User).filter_by(org_id=org_id).count()

    active_today = db.query(User).filter(
        User.org_id == org_id,
        User.last_login >= now - timedelta(days=1)
    ).count()

    active_week = db.query(User).filter(
        User.org_id == org_id,
        User.last_login >= now - timedelta(days=7)
    ).count()

    # Project statistics
    total_projects = db.query(Project).filter_by(org_id=org_id).count()
    active_projects = db.query(Project).filter(
        Project.org_id == org_id,
        Project.status == "active"
    ).count()

    # Content statistics
    from ..models import Transcript
    from ..models_phase2 import Analysis, Evidence

    total_transcripts = db.query(Transcript).filter_by(org_id=org_id).count()
    total_analyses = db.query(Analysis).filter_by(org_id=org_id).count()
    total_evidence = db.query(Evidence).filter_by(org_id=org_id).count()

    # Recent activity
    recent_activities = db.query(ActivityLog).filter_by(
        org_id=org_id
    ).order_by(ActivityLog.created_at.desc()).limit(10).all()

    # Team breakdown
    team_stats = db.query(
        UserEnhancement.team,
        func.count(UserEnhancement.id)
    ).join(User).filter(
        User.org_id == org_id
    ).group_by(UserEnhancement.team).all()

    # Open ends and concept testing stats
    total_open_ends = db.query(OpenEndQuestion).filter_by(org_id=org_id).count()
    total_concept_tests = db.query(ConceptTest).filter_by(org_id=org_id).count()

    return {
        "users": {
            "total": total_users,
            "active_today": active_today,
            "active_this_week": active_week,
            "by_role": {
                "admin": db.query(User).filter_by(org_id=org_id, role="admin").count(),
                "researcher": db.query(User).filter_by(org_id=org_id, role="researcher").count(),
                "viewer": db.query(User).filter_by(org_id=org_id, role="viewer").count()
            }
        },
        "projects": {
            "total": total_projects,
            "active": active_projects,
            "completed": total_projects - active_projects
        },
        "content": {
            "transcripts": total_transcripts,
            "analyses": total_analyses,
            "evidence": total_evidence,
            "open_ends_questions": total_open_ends,
            "concept_tests": total_concept_tests
        },
        "activity": {
            "recent": [
                {
                    "id": act.id,
                    "user_id": act.user_id,
                    "action": act.action,
                    "target": act.target_name,
                    "created_at": act.created_at.isoformat()
                }
                for act in recent_activities
            ]
        },
        "teams": {
            team: count for team, count in team_stats
        }
    }


# User Management
@router.get("/users")
async def list_users(
    team: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    active_only: bool = Query(True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all users in organization"""

    if not (is_admin(current_user) or is_team_lead(current_user, db)):
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    query = db.query(User).filter_by(org_id=current_user.org_id)

    if active_only:
        query = query.filter(User.is_active == True)

    if role:
        query = query.filter(User.role == role)

    users = query.all()

    # Filter by team if specified
    if team:
        enhancements = db.query(UserEnhancement).filter(
            UserEnhancement.team == team,
            UserEnhancement.user_id.in_([u.id for u in users])
        ).all()

        enhanced_user_ids = [e.user_id for e in enhancements]
        users = [u for u in users if u.id in enhanced_user_ids]

    # Get enhancement data
    result = []
    for user in users:
        enhancement = db.query(UserEnhancement).filter_by(user_id=user.id).first()

        result.append({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "team": enhancement.team if enhancement else None,
            "department": enhancement.department if enhancement else None,
            "is_active": user.is_active,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "created_at": user.created_at.isoformat()
        })

    return {"users": result}


@router.post("/users")
async def create_user(
    request: CreateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new user"""

    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    # Check if email exists
    existing = db.query(User).filter_by(email=request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    from ..models import _uid
    import hashlib

    # Create user
    user = User(
        id=_uid(),
        email=request.email,
        name=request.name,
        org_id=current_user.org_id,
        role=request.role,
        hashed_password=hashlib.sha256(b"changeme123").hexdigest()  # Default password
    )
    db.add(user)

    # Create enhancement
    enhancement = UserEnhancement(
        user_id=user.id,
        team=request.team,
        department=request.department,
        can_create_projects=request.can_create_projects,
        can_manage_users=request.can_manage_users
    )
    db.add(enhancement)

    # Log activity
    activity = ActivityLog(
        org_id=current_user.org_id,
        user_id=current_user.id,
        action="created_user",
        target_type="user",
        target_id=user.id,
        target_name=user.email
    )
    db.add(activity)

    db.commit()

    return {
        "id": user.id,
        "email": user.email,
        "message": "User created with default password 'changeme123'"
    }


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    request: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user details"""

    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(User).filter_by(
        id=user_id,
        org_id=current_user.org_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user fields
    if request.name is not None:
        user.name = request.name
    if request.role is not None:
        user.role = request.role
    if request.is_active is not None:
        user.is_active = request.is_active

    # Update enhancement
    enhancement = db.query(UserEnhancement).filter_by(user_id=user_id).first()
    if not enhancement:
        enhancement = UserEnhancement(user_id=user_id)
        db.add(enhancement)

    if request.team is not None:
        enhancement.team = request.team
    if request.department is not None:
        enhancement.department = request.department

    enhancement.updated_at = datetime.utcnow()

    # Log activity
    activity = ActivityLog(
        org_id=current_user.org_id,
        user_id=current_user.id,
        action="updated_user",
        target_type="user",
        target_id=user_id,
        target_name=user.email,
        details=request.dict(exclude_unset=True)
    )
    db.add(activity)

    db.commit()

    return {"status": "updated"}


# Project Team Management
@router.get("/projects/{project_id}/team")
async def get_project_team(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project team members"""

    # Check project access
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    members = db.query(ProjectMember).filter_by(project_id=project_id).all()

    result = []
    for member in members:
        user = db.query(User).filter_by(id=member.user_id).first()
        enhancement = db.query(UserEnhancement).filter_by(user_id=member.user_id).first()

        result.append({
            "member_id": member.id,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "team": enhancement.team if enhancement else None
            },
            "role": member.role,
            "permissions": {
                "can_edit_transcripts": member.can_edit_transcripts,
                "can_run_analysis": member.can_run_analysis,
                "can_manage_team": member.can_manage_team,
                "can_export": member.can_export,
                "can_delete": member.can_delete
            },
            "assigned_at": member.assigned_at.isoformat(),
            "last_accessed": member.last_accessed.isoformat() if member.last_accessed else None
        })

    return {"project_id": project_id, "members": result}


@router.post("/projects/{project_id}/team")
async def assign_project_member(
    project_id: str,
    request: AssignProjectMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign user to project team"""

    # Check permissions
    project = db.query(Project).filter_by(
        id=project_id,
        org_id=current_user.org_id
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if user can manage team
    is_project_manager = db.query(ProjectMember).filter_by(
        project_id=project_id,
        user_id=current_user.id,
        can_manage_team=True
    ).first()

    if not (is_admin(current_user) or is_project_manager):
        raise HTTPException(status_code=403, detail="Cannot manage project team")

    # Check if already member
    existing = db.query(ProjectMember).filter_by(
        project_id=project_id,
        user_id=request.user_id
    ).first()

    if existing:
        # Update existing
        existing.role = request.role
        existing.can_edit_transcripts = request.can_edit_transcripts
        existing.can_run_analysis = request.can_run_analysis
        existing.can_manage_team = request.can_manage_team
        existing.can_export = request.can_export
    else:
        # Create new
        from ..models import _uid

        member = ProjectMember(
            id=_uid(),
            project_id=project_id,
            user_id=request.user_id,
            role=request.role,
            can_edit_transcripts=request.can_edit_transcripts,
            can_run_analysis=request.can_run_analysis,
            can_manage_team=request.can_manage_team,
            can_export=request.can_export,
            assigned_by=current_user.id,
            assigned_at=datetime.utcnow()
        )
        db.add(member)

    # Log activity
    activity = ActivityLog(
        org_id=current_user.org_id,
        project_id=project_id,
        user_id=current_user.id,
        action="assigned_team_member",
        target_type="user",
        target_id=request.user_id,
        details={"role": request.role}
    )
    db.add(activity)

    # Create notification
    from ..models import _uid

    notification = Notification(
        id=_uid(),
        user_id=request.user_id,
        type="assignment",
        title="Project Assignment",
        message=f"You've been added to project: {project.name}",
        link_type="project",
        link_id=project_id
    )
    db.add(notification)

    db.commit()

    return {"status": "assigned"}


# Activity Monitoring
@router.get("/activity")
async def get_activity_log(
    user_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activity log"""

    if not is_admin(current_user):
        # Non-admins can only see their own activity
        user_id = current_user.id

    query = db.query(ActivityLog).filter_by(org_id=current_user.org_id)

    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    if project_id:
        query = query.filter(ActivityLog.project_id == project_id)
    if action:
        query = query.filter(ActivityLog.action == action)

    # Time filter
    since = datetime.utcnow() - timedelta(days=days)
    query = query.filter(ActivityLog.created_at >= since)

    activities = query.order_by(ActivityLog.created_at.desc()).limit(100).all()

    return {
        "activities": [
            {
                "id": act.id,
                "user_id": act.user_id,
                "action": act.action,
                "target_type": act.target_type,
                "target_id": act.target_id,
                "target_name": act.target_name,
                "details": act.details,
                "created_at": act.created_at.isoformat()
            }
            for act in activities
        ]
    }


# Comments System
@router.post("/comments")
async def create_comment(
    target_type: str,
    target_id: str,
    content: str,
    parent_id: Optional[str] = None,
    mentioned_users: Optional[List[str]] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment on any content"""

    from ..models import _uid

    comment = Comment(
        id=_uid(),
        org_id=current_user.org_id,
        target_type=target_type,
        target_id=target_id,
        content=content,
        user_id=current_user.id,
        parent_id=parent_id,
        mentioned_users=mentioned_users or []
    )
    db.add(comment)

    # Create notifications for mentions
    if mentioned_users:
        for user_id in mentioned_users:
            notification = Notification(
                id=_uid(),
                user_id=user_id,
                type="mention",
                title="You were mentioned",
                message=f"{current_user.name} mentioned you in a comment",
                link_type=target_type,
                link_id=target_id
            )
            db.add(notification)

    # Log activity
    activity = ActivityLog(
        org_id=current_user.org_id,
        user_id=current_user.id,
        action="commented",
        target_type=target_type,
        target_id=target_id
    )
    db.add(activity)

    db.commit()

    return {
        "id": comment.id,
        "created_at": comment.created_at.isoformat()
    }


@router.get("/comments/{target_type}/{target_id}")
async def get_comments(
    target_type: str,
    target_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comments for a target"""

    comments = db.query(Comment).filter_by(
        org_id=current_user.org_id,
        target_type=target_type,
        target_id=target_id,
        parent_id=None  # Top-level only
    ).order_by(Comment.created_at.desc()).all()

    result = []
    for comment in comments:
        user = db.query(User).filter_by(id=comment.user_id).first()

        # Get replies
        replies = db.query(Comment).filter_by(parent_id=comment.id).all()

        result.append({
            "id": comment.id,
            "content": comment.content,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            },
            "is_resolved": comment.is_resolved,
            "created_at": comment.created_at.isoformat(),
            "replies": [
                {
                    "id": reply.id,
                    "content": reply.content,
                    "user_id": reply.user_id,
                    "created_at": reply.created_at.isoformat()
                }
                for reply in replies
            ]
        })

    return {"comments": result}


# Notifications
@router.get("/notifications")
async def get_notifications(
    unread_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user notifications"""

    query = db.query(Notification).filter_by(user_id=current_user.id)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = query.order_by(
        Notification.created_at.desc()
    ).limit(50).all()

    return {
        "notifications": [
            {
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "link_type": n.link_type,
                "link_id": n.link_id,
                "priority": n.priority,
                "created_at": n.created_at.isoformat()
            }
            for n in notifications
        ]
    }


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark notification as read"""

    notification = db.query(Notification).filter_by(
        id=notification_id,
        user_id=current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.commit()

    return {"status": "read"}