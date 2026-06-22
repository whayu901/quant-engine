from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from . import models  # noqa: F401  (register models)
from .routers import auth, projects, transcripts, analyses, usage

# Dev convenience: create tables on boot. For production use Alembic migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Qual Engine API", version="0.1.0",
              description="Qualitative research analysis engine — transcript to insight.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth, projects, transcripts, analyses, usage):
    app.include_router(r.router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": "qual-engine", "version": "0.1.0"}
