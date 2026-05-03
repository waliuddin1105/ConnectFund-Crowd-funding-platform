"""
Cache helper for the ConnectFund API.

Uses Flask-Caching with SimpleCache by default.
To switch to Redis, set CACHE_TYPE='RedisCache' and CACHE_REDIS_URL in your environment.

Usage:
    from api.helpers.cache_helper import cache

    @cache.cached(timeout=300, key_prefix='my_key')
    def my_view():
        ...

    # Invalidate a key
    cache.delete('my_key')
    cache.delete_memoized(my_function, arg1)
"""

from flask_caching import Cache

cache = Cache()


def init_cache(app):
    """Initialise Flask-Caching from app config (or sensible defaults)."""
    cache_config = {
        "CACHE_TYPE": app.config.get("CACHE_TYPE", "SimpleCache"),
        "CACHE_DEFAULT_TIMEOUT": app.config.get("CACHE_DEFAULT_TIMEOUT", 300),
        # Redis settings — only used when CACHE_TYPE is 'RedisCache'
        "CACHE_REDIS_URL": app.config.get("CACHE_REDIS_URL", "redis://localhost:6379/0"),
        "CACHE_KEY_PREFIX": "cf_",
    }
    app.config.update(cache_config)
    cache.init_app(app)
