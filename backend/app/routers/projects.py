from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
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


@router.get("", response_model=List[schemas.ProjectOut])
def list_projects(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (db.query(models.Project)
            .filter(models.Project.org_id == user.org_id)
            .order_by(models.Project.created_at.desc()).all())


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
