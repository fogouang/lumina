"""
Provider Gemini (Google) pour correction IA.
"""
import json
from typing import Any

from google import genai

from app.config import get_settings
from app.modules.corrections.ai_providers.base import AIProvider
from app.modules.corrections.prompts import get_correction_prompt

settings = get_settings()


class GeminiProvider(AIProvider):
    """Provider Gemini (Google) - Gratuit."""
    
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_id = "gemini-2.5-flash"
    
    async def correct_text(
        self,
        text: str,
        task_instruction: str,
        word_count_min: int,
        word_count_max: int
    ) -> dict[str, Any]:
        """Corriger avec Gemini."""
        
        # Construire le prompt
        prompt = get_correction_prompt(
            text=text,
            task_instruction=task_instruction,
            word_count_min=word_count_min,
            word_count_max=word_count_max
        )
        
        try:
            # ✅ Appel API correct pour version 1.59.0
            response = await self.client.aio.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            
            # Parser la réponse
            return self._parse_response(response.text)
            
        except Exception as e:
            print(f"Erreur Gemini API: {e}")
            
            # ✅ NOUVEAU: Re-raise l'erreur au lieu de retourner un dict vide
            error_msg = str(e)
            
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                raise Exception("Quota Gemini dépassé. Veuillez réessayer dans quelques minutes ou utiliser une autre clé API.")
            elif "401" in error_msg or "INVALID_API_KEY" in error_msg:
                raise Exception("Clé API Gemini invalide. Vérifiez votre configuration.")
            else:
                raise Exception(f"Erreur Gemini API: {error_msg[:200]}")
    
    def _parse_response(self, content: str) -> dict[str, Any]:
        """Parser la réponse JSON."""
        try:
            # Nettoyer le markdown si présent
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            
            return json.loads(content.strip())
        
        except json.JSONDecodeError as e:
            print(f"Erreur parsing JSON: {e}")
            print(f"Contenu reçu: {content[:500]}")
            
            return {
                "corrected_text": content,
                "structure_score": None,
                "structure_feedback": "Erreur de parsing JSON",
                "cohesion_score": None,
                "cohesion_feedback": None,
                "vocabulary_score": None,
                "vocabulary_feedback": None,
                "grammar_score": None,
                "grammar_feedback": None,
                "task_score": None,
                "task_feedback": None,
                "overall_score": None,
                "cecrl_level": None,
                "appreciation": None,
                "corrections": [],
                "suggestions": []
            }