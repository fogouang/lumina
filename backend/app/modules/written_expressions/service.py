"""
Service pour la gestion des expressions écrites.
"""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.corrections.ai_corrector import AICorrector
from app.modules.exam_attempts.repository import ExamAttemptRepository
from app.modules.expression_tasks.repository import ExpressionTaskRepository
from app.modules.users.models import User
from app.modules.written_expressions.models import (
    CorrectionStatus,
    WrittenExpression,
    WrittenExpressionAICorrection,
    WrittenExpressionManualCorrection,
)
from app.modules.written_expressions.repository import (
    AICorrectionRepository,
    ManualCorrectionRepository,
    WrittenExpressionRepository,
)
from app.modules.written_expressions.schemas import (
    ManualCorrectionRequest,
    SubmitWrittenExpressionRequest,
)
from app.shared.enums import AttemptStatus, UserRole
from app.shared.exceptions.http import BadRequestException, ForbiddenException


class WrittenExpressionService:
    """Service pour la gestion des expressions écrites."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = WrittenExpressionRepository(db)
        self.ai_correction_repo = AICorrectionRepository(db)
        self.manual_correction_repo = ManualCorrectionRepository(db)
        self.attempt_repo = ExamAttemptRepository(db)
        self.task_repo = ExpressionTaskRepository(db)
    
    # === SOUMISSION EXPRESSION ===
    
    async def submit_expression(
        self,
        attempt_id: UUID,
        data: SubmitWrittenExpressionRequest,
        current_user: User
    ) -> WrittenExpression:
        """
        Soumettre une expression écrite.
        
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
        
        # Calculer le nombre de mots
        word_count = len(data.text_content.split())
        
        # Créer l'expression
        expression = await self.repo.create(
            attempt_id=attempt_id,
            task_id=data.task_id,
            text_content=data.text_content,
            word_count=word_count,
            submitted_at=datetime.now(timezone.utc),
            correction_status=CorrectionStatus.PENDING
        )
        
        return expression
    
    async def get_my_expressions(
        self,
        attempt_id: UUID,
        current_user: User
    ) -> list[WrittenExpression]:
        """
        Récupérer mes expressions écrites d'une tentative.
        
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
    ) -> WrittenExpression:
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
    
    # === CORRECTION IA ===
    async def request_ai_correction(
        self,
        expression_id: UUID,
        current_user: User
    ) -> WrittenExpressionAICorrection:
        """
        Demander une correction IA pour les 3 tâches d'expression écrite.
        
        Note: Bien que expression_id soit passé, on corrige les 3 tâches ensemble.
        
        Args:
            expression_id: UUID d'une des expressions (on récupère l'attempt)
            current_user: Utilisateur authentifié
            
        Returns:
            Correction IA créée
            
        Raises:
            BadRequestException: Si déjà corrigée ou pas 3 tâches
        """
        # Récupérer l'expression pour avoir l'attempt_id
        expression = await self.get_expression_by_id(expression_id, current_user)
        attempt_id = expression.attempt_id
        
        # Récupérer les 3 expressions AVEC leurs tasks chargées
        from sqlalchemy.orm import selectinload
        from sqlalchemy import select
        
        stmt = select(WrittenExpression).where(
            WrittenExpression.attempt_id == attempt_id
        ).options(selectinload(WrittenExpression.task))
        
        result = await self.db.execute(stmt)
        expressions = list(result.scalars().all())
        
        if len(expressions) != 3:
            raise BadRequestException(
                detail=f"Les 3 tâches doivent être soumises. Vous avez soumis {len(expressions)} tâche(s)."
            )
        
        # Maintenant on peut trier sans problème
        expressions = sorted(expressions, key=lambda e: e.task.task_number)
        
        # Vérifier qu'aucune n'a déjà de correction IA
        for expr in expressions:
            existing = await self.ai_correction_repo.get_by_expression(expr.id)
            if existing:
                raise BadRequestException(detail="Les tâches ont déjà une correction IA")
        
        # ✅ VÉRIFIER les crédits AVANT (sans consommer)
        from app.shared.utils.ai_credits import AICreditManager
        
        credit_manager = AICreditManager(self.db)
        
        # Vérifier qu'on a assez de crédits
        balance = await credit_manager.get_credits_balance(current_user.id)
        if balance["ai_correction_credits"] < 1:
            raise BadRequestException(
                detail="Crédits IA insuffisants. Vous avez besoin de 1 crédit pour corriger les 3 tâches."
            )

        # Générer le prompt combiné
        from app.modules.corrections.prompts import get_combined_correction_prompt
        
        prompt = get_combined_correction_prompt(
            task1_text=expressions[0].text_content,
            task1_instruction=expressions[0].task.instruction_text,
            task2_text=expressions[1].text_content,
            task2_instruction=expressions[1].task.instruction_text,
            task3_text=expressions[2].text_content,
            task3_instruction=expressions[2].task.instruction_text,
        )
        
        # ✅ Appeler l'IA (peut échouer)
        from app.modules.corrections.ai_corrector import AICorrectorFactory
        
        try:
            corrector = AICorrectorFactory.create()
            result = await corrector.correct_combined(prompt)
            
            # ✅ DEBUG: Afficher la réponse brute
            print("=" * 80)
            print("RÉPONSE BRUTE DE GEMINI:")
            print(result)
            print("=" * 80)
            
        except Exception as e:
            raise BadRequestException(
                detail=f"Erreur lors de la correction IA: {str(e)}"
            )
        
        # Parser le résultat JSON
        import json
        try:
            if isinstance(result, str):
                result = json.loads(result)
        except json.JSONDecodeError as e:
            # ❌ Échec du parsing → ne pas consommer de crédit
            raise BadRequestException(
                detail=f"Erreur de parsing de la réponse IA: {str(e)}"
            )

        # ✅ NOUVEAU: Valider la structure du JSON
        required_keys = ["global_assessment", "criteria_scores", "task_feedbacks", "corrections", "suggestions"]
        missing_keys = [key for key in required_keys if key not in result]

        if missing_keys:
            # ❌ Structure invalide → ne pas consommer de crédit
            raise BadRequestException(
                detail=f"Réponse IA invalide. Clés manquantes: {', '.join(missing_keys)}. "
                    f"Réponse reçue: {str(result)[:500]}"
            )

        # Valider task_feedbacks
        for i in range(1, 4):
            task_key = f"task{i}"
            if task_key not in result["task_feedbacks"]:
                raise BadRequestException(
                    detail=f"task_feedbacks.{task_key} manquant dans la réponse IA"
                )
            
            if "corrected_text" not in result["task_feedbacks"][task_key]:
                raise BadRequestException(
                    detail=f"corrected_text manquant pour {task_key}"
                )

        # Valider criteria_scores
        required_criteria = [
            "structure_score", "structure_feedback",
            "cohesion_score", "cohesion_feedback",
            "vocabulary_score", "vocabulary_feedback",
            "grammar_score", "grammar_feedback",
            "task_score", "task_feedback"
        ]

        missing_criteria = [key for key in required_criteria if key not in result["criteria_scores"]]
        if missing_criteria:
            raise BadRequestException(
                detail=f"Critères manquants: {', '.join(missing_criteria)}"
            )

        # Valider global_assessment
        if "overall_score" not in result["global_assessment"]:
            raise BadRequestException(detail="overall_score manquant")
        if "cecrl_level" not in result["global_assessment"]:
            raise BadRequestException(detail="cecrl_level manquant")
        if "appreciation" not in result["global_assessment"]:
            raise BadRequestException(detail="appreciation manquant")

        # ✅ SUCCÈS → Consommer le crédit MAINTENANT
        credit_result = await credit_manager.check_and_consume_credit(
            user_id=current_user.id,
            cost=1
        )
        
        # Sauvegarder la correction pour chaque tâche
        first_correction = None
        
        for i, expr in enumerate(expressions):
            task_key = f"task{i+1}"
            task_feedback = result["task_feedbacks"][task_key]
            
            correction = await self.ai_correction_repo.create(
                expression_id=expr.id,
                corrected_text=task_feedback["corrected_text"],
                structure_score=result["criteria_scores"]["structure_score"],
                structure_feedback=result["criteria_scores"]["structure_feedback"],
                cohesion_score=result["criteria_scores"]["cohesion_score"],
                cohesion_feedback=result["criteria_scores"]["cohesion_feedback"],
                vocabulary_score=result["criteria_scores"]["vocabulary_score"],
                vocabulary_feedback=result["criteria_scores"]["vocabulary_feedback"],
                grammar_score=result["criteria_scores"]["grammar_score"],
                grammar_feedback=result["criteria_scores"]["grammar_feedback"],
                task_score=result["criteria_scores"]["task_score"],
                task_feedback=result["criteria_scores"]["task_feedback"],
                overall_score=result["global_assessment"]["overall_score"],
                cecrl_level=result["global_assessment"]["cecrl_level"],
                appreciation=result["global_assessment"]["appreciation"],
                corrections_json={"corrections": result["corrections"]},
                suggestions_json={"suggestions": result["suggestions"]},
            )
            
            if i == 0:
                first_correction = correction
            
            # Mettre à jour le statut
            await self.repo.update(
                expr.id,
                correction_status=CorrectionStatus.CORRECTED_AI
            )
        
        # Notifier l'étudiant
        from app.modules.notifications.service import NotificationService

        notif_service = NotificationService(self.db)
        await notif_service.notify_correction_ready(
            user_id=current_user.id,
            expression_id=expression_id,
            expression_type="écrite"
        )
        
        # Notifier si crédits faibles
        if credit_result.get("notification_sent"):
            await notif_service.notify_credits_low(
                user_id=current_user.id,
                credits_remaining=credit_result["credits_remaining"]
            )
            
        return first_correction
    
    
    async def get_ai_correction(
        self,
        expression_id: UUID,
        current_user: User
    ) -> WrittenExpressionAICorrection | None:
        """
        Récupérer la correction IA d'une expression.
        
        Args:
            expression_id: UUID de l'expression
            current_user: Utilisateur authentifié
            
        Returns:
            Correction IA ou None
        """
        # Vérifier propriété
        await self.get_expression_by_id(expression_id, current_user)
        
        return await self.ai_correction_repo.get_by_expression(expression_id)
    
    # === CORRECTION MANUELLE ===
    
    async def create_manual_correction(
        self,
        expression_id: UUID,
        data: ManualCorrectionRequest,
        current_user: User
    ) -> WrittenExpressionManualCorrection:
        """
        Créer une correction manuelle (teacher/admin uniquement).
        
        Args:
            expression_id: UUID de l'expression
            data: Données de correction
            current_user: Utilisateur authentifié
            
        Returns:
            Correction manuelle créée
            
        Raises:
            ForbiddenException: Si pas teacher/admin
            BadRequestException: Si déjà corrigée
        """
        # Vérifier permissions
        if current_user.role not in [UserRole.PLATFORM_ADMIN, UserRole.TEACHER]:
            raise ForbiddenException(
                detail="Seuls les teachers et admins peuvent corriger manuellement"
            )
        
        # Vérifier qu'il n'y a pas déjà de correction manuelle
        existing = await self.manual_correction_repo.get_by_expression(expression_id)
        if existing:
            raise BadRequestException(detail="Cette expression a déjà une correction manuelle")
        
        # Vérifier que l'expression existe
        expression = await self.repo.get_by_id_or_404(expression_id)
        
        # Créer la correction
        correction = await self.manual_correction_repo.create(
            expression_id=expression_id,
            corrector_id=current_user.id,
            score=data.score,
            feedback=data.feedback,
            corrected_at=datetime.now(timezone.utc)
        )
        
        # Mettre à jour le statut
        await self.repo.update(
            expression_id,
            correction_status=CorrectionStatus.CORRECTED_MANUAL
        )
        
            # ✅ AJOUTER: Notifier l'étudiant
        from app.modules.notifications.service import NotificationService
        
        # Récupérer l'étudiant (propriétaire de l'expression)
        expression = await self.repo.get_by_id_or_404(expression_id)
        attempt = await self.attempt_repo.get_by_id_or_404(expression.attempt_id)
        
        notif_service = NotificationService(self.db)
        await notif_service.notify_correction_ready(
            user_id=attempt.user_id,  # Étudiant
            expression_id=expression_id,
            expression_type="écrite"
        )
        
        return correction
    
    async def get_manual_correction(
        self,
        expression_id: UUID,
        current_user: User
    ) -> WrittenExpressionManualCorrection | None:
        """
        Récupérer la correction manuelle d'une expression.
        
        Args:
            expression_id: UUID de l'expression
            current_user: Utilisateur authentifié
            
        Returns:
            Correction manuelle ou None
        """
        # Vérifier propriété
        await self.get_expression_by_id(expression_id, current_user)
        
        return await self.manual_correction_repo.get_by_expression(expression_id)
    
    async def update_manual_correction(
        self,
        expression_id: UUID,
        data: ManualCorrectionRequest,
        current_user: User
    ) -> WrittenExpressionManualCorrection:
        """
        Mettre à jour une correction manuelle.
        
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
        correction = await self.manual_correction_repo.get_by_expression(expression_id)
        if not correction:
            raise BadRequestException(detail="Aucune correction manuelle trouvée")
        
        # Mettre à jour
        update_data = data.model_dump(exclude_unset=True)
        update_data["corrected_at"] = datetime.now(timezone.utc)
        
        correction = await self.manual_correction_repo.update(
            correction.id,
            **update_data
        )
        
        return correction
    
    
    def _get_expression_cecrl_level(self, score: int) -> str:
        """
        Déterminer le niveau CECRL pour expression (score sur 20).
        
        Barème officiel TCF Canada:
        - 1:     A1
        - 2-3:   A2 (inférieur)
        - 4-5:   A2 (supérieur)
        - 6-9:   B1
        - 10-13: B2
        - 14-17: C1
        - 18-20: C2
        
        Args:
            score: Score sur 20
            
        Returns:
            Niveau CECRL
        """
        if score < 1:
            return "< A1"
        elif score == 1:
            return "A1"
        elif score <= 3:
            return "A2"
        elif score <= 5:
            return "A2+"
        elif score <= 9:
            return "B1"
        elif score <= 13:
            return "B2"
        elif score <= 17:
            return "C1"
        else:  # 18-20
            return "C2"