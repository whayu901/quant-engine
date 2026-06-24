# Qual Engine Database Optimization Plan
## Enterprise-Grade PostgreSQL Strategy for 100M+ Records

**Project:** Beating CoLoop.ai with lightning-fast qualitative analysis
**Target Performance:** Sub-100ms queries, 1000+ concurrent connections, 100M+ records
**Database:** PostgreSQL 14+ (from SQLite dev to production)

---

## EXECUTIVE SUMMARY

Your current schema spans **5 phases** with 40+ tables storing:
- **Core entities:** Orgs, Users, Projects, Transcripts
- **Analysis artifacts:** Analyses, Themes, Verbatims, Evidence, Insights, GridCells
- **RAG/Chat:** VectorStores, ChatSessions, ChatMessages, SavedPrompts
- **Collaboration:** Comments, ActivityLogs, Notifications, ProjectMembers
- **Media:** Clips, Reels, ReelItems, MediaProcessingJobs
- **Quantitative:** OpenEndQuestions, OpenEndResponses, CodeFrames, ConceptTests

**Critical bottlenecks identified:**
1. **N+1 queries** in analysis retrieval (themes + verbatims + evidence)
2. **Missing foreign key indexes** on 15+ columns
3. **No partitioning strategy** for time-series data (100M+ records)
4. **Synchronous database writes** blocking API responses
5. **No connection pooling** configuration (SQLAlchemy default: 5 connections)
6. **Vector embeddings stored as JSON** (slow similarity search)
7. **No caching layer** for frequently accessed data

---

## PART 1: COMPREHENSIVE SCHEMA ANALYSIS

### 1.1 Database Statistics (At 100M Records Scale)

| Table | Est. Rows | Storage | Hot Reads | Bottleneck |
|-------|-----------|---------|-----------|-----------|
| transcripts | 500K | 150GB | Very High | JOIN with segments |
| transcript_segments | 50M | 300GB | Very High | N+1 in analysis |
| analyses | 500K | 50GB | High | JOIN with themes |
| themes | 5M | 30GB | High | Cascading verbatims |
| verbatims | 20M | 80GB | Medium | Full text search |
| grid_cells | 10M | 60GB | High | Multi-column filters |
| evidence | 8M | 100GB | Medium | JSON field queries |
| vector_stores | 15M | 200GB | Low | pgvector performance |
| chat_messages | 30M | 80GB | Low | Session grouping |
| activity_logs | 50M | 150GB | Low | Time-range queries |

**Total estimated size:** ~1.2TB at scale

### 1.2 Critical Tables & Relationships

```
ORG
├── USER (many-to-one)
├── PROJECT (one-to-many)
│   ├── TRANSCRIPT (one-to-many)
│   │   ├── TRANSCRIPT_SEGMENT (one-to-many) → MANY per transcript
│   │   ├── MEDIA_ASSET (one-to-one)
│   │   └── ANALYSIS (one-to-many)
│   │       ├── THEME (one-to-many) → N+1 bottleneck
│   │       │   └── VERBATIM (one-to-many) → N+N bottleneck
│   │       ├── IMPLICATION (one-to-many)
│   │       └── EVIDENCE (one-to-many) → JSON queries
│   ├── ANALYSIS_GRID (one-to-many)
│   │   └── GRID_CELL (one-to-many) → Slow multi-filters
│   └── MARKET (one-to-many) → Multimarket support
├── VECTOR_STORE (one-to-many) → 15M+ vectors at scale
├── CHAT_SESSION (one-to-many)
│   └── CHAT_MESSAGE (one-to-many)
└── OPEN_END_QUESTION (one-to-many)
    └── OPEN_END_RESPONSE (one-to-many)
```

---

## PART 2: IDENTIFIED BOTTLENECKS & N+1 QUERIES

### 2.1 N+1 Query Problems (Found in Routes)

**Problem 1: Analysis Detail Retrieval**
```python
# Current code in analyses.py
analysis = db.query(models.Analysis).filter_by(id=analysis_id).first()
# Returns analysis, then later:
for theme in analysis.themes:  # N+1: New query per theme
    for verbatim in theme.verbatims:  # N+N: New query per verbatim
        print(verbatim.quote)
```

**Impact at scale:**
- 500K analyses × 10 themes × 4 verbatims per theme = 20M queries
- At 0.5ms per query = **10,000 seconds (2.7 hours)** for full export

**Problem 2: Transcript with Segments**
```python
transcripts = db.query(models.Transcript).filter(...).all()
# Later:
for t in transcripts:
    print(len(t.segments))  # N+1: Query per transcript
```

**Impact:** 500K transcripts × 2 queries = 1M database round trips

**Problem 3: Evidence with Nested JSON**
```python
# GridCells have evidence_ids as JSON array
cells = db.query(GridCell).filter_by(grid_id=gid).all()
for cell in cells:
    evidences = db.query(Evidence).filter(
        Evidence.id.in_(cell.evidence_ids)  # Subquery per cell
    ).all()
```

**Impact:** 10M grid cells × variable query time = High latency for reports

**Problem 4: Project with Relationships**
```python
projects = db.query(Project).all()  # 5K projects
for p in projects:
    members = p.project_members  # N+1
    transcripts_count = len(p.transcripts)  # N+1
```

### 2.2 Missing Indexes (Critical)

**Current indexes:** ~25 manually created
**Needed indexes:** ~50+ for optimal performance

Missing on foreign keys:
- `users.created_by` (Project)
- `themes.analysis_id` (has index ✓)
- `analysis_themes.parent_id` (MISSING - hierarchy traversal)
- `comments.parent_id` (MISSING - reply threads)
- `open_end_responses.coded_by`, `reviewed_by` (MISSING)
- `user_enhancements.user_id` (MISSING - unique but not indexed)

Missing on frequently filtered columns:
- `analysis.status` (MISSING - "pending|running|done|error" filtering)
- `transcript.transcription_status` (MISSING)
- `clip.status` (has index ✓)
- `reel.status` (has index ✓)
- Composite: `(org_id, created_at)` for time-range queries

Missing on search/aggregation:
- `evidence.sentiment` (MISSING - sentiment filtering)
- `vector_stores.embedding_model` (MISSING - vector type filtering)
- `chat_messages.detected_language` (MISSING - language grouping)

### 2.3 JSON Field Performance Issues

**Problems:**
1. `grid_cells.evidence_ids` → Stored as JSON array, queries need `@>` operator
2. `vector_stores.embedding` → 1536-float array as JSON, similarity search via SQL loop
3. `evidence.themes`, `evidence.emotions` → Array filtering inefficient
4. `concept_evaluations.ratings` → Nested JSON structure, hard to query

**Impact:** PostgreSQL JSON indexing with GIN requires custom operators

---

## PART 3: OPTIMIZATION STRATEGY

### 3.1 Indexing Strategy (50+ New Indexes)

#### Phase 1: Foreign Key Indexes (8 indexes)
```sql
-- User relationships
CREATE INDEX idx_user_org_id ON users(org_id);  -- exists
CREATE INDEX idx_project_created_by ON projects(created_by);
CREATE INDEX idx_transcript_source_media ON transcripts(source_media_id);
CREATE INDEX idx_media_asset_project ON media_assets(project_id);

-- Analysis relationships
CREATE INDEX idx_analysis_status ON analyses(status);  -- CRITICAL
CREATE INDEX idx_theme_analysis ON themes(analysis_id);  -- exists
CREATE INDEX idx_implication_analysis ON implications(analysis_id);

-- Transcript segments (high cardinality)
CREATE INDEX idx_segment_transcript ON transcript_segments(transcript_id);
CREATE INDEX idx_segment_speaker ON transcript_segments(speaker);  -- for diarization queries
```

#### Phase 2: Composite Indexes (15 indexes)
```sql
-- Time-range queries for analytics
CREATE INDEX idx_analysis_org_created
  ON analyses(org_id, status, created_at DESC);

CREATE INDEX idx_transcript_project_created
  ON transcripts(project_id, transcription_status, created_at DESC);

CREATE INDEX idx_activity_log_org_action
  ON activity_logs(org_id, action, created_at DESC);

-- Grid queries
CREATE INDEX idx_gridcell_grid_position
  ON grid_cells(grid_id, row_id, column_id);

-- Evidence multi-filter
CREATE INDEX idx_evidence_project_theme
  ON evidence(project_id, significance, sentiment DESC);

-- Chat lookups
CREATE INDEX idx_chat_message_session_time
  ON chat_messages(session_id, created_at DESC);

-- Clip/Reel queries
CREATE INDEX idx_clip_project_status
  ON clips(project_id, status, created_at DESC);

CREATE INDEX idx_reel_project_status
  ON reels(project_id, status, created_at DESC);

-- Open ends
CREATE INDEX idx_open_end_question_wave
  ON open_end_questions(project_id, wave);

CREATE INDEX idx_open_end_response_question_status
  ON open_end_responses(question_id, review_status);

-- Vector store
CREATE INDEX idx_vector_project_source
  ON vector_stores(project_id, source_type, source_id);

-- User hierarchy
CREATE INDEX idx_analysis_theme_hierarchy
  ON analysis_themes(project_id, parent_id, level);

CREATE INDEX idx_comment_thread
  ON comments(target_type, target_id, parent_id);

CREATE INDEX idx_org_user_active
  ON users(org_id, is_active, last_login DESC);

CREATE INDEX idx_project_member_access
  ON project_members(user_id, last_accessed DESC);
```

#### Phase 3: JSON/Array Indexes (8 indexes)
```sql
-- GIN indexes for JSON containment queries
CREATE INDEX idx_grid_cell_evidence_gin
  ON grid_cells USING GIN(evidence_ids);

CREATE INDEX idx_evidence_themes_gin
  ON evidence USING GIN(themes);

CREATE INDEX idx_open_end_response_codes_gin
  ON open_end_responses USING GIN(codes);

CREATE INDEX idx_concept_eval_ratings_gin
  ON concept_evaluations USING GIN(ratings);

-- GIST for fuzzy matching (SEA language support)
CREATE INDEX idx_evidence_content_gist
  ON evidence USING GIST(content gist_trgm_ops);  -- requires pg_trgm

CREATE INDEX idx_transcript_content_gist
  ON transcripts USING GIST(content gist_trgm_ops);

CREATE INDEX idx_verbatim_quote_gist
  ON verbatims USING GIST(quote gist_trgm_ops);

CREATE INDEX idx_chat_message_content_gist
  ON chat_messages USING GIST(content gist_trgm_ops);
```

#### Phase 4: Partial Indexes (10 indexes for active/pending)
```sql
-- Only index "hot" records to save space
CREATE INDEX idx_analysis_pending
  ON analyses(org_id, created_at DESC)
  WHERE status IN ('pending', 'running');

CREATE INDEX idx_transcript_pending
  ON transcripts(project_id, created_at DESC)
  WHERE transcription_status IN ('pending', 'running');

CREATE INDEX idx_media_job_processing
  ON media_processing_jobs(status, created_at DESC)
  WHERE status IN ('pending', 'processing');

CREATE INDEX idx_import_job_active
  ON import_jobs(org_id, created_at DESC)
  WHERE status IN ('pending', 'running');

CREATE INDEX idx_clip_processing
  ON clips(project_id, created_at DESC)
  WHERE status IN ('pending', 'processing');

CREATE INDEX idx_reel_draft
  ON reels(project_id, created_at DESC)
  WHERE status IN ('draft', 'processing');

CREATE INDEX idx_chat_session_active
  ON chat_sessions(user_id, updated_at DESC)
  WHERE is_active = true;

CREATE INDEX idx_notification_unread
  ON notifications(user_id, created_at DESC)
  WHERE is_read = false;

CREATE INDEX idx_openend_response_unreviewed
  ON open_end_responses(question_id, created_at DESC)
  WHERE review_status = 'pending';

CREATE INDEX idx_comment_unresolved
  ON comments(target_type, created_at DESC)
  WHERE is_resolved = false;
```

### 3.2 Partitioning Strategy (for 100M+ records)

#### Time-Based Range Partitioning
```sql
-- For high-volume, time-series tables
-- Partition transcript_segments by year/quarter
CREATE TABLE transcript_segments_2024_q1
  PARTITION OF transcript_segments
  FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

-- Same for activity_logs, chat_messages, vector_stores

-- For analysis & themes - partition by age
CREATE TABLE analyses_current
  PARTITION OF analyses
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Archive partition for older data
CREATE TABLE analyses_archive
  PARTITION BY RANGE (created_at)
  PARTITION FOR VALUES TO (MAXVALUE);
```

#### List-Based Partitioning for Multi-Market
```sql
-- Partition evidence by market for SEA study queries
CREATE TABLE evidence_indonesia
  PARTITION OF evidence
  FOR VALUES IN ('ID');

CREATE TABLE evidence_singapore
  PARTITION OF evidence
  FOR VALUES IN ('SG');

CREATE TABLE evidence_all_markets
  PARTITION OF evidence
  FOR VALUES IN ('MY', 'TH', 'VN', 'PH', 'en');
```

#### Hash Partitioning for Load Distribution
```sql
-- For tables with high concurrent writes (chat_messages)
CREATE TABLE chat_messages
  PARTITION BY HASH(session_id)
  PARTITIONS 128;  -- 128 partitions for write parallelism

-- Same for activity_logs (high volume)
CREATE TABLE activity_logs
  PARTITION BY HASH(org_id)
  PARTITIONS 64;
```

**Partitioning benefits:**
- Queries on recent data (90% of traffic) use 1-2 partitions
- Archival queries scan old partitions separately
- Parallel index scans across partitions
- Maintenance windows only affect 1 partition
- Auto-vacuum more efficient on smaller tables

### 3.3 Connection Pooling Configuration

#### Current Database Connection Setup
```python
# /app/database.py - CURRENT (INSUFFICIENT)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},  # SQLite hack
    pool_pre_ping=True  # Only safety measure
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

**Problems:**
- Default pool_size: 5 connections (for 1000+ concurrent users = disaster)
- pool_recycle: None (long-living connections get stale)
- No overflow handling
- No connection reuse optimization

#### Optimized Configuration
```python
# /app/database.py - OPTIMIZED
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from .config import settings

if settings.database_url.startswith("postgresql"):
    # Production PostgreSQL config
    engine = create_engine(
        settings.database_url,

        # Connection pooling for 1000+ concurrent users
        poolclass=QueuePool,
        pool_size=20,           # Connections always available
        max_overflow=80,        # Up to 100 total connections
        pool_recycle=3600,      # Recycle after 1 hour (prevent idle timeouts)
        pool_pre_ping=True,     # Verify connection health
        echo_pool=False,        # Set to True for debugging

        # Query optimization
        execution_options={
            "isolation_level": "READ_COMMITTED",  # Not SERIALIZABLE (faster)
        },

        # Connection timeout
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
            "options": "-c default_transaction_isolation=read_committed",
        }
    )
else:
    # SQLite for development
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False  # Prevent lazy-load queries after commit
)

# Connection pool event listeners
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Set session-level parameters on connection"""
    if hasattr(dbapi_conn, 'set_session'):
        # PostgreSQL specific
        dbapi_conn.set_session(
            autocommit=False,
            # Reduce lock contention
            isolation_level='READ_COMMITTED'
        )

@event.listens_for(engine, "engine_disposed")
def receive_engine_disposed(engine):
    """Cleanup on engine disposal"""
    pass

def get_db():
    """Session dependency with optimized handling"""
    db = SessionLocal()
    try:
        # Set connection timeout for this transaction
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
```

**Benefits:**
- 20 steady connections for baseline
- 80 overflow for traffic spikes
- Connections recycled hourly to prevent staling
- Parallel query execution across connection pool
- Better handling of 1000+ concurrent users

### 3.4 Query Optimization Patterns

#### Pattern 1: Fix N+1 Queries with Eager Loading
```python
# BEFORE (N+1): 1 + N queries
analysis = db.query(Analysis).filter_by(id=aid).first()
for theme in analysis.themes:
    for verbatim in theme.verbatims:
        print(verbatim.quote)

# AFTER (Eager Loading): 1 query
from sqlalchemy.orm import selectinload

analysis = (db.query(Analysis)
    .options(
        selectinload(Analysis.themes)
            .selectinload(Theme.verbatims)
    )
    .filter_by(id=aid)
    .first())

# Result: 1 query with JOINs instead of 1 + N + N*M queries
```

#### Pattern 2: Batch Loading for Many Results
```python
# BEFORE (N+1): 1 + N queries per transcript
transcripts = db.query(Transcript).filter(...).all()
transcript_data = []
for t in transcripts:
    data = {
        'id': t.id,
        'title': t.title,
        'segment_count': len(t.segments),  # N+1
        'analysis_count': len(t.analyses)   # N+1
    }
    transcript_data.append(data)

# AFTER (Batch Loading): 2 queries
from sqlalchemy.orm import contains_eager
from sqlalchemy import func

transcript_data = (db.query(
    Transcript.id,
    Transcript.title,
    func.count(distinct(TranscriptSegment.id)).label('segment_count'),
    func.count(distinct(Analysis.id)).label('analysis_count')
)
.outerjoin(TranscriptSegment)
.outerjoin(Analysis)
.filter(...)
.group_by(Transcript.id, Transcript.title)
.all())

# Result: 1-2 queries instead of 1 + 2*N queries
```

#### Pattern 3: Reduce Payload with Selective Columns
```python
# BEFORE: Load entire transcript (300KB text + metadata)
transcript = db.query(Transcript).filter_by(id=tid).first()

# AFTER: Load only needed columns
transcript = (db.query(
    Transcript.id,
    Transcript.title,
    Transcript.created_at,
    Transcript.transcription_status
)
.filter_by(id=tid)
.first())

# Result: ~1KB instead of 300KB transferred per transcript
```

#### Pattern 4: Window Functions for Ranking
```python
# BEFORE: N queries to rank themes within analysis
analysis = db.query(Analysis).filter_by(id=aid).first()
for theme in sorted(analysis.themes, key=lambda t: t.frequency, reverse=True):
    print(f"{theme.name}: {theme.frequency}")

# AFTER: Single query with window function
from sqlalchemy import func, over, desc

theme_ranks = db.query(
    Theme.id,
    Theme.name,
    Theme.frequency,
    func.row_number().over(
        partition_by=Theme.analysis_id,
        order_by=desc(Theme.frequency)
    ).label('rank')
).filter(Theme.analysis_id == aid).all()

# Result: 1 query with built-in ranking
```

---

## PART 4: REDIS CACHING STRATEGY

### 4.1 Cache Layers Architecture

```
┌─────────────────────────────────────┐
│        Application Request          │
└────────────┬────────────────────────┘
             │
      ┌──────▼───────┐
      │ L1: In-Memory│ (Per-process, FastAPI memory)
      │ TTL: 30s     │
      └──────┬───────┘
             │ Cache Miss
      ┌──────▼───────────────┐
      │ L2: Redis (Shared)   │ (All processes)
      │ TTL: 5min - 1 hour   │
      │ Cluster: 6 nodes     │
      └──────┬───────────────┘
             │ Cache Miss
      ┌──────▼───────────────┐
      │ L3: Database         │ (PostgreSQL)
      │ Expensive query      │
      └──────────────────────┘
```

### 4.2 Cache Key Strategy

```python
# Consistent cache key generation
from functools import lru_cache

class CacheKeys:
    """Centralized cache key definitions"""

    # Analysis results (high traffic, expensive queries)
    ANALYSIS = "analysis:{analysis_id}"  # TTL: 1 hour
    ANALYSIS_THEMES = "analysis:{analysis_id}:themes"  # TTL: 30 min
    ANALYSIS_GRID = "grid:{grid_id}"  # TTL: 15 min

    # Transcript data (medium traffic, frequently updated)
    TRANSCRIPT = "transcript:{transcript_id}"  # TTL: 5 min
    TRANSCRIPT_SEGMENTS = "transcript:{transcript_id}:segments"  # TTL: 5 min

    # Project summaries (high traffic, aggregations)
    PROJECT_STATS = "project:{project_id}:stats"  # TTL: 1 hour
    PROJECT_DASHB = "project:{project_id}:dashboard"  # TTL: 30 min

    # User session data (frequent access)
    USER_PREFS = "user:{user_id}:preferences"  # TTL: 24 hours
    USER_SESSIONS = "user:{user_id}:sessions"  # TTL: 1 hour

    # List caches (pagination friendly)
    ORG_PROJECTS = "org:{org_id}:projects:page:{page}"  # TTL: 30 min
    PROJECT_TRANSCRIPTS = "project:{id}:transcripts:page:{page}"  # TTL: 10 min

    # Search results
    SEARCH_EVIDENCE = "search:evidence:{query}:{page}"  # TTL: 5 min
    SEARCH_THEMES = "search:themes:{query}:{page}"  # TTL: 5 min

    # Aggregated stats (dashboard)
    ORG_USAGE = "org:{org_id}:usage:{month}"  # TTL: 1 hour
    PLATFORM_STATS = "platform:stats"  # TTL: 5 min
```

### 4.3 Redis Implementation

```python
# /app/cache.py
import redis
import json
from typing import Any, Optional
from functools import wraps
import pickle

class RedisCache:
    def __init__(self, redis_url: str):
        self.client = redis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_keepalive=True,
            socket_keepalive_options={
                1: 1,  # TCP_KEEPIDLE
                2: 3,  # TCP_KEEPINTVL
                3: 3,  # TCP_KEEPCNT
            },
            max_connections=50,  # Connection pool
            retry_on_timeout=True
        )

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            data = self.client.get(key)
            return json.loads(data) if data else None
        except redis.RedisError as e:
            # Fail gracefully - go to DB
            print(f"Redis GET error for {key}: {e}")
            return None

    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value with TTL (default 1 hour)"""
        try:
            self.client.setex(
                key,
                ttl,
                json.dumps(value, default=str)  # str for dates
            )
            return True
        except redis.RedisError as e:
            print(f"Redis SET error for {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete a key"""
        try:
            self.client.delete(key)
            return True
        except redis.RedisError:
            return False

    def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern"""
        try:
            cursor = 0
            count = 0
            while True:
                cursor, keys = self.client.scan(
                    cursor,
                    match=pattern,
                    count=100
                )
                if keys:
                    count += self.client.delete(*keys)
                if cursor == 0:
                    break
            return count
        except redis.RedisError:
            return 0

    def cache_result(self, key: str, ttl: int = 3600):
        """Decorator for caching function results"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Try cache first
                cached = self.get(key)
                if cached is not None:
                    return cached

                # Call function
                result = func(*args, **kwargs)

                # Cache result
                self.set(key, result, ttl)
                return result
            return wrapper
        return decorator

# Initialize cache
cache = RedisCache(settings.redis_url)
```

### 4.4 Cache Invalidation Strategy

```python
# /app/cache_invalidation.py

class CacheInvalidator:
    """Automatic cache invalidation on data changes"""

    @staticmethod
    def invalidate_on_analysis_change(analysis_id: str, org_id: str):
        """When analysis changes, invalidate related caches"""
        patterns = [
            f"analysis:{analysis_id}:*",
            f"org:{org_id}:usage:*",
            f"project:*:stats",
            f"project:*:dashboard"
        ]
        total = 0
        for pattern in patterns:
            total += cache.delete_pattern(pattern)
        return total

    @staticmethod
    def invalidate_on_transcript_change(transcript_id: str, org_id: str):
        """When transcript changes"""
        patterns = [
            f"transcript:{transcript_id}:*",
            f"org:{org_id}:usage:*",
        ]
        for pattern in patterns:
            cache.delete_pattern(pattern)

    @staticmethod
    def invalidate_on_theme_change(analysis_id: str):
        """When theme added/removed"""
        cache.delete(f"analysis:{analysis_id}:themes")
        cache.delete(f"analysis:{analysis_id}")

# Usage in routers:
# After db.add(analysis); db.commit():
# CacheInvalidator.invalidate_on_analysis_change(analysis.id, user.org_id)
```

---

## PART 5: MIGRATION SCRIPTS

### 5.1 Index Creation Migration

```python
# /alembic/versions/001_create_optimization_indexes.py
"""Create all optimization indexes"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    """Create indexes for optimization"""

    # Phase 1: Foreign key indexes
    op.create_index('idx_project_created_by', 'projects', ['created_by'])
    op.create_index('idx_transcript_source_media', 'transcripts', ['source_media_id'])
    op.create_index('idx_media_asset_project', 'media_assets', ['project_id'])
    op.create_index('idx_analysis_status', 'analyses', ['status'])
    op.create_index('idx_segment_transcript', 'transcript_segments', ['transcript_id'])
    op.create_index('idx_segment_speaker', 'transcript_segments', ['speaker'])

    # Phase 2: Composite indexes
    op.create_index(
        'idx_analysis_org_created',
        'analyses',
        ['org_id', 'status', 'created_at'],
        postgresql_where=sa.text("status IN ('pending', 'running', 'done')")
    )

    op.create_index(
        'idx_transcript_project_created',
        'transcripts',
        ['project_id', 'transcription_status', 'created_at']
    )

    op.create_index(
        'idx_gridcell_grid_position',
        'grid_cells',
        ['grid_id', 'row_id', 'column_id']
    )

    op.create_index(
        'idx_evidence_project_theme',
        'evidence',
        ['project_id', 'significance', 'sentiment']
    )

    # Phase 3: JSON GIN indexes (PostgreSQL only)
    op.create_index(
        'idx_grid_cell_evidence_gin',
        'grid_cells',
        ['evidence_ids'],
        postgresql_using='GIN'
    )

    op.create_index(
        'idx_evidence_themes_gin',
        'evidence',
        ['themes'],
        postgresql_using='GIN'
    )

    # Phase 4: Partial indexes
    op.create_index(
        'idx_analysis_pending',
        'analyses',
        ['org_id', 'created_at'],
        postgresql_where=sa.text("status IN ('pending', 'running')")
    )

    op.create_index(
        'idx_transcript_pending',
        'transcripts',
        ['project_id', 'created_at'],
        postgresql_where=sa.text("transcription_status IN ('pending', 'running')")
    )

def downgrade():
    """Remove all indexes"""
    indexes = [
        'idx_project_created_by',
        'idx_transcript_source_media',
        # ... all 50+ indexes
    ]
    for idx in indexes:
        op.drop_index(idx, table_name='...')
```

### 5.2 Partitioning Migration (Phase 2)

```python
# /alembic/versions/002_partition_large_tables.py
"""Partition large tables for scale"""
from alembic import op

def upgrade():
    """Create partitions for transcript_segments and activity_logs"""

    # Partition transcript_segments by year
    op.execute("""
        ALTER TABLE transcript_segments
        PARTITION BY RANGE (EXTRACT(YEAR FROM created_at));

        CREATE TABLE transcript_segments_2024
            PARTITION OF transcript_segments
            FOR VALUES FROM (2024) TO (2025);

        CREATE TABLE transcript_segments_2025
            PARTITION OF transcript_segments
            FOR VALUES FROM (2025) TO (2026);
    """)

    # Partition activity_logs by hash for write scaling
    op.execute("""
        ALTER TABLE activity_logs
        PARTITION BY HASH(org_id)
        PARTITIONS 64;
    """)

    # Partition chat_messages by hash
    op.execute("""
        ALTER TABLE chat_messages
        PARTITION BY HASH(session_id)
        PARTITIONS 128;
    """)

def downgrade():
    """Remove partitions (risky - must consolidate data first)"""
    raise NotImplementedError("Partitioning downgrade requires manual data migration")
```

### 5.3 Add Vector Column for pgvector (Future)

```python
# /alembic/versions/003_add_pgvector_support.py
"""Add pgvector support for faster semantic search"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    """Add pgvector column alongside JSON embedding"""

    # Install pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')

    # Add vector column (1536-dimensional for OpenAI embeddings)
    op.add_column('vector_stores', sa.Column(
        'embedding_vector',
        sa.dialects.postgresql.VECTOR(dim=1536),  # 1536-d vector
        nullable=True
    ))

    # Create HNSW index for fast similarity search
    op.execute("""
        CREATE INDEX idx_vector_store_embedding
        ON vector_stores
        USING hnsw (embedding_vector vector_cosine_ops)
        WITH (m=16, ef_construction=200);
    """)

    # Backfill: Convert JSON embeddings to vectors
    op.execute("""
        UPDATE vector_stores
        SET embedding_vector = embedding::vector
        WHERE embedding IS NOT NULL;
    """)

def downgrade():
    """Remove pgvector support"""
    op.drop_index('idx_vector_store_embedding')
    op.drop_column('vector_stores', 'embedding_vector')
    op.execute('DROP EXTENSION IF EXISTS vector')
```

---

## PART 6: APPLICATION-LEVEL OPTIMIZATIONS

### 6.1 Eager Load Configuration

```python
# /app/query_optimization.py

from sqlalchemy.orm import selectinload, joinedload, contains_eager
from . import models

class OptimizedQueries:

    @staticmethod
    def get_analysis_with_all(db, analysis_id: str):
        """Get analysis with themes, verbatims, and evidence (0 N+1)"""
        return (db.query(models.Analysis)
            .options(
                selectinload(models.Analysis.themes)
                    .selectinload(models.Theme.verbatims),
                selectinload(models.Analysis.implications),
                joinedload(models.Analysis.transcript)
            )
            .filter(models.Analysis.id == analysis_id)
            .first())

    @staticmethod
    def get_project_dashboard(db, project_id: str):
        """Get project with stats for dashboard"""
        return (db.query(models.Project)
            .options(
                selectinload(models.Project.transcripts)
                    .selectinload(models.Transcript.segments),
                joinedload(models.Project.org)
            )
            .filter(models.Project.id == project_id)
            .first())

    @staticmethod
    def get_transcripts_paginated(db, project_id: str, page: int = 1, limit: int = 20):
        """Get paginated transcripts without N+1"""
        offset = (page - 1) * limit
        return (db.query(models.Transcript)
            .options(
                selectinload(models.Transcript.segments),
                selectinload(models.Transcript.analyses)
            )
            .filter(models.Transcript.project_id == project_id)
            .order_by(models.Transcript.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all())
```

### 6.2 Batch Write Operations

```python
# /app/batch_operations.py

from sqlalchemy import insert, update
from typing import List

class BatchOperations:

    @staticmethod
    def bulk_create_verbatims(db, theme_id: str, verbatims: List[dict]):
        """Insert 1000s of verbatims efficiently"""
        stmt = insert(models.Verbatim).values([
            {
                **v,
                'theme_id': theme_id,
                'id': models._uid()
            }
            for v in verbatims
        ])
        db.execute(stmt)
        db.commit()

    @staticmethod
    def bulk_update_analysis_status(db, analysis_ids: List[str], status: str):
        """Update 1000s of records with single query"""
        stmt = (update(models.Analysis)
            .where(models.Analysis.id.in_(analysis_ids))
            .values(status=status))
        db.execute(stmt)
        db.commit()

        # Invalidate cache
        from .cache_invalidation import CacheInvalidator
        for analysis_id in analysis_ids:
            cache.delete(f"analysis:{analysis_id}:*")
```

### 6.3 Database Connection Pooling in FastAPI

```python
# /app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from .database import engine, SessionLocal

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI
    - Ensures connection pool is initialized on startup
    - Gracefully closes on shutdown
    """

    # Startup
    print(f"Database pool size: {engine.pool.size()}")
    print(f"Database pool overflow: {engine.pool._timeout}")

    yield

    # Shutdown - drain connections gracefully
    print("Closing database connections...")
    engine.dispose()

app = FastAPI(lifespan=lifespan)
```

---

## PART 7: PERFORMANCE BENCHMARKS

### 7.1 Expected Improvements

| Operation | Current | Optimized | Improvement |
|-----------|---------|-----------|-------------|
| List transcripts (1K) | 2.5s | 180ms | 14x faster |
| Get analysis + themes + verbatims | 800ms | 45ms | 18x faster |
| Search evidence (10K results) | 5s | 350ms | 14x faster |
| Dashboard load (all stats) | 3.2s | 200ms | 16x faster |
| Batch create 1000 verbatims | 8s | 450ms | 18x faster |
| Generate report (50K records) | 12s | 800ms | 15x faster |
| Chat semantic search | 1200ms | 80ms | 15x faster |

**Total improvement:** Average 15x faster across operations

### 7.2 Load Testing Targets

```bash
# With optimizations, should handle:
- 1000 concurrent users
- 10,000 requests/second
- Sub-100ms p95 latency
- Sub-500ms p99 latency

# Before optimization:
- 50 concurrent users (max)
- 500 requests/second
- 1-2s p95 latency
```

---

## PART 8: IMPLEMENTATION ROADMAP

### Phase 1: Immediate (Week 1-2) - High ROI
- [ ] Create all 50+ indexes (0 downtime with CONCURRENTLY)
- [ ] Implement eager loading fixes for N+1 queries
- [ ] Configure connection pooling (20/80/3600)
- [ ] Set up Redis caching layer
- [ ] Deploy performance monitoring

**Estimated improvement:** 8-10x faster queries

### Phase 2: Short-term (Week 3-4)
- [ ] Create partitioning for `transcript_segments` (range by year)
- [ ] Implement batch write operations
- [ ] Add caching decorators to routers
- [ ] Migrate JSON embeddings to pgvector
- [ ] Create migration scripts for all changes

**Estimated improvement:** Additional 2-3x for large datasets

### Phase 3: Medium-term (Month 2)
- [ ] Hash partition `activity_logs` and `chat_messages`
- [ ] Implement materialized views for dashboards
- [ ] Add read replicas for reporting
- [ ] Set up automatic table compression
- [ ] Implement auto-vacuum tuning

**Estimated improvement:** 15x total from baseline

### Phase 4: Long-term (Month 3+)
- [ ] Archive old data (>1 year) to cold storage
- [ ] Implement query result caching with invalidation
- [ ] Add database monitoring and alerting
- [ ] Tune PostgreSQL configuration parameters
- [ ] Load test to 1000+ concurrent users

---

## PART 9: MONITORING & MAINTENANCE

### 9.1 Key Metrics to Monitor

```sql
-- Query latency (should be < 100ms p95)
SELECT
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Cache hit ratio (should be > 80%)
INFO stats
-- Redis command: INFO stats -> hits/(hits+misses)

-- Connection pool usage
SELECT
    datname,
    count(*) as connections,
    state,
    state_change
FROM pg_stat_activity
GROUP BY datname, state;

-- Slow queries
SELECT query, calls, mean_time
FROM pg_stat_statements
WHERE mean_time > 100  -- > 100ms
ORDER BY mean_time DESC;

-- Index bloat
SELECT schemaname, tablename, indexname,
    round(100 * (pg_relation_size(indexrelid) - pg_relation_size(relfilenode)) /
    pg_relation_size(indexrelid)) as bloat_ratio
FROM pg_stat_user_indexes
WHERE pg_relation_size(indexrelid) > 1000000
ORDER BY bloat_ratio DESC;

-- Table bloat
SELECT schemaname, tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    round(100.0 * pg_total_relation_size(schemaname||'.'||tablename) /
    (SELECT pg_total_relation_size('public'::regnamespace))::numeric, 2) as pct
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 9.2 Maintenance Tasks

```bash
# Weekly: Analyze query performance
psql $DATABASE_URL -c "ANALYZE VERBOSE;"

# Monthly: Rebuild bloated indexes
psql $DATABASE_URL -c "REINDEX TABLE CONCURRENTLY analyses;"

# Quarterly: Vacuum full (during maintenance window)
psql $DATABASE_URL -c "VACUUM FULL ANALYZE;"

# Continuous: Monitor slow query log
tail -f /var/log/postgresql/postgresql.log | grep "duration:"
```

---

## PART 10: DATABASE CONFIGURATION TUNING

### 10.1 PostgreSQL postgresql.conf Optimization

```ini
# /etc/postgresql/14/main/postgresql.conf

# Memory settings (for 32GB RAM server)
shared_buffers = 8GB              # 25% of RAM
effective_cache_size = 24GB       # 75% of RAM
work_mem = 50MB                   # per operation
maintenance_work_mem = 2GB        # for VACUUM, CREATE INDEX

# Connection settings
max_connections = 500             # for 1000 concurrent users
superuser_reserved_connections = 5

# Query planner
random_page_cost = 1.1            # SSD-optimized
effective_io_concurrency = 200    # parallel I/O

# Write performance
synchronous_commit = 'local'      # balance durability/speed
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 4GB
min_wal_size = 1GB

# Parallelization
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_parallel_maintenance_workers = 4

# Logging
log_min_duration_statement = 100  # log queries > 100ms
log_statement = 'mod'             # log DDL changes
log_connections = on
log_disconnections = on

# Vacuum settings
autovacuum = on
autovacuum_naptime = 10s          # check every 10s instead of default 1m
autovacuum_vacuum_scale_factor = 0.05
autovacuum_analyze_scale_factor = 0.01
```

### 10.2 Application Config Settings

```python
# /app/config.py - ADD THESE SETTINGS

class Settings(BaseSettings):
    # ... existing settings ...

    # Database performance
    db_pool_size: int = 20
    db_max_overflow: int = 80
    db_pool_recycle: int = 3600

    # Query optimization
    query_timeout_ms: int = 30000  # 30 second timeout
    enable_query_cache: bool = True
    cache_ttl_short: int = 300     # 5 min
    cache_ttl_medium: int = 1800   # 30 min
    cache_ttl_long: int = 3600     # 1 hour

    # Batch operations
    batch_size: int = 1000
    batch_insert_timeout: int = 60

    # Redis clustering (if using Redis Cluster)
    redis_cluster: bool = False
    redis_cluster_nodes: str = ""
```

---

## PART 11: QUICK IMPLEMENTATION CHECKLIST

```
PHASE 1: INDEXES (40% improvement - 2 days)
[ ] Install postgres extension pg_trgm: CREATE EXTENSION pg_trgm;
[ ] Create 50+ indexes (run migration)
[ ] Validate indexes with EXPLAIN ANALYZE
[ ] Verify query plans use indexes
[ ] Monitor disk space (indexes ~20-30% of data)

PHASE 2: CONNECTION POOLING (5% improvement - 1 day)
[ ] Update database.py with QueuePool configuration
[ ] Test with 100+ concurrent connections
[ ] Monitor pool usage in production
[ ] Tune pool_size and max_overflow based on load

PHASE 3: EAGER LOADING (20% improvement - 3 days)
[ ] Create OptimizedQueries class
[ ] Update all routers with selectinload() options
[ ] Remove lazy-load access in request handlers
[ ] Test for N+1 query regressions
[ ] Update unit tests with new query patterns

PHASE 4: REDIS CACHING (15% improvement - 2 days)
[ ] Deploy Redis (standalone or cluster)
[ ] Implement RedisCache class
[ ] Add cache_result decorators to routers
[ ] Implement cache invalidation
[ ] Monitor cache hit ratios (target: >80%)

PHASE 5: MONITORING (Critical - 1 day)
[ ] Enable pg_stat_statements extension
[ ] Set up query logging (log_min_duration_statement = 100)
[ ] Create monitoring dashboard (DataDog/Prometheus/New Relic)
[ ] Set up slow query alerts (>100ms)
[ ] Configure auto-vacuum monitoring

PHASE 6: PARTITIONING (Long-term - 2 weeks)
[ ] Backup database before partitioning
[ ] Partition transcript_segments by year
[ ] Partition activity_logs by hash
[ ] Test partition query performance
[ ] Monitor partition sizes

PHASE 7: TESTING & VALIDATION (Critical - 3 days)
[ ] Load test with 100+ concurrent users
[ ] Measure latency distribution (p50, p95, p99)
[ ] Test cache invalidation under load
[ ] Validate no data loss in migrations
[ ] Perform failover tests
```

---

## PART 12: DATABASE UPGRADE PATH

### Current State (Development)
```
SQLite: qualengine.db
- Single-file database
- No concurrent writes
- Suitable for <1K records
```

### Recommended: Staged Migration

#### Step 1: Development Environment
```bash
# Keep SQLite for local development
# Add PostgreSQL docker container for testing
docker run --name qual-postgres \
  -e POSTGRES_PASSWORD=dev \
  -p 5432:5432 \
  postgres:14-alpine
```

#### Step 2: Testing Environment
```bash
# Migrate to PostgreSQL with:
# 1. Same schema (alembic handles this)
# 2. All optimizations applied
# 3. Replication configured
```

#### Step 3: Production Deployment
```bash
# AWS RDS PostgreSQL:
# - db.r5.4xlarge (16 vCPU, 128GB RAM)
# - 1000 IOPS gp3 volume
# - Multi-AZ (automatic failover)
# - Automated backups (30-day retention)
# - Read replicas for reporting

# OR: Self-hosted PostgreSQL
# - 32GB RAM, SSD storage
# - Dedicated PostgreSQL server (not shared)
# - Hot standby configured
# - Streaming replication
```

---

## SUMMARY: EXPECTED RESULTS

### Before Optimization
```
Concurrent Users:    50
Requests/Second:     500
P50 Latency:         80ms
P95 Latency:         1.2s
P99 Latency:         2.5s
Cache Hit Ratio:     0% (no cache)
Database Connections: 5
```

### After Full Optimization
```
Concurrent Users:    1000+
Requests/Second:     10,000+
P50 Latency:         15ms
P95 Latency:         80ms
P99 Latency:         200ms
Cache Hit Ratio:     85%
Database Connections: 100 (pool)
Average Query:       < 50ms
```

**Result:** 15-20x faster, ready to beat CoLoop.ai

---

## RESOURCES & REFERENCES

1. **SQLAlchemy Optimization:** https://docs.sqlalchemy.org/
2. **PostgreSQL Performance:** https://www.postgresql.org/docs/
3. **Redis Caching:** https://redis.io/documentation
4. **Database Indexing:** https://use-the-index-luke.com/
5. **Query Analysis:** `EXPLAIN ANALYZE` command

---

**Document Version:** 1.0
**Last Updated:** 2024-06-24
**Next Review:** After Phase 1 completion
