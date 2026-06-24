"""
Redis Caching Layer for Qual Engine
Implements multi-tier caching: In-memory -> Redis -> Database
"""

import redis
import json
import logging
from typing import Any, Optional, Callable
from functools import wraps
import pickle
from datetime import datetime, timedelta
from .config import settings

logger = logging.getLogger(__name__)


class CacheKeys:
    """
    Centralized cache key definitions
    Ensures consistent key naming across the application
    """

    # ===== ANALYSIS CACHE =====
    ANALYSIS = "analysis:{analysis_id}"  # TTL: 1 hour
    ANALYSIS_THEMES = "analysis:{analysis_id}:themes"  # TTL: 30 min
    ANALYSIS_GRID = "grid:{grid_id}"  # TTL: 15 min
    ANALYSIS_SUMMARY = "analysis:{analysis_id}:summary"  # TTL: 1 hour

    # ===== TRANSCRIPT CACHE =====
    TRANSCRIPT = "transcript:{transcript_id}"  # TTL: 5 min
    TRANSCRIPT_SEGMENTS = "transcript:{transcript_id}:segments"  # TTL: 5 min
    TRANSCRIPT_STATS = "project:{project_id}:transcript:stats"  # TTL: 10 min

    # ===== PROJECT CACHE =====
    PROJECT_STATS = "project:{project_id}:stats"  # TTL: 1 hour
    PROJECT_DASHBOARD = "project:{project_id}:dashboard"  # TTL: 30 min
    PROJECT_LIST = "org:{org_id}:projects:page:{page}"  # TTL: 30 min

    # ===== EVIDENCE CACHE =====
    EVIDENCE = "evidence:{evidence_id}"  # TTL: 30 min
    EVIDENCE_SEARCH = "search:evidence:{query}:{page}"  # TTL: 5 min

    # ===== USER CACHE =====
    USER = "user:{user_id}"  # TTL: 1 hour
    USER_PREFS = "user:{user_id}:preferences"  # TTL: 24 hours
    USER_SESSIONS = "user:{user_id}:sessions"  # TTL: 1 hour
    ORG_USERS = "org:{org_id}:users"  # TTL: 30 min

    # ===== DASHBOARD CACHE =====
    ORG_DASHBOARD = "org:{org_id}:dashboard"  # TTL: 5 min (changes frequently)
    ORG_USAGE = "org:{org_id}:usage:{month}"  # TTL: 1 hour
    PLATFORM_STATS = "platform:stats"  # TTL: 5 min

    # ===== SEARCH CACHE =====
    SEARCH_THEMES = "search:themes:{query}:{page}"  # TTL: 5 min
    SEARCH_VERBATIMS = "search:verbatims:{query}:{page}"  # TTL: 5 min

    # ===== LOOKUP CACHE (Long TTL) =====
    MARKETS = "markets:list"  # TTL: 24 hours
    LANGUAGES = "languages:list"  # TTL: 24 hours
    SAVED_PROMPTS = "org:{org_id}:saved_prompts"  # TTL: 1 hour

    # ===== AGGREGATION CACHE =====
    TEAM_STATS = "org:{org_id}:team:stats"  # TTL: 1 hour
    THEME_LEADERBOARD = "project:{project_id}:themes:leaderboard"  # TTL: 30 min


class RedisCache:
    """
    High-performance caching layer with Redis
    Features:
    - Graceful fallback if Redis unavailable
    - Automatic serialization (JSON + pickle)
    - Batch operations
    - Pattern-based deletion
    - Connection pooling
    """

    def __init__(self, redis_url: str = None):
        """Initialize Redis connection"""
        self.redis_url = redis_url or settings.redis_url
        self.client = None
        self.enabled = True

        try:
            self.client = redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_keepalive=True,
                socket_keepalive_options={
                    1: 1,      # TCP_KEEPIDLE
                    2: 3,      # TCP_KEEPINTVL
                    3: 3,      # TCP_KEEPCNT
                },
                max_connections=50,
                retry_on_timeout=True,
                health_check_interval=30,
            )
            # Test connection
            self.client.ping()
            logger.info("Redis cache connected successfully")
        except Exception as e:
            logger.warning(f"Redis connection failed, cache disabled: {e}")
            self.enabled = False
            self.client = None

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache
        Returns None if key not found or Redis unavailable
        """
        if not self.enabled or not self.client:
            return None

        try:
            data = self.client.get(key)
            if data is None:
                return None

            # Try JSON first (faster)
            try:
                return json.loads(data)
            except (json.JSONDecodeError, TypeError):
                # Fall back to pickle for complex objects
                return pickle.loads(data.encode())

        except redis.RedisError as e:
            logger.error(f"Redis GET error for {key}: {e}")
            return None

    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """
        Set value in cache with TTL (default 1 hour)
        """
        if not self.enabled or not self.client:
            return False

        try:
            # Serialize: JSON for JSON-serializable, pickle for complex objects
            try:
                serialized = json.dumps(value, default=str)
            except (TypeError, ValueError):
                serialized = pickle.dumps(value).decode('latin-1')

            self.client.setex(key, ttl, serialized)
            return True

        except redis.RedisError as e:
            logger.error(f"Redis SET error for {key}: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete a key"""
        if not self.enabled or not self.client:
            return False

        try:
            self.client.delete(key)
            return True
        except redis.RedisError as e:
            logger.error(f"Redis DELETE error for {key}: {e}")
            return False

    def delete_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching pattern
        Pattern: "analysis:*", "org:{org_id}:*"
        """
        if not self.enabled or not self.client:
            return 0

        try:
            cursor = 0
            count = 0

            while True:
                cursor, keys = self.client.scan(
                    cursor,
                    match=pattern,
                    count=100  # Scan in batches
                )

                if keys:
                    count += self.client.delete(*keys)

                if cursor == 0:
                    break

            logger.debug(f"Deleted {count} keys matching {pattern}")
            return count

        except redis.RedisError as e:
            logger.error(f"Redis DELETE_PATTERN error: {e}")
            return 0

    def mget(self, keys: list) -> dict:
        """
        Get multiple values at once (more efficient than individual gets)
        Returns dict of {key: value} for existing keys
        """
        if not self.enabled or not self.client or not keys:
            return {}

        try:
            values = self.client.mget(keys)
            result = {}

            for key, value in zip(keys, values):
                if value is not None:
                    try:
                        result[key] = json.loads(value)
                    except (json.JSONDecodeError, TypeError):
                        result[key] = pickle.loads(value.encode())

            return result

        except redis.RedisError as e:
            logger.error(f"Redis MGET error: {e}")
            return {}

    def mset(self, data: dict, ttl: int = 3600) -> bool:
        """
        Set multiple key-value pairs at once
        Useful for batch caching
        """
        if not self.enabled or not self.client or not data:
            return False

        try:
            pipe = self.client.pipeline()

            for key, value in data.items():
                try:
                    serialized = json.dumps(value, default=str)
                except (TypeError, ValueError):
                    serialized = pickle.dumps(value).decode('latin-1')

                pipe.setex(key, ttl, serialized)

            pipe.execute()
            return True

        except redis.RedisError as e:
            logger.error(f"Redis MSET error: {e}")
            return False

    def incr(self, key: str, amount: int = 1) -> Optional[int]:
        """
        Increment a counter (for usage tracking)
        Creates key with value=amount if doesn't exist
        """
        if not self.enabled or not self.client:
            return None

        try:
            result = self.client.incr(key, amount)
            # Set 30-day TTL for counters
            self.client.expire(key, 30 * 24 * 3600)
            return result
        except redis.RedisError as e:
            logger.error(f"Redis INCR error for {key}: {e}")
            return None

    def ttl(self, key: str) -> Optional[int]:
        """
        Get remaining TTL for a key in seconds
        Returns -1 if key has no TTL, -2 if key doesn't exist
        """
        if not self.enabled or not self.client:
            return None

        try:
            return self.client.ttl(key)
        except redis.RedisError:
            return None

    def flush(self) -> bool:
        """
        Flush all cache (use with caution!)
        Only call during maintenance
        """
        if not self.enabled or not self.client:
            return False

        try:
            self.client.flushdb()
            logger.warning("Redis cache flushed")
            return True
        except redis.RedisError as e:
            logger.error(f"Redis FLUSH error: {e}")
            return False

    def health_check(self) -> bool:
        """Check if Redis is available"""
        if not self.client:
            return False

        try:
            return self.client.ping()
        except:
            return False

    # ===== DECORATOR FUNCTIONS =====

    def cache_result(self, key: str, ttl: int = 3600):
        """
        Decorator for caching function results

        Usage:
        @cache.cache_result("analysis:{analysis_id}", ttl=3600)
        def get_analysis(db, analysis_id):
            return db.query(Analysis).filter_by(id=analysis_id).first()
        """
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Try cache first
                cached = self.get(key)
                if cached is not None:
                    logger.debug(f"Cache hit: {key}")
                    return cached

                # Cache miss - execute function
                logger.debug(f"Cache miss: {key}")
                result = func(*args, **kwargs)

                # Cache result
                if result is not None:
                    self.set(key, result, ttl)

                return result

            return wrapper

        return decorator

    def cache_with_invalidation(self, key: str, ttl: int = 3600, invalidate_patterns: list = None):
        """
        Decorator with automatic cache invalidation
        Invalidates related cache patterns when data changes

        Usage:
        @cache.cache_with_invalidation(
            "analysis:{aid}",
            ttl=3600,
            invalidate_patterns=["org:{org_id}:dashboard", "project:{pid}:stats"]
        )
        def update_analysis(db, analysis_id, data):
            ...
        """
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Execute function
                result = func(*args, **kwargs)

                # Invalidate related caches
                if invalidate_patterns:
                    for pattern in invalidate_patterns:
                        self.delete_pattern(pattern)

                # Cache the result
                if result is not None:
                    self.set(key, result, ttl)

                return result

            return wrapper

        return decorator


# Global cache instance
cache = RedisCache()


# ===== CACHE INVALIDATION HELPERS =====

class CacheInvalidator:
    """
    Automatic cache invalidation when data changes
    Call these methods after database modifications
    """

    @staticmethod
    def on_analysis_change(analysis_id: str, org_id: str):
        """Invalidate caches when analysis changes"""
        patterns = [
            f"analysis:{analysis_id}:*",
            f"org:{org_id}:*",
        ]
        for pattern in patterns:
            cache.delete_pattern(pattern)

    @staticmethod
    def on_transcript_change(transcript_id: str, org_id: str):
        """Invalidate caches when transcript changes"""
        patterns = [
            f"transcript:{transcript_id}:*",
            f"org:{org_id}:*",
        ]
        for pattern in patterns:
            cache.delete_pattern(pattern)

    @staticmethod
    def on_theme_change(analysis_id: str, org_id: str):
        """Invalidate caches when themes change"""
        cache.delete(CacheKeys.ANALYSIS_THEMES.format(analysis_id=analysis_id))
        cache.delete_pattern(f"org:{org_id}:*")

    @staticmethod
    def on_evidence_change(project_id: str):
        """Invalidate caches when evidence changes"""
        cache.delete_pattern(f"search:evidence:*")
        cache.delete_pattern(f"project:{project_id}:*")

    @staticmethod
    def on_project_change(project_id: str, org_id: str):
        """Invalidate caches when project changes"""
        cache.delete(CacheKeys.PROJECT_STATS.format(project_id=project_id))
        cache.delete(CacheKeys.PROJECT_DASHBOARD.format(project_id=project_id))
        cache.delete_pattern(f"org:{org_id}:*")

    @staticmethod
    def on_user_change(user_id: str, org_id: str):
        """Invalidate caches when user changes"""
        cache.delete(CacheKeys.USER.format(user_id=user_id))
        cache.delete_pattern(f"org:{org_id}:users*")

    @staticmethod
    def on_grid_change(grid_id: str, org_id: str):
        """Invalidate caches when grid changes"""
        cache.delete(CacheKeys.ANALYSIS_GRID.format(grid_id=grid_id))
        cache.delete_pattern(f"org:{org_id}:*")

    @staticmethod
    def invalidate_org_dashboard(org_id: str):
        """Invalidate organization dashboard cache"""
        cache.delete(CacheKeys.ORG_DASHBOARD.format(org_id=org_id))

    @staticmethod
    def invalidate_project_dashboard(project_id: str):
        """Invalidate project dashboard cache"""
        cache.delete(CacheKeys.PROJECT_DASHBOARD.format(project_id=project_id))


# ===== CACHE STATISTICS =====

def get_cache_stats() -> dict:
    """Get cache performance statistics"""
    if not cache.enabled:
        return {'status': 'disabled'}

    try:
        info = cache.client.info('stats')
        return {
            'status': 'enabled',
            'hits': info.get('keyspace_hits', 0),
            'misses': info.get('keyspace_misses', 0),
            'hit_ratio': (
                info.get('keyspace_hits', 0) /
                (info.get('keyspace_hits', 0) + info.get('keyspace_misses', 1))
                if (info.get('keyspace_hits', 0) + info.get('keyspace_misses', 1)) > 0
                else 0
            ),
            'keys': cache.client.info('keyspace').get('db0', {}).get('keys', 0),
        }
    except:
        return {'status': 'unavailable'}
