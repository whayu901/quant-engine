from fastapi import FastAPI, Request, Response, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from . import models  # noqa: F401  (register models)
from . import models_phase2  # noqa: F401  (register phase 2 models)
from . import models_phase3  # noqa: F401  (register phase 3 models)
from . import models_phase4  # noqa: F401  (register phase 4 models)
from . import models_phase5  # noqa: F401  (register phase 5 models)
from . import models_enterprise  # noqa: F401  (register enterprise models)
# from . import models_phase6  # noqa: F401  (temporarily disabled - duplicate table issue)
from .routers import (
    auth, projects, transcripts, analyses, usage, chat, admin,
    quantitative, rag_config, analysis, collaboration, websocket
)
# enterprise router temporarily disabled due to import issue
# from .routers import enterprise
# Import Phase 6 multimodal router
try:
    from .routers import multimodal
    has_multimodal = True
except ImportError:
    has_multimodal = False
try:
    from .routers import clips
    has_clips = True
except ImportError:
    has_clips = False

# Tables are now managed by Alembic migrations
# Run: alembic upgrade head

# Create rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Qual Engine API", version="0.1.0",
              description="Qualitative research analysis engine — transcript to insight.")

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],  # Explicit methods
    allow_headers=["Authorization", "Content-Type", "Accept"],  # Explicit headers
)

routers = [
    auth, projects, transcripts, analyses, analysis, usage, chat, admin,
    quantitative, rag_config, collaboration, websocket
    # enterprise temporarily disabled due to import issue
]
if has_clips:
    routers.append(clips)
if has_multimodal:
    routers.append(multimodal)

for r in routers:
    app.include_router(r.router)


@app.get("/health", tags=["meta"])
async def health(db: Session = Depends(get_db)):
    """Comprehensive health check endpoint"""
    from sqlalchemy import text
    import redis
    from .config import settings

    health_status = {
        "service": "qual-engine",
        "version": "0.1.0",
        "status": "healthy",
        "checks": {}
    }

    # Check database
    try:
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["checks"]["database"] = f"unhealthy: {str(e)[:100]}"
        health_status["status"] = "unhealthy"

    # Check Redis
    try:
        r = redis.from_url(settings.redis_url)
        r.ping()
        health_status["checks"]["redis"] = "healthy"
    except Exception as e:
        health_status["checks"]["redis"] = f"unhealthy: {str(e)[:100]}"
        # Redis failure is not critical if celery eager mode is on
        if not settings.celery_task_always_eager:
            health_status["status"] = "degraded"

    # Check available disk space
    try:
        import shutil
        disk_usage = shutil.disk_usage("/")
        free_gb = disk_usage.free / (1024**3)
        if free_gb < 1:  # Less than 1GB free
            health_status["checks"]["disk"] = f"warning: {free_gb:.2f}GB free"
            health_status["status"] = "degraded"
        else:
            health_status["checks"]["disk"] = f"healthy: {free_gb:.2f}GB free"
    except:
        health_status["checks"]["disk"] = "unknown"

    # Return appropriate status code
    status_code = 200 if health_status["status"] == "healthy" else 503
    return JSONResponse(content=health_status, status_code=status_code)
