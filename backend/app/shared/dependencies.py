"""
Dependencies partagées pour toute l'application.
"""

from typing import Annotated

from fastapi import Cookie, Depends, WebSocket
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.modules.users.models import User
from app.shared.database.session import DbSession
from app.shared.exceptions.http import UnauthorizedException

# Security scheme pour Swagger UI
security = HTTPBearer(auto_error=False)


async def get_current_user(
    access_token: str | None = Cookie(default=None),
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: DbSession = None
) -> User:
    """
    Dépendance pour obtenir l'utilisateur courant.
    
    Accepte le token depuis:
    1. Cookie `access_token` (prioritaire)
    2. Header `Authorization: Bearer <token>`
    """
    # Import local pour éviter circular import
    from app.modules.auth.service import AuthService
    
    # Token depuis cookie ou header
    token = access_token
    if not token and credentials:
        token = credentials.credentials
    
    if not token:
        raise UnauthorizedException(detail="Token d'authentification manquant")
    
    # Vérifier le token
    service = AuthService(db)
    return await service.get_current_user(token)


# Type annoté pour faciliter l'utilisation
CurrentUser = Annotated[User, Depends(get_current_user)]



async def get_current_user_ws(
    websocket: WebSocket,
    db: DbSession = None,
) -> User:
    """
    Dépendance pour obtenir l'utilisateur courant sur une route WebSocket.

    get_current_user ne peut pas être réutilisée telle quelle : elle
    dépend de Depends(security) (HTTPBearer), qui attend un objet
    Request et plante avec TypeError sur les routes WebSocket
    (HTTPBearer.__call__() missing 1 required positional argument:
    'request').

    Le navigateur envoie les cookies automatiquement sur le handshake
    WebSocket (et il n'y a de toute façon aucun moyen de fixer un header
    Authorization personnalisé depuis le JS du navigateur pour un
    WebSocket) — donc ici on lit le cookie access_token directement sur
    le handshake, sans passer par HTTPBearer.
    """
    # Import local pour éviter circular import, comme dans get_current_user
    from app.modules.auth.service import AuthService

    token = websocket.cookies.get("access_token")

    if not token:
        raise UnauthorizedException(detail="Token d'authentification manquant")

    service = AuthService(db)
    return await service.get_current_user(token)


# Type annoté, même commodité que CurrentUser
CurrentUserWs = Annotated[User, Depends(get_current_user_ws)]