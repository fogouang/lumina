"""
Service pour la gestion des souscriptions.
"""

from datetime import date, timedelta
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.organizations.models import Organization
from app.modules.plans.models import Plan
from app.modules.subscriptions.models import OrganizationSubscription, Subscription
from app.modules.subscriptions.repository import (
    OrganizationSubscriptionRepository,
    SubscriptionRepository,
)
from app.modules.subscriptions.schemas import (
    AddStudentToOrgRequest,
    OrganizationSubscriptionCreate,
    OrganizationSubscriptionUpdate,
    SubscriptionCreateB2C,
)
from app.modules.users.models import User
from app.shared.enums import OrganizationType, SlotsType, UserRole
from app.shared.exceptions.http import BadRequestException, ForbiddenException, NotFoundException


class SubscriptionService:
    """Service pour la gestion des souscriptions."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = SubscriptionRepository(db)
        self.org_repo = OrganizationSubscriptionRepository(db)
    
    # === B2C SUBSCRIPTIONS ===
    
    async def create_b2c_subscription(
        self,
        data: SubscriptionCreateB2C,
        current_user: User
    ) -> Subscription:
        """
        Créer une souscription B2C (étudiant direct).
        
        Args:
            data: Données de souscription
            current_user: Utilisateur authentifié
            
        Returns:
            Souscription créée
            
        Raises:
            BadRequestException: Si plan invalide ou utilisateur pas STUDENT
        """
        # Vérifier que l'utilisateur est étudiant
        if current_user.role != UserRole.STUDENT:
            raise BadRequestException(detail="Seuls les étudiants peuvent souscrire en B2C")
        
        # Récupérer le plan
        plan = await self.db.get(Plan, data.plan_id)
        if not plan or not plan.is_active:
            raise NotFoundException(resource="Plan", identifier=str(data.plan_id))
        
        # Vérifier que c'est un plan B2C
        if plan.type.value != "b2c":
            raise BadRequestException(detail="Ce plan n'est pas disponible en B2C")
        
        # Calculer dates
        start_date = date.today()
        end_date = start_date + timedelta(days=plan.duration_days)
        
        # Créer la souscription
        subscription = await self.repo.create(
            user_id=current_user.id,
            organization_id=None,
            plan_id=plan.id,  # ✅ Plan obligatoire en B2C
            custom_duration_days=None,  # ✅ NULL pour B2C
            custom_ai_credits=None,  # ✅ NULL pour B2C
            start_date=start_date,
            end_date=end_date,
            is_active=True,
            ai_credits_remaining=plan.ai_credits,
            created_by_id=current_user.id
        )
        
        return subscription
    
    async def get_my_subscriptions(self, current_user: User) -> list[Subscription]:
        """
        Récupérer les souscriptions de l'utilisateur courant.
        
        Args:
            current_user: Utilisateur authentifié
            
        Returns:
            Liste de souscriptions
        """
        return await self.repo.get_active_by_user(current_user.id)
    
    # === B2B ORGANIZATION SUBSCRIPTIONS ===
    
    async def create_org_subscription(
        self,
        data: OrganizationSubscriptionCreate,
        current_user: User
    ) -> OrganizationSubscription:
        """
        Créer une souscription pour une organisation (admin uniquement).
        
        Args:
            data: Données de souscription
            current_user: Utilisateur authentifié
            
        Returns:
            Souscription organisation créée
            
        Raises:
            ForbiddenException: Si pas admin
            BadRequestException: Si org invalide ou a déjà une souscription active
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des souscriptions org")
        
        # Vérifier que l'organisation existe
        org = await self.db.get(Organization, data.organization_id)
        if not org or not org.is_active:
            raise NotFoundException(resource="Organization", identifier=str(data.organization_id))
        
        # Vérifier qu'il n'y a pas déjà une souscription active
        existing = await self.org_repo.get_active_by_org(data.organization_id)
        if existing:
            raise BadRequestException(
                detail=f"Cette organisation a déjà une souscription active (expire le {existing.end_date})"
            )
        
        # Vérifier cohérence crédits IA (seulement pour centres)
        if org.type == OrganizationType.RESELLER and data.ai_credits_total > 0:
            raise BadRequestException(detail="Les revendeurs ne peuvent pas avoir de crédits IA")
        
        # Calculer dates
        start_date = date.today()
        end_date = start_date + timedelta(days=data.duration_days)
        
        # Créer la souscription org
        org_subscription = await self.org_repo.create(
            organization_id=data.organization_id,
            duration_days=data.duration_days,
            price=data.price,
            max_students=data.max_students,
            slots_type=data.slots_type,
            ai_credits_total=data.ai_credits_total,
            ai_credits_remaining=data.ai_credits_total,
            start_date=start_date,
            end_date=end_date,
            is_active=True
        )
        
        return org_subscription
    
    async def get_org_subscription(self, org_id: UUID) -> OrganizationSubscription:
        """
        Récupérer la souscription active d'une organisation.
        
        Args:
            org_id: UUID de l'organisation
            
        Returns:
            Souscription active
            
        Raises:
            NotFoundException: Si pas de souscription active
        """
        subscription = await self.org_repo.get_active_by_org(org_id)
        
        if not subscription:
            raise NotFoundException(
                resource="OrganizationSubscription",
                identifier=f"org={org_id}"
            )
        
        return subscription
    
    async def update_org_subscription(
        self,
        org_sub_id: UUID,
        data: OrganizationSubscriptionUpdate,
        current_user: User
    ) -> OrganizationSubscription:
        """
        Mettre à jour une souscription organisation.
        
        Args:
            org_sub_id: UUID de la souscription org
            data: Données de mise à jour
            current_user: Utilisateur authentifié
            
        Returns:
            Souscription mise à jour
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent modifier des souscriptions org")
        
        # Mettre à jour
        update_data = data.model_dump(exclude_unset=True)
        org_sub = await self.org_repo.update(org_sub_id, **update_data)
        
        return org_sub
    
    # === B2B STUDENT SUBSCRIPTIONS ===
    async def add_student_to_org(
    self,
    org_id: UUID,
    data: AddStudentToOrgRequest,
    current_user: User
) -> Subscription:
        """
            Ajouter un étudiant à une organisation.
            
            Vérifie les slots disponibles et crée une souscription pour l'étudiant.
            
            Args:
                org_id: UUID de l'organisation
                data: Données étudiant
                current_user: Utilisateur authentifié
                
            Returns:
                Souscription créée pour l'étudiant
                
            Raises:
                ForbiddenException: Si pas autorisé
                BadRequestException: Si slots insuffisants ou utilisateur invalide
        
        """
        from sqlalchemy import select
        from app.modules.organizations.repository import OrganizationRepository

        # Vérifier permissions
        if current_user.role == UserRole.PLATFORM_ADMIN:
            pass
        elif current_user.role == UserRole.ORG_ADMIN:
            org_repo = OrganizationRepository(self.db)
            user_org = await org_repo.get_by_admin_or_teacher(current_user.id)
            
            if not user_org or user_org.id != org_id:
                raise ForbiddenException(
                    detail="Vous n'êtes pas admin de cette organisation"
                )
        else:
            raise ForbiddenException(
                detail="Seuls les admins peuvent ajouter des étudiants"
            )
        
        # Récupérer la souscription active de l'org
        org_sub = await self.get_org_subscription(org_id)
        
        # Vérifier que l'utilisateur existe et est étudiant
        user = await self.db.get(User, data.user_id)
        if not user or not user.is_active:
            raise NotFoundException(resource="User", identifier=str(data.user_id))
        
        if user.role != UserRole.STUDENT:
            raise BadRequestException(detail="L'utilisateur doit avoir le rôle STUDENT")
        
        # ✅ CORRECTION: Vérifier qu'il n'a pas déjà une souscription active
        stmt = (
            select(Subscription)
            .where(Subscription.user_id == data.user_id)
            .where(Subscription.organization_id == org_id)
            .where(Subscription.is_active == True)
            .where(Subscription.end_date >= date.today())
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if existing:
            raise BadRequestException(
                detail="Cet étudiant a déjà une souscription active dans cette organisation"
            )
        
        # Vérifier les slots disponibles
        active_students = await self.repo.count_active_students_in_org(org_id)
        
        if active_students >= org_sub.max_students:
            raise BadRequestException(
                detail=f"Slots insuffisants ({active_students}/{org_sub.max_students} utilisés)"
            )
        
        # Calculer dates
        start_date = date.today()
        end_date = min(
            start_date + timedelta(days=data.duration_days),
            org_sub.end_date
        )
        
        # Créer la souscription
        subscription = await self.repo.create(
            user_id=data.user_id,
            organization_id=org_id,
            plan_id=None,
            custom_duration_days=data.duration_days,
            custom_ai_credits=org_sub.ai_credits_total // org_sub.max_students if org_sub.ai_credits_total > 0 else 0,
            start_date=start_date,
            end_date=end_date,
            is_active=True,
            ai_credits_remaining=org_sub.ai_credits_total // org_sub.max_students if org_sub.ai_credits_total > 0 else 0,
            created_by_id=current_user.id
        )
        
        return subscription
    
    # async def add_student_to_org(
    #     self,
    #     org_id: UUID,
    #     data: AddStudentToOrgRequest,
    #     current_user: User
    # ) -> Subscription:
    #     """
    #     Ajouter un étudiant à une organisation.
        
    #     Vérifie les slots disponibles et crée une souscription pour l'étudiant.
        
    #     Args:
    #         org_id: UUID de l'organisation
    #         data: Données étudiant
    #         current_user: Utilisateur authentifié
            
    #     Returns:
    #         Souscription créée pour l'étudiant
            
    #     Raises:
    #         ForbiddenException: Si pas autorisé
    #         BadRequestException: Si slots insuffisants ou utilisateur invalide
    #     """
    #     # Vérifier permissions (admin platform ou admin de cette org)
    #     from app.modules.organizations.repository import OrganizationRepository

    #     if current_user.role == UserRole.PLATFORM_ADMIN:
    #         # Admin platform peut tout faire
    #         pass
    #     elif current_user.role == UserRole.ORG_ADMIN:
    #         # Vérifier que c'est bien son organisation
    #         org_repo = OrganizationRepository(self.db)
    #         user_org = await org_repo.get_by_admin_or_teacher(current_user.id)
            
    #         if not user_org or user_org.id != org_id:
    #             raise ForbiddenException(
    #                 detail="Vous n'êtes pas admin de cette organisation"
    #             )
    #     else:
    #         raise ForbiddenException(
    #             detail="Seuls les admins peuvent ajouter des étudiants"
    #         )
        
    #     # Récupérer la souscription active de l'org
    #     org_sub = await self.get_org_subscription(org_id)
        
    #     # Vérifier que l'utilisateur existe et est étudiant
    #     user = await self.db.get(User, data.user_id)
    #     if not user or not user.is_active:
    #         raise NotFoundException(resource="User", identifier=str(data.user_id))
        
    #     if user.role != UserRole.STUDENT:
    #         raise BadRequestException(detail="L'utilisateur doit avoir le rôle STUDENT")
        
    #     # Vérifier qu'il n'a pas déjà une souscription active dans cette org
    #     existing = await self.db.execute(
    #         self.db.query(Subscription)
    #         .where(Subscription.user_id == data.user_id)
    #         .where(Subscription.organization_id == org_id)
    #         .where(Subscription.is_active == True)
    #         .where(Subscription.end_date >= date.today())
    #     )
    #     if existing.scalar_one_or_none():
    #         raise BadRequestException(detail="Cet étudiant a déjà une souscription active dans cette organisation")
        
    #     # Vérifier les slots disponibles
    #     active_students = await self.repo.count_active_students_in_org(org_id)
        
    #     if active_students >= org_sub.max_students:
    #         raise BadRequestException(
    #             detail=f"Slots insuffisants ({active_students}/{org_sub.max_students} utilisés)"
    #         )
        
    #     # Calculer dates (utilise la durée fournie, mais max = fin de souscription org)
    #     start_date = date.today()
    #     end_date = min(
    #         start_date + timedelta(days=data.duration_days),
    #         org_sub.end_date
    #     )
        
    #     #  CRÉER LA SOUSCRIPTION SANS PLAN (plan_id = NULL)
    #     subscription = await self.repo.create(
    #         user_id=data.user_id,
    #         organization_id=org_id,
    #         plan_id=None,  # ✅ Pas de plan pour B2B
    #         custom_duration_days=data.duration_days,  # ✅ Durée custom
    #         custom_ai_credits=org_sub.ai_credits_total // org_sub.max_students if org_sub.ai_credits_total > 0 else 0,  # ✅ Répartir les crédits
    #         start_date=start_date,
    #         end_date=end_date,
    #         is_active=True,
    #         ai_credits_remaining=org_sub.ai_credits_total // org_sub.max_students if org_sub.ai_credits_total > 0 else 0,
    #         created_by_id=current_user.id
    #     )
        
    #     # ✅ AJOUTER: Notifier les teachers de l'org
    #     from app.modules.notifications.service import NotificationService
    #     from app.modules.organizations.repository import OrganizationRepository
        
    #     org_repo = OrganizationRepository(self.db)
    #     org = await org_repo.get_by_id_or_404(org_sub.organization_id)
        
    #     # Récupérer le nom de l'étudiant
    #     from app.modules.users.repository import UserRepository
    #     user_repo = UserRepository(self.db)
    #     student = await user_repo.get_by_id_or_404(data.student_id)
        
    #     # Notifier les teachers
    #     notif_service = NotificationService(self.db) 
        
    #     # TODO: Récupérer les teachers de l'org
    #     # for teacher in org.teachers:
    #     #     await notif_service.notify_new_student(
    #     #         teacher_id=teacher.id,
    #     #         student_name=student.full_name,
    #     #         organization_name=org.name
    #     #     )
    #     return subscription
        
    
    async def get_org_students(self, org_id: UUID, current_user: User) -> list[Subscription]:
        """
        Récupérer les étudiants d'une organisation.
        
        Args:
            org_id: UUID de l'organisation
            current_user: Utilisateur authentifié
            
        Returns:
            Liste de souscriptions
            
        Raises:
            ForbiddenException: Si pas autorisé
        """
        from app.modules.organizations.repository import OrganizationRepository
        
        # Vérifier permissions
        if current_user.role == UserRole.PLATFORM_ADMIN:
            # Admin platform peut voir toutes les organisations
            pass
        elif current_user.role in [UserRole.ORG_ADMIN, UserRole.TEACHER]:
            # Vérifier que c'est bien leur organisation
            org_repo = OrganizationRepository(self.db)
            user_org = await org_repo.get_by_admin_or_teacher(current_user.id)
            
            if not user_org:
                raise ForbiddenException(
                    detail="Vous n'êtes associé à aucune organisation"
                )
            
            if user_org.id != org_id:
                raise ForbiddenException(
                    detail="Vous n'avez pas accès à cette organisation"
                )
        else:
            raise ForbiddenException(
                detail="Seuls les admins et enseignants peuvent consulter cette liste"
            )
        
        return await self.repo.get_by_organization(org_id)