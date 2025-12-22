"""
Dependencies FastAPI pour l'authentification.
"""

from typing import Annotated

from fastapi import Depends

from app.modules.auth.service import AuthService
from app.shared.database.session import DbSession


async def get_auth_service(db: DbSession) -> AuthService:
    """
    Dépendance pour obtenir le service d'authentification.
    """
    return AuthService(db)