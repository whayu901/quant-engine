from celery import Celery
from .config import settings

# Register all model modules so SQLAlchemy can fully configure mappers
# (e.g. Org -> WhiteLabelConfig) inside worker processes. Mirror app/main.py.
from . import models  # noqa: F401
from . import models_phase1  # noqa: F401
from . import models_phase2  # noqa: F401
from . import models_phase3  # noqa: F401
from . import models_phase4  # noqa: F401
from . import models_phase5  # noqa: F401
from . import models_enterprise  # noqa: F401
from . import models_fieldwork  # noqa: F401

celery_app = Celery("qual_engine", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    task_always_eager=settings.celery_task_always_eager,
    task_eager_propagates=True,
    include=["app.tasks"],
)
