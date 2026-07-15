"""
Provider Claude (Anthropic) pour correction IA.
"""
import json
from typing import Any

import anthropic

from app.config import get_settings
from app.modules.corrections.ai_providers.base import AIProvider
from app.modules.corrections.prompts import get_correction_prompt

settings = get_settings()


class ClaudeProvider(AIProvider):
    """Provider Claude (Anthropic) - Premium."""

    def __init__(self):
        # TODO: confirmer que ANTHROPIC_API_KEY existe déjà sur Settings —
        # sinon ajouter le champ (même schéma que GEMINI_API_KEY).
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model_id = "claude-sonnet-4-6"
        # 4096 tronquait la réponse JSON en plein milieu (évaluation globale +
        # critères + corrections/suggestions pour 3 tâches, c'est verbeux) —
        # ce qui produisait un JSON invalide ("Unterminated string ...").
        # À ajuster encore si le contenu corrigé est particulièrement long.
        self.max_tokens = 8192

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

        try:
            response = await self.client.messages.create(
                model=self.model_id,
                max_tokens=self.max_tokens,
                messages=[{"role": "user", "content": prompt}],
            )

            # Parser la réponse
            return self._parse_response(response.content[0].text)

        except Exception as e:
            print(f"Erreur Claude API: {e}")

            error_msg = str(e)

            if "429" in error_msg or "rate_limit" in error_msg.lower():
                raise Exception("Quota Claude dépassé. Veuillez réessayer dans quelques minutes ou utiliser une autre clé API.")
            elif "401" in error_msg or "authentication" in error_msg.lower():
                raise Exception("Clé API Claude invalide. Vérifiez votre configuration.")
            else:
                raise Exception(f"Erreur Claude API: {error_msg[:200]}")

    def _parse_response(self, content: str) -> dict[str, Any]:
        """Parser la réponse JSON.

        Lève une exception explicite si le JSON est invalide plutôt que de
        renvoyer un dict rempli de None : un "succès" silencieux avec des
        scores/feedback tous à None est plus dangereux qu'un échec propre,
        puisque l'appelant (et le frontend) n'a aucun moyen de distinguer
        une vraie correction vide d'une réponse corrompue.
        """
        try:
            # Nettoyer le markdown si présent
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "").strip()
            elif content.startswith("```"):
                content = content.replace("```", "").strip()

            return json.loads(content.strip())

        except json.JSONDecodeError as e:
            print(f"Erreur parsing JSON: {e}")
            print(f"Contenu reçu: {content[:500]}")
            raise Exception(
                "Réponse Claude invalide ou tronquée (JSON incomplet) — "
                "probablement une réponse coupée par la limite de tokens. "
                f"Détail: {e}"
            ) from e

    async def correct_combined(self, prompt: str) -> dict[str, Any]:
        """Corriger les 3 tâches avec un prompt combiné."""
        try:
            response = await self.client.messages.create(
                model=self.model_id,
                max_tokens=self.max_tokens,
                messages=[{"role": "user", "content": prompt}],
            )
            return self._parse_response(response.content[0].text)
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "rate_limit" in error_msg.lower():
                raise Exception("Quota Claude dépassé. Veuillez réessayer dans quelques minutes.")
            elif "401" in error_msg or "authentication" in error_msg.lower():
                raise Exception("Clé API Claude invalide. Vérifiez votre configuration.")
            else:
                raise Exception(f"Erreur Claude API: {error_msg[:200]}")