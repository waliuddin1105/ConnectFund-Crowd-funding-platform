"""
Rate-limiter helper for the ConnectFund API.

Uses Flask-Limiter with an in-memory store by default.
Set RATELIMIT_STORAGE_URI in app config or environment to use Redis:
  RATELIMIT_STORAGE_URI = "redis://localhost:6379"
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)


def init_limiter(app):
    """Attach the limiter to the Flask app."""
    limiter.init_app(app)
