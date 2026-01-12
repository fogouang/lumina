"""
Repository pour les notifications.
"""

from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import Notification
from app.shared.database.repository import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    """Repository pour les notifications."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(Notification, db)
    
    async def get_by_user(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 50
    ) -> list[Notification]:
        """
        Récupérer les notifications d'un utilisateur.
        
        Args:
            user_id: UUID de l'utilisateur
            skip: Nombre à sauter (pagination)
            limit: Nombre max à retourner
            
        Returns:
            Liste de notifications
        """
        result = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_unread_by_user(self, user_id: UUID) -> list[Notification]:
        """
        Récupérer les notifications non lues d'un utilisateur.
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            Liste de notifications non lues
        """
        result = await self.db.execute(
            select(Notification)
            .where(Notification.user_id == user_id)
            .where(Notification.is_read == False)
            .order_by(Notification.created_at.desc())
        )
        return list(result.scalars().all())
    
    async def count_unread(self, user_id: UUID) -> int:
        """
        Compter les notifications non lues.
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            Nombre de notifications non lues
        """
        from sqlalchemy import func
        
        result = await self.db.execute(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user_id)
            .where(Notification.is_read == False)
        )
        return result.scalar_one()
    
    async def mark_as_read(self, notification_ids: list[UUID]) -> int:
        """
        Marquer des notifications comme lues.
        
        Args:
            notification_ids: Liste d'IDs de notifications
            
        Returns:
            Nombre de notifications modifiées
        """
        result = await self.db.execute(
            update(Notification)
            .where(Notification.id.in_(notification_ids))
            .values(is_read=True)
        )
        return result.rowcount
    
    async def mark_all_as_read(self, user_id: UUID) -> int:
        """
        Marquer toutes les notifications comme lues.
        
        Args:
            user_id: UUID de l'utilisateur
            
        Returns:
            Nombre de notifications modifiées
        """
        result = await self.db.execute(
            update(Notification)
            .where(Notification.user_id == user_id)
            .where(Notification.is_read == False)
            .values(is_read=True)
        )
        return result.rowcount
    
    async def delete_old_notifications(self, days: int = 90) -> int:
        """
        Supprimer les vieilles notifications (nettoyage).
        
        Args:
            days: Nombre de jours à garder
            
        Returns:
            Nombre de notifications supprimées
        """
        from datetime import datetime, timedelta, timezone
        
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        result = await self.db.execute(
            select(Notification)
            .where(Notification.created_at < cutoff_date)
        )
        old_notifications = list(result.scalars().all())
        
        for notif in old_notifications:
            await self.db.delete(notif)
        
        return len(old_notifications)