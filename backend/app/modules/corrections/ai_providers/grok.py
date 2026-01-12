"""
Provider Grok (xAI) pour correction IA.
"""

import json
from typing import Any

import httpx

from app.config import get_settings
from app.modules.corrections.ai_providers.base import AIProvider
from app.modules.corrections.prompts import get_correction_prompt

settings = get_settings()


class GrokProvider(AIProvider):
    """Provider Grok (xAI) - Gratuit."""
    
    def __init__(self):
        self.api_key = settings.GROK_API_KEY
        self.base_url = settings.GROK_BASE_URL
    
    async def correct_text(
        self,
        text: str,
        task_instruction: str,
        word_count_min: int,
        word_count_max: int
    ) -> dict[str, Any]:
        """Corriger avec Grok."""
        
        # Construire le prompt
        prompt = get_correction_prompt(
            text=text,
            task_instruction=task_instruction,
            word_count_min=word_count_min,
            word_count_max=word_count_max
        )
        
        # Appeler l'API Grok
        url = f"{self.base_url}/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "grok-beta",
            "messages": [
                {"role": "system", "content": "Tu es un correcteur expert du TCF Canada."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Parser la réponse JSON
            return self._parse_response(content)
    
    def _parse_response(self, content: str) -> dict[str, Any]:
        """Parser la réponse JSON du modèle."""
        try:
            # Nettoyer les balises markdown si présentes
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            return json.loads(content.strip())
        
        except json.JSONDecodeError:
            # Fallback si parsing échoue
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