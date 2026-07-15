"""
expression_orale.live_client
===============================
Une session EO = une connexion WebSocket Gemini Live, ouverte une seule
fois pour toute la durée de la tâche (pas de réouverture en cours de
route comme sur GoToGermany — chaque tâche TCF a un seul rôle fixe du
début à la fin, donc un seul segment). Gemini uniquement — pas de
fallback vers un autre provider.

IMPORTANT — non testable en réseau dans cet environnement (pas d'accès
à generativelanguage.googleapis.com depuis ce sandbox). Logique de
construction des messages / parsing des événements validée par la
structure connue de l'API, mais à re-vérifier contre la doc à jour au
moment de l'intégration réelle — ce protocole évolue et le nom de
modèle bouge vite : https://ai.google.dev/api/live
"""

from __future__ import annotations

import asyncio
import base64
import json
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncIterator, Literal

import websockets

GEMINI_WS_URL = (
    "wss://generativelanguage.googleapis.com/ws/"
    "google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent"
)
# Confirmé comme nom de modèle réel et actuel (doc officielle Google,
# distingue Gemini 3.1 Flash Live Preview de Gemini 2.5 Flash Live Preview).
GEMINI_MODEL = "gemini-3.1-flash-live-preview"

DEFAULT_HANDSHAKE_TIMEOUT_SECONDS = 20.0  # temporairement élevé pour diagnostiquer (était 5.0)

GEMINI_INPUT_SAMPLE_RATE = 16000


class LiveConnectionError(Exception):
    """Levée sur un handshake raté avec l'un ou l'autre provider — le
    signal que open_segment() utilise pour décider du fallback."""


@dataclass
class LiveServerEvent:
    type: Literal["text_delta", "audio_delta", "turn_complete", "interrupted", "error"]
    speaker: Literal["candidat", "examinateur"] | None = None
    text: str | None = None
    audio_bytes: bytes | None = None
    error_message: str | None = None


class LiveSegment(ABC):
    provider: str

    @abstractmethod
    async def send_audio_chunk(self, pcm16_bytes: bytes) -> None:
        """Envoie un chunk d'audio micro brut (PCM16) au provider."""

    @abstractmethod
    async def trigger_agent_turn(self) -> None:
        """Force l'IA à parler en premier, sans audio étudiant préalable
        (les deux providers attendent une entrée avant de répondre par
        défaut — nécessaire pour les Tâches 1 et 3 où l'IA ouvre)."""

    @abstractmethod
    def events(self) -> AsyncIterator[LiveServerEvent]:
        """Événements serveur au fil de l'eau — audio à jouer, deltas de
        transcript, signaux de fin de tour/interruption."""

    @abstractmethod
    async def close(self) -> None:
        """Ferme la connexion WebSocket sous-jacente."""


# ---------------------------------------------------------------------------
# Gemini Live
# ---------------------------------------------------------------------------

class GeminiLiveSegment(LiveSegment):
    provider = "gemini"

    def __init__(self, websocket) -> None:
        self._ws = websocket

    @classmethod
    async def open(
        cls,
        system_prompt: str,
        *,
        api_key: str,
        timeout_seconds: float = DEFAULT_HANDSHAKE_TIMEOUT_SECONDS,
    ) -> "GeminiLiveSegment":
        url = f"{GEMINI_WS_URL}?key={api_key}"
        try:
            ws = await asyncio.wait_for(websockets.connect(url), timeout=timeout_seconds)
        except Exception as exc:  # noqa: BLE001
            raise LiveConnectionError(f"Gemini Live connect failed: {exc}") from exc

        setup_message = {
            "setup": {
                "model": f"models/{GEMINI_MODEL}",
                "generationConfig": {"responseModalities": ["AUDIO"]},
                "systemInstruction": {"parts": [{"text": system_prompt}]},
                "outputAudioTranscription": {},
                "inputAudioTranscription": {},
            }
        }
        await ws.send(json.dumps(setup_message))

        try:
            first_raw = await asyncio.wait_for(ws.recv(), timeout=timeout_seconds)
        except Exception as exc:  # noqa: BLE001
            await ws.close()
            raise LiveConnectionError(f"Gemini Live setup handshake timed out: {exc}") from exc

        first = json.loads(first_raw)
        if "setupComplete" not in first:
            await ws.close()
            raise LiveConnectionError(f"Gemini Live setup failed: unexpected first message {first!r}")

        return cls(ws)

    async def send_audio_chunk(self, pcm16_bytes: bytes) -> None:
        message = {
            "realtimeInput": {
                "audio": {
                    "data": base64.b64encode(pcm16_bytes).decode("ascii"),
                    "mimeType": f"audio/pcm;rate={GEMINI_INPUT_SAMPLE_RATE}",
                }
            }
        }
        await self._ws.send(json.dumps(message))

    async def trigger_agent_turn(self) -> None:
        message = {
            "clientContent": {
                "turns": [{"role": "user", "parts": [{"text": "(Merci de commencer maintenant.)"}]}],
                "turnComplete": True,
            }
        }
        await self._ws.send(json.dumps(message))

    async def events(self) -> AsyncIterator[LiveServerEvent]:
        async for raw in self._ws:
            msg = json.loads(raw)
            server_content = msg.get("serverContent")
            if server_content is None:
                continue

            model_turn = server_content.get("modelTurn")
            if model_turn:
                for part in model_turn.get("parts", []):
                    inline = part.get("inlineData")
                    if inline and inline.get("data"):
                        yield LiveServerEvent(
                            type="audio_delta", audio_bytes=base64.b64decode(inline["data"])
                        )

            output_transcript = server_content.get("outputTranscription", {}).get("text")
            if output_transcript:
                yield LiveServerEvent(type="text_delta", speaker="examinateur", text=output_transcript)

            input_transcript = server_content.get("inputTranscription", {}).get("text")
            if input_transcript:
                yield LiveServerEvent(type="text_delta", speaker="candidat", text=input_transcript)

            if server_content.get("interrupted"):
                yield LiveServerEvent(type="interrupted")
            if server_content.get("turnComplete"):
                yield LiveServerEvent(type="turn_complete")

    async def close(self) -> None:
        await self._ws.close()


# ---------------------------------------------------------------------------
# Point d'entrée — Gemini uniquement (pas de fallback OpenAI)
# ---------------------------------------------------------------------------

async def open_segment(system_prompt: str, *, gemini_api_key: str) -> LiveSegment:
    """Point d'entrée pour service.py : ouvre l'unique connexion live
    pour toute la durée de la tâche. Lève LiveConnectionError directement
    si Gemini échoue — pas de fallback vers un autre provider."""
    return await GeminiLiveSegment.open(system_prompt, api_key=gemini_api_key)