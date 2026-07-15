"""
expression_orale.schemas
===========================
Contrats Pydantic — ce que router.py (côté toi) envoie/reçoit sur le
WebSocket, plus la sortie de grading.py telle que persistée/retournée.

Volontairement plus fin que ce qu'on aurait pour un module multi-Teil :
pas de session_state complexe avec indices de séquence, puisqu'une
session EO ici = une tâche = une seule connexion live du début à la fin.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class TranscriptEntry(BaseModel):
    speaker: Literal["candidat", "examinateur"]
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# Sortant — poussé au frontend au fil de la session (à consommer par ton router)
# ---------------------------------------------------------------------------

class SessionReadyEvent(BaseModel):
    type: Literal["session_ready"] = "session_ready"
    task_number: int
    preparation_time_seconds: int | None
    recording_time_seconds: int


class PrepStartedEvent(BaseModel):
    """Poussé après que l'IA a fini de lire la mise en situation (Tâche 2
    uniquement) — signale au frontend de démarrer son timer local de
    préparation. Aucune connexion live n'est ouverte pendant cette pause."""
    type: Literal["prep_started"] = "prep_started"
    preparation_time_seconds: int


class TranscriptUpdateEvent(BaseModel):
    type: Literal["transcript_update"] = "transcript_update"
    speaker: Literal["candidat", "examinateur"]
    text: str


class SessionEndedEvent(BaseModel):
    type: Literal["session_ended"] = "session_ended"
    reason: Literal["completed", "abandoned", "error"]
    detail: str | None = None


# ---------------------------------------------------------------------------
# Correction — résultat persisté + renvoyé au frontend
# ---------------------------------------------------------------------------

class CriterionScore(BaseModel):
    name: str
    score: float  # 0-4
    comment: str = ""


class GradingResult(BaseModel):
    task_id: UUID
    task_number: int
    criteria: list[CriterionScore] = Field(default_factory=list)  # 5 critères, 0-4 chacun
    total_score: float  # somme des 5 critères, sur 20
    capped: bool = False
    cap_reason: str | None = None  # ex: "durée de parole insuffisante — plafonné niveau B1"
    strengths: list[str] = Field(default_factory=list)
    improvement_areas: list[str] = Field(default_factory=list)
    summary: str = ""
    graded_at: datetime = Field(default_factory=datetime.utcnow)


class GradingResponse(BaseModel):
    """response_model pour l'endpoint REST de résultat, si tu veux un
    GET séparé plutôt que de tout pousser sur le WS."""
    attempt_id: UUID
    task_number: int
    criteria: list[CriterionScore]
    total_score: float
    capped: bool
    cap_reason: str | None
    strengths: list[str]
    improvement_areas: list[str]
    summary: str
    graded_at: datetime


class AttemptHistoryItem(BaseModel):
    attempt_id: UUID
    task_id: UUID
    task_number: int
    total_score: float
    capped: bool
    completed_at: datetime


class AttemptHistoryListResponse(BaseModel):
    items: list[AttemptHistoryItem]
    total: int