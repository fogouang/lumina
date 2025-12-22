"""
Controller (routes) pour les utilisateurs.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.shared.dependencies import CurrentUser
from app.modules.users.schemas import UserCreate, UserListResponse, UserResponse, UserUpdate
from app.modules.users.service import UserService
from app.shared.database.session import DbSession
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/users", tags=["Users"])


async def get_user_service(db: DbSession) -> UserService:
    """Dépendance pour obtenir le service users."""
    return UserService(db)


@router.get(
    "",
    response_model=SuccessResponse[list[UserListResponse]],
    summary="Liste des utilisateurs"
)
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    service: Annotated[UserService, Depends(get_user_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer la liste des utilisateurs (admin uniquement).
    """
    users = await service.get_all(skip=skip, limit=limit)
    
    return SuccessResponse(
        data=[UserListResponse.model_validate(u) for u in users],
        message=f"{len(users)} utilisateur(s) trouvé(s)"
    )


@router.get(
    "/{user_id}",
    response_model=SuccessResponse[UserResponse],
    summary="Détails d'un utilisateur"
)
async def get_user(
    user_id: UUID,
    service: Annotated[UserService, Depends(get_user_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer les détails d'un utilisateur.
    """
    user = await service.get_by_id(user_id)
    
    return SuccessResponse(
        data=UserResponse.model_validate(user),
        message="Utilisateur trouvé"
    )


@router.post(
    "",
    response_model=SuccessResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer un utilisateur"
)
async def create_user(
    data: UserCreate,
    service: Annotated[UserService, Depends(get_user_service)] = None,
    current_user: CurrentUser = None
):
    """
    Créer un utilisateur (admin uniquement).
    """
    user = await service.create(data, current_user)
    
    return SuccessResponse(
        data=UserResponse.model_validate(user),
        message="Utilisateur créé avec succès"
    )


@router.patch(
    "/{user_id}",
    response_model=SuccessResponse[UserResponse],
    summary="Mettre à jour un utilisateur"
)
async def update_user(
    user_id: UUID,
    data: UserUpdate,
    service: Annotated[UserService, Depends(get_user_service)] = None,
    current_user: CurrentUser = None
):
    """
    Mettre à jour un utilisateur (admin ou self).
    """
    user = await service.update(user_id, data, current_user)
    
    return SuccessResponse(
        data=UserResponse.model_validate(user),
        message="Utilisateur mis à jour"
    )


@router.delete(
    "/{user_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer un utilisateur"
)
async def delete_user(
    user_id: UUID,
    service: Annotated[UserService, Depends(get_user_service)] = None,
    current_user: CurrentUser = None
):
    """
    Supprimer un utilisateur (admin uniquement).
    """
    await service.delete(user_id, current_user)
    
    return SuccessResponse(
        data={"deleted": True, "user_id": str(user_id)},
        message="Utilisateur supprimé"
    )