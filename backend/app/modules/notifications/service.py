"""
Service pour la gestion des notifications.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import Notification
from app.modules.notifications.repository import NotificationRepository
from app.modules.users.models import User
from app.shared.enums import NotificationType
from app.shared.exceptions.http import ForbiddenException


class NotificationService:
    """Service pour la gestion des notifications."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = NotificationRepository(db)
    
    # === CRÉER NOTIFICATIONS ===
    
    async def create_notification(
        self,
        user_id: UUID,
        notification_type: NotificationType,
        title: str,
        message: str | None = None,
        related_id: UUID | None = None
    ) -> Notification:
        """
        Créer une notification pour un utilisateur.
        
        Args:
            user_id: UUID de l'utilisateur
            notification_type: Type de notification
            title: Titre de la notification
            message: Message optionnel
            related_id: ID de l'entité liée (correction, payment, etc.)
            
        Returns:
            Notification créée
        """
        notification = await self.repo.create(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            is_read=False,
            related_id=related_id
        )
        
        return notification
    
    # Méthodes helper pour créer des notifications spécifiques
    
    async def notify_correction_ready(
        self,
        user_id: UUID,
        expression_id: UUID,
        expression_type: str = "écrite"
    ):
        """Notifier qu'une correction est prête."""
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.CORRECTION_READY,
            title=f"Correction {expression_type} disponible",
            message=f"Votre expression {expression_type} a été corrigée et est maintenant disponible.",
            related_id=expression_id
        )
    
    async def notify_credits_low(
        self,
        user_id: UUID,
        credits_remaining: int
    ):
        """Notifier que les crédits IA sont faibles."""
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.CREDITS_LOW,
            title="Crédits IA bientôt épuisés",
            message=f"Il vous reste {credits_remaining} crédits IA. Pensez à recharger votre compte."
        )
    
    async def notify_expiration_warning(
        self,
        user_id: UUID,
        days_remaining: int
    ):
        """Notifier que la souscription expire bientôt."""
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.EXPIRATION_WARNING,
            title="Souscription bientôt expirée",
            message=f"Votre souscription expire dans {days_remaining} jours. Renouvelez-la pour continuer."
        )
    
    async def notify_new_student(
        self,
        teacher_id: UUID,
        student_name: str,
        organization_name: str
    ):
        """Notifier un teacher qu'un nouvel étudiant a été ajouté."""
        return await self.create_notification(
            user_id=teacher_id,
            notification_type=NotificationType.NEW_STUDENT,
            title="Nouvel étudiant ajouté",
            message=f"{student_name} a rejoint {organization_name}."
        )
    
    async def notify_payment_success(
        self,
        user_id: UUID,
        amount: float,
        payment_id: UUID
    ):
        """Notifier que le paiement a réussi."""
        return await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.PAYMENT_SUCCESS,
            title="Paiement réussi",
            message=f"Votre paiement de {amount:,.0f} FCFA a été confirmé.",
            related_id=payment_id
        )
    
    # === RÉCUPÉRER NOTIFICATIONS ===
    
    async def get_my_notifications(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 50,
        unread_only: bool = False
    ) -> list[Notification]:
        """
        Récupérer les notifications de l'utilisateur.
        
        Args:
            current_user: Utilisateur authentifié
            skip: Pagination - éléments à sauter
            limit: Pagination - nombre max
            unread_only: Ne retourner que les non lues
            
        Returns:
            Liste de notifications
        """
        if unread_only:
            return await self.repo.get_unread_by_user(current_user.id)
        
        return await self.repo.get_by_user(current_user.id, skip=skip, limit=limit)
    
    async def get_notification_stats(self, current_user: User) -> dict:
        """
        Récupérer les statistiques de notifications.
        
        Args:
            current_user: Utilisateur authentifié
            
        Returns:
            dict avec total, unread, read
        """
        all_notifs = await self.repo.get_by_user(current_user.id, limit=1000)
        unread_count = await self.repo.count_unread(current_user.id)
        
        return {
            "total": len(all_notifs),
            "unread": unread_count,
            "read": len(all_notifs) - unread_count
        }
    
    # === MARQUER COMME LU ===
    
    async def mark_as_read(
        self,
        notification_ids: list[UUID],
        current_user: User
    ) -> int:
        """
        Marquer des notifications comme lues.
        
        Args:
            notification_ids: Liste d'IDs
            current_user: Utilisateur authentifié
            
        Returns:
            Nombre de notifications modifiées
            
        Raises:
            ForbiddenException: Si les notifications n'appartiennent pas à l'utilisateur
        """
        # Vérifier que toutes les notifications appartiennent à l'utilisateur
        for notif_id in notification_ids:
            notif = await self.repo.get_by_id_or_404(notif_id)
            if notif.user_id != current_user.id:
                raise ForbiddenException(detail="Cette notification ne vous appartient pas")
        
        return await self.repo.mark_as_read(notification_ids)
    
    async def mark_all_as_read(self, current_user: User) -> int:
        """
        Marquer toutes les notifications comme lues.
        
        Args:
            current_user: Utilisateur authentifié
            
        Returns:
            Nombre de notifications modifiées
        """
        return await self.repo.mark_all_as_read(current_user.id)
    
    # === NETTOYAGE ===
    
    async def cleanup_old_notifications(self, days: int = 90) -> int:
        """
        Supprimer les vieilles notifications (tâche admin/background).
        
        Args:
            days: Garder les notifications des X derniers jours
            
        Returns:
            Nombre de notifications supprimées
        """
        return await self.repo.delete_old_notifications(days)