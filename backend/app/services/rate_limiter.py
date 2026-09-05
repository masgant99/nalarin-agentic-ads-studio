from datetime import datetime, timedelta
from typing import Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func


class RateLimiter:
    """Database-backed rolling window rate limiter for Facebook API calls"""

    def __init__(self, max_calls: int = 200, window_minutes: int = 59):
        self.max_calls = max_calls
        self.window_minutes = window_minutes

    def check_limit(self, db: Session) -> Tuple[bool, int, int]:
        """
        Check if rate limit allows another call by querying SearchLog.
        Returns: (allowed, remaining, reset_seconds)
        """
        from app.models import SearchLog

        now = datetime.utcnow()
        window_start = now - timedelta(minutes=self.window_minutes)

        # Count total API calls in the last 59 minutes from SearchLog
        total_calls = db.query(func.sum(SearchLog.api_calls_made)).filter(
            SearchLog.created_at >= window_start
        ).scalar() or 0

        remaining = max(0, self.max_calls - total_calls)

        # Calculate seconds until oldest call expires
        reset_seconds = 0
        if total_calls >= self.max_calls:
            # Find the oldest call in the window
            oldest_log = db.query(SearchLog).filter(
                SearchLog.created_at >= window_start
            ).order_by(SearchLog.created_at.asc()).first()

            if oldest_log:
                reset_time = oldest_log.created_at + timedelta(minutes=self.window_minutes)
                reset_seconds = max(0, int((reset_time - now).total_seconds()))

        allowed = total_calls < self.max_calls
        return allowed, remaining, reset_seconds

    def get_usage_stats(self, db: Session) -> Dict:
        """Get current usage statistics from SearchLog"""
        from app.models import SearchLog

        now = datetime.utcnow()
        window_start = now - timedelta(minutes=self.window_minutes)

        # Count total API calls in the last 59 minutes
        total_calls = db.query(func.sum(SearchLog.api_calls_made)).filter(
            SearchLog.created_at >= window_start
        ).scalar() or 0

        remaining = max(0, self.max_calls - total_calls)

        # Calculate reset time
        reset_seconds = 0
        if total_calls > 0:
            oldest_log = db.query(SearchLog).filter(
                SearchLog.created_at >= window_start
            ).order_by(SearchLog.created_at.asc()).first()

            if oldest_log:
                reset_time = oldest_log.created_at + timedelta(minutes=self.window_minutes)
                reset_seconds = max(0, int((reset_time - now).total_seconds()))

        return {
            "limit": self.max_calls,
            "used": int(total_calls),
            "remaining": remaining,
            "reset_in_seconds": reset_seconds,
            "window_minutes": self.window_minutes
        }


# Global rate limiter instance
rate_limiter = RateLimiter(max_calls=200, window_minutes=59)
