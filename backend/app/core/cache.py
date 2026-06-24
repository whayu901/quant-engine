"""
Redis Cache Implementation
Provides caching layer for performance optimization
"""

import os
import json
import pickle
from typing import Optional, Any, Dict, List
from datetime import timedelta
import logging
import hashlib

import redis.asyncio as redis
from redis.asyncio import ConnectionPool
from redis.exceptions import RedisError

logger = logging.getLogger(__name__)

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
REDIS_MAX_CONNECTIONS = int(os.getenv("REDIS_MAX_CONNECTIONS", "100"))
REDIS_SOCKET_TIMEOUT = int(os.getenv("REDIS_SOCKET_TIMEOUT", "5"))
REDIS_SOCKET_CONNECT_TIMEOUT = int(os.getenv("REDIS_SOCKET_CONNECT_TIMEOUT", "5"))


class CacheConfig:
    """Cache configuration settings"""

    # TTL settings (in seconds)
    DEFAULT_TTL = 3600  # 1 hour
    USER_TTL = 1800  # 30 minutes
    SESSION_TTL = 3600  # 1 hour
    QUERY_TTL = 300  # 5 minutes
    ANALYTICS_TTL = 600  # 10 minutes

    # Cache key prefixes
    PREFIX_USER = "user:"
    PREFIX_SESSION = "session:"
    PREFIX_QUERY = "query:"
    PREFIX_ANALYTICS = "analytics:"
    PREFIX_RATE_LIMIT = "ratelimit:"

    # Rate limiting
    RATE_LIMIT_WINDOW = 60  # 1 minute
    RATE_LIMIT_MAX_REQUESTS = 100


class RedisCache:
    """Redis cache implementation with connection pooling"""

    def __init__(self):
        self.pool: Optional[ConnectionPool] = None
        self.client: Optional[redis.Redis] = None

    async def initialize(self):
        """Initialize Redis connection pool"""
        try:
            self.pool = ConnectionPool.from_url(
                REDIS_URL,
                max_connections=REDIS_MAX_CONNECTIONS,
                socket_timeout=REDIS_SOCKET_TIMEOUT,
                socket_connect_timeout=REDIS_SOCKET_CONNECT_TIMEOUT,
                decode_responses=False  # Handle encoding ourselves
            )

            self.client = redis.Redis(connection_pool=self.pool)

            # Test connection
            await self.client.ping()
            logger.info("Redis cache initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Redis cache: {e}")
            # Don't fail the application if cache is unavailable
            self.client = None

    async def close(self):
        """Close Redis connections"""
        if self.client:
            await self.client.close()
        if self.pool:
            await self.pool.disconnect()
        logger.info("Redis cache connections closed")

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.client:
            return None

        try:
            value = await self.client.get(key)
            if value:
                return self._deserialize(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL"""
        if not self.client:
            return False

        try:
            serialized = self._serialize(value)
            if ttl:
                await self.client.setex(key, ttl, serialized)
            else:
                await self.client.set(key, serialized)
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        if not self.client:
            return False

        try:
            result = await self.client.delete(key)
            return result > 0
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.client:
            return False

        try:
            return await self.client.exists(key) > 0
        except Exception as e:
            logger.error(f"Cache exists error for key {key}: {e}")
            return False

    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        if not self.client:
            return 0

        try:
            keys = []
            async for key in self.client.scan_iter(match=pattern, count=100):
                keys.append(key)

            if keys:
                return await self.client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache clear pattern error for {pattern}: {e}")
            return 0

    async def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment a counter in cache"""
        if not self.client:
            return None

        try:
            return await self.client.incrby(key, amount)
        except Exception as e:
            logger.error(f"Cache increment error for key {key}: {e}")
            return None

    async def expire(self, key: str, ttl: int) -> bool:
        """Set expiration on existing key"""
        if not self.client:
            return False

        try:
            return await self.client.expire(key, ttl)
        except Exception as e:
            logger.error(f"Cache expire error for key {key}: {e}")
            return False

    # Advanced caching methods

    async def get_or_set(self, key: str, factory, ttl: Optional[int] = None) -> Any:
        """Get from cache or compute and set if missing"""
        value = await self.get(key)
        if value is not None:
            return value

        # Compute value
        value = await factory() if callable(factory) else factory
        await self.set(key, value, ttl)
        return value

    async def cache_user(self, user_id: int, user_data: Dict[str, Any]) -> bool:
        """Cache user data with appropriate TTL"""
        key = f"{CacheConfig.PREFIX_USER}{user_id}"
        return await self.set(key, user_data, CacheConfig.USER_TTL)

    async def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get cached user data"""
        key = f"{CacheConfig.PREFIX_USER}{user_id}"
        return await self.get(key)

    async def invalidate_user(self, user_id: int) -> bool:
        """Invalidate user cache"""
        key = f"{CacheConfig.PREFIX_USER}{user_id}"
        return await self.delete(key)

    async def cache_query_result(self, query_hash: str, result: Any, ttl: Optional[int] = None) -> bool:
        """Cache database query result"""
        key = f"{CacheConfig.PREFIX_QUERY}{query_hash}"
        ttl = ttl or CacheConfig.QUERY_TTL
        return await self.set(key, result, ttl)

    async def get_query_result(self, query_hash: str) -> Optional[Any]:
        """Get cached query result"""
        key = f"{CacheConfig.PREFIX_QUERY}{query_hash}"
        return await self.get(key)

    async def check_rate_limit(self, identifier: str, limit: int = None, window: int = None) -> Dict[str, Any]:
        """Check and update rate limit"""
        if not self.client:
            return {"allowed": True, "remaining": limit or CacheConfig.RATE_LIMIT_MAX_REQUESTS}

        limit = limit or CacheConfig.RATE_LIMIT_MAX_REQUESTS
        window = window or CacheConfig.RATE_LIMIT_WINDOW
        key = f"{CacheConfig.PREFIX_RATE_LIMIT}{identifier}"

        try:
            # Use pipeline for atomic operations
            pipe = self.client.pipeline()
            pipe.incr(key)
            pipe.expire(key, window)
            results = await pipe.execute()

            current_count = results[0]
            allowed = current_count <= limit
            remaining = max(0, limit - current_count)

            return {
                "allowed": allowed,
                "remaining": remaining,
                "reset_in": window,
                "current": current_count
            }
        except Exception as e:
            logger.error(f"Rate limit check error: {e}")
            return {"allowed": True, "remaining": limit}

    # Cache statistics

    async def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        if not self.client:
            return {"available": False}

        try:
            info = await self.client.info("stats")
            memory = await self.client.info("memory")

            return {
                "available": True,
                "total_connections": info.get("total_connections_received", 0),
                "connected_clients": info.get("connected_clients", 0),
                "used_memory": memory.get("used_memory_human", "0"),
                "used_memory_peak": memory.get("used_memory_peak_human", "0"),
                "keys": await self.client.dbsize()
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {"available": False, "error": str(e)}

    # Helper methods

    def _serialize(self, value: Any) -> bytes:
        """Serialize value for storage"""
        try:
            # Try JSON first (more portable)
            return json.dumps(value).encode('utf-8')
        except (TypeError, ValueError):
            # Fall back to pickle for complex objects
            return pickle.dumps(value)

    def _deserialize(self, data: bytes) -> Any:
        """Deserialize value from storage"""
        try:
            # Try JSON first
            return json.loads(data.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError):
            # Fall back to pickle
            try:
                return pickle.loads(data)
            except:
                return data

    @staticmethod
    def generate_cache_key(*args, **kwargs) -> str:
        """Generate a cache key from arguments"""
        key_data = f"{args}:{kwargs}"
        return hashlib.md5(key_data.encode()).hexdigest()


# Global cache instance
cache = RedisCache()


# Dependency injection for FastAPI
async def get_cache() -> RedisCache:
    """Get cache instance for dependency injection"""
    return cache


# Lifecycle management
async def init_cache():
    """Initialize cache on application startup"""
    await cache.initialize()


async def close_cache():
    """Close cache on application shutdown"""
    await cache.close()


# Cache decorators
def cached(ttl: int = CacheConfig.DEFAULT_TTL, key_prefix: str = ""):
    """
    Decorator for caching function results

    Usage:
        @cached(ttl=300, key_prefix="api")
        async def expensive_operation(param1, param2):
            # ... expensive computation
            return result
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{cache.generate_cache_key(*args, **kwargs)}"

            # Try to get from cache
            result = await cache.get(cache_key)
            if result is not None:
                return result

            # Compute and cache
            result = await func(*args, **kwargs)
            await cache.set(cache_key, result, ttl)
            return result

        return wrapper
    return decorator


def invalidate_cache(pattern: str):
    """
    Decorator to invalidate cache matching pattern after function execution

    Usage:
        @invalidate_cache("user:*")
        async def update_user(user_id: int):
            # ... update user
            return user
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            await cache.clear_pattern(pattern)
            return result

        return wrapper
    return decorator