"""
Service pour la gestion des tentatives d'examen.
"""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession


from app.modules.exam_attempts.models import ExamAttempt
from app.modules.exam_attempts.repository import ExamAttemptRepository
from app.modules.exam_attempts.schemas import (
    ExamAttemptCreate,
    SubmitAnswerRequest,
    SubmitOralExpressionRequest,
    SubmitWrittenExpressionRequest,
)
from app.modules.questions.models import ComprehensionQuestion
from app.modules.questions.repository import QuestionRepository
from app.modules.series.repository import SeriesRepository
from app.modules.subscriptions.repository import SubscriptionRepository
from app.modules.users.models import User
from app.shared.enums import AttemptStatus, SelectedAnswer
from app.shared.exceptions.http import BadRequestException, ForbiddenException, NotFoundException
from app.modules.comprehension_answers.repository import ComprehensionAnswerRepository
from app.modules.comprehension_answers.models import ComprehensionAnswer
from app.shared.enums.questions import QuestionType


class ExamAttemptService:
    """Service pour la gestion des tentatives d'examen."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ExamAttemptRepository(db)
        self.answer_repo = ComprehensionAnswerRepository(db)
        self.series_repo = SeriesRepository(db)
        self.question_repo = QuestionRepository(db)
        self.subscription_repo = SubscriptionRepository(db)
    
    # === EXAM ATTEMPTS ===
    
    async def start_exam(
        self,
        data: ExamAttemptCreate,
        current_user: User
    ) -> ExamAttempt:
        """
        Démarrer une tentative d'examen.
        
        Args:
            data: Données de création
            current_user: Utilisateur authentifié
            
        Returns:
            Tentative créée
            
        Raises:
            BadRequestException: Si série invalide ou tentative en cours
            ForbiddenException: Si pas de souscription active
        """
        # Vérifier que la série existe et est active
        series = await self.series_repo.get_by_id_or_404(data.series_id)
        if not series.is_active:
            raise BadRequestException(detail="Cette série n'est pas active")
        
        # Vérifier l'accès à la série
        from app.shared.utils.series_access import SeriesAccessManager
        
        access_manager = SeriesAccessManager(self.db)
        await access_manager.check_series_access(
            user_id=current_user.id,
            series_id=data.series_id
        )
        
        # Vérifier qu'il n'y a pas déjà une tentative en cours
        active_attempt = await self.repo.get_active_attempt(
            current_user.id,
            data.series_id
        )
        if active_attempt:
            raise BadRequestException(
                detail="Vous avez déjà une tentative en cours pour cette série"
            )
        
        # Vérifier que l'utilisateur a une souscription active
        # subscriptions = await self.subscription_repo.get_active_by_user(current_user.id)
        # if not subscriptions:
        #     raise ForbiddenException(
        #         detail="Vous devez avoir une souscription active pour passer un examen"
        #     )
        
        # Créer la tentative
        attempt = await self.repo.create(
            user_id=current_user.id,
            series_id=data.series_id,
            started_at=datetime.now(timezone.utc),
            status=AttemptStatus.IN_PROGRESS
        )
        
        return attempt
    
    async def get_my_attempts(self, current_user: User) -> list[ExamAttempt]:
        """
        Récupérer toutes les tentatives de l'utilisateur courant.
        
        Args:
            current_user: Utilisateur authentifié
            
        Returns:
            Liste de tentatives
        """
        return await self.repo.get_by_user_with_series(current_user.id)
    
    async def get_attempt_by_id(
        self,
        attempt_id: UUID,
        current_user: User
    ) -> ExamAttempt:
        """
        Récupérer une tentative par ID.
        
        Args:
            attempt_id: UUID de la tentative
            current_user: Utilisateur authentifié
            
        Returns:
            Tentative
            
        Raises:
            ForbiddenException: Si pas propriétaire
        """
        attempt = await self.repo.get_by_id_or_404(attempt_id)
        
        # Vérifier que c'est bien la tentative de l'utilisateur
        if attempt.user_id != current_user.id:
            raise ForbiddenException(detail="Cette tentative ne vous appartient pas")
        
        return attempt
    
    async def complete_exam(
        self,
        attempt_id: UUID,
        current_user: User
    ) -> dict:
        """
        Terminer un examen (calculer les scores).
        
        Args:
            attempt_id: UUID de la tentative
            current_user: Utilisateur authentifié
            
        Returns:
            Tentative complétée
            
        Raises:
            BadRequestException: Si déjà complété
        """
        attempt = await self.get_attempt_by_id(attempt_id, current_user)
        
        # Vérifier que la tentative est en cours
        if attempt.status != AttemptStatus.IN_PROGRESS:
            raise BadRequestException(detail="Cette tentative est déjà terminée")
        
        # Calculer les scores de compréhension
        await self._calculate_comprehension_scores(attempt_id)
        
        # Marquer comme complété
        attempt = await self.repo.update(
            attempt_id,
            completed_at=datetime.now(timezone.utc),
            status=AttemptStatus.COMPLETED
        )
        
        # RECHARGER l'attempt pour avoir oral_score et written_score
        attempt = await self.repo.get_by_id_or_404(attempt_id)
        
        from app.modules.comprehension_answers.repository import ComprehensionResultRepository
        result_repo = ComprehensionResultRepository(self.db)
        results = await result_repo.get_by_attempt(attempt_id)
        
        # Extraire les scores
        oral_score = next((r.score for r in results if r.type == QuestionType.ORAL), None)
        written_score = next((r.score for r in results if r.type == QuestionType.WRITTEN), None)
    
        return {
            "id": attempt.id,
            "user_id": attempt.user_id,
            "series_id": attempt.series_id,
            "started_at": attempt.started_at,
            "completed_at": attempt.completed_at,
            "status": attempt.status,
            "oral_score": oral_score,
            "written_score": written_score,
        }
    
    # === COMPREHENSION ANSWERS ===
    
    async def submit_answer(
        self,
        attempt_id: UUID,
        data: SubmitAnswerRequest,
        current_user: User
    ) -> dict:
        """
        Soumettre une réponse à une question de compréhension.
        
        Args:
            attempt_id: UUID de la tentative
            data: Données de la réponse
            current_user: Utilisateur authentifié
            
        Returns:
            dict avec answer_id, is_correct, points_earned
            
        Raises:
            BadRequestException: Si déjà répondu ou tentative terminée
        """
        # Vérifier la tentative
        attempt = await self.get_attempt_by_id(attempt_id, current_user)
        
        if attempt.status != AttemptStatus.IN_PROGRESS:
            raise BadRequestException(detail="Cette tentative est terminée")
        
        # Vérifier que la question existe et appartient à la série
        question = await self.question_repo.get_by_id_or_404(data.question_id)
        
        if question.series_id != attempt.series_id:
            raise BadRequestException(
                detail="Cette question n'appartient pas à la série de cette tentative"
            )
        
        # Vérifier qu'on n'a pas déjà répondu
        existing = await self.answer_repo.find_by_attempt_and_question(
            attempt_id,
            data.question_id
        )
        
        
        # Valider la réponse
        is_correct = data.selected_answer == question.correct_answer.value
        points_earned = question.points if is_correct else 0
        
        if existing:
            # METTRE À JOUR au lieu de refuser
            answer = await self.answer_repo.update(
                existing.id,
                selected_answer=SelectedAnswer(data.selected_answer).value,
                is_correct=is_correct,
                points_earned=points_earned,
                answered_at=datetime.now(timezone.utc)
            )
        else:
            # Créer nouvelle réponse
            answer = await self.answer_repo.create(
                attempt_id=attempt_id,
                question_id=data.question_id,
                selected_answer=SelectedAnswer(data.selected_answer).value,
                is_correct=is_correct,
                points_earned=points_earned,
                answered_at=datetime.now(timezone.utc)
            )
        
        return {
            "answer_id": answer.id,
            "is_correct": is_correct,
            "points_earned": points_earned,
            "correct_answer": None  # Masqué pour l'instant
        }
    
    async def get_my_answers(
        self,
        attempt_id: UUID,
        current_user: User
    ) -> list[ComprehensionAnswer]:
        """
        Récupérer toutes les réponses d'une tentative.
        
        Args:
            attempt_id: UUID de la tentative
            current_user: Utilisateur authentifié
            
        Returns:
            Liste de réponses
        """
        # Vérifier que c'est bien la tentative de l'utilisateur
        await self.get_attempt_by_id(attempt_id, current_user)
        
        return await self.answer_repo.get_by_attempt(attempt_id)
    
    # === EXPRESSIONS ===
    
    async def submit_written_expression(
        self,
        attempt_id: UUID,
        data: SubmitWrittenExpressionRequest,
        current_user: User
        ) -> dict:
        """
        Soumettre une expression écrite.
        
        Délègue au WrittenExpressionService.
        """
        from app.modules.written_expressions.service import WrittenExpressionService
        
        service = WrittenExpressionService(self.db)
        expression = await service.submit_expression(attempt_id, data, current_user)
        
        return {
            "submission_id": expression.id,
            "task_id": expression.task_id,
            "status": "submitted"
        }
    
    async def submit_oral_expression(
        self,
        attempt_id: UUID,
        data: SubmitOralExpressionRequest,
        current_user: User
        ) -> dict:
        """
        Soumettre une expression orale.
        
        Délègue au OralExpressionService.
        """
        from app.modules.oral_expressions.service import OralExpressionService
        
        service = OralExpressionService(self.db)
        expression = await service.submit_expression(attempt_id, data, current_user)
        
        return {
            "submission_id": expression.id,
            "task_id": expression.task_id,
            "status": "submitted"
        }
    
    # === PRIVATE METHODS ===
    
    async def _calculate_comprehension_scores(self, attempt_id: UUID):
        """
        Calculer les scores de compréhension par accumulation de points.
        
        Système TCF Canada (à partir du 11 décembre 2023):
        - Chaque question a un poids différent selon sa position
        - Score = somme des points des questions correctes
        - Score max = 699 points par section
        
        Barème de conversion CECRL:
        - 100-199: A1
        - 200-259: A2 (inférieur)
        - 260-299: A2 (supérieur)
        - 300-399: B1
        - 400-499: B2
        - 500-599: C1
        - 600-699: C2
        """
        from app.modules.comprehension_answers.repository import ComprehensionAnswerRepository
        from app.modules.questions.repository import QuestionRepository
        from app.shared.enums import QuestionType
        
        answer_repo = ComprehensionAnswerRepository(self.db)
        question_repo = QuestionRepository(self.db)
        
        # Récupérer toutes les réponses de la tentative
        answers = await answer_repo.get_by_attempt(attempt_id)
        
        # Calculer les points par section
        oral_points = 0
        oral_correct = 0
        oral_total = 0
        
        written_points = 0
        written_correct = 0
        written_total = 0
        
        for answer in answers:
            # Récupérer la question pour connaître le type
            question = await question_repo.get_by_id_or_404(answer.question_id)
            
            if question.type == QuestionType.ORAL:
                oral_total += 1
                if answer.is_correct:
                    oral_correct += 1
                    oral_points += answer.points_earned
            
            elif question.type == QuestionType.WRITTEN:
                written_total += 1
                if answer.is_correct:
                    written_correct += 1
                    written_points += answer.points_earned
        
        # Créer les résultats
        from app.modules.comprehension_answers.repository import ComprehensionResultRepository
        result_repo = ComprehensionResultRepository(self.db)
        
        # Calculer les niveaux CECRL
        oral_level = self._get_cecrl_level(oral_points)
        written_level = self._get_cecrl_level(written_points)
        
        # Résultat oral
        await result_repo.create(
            attempt_id=attempt_id,
            type=QuestionType.ORAL,
            score=oral_points,
            correct_count=oral_correct,
            total_questions=oral_total
        )
        
        # Résultat écrit
        await result_repo.create(
            attempt_id=attempt_id,
            type=QuestionType.WRITTEN,
            score=written_points,
            correct_count=written_correct,
            total_questions=written_total
        )
        
        # Mettre à jour l'attempt avec les scores
        await self.repo.update(
            attempt_id,
            oral_score=oral_points,
            written_score=written_points
        )
        
        print(f"DEBUG: Scores calculés - Oral: {oral_points}, Written: {written_points}")
        
        return {
            "oral_score": oral_points,
            "oral_level": oral_level,
            "oral_correct": f"{oral_correct}/{oral_total}",
            "written_score": written_points,
            "written_level": written_level,
            "written_correct": f"{written_correct}/{written_total}"
        }


    def _get_cecrl_level(self, score: int) -> str:
        """
        Déterminer le niveau CECRL selon le barème officiel TCF Canada.
        
        Args:
            score: Score sur 699
            
        Returns:
            Niveau CECRL
        """
        if score < 100:
            return "< A1"
        elif score <= 199:
            return "A1"
        elif score <= 259:
            return "A2"
        elif score <= 299:
            return "A2+"
        elif score <= 399:
            return "B1"
        elif score <= 499:
            return "B2"
        elif score <= 599:
            return "C1"
        else:
            return "C2"