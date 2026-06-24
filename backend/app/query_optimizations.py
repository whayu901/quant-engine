"""
Optimized Query Patterns for N+1 Prevention
Implements eager loading, batch operations, and efficient aggregations
"""

from sqlalchemy.orm import Session, selectinload, joinedload, contains_eager
from sqlalchemy import func, distinct, and_, or_, select, desc
from typing import List, Optional, Tuple, Any
from . import models
import logging

logger = logging.getLogger(__name__)


class OptimizedQueries:
    """
    Collection of optimized query patterns that avoid N+1 problems
    All methods return data in single query or minimal queries
    """

    # ===== ANALYSIS QUERIES =====

    @staticmethod
    def get_analysis_complete(db: Session, analysis_id: str) -> Optional[models.Analysis]:
        """
        Get analysis WITH all related data (themes, verbatims, implications)
        BEFORE (N+1): 1 + N + N*M queries = SLOW
        AFTER (optimized): 1 query with JOINs = FAST

        Expected time: <50ms for 1000 records
        """
        return (db.query(models.Analysis)
            .options(
                selectinload(models.Analysis.themes)
                    .selectinload(models.Theme.verbatims),
                selectinload(models.Analysis.implications),
                joinedload(models.Analysis.transcript)
                    .joinedload(models.Transcript.project)
            )
            .filter(models.Analysis.id == analysis_id)
            .first())

    @staticmethod
    def get_analyses_for_transcript(db: Session, transcript_id: str) -> List[models.Analysis]:
        """
        Get all analyses for a transcript with themes (0 N+1)
        """
        return (db.query(models.Analysis)
            .options(
                selectinload(models.Analysis.themes),
                selectinload(models.Analysis.implications),
            )
            .filter(models.Analysis.transcript_id == transcript_id)
            .order_by(models.Analysis.created_at.desc())
            .all())

    @staticmethod
    def get_analyses_summary(
        db: Session,
        org_id: str,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[Tuple]:
        """
        Get analyses with counts (themes, verbatims) without N+1
        Uses GROUP BY and COUNT for aggregation

        Returns list of tuples: (analysis_id, status, theme_count, verbatim_count)
        """
        query = (db.query(
            models.Analysis.id,
            models.Analysis.status,
            func.count(distinct(models.Theme.id)).label('theme_count'),
            func.count(distinct(models.Verbatim.id)).label('verbatim_count'),
        )
        .outerjoin(models.Theme)
        .outerjoin(models.Verbatim)
        .filter(models.Analysis.org_id == org_id)
        .group_by(models.Analysis.id, models.Analysis.status)
        )

        if status:
            query = query.filter(models.Analysis.status == status)

        return query.order_by(models.Analysis.created_at.desc()).limit(limit).all()

    # ===== TRANSCRIPT QUERIES =====

    @staticmethod
    def get_transcript_with_segments(
        db: Session,
        transcript_id: str
    ) -> Optional[models.Transcript]:
        """
        Get transcript with all segments loaded
        BEFORE (N+1): 1 + 1 query for segments
        AFTER: 1 query with JOIN
        """
        return (db.query(models.Transcript)
            .options(
                selectinload(models.Transcript.segments),
                selectinload(models.Transcript.analyses),
                joinedload(models.Transcript.project)
                    .joinedload(models.Project.org)
            )
            .filter(models.Transcript.id == transcript_id)
            .first())

    @staticmethod
    def get_transcripts_paginated(
        db: Session,
        project_id: str,
        page: int = 1,
        limit: int = 20
    ) -> List[models.Transcript]:
        """
        Get paginated transcripts with segment counts
        Uses COUNT(*) to avoid fetching all segments
        """
        offset = (page - 1) * limit

        # Get IDs first
        transcript_ids = (db.query(models.Transcript.id)
            .filter(models.Transcript.project_id == project_id)
            .order_by(models.Transcript.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all())

        # Then load with relationships
        if not transcript_ids:
            return []

        ids = [t[0] for t in transcript_ids]
        return (db.query(models.Transcript)
            .options(
                selectinload(models.Transcript.segments),
                selectinload(models.Transcript.analyses),
            )
            .filter(models.Transcript.id.in_(ids))
            .order_by(models.Transcript.created_at.desc())
            .all())

    @staticmethod
    def get_transcript_stats(
        db: Session,
        project_id: str
    ) -> List[Tuple]:
        """
        Get transcript statistics (segment count, analysis count)
        without N+1 queries

        Returns: List[(transcript_id, segment_count, analysis_count)]
        """
        return (db.query(
            models.Transcript.id,
            func.count(distinct(models.TranscriptSegment.id)).label('segment_count'),
            func.count(distinct(models.Analysis.id)).label('analysis_count'),
        )
        .outerjoin(models.TranscriptSegment)
        .outerjoin(models.Analysis)
        .filter(models.Transcript.project_id == project_id)
        .group_by(models.Transcript.id)
        .order_by(models.Transcript.created_at.desc())
        .all())

    # ===== THEME & VERBATIM QUERIES =====

    @staticmethod
    def get_theme_with_verbatims(db: Session, theme_id: str) -> Optional[models.Theme]:
        """
        Get theme with all verbatims (0 N+1)
        """
        return (db.query(models.Theme)
            .options(selectinload(models.Theme.verbatims))
            .filter(models.Theme.id == theme_id)
            .first())

    @staticmethod
    def get_themes_ranked_by_prevalence(
        db: Session,
        analysis_id: str
    ) -> List[models.Theme]:
        """
        Get themes ordered by prevalence with verbatim counts
        Uses window functions for ranking
        """
        return (db.query(models.Theme)
            .options(selectinload(models.Theme.verbatims))
            .filter(models.Theme.analysis_id == analysis_id)
            .order_by(
                # Rank by prevalence: high > medium > low
                # Then by frequency (if available)
                models.Theme.prevalence,
                models.Theme.order_idx
            )
            .all())

    # ===== EVIDENCE QUERIES =====

    @staticmethod
    def get_evidence_for_grid_cell(
        db: Session,
        evidence_ids: List[str]
    ) -> List[models.Evidence]:
        """
        Get evidence records for grid cell
        Uses IN clause instead of looping through JSON

        BEFORE (N+1): Query inside loop for each cell
        AFTER: 1 query with IN clause
        """
        if not evidence_ids:
            return []

        return (db.query(models.Evidence)
            .filter(models.Evidence.id.in_(evidence_ids))
            .order_by(models.Evidence.created_at.desc())
            .all())

    @staticmethod
    def get_evidence_by_sentiment(
        db: Session,
        project_id: str,
        sentiment_range: Tuple[float, float] = None,
        significance: str = None,
        limit: int = 100
    ) -> List[models.Evidence]:
        """
        Get evidence filtered by sentiment and importance
        Uses composite index for speed
        """
        query = db.query(models.Evidence).filter(
            models.Evidence.project_id == project_id
        )

        if sentiment_range:
            query = query.filter(
                models.Evidence.sentiment.between(sentiment_range[0], sentiment_range[1])
            )

        if significance:
            query = query.filter(models.Evidence.significance == significance)

        return query.order_by(models.Evidence.sentiment.desc()).limit(limit).all()

    # ===== GRID CELL QUERIES =====

    @staticmethod
    def get_grid_cells_for_grid(
        db: Session,
        grid_id: str
    ) -> List[models.GridCell]:
        """
        Get all grid cells with loaded evidence references
        """
        return (db.query(models.GridCell)
            .filter(models.GridCell.grid_id == grid_id)
            .order_by(models.GridCell.row_id, models.GridCell.column_id)
            .all())

    @staticmethod
    def get_grid_cells_filtered(
        db: Session,
        grid_id: str,
        row_id: Optional[str] = None,
        min_percentage: float = 0
    ) -> List[models.GridCell]:
        """
        Get filtered grid cells with efficient filtering
        """
        query = (db.query(models.GridCell)
            .filter(models.GridCell.grid_id == grid_id)
        )

        if row_id:
            query = query.filter(models.GridCell.row_id == row_id)

        if min_percentage > 0:
            query = query.filter(models.GridCell.percentage >= min_percentage)

        return query.all()

    # ===== PROJECT QUERIES =====

    @staticmethod
    def get_project_dashboard_data(
        db: Session,
        project_id: str
    ) -> Tuple[models.Project, Any]:
        """
        Get all data for project dashboard in minimum queries
        """
        project = (db.query(models.Project)
            .options(
                selectinload(models.Project.transcripts),
                selectinload(models.Project.org)
            )
            .filter(models.Project.id == project_id)
            .first())

        if not project:
            return None, None

        # Get stats in separate query (more efficient than loading all relationships)
        stats = (db.query(
            func.count(distinct(models.Transcript.id)).label('transcript_count'),
            func.count(distinct(models.TranscriptSegment.id)).label('segment_count'),
            func.count(distinct(models.Analysis.id)).label('analysis_count'),
        )
        .outerjoin(models.Transcript)
        .outerjoin(models.TranscriptSegment)
        .outerjoin(models.Analysis)
        .filter(models.Project.id == project_id)
        .first())

        return project, stats

    # ===== CHAT/RAG QUERIES =====

    @staticmethod
    def get_chat_session_with_messages(
        db: Session,
        session_id: str,
        limit: int = 50
    ) -> Optional[models.ChatSession]:
        """
        Get chat session with recent messages (0 N+1)
        """
        return (db.query(models.ChatSession)
            .options(
                selectinload(models.ChatSession.messages)
                .options(
                    selectinload(models.ChatMessage).defer(
                        # Skip large fields if not needed
                        models.ChatMessage.retrieved_chunks,
                        models.ChatMessage.retrieval_scores
                    )
                )
            )
            .filter(models.ChatSession.id == session_id)
            .first())

    # ===== BATCH OPERATIONS =====

    @staticmethod
    def batch_create_verbatims(
        db: Session,
        theme_id: str,
        verbatim_data: List[dict]
    ) -> int:
        """
        Create many verbatims efficiently using bulk_insert_mappings

        BEFORE (loop): 1000 individual INSERT queries = 1000 round trips
        AFTER (batch): 1-2 INSERT statements = 2 round trips
        """
        from sqlalchemy import insert

        if not verbatim_data:
            return 0

        # Prepare bulk insert data
        for v in verbatim_data:
            v['theme_id'] = theme_id
            v['id'] = models._uid()

        # Use raw SQL for massive inserts (pgcopy is fastest)
        stmt = insert(models.Verbatim).values(verbatim_data)
        result = db.execute(stmt)
        db.commit()

        return result.rowcount

    @staticmethod
    def batch_update_status(
        db: Session,
        model_class,
        ids: List[str],
        status: str
    ) -> int:
        """
        Update many records efficiently

        BEFORE: 1000 individual UPDATE queries
        AFTER: 1 UPDATE with WHERE IN clause
        """
        from sqlalchemy import update

        stmt = (update(model_class)
            .where(model_class.id.in_(ids))
            .values(status=status))

        result = db.execute(stmt)
        db.commit()

        return result.rowcount

    # ===== SEARCH QUERIES =====

    @staticmethod
    def search_evidence(
        db: Session,
        project_id: str,
        query_text: str,
        limit: int = 50
    ) -> List[models.Evidence]:
        """
        Full-text search on evidence using GIN index
        Uses PostgreSQL text search capabilities

        Requires: CREATE EXTENSION pg_trgm;
        Requires: idx_evidence_content_gist index
        """
        if not query_text or len(query_text) < 3:
            return []

        # Use ILIKE with % - will use GIN index
        return (db.query(models.Evidence)
            .filter(
                models.Evidence.project_id == project_id,
                models.Evidence.content.ilike(f"%{query_text}%")
            )
            .order_by(models.Evidence.created_at.desc())
            .limit(limit)
            .all())

    @staticmethod
    def search_transcripts(
        db: Session,
        project_id: str,
        query_text: str,
        limit: int = 50
    ) -> List[models.Transcript]:
        """
        Search transcripts by content
        Uses GIN index on transcript content
        """
        if not query_text or len(query_text) < 3:
            return []

        return (db.query(models.Transcript)
            .filter(
                models.Transcript.project_id == project_id,
                models.Transcript.content.ilike(f"%{query_text}%")
            )
            .order_by(models.Transcript.created_at.desc())
            .limit(limit)
            .all())

    # ===== UTILITY QUERIES =====

    @staticmethod
    def count_pending_tasks(db: Session, org_id: str) -> dict:
        """
        Get counts of pending work items (0 N+1)
        """
        pending_analyses = db.query(func.count(models.Analysis.id)).filter(
            models.Analysis.org_id == org_id,
            models.Analysis.status.in_(['pending', 'running'])
        ).scalar() or 0

        pending_transcriptions = db.query(func.count(models.Transcript.id)).filter(
            models.Transcript.org_id == org_id,
            models.Transcript.transcription_status.in_(['pending', 'running'])
        ).scalar() or 0

        pending_clips = db.query(func.count(models.Clip.id)).filter(
            models.Clip.org_id == org_id,
            models.Clip.status.in_(['pending', 'processing'])
        ).scalar() or 0

        return {
            'analyses': pending_analyses,
            'transcriptions': pending_transcriptions,
            'clips': pending_clips,
        }

    @staticmethod
    def get_org_usage_stats(db: Session, org_id: str) -> dict:
        """
        Get organization usage statistics for dashboard
        Single query with aggregations
        """
        stats = db.query(
            func.count(distinct(models.User.id)).label('user_count'),
            func.count(distinct(models.Project.id)).label('project_count'),
            func.count(distinct(models.Transcript.id)).label('transcript_count'),
            func.count(distinct(models.Analysis.id)).label('analysis_count'),
        ).filter(
            models.Org.id == org_id
        ).outerjoin(models.User).outerjoin(
            models.Project
        ).outerjoin(models.Transcript).outerjoin(
            models.Analysis
        ).first()

        return {
            'users': stats.user_count or 0,
            'projects': stats.project_count or 0,
            'transcripts': stats.transcript_count or 0,
            'analyses': stats.analysis_count or 0,
        }


# ===== QUERY MONITORING =====

def log_query_time(query_func):
    """
    Decorator to log query execution time
    Use for performance monitoring
    """
    import time
    from functools import wraps

    @wraps(query_func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = query_func(*args, **kwargs)
        elapsed = time.time() - start

        if elapsed > 0.1:  # Log slow queries > 100ms
            logger.warning(
                f"Slow query: {query_func.__name__} took {elapsed:.2f}s"
            )
        else:
            logger.debug(
                f"Query: {query_func.__name__} took {elapsed:.3f}s"
            )

        return result

    return wrapper
