from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas, usage as usage_mod
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("", response_model=schemas.UsageOut)
def usage_summary(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = usage_mod.month_count(db, user.org_id)
    limit = usage_mod.plan_limit(user.org.plan)
    return schemas.UsageOut(plan=user.org.plan, month_count=count, limit=limit,
                            remaining=max(0, limit - count))
