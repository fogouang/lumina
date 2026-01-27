"""
Service pour la gestion des séries et questions.
"""

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.questions.models import ComprehensionQuestion
from app.modules.questions.repository import QuestionRepository
from app.modules.questions.schemas import QuestionCreate, QuestionImportRequest, QuestionUpdate,QuestionBatchImageUpdate
from app.modules.series.models import Series
from app.modules.series.repository import SeriesRepository
from app.modules.series.schemas import SeriesCreate, SeriesUpdate
from app.modules.users.models import User
from app.shared.enums import QuestionType, UserRole
from app.shared.exceptions.http import BadRequestException, ForbiddenException, NotFoundException


class SeriesService:
    """Service pour la gestion des séries et questions."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.series_repo = SeriesRepository(db)
        self.question_repo = QuestionRepository(db)
    
    # === SERIES MANAGEMENT ===
    
    async def create_series(self, data: SeriesCreate, current_user: User) -> Series:
        """
        Créer une série (admin uniquement).
        
        Args:
            data: Données de création
            current_user: Utilisateur authentifié
            
        Returns:
            Série créée
            
        Raises:
            ForbiddenException: Si pas admin
            BadRequestException: Si numéro existe déjà
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des séries")
        
        # Vérifier que le numéro n'existe pas
        existing = await self.series_repo.find_by_number(data.number)
        if existing:
            raise BadRequestException(detail=f"La série n°{data.number} existe déjà")
        
        # Créer la série
        series = await self.series_repo.create(
            number=data.number,
            title=data.title,
            is_active=data.is_active,
            created_by_id=current_user.id
        )
        
        return series
    
    async def get_all_series(self, skip: int = 0, limit: int = 100) -> list[Series]:
        """Récupérer toutes les séries."""
        return await self.series_repo.get_all(skip=skip, limit=limit)
    
    async def get_active_series(self) -> list[Series]:
        """Récupérer les séries actives."""
        return await self.series_repo.get_active_series()
    
    async def get_series_by_id(self, series_id: UUID) -> Series:
        """
        Récupérer une série par ID.
        
        Args:
            series_id: UUID de la série
            
        Returns:
            Série
        """
        return await self.series_repo.get_by_id_or_404(series_id)
    
    async def update_series(
        self,
        series_id: UUID,
        data: SeriesUpdate,
        current_user: User
    ) -> Series:
        """
        Mettre à jour une série (admin uniquement).
        
        Args:
            series_id: UUID de la série
            data: Données de mise à jour
            current_user: Utilisateur authentifié
            
        Returns:
            Série mise à jour
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent modifier des séries")
        
        # Mettre à jour
        update_data = data.model_dump(exclude_unset=True)
        series = await self.series_repo.update(series_id, **update_data)
        
        return series
    
    async def delete_series(self, series_id: UUID, current_user: User) -> bool:
        """
        Supprimer une série (admin uniquement).
        
        Args:
            series_id: UUID de la série
            current_user: Utilisateur authentifié
            
        Returns:
            True si supprimé
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des séries")
        
        # Supprimer (cascade sur les questions)
        return await self.series_repo.delete(series_id)
    
    # === QUESTIONS MANAGEMENT ===
    
    async def create_question(
        self,
        data: QuestionCreate,
        current_user: User
    ) -> ComprehensionQuestion:
        """
        Créer une question manuellement (admin uniquement).
        
        Args:
            data: Données de la question
            current_user: Utilisateur authentifié
            
        Returns:
            Question créée
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent créer des questions")
        
        # Vérifier que la série existe
        await self.get_series_by_id(data.series_id)
        
        # Créer la question
        question = await self.question_repo.create(
            series_id=data.series_id,
            question_number=data.question_number,
            type=data.type,
            question_text=data.question_text,
            asked_question=data.asked_question,
            image_url=data.image_url,
            audio_url=data.audio_url,
            option_a=data.option_a,
            option_b=data.option_b,
            option_c=data.option_c,
            option_d=data.option_d,
            correct_answer=data.correct_answer,
            explanation=data.explanation,
            points=data.points
        )
        
        return question
    
    async def get_questions_by_series(self, series_id: UUID) -> list[ComprehensionQuestion]:
        """
        Récupérer toutes les questions d'une série.
        
        Args:
            series_id: UUID de la série
            
        Returns:
            Liste de questions
        """
        # Vérifier que la série existe
        await self.get_series_by_id(series_id)
        
        return await self.question_repo.get_by_series(series_id)
    
    async def update_question(
        self,
        question_id: UUID,
        data: QuestionUpdate,
        current_user: User
    ) -> ComprehensionQuestion:
        """
        Mettre à jour une question (admin uniquement).
        
        Args:
            question_id: UUID de la question
            data: Données de mise à jour
            current_user: Utilisateur authentifié
            
        Returns:
            Question mise à jour
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent modifier des questions")
        
        # Mettre à jour
        update_data = data.model_dump(exclude_unset=True)
        question = await self.question_repo.update(question_id, **update_data)
        
        return question
    
    async def delete_question(self, question_id: UUID, current_user: User) -> bool:
        """
        Supprimer une question (admin uniquement).
        
        Args:
            question_id: UUID de la question
            current_user: Utilisateur authentifié
            
        Returns:
            True si supprimé
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent supprimer des questions")
        
        return await self.question_repo.delete(question_id)
      
      
    # === IMPORT JSON ===    
    async def import_comprehension_questions(
        self,
        series_id: UUID,
        data: QuestionImportRequest,
        question_type: QuestionType,
        current_user: User
    ) -> dict:
        """
        Importer des questions depuis JSON.
        
        Args:
            series_id: UUID de la série
            data: Données JSON
            question_type: Type de questions (oral/written)
            current_user: Utilisateur authentifié
            
        Returns:
            dict avec statistiques d'import
        """
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent importer des questions")
        
        # Vérifier que la série existe
        await self.get_series_by_id(series_id)
        
        created_count = 0
        skipped_count = 0
        errors = []
        
        for item in data.questions:
            try:
                # Extraire la réponse correcte
                correct_answer = None
                options = {
                    "a": self._parse_option(item.proposition_1),
                    "b": self._parse_option(item.proposition_2),
                    "c": self._parse_option(item.proposition_3),
                    "d": self._parse_option(item.proposition_4)
                }
                
                for key, (text, is_correct) in options.items():
                    if is_correct:
                        correct_answer = key
                        break
                
                if not correct_answer:
                    errors.append(f"Q{item.QuestionNumber}: Aucune réponse correcte trouvée")
                    skipped_count += 1
                    continue
                
                # Déterminer les points selon le numéro de question
                points = self._calculate_points(item.QuestionNumber)
                
                # ✅ TRAITEMENT DIFFÉRENCIÉ ORAL vs ÉCRIT
                if question_type == QuestionType.ORAL:
                    # CO: Pas de bodyText/askedQuestion (tout est dans l'audio)
                    question_text = None
                    asked_question = None
                else:
                    # CE: Nettoyer bodyText et askedQuestion
                    body_text_raw = item.bodyText.strip() if item.bodyText else None
                    asked_question_raw = item.askedQuestion.strip() if item.askedQuestion else None
                    
                    # ✅ NETTOYER: Retirer asked_question du bodyText s'il est présent
                    if body_text_raw and asked_question_raw:
                        if asked_question_raw in body_text_raw:
                            # Retirer la question de la fin du bodyText
                            body_text_raw = body_text_raw.replace(asked_question_raw, "").strip()
                            # Nettoyer les doubles sauts de ligne et espaces
                            body_text_raw = body_text_raw.rstrip("\n").strip()
                    
                    question_text = body_text_raw
                    asked_question = asked_question_raw
                
                # Créer la question
                await self.question_repo.create(
                    series_id=series_id,
                    question_number=item.QuestionNumber,
                    type=question_type,
                    question_text=question_text,
                    asked_question=asked_question,
                    image_url=item.image if item.image else None,
                    audio_url=item.audio if item.audio else None,
                    option_a=options["a"][0],
                    option_b=options["b"][0],
                    option_c=options["c"][0],
                    option_d=options["d"][0],
                    correct_answer=correct_answer,
                    explanation=None,
                    points=points
                )
                
                created_count += 1
            
            except Exception as e:
                errors.append(f"Q{item.QuestionNumber}: {str(e)}")
                skipped_count += 1
        
        return {
            "created": created_count,
            "skipped": skipped_count,
            "errors": errors
        }
    
    
    def _parse_option(self, proposition: str) -> tuple[str, bool]:
        """
        Parser une proposition (ex: "Texte-True" ou "Texte-False").
        
        Args:
            proposition: Proposition à parser
            
        Returns:
            tuple (texte, is_correct)
        """
        if "-True" in proposition:
            return proposition.replace("-True", "").strip(), True
        elif "-False" in proposition:
            return proposition.replace("-False", "").strip(), False
        else:
            # Si pas de suffixe, considérer comme faux
            return proposition.strip(), False
    
    def _calculate_points(self, question_number: int) -> int:
        """
        Calculer les points selon le barème TCF Canada.
        
        Le barème se répète tous les 39 questions:
        - ORAL: questions 1-39
        - WRITTEN: questions 40-78 (traité comme 1-39)
        
        Barème:
        - Q1-4: 3 points
        - Q5-10: 9 points
        - Q11-19: 15 points
        - Q20-29: 21 points
        - Q30-35: 26 points
        - Q36-39: 33 points
        
        Args:
            question_number: Numéro de question (1-78)
            
        Returns:
            Points selon le barème
        """
        # ✅ Normaliser pour que 40-78 devienne 1-39
        normalized = ((question_number - 1) % 39) + 1
        
        if normalized <= 4:
            return 3
        elif normalized <= 10:
            return 9
        elif normalized <= 19:
            return 15
        elif normalized <= 29:
            return 21
        elif normalized <= 35:
            return 26
        else:
            return 33
        
    
    async def batch_update_question_images(
        self,
        data: QuestionBatchImageUpdate,
        current_user: User
    ) -> dict:
        """Mettre à jour les images des questions en batch."""
        
        # Vérifier permissions
        if current_user.role != UserRole.PLATFORM_ADMIN:
            raise ForbiddenException(detail="Seuls les admins peuvent mettre à jour les images")
        
        # Vérifier que la série existe
        await self.get_series_by_id(data.series_id)
        
        # Récupérer toutes les questions
        questions = await self.question_repo.get_by_series_and_type(
            data.series_id, 
            data.question_type
        )
        
        # Créer un mapping question_number → question_id
        question_map = {q.question_number: q.id for q in questions}
        
        updated_count = 0
        skipped_count = 0
        errors = []
        
        # ✅ Convertir les clés string en int
        for question_number_str, image_url in data.images.items():
            try:
                question_number = int(question_number_str)  # Conversion explicite
                
                if question_number not in question_map:
                    errors.append(f"Q{question_number}: Question non trouvée dans la série")
                    skipped_count += 1
                    continue
                
                question_id = question_map[question_number]
                
                # Mettre à jour l'image
                await self.question_repo.update(
                    question_id,
                    image_url=image_url
                )
                
                updated_count += 1
                
            except ValueError:
                errors.append(f"'{question_number_str}': Numéro invalide")
                skipped_count += 1
            except Exception as e:
                errors.append(f"Q{question_number_str}: {str(e)}")
                skipped_count += 1
        
        return {
            "updated": updated_count,
            "skipped": skipped_count,
            "errors": errors
        }