from celery import Celery
from .config import settings

celery_app = Celery("qual_engine", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    task_always_eager=settings.celery_task_always_eager,
    task_eager_propagates=True,
    include=["app.tasks"],
)
