"""
Optimized Database Configuration
Implements connection pooling, read replicas, and performance optimizations
"""

import os
from typing import AsyncGenerator, Optional, Dict, Any
from contextlib import asynccontextmanager
import logging

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    create_async_engine,
    async_sessionmaker
)
from sqlalchemy.pool import NullPool, QueuePool
from sqlalchemy.orm import sessionmaker
from sqlalchemy import event, text
import asyncpg

logger = logging.getLogger(__name__)

# Database configuration from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://qual_user:qual_password@localhost/qual_engine"
)

READ_REPLICA_URL = os.getenv(
    "READ_REPLICA_URL",
    DATABASE_URL  # Falls back to primary if no replica
)


class DatabaseConfig:
    """Database configuration settings"""

    # Connection pool settings
    POOL_SIZE = 20  # Number of connections to maintain
    MAX_OVERFLOW = 80  # Maximum overflow connections
    POOL_TIMEOUT = 30  # Seconds to wait for connection
    POOL_RECYCLE = 3600  # Recycle connections after 1 hour
    POOL_PRE_PING = True  # Test connections before using

    # Query optimization settings
    STATEMENT_TIMEOUT = 30000  # 30 seconds
    LOCK_TIMEOUT = 10000  # 10 seconds
    IDLE_IN_TRANSACTION_TIMEOUT = 60000  # 60 seconds

    # PostgreSQL specific optimizations
    PG_SETTINGS = {
        "jit": "off",  # Disable JIT for consistent performance
        "random_page_cost": "1.1",  # SSD optimization
        "effective_cache_size": "4GB",
        "shared_buffers": "256MB",
        "work_mem": "16MB",
        "maintenance_work_mem": "256MB",
        "effective_io_concurrency": "200",  # SSD optimization
        "max_parallel_workers_per_gather": "4",
        "max_parallel_workers": "8"
    }


class OptimizedDatabase:
    """Optimized database connection manager with pooling"""

    def __init__(self):
        self.write_engine: Optional[AsyncEngine] = None
        self.read_engine: Optional[AsyncEngine] = None
        self.write_session_maker: Optional[async_sessionmaker] = None
        self.read_session_maker: Optional[async_sessionmaker] = None

    async def initialize(self):
        """Initialize database engines and session makers"""

        # Create write engine with connection pooling
        self.write_engine = create_async_engine(
            DATABASE_URL,
            echo=False,  # Set to True for debugging
            pool_size=DatabaseConfig.POOL_SIZE,
            max_overflow=DatabaseConfig.MAX_OVERFLOW,
            pool_timeout=DatabaseConfig.POOL_TIMEOUT,
            pool_recycle=DatabaseConfig.POOL_RECYCLE,
            pool_pre_ping=DatabaseConfig.POOL_PRE_PING,
            poolclass=QueuePool,
            connect_args={
                "server_settings": DatabaseConfig.PG_SETTINGS,
                "command_timeout": DatabaseConfig.STATEMENT_TIMEOUT,
                "timeout": DatabaseConfig.POOL_TIMEOUT
            }
        )

        # Create read engine (can be replica)
        self.read_engine = create_async_engine(
            READ_REPLICA_URL,
            echo=False,
            pool_size=DatabaseConfig.POOL_SIZE // 2,  # Less connections for read replica
            max_overflow=DatabaseConfig.MAX_OVERFLOW // 2,
            pool_timeout=DatabaseConfig.POOL_TIMEOUT,
            pool_recycle=DatabaseConfig.POOL_RECYCLE,
            pool_pre_ping=DatabaseConfig.POOL_PRE_PING,
            poolclass=QueuePool,
            connect_args={
                "server_settings": {
                    **DatabaseConfig.PG_SETTINGS,
                    "default_transaction_read_only": "on"  # Read-only for replica
                },
                "command_timeout": DatabaseConfig.STATEMENT_TIMEOUT,
                "timeout": DatabaseConfig.POOL_TIMEOUT
            }
        )

        # Create session makers
        self.write_session_maker = async_sessionmaker(
            self.write_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False
        )

        self.read_session_maker = async_sessionmaker(
            self.read_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False
        )

        # Set up event listeners for connection optimization
        self._setup_connection_events()

        logger.info("Database connections initialized with pooling")

    def _setup_connection_events(self):
        """Set up SQLAlchemy event listeners for connection optimization"""

        @event.listens_for(self.write_engine.sync_engine, "connect")
        def set_sqlite_pragma(dbapi_conn, connection_record):
            """Set connection-level optimizations"""
            # This runs for each new connection in the pool
            cursor = dbapi_conn.cursor()

            # Set statement timeouts
            cursor.execute(f"SET statement_timeout = {DatabaseConfig.STATEMENT_TIMEOUT}")
            cursor.execute(f"SET lock_timeout = {DatabaseConfig.LOCK_TIMEOUT}")
            cursor.execute(f"SET idle_in_transaction_session_timeout = {DatabaseConfig.IDLE_IN_TRANSACTION_TIMEOUT}")

            # Enable query planning optimizations
            cursor.execute("SET enable_seqscan = off")  # Prefer index scans
            cursor.execute("SET enable_bitmapscan = on")
            cursor.execute("SET enable_hashagg = on")
            cursor.execute("SET enable_hashjoin = on")
            cursor.execute("SET enable_material = on")

            cursor.close()

    async def close(self):
        """Close all database connections"""
        if self.write_engine:
            await self.write_engine.dispose()
        if self.read_engine:
            await self.read_engine.dispose()
        logger.info("Database connections closed")

    @asynccontextmanager
    async def get_write_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get a write session from the pool"""
        async with self.write_session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    @asynccontextmanager
    async def get_read_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get a read-only session from the pool"""
        async with self.read_session_maker() as session:
            try:
                yield session
            finally:
                await session.close()

    async def execute_write(self, query: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """Execute a write query"""
        async with self.get_write_session() as session:
            result = await session.execute(text(query), params or {})
            await session.commit()
            return result

    async def execute_read(self, query: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """Execute a read query"""
        async with self.get_read_session() as session:
            result = await session.execute(text(query), params or {})
            return result

    async def health_check(self) -> Dict[str, bool]:
        """Check database health"""
        health = {"write": False, "read": False}

        try:
            # Check write connection
            async with self.get_write_session() as session:
                await session.execute(text("SELECT 1"))
                health["write"] = True
        except Exception as e:
            logger.error(f"Write database health check failed: {e}")

        try:
            # Check read connection
            async with self.get_read_session() as session:
                await session.execute(text("SELECT 1"))
                health["read"] = True
        except Exception as e:
            logger.error(f"Read database health check failed: {e}")

        return health

    async def get_pool_stats(self) -> Dict[str, Any]:
        """Get connection pool statistics"""
        stats = {}

        if self.write_engine:
            pool = self.write_engine.pool
            stats["write_pool"] = {
                "size": pool.size(),
                "checked_in": pool.checkedin(),
                "checked_out": pool.checkedout(),
                "overflow": pool.overflow(),
                "total": pool.total()
            }

        if self.read_engine:
            pool = self.read_engine.pool
            stats["read_pool"] = {
                "size": pool.size(),
                "checked_in": pool.checkedin(),
                "checked_out": pool.checkedout(),
                "overflow": pool.overflow(),
                "total": pool.total()
            }

        return stats


# Global database instance
database = OptimizedDatabase()


# Dependency injection functions for FastAPI
async def get_db_write() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for write database session"""
    async with database.get_write_session() as session:
        yield session


async def get_db_read() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for read-only database session"""
    async with database.get_read_session() as session:
        yield session


# Connection management for application lifecycle
async def init_database():
    """Initialize database on application startup"""
    await database.initialize()

    # Run health check
    health = await database.health_check()
    if not health["write"]:
        raise Exception("Failed to connect to write database")

    logger.info(f"Database initialized: {health}")


async def close_database():
    """Close database on application shutdown"""
    await database.close()