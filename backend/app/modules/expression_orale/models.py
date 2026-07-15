"""
expression_orale.models
==========================
SQLAlchemy model — le seul artefact réellement persisté en base pour
ce module. L'état de session live (session_state.py) ne touche jamais
cette table ; une ligne est écrite une seule fois, quand grading.py a
fini et que service.py appelle repository.py pour sauvegarder le résultat.

Granularité choisie : une ligne par TÂCHE (pas par série complète).
Le frontend ouvre une session live indépendante par tâche (retour à
l'index entre chaque), donc c'est la granularité naturelle ici.

Barème : grille officielle France Éducation international — 5 critères
transversaux de poids égal (0-4 chacun, total sur 20), plus un
plafonnement mécanique au niveau B1 si la durée de parole est
insuffisante (appliqué en code dans grading.py, pas laissé au LLM).

NOTE: adapter l'import de Base au chemin réel si différent de
app.shared.database.base.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database.base import Base


class ExpressionOraleAttempt(Base):
    """Une tentative terminée (ou abandonnée) sur UNE tâche EO.

    Écrite une seule fois à la fin du cycle de vie de la session. Si
    la session est abandonnée avant correction, aucune ligne n'est
    créée (rien à montrer à l'étudiant).
    """

    __tablename__ = "expression_orale_attempts"

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    series_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("series.id"), nullable=False, index=True
    )
    # TODO: confirmer le nom de la table cible (expression_tasks ?)
    task_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("expression_tasks.id"), nullable=False
    )
    task_number: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 | 2 | 3

    # Durée réellement parlée (mesurée côté back), utile pour le
    # critère de durée minimale de la Tâche 1 notamment.
    spoken_duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Transcript complet — une entrée par tour, {speaker, text, timestamp}.
    transcript: Mapped[list[dict]] = mapped_column(JSONB, nullable=False)

    # Correction — sortie de grading.py, sur la grille officielle France
    # Éducation international : 5 critères transversaux (0-4 chacun),
    # total sur 20, plus le plafonnement éventuel par durée insuffisante.
    criteria: Mapped[list[dict]] = mapped_column(JSONB, nullable=False)  # [{name, score, comment}]
    total_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-20
    capped: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    cap_reason: Mapped[str | None] = mapped_column(String, nullable=True)
    strengths: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    improvement_areas: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    summary: Mapped[str] = mapped_column(String, nullable=False, default="")

    live_provider_used: Mapped[str] = mapped_column(String(20), nullable=False, default="gemini")

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<ExpressionOraleAttempt id={self.id} student={self.student_id} "
            f"task_number={self.task_number} score={self.score} level={self.estimated_level}>"
        )