"""
Service pour la gestion des tâches d'expression.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.expression_tasks.models import ExpressionTask
from app.modules.expression_tasks.repository import ExpressionTaskRepository
from app.modules.expression_tasks.schemas import (
    ExpressionTaskCreate,
    ExpressionTaskImportRequest,
    ExpressionTaskUpdate,
)
from app.modules.series.repository import SeriesRepository
from app.modules.users.models import User
from app.shared.enums import ExpressionType, UserRole
from app.shared.exceptions.http import BadRequestException, ForbiddenException


class ExpressionTaskService:
    """Service pour la gestion des tâches d'expression."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ExpressionTaskRepository(db)
        self.series_repo = SeriesRepository(db)
    
    async def create_task(
        self,
        data: ExpressionTaskCreate,
        current_user: User
    ) -> ExpressionTask:
        """
        Créer une tâche d'expression (admin uniquement).
        
        Args:
            data: Données de la tâche
            current_user: Utilisateur authentifié
            
        Returns:
            Tâche créée
            
        Raises:
            ForbiddenException: Si pas admin
            BadRequestException: Si données invalides
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des tâches")
        
        # Vérifier que la série existe
        series = await self.series_repo.get_by_id_or_404(data.series_id)
        
        # Valider selon le type
        if data.type == ExpressionType.WRITTEN:
            if not data.word_count_min or not data.word_count_max:
                raise BadRequestException(
                    detail="Les limites de mots sont obligatoires pour l'expression écrite"
                )
        
        elif data.type == ExpressionType.ORAL:
            if not data.preparation_time_seconds or not data.recording_time_seconds:
                raise BadRequestException(
                    detail="Les temps sont obligatoires pour l'expression orale"
                )
            if not data.instruction_audio_url:
                raise BadRequestException(
                    detail="L'audio de consigne est obligatoire pour l'expression orale"
                )
        
        # Créer la tâche
        task = await self.repo.create(
            series_id=data.series_id,
            task_number=data.task_number,
            type=data.type,
            instruction_text=data.instruction_text,
            instruction_audio_url=data.instruction_audio_url,
            word_count_min=data.word_count_min,
            word_count_max=data.word_count_max,
            preparation_time_seconds=data.preparation_time_seconds,
            recording_time_seconds=data.recording_time_seconds
        )
        
        return task
    
    async def get_tasks_by_series(self, series_id: UUID) -> list[ExpressionTask]:
        """
        Récupérer toutes les tâches d'une série.
        
        Args:
            series_id: UUID de la série
            
        Returns:
            Liste de tâches
        """
        # Vérifier que la série existe
        await self.series_repo.get_by_id_or_404(series_id)
        
        return await self.repo.get_by_series(series_id)
    
    async def get_task_by_id(self, task_id: UUID) -> ExpressionTask:
        """
        Récupérer une tâche par ID.
        
        Args:
            task_id: UUID de la tâche
            
        Returns:
            Tâche
        """
        return await self.repo.get_by_id_or_404(task_id)
    
    async def update_task(
        self,
        task_id: UUID,
        data: ExpressionTaskUpdate,
        current_user: User
    ) -> ExpressionTask:
        """
        Mettre à jour une tâche (admin uniquement).
        
        Args:
            task_id: UUID de la tâche
            data: Données de mise à jour
            current_user: Utilisateur authentifié
            
        Returns:
            Tâche mise à jour
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent modifier des tâches")
        
        # Mettre à jour
        update_data = data.model_dump(exclude_unset=True)
        task = await self.repo.update(task_id, **update_data)
        
        return task
    
    async def delete_task(self, task_id: UUID, current_user: User) -> bool:
        """
        Supprimer une tâche (admin uniquement).
        
        Args:
            task_id: UUID de la tâche
            current_user: Utilisateur authentifié
            
        Returns:
            True si supprimé
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des tâches")
        
        return await self.repo.delete(task_id)
    
    async def import_expression_tasks(
        self,
        series_id: UUID,
        data: ExpressionTaskImportRequest,
        task_type: ExpressionType,
        current_user: User
    ) -> dict:
        """
        Importer des tâches d'expression depuis JSON.
        
        ÉCRIT:
        - T1/T2: InstructionText + WordCount
        - T3: Title + Document1 + Document2 + WordCount
        
        ORAL:
        - T2/T3 uniquement (T1 créée automatiquement)
        - InstructionText (sujet variable)
        - Audio + temps gérés automatiquement côté backend
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent importer des tâches")
        
        # Vérifier que la série existe
        await self.series_repo.get_by_id_or_404(series_id)
        
        # ✅ Constantes pour oral (URLs statiques + temps TCF Canada)
        STATIC_ORAL_AUDIOS = {
            1: "/uploads/static/oral-task1-instruction.mp3",
            2: "/uploads/static/oral-task2-instruction.mp3",
            3: "/uploads/static/oral-task3-instruction.mp3",
        }
        
        ORAL_TASK_TIMES = {
            1: {"prep": 0, "recording": 120},      # 2min
            2: {"prep": 120, "recording": 210},    # 2min prep + 3min30
            3: {"prep": 0, "recording": 270},      # 4min30
        }
        
        created_count = 0
        skipped_count = 0
        errors = []
        
        # ✅ Si oral, créer automatiquement la tâche 1 statique
        if task_type == ExpressionType.ORAL:
            try:
                await self.repo.create(
                    series_id=series_id,
                    task_number=1,
                    type=ExpressionType.ORAL,
                    instruction_text="Présentez-vous en 2 minutes (parlez de vous, de votre famille, de vos centres d'intérêt)",
                    instruction_audio_url=STATIC_ORAL_AUDIOS[1],
                    word_count_min=None,
                    word_count_max=None,
                    preparation_time_seconds=ORAL_TASK_TIMES[1]["prep"],
                    recording_time_seconds=ORAL_TASK_TIMES[1]["recording"],
                    title=None,
                    document_1=None,
                    document_2=None
                )
                created_count += 1
            except Exception as e:
                errors.append(f"Tâche 1 (auto): {str(e)}")
        
        # Traiter les tâches du JSON
        for item in data.tasks:
            try:
                # ✅ Valider selon le type
                if task_type == ExpressionType.WRITTEN:
                    # Vérifier word count
                    if not item.WordCountMin or not item.WordCountMax:
                        errors.append(
                            f"Tâche {item.TaskNumber}: WordCountMin et WordCountMax requis"
                        )
                        skipped_count += 1
                        continue
                    
                    # Tâche 3: vérifier title + documents
                    if item.TaskNumber == 3:
                        if not item.Title or not item.Document1 or not item.Document2:
                            errors.append(
                                f"Tâche 3: Title, Document1 et Document2 requis"
                            )
                            skipped_count += 1
                            continue
                    
                    # Tâche 1/2: vérifier instruction_text
                    else:
                        if not item.InstructionText:
                            errors.append(
                                f"Tâche {item.TaskNumber}: InstructionText requis"
                            )
                            skipped_count += 1
                            continue
                    
                    # ✅ Créer tâche écrite
                    await self.repo.create(
                        series_id=series_id,
                        task_number=item.TaskNumber,
                        type=task_type,
                        instruction_text=item.InstructionText,
                        title=item.Title,
                        document_1=item.Document1,
                        document_2=item.Document2,
                        word_count_min=item.WordCountMin,
                        word_count_max=item.WordCountMax,
                        instruction_audio_url=None,
                        preparation_time_seconds=None,
                        recording_time_seconds=None
                    )
                
                elif task_type == ExpressionType.ORAL:
                    # Vérifier instruction_text
                    if not item.InstructionText:
                        errors.append(
                            f"Tâche {item.TaskNumber}: InstructionText requis"
                        )
                        skipped_count += 1
                        continue
                    
                    # ✅ Créer tâche orale avec audio + temps statiques
                    await self.repo.create(
                        series_id=series_id,
                        task_number=item.TaskNumber,
                        type=task_type,
                        instruction_text=item.InstructionText,
                        instruction_audio_url=STATIC_ORAL_AUDIOS[item.TaskNumber],
                        preparation_time_seconds=ORAL_TASK_TIMES[item.TaskNumber]["prep"],
                        recording_time_seconds=ORAL_TASK_TIMES[item.TaskNumber]["recording"],
                        word_count_min=None,
                        word_count_max=None,
                        title=None,
                        document_1=None,
                        document_2=None
                    )
                
                created_count += 1
            
            except Exception as e:
                errors.append(f"Tâche {item.TaskNumber}: {str(e)}")
                skipped_count += 1
        
        return {
            "imported_count": created_count,
            "skipped_count": skipped_count,
            "errors": errors if errors else None
        }