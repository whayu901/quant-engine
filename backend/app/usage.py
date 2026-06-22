from datetime import datetime
from sqlalchemy import func
from . import models
from .config import settings


def _month_start() -> datetime:
    n = datetime.utcnow()
    return datetime(n.year, n.month, 1)


def month_count(db, org_id: str) -> int:
    return (
        db.query(func.count(models.Analysis.id))
        .filter(models.Analysis.org_id == org_id, models.Analysis.created_at >= _month_start())
        .scalar()
        or 0
    )


def plan_limit(plan: str) -> int:
    return settings.free_plan_monthly_limit if plan == "free" else 10 ** 9


def record_usage(db, org_id: str, analysis_id: str, in_tok: int, out_tok: int):
    db.add(models.UsageRecord(org_id=org_id, analysis_id=analysis_id,
                              input_tokens=in_tok, output_tokens=out_tok))
