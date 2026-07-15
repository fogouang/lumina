"""
expression_orale.service
===========================
ExpressionOraleService(db) — même forme que les autres *Service(db)
du projet (ex: AuthService), une instance par requête/connexion.

Le store de session live en mémoire est l'exception habituelle : il
est module-level, pas par instance, car une session doit rester
retrouvable au fil des messages WS indépendamment du cycle de vie
d'une session db donnée. Pattern identique à celui validé sur
GoToGermany (dict process-local, pas de Redis pour ce V1).

Pas d'orchestrateur multi-étapes ici : une session EO = une tâche =
une seule connexion live du début à la fin. Pas de "advance_and_reopen"
comme sur GoToGermany — juste start / record_turn / finalize / abandon.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from . import grading, live_client, prompts, repository
from .schemas import GradingResponse, TranscriptEntry

# ---------------------------------------------------------------------------
# État de session live — en mémoire, process-local, partagé entre
# toutes les instances de ExpressionOraleService (module-level, pas self.*)
# ---------------------------------------------------------------------------


@dataclass
class SessionState:
    session_id: UUID
    student_id: UUID
    series_id: UUID
    task_id: UUID
    task_number: int
    live_provider: str = "gemini"
    transcript: list[TranscriptEntry] = field(default_factory=list)
    started_at: datetime = field(default_factory=datetime.utcnow)
    # Distinct de started_at pour les tâches avec préparation (Tâche 2) :
    # la pause de préparation ne doit pas compter dans la durée de parole
    # mesurée pour le timing/plafonnement. Fixé au moment où le segment
    # d'échange s'ouvre (juste après started_at pour les tâches sans prep).
    exchange_started_at: datetime | None = None


_SESSION_STORE: dict[UUID, SessionState] = {}
_STORE_LOCK = asyncio.Lock()


class SessionNotFoundError(Exception):
    def __init__(self, session_id: UUID) -> None:
        super().__init__(f"No active EO session with id {session_id}")
        self.session_id = session_id


async def get_session(session_id: UUID) -> SessionState:
    async with _STORE_LOCK:
        session = _SESSION_STORE.get(session_id)
    if session is None:
        raise SessionNotFoundError(session_id)
    return session


async def _save_session(session: SessionState) -> None:
    async with _STORE_LOCK:
        _SESSION_STORE[session.session_id] = session


async def _forget_session(session_id: UUID) -> None:
    async with _STORE_LOCK:
        _SESSION_STORE.pop(session_id, None)


class ExpressionOraleService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # -----------------------------------------------------------------
    # Cycle de vie de la session
    # -----------------------------------------------------------------

    async def start_session(
        self,
        *,
        student_id: UUID,
        series_id: UUID,
        task,  # ExpressionTaskResponse-like : id, task_number, instruction_text, document_1/2
        gemini_api_key: str,
    ) -> tuple[SessionState, live_client.LiveSegment]:
        """Tâches SANS préparation (1 et 3) uniquement : une session = un
        seul segment live du début à la fin. Pour la Tâche 2 (avec
        préparation), utiliser start_intro_segment() puis
        start_exchange_segment() à la place."""
        session = SessionState(
            session_id=uuid4(),
            student_id=student_id,
            series_id=series_id,
            task_id=task.id,
            task_number=task.task_number,
        )
        session.exchange_started_at = session.started_at

        system_prompt = prompts.build_system_prompt(task)
        segment = await live_client.open_segment(system_prompt, gemini_api_key=gemini_api_key)
        session.live_provider = segment.provider

        behavior = prompts.TASK_BEHAVIOR[task.task_number]
        if behavior.agent_opens:
            await segment.trigger_agent_turn()

        await _save_session(session)
        return session, segment

    async def start_intro_segment(
        self,
        *,
        student_id: UUID,
        series_id: UUID,
        task,
        gemini_api_key: str,
    ) -> tuple[SessionState, live_client.LiveSegment]:
        """Tâche 2 uniquement, premier des deux segments : l'IA lit la
        mise en situation à voix haute. Le routeur ferme ce segment dès
        que turn_complete arrive, puis appelle start_prep_break() côté
        contrôleur (timer local, pas de connexion live pendant la pause)."""
        session = SessionState(
            session_id=uuid4(),
            student_id=student_id,
            series_id=series_id,
            task_id=task.id,
            task_number=task.task_number,
        )

        intro_prompt = prompts.build_intro_prompt(task)
        segment = await live_client.open_segment(intro_prompt, gemini_api_key=gemini_api_key)
        session.live_provider = segment.provider
        await segment.trigger_agent_turn()  # force la lecture immédiate

        await _save_session(session)
        return session, segment

    async def start_exchange_segment(
        self,
        session: SessionState,
        *,
        task,
        gemini_api_key: str,
    ) -> live_client.LiveSegment:
        """Tâche 2 uniquement, second segment : ouvert après la pause de
        préparation côté contrôleur. L'IA ouvre par une phrase brève
        d'invitation (cf. TASK_BEHAVIOR[2].behavior_note), puis le
        candidat mène l'échange. Marque exchange_started_at pour que la
        pause de préparation ne compte pas dans la durée de parole
        mesurée au moment de la correction."""
        exchange_prompt = prompts.build_system_prompt(task)
        segment = await live_client.open_segment(exchange_prompt, gemini_api_key=gemini_api_key)
        session.live_provider = segment.provider
        session.exchange_started_at = datetime.utcnow()
        await segment.trigger_agent_turn()  # la phrase d'invitation courte

        await _save_session(session)
        return segment

    async def record_turn(self, session: SessionState, *, speaker: str, text: str) -> None:
        session.transcript.append(TranscriptEntry(speaker=speaker, text=text))
        await _save_session(session)

    async def finalize_session(
        self, session: SessionState, *, gemini_api_key: str
    ) -> GradingResponse:
        """Corrige la session terminée, persiste exactement une ligne
        via self.db, et l'enlève du store en mémoire."""
        speaking_reference = session.exchange_started_at or session.started_at
        spoken_duration = int((datetime.utcnow() - speaking_reference).total_seconds())

        result = await grading.call_gemini_grading(
            task_id=session.task_id,
            task_number=session.task_number,
            transcript=session.transcript,
            spoken_duration_seconds=spoken_duration,
            gemini_api_key=gemini_api_key,
        )

        attempt = await repository.create_attempt(
            self.db,
            student_id=session.student_id,
            series_id=session.series_id,
            task_id=session.task_id,
            task_number=session.task_number,
            spoken_duration_seconds=spoken_duration,
            transcript=[e.model_dump(mode="json") for e in session.transcript],
            criteria=[c.model_dump(mode="json") for c in result.criteria],
            total_score=result.total_score,
            capped=result.capped,
            cap_reason=result.cap_reason,
            strengths=result.strengths,
            improvement_areas=result.improvement_areas,
            summary=result.summary,
            live_provider_used=session.live_provider,
            started_at=session.started_at,
        )
        await self.db.commit()
        await _forget_session(session.session_id)

        return GradingResponse(
            attempt_id=attempt.id,
            task_number=attempt.task_number,
            criteria=result.criteria,
            total_score=attempt.total_score,
            capped=attempt.capped,
            cap_reason=attempt.cap_reason,
            strengths=attempt.strengths,
            improvement_areas=attempt.improvement_areas,
            summary=attempt.summary,
            graded_at=attempt.completed_at,
        )

    async def abandon_session(
        self, session: SessionState, segment: live_client.LiveSegment | None
    ) -> None:
        """Déconnexion propre ou abandon — pas de correction, pas de
        ligne en base (rien à montrer pour une tentative incomplète)."""
        if segment is not None:
            await segment.close()
        await _forget_session(session.session_id)

    # -----------------------------------------------------------------
    # Historique
    # -----------------------------------------------------------------

    async def get_history(
        self, student_id: UUID, *, limit: int = 20, offset: int = 0
    ):
        rows = await repository.get_student_history(
            self.db, student_id, limit=limit, offset=offset
        )
        total = await repository.count_student_attempts(self.db, student_id)
        return rows, total

    async def get_series_attempts(self, student_id: UUID, series_id: UUID):
        """Dernier score par tâche pour une série — utile pour afficher
        un badge sur l'index du simulateur ('déjà tenté : 72/100')."""
        return await repository.get_student_attempts_for_series(self.db, student_id, series_id)