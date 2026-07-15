"""
expression_orale.repository
==============================
Accès DB pour ExpressionOraleAttempt. Thin volontairement — aucune
logique métier, aucune interprétation de score : service.py décide
QUAND appeler ceci, grading.py décide QUELLES sont les valeurs.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ExpressionOraleAttempt


async def create_attempt(
    db: AsyncSession,
    *,
    student_id: uuid.UUID,
    series_id: uuid.UUID,
    task_id: uuid.UUID,
    task_number: int,
    spoken_duration_seconds: int,
    transcript: list[dict],
    criteria: list[dict],
    total_score: float,
    capped: bool,
    cap_reason: str | None,
    strengths: list[str],
    improvement_areas: list[str],
    summary: str,
    live_provider_used: str,
    started_at: datetime,
) -> ExpressionOraleAttempt:
    """Persiste la ligne unique d'une tentative terminée. Appelé une
    seule fois par service.py juste après que grading.py a retourné."""
    attempt = ExpressionOraleAttempt(
        student_id=student_id,
        series_id=series_id,
        task_id=task_id,
        task_number=task_number,
        spoken_duration_seconds=spoken_duration_seconds,
        transcript=transcript,
        criteria=criteria,
        total_score=total_score,
        capped=capped,
        cap_reason=cap_reason,
        strengths=strengths,
        improvement_areas=improvement_areas,
        summary=summary,
        live_provider_used=live_provider_used,
        started_at=started_at,
    )
    db.add(attempt)
    await db.flush()  # peuple attempt.id / attempt.completed_at sans commit
    return attempt


async def get_attempt_by_id(
    db: AsyncSession, attempt_id: uuid.UUID
) -> ExpressionOraleAttempt | None:
    stmt = select(ExpressionOraleAttempt).where(ExpressionOraleAttempt.id == attempt_id)
    return await db.scalar(stmt)


async def get_student_attempts_for_series(
    db: AsyncSession, student_id: uuid.UUID, series_id: uuid.UUID
) -> list[ExpressionOraleAttempt]:
    """Toutes les tentatives EO d'un étudiant pour une série, la plus
    récente d'abord par tâche — utile pour afficher le dernier score
    obtenu sur chaque tâche depuis l'index du simulateur."""
    stmt = (
        select(ExpressionOraleAttempt)
        .where(
            ExpressionOraleAttempt.student_id == student_id,
            ExpressionOraleAttempt.series_id == series_id,
        )
        .order_by(ExpressionOraleAttempt.completed_at.desc())
    )
    result = await db.scalars(stmt)
    return list(result.all())


async def get_student_history(
    db: AsyncSession,
    student_id: uuid.UUID,
    *,
    limit: int = 20,
    offset: int = 0,
) -> list[ExpressionOraleAttempt]:
    stmt = (
        select(ExpressionOraleAttempt)
        .where(ExpressionOraleAttempt.student_id == student_id)
        .order_by(ExpressionOraleAttempt.completed_at.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.scalars(stmt)
    return list(result.all())


async def count_student_attempts(db: AsyncSession, student_id: uuid.UUID) -> int:
    stmt = (
        select(func.count())
        .select_from(ExpressionOraleAttempt)
        .where(ExpressionOraleAttempt.student_id == student_id)
    )
    return (await db.scalar(stmt)) or 0