"""
Repository pour les achats de crédits IA.
"""
from uuid import UUID
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.ai_credit_purchases.models import AICreditPurchase
from app.modules.payments.models import Payment

class AICreditPurchaseRepository:
    """Repository pour les achats de crédits."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, **data) -> AICreditPurchase:
        """Créer un achat."""
        purchase = AICreditPurchase(**data)
        self.db.add(purchase)
        await self.db.commit()
        await self.db.refresh(purchase)
        return purchase
    
    async def get_by_id(self, purchase_id: UUID) -> AICreditPurchase | None:
        """Récupérer un achat par ID."""
        query = select(AICreditPurchase).where(AICreditPurchase.id == purchase_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_payment_id(self, payment_id: UUID) -> AICreditPurchase | None:
        """Récupérer un achat par payment_id."""
        query = select(AICreditPurchase).where(AICreditPurchase.payment_id == payment_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_user_purchases(
        self, 
        user_id: UUID, 
        limit: int = 50
    ) -> list[tuple[AICreditPurchase, Payment]]:
        """Récupérer l'historique d'achats d'un utilisateur."""
        query = (
            select(AICreditPurchase, Payment)
            .join(Payment, AICreditPurchase.payment_id == Payment.id)
            .where(Payment.user_id == user_id)
            .order_by(Payment.created_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.all())
    
    async def get_user_stats(self, user_id: UUID) -> dict:
        """Statistiques d'achats d'un utilisateur."""
        from app.shared.enums import PaymentStatus
        
        query = select(
            func.sum(AICreditPurchase.total_amount).label("total_spent"),
            func.sum(AICreditPurchase.credits_purchased).label("total_credits"),
            func.count(AICreditPurchase.id).label("total_purchases")
        ).select_from(AICreditPurchase).join(
            Payment, AICreditPurchase.payment_id == Payment.id
        ).where(
            Payment.user_id == user_id,
            Payment.payment_status == PaymentStatus.COMPLETED
        )
        
        result = await self.db.execute(query)
        row = result.one()
        
        return {
            "total_spent": float(row.total_spent or 0),
            "total_credits_purchased": int(row.total_credits or 0),
            "total_purchases": int(row.total_purchases or 0)
        }