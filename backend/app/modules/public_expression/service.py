"""
Service pour la gestion des sessions mensuelles et tâches d'expression.
"""
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.public_expression.models import (
    MonthlySession,
    EECombination,
    EOTask2,
    EOTask3
)
from app.modules.public_expression.repository import (
    MonthlySessionRepository,
    EECombinationRepository,
    EOTask2Repository,
    EOTask3Repository
)
from app.modules.public_expression.schemas import (
    MonthlySessionCreate,
    MonthlySessionUpdate,
    EECombinationCreate,
    EECombinationUpdate,
    EOTask2Create,
    EOTask2Update,
    EOTask3Create,
    EOTask3Update
)
from app.modules.users.models import User
from app.shared.enums import UserRole
from app.shared.exceptions.http import BadRequestException, ForbiddenException


class MonthlySessionService:
    """Service pour la gestion des sessions mensuelles."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = MonthlySessionRepository(db)
    
    async def create_session(
        self,
        data: MonthlySessionCreate,
        current_user: User
    ) -> MonthlySession:
        """Créer une session mensuelle (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des sessions")
        
        # Vérifier si session existe déjà pour ce mois
        existing = await self.repo.get_by_month(data.month)
        if existing:
            raise BadRequestException(
                detail=f"Une session existe déjà pour {data.name}"
            )
        
        session = await self.repo.create(
            month=data.month,
            name=data.name,
            is_active=True
        )
        
        return session
    
    async def get_sessions(self, active_only: bool = True) -> list[MonthlySession]:
        """Récupérer les sessions."""
        if active_only:
            return await self.repo.get_active_sessions()
        return await self.repo.get_all()
    
    async def get_session_by_id(self, session_id: UUID) -> MonthlySession:
        """Récupérer une session par ID."""
        return await self.repo.get_by_id_or_404(session_id)
    
    async def get_session_with_relations(self, session_id: UUID) -> MonthlySession:
        """Récupérer une session avec toutes ses relations."""
        session = await self.repo.get_with_relations(session_id)
        if not session:
            raise BadRequestException(detail="Session non trouvée")
        return session
    
    async def update_session(
        self,
        session_id: UUID,
        data: MonthlySessionUpdate,
        current_user: User
    ) -> MonthlySession:
        """Mettre à jour une session (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent modifier des sessions")
        
        update_data = data.model_dump(exclude_unset=True)
        session = await self.repo.update(session_id, **update_data)
        
        return session
    
    async def delete_session(self, session_id: UUID, current_user: User) -> bool:
        """Supprimer une session (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des sessions")
        
        return await self.repo.delete(session_id)


class EECombinationService:
    """Service pour la gestion des combinaisons EE."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = EECombinationRepository(db)
        self.session_repo = MonthlySessionRepository(db)
    
    async def create_combination(
        self,
        session_id: UUID,
        data: EECombinationCreate,
        current_user: User
    ) -> EECombination:
        """Créer une combinaison EE (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des combinaisons")
        
        # Vérifier que la session existe
        await self.session_repo.get_by_id_or_404(session_id)
        
        combination = await self.repo.create(
            session_id=session_id,
            **data.model_dump()
        )
        
        return combination
    
    async def get_combinations_by_session(self, session_id: UUID) -> list[EECombination]:
        """Récupérer toutes les combinaisons d'une session."""
        await self.session_repo.get_by_id_or_404(session_id)
        return await self.repo.get_by_session(session_id)
    
    async def get_combination_by_id(self, combination_id: UUID) -> EECombination:
        """Récupérer une combinaison par ID."""
        return await self.repo.get_by_id_or_404(combination_id)
    
    async def update_combination(
        self,
        combination_id: UUID,
        data: EECombinationUpdate,
        current_user: User
    ) -> EECombination:
        """Mettre à jour une combinaison (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent modifier des combinaisons")
        
        update_data = data.model_dump(exclude_unset=True)
        combination = await self.repo.update(combination_id, **update_data)
        
        return combination
    
    async def delete_combination(self, combination_id: UUID, current_user: User) -> bool:
        """Supprimer une combinaison (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des combinaisons")
        
        return await self.repo.delete(combination_id)


class EOTask2Service:
    """Service pour la gestion des sujets Tâche 2 (EO)."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = EOTask2Repository(db)
        self.session_repo = MonthlySessionRepository(db)
    
    async def create_task(
        self,
        session_id: UUID,
        data: EOTask2Create,
        current_user: User
    ) -> EOTask2:
        """Créer un sujet Tâche 2 (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des sujets")
        
        await self.session_repo.get_by_id_or_404(session_id)
        
        task = await self.repo.create(
            session_id=session_id,
            **data.model_dump()
        )
        
        return task
    
    async def get_tasks_by_session(self, session_id: UUID) -> list[EOTask2]:
        """Récupérer tous les sujets Tâche 2 d'une session."""
        await self.session_repo.get_by_id_or_404(session_id)
        return await self.repo.get_by_session(session_id)
    
    async def get_task_by_id(self, task_id: UUID) -> EOTask2:
        """Récupérer un sujet par ID."""
        return await self.repo.get_by_id_or_404(task_id)
    
    async def update_task(
        self,
        task_id: UUID,
        data: EOTask2Update,
        current_user: User
    ) -> EOTask2:
        """Mettre à jour un sujet (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent modifier des sujets")
        
        update_data = data.model_dump(exclude_unset=True)
        task = await self.repo.update(task_id, **update_data)
        
        return task
    
    async def delete_task(self, task_id: UUID, current_user: User) -> bool:
        """Supprimer un sujet (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des sujets")
        
        return await self.repo.delete(task_id)


class EOTask3Service:
    """Service pour la gestion des sujets Tâche 3 (EO)."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = EOTask3Repository(db)
        self.session_repo = MonthlySessionRepository(db)
    
    async def create_task(
        self,
        session_id: UUID,
        data: EOTask3Create,
        current_user: User
    ) -> EOTask3:
        """Créer un sujet Tâche 3 (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des sujets")
        
        await self.session_repo.get_by_id_or_404(session_id)
        
        task = await self.repo.create(
            session_id=session_id,
            **data.model_dump()
        )
        
        return task
    
    async def get_tasks_by_session(self, session_id: UUID) -> list[EOTask3]:
        """Récupérer tous les sujets Tâche 3 d'une session."""
        await self.session_repo.get_by_id_or_404(session_id)
        return await self.repo.get_by_session(session_id)
    
    async def get_task_by_id(self, task_id: UUID) -> EOTask3:
        """Récupérer un sujet par ID."""
        return await self.repo.get_by_id_or_404(task_id)
    
    async def update_task(
        self,
        task_id: UUID,
        data: EOTask3Update,
        current_user: User
    ) -> EOTask3:
        """Mettre à jour un sujet (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent modifier des sujets")
        
        update_data = data.model_dump(exclude_unset=True)
        task = await self.repo.update(task_id, **update_data)
        
        return task
    
    async def delete_task(self, task_id: UUID, current_user: User) -> bool:
        """Supprimer un sujet (admin uniquement)."""
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des sujets")
        
        return await self.repo.delete(task_id)