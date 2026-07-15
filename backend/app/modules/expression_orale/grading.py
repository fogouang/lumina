"""
expression_orale.grading
===========================
Correction post-session sur la grille officielle France Éducation
international : 5 critères transversaux de poids égal (0-4 chacun,
total sur 20), appliqués aux 3 tâches avec des points de vigilance
spécifiques par tâche.

Le plafonnement par durée de parole insuffisante (le "piège" qui bloque
la note au niveau B1) est appliqué DE FAÇON DÉTERMINISTE en code, pas
laissé au jugement du LLM — c'est une règle mécanique du barème officiel,
trop importante pour un candidat visant l'immigration pour être soumise
à l'incertitude d'un jugement de modèle.

Utilise Gemini plutôt que Claude pour rester cohérent avec le provider
déjà en place pour la correction ailleurs sur Lumina TCF.

NOTE: comme live_client.py, l'appel réseau réel ne peut pas être
exercé dans cet environnement. Construction du prompt et parsing
écrits pour être testables unitairement contre une réponse synthétique.
"""

from __future__ import annotations

import json
from uuid import UUID

import httpx

from .prompts import (
    GRADING_CRITERIA,
    MIN_SPEAKING_DURATION_SECONDS,
    TASK_SPECIFIC_GUIDANCE,
    TASK_TIMING_GUIDANCE,
)
from .schemas import CriterionScore, GradingResult, TranscriptEntry

GEMINI_GENERATE_URL_TEMPLATE = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)
GRADING_MODEL = "gemini-2.5-flash"
GRADING_TIMEOUT_SECONDS = 60.0


def _format_transcript(transcript: list[TranscriptEntry]) -> str:
    if not transcript:
        return "(aucun transcript enregistré)"
    lines = [f"{e.speaker.capitalize()} : {e.text}" for e in transcript]
    return "\n".join(lines)


def _format_criteria_list() -> str:
    return "\n".join(f"{i + 1}. {name}" for i, name in enumerate(GRADING_CRITERIA))


def build_grading_prompt(
    *, task_number: int, transcript: list[TranscriptEntry], spoken_duration_seconds: int
) -> str:
    guidance = TASK_SPECIFIC_GUIDANCE[task_number]
    timing = TASK_TIMING_GUIDANCE[task_number]

    return f"""\
Tu corriges la Tâche {task_number} de l'épreuve d'Expression Orale du TCF Canada, selon la
grille analytique officielle de France Éducation international.

Le candidat est toujours le locuteur "Candidat" dans le transcript ci-dessous. Les tours
"Examinateur" sont l'IA qui menait/participait à l'échange — ne note jamais ses propos.

TRANSCRIPT COMPLET :
{_format_transcript(transcript)}

LES 5 CRITÈRES TRANSVERSAUX (poids égal, note chacun de 0 à 4) :
{_format_criteria_list()}

POINTS DE VIGILANCE SPÉCIFIQUES À CETTE TÂCHE :
{guidance}

TIMING :
{timing}
Durée de parole réellement mesurée pour cette tentative : {spoken_duration_seconds} secondes.

Note chacun des 5 critères de 0 à 4 en te basant uniquement sur ce que le candidat a
réellement dit dans le transcript. Tiens compte du timing ci-dessus dans ton évaluation de
la compétence pragmatique notamment. Puis identifie 2-4 points forts et 2-4 axes
d'amélioration concrets.

Réponds UNIQUEMENT avec un objet JSON, sans balises markdown, sans préambule, exactement
sous cette forme :
{{
  "criteria": [
    {{"name": <str, exactement l'un des 5 noms ci-dessus>, "score": <float 0-4>, "comment": <str>}}
  ],
  "strengths": [<str>, ...],
  "improvement_areas": [<str>, ...],
  "summary": <str, 2-3 phrases>
}}
"""


def _strip_code_fences(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.split("\n", 1)[1] if "\n" in stripped else stripped
        if stripped.endswith("```"):
            stripped = stripped.rsplit("```", 1)[0]
    return stripped.strip()


def _apply_duration_cap(
    result: GradingResult, *, task_number: int, spoken_duration_seconds: int
) -> GradingResult:
    """Règle mécanique du barème officiel : en dessous du seuil minimal
    de parole pour cette tâche, la note est plafonnée au niveau B1 quel
    que soit le score obtenu sur les 5 critères. Appliqué ici en code
    plutôt que confié au jugement du LLM dans le prompt."""
    threshold = MIN_SPEAKING_DURATION_SECONDS.get(task_number)
    if threshold is not None and spoken_duration_seconds < threshold:
        result.capped = True
        result.cap_reason = (
            f"Durée de parole insuffisante ({spoken_duration_seconds}s, minimum requis "
            f"{threshold}s) — le barème officiel plafonne cette tâche au niveau B1, "
            "quel que soit le score obtenu sur les 5 critères ci-dessus."
        )
    return result


def parse_grading_response(
    raw_text: str,
    *,
    task_id: UUID,
    task_number: int,
    spoken_duration_seconds: int,
) -> GradingResult:
    """Sépare le parsing de l'appel réseau pour un test unitaire facile
    contre une réponse synthétique, sans clé API réelle."""
    data = json.loads(_strip_code_fences(raw_text))

    criteria = [
        CriterionScore(
            name=c["name"],
            score=float(c["score"]),
            comment=c.get("comment", ""),
        )
        for c in data["criteria"]
    ]
    total_score = sum(c.score for c in criteria)

    result = GradingResult(
        task_id=task_id,
        task_number=task_number,
        criteria=criteria,
        total_score=total_score,
        strengths=list(data.get("strengths", [])),
        improvement_areas=list(data.get("improvement_areas", [])),
        summary=str(data.get("summary", "")),
    )
    return _apply_duration_cap(
        result, task_number=task_number, spoken_duration_seconds=spoken_duration_seconds
    )


async def call_gemini_grading(
    *,
    task_id: UUID,
    task_number: int,
    transcript: list[TranscriptEntry],
    spoken_duration_seconds: int,
    gemini_api_key: str,
) -> GradingResult:
    """L'appel réseau réel. Fin volontairement — build_grading_prompt()
    et parse_grading_response() portent toute la logique testable sans
    clé réelle."""
    prompt = build_grading_prompt(
        task_number=task_number,
        transcript=transcript,
        spoken_duration_seconds=spoken_duration_seconds,
    )
    url = GEMINI_GENERATE_URL_TEMPLATE.format(model=GRADING_MODEL)

    async with httpx.AsyncClient(timeout=GRADING_TIMEOUT_SECONDS) as client:
        response = await client.post(
            url,
            params={"key": gemini_api_key},
            json={
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": {"responseMimeType": "application/json"},
            },
        )
        response.raise_for_status()
        payload = response.json()

    raw_text = payload["candidates"][0]["content"]["parts"][0]["text"]
    return parse_grading_response(
        raw_text,
        task_id=task_id,
        task_number=task_number,
        spoken_duration_seconds=spoken_duration_seconds,
    )