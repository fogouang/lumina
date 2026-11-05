"""
Controller (routes) pour l'authentification.

Utilise des cookies HttpOnly pour stocker les tokens (plus sécurisé que localStorage).
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.config import get_settings
from app.modules.auth.dependencies import get_auth_service
from app.modules.auth.schemas import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UpdateMyPhoneRequest,
    UserResponse,
    WhatsappInviteRequest,
)
from app.modules.auth.service import AuthService
from app.shared.schemas.responses import SuccessResponse
from app.shared.dependencies import CurrentUser

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])


def set_auth_cookie(response: Response, access_token: str):
    """
    Définir le cookie d'authentification selon l'environnement.
    
    - Development: HTTP, SameSite=Lax
    - Production: HTTPS, SameSite=Lax, Secure=True
    """
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=not settings.DEBUG,
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
    
    - **phone**: Téléphone avec indicatif (obligatoire, unique)
    - **password**: Mot de passe (min 8 caractères)
    - **first_name**: Prénom
    - **last_name**: Nom
    - **referral_code**: Code de parrainage (optionnel)
    """
    result = await service.register(data)
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
    Se connecter avec téléphone ou email + mot de passe.
    
    - **identifier**: Téléphone ou email
    - **password**: Mot de passe
    """
    result = await service.login(data)
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
    Informations de l'utilisateur authentifié.
    `phone` null → afficher la modale téléphone.
    `should_show_whatsapp_invite` true → afficher la modale WhatsApp.
    """
    return SuccessResponse(
        data=UserResponse.model_validate(current_user),
        message="Utilisateur récupéré"
    )


@router.patch(
    "/me/phone",
    response_model=SuccessResponse[UserResponse],
    summary="Ajouter ou modifier son numéro de téléphone"
)
async def update_my_phone(
    data: UpdateMyPhoneRequest,
    current_user: CurrentUser,
    service: Annotated[AuthService, Depends(get_auth_service)]
):
    user = await service.update_my_phone(current_user.id, data)
    return SuccessResponse(data=user, message="Numéro enregistré")


@router.post(
    "/me/whatsapp-invite",
    response_model=SuccessResponse[UserResponse],
    summary="Réponse à l'invitation au groupe WhatsApp"
)
async def whatsapp_invite(
    data: WhatsappInviteRequest,
    current_user: CurrentUser,
    service: Annotated[AuthService, Depends(get_auth_service)]
):
    user = await service.record_whatsapp_invite(current_user.id, data)
    return SuccessResponse(data=user, message="Réponse enregistrée")


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
    Déconnecter l'utilisateur (suppression du cookie).
    """
    response.delete_cookie(
        key="access_token",
        path="/",
        domain="localhost" if settings.DEBUG else None
    )
    
    return SuccessResponse(
        data={"user_id": str(current_user.id)},
        message="Déconnexion réussie"
    )