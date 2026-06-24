"""
Phase 7: Multi-tier Cache Service
Implements hierarchical caching strategy for visualizations
Memory -> Redis -> Materialized Views -> Database
"""

from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
import redis
import json
import hashlib
import pickle
from collections import OrderedDict
import asyncio
import logging
from ..models_phase7 import (
    ProjectVisualizationCache, CacheStatus, VisualizationType
)
from ..config import settings

logger = logging.getLogger(__name__)


class MemoryCache:
    """In-memory LRU cache for ultra-fast access"""

    def __init__(self, max_size: int = 100, ttl_seconds: int = 300):
        self.cache: OrderedDict = OrderedDict()
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds

    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Get value from memory cache"""
        if key in self.cache:
            value, timestamp = self.cache.pop(key)

            # Check if expired
            if datetime.utcnow() - timestamp > timedelta(seconds=self.ttl_seconds):
                return None

            # Move to end (most recently used)
            self.cache[key] = (value, timestamp)
            return value

        return None

    def set(self, key: str, value: Dict[str, Any]) -> None:
        """Set value in memory cache"""
        # Remove oldest if at capacity
        if len(self.cache) >= self.max_size and key not in self.cache:
            self.cache.popitem(last=False)

        self.cache[key] = (value, datetime.utcnow())

    def delete(self, key: str) -> None:
        """Delete from memory cache"""
        if key in self.cache:
            del self.cache[key]

    def clear(self) -> int:
        """Clear all entries"""
        count = len(self.cache)
        self.cache.clear()
        return count


class RedisCache:
    """Redis cache for distributed caching"""

    def __init__(self):
        self.redis_client = None
        self._connect()

    def _connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = redis.from_url(
                settings.redis_url,
                decode_responses=False  # We'll handle encoding
            )
            self.redis_client.ping()
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}")
            self.redis_client = None

    async def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Get value from Redis cache"""
        if not self.redis_client:
            return None

        try:
            value = self.redis_client.get(f"viz:{key}")
            if value:
                return json.loads(value)
        except Exception as e:
            logger.error(f"Redis get error: {e}")

        return None

    async def set(self, key: str, value: Dict[str, Any], ttl: int = 3600) -> None:
        """Set value in Redis cache"""
        if not self.redis_client:
            return

        try:
            self.redis_client.setex(
                f"viz:{key}",
                ttl,
                json.dumps(value)
            )
        except Exception as e:
            logger.error(f"Redis set error: {e}")

    async def delete(self, key: str) -> None:
        """Delete from Redis cache"""
        if not self.redis_client:
            return

        try:
            self.redis_client.delete(f"viz:{key}")
        except Exception as e:
            logger.error(f"Redis delete error: {e}")

    async def clear(self, pattern: str = "*") -> int:
        """Clear entries matching pattern"""
        if not self.redis_client:
            return 0

        try:
            keys = self.redis_client.keys(f"viz:{pattern}")
            if keys:
                return self.redis_client.delete(*keys)
        except Exception as e:
            logger.error(f"Redis clear error: {e}")

        return 0


class DatabaseCache:
    """Database cache using materialized views"""

    async def get(
        self,
        key: str,
        project_id: str,
        visualization_type: VisualizationType,
        db: Session
    ) -> Optional[Dict[str, Any]]:
        """Get from database cache"""
        try:
            cache_entry = db.query(ProjectVisualizationCache).filter(
                and_(
                    ProjectVisualizationCache.project_id == project_id,
                    ProjectVisualizationCache.cache_key == key,
                    ProjectVisualizationCache.visualization_type == visualization_type,
                    ProjectVisualizationCache.expires_at > datetime.utcnow()
                )
            ).first()

            if cache_entry:
                # Update access tracking
                cache_entry.last_accessed = datetime.utcnow()
                cache_entry.access_count += 1

                # Check if stale
                if cache_entry.cache_status == CacheStatus.STALE:
                    return None

                db.commit()
                return cache_entry.data

        except Exception as e:
            logger.error(f"Database cache get error: {e}")
            db.rollback()

        return None

    async def set(
        self,
        key: str,
        project_id: str,
        visualization_type: VisualizationType,
        value: Dict[str, Any],
        ttl: int,
        db: Session
    ) -> None:
        """Set in database cache"""
        try:
            import uuid
            import sys

            # Check if entry exists
            cache_entry = db.query(ProjectVisualizationCache).filter(
                and_(
                    ProjectVisualizationCache.project_id == project_id,
                    ProjectVisualizationCache.cache_key == key,
                    ProjectVisualizationCache.visualization_type == visualization_type
                )
            ).first()

            expires_at = datetime.utcnow() + timedelta(seconds=ttl)

            if cache_entry:
                # Update existing
                cache_entry.data = value
                cache_entry.updated_at = datetime.utcnow()
                cache_entry.expires_at = expires_at
                cache_entry.cache_status = CacheStatus.FRESH
                cache_entry.data_size_bytes = sys.getsizeof(json.dumps(value))
            else:
                # Create new
                cache_entry = ProjectVisualizationCache(
                    id=str(uuid.uuid4()),
                    project_id=project_id,
                    visualization_type=visualization_type,
                    cache_key=key,
                    cache_status=CacheStatus.FRESH,
                    expires_at=expires_at,
                    data=value,
                    data_size_bytes=sys.getsizeof(json.dumps(value))
                )
                db.add(cache_entry)

            db.commit()

        except Exception as e:
            logger.error(f"Database cache set error: {e}")
            db.rollback()

    async def invalidate(
        self,
        project_id: str,
        visualization_type: Optional[VisualizationType],
        db: Session
    ) -> int:
        """Invalidate database cache entries"""
        try:
            query = db.query(ProjectVisualizationCache).filter(
                ProjectVisualizationCache.project_id == project_id
            )

            if visualization_type:
                query = query.filter(
                    ProjectVisualizationCache.visualization_type == visualization_type
                )

            count = query.update(
                {"cache_status": CacheStatus.STALE},
                synchronize_session=False
            )

            db.commit()
            return count

        except Exception as e:
            logger.error(f"Database cache invalidate error: {e}")
            db.rollback()
            return 0


class MultiTierCacheService:
    """Multi-tier caching service with fallback strategy"""

    def __init__(self):
        self.memory_cache = MemoryCache(max_size=100, ttl_seconds=300)
        self.redis_cache = RedisCache()
        self.db_cache = DatabaseCache()

        # Cache hit statistics
        self.stats = {
            "memory_hits": 0,
            "redis_hits": 0,
            "db_hits": 0,
            "misses": 0,
            "total_requests": 0
        }

    async def get(
        self,
        key: str,
        db: Session,
        project_id: Optional[str] = None,
        visualization_type: Optional[VisualizationType] = None
    ) -> Optional[Dict[str, Any]]:
        """Get from cache with tiered fallback"""

        self.stats["total_requests"] += 1

        # Level 1: Memory cache
        value = self.memory_cache.get(key)
        if value:
            self.stats["memory_hits"] += 1
            logger.debug(f"Memory cache hit: {key}")
            return value

        # Level 2: Redis cache
        value = await self.redis_cache.get(key)
        if value:
            self.stats["redis_hits"] += 1
            logger.debug(f"Redis cache hit: {key}")
            # Backfill to memory
            self.memory_cache.set(key, value)
            return value

        # Level 3: Database cache
        if project_id and visualization_type:
            value = await self.db_cache.get(key, project_id, visualization_type, db)
            if value:
                self.stats["db_hits"] += 1
                logger.debug(f"Database cache hit: {key}")
                # Backfill to memory and Redis
                self.memory_cache.set(key, value)
                await self.redis_cache.set(key, value)
                return value

        self.stats["misses"] += 1
        logger.debug(f"Cache miss: {key}")
        return None

    async def set(
        self,
        key: str,
        value: Dict[str, Any],
        ttl: int,
        db: Session,
        project_id: Optional[str] = None,
        visualization_type: Optional[VisualizationType] = None
    ) -> None:
        """Set in all cache tiers"""

        # Set in all tiers
        self.memory_cache.set(key, value)
        await self.redis_cache.set(key, value, ttl)

        if project_id and visualization_type:
            await self.db_cache.set(
                key, project_id, visualization_type, value, ttl, db
            )

    async def invalidate(
        self,
        key: str,
        db: Session,
        project_id: Optional[str] = None,
        visualization_type: Optional[VisualizationType] = None
    ) -> None:
        """Invalidate cache entry across all tiers"""

        self.memory_cache.delete(key)
        await self.redis_cache.delete(key)

        if project_id and visualization_type:
            await self.db_cache.invalidate(project_id, visualization_type, db)

    async def clear(
        self,
        project_id: Optional[str] = None,
        visualization_type: Optional[str] = None,
        db: Optional[Session] = None
    ) -> int:
        """Clear cache entries"""

        total_cleared = 0

        # Clear memory cache
        if not project_id:
            total_cleared += self.memory_cache.clear()

        # Clear Redis cache
        pattern = "*"
        if project_id:
            pattern = f"{project_id}:*"
        if visualization_type:
            pattern = f"*:{visualization_type}:*"

        total_cleared += await self.redis_cache.clear(pattern)

        # Clear database cache
        if db and project_id:
            viz_type = VisualizationType[visualization_type.upper()] if visualization_type else None
            total_cleared += await self.db_cache.invalidate(project_id, viz_type, db)

        return total_cleared

    async def get_statistics(self, db: Session) -> Dict[str, Any]:
        """Get cache statistics"""

        # Calculate hit rate
        hit_rate = 0
        if self.stats["total_requests"] > 0:
            hits = (
                self.stats["memory_hits"] +
                self.stats["redis_hits"] +
                self.stats["db_hits"]
            )
            hit_rate = hits / self.stats["total_requests"]

        # Get database cache stats
        db_stats = db.query(
            func.count(ProjectVisualizationCache.id).label("total_entries"),
            func.sum(
                case((ProjectVisualizationCache.cache_status == CacheStatus.FRESH, 1), else_=0)
            ).label("fresh_entries"),
            func.sum(
                case((ProjectVisualizationCache.cache_status == CacheStatus.STALE, 1), else_=0)
            ).label("stale_entries"),
            func.sum(ProjectVisualizationCache.data_size_bytes).label("total_bytes"),
            func.avg(ProjectVisualizationCache.computation_time_ms).label("avg_computation_time")
        ).first()

        # Get top accessed entries
        top_accessed = db.query(ProjectVisualizationCache).order_by(
            ProjectVisualizationCache.access_count.desc()
        ).limit(10).all()

        return {
            "total_entries": db_stats.total_entries or 0,
            "fresh_entries": db_stats.fresh_entries or 0,
            "stale_entries": db_stats.stale_entries or 0,
            "total_size_mb": (db_stats.total_bytes or 0) / (1024 * 1024),
            "hit_rate": hit_rate,
            "avg_computation_time": db_stats.avg_computation_time or 0,
            "memory_hits": self.stats["memory_hits"],
            "redis_hits": self.stats["redis_hits"],
            "db_hits": self.stats["db_hits"],
            "cache_misses": self.stats["misses"],
            "top_accessed": [
                {
                    "key": entry.cache_key,
                    "visualization_type": entry.visualization_type.value,
                    "status": entry.cache_status.value,
                    "size_bytes": entry.data_size_bytes,
                    "created_at": entry.created_at,
                    "expires_at": entry.expires_at,
                    "access_count": entry.access_count
                }
                for entry in top_accessed
            ]
        }

    async def warm_cache(
        self,
        project_id: str,
        visualizations: List[str],
        db: Session
    ) -> int:
        """Pre-warm cache for common visualizations"""

        warmed_count = 0

        # Import services to avoid circular imports
        from .aggregation_service import AggregationService

        aggregation_service = AggregationService()

        for viz_type in visualizations:
            try:
                if viz_type == "word_cloud":
                    data = await aggregation_service.generate_word_cloud(
                        project_id, None, 100, True, None, None, db
                    )
                    key = f"wordcloud:{project_id}:None:100:None:None"
                    await self.set(key, data, 3600, db, project_id, VisualizationType.WORD_CLOUD)
                    warmed_count += 1

                elif viz_type == "network_graph":
                    data = await aggregation_service.generate_network_graph(
                        project_id, 2, 50, 0.5, db
                    )
                    key = f"network:{project_id}:2:50:0.5"
                    await self.set(key, data, 3600, db, project_id, VisualizationType.NETWORK_GRAPH)
                    warmed_count += 1

                # Add other visualization types...

            except Exception as e:
                logger.error(f"Error warming cache for {viz_type}: {e}")

        return warmed_count

    def generate_cache_key(self, **kwargs) -> str:
        """Generate consistent cache key from parameters"""

        # Sort keys for consistency
        sorted_items = sorted(kwargs.items())

        # Create string representation
        key_string = ":".join([f"{k}:{v}" for k, v in sorted_items])

        # Hash if too long
        if len(key_string) > 200:
            return hashlib.md5(key_string.encode()).hexdigest()

        return key_string