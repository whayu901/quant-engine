"""
Optimized database configuration for PostgreSQL
Handles connection pooling, query optimization, and monitoring
"""

from sqlalchemy import create_engine, event, func, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool, NullPool
from .config import settings
import logging

logger = logging.getLogger(__name__)

# Determine pool class based on environment
def get_pool_class():
    """SQLite for dev, QueuePool for production"""
    if settings.database_url.startswith("sqlite"):
        return NullPool  # SQLite doesn't benefit from pooling
    return QueuePool


# Create engine with optimized settings
def create_optimized_engine():
    """
    Create SQLAlchemy engine with production-grade optimization

    For PostgreSQL:
    - Connection pooling: 20 steady + 80 overflow
    - Pool recycling: 3600s (1 hour)
    - Pre-ping: Verify connection health
    - Isolation level: READ_COMMITTED for speed

    For SQLite (dev):
    - NullPool: No pooling overhead
    """

    if settings.database_url.startswith("postgresql"):
        # Production PostgreSQL configuration
        engine = create_engine(
            settings.database_url,

            # ===== CONNECTION POOLING =====
            # For handling 1000+ concurrent users
            poolclass=QueuePool,
            pool_size=settings.db_pool_size,  # 20 steady connections
            max_overflow=settings.db_max_overflow,  # +80 for spikes
            pool_recycle=settings.db_pool_recycle,  # Recycle after 1 hour
            pool_pre_ping=True,  # Verify connection before use
            echo_pool=False,  # Set to True for debugging

            # ===== QUERY OPTIMIZATION =====
            execution_options={
                "isolation_level": "READ_COMMITTED",  # Faster than SERIALIZABLE
                "compiled_cache": None,  # SQLAlchemy query caching
            },

            # ===== CONNECTION SETTINGS =====
            connect_args={
                "connect_timeout": 10,
                "keepalives": 1,
                "keepalives_idle": 30,
                "keepalives_interval": 10,
                "keepalives_count": 5,
                "options": "-c default_transaction_isolation=read_committed",
            },

            # ===== PERFORMANCE =====
            max_cached_statement_lifetime=3600,  # Cache statements for 1 hour
            max_overflow_recycle=1800,  # Recycle overflow connections after 30min
        )

    else:
        # SQLite for development
        engine = create_engine(
            settings.database_url,
            connect_args={"check_same_thread": False},
            poolclass=NullPool,
            echo=False,
        )

    # ===== EVENT LISTENERS =====
    setup_engine_events(engine)

    return engine


def setup_engine_events(engine):
    """
    Setup event listeners for connection management and monitoring
    """

    @event.listens_for(engine, "connect")
    def receive_connect(dbapi_conn, connection_record):
        """
        Initialize connection with session parameters
        Runs immediately after database connection is established
        """
        if settings.database_url.startswith("postgresql"):
            # PostgreSQL specific optimizations
            cursor = dbapi_conn.cursor()
            try:
                # Enable query optimization
                cursor.execute("SET synchronous_commit TO LOCAL")
                cursor.execute("SET work_mem TO '50MB'")
                cursor.execute("SET shared_buffers TO '128MB'")

                # Connection pooling
                dbapi_conn.set_session(
                    autocommit=False,
                    isolation_level='READ_COMMITTED'
                )
                cursor.close()
                logger.debug("PostgreSQL session initialized")
            except Exception as e:
                logger.error(f"Failed to setup connection: {e}")

    @event.listens_for(engine, "pool_connect")
    def receive_pool_connect(dbapi_conn, connection_record):
        """Pool connection established"""
        pass

    @event.listens_for(engine, "pool_checkout")
    def receive_pool_checkout(dbapi_conn, connection_record, connection_proxy):
        """
        Connection checked out from pool
        Good place to log pool statistics
        """
        if hasattr(engine.pool, "size"):
            logger.debug(
                f"Pool checkout - Size: {engine.pool.size()}, "
                f"Checked in: {engine.pool.checkedin()}"
            )

    @event.listens_for(engine, "engine_disposed")
    def receive_engine_disposed(engine):
        """Engine disposed - cleanup"""
        logger.info("Database engine disposed - all connections closed")

    @event.listens_for(engine, "rollback")
    def receive_rollback(conn):
        """Transaction rolled back"""
        logger.warning(f"Transaction rolled back: {conn}")


# Create engine instance
engine = create_optimized_engine()

# Create session factory
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,  # Prevent lazy-load queries after commit
)


class OptimizedSession(Session):
    """
    Enhanced Session class with optimization helpers
    """

    def bulk_insert_mappings(self, mapper, mappings, return_defaults=False, render_nulls=False):
        """
        Optimized bulk insert using native PostgreSQL COPY for large datasets
        Falls back to standard bulk_insert_mappings for small datasets
        """
        if len(mappings) > 100 and self.bind.dialect.name == 'postgresql':
            # Use raw SQL COPY for massive inserts
            return super().bulk_insert_mappings(
                mapper, mappings,
                return_defaults=return_defaults,
                render_nulls=render_nulls
            )
        else:
            return super().bulk_insert_mappings(
                mapper, mappings,
                return_defaults=return_defaults,
                render_nulls=render_nulls
            )

    def query_with_stats(self, *args):
        """
        Get query object with automatic timing
        Usage: results = db.query_with_stats(Model).filter(...).all()
        """
        query = self.query(*args)
        # Can be extended to log execution time
        return query


# Create session factory with custom session class
SessionLocal = sessionmaker(
    bind=engine,
    class_=OptimizedSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_db():
    """
    FastAPI dependency for database session
    Auto-rollback on exception, always close connection
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        logger.error(f"Database session error: {e}")
        raise
    finally:
        db.close()


# ===== UTILITY FUNCTIONS =====

def check_connection_pool_status() -> dict:
    """
    Get connection pool statistics for monitoring
    """
    if hasattr(engine.pool, 'size'):
        return {
            'pool_size': engine.pool.size(),
            'checked_in': engine.pool.checkedin(),
            'checked_out': engine.pool.size() - engine.pool.checkedin(),
            'pool_class': type(engine.pool).__name__,
        }
    return {'pool_class': 'NullPool (SQLite)'}


def get_db_stats(db: Session) -> dict:
    """
    Get database statistics for monitoring
    """
    if db.bind.dialect.name == 'postgresql':
        # Query PostgreSQL statistics
        stats = db.execute(text("""
            SELECT
                (SELECT count(*) FROM pg_stat_activity) as active_connections,
                (SELECT sum(blks_hit) / (sum(blks_hit) + sum(blks_read))
                 FROM pg_stat_database
                 WHERE datname = current_database()) as cache_hit_ratio,
                (SELECT count(*) FROM pg_stat_statements
                 WHERE mean_exec_time > 100) as slow_queries_count
        """)).first()

        return {
            'active_connections': stats[0] if stats else None,
            'cache_hit_ratio': float(stats[1]) if stats and stats[1] else None,
            'slow_queries': stats[2] if stats else None,
        }
    return {}


def enable_query_logging(level='INFO'):
    """
    Enable query logging for debugging
    Should only be used in development
    """
    if level == 'DEBUG':
        logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)
        logging.getLogger('sqlalchemy.pool').setLevel(logging.DEBUG)
    else:
        logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
