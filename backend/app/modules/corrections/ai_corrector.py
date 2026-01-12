"""
Service de correction IA avec support multi-providers.
"""

import logging
from typing import Any

from app.config import get_settings
from app.modules.corrections.ai_providers.base import AIProvider
from app.modules.corrections.ai_providers.claude import ClaudeProvider
from app.modules.corrections.ai_providers.gemini import GeminiProvider
from app.modules.corrections.ai_providers.grok import GrokProvider

settings = get_settings()
logger = logging.getLogger(__name__)


class AICorrectorFactory:
    """Factory pour créer le bon provider IA."""
    
    @staticmethod
    def create() -> AIProvider:
        """
        Créer une instance du provider IA configuré.
        
        Returns:
            Instance du provider (Grok, Gemini ou Claude)
            
        Raises:
            ValueError: Si provider invalide
        """
        provider = settings.AI_PROVIDER.lower()
        
        if provider == "grok":
            logger.info("Using Grok (xAI) for AI correction")
            return GrokProvider()
        
        elif provider == "gemini":
            logger.info("Using Gemini (Google) for AI correction")
            return GeminiProvider()
        
        elif provider == "claude":
            logger.info("Using Claude (Anthropic) for AI correction")
            return ClaudeProvider()
        
        else:
            raise ValueError(
                f"Invalid AI_PROVIDER: {provider}. "
                f"Must be 'grok', 'gemini', or 'claude'"
            )


class AICorrector:
    """
    Service principal de correction IA.
    
    Utilise le provider configuré dans AI_PROVIDER.
    """
    
    def __init__(self):
        self.provider = AICorrectorFactory.create()
    
    async def correct_written_expression(
        self,
        text: str,
        task_instruction: str,
        word_count_min: int,
        word_count_max: int
    ) -> dict[str, Any]:
        """
        Corriger une expression écrite.
        
        Args:
            text: Texte à corriger
            task_instruction: Consigne de la tâche
            word_count_min: Nombre de mots minimum
            word_count_max: Nombre de mots maximum
            
        Returns:
            dict avec correction complète
            
        Raises:
            Exception: Si erreur lors de la correction
        """
        try:
            logger.info(f"Correcting text with {settings.AI_PROVIDER}")
            
            result = await self.provider.correct_text(
                text=text,
                task_instruction=task_instruction,
                word_count_min=word_count_min,
                word_count_max=word_count_max
            )
            
            logger.info(f"Correction completed successfully with {settings.AI_PROVIDER}")
            
            return result
        
        except Exception as e:
            logger.error(f"Error during AI correction with {settings.AI_PROVIDER}: {e}")
            raise