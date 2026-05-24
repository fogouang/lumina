"""
Repository pour les paiements.
"""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.payments.models import Payment
from app.shared.database.repository import BaseRepository
from app.shared.enums import PaymentStatus


class PaymentRepository(BaseRepository[Payment]):
    """Repository pour les opérations CRUD sur les paiements."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Payment, db)
    
    async def find_by_invoice_number(self, invoice_number: str) -> Payment | None:
        """
        Trouver un paiement par numéro de facture.
        
        Args:
            invoice_number: Numéro de facture
            
        Returns:
            Payment ou None
        """
        result = await self.db.execute(
            select(Payment).where(Payment.invoice_number == invoice_number)
        )
        return result.scalar_one_or_none()
    
    async def find_by_transaction_ref(self, transaction_ref: str) -> Payment | None:
        """
        Trouver un paiement par référence My-CoolPay.
        
        Args:
            transaction_ref: Référence transaction My-CoolPay
            
        Returns:
            Payment ou None
        """
        result = await self.db.execute(
            select(Payment).where(Payment.transaction_reference == transaction_ref)
        )
        return result.scalar_one_or_none()
    
    async def get_by_user(self, user_id: UUID) -> list[Payment]:
        """
        Récupérer les paiements d'un utilisateur.
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            Liste de paiements
        """
        result = await self.db.execute(
            select(Payment)
            .where(Payment.user_id == user_id)
            .order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def get_by_organization(self, org_id: UUID) -> list[Payment]:
        """
        Récupérer les paiements d'une organisation.
        
        Args:
            org_id: UUID de l'organisation
            
        Returns:
            Liste de paiements
        """
        result = await self.db.execute(
            select(Payment)
            .where(Payment.organization_id == org_id)
            .order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())
    

    async def generate_invoice_number(self) -> str:
        """
        Générer un numéro de facture unique avec timestamp.
        
        Format: INV-YYYY-XXXXX-TIMESTAMP (ex: INV-2025-00001-1738012345)
        
        Returns:
            Numéro de facture
        """
        from datetime import datetime
        import time
        
        # Récupérer le dernier numéro de facture de l'année
        year = datetime.now().year
        prefix = f"INV-{year}-"
        
        result = await self.db.execute(
            select(Payment.invoice_number)
            .where(Payment.invoice_number.like(f"{prefix}%"))
            .order_by(Payment.created_at.desc()) 
            .limit(1)
        )
        
        last_invoice = result.scalar_one_or_none()
        
        if last_invoice:
            # Extraire le numéro (ignore le timestamp)
            parts = last_invoice.split("-")
            if len(parts) >= 3:
                last_number = int(parts[2])
                next_number = last_number + 1
            else:
                next_number = 1
        else:
            next_number = 1
        
        #Ajouter un timestamp pour éviter les doublons
        timestamp = int(time.time())
        
        # Formater: INV-2025-00001-1738012345
        return f"{prefix}{next_number:05d}-{timestamp}"
    
    
    async def get_all(self, limit: int = 100, offset: int = 0) -> list[Payment]:
        result = await self.db.execute(
            select(Payment)
            .order_by(Payment.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def get_stats(self) -> dict:
        from sqlalchemy import func
        total = await self.db.execute(select(func.count(Payment.id)))
        completed = await self.db.execute(select(func.sum(Payment.amount_paid)).where(Payment.payment_status == PaymentStatus.COMPLETED))
        pending = await self.db.execute(select(func.count(Payment.id)).where(Payment.payment_status == PaymentStatus.PENDING))
        return {
            "total_payments": total.scalar() or 0,
            "total_revenue": float(completed.scalar() or 0),
            "pending_count": pending.scalar() or 0,
        }
        
    
    async def get_all_with_users(self, limit: int = 100, offset: int = 0) -> list[dict]:
        from app.modules.users.models import User
        from sqlalchemy import select, outerjoin
        
        result = await self.db.execute(
            select(Payment, User.email, User.first_name, User.last_name)
            .outerjoin(User, Payment.user_id == User.id)
            .order_by(Payment.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        rows = result.all()
        return [
            {
                **{c.key: getattr(row.Payment, c.key) for c in Payment.__table__.columns},
                "user_email": row.email,
                "user_name": f"{row.first_name} {row.last_name}" if row.first_name else None,
            }
            for row in rows
        ]