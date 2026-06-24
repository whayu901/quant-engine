from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, require_role, owned_or_404

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=schemas.ProjectOut)
def create_project(body: schemas.ProjectIn,
                   user: models.User = Depends(require_role("admin", "researcher")),
                   db: Session = Depends(get_db)):
    p = models.Project(org_id=user.org_id, name=body.name,
                       description=body.description, created_by=user.id)
    db.add(p); db.commit(); db.refresh(p)
    return p


@router.get("", response_model=schemas.PaginatedResponse[schemas.ProjectOut])
def list_projects(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List projects with pagination"""
    # Get total count
    total = db.query(func.count(models.Project.id)).filter(
        models.Project.org_id == user.org_id
    ).scalar()

    # Get paginated items
    items = (db.query(models.Project)
            .filter(models.Project.org_id == user.org_id)
            .order_by(models.Project.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all())

    return schemas.PaginatedResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit,
        has_more=(skip + limit) < total
    )


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: str, user: models.User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    return owned_or_404(db, models.Project, project_id, user.org_id)


@router.delete("/{project_id}")
def delete_project(project_id: str,
                   user: models.User = Depends(require_role("admin")),
                   db: Session = Depends(get_db)):
    p = owned_or_404(db, models.Project, project_id, user.org_id)
    db.delete(p); db.commit()
    return {"deleted": project_id}
