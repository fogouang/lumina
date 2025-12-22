"""
Auth module
"""
from app.modules.auth.controller import router as auth_router
from app.modules.auth.dependencies import (
    get_auth_service
)

__all__ = [
    "auth_router",
    "get_auth_service",
]