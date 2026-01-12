"""
Provider Claude (Anthropic) pour correction IA.
"""

import json
from typing import Any

from anthropic import AsyncAnthropic

from app.config import get_settings
from app.modules.corrections.ai_providers.base import AIProvider
from app.modules.corrections.prompts import get_correction_prompt

settings = get_settings()


class ClaudeProvider(AIProvider):
    """Provider Claude (Anthropic) - Payant mais meilleur."""
    
    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    async def correct_text(
        self,
        text: str,
        task_instruction: str,
        word_count_min: int,
        word_count_max: int
    ) -> dict[str, Any]:
        """Corriger avec Claude."""
        
        # Construire le prompt
        prompt = get_correction_prompt(
            text=text,
            task_instruction=task_instruction,
            word_count_min=word_count_min,
            word_count_max=word_count_max
        )
        
        # Appeler Claude
        response = await self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            temperature=0.3,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        content = response.content[0].text
        
        # Parser la réponse
        return self._parse_response(content)
    
    def _parse_response(self, content: str) -> dict[str, Any]:
        """Parser la réponse JSON."""
        try:
            # Nettoyer les balises markdown
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
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