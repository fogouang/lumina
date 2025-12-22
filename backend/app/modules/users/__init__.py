"""
Module users.
"""

from app.modules.users.controller import router as users_router
from app.modules.users.service import UserService

__all__ = ["users_router", "UserService"]