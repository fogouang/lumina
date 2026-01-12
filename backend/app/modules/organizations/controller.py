"""
Controller (routes) pour les organisations.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.modules.organizations.schemas import (
    AddAdminRequest,
    AddTeacherRequest,
    OrganizationCreate,
    OrganizationListResponse,
    OrganizationResponse,
    OrganizationUpdate,
)
from app.modules.organizations.service import OrganizationService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.enums import OrganizationType
from app.shared.schemas.responses import SuccessResponse

router = APIRouter(prefix="/organizations", tags=["Organizations"])


async def get_org_service(db: DbSession) -> OrganizationService:
    """Dépendance pour obtenir le service organizations."""
    return OrganizationService(db)


@router.get(
    "",
    response_model=SuccessResponse[list[OrganizationListResponse]],
    summary="Liste des organisations"
)
async def get_organizations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    org_type: OrganizationType | None = Query(None, description="Filtrer par type"),
    service: Annotated[OrganizationService, Depends(get_org_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer la liste des organisations (admin uniquement).
    """
    if org_type:
        orgs = await service.get_by_type(org_type)
    else:
        orgs = await service.get_all(skip=skip, limit=limit)
    
    return SuccessResponse(
        data=[OrganizationListResponse.model_validate(o) for o in orgs],
        message=f"{len(orgs)} organisation(s) trouvée(s)"
    )

@router.get(
    "/me",
    response_model=SuccessResponse[OrganizationResponse],
    summary="Mon organisation"
)
async def get_my_organization(
    service: Annotated[OrganizationService, Depends(get_org_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer l'organisation de l'utilisateur connecté (ORG_ADMIN ou TEACHER).
    """
    org = await service.get_my_organization(current_user)
    
    # Calculer stats
    response_data = OrganizationResponse.model_validate(org)
    response_data.admin_count = len(org.admins)
    response_data.teacher_count = len(org.teachers)
    
    return SuccessResponse(
        data=response_data,
        message="Organisation trouvée"
    )
    
@router.get(
    "/{org_id}",
    response_model=SuccessResponse[OrganizationResponse],
    summary="Détails d'une organisation"
)
async def get_organization(
    org_id: UUID,
    service: Annotated[OrganizationService, Depends(get_org_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer les détails d'une organisation.
    """
    org = await service.get_by_id(org_id, with_relations=True)
    
    # Calculer stats
    response_data = OrganizationResponse.model_validate(org)
    response_data.admin_count = len(org.admins)
    response_data.teacher_count = len(org.teachers)
    
    return SuccessResponse(
        data=response_data,
        message="Organisation trouvée"
    )


@router.post(
    "",
    response_model=SuccessResponse[OrganizationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer une organisation"
)
async def create_organization(
    data: OrganizationCreate,
    service: Annotated[OrganizationService, Depends(get_org_service)] = None,
    current_user: CurrentUser = None
):
    """
    Créer une organisation (admin uniquement).
    """
    org = await service.create(data, current_user)
    
    return SuccessResponse(
        data=OrganizationResponse.model_validate(org),
        message="Organisation créée avec succès"
    )


@router.patch(
    "/{org_id}",
    response_model=SuccessResponse[OrganizationResponse],
    summary="Mettre à jour une organisation"
)
async def update_organization(
    org_id: UUID,
    data: OrganizationUpdate,
    service: Annotated[OrganizationService, Depends(get_org_service)] = None,
    current_user: CurrentUser = None
):
    """
    Mettre à jour une organisation (admin uniquement).
    """
    org = await service.update(org_id, data, current_user)
    
    return SuccessResponse(
        data=OrganizationResponse.model_validate(org),
        message="Organisation mise à jour"
    )


@router.delete(
    "/{org_id}",
    response_model=SuccessResponse[dict],
    summary="Supprimer une organisation"
)
async def delete_organization(
    org_id: UUID,
    service: Annotated[OrganizationService, Depends(get_org_service)] = None,
    current_user: CurrentUser = None
):
    """
    Supprimer une organisation (admin uniquement).
    """
    await service.delete(org_id, current_user)
    
    return SuccessResponse(
        data={"deleted": True, "org_id": str(org_id)},
        message="Organisation supprimée"
    )


# === GESTION DES ADMINS ===

@router.post(
    "/{org_id}/admins",
    response_model=SuccessResponse[OrganizationResponse],
    summary="Ajouter un admin à une organisation"
)
async def add_admin(
    org_id: UUID,
    data: AddAdminRequest,
    service: Annotated[OrganizationService, Depends(get_org_service)] = None,
    current_user: CurrentUser = None
):
    """
    Ajouter un utilisateur comme admin d'une organisation.
    
    L'utilisateur doit avoir le rôle ORG_ADMIN.
    """
    org = await service.add_admin(org_id, data.user_id, current_user)
    
    return SuccessResponse(
        data=OrganizationResponse.model_validate(org),
        message="Admin ajouté à l'organisation"
    )


@router.delete(
    "/{org_id}/admins/{user_id}",
    response_model=SuccessResponse[OrganizationResponse],
    summary="Retirer un admin d'une organisation"
)
async def remove_admin(
    org_id: UUID,
    user_id: UUID,
    service: Annotated[OrganizationService, Depends(get_org_service)] = None,
    current_user: CurrentUser = None
):
    """
    Retirer un admin d'une organisation.
    """
    org = await service.remove_admin(org_id, user_id, current_user)
    
    return SuccessResponse(
        data=OrganizationResponse.model_validate(org),
        message="Admin retiré de l'organisation"
    )


# === GESTION DES ENSEIGNANTS (Centres uniquement) ===

@router.post(
    "/{org_id}/teachers",
    response_model=SuccessResponse[OrganizationResponse],
    summary="Ajouter un enseignant à une organisation"
)
async def add_teacher(
    org_id: UUID,
    data: AddTeacherRequest,
    service: Annotated[OrganizationService, Depends(get_org_service)] = None,
    current_user: CurrentUser = None
):
    """
    Ajouter un enseignant à une organisation (centres uniquement).
    
    L'utilisateur doit avoir le rôle TEACHER.
    """
    org = await service.add_teacher(org_id, data.user_id, current_user)
    
    return SuccessResponse(
        data=OrganizationResponse.model_validate(org),
        message="Enseignant ajouté à l'organisation"
    )


@router.delete(
    "/{org_id}/teachers/{user_id}",
    response_model=SuccessResponse[OrganizationResponse],
    summary="Retirer un enseignant d'une organisation"
)
async def remove_teacher(
    org_id: UUID,
    user_id: UUID,
    service: Annotated[OrganizationService, Depends(get_org_service)] = None,
    current_user: CurrentUser = None
):
    """
    Retirer un enseignant d'une organisation.
    """
    org = await service.remove_teacher(org_id, user_id, current_user)
    
    return SuccessResponse(
        data=OrganizationResponse.model_validate(org),
        message="Enseignant retiré de l'organisation"
    )
    
