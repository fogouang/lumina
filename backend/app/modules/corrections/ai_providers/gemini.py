"""
Provider Gemini (Google) pour correction IA.
"""

import json
from typing import Any

import google.generativeai as genai

from app.config import get_settings
from app.modules.corrections.ai_providers.base import AIProvider
from app.modules.corrections.prompts import get_correction_prompt

settings = get_settings()


class GeminiProvider(AIProvider):
    """Provider Gemini (Google) - Gratuit."""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-2.5-flash")
    
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
        
        # Appeler Gemini
        response = await self.model.generate_content_async(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.3,
                response_mime_type="application/json"
            )
        )
        
        # Parser la réponse
        return self._parse_response(response.text)
    
    def _parse_response(self, content: str) -> dict[str, Any]:
        """Parser la réponse JSON."""
        try:
            return json.loads(content.strip())
        
        except json.JSONDecodeError:
            return {
                "corrected_text": content,
                "linguistic_score": None,
                "linguistic_feedback": "Erreur de parsing",
                "pragmatic_score": None,
                "pragmatic_feedback": None,
                "sociolinguistic_score": None,
                "sociolinguistic_feedback": None,
                "overall_score": None,
                "cecrl_level": None,
                "appreciation": None,
                "corrections": [],
                "suggestions": []
            }