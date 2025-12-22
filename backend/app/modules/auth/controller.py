"""
Controller (routes) pour l'authentification.

Utilise des cookies HttpOnly pour stocker les tokens (plus sécurisé que localStorage).
"""

from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Response, status

from app.config import get_settings
from app.modules.auth.dependencies import  get_auth_service
from app.modules.auth.schemas import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.modules.auth.service import AuthService
from app.shared.schemas.responses import SuccessResponse
from app.shared.dependencies import CurrentUser

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])


# ✅ Helper pour définir cookies selon environnement
def set_auth_cookie(response: Response, access_token: str):
    """
    Définir le cookie d'authentification selon l'environnement.
    
    - Development: HTTP, SameSite=Lax
    - Production: HTTPS, SameSite=Lax, Secure=True
    """
    if settings.DEBUG:
        # Development: HTTP local
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,  # HTTP autorisé en dev
            samesite="lax",
            path="/",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # En secondes
        )
    else:
        # Production: HTTPS requis
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,  # HTTPS obligatoire
            samesite="lax",
            path="/",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )


@router.post(
    "/register",
    response_model=SuccessResponse[AuthResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Inscription d'un nouvel utilisateur"
)
async def register(
    data: RegisterRequest,
    response: Response,
    service: Annotated[AuthService, Depends(get_auth_service)]
):
    """
    Inscrire un nouvel utilisateur.
    
    - **email**: Email unique
    - **password**: Mot de passe (min 8 caractères)
    - **first_name**: Prénom
    - **last_name**: Nom
    - **phone**: Téléphone (optionnel)
    
    Retourne un token JWT et les infos utilisateur.
    Le token est également stocké dans un cookie HttpOnly.
    """
    result = await service.register(data)
    
    # ✅ Stocker le token dans un cookie sécurisé
    set_auth_cookie(response, result.access_token)
    
    return SuccessResponse(
        data=result,
        message="Inscription réussie"
    )


@router.post(
    "/login",
    response_model=SuccessResponse[AuthResponse],
    summary="Connexion"
)
async def login(
    data: LoginRequest,
    response: Response,
    service: Annotated[AuthService, Depends(get_auth_service)]
):
    """
    Se connecter avec email et mot de passe.
    
    - **email**: Email de l'utilisateur
    - **password**: Mot de passe
    
    Retourne un token JWT et les infos utilisateur.
    Le token est également stocké dans un cookie HttpOnly.
    """
    result = await service.login(data)
    
    # ✅ Stocker le token dans un cookie sécurisé
    set_auth_cookie(response, result.access_token)
    
    return SuccessResponse(
        data=result,
        message="Connexion réussie"
    )


@router.get(
    "/me",
    response_model=SuccessResponse[UserResponse],
    summary="Récupérer l'utilisateur courant"
)
async def get_me(current_user: CurrentUser):
    """
    Récupérer les informations de l'utilisateur authentifié.
    
    Nécessite un token JWT valide dans le cookie ou header Authorization.
    """
    return SuccessResponse(
        data=UserResponse.model_validate(current_user),
        message="Utilisateur récupéré"
    )


@router.post(
    "/logout",
    response_model=SuccessResponse[dict],
    summary="Déconnexion"
)
async def logout(
    response: Response,
    current_user: CurrentUser
):
    """
    Déconnecter l'utilisateur.
    
    Supprime le cookie contenant le token d'accès.
    """
    # ✅ Supprimer le cookie
    response.delete_cookie(
        key="access_token",
        path="/",
        domain="localhost" if settings.DEBUG else None
    )
    
    return SuccessResponse(
        data={"user_id": str(current_user.id)},
        message="Déconnexion réussie"
    )