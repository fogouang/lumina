"""
Exports centralisés du module database.
"""

from app.shared.database.base import Base, BaseModel, TimestampMixin, UUIDMixin
from app.shared.database.repository import BaseRepository
from app.shared.database.session import (
    DbSession,
    SessionLocal,
    check_db_connection,
    close_db,
    engine,
    get_db,
    init_db,
)

__all__ = [
    # Base classes
    "Base",
    "BaseModel",
    "TimestampMixin",
    "UUIDMixin",
    # Repository
    "BaseRepository",
    # Session
    "engine",
    "SessionLocal",
    "get_db",
    "DbSession",
    "init_db",
    "close_db",
    "check_db_connection",
]