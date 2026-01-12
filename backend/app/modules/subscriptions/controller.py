"""
Controller (routes) pour les souscriptions.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.modules.subscriptions.schemas import (
    AddStudentToOrgRequest,
    OrganizationSubscriptionCreate,
    OrganizationSubscriptionResponse,
    OrganizationSubscriptionUpdate,
    StudentSubscriptionResponse,
    SubscriptionCreateB2C,
    SubscriptionResponse,
)
from app.modules.subscriptions.service import SubscriptionService
from app.shared.database.session import DbSession
from app.shared.dependencies import CurrentUser
from app.shared.schemas.responses import SuccessResponse
from app.modules.users.models import User

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


async def get_subscription_service(db: DbSession) -> SubscriptionService:
    """Dépendance pour obtenir le service subscriptions."""
    return SubscriptionService(db)


# === B2C SUBSCRIPTIONS ===

@router.post(
    "/subscribe",
    response_model=SuccessResponse[SubscriptionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Souscrire à un plan (B2C)"
)
async def subscribe_b2c(
    data: SubscriptionCreateB2C,
    service: Annotated[SubscriptionService, Depends(get_subscription_service)] = None,
    current_user: CurrentUser = None
):
    """
    Souscrire à un plan en tant qu'étudiant direct (B2C).
    
    L'utilisateur doit avoir le rôle STUDENT.
    """
    subscription = await service.create_b2c_subscription(data, current_user)
    
    return SuccessResponse(
        data=SubscriptionResponse.model_validate(subscription),
        message="Souscription créée avec succès"
    )


@router.get(
    "/me",
    response_model=SuccessResponse[list[SubscriptionResponse]],
    summary="Mes souscriptions"
)
async def get_my_subscriptions(
    service: Annotated[SubscriptionService, Depends(get_subscription_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer mes souscriptions actives.
    """
    subscriptions = await service.get_my_subscriptions(current_user)
    
    return SuccessResponse(
        data=[SubscriptionResponse.model_validate(s) for s in subscriptions],
        message=f"{len(subscriptions)} souscription(s) active(s)"
    )


# === B2B ORGANIZATION SUBSCRIPTIONS ===

@router.post(
    "/organizations",
    response_model=SuccessResponse[OrganizationSubscriptionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Créer une souscription organisation"
)
async def create_org_subscription(
    data: OrganizationSubscriptionCreate,
    service: Annotated[SubscriptionService, Depends(get_subscription_service)] = None,
    current_user: CurrentUser = None
):
    """
    Créer une souscription pour une organisation (admin uniquement).
    
    Définit combien d'étudiants l'organisation peut ajouter et pour combien de temps.
    """
    org_sub = await service.create_org_subscription(data, current_user)
    
    return SuccessResponse(
        data=OrganizationSubscriptionResponse.model_validate(org_sub),
        message="Souscription organisation créée"
    )


@router.get(
    "/organizations/{org_id}",
    response_model=SuccessResponse[OrganizationSubscriptionResponse],
    summary="Détails souscription organisation"
)
async def get_org_subscription(
    org_id: UUID,
    service: Annotated[SubscriptionService, Depends(get_subscription_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer la souscription active d'une organisation.
    """
    org_sub = await service.get_org_subscription(org_id)
    
    # Calculer slots utilisés
    from app.modules.subscriptions.repository import SubscriptionRepository
    sub_repo = SubscriptionRepository(service.db)
    slots_used = await sub_repo.count_active_students_in_org(org_id)
    
    response_data = OrganizationSubscriptionResponse.model_validate(org_sub)
    response_data.slots_used = slots_used
    response_data.slots_available = org_sub.max_students - slots_used
    
    return SuccessResponse(
        data=response_data,
        message="Souscription organisation trouvée"
    )


@router.patch(
    "/organizations/{org_sub_id}",
    response_model=SuccessResponse[OrganizationSubscriptionResponse],
    summary="Mettre à jour souscription organisation"
)
async def update_org_subscription(
    org_sub_id: UUID,
    data: OrganizationSubscriptionUpdate,
    service: Annotated[SubscriptionService, Depends(get_subscription_service)] = None,
    current_user: CurrentUser = None
):
    """
    Mettre à jour une souscription organisation (admin uniquement).
    
    Permet d'ajuster le nombre de slots ou les crédits IA.
    """
    org_sub = await service.update_org_subscription(org_sub_id, data, current_user)
    
    return SuccessResponse(
        data=OrganizationSubscriptionResponse.model_validate(org_sub),
        message="Souscription organisation mise à jour"
    )


# === B2B STUDENT MANAGEMENT ===

@router.post(
    "/organizations/{org_id}/students",
    response_model=SuccessResponse[SubscriptionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter un étudiant à une organisation"
)
async def add_student_to_org(
    org_id: UUID,
    data: AddStudentToOrgRequest,
    service: Annotated[SubscriptionService, Depends(get_subscription_service)] = None,
    current_user: CurrentUser = None
):
    """
    Ajouter un étudiant à une organisation (admin org ou platform).
    
    Consomme un slot de la souscription organisation.
    """
    subscription = await service.add_student_to_org(org_id, data, current_user)
    
    return SuccessResponse(
        data=SubscriptionResponse.model_validate(subscription),
        message="Étudiant ajouté à l'organisation"
    )


@router.get(
    "/organizations/{org_id}/students",
    response_model=SuccessResponse[list[StudentSubscriptionResponse]],
    summary="Liste des étudiants d'une organisation"
)
async def get_org_students(
    org_id: UUID,
    service: Annotated[SubscriptionService, Depends(get_subscription_service)] = None,
    current_user: CurrentUser = None
):
    """
    Récupérer les étudiants d'une organisation.
    """
    subscriptions = await service.get_org_students(org_id, current_user)
    
    # Enrichir avec infos user
    # TODO: Optimiser avec joinedload
    response_data = []
    for sub in subscriptions:
        user = await service.db.get(User, sub.user_id)
        response_data.append(
            StudentSubscriptionResponse(
                **SubscriptionResponse.model_validate(sub).model_dump(),
                user_email=user.email if user else "Unknown",
                user_name=user.full_name if user else "Unknown"
            )
        )
    
    return SuccessResponse(
        data=response_data,
        message=f"{len(subscriptions)} étudiant(s) trouvé(s)"
    )
    
@router.get(
    "/me/ai-credits",
    response_model=SuccessResponse[dict],
    summary="Mon solde de crédits IA"
)
async def get_my_ai_credits(
    service: Annotated[SubscriptionService, Depends(get_subscription_service)],
    current_user: CurrentUser
):
    """Récupérer mon solde de crédits IA."""
    from app.shared.utils.ai_credits import AICreditManager
    
    credit_manager = AICreditManager(service.db)
    balance = await credit_manager.get_credits_balance(current_user.id)
    
    return SuccessResponse(
        data=balance,
        message="Solde de crédits"
    )