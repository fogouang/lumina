"""
Service pour la gestion des expressions orales.
"""

import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.modules.exam_attempts.repository import ExamAttemptRepository
from app.modules.expression_tasks.repository import ExpressionTaskRepository
from app.modules.oral_expressions.models import OralExpression, OralExpressionCorrection
from app.modules.oral_expressions.repository import (
    OralCorrectionRepository,
    OralExpressionRepository,
)
from app.modules.oral_expressions.schemas import (
    OralCorrectionRequest,
    SubmitOralExpressionRequest,
)
from app.modules.users.models import User
from app.shared.enums import AttemptStatus, UserRole
from app.shared.exceptions.http import BadRequestException, ForbiddenException

settings = get_settings()


class OralExpressionService:
    """Service pour la gestion des expressions orales."""
    
    # Durée de rétention des audios (30 jours par défaut)
    RETENTION_DAYS = 30
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = OralExpressionRepository(db)
        self.correction_repo = OralCorrectionRepository(db)
        self.attempt_repo = ExamAttemptRepository(db)
        self.task_repo = ExpressionTaskRepository(db)
    
    # === SOUMISSION EXPRESSION ===
    
    async def submit_expression(
        self,
        attempt_id: UUID,
        data: SubmitOralExpressionRequest,
        current_user: User
    ) -> OralExpression:
        """
        Soumettre une expression orale.
        
        Args:
            attempt_id: UUID de la tentative
            data: Données de soumission
            current_user: Utilisateur authentifié
            
        Returns:
            Expression créée
            
        Raises:
            BadRequestException: Si tentative terminée ou tâche invalide
            ForbiddenException: Si pas propriétaire
        """
        # Vérifier la tentative
        attempt = await self.attempt_repo.get_by_id_or_404(attempt_id)
        
        if attempt.user_id != current_user.id:
            raise ForbiddenException(detail="Cette tentative ne vous appartient pas")
        
        if attempt.status != AttemptStatus.IN_PROGRESS:
            raise BadRequestException(detail="Cette tentative est terminée")
        
        # Vérifier la tâche
        task = await self.task_repo.get_by_id_or_404(data.task_id)
        
        if task.series_id != attempt.series_id:
            raise BadRequestException(
                detail="Cette tâche n'appartient pas à la série de cette tentative"
            )
        
        # Calculer taille fichier (optionnel)
        file_size_mb = None
        if data.audio_url:
            file_size_mb = self._calculate_file_size(data.audio_url)
        
        # Calculer date de suppression
        now = datetime.now(timezone.utc)
        delete_at = now + timedelta(days=self.RETENTION_DAYS)
        
        # Créer l'expression
        expression = await self.repo.create(
            attempt_id=attempt_id,
            task_id=data.task_id,
            audio_url=data.audio_url,
            file_size_mb=file_size_mb,
            duration_seconds=data.duration_seconds,
            submitted_at=now,
            delete_at=delete_at,
            correction_status="pending"
        )
        
        return expression
    
    async def get_my_expressions(
        self,
        attempt_id: UUID,
        current_user: User
    ) -> list[OralExpression]:
        """
        Récupérer mes expressions orales d'une tentative.
        
        Args:
            attempt_id: UUID de la tentative
            current_user: Utilisateur authentifié
            
        Returns:
            Liste d'expressions
        """
        # Vérifier que c'est bien la tentative de l'utilisateur
        attempt = await self.attempt_repo.get_by_id_or_404(attempt_id)
        
        if attempt.user_id != current_user.id:
            raise ForbiddenException(detail="Cette tentative ne vous appartient pas")
        
        return await self.repo.get_by_attempt(attempt_id)
    
    async def get_expression_by_id(
        self,
        expression_id: UUID,
        current_user: User
    ) -> OralExpression:
        """
        Récupérer une expression par ID.
        
        Args:
            expression_id: UUID de l'expression
            current_user: Utilisateur authentifié
            
        Returns:
            Expression
        """
        expression = await self.repo.get_by_id_or_404(expression_id)
        
        # Vérifier propriété
        attempt = await self.attempt_repo.get_by_id_or_404(expression.attempt_id)
        
        if attempt.user_id != current_user.id:
            raise ForbiddenException(detail="Cette expression ne vous appartient pas")
        
        return expression
    
    # === CORRECTION MANUELLE ===
    
    async def create_correction(
        self,
        expression_id: UUID,
        data: OralCorrectionRequest,
        current_user: User
    ) -> OralExpressionCorrection:
        """
        Créer une correction manuelle (teacher/admin uniquement).
        
        Args:
            expression_id: UUID de l'expression
            data: Données de correction
            current_user: Utilisateur authentifié
            
        Returns:
            Correction créée
            
        Raises:
            ForbiddenException: Si pas teacher/admin
            BadRequestException: Si déjà corrigée
        """
        # Vérifier permissions
        if current_user.role not in [UserRole.PLATFORM_ADMIN, UserRole.TEACHER]:
            raise ForbiddenException(
                detail="Seuls les teachers et admins peuvent corriger"
            )
        
        # Vérifier qu'il n'y a pas déjà de correction
        existing = await self.correction_repo.get_by_expression(expression_id)
        if existing:
            raise BadRequestException(detail="Cette expression a déjà une correction")
        
        # Vérifier que l'expression existe
        expression = await self.repo.get_by_id_or_404(expression_id)
        
        # Créer la correction
        correction = await self.correction_repo.create(
            expression_id=expression_id,
            corrector_id=current_user.id,
            score=data.score,
            feedback=data.feedback,
            corrected_at=datetime.now(timezone.utc)
        )
        
        # Mettre à jour le statut
        await self.repo.update(
            expression_id,
            correction_status="corrected"
        )
        
        #  Notifier l'étudiant
        from app.modules.notifications.service import NotificationService
        
        # Récupérer l'étudiant
        expression = await self.repo.get_by_id_or_404(expression_id)
        attempt = await self.attempt_repo.get_by_id_or_404(expression.attempt_id)
        
        notif_service = NotificationService(self.db)
        await notif_service.notify_correction_ready(
            user_id=attempt.user_id,
            expression_id=expression_id,
            expression_type="orale"
        )
        
        return correction
    
    async def get_correction(
        self,
        expression_id: UUID,
        current_user: User
    ) -> OralExpressionCorrection | None:
        """
        Récupérer la correction d'une expression.
        
        Args:
            expression_id: UUID de l'expression
            current_user: Utilisateur authentifié
            
        Returns:
            Correction ou None
        """
        # Vérifier propriété
        await self.get_expression_by_id(expression_id, current_user)
        
        return await self.correction_repo.get_by_expression(expression_id)
    
    async def update_correction(
        self,
        expression_id: UUID,
        data: OralCorrectionRequest,
        current_user: User
    ) -> OralExpressionCorrection:
        """
        Mettre à jour une correction.
        
        Args:
            expression_id: UUID de l'expression
            data: Nouvelles données
            current_user: Utilisateur authentifié
            
        Returns:
            Correction mise à jour
        """
        # Vérifier permissions
        if current_user.role not in [UserRole.PLATFORM_ADMIN, UserRole.TEACHER]:
            raise ForbiddenException(
                detail="Seuls les teachers et admins peuvent modifier les corrections"
            )
        
        # Récupérer la correction existante
        correction = await self.correction_repo.get_by_expression(expression_id)
        if not correction:
            raise BadRequestException(detail="Aucune correction trouvée")
        
        # Mettre à jour
        update_data = data.model_dump(exclude_unset=True)
        update_data["corrected_at"] = datetime.now(timezone.utc)
        
        correction = await self.correction_repo.update(
            correction.id,
            **update_data
        )
        
        return correction
    
    # === GESTION RÉTENTION AUDIOS ===
    
    async def cleanup_expired_audios(self) -> dict:
        """
        Supprimer les audios expirés (tâche background).
        
        Returns:
            dict avec statistiques
        """
        # Récupérer les expressions expirées
        expired = await self.repo.get_expired_audios()
        
        deleted_count = 0
        errors = []
        
        for expression in expired:
            try:
                # Supprimer le fichier physique
                if expression.audio_url:
                    self._delete_audio_file(expression.audio_url)
                
                # Marquer comme supprimé en DB
                await self.repo.update(
                    expression.id,
                    audio_url=None,
                    deleted_at=datetime.now(timezone.utc)
                )
                
                deleted_count += 1
            
            except Exception as e:
                errors.append(f"Expression {expression.id}: {str(e)}")
        
        return {
            "total_expired": len(expired),
            "deleted": deleted_count,
            "errors": errors
        }
    
    def _calculate_file_size(self, audio_url: str) -> float | None:
        """
        Calculer la taille d'un fichier audio.
        
        Args:
            audio_url: URL du fichier
            
        Returns:
            Taille en MB ou None
        """
        from app.storage.file_manager import FileManager
    
        file_manager = FileManager()
        return file_manager.get_file_size_mb(audio_url)
    
    
    def _delete_audio_file(self, audio_url: str):
        """
        Supprimer un fichier audio physiquement.
        
        Args:
            audio_url: URL du fichier
        """
        from app.storage.file_manager import FileManager
    
        file_manager = FileManager()
        file_manager.delete_file(audio_url)