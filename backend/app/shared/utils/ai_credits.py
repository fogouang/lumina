"""
Utilitaire pour gérer les crédits IA.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.subscriptions.repository import SubscriptionRepository
from app.shared.exceptions.http import BadRequestException, ForbiddenException


class AICreditManager:
    """Gestionnaire de crédits IA."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.subscription_repo = SubscriptionRepository(db)
    
    async def check_and_consume_credit(
        self,
        user_id: UUID,
        cost: int = 1
    ) -> dict:
        """
        Vérifier et consommer des crédits IA.
        
        Args:
            user_id: UUID de l'utilisateur
            cost: Nombre de crédits à consommer (défaut: 1)
            
        Returns:
            dict avec credits_remaining, notification_sent
            
        Raises:
            ForbiddenException: Si pas de souscription active
            BadRequestException: Si crédits insuffisants
        """
        # Récupérer la souscription active
        subscriptions = await self.subscription_repo.get_active_by_user(user_id)
        
        if not subscriptions:
            raise ForbiddenException(
                detail="Vous devez avoir une souscription active pour utiliser l'IA"
            )
        
        # Prendre la première souscription active
        subscription = subscriptions[0]
        
        # Vérifier les crédits
        if subscription.ai_credits_remaining < cost:
            raise BadRequestException(
                detail=f"Crédits IA insuffisants. Vous avez {subscription.ai_credits_remaining} crédits, "
                       f"mais {cost} sont nécessaires."
            )
        
        # Consommer les crédits
        new_remaining = subscription.ai_credits_remaining - cost
        await self.subscription_repo.update(
            subscription.id,
            ai_credits_remaining=new_remaining
        )
        
        # Vérifier si on doit notifier (seuil: 5 crédits)
        should_notify = new_remaining <= 5 and new_remaining > 0
        
        return {
            "credits_remaining": new_remaining,
            "notification_sent": should_notify
        }
    
    async def get_credits_balance(self, user_id: UUID) -> dict:
        """
        Récupérer le solde de crédits IA.
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            dict avec ai_correction_credits (comme attendu par le frontend)
        """
        subscriptions = await self.subscription_repo.get_active_by_user(user_id)
        
        if not subscriptions:
            return {
                "ai_correction_credits": 0
            }
        
        subscription = subscriptions[0]
        
        return {
            "ai_correction_credits": subscription.ai_credits_remaining
        }