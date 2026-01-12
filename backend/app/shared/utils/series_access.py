"""
Utilitaire pour gérer l'accès aux séries TCF.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.series.repository import SeriesRepository
from app.modules.subscriptions.repository import SubscriptionRepository
from app.shared.exceptions.http import ForbiddenException


class SeriesAccessManager:
    """Gestionnaire d'accès aux séries."""
    
    # Les 3 premières séries sont gratuites
    FREE_SERIES_NUMBERS = [100, 148, 149]
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.series_repo = SeriesRepository(db)
        self.subscription_repo = SubscriptionRepository(db)
    
    async def check_series_access(
        self,
        user_id: UUID,
        series_id: UUID
    ) -> bool:
        """
        Vérifier si l'utilisateur peut accéder à une série.
        
        Args:
            user_id: UUID de l'utilisateur
            series_id: UUID de la série
            
        Returns:
            True si accès autorisé
            
        Raises:
            ForbiddenException: Si accès refusé
        """
        # Récupérer la série
        series = await self.series_repo.get_by_id_or_404(series_id)
        
        # Les 3 premières séries sont toujours accessibles
        if series.number in self.FREE_SERIES_NUMBERS:
            return True
        
        # Pour les autres, vérifier la souscription
        subscriptions = await self.subscription_repo.get_active_by_user(user_id)
        
        if not subscriptions:
            raise ForbiddenException(
                detail=f"La série n°{series.number} nécessite une souscription active. "
                       f"Les séries {', '.join(map(str, self.FREE_SERIES_NUMBERS))} sont gratuites."
            )
        
        return True
    
    async def get_accessible_series(self, user_id: UUID) -> dict:
        """
        Récupérer les séries accessibles pour un utilisateur.
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            dict avec free_series, premium_series, has_access
        """
        # Récupérer toutes les séries actives
        all_series = await self.series_repo.get_active_series()
        
        # Séparer gratuites et premium
        free_series = [s for s in all_series if s.number in self.FREE_SERIES_NUMBERS]
        premium_series = [s for s in all_series if s.number not in self.FREE_SERIES_NUMBERS]
        
        # Vérifier si l'utilisateur a une souscription
        subscriptions = await self.subscription_repo.get_active_by_user(user_id)
        has_premium_access = len(subscriptions) > 0
        
        return {
            "free_series": [{"id": str(s.id), "number": s.number, "title": s.title} for s in free_series],
            "premium_series": [{"id": str(s.id), "number": s.number, "title": s.title, "locked": not has_premium_access} for s in premium_series],
            "has_premium_access": has_premium_access
        }