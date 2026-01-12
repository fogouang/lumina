"""
Interface de base pour les providers IA.
"""

from abc import ABC, abstractmethod
from typing import Any


class AIProvider(ABC):
    """Interface abstraite pour les providers IA."""
    
    @abstractmethod
    async def correct_text(
        self,
        text: str,
        task_instruction: str,
        word_count_min: int,
        word_count_max: int
    ) -> dict[str, Any]:
        """
        Corriger un texte.
        
        Args:
            text: Texte à corriger
            task_instruction: Consigne de la tâche
            word_count_min: Nombre de mots minimum
            word_count_max: Nombre de mots maximum
            
        Returns:
            dict avec correction complète
        """
        pass
    
    # Dans ai_providers/base.py
    async def correct_combined(self, prompt: str) -> dict:
        """Corriger avec un prompt custom."""
        return await self.correct_text(prompt, "", 0, 9999)