"""
Base Repository Pattern pour opérations CRUD génériques.
"""

from typing import Any, Generic, Sequence, Type, TypeVar
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.database.base import BaseModel
from app.shared.exceptions.base import DatabaseException
from app.shared.exceptions.http import NotFoundException

# Type générique pour les models
ModelType = TypeVar("ModelType", bound=BaseModel)


class BaseRepository(Generic[ModelType]):
    """
    Repository générique pour opérations CRUD.
    
    Fournit les opérations de base (Create, Read, Update, Delete) pour tous les modèles.
    
    Usage:
        >>> class UserRepository(BaseRepository[User]):
        ...     def __init__(self, db: AsyncSession):
        ...         super().__init__(User, db)
        ...     
        ...     # Ajouter méthodes custom ici
        ...     async def find_by_email(self, email: str) -> User | None:
        ...         result = await self.db.execute(
        ...             select(User).where(User.email == email)
        ...         )
        ...         return result.scalar_one_or_none()
    """
    
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        """
        Initialiser le repository.
        
        Args:
            model: Classe du model SQLAlchemy
            db: Session database async
        """
        self.model = model
        self.db = db
    
    async def create(self, **kwargs: Any) -> ModelType:
        """
        Créer une nouvelle entité.
        
        Args:
            **kwargs: Champs de l'entité
        
        Returns:
            Entité créée
        
        Raises:
            DatabaseException: En cas d'erreur database
        
        Example:
            >>> user = await user_repo.create(
            ...     email="test@example.com",
            ...     first_name="John"
            ... )
        """
        try:
            instance = self.model(**kwargs)
            self.db.add(instance)
            await self.db.commit()
            await self.db.refresh(instance)
            
            return instance
        
        except Exception as e:
            await self.db.rollback()
            raise DatabaseException(
                message=f"Erreur lors de la création de {self.model.__name__}",
                original_error=e
            )
    
    async def get_by_id(self, id: UUID) -> ModelType | None:
        """
        Récupérer une entité par ID.
        
        Args:
            id: UUID de l'entité
        
        Returns:
            Entité ou None si introuvable
        
        Example:
            >>> user = await user_repo.get_by_id(user_id)
        """
        try:
            result = await self.db.execute(
                select(self.model).where(self.model.id == id)
            )
            return result.scalar_one_or_none()
        
        except Exception as e:
            raise DatabaseException(
                message=f"Erreur lors de la récupération de {self.model.__name__}",
                original_error=e
            )
    
    async def get_by_id_or_404(self, id: UUID) -> ModelType:
        """
        Récupérer une entité par ID ou raise 404.
        
        Args:
            id: UUID de l'entité
        
        Returns:
            Entité
        
        Raises:
            NotFoundException: Si entité introuvable
        
        Example:
            >>> user = await user_repo.get_by_id_or_404(user_id)
        """
        instance = await self.get_by_id(id)
        
        if instance is None:
            raise NotFoundException(
                resource=self.model.__name__,
                identifier=str(id)
            )
        
        return instance
    
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> Sequence[ModelType]:
        """
        Récupérer toutes les entités (paginées).
        
        Args:
            skip: Nombre d'entités à sauter
            limit: Nombre maximum d'entités à retourner
        
        Returns:
            Liste d'entités
        
        Example:
            >>> users = await user_repo.get_all(skip=0, limit=20)
        """
        try:
            result = await self.db.execute(
                select(self.model)
                .offset(skip)
                .limit(limit)
            )
            return result.scalars().all()
        
        except Exception as e:
            raise DatabaseException(
                message=f"Erreur lors de la récupération de {self.model.__name__}",
                original_error=e
            )
    
    async def count(self) -> int:
        """
        Compter le nombre total d'entités.
        
        Returns:
            Nombre d'entités
        
        Example:
            >>> total = await user_repo.count()
        """
        try:
            result = await self.db.execute(
                select(func.count()).select_from(self.model)
            )
            return result.scalar_one()
        
        except Exception as e:
            raise DatabaseException(
                message=f"Erreur lors du comptage de {self.model.__name__}",
                original_error=e
            )
    
    async def update(
        self,
        id: UUID,
        **kwargs: Any
    ) -> ModelType:
        """
        Mettre à jour une entité.
        
        Args:
            id: UUID de l'entité
            **kwargs: Champs à mettre à jour
        
        Returns:
            Entité mise à jour
        
        Raises:
            NotFoundException: Si entité introuvable
            DatabaseException: En cas d'erreur database
        
        Example:
            >>> user = await user_repo.update(
            ...     user_id,
            ...     first_name="Jane"
            ... )
        """
        try:
            # Vérifier que l'entité existe
            instance = await self.get_by_id_or_404(id)
            
            # Mettre à jour les champs
            for key, value in kwargs.items():
                if hasattr(instance, key):
                    setattr(instance, key, value)
            
            await self.db.commit()
            await self.db.refresh(instance)
            
            return instance
        
        except NotFoundException:
            raise
        
        except Exception as e:
            await self.db.rollback()
            raise DatabaseException(
                message=f"Erreur lors de la mise à jour de {self.model.__name__}",
                original_error=e
            )
    
    async def delete(self, id: UUID) -> bool:
        """
        Supprimer une entité (hard delete).
        
        Args:
            id: UUID de l'entité
        
        Returns:
            True si supprimé, False si introuvable
        
        Example:
            >>> deleted = await user_repo.delete(user_id)
        """
        try:
            # Vérifier que l'entité existe
            instance = await self.get_by_id(id)
            
            if instance is None:
                return False
            
            await self.db.delete(instance)
            await self.db.commit()
            
            return True
        
        except Exception as e:
            await self.db.rollback()
            raise DatabaseException(
                message=f"Erreur lors de la suppression de {self.model.__name__}",
                original_error=e
            )
    
    async def exists(self, id: UUID) -> bool:
        """
        Vérifier si une entité existe.
        
        Args:
            id: UUID de l'entité
        
        Returns:
            True si existe, False sinon
        
        Example:
            >>> exists = await user_repo.exists(user_id)
        """
        instance = await self.get_by_id(id)
        return instance is not None