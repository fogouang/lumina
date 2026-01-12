"""
Module notifications.
"""

from app.modules.notifications.controller import router as notifications_router
from app.modules.notifications.service import NotificationService

__all__ = ["notifications_router", "NotificationService"]