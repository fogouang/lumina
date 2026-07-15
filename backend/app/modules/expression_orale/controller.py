"""
app/modules/expression_orale/controller.py

Même convention que app/modules/auth/controller.py : APIRouter avec
prefix/tags, service instancié par requête/connexion, SuccessResponse
pour les réponses REST.

Deux tâches concurrentes par connexion WebSocket, comme sur GoToGermany :
  - _relay_client_to_agent() : lit les frames du frontend (audio binaire
    + messages de contrôle JSON), envoie l'audio au segment live courant.
  - _relay_agent_to_client() : lit live_client.LiveSegment.events(),
    relaie audio/transcript au frontend, enregistre chaque tour via
    service.record_turn().

Pas d'orchestration multi-étapes ici (contrairement à sprechen_agent) :
une session = une tâche = une seule connexion live du début à la fin.
La fin de session est déclenchée soit par un message de contrôle
explicite du frontend ({"type": "end_session"}), soit par la
déconnexion du WebSocket (traité comme abandon).

TODO / À CONFIRMER CÔTÉ TOI :
  - get_current_user_ws : supposé dans app.shared.dependencies aux
    côtés de CurrentUser, à vérifier — s'il n'existe pas encore,
    c'est le même fix que sur GoToGermany : HTTPBearer/CurrentUser
    plante sur les routes WebSocket (TypeError: missing 'request'),
    il faut une variante qui lit le cookie access_token directement
    sur le handshake WS.
  - get_task_data() : chemin du modèle/repository ExpressionTask
    deviné (app.modules.expression_tasks.repository) — à ajuster.
  - NotFoundException : supposée exister dans app.shared.exceptions.http
    aux côtés de BadRequestException/UnauthorizedException (vues dans
    auth/service.py) — à ajuster si le nom réel diffère.
"""

from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect

# ASSUMPTION: à vérifier — voir docstring du module.
from app.shared.dependencies import CurrentUser, get_current_user_ws
from app.shared.database.session import DbSession
from app.shared.exceptions.http import NotFoundException
from app.shared.schemas.responses import SuccessResponse
from app.config import Settings, get_settings

from . import live_client
from .dependencies import get_expression_orale_service
from .schemas import (
    AttemptHistoryListResponse,
    AttemptHistoryItem,
    GradingResponse,
    PrepStartedEvent,
    SessionReadyEvent,
    SessionEndedEvent,
    TranscriptUpdateEvent,
)
from .service import ExpressionOraleService, SessionState

router = APIRouter(prefix="/expression-orale", tags=["Expression Orale"])


# ---------------------------------------------------------------------------
# Dépendances
# ---------------------------------------------------------------------------

async def get_task_data(task_id: UUID, db: DbSession) -> Any:
    """Charge la tâche EO depuis la DB. TODO: ajuster l'import une fois
    le module ExpressionTask confirmé côté toi — deviné par analogie
    avec le pattern _get_user_by_id(...) vu dans auth/service.py."""
    from app.modules.expression_tasks.repository import ExpressionTaskRepository

    task = await ExpressionTaskRepository(db).get_by_id_or_404(task_id)
    if task is None or task.type != "oral":
        raise NotFoundException(detail="Tâche Expression Orale introuvable.")
    return task


async def has_ai_credit_available(db: DbSession, user_id: UUID) -> bool:
    """Vérifie sans débiter — utilisé au démarrage de la session pour
    refuser tout de suite si l'utilisateur n'a aucun crédit, sans encore
    rien lui coûter."""
    from app.modules.subscriptions.repository import SubscriptionRepository

    sub_repo = SubscriptionRepository(db)
    subs = await sub_repo.get_active_by_user(user_id)
    return any(s.ai_credits_remaining >= 1 for s in subs)


async def consume_ai_credit(db: DbSession, user_id: UUID) -> None:
    """Débit réel — appelé UNIQUEMENT une fois la session terminée avec
    succès et la correction prête à être affichée. Ne jamais débiter sur
    un abandon, une déconnexion ou un échec de correction : ce serait
    faire payer l'utilisateur pour un problème qui n'est pas le sien."""
    from sqlalchemy import update
    from app.modules.subscriptions.models import Subscription
    from app.modules.subscriptions.repository import SubscriptionRepository

    sub_repo = SubscriptionRepository(db)
    subs = await sub_repo.get_active_by_user(user_id)
    active_sub = next((s for s in subs if s.ai_credits_remaining >= 1), None)
    if not active_sub:
        # Rare (crédits épuisés entre temps par une autre session) — la
        # correction reste affichée malgré tout, on ne bloque pas l'utilisateur
        # après coup pour un crédit qu'il n'a plus.
        return

    await db.execute(
        update(Subscription)
        .where(Subscription.id == active_sub.id)
        .values(ai_credits_remaining=active_sub.ai_credits_remaining - 1)
    )
    await db.commit()


def get_gemini_api_key(settings: Settings = Depends(get_settings)) -> str:
    return settings.GEMINI_API_KEY


# ---------------------------------------------------------------------------
# Signaux internes — déroulement propre du group de tâches, pas des
# erreurs destinées à l'utilisateur.
# ---------------------------------------------------------------------------

class _SessionEnded(Exception):
    pass


class _LiveProviderError(Exception):
    pass


async def _enforce_recording_timeout(ctx: "_ConnectionContext", deadline_seconds: float) -> None:
    """Garde-fou serveur : force la fin de la session à recording_time_seconds
    après le DÉBUT RÉEL du chrono (une fois l'IA prête à céder la parole,
    cf. timer_started_event), pas depuis l'ouverture de la connexion —
    sinon la présentation de l'examinateur grignoterait le temps officiel.
    Course avec les tâches de relais dans le même TaskGroup — dès qu'elle
    se déclenche, _SessionEnded se propage et annule les tâches sœurs,
    exactement comme un end_session explicite."""
    await ctx.timer_started_event.wait()
    await asyncio.sleep(deadline_seconds)
    raise _SessionEnded()


@dataclass
class _ConnectionContext:
    websocket: WebSocket
    session: SessionState
    segment: live_client.LiveSegment
    service: ExpressionOraleService
    gemini_api_key: str
    timer_started_event: asyncio.Event


async def _send_json(websocket: WebSocket, payload: dict) -> None:
    await websocket.send_text(json.dumps(payload))


async def _consume_intro_segment(websocket: WebSocket, segment: live_client.LiveSegment) -> None:
    """Tâche 2 uniquement : relaie la lecture du sujet par l'IA jusqu'à
    turn_complete, puis rend la main — pas d'enregistrement dans le
    transcript de correction, cette lecture ne fait pas partie de
    l'échange noté."""
    async for event in segment.events():
        if event.type == "audio_delta" and event.audio_bytes:
            await websocket.send_bytes(event.audio_bytes)
        elif event.type == "text_delta" and event.text:
            await _send_json(
                websocket,
                TranscriptUpdateEvent(
                    speaker=event.speaker or "examinateur", text=event.text
                ).model_dump(mode="json"),
            )
        elif event.type == "turn_complete":
            return
        elif event.type == "error":
            raise _LiveProviderError(event.error_message or "erreur inconnue du provider live")


async def _wait_for_prep_done(websocket: WebSocket) -> bool:
    """Attend le signal du frontend une fois son timer local de
    préparation écoulé. Retourne False si la connexion est abandonnée
    pendant la pause (pas de segment live ouvert à ce moment, donc rien
    à fermer — juste à oublier la session)."""
    while True:
        message = await websocket.receive()
        if message.get("type") == "websocket.disconnect":
            return False

        raw_text = message.get("text")
        if raw_text is None:
            continue
        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            continue

        msg_type = data.get("type")
        if msg_type == "prep_done":
            return True
        if msg_type == "abandon_session":
            return False
        # tout autre message ignoré pendant la pause


# ---------------------------------------------------------------------------
# Relais
# ---------------------------------------------------------------------------

async def _relay_client_to_agent(ctx: _ConnectionContext) -> None:
    while True:
        message = await ctx.websocket.receive()

        if message.get("type") == "websocket.disconnect":
            raise WebSocketDisconnect()

        raw_bytes = message.get("bytes")
        if raw_bytes is not None:
            try:
                await ctx.segment.send_audio_chunk(raw_bytes)
            except Exception:  # noqa: BLE001 — chunk perdu pendant une transition, sans gravité
                pass
            continue

        raw_text = message.get("text")
        if raw_text is None:
            continue

        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            continue

        msg_type = data.get("type")
        if msg_type == "end_session":
            raise _SessionEnded()
        if msg_type == "abandon_session":
            await ctx.service.abandon_session(ctx.session, ctx.segment)
            await ctx.websocket.close(code=1000)
            raise _SessionEnded()
        # tout autre message de contrôle est ignoré plutôt que de tuer la session


async def _relay_agent_to_client(ctx: _ConnectionContext) -> None:
    last_mic_state: str | None = None

    async def _send_mic_state(state: str) -> None:
        nonlocal last_mic_state
        if state != last_mic_state:
            await _send_json(ctx.websocket, {"type": state})
            last_mic_state = state

    await _send_mic_state("agent_speaking")

    async for event in ctx.segment.events():
        if event.type == "audio_delta" and event.audio_bytes:
            await ctx.websocket.send_bytes(event.audio_bytes)

        elif event.type == "text_delta" and event.text:
            speaker = event.speaker or "examinateur"
            await _send_mic_state("agent_speaking" if speaker == "examinateur" else "student_turn")
            await _send_json(
                ctx.websocket,
                TranscriptUpdateEvent(speaker=speaker, text=event.text).model_dump(mode="json"),
            )
            await ctx.service.record_turn(ctx.session, speaker=speaker, text=event.text)

        elif event.type == "turn_complete":
            if not ctx.timer_started_event.is_set():
                # L'IA vient de terminer sa toute première prise de parole
                # (présentation + consigne, ou phrase d'invitation Tâche 2) —
                # c'est SEULEMENT maintenant que le temps officiel démarre.
                await _send_json(ctx.websocket, {"type": "timer_start"})
                ctx.timer_started_event.set()
            await _send_mic_state("student_turn")

        elif event.type == "error":
            raise _LiveProviderError(event.error_message or "erreur inconnue du provider live")

        # "interrupted" (barge-in) : pas de transition de séquence à gérer
        # ici (une seule tâche = un seul segment), le provider gère
        # lui-même sa file audio.


# ---------------------------------------------------------------------------
# Endpoint WebSocket
# ---------------------------------------------------------------------------

@router.websocket("/ws/{task_id}")
async def expression_orale_session_ws(
    websocket: WebSocket,
    task_id: UUID,
    db: DbSession,
    current_user=Depends(get_current_user_ws),
    gemini_api_key: str = Depends(get_gemini_api_key),
    task: Any = Depends(get_task_data),
) -> None:
    """task_id dans l'URL (pas dans un premier message WS) pour que
    toutes les dépendances — db, la tâche — se résolvent via l'injection
    FastAPI normale avant même l'acceptation du socket.

    current_user utilise get_current_user_ws, PAS CurrentUser (utilisé
    partout ailleurs) — CurrentUser est basé sur HTTPBearer, qui a besoin
    d'un objet Request et plante sur les routes WebSocket. Voir la
    docstring du module pour le TODO associé si cette dépendance
    n'existe pas encore côté toi.
    """
    await websocket.accept()

    if not await has_ai_credit_available(db, current_user.id):
        await _send_json(
            websocket,
            SessionEndedEvent(
                reason="error",
                detail="Il vous faut au moins 1 crédit IA pour démarrer une session.",
            ).model_dump(mode="json"),
        )
        await websocket.close(code=1008, reason="insufficient_credits")
        return

    service = await get_expression_orale_service(db)

    await _send_json(
        websocket,
        SessionReadyEvent(
            task_number=task.task_number,
            preparation_time_seconds=task.preparation_time_seconds,
            recording_time_seconds=task.recording_time_seconds,
        ).model_dump(mode="json"),
    )

    has_preparation = bool(task.preparation_time_seconds and task.preparation_time_seconds > 0)

    try:
        if has_preparation:
            # Tâche 2 : segment d'intro (lecture du sujet) -> pause locale
            # (aucune connexion live ouverte, sans coût) -> segment d'échange.
            session, intro_segment = await service.start_intro_segment(
                student_id=current_user.id,
                series_id=task.series_id,
                task=task,
                gemini_api_key=gemini_api_key,
            )
            try:
                await _consume_intro_segment(websocket, intro_segment)
            except _LiveProviderError as exc:
                await service.abandon_session(session, intro_segment)
                try:
                    await websocket.close(code=1011, reason=str(exc))
                except Exception:  # noqa: BLE001 — best-effort
                    pass
                return
            await intro_segment.close()

            await _send_json(
                websocket,
                PrepStartedEvent(
                    preparation_time_seconds=task.preparation_time_seconds
                ).model_dump(mode="json"),
            )

            prep_completed = await _wait_for_prep_done(websocket)
            if not prep_completed:
                await service.abandon_session(session, None)
                return

            segment = await service.start_exchange_segment(
                session, task=task, gemini_api_key=gemini_api_key
            )
        else:
            # Tâches 1 et 3 : un seul segment du début à la fin.
            session, segment = await service.start_session(
                student_id=current_user.id,
                series_id=task.series_id,
                task=task,
                gemini_api_key=gemini_api_key,
            )
    except live_client.LiveConnectionError as exc:
        # Gemini ne répond pas (clé invalide, réseau, service indisponible) —
        # ne jamais laisser planter l'appli ASGI en silence : fermer proprement
        # avec un message exploitable côté frontend.
        print("=" * 80)
        print(f"ERREUR ouverture session Gemini Live (EO) : {exc}")
        print("=" * 80)
        try:
            await _send_json(
                websocket, SessionEndedEvent(reason="error").model_dump(mode="json")
            )
            await websocket.close(code=1011, reason=str(exc))
        except Exception:  # noqa: BLE001 — best-effort, la connexion peut déjà être partie
            pass
        return

    ctx = _ConnectionContext(
        websocket=websocket,
        session=session,
        segment=segment,
        service=service,
        gemini_api_key=gemini_api_key,
        timer_started_event=asyncio.Event(),
    )

    session_ended_cleanly = False
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(_relay_client_to_agent(ctx))
            tg.create_task(_relay_agent_to_client(ctx))
            tg.create_task(_enforce_recording_timeout(ctx, task.recording_time_seconds))
    except* _SessionEnded:
        session_ended_cleanly = True
    except* WebSocketDisconnect:
        await service.abandon_session(ctx.session, ctx.segment)
    except* _LiveProviderError as eg:
        print("=" * 80)
        print(f"ERREUR provider live pendant l'échange (EO) : {eg.exceptions[0]}")
        print("=" * 80)
        await service.abandon_session(ctx.session, ctx.segment)
        try:
            await ctx.websocket.close(code=1011, reason=str(eg.exceptions[0]))
        except Exception:  # noqa: BLE001 — best-effort, la connexion peut déjà être partie
            pass
        

    if session_ended_cleanly:
        await ctx.segment.close()
        try:
            response = await service.finalize_session(ctx.session, gemini_api_key=ctx.gemini_api_key)
        except Exception:  # noqa: BLE001 — ne jamais planter en silence sur un échec de correction
            import traceback

            print("=" * 80)
            print("ERREUR finalize_session (correction EO) :")
            traceback.print_exc()
            print("=" * 80)
            try:
                await _send_json(
                    websocket, SessionEndedEvent(reason="error").model_dump(mode="json")
                )
                await websocket.close(code=1011, reason="grading_failed")
            except Exception:  # noqa: BLE001 — best-effort, la connexion peut déjà être partie
                pass
            return

        # ✅ Débit uniquement ici — la correction a réussi et va être affichée.
        await consume_ai_credit(db, current_user.id)

        await _send_json(websocket, SessionEndedEvent(reason="completed").model_dump(mode="json"))
        await _send_json(websocket, {"type": "grading_result", **response.model_dump(mode="json")})
        await websocket.close(code=1000)


# ---------------------------------------------------------------------------
# REST — historique
# ---------------------------------------------------------------------------

@router.get("/history", response_model=SuccessResponse[AttemptHistoryListResponse])
async def get_expression_orale_history(
    current_user: CurrentUser,
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    service: ExpressionOraleService = Depends(get_expression_orale_service),
) -> SuccessResponse[AttemptHistoryListResponse]:
    rows, total = await service.get_history(current_user.id, limit=limit, offset=offset)
    items = [
        AttemptHistoryItem(
            attempt_id=row.id,
            task_id=row.task_id,
            task_number=row.task_number,
            total_score=row.total_score,
            capped=row.capped,
            completed_at=row.completed_at,
        )
        for row in rows
    ]
    return SuccessResponse(
        data=AttemptHistoryListResponse(items=items, total=total),
        message="Historique récupéré",
    )


@router.get("/series/{series_id}/attempts", response_model=SuccessResponse[list[AttemptHistoryItem]])
async def get_series_attempts(
    series_id: UUID,
    current_user: CurrentUser,
    service: ExpressionOraleService = Depends(get_expression_orale_service),
) -> SuccessResponse[list[AttemptHistoryItem]]:
    """Dernier score par tâche pour une série — pour afficher un badge
    ('déjà tenté : 72/100, niveau B1') sur l'index du simulateur."""
    rows = await service.get_series_attempts(current_user.id, series_id)
    items = [
        AttemptHistoryItem(
            attempt_id=row.id,
            task_id=row.task_id,
            task_number=row.task_number,
            total_score=row.total_score,
            capped=row.capped,
            completed_at=row.completed_at,
        )
        for row in rows
    ]
    return SuccessResponse(data=items, message="Tentatives récupérées")