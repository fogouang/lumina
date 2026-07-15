"""
expression_orale.prompts
===========================
Tout ce qui dépend du CONTENU pédagogique TCF Canada, séparé de la
mécanique de connexion (live_client.py) et de session (service.py).

Contrairement à sprechen_agent.mapping (dispatch par format_type,
séquences à plusieurs étapes, alternance Kandidat A/B), il n'y a ici
qu'un seul rôle fixe par tâche — pas de sous-étapes, pas de provider
multiple. D'où un simple dict au lieu d'un module de mapping entier.
"""

from __future__ import annotations

import random
from dataclasses import dataclass
from enum import StrEnum

# TODO: importer le vrai modèle une fois le chemin confirmé, ex:
# from app.modules.expression_tasks.models import ExpressionTask
# Ici on type juste ce dont on a besoin (duck typing) pour ne pas
# bloquer sur l'import exact.

# Prénoms/noms utilisés par l'IA pour se présenter comme un véritable
# examinateur humain (Tâches 1 et 3 uniquement — la Tâche 2 fait jouer
# un personnage défini par la mise en situation, pas "l'examinateur").
EXAMINER_NAMES = [
    "Marie Tremblay",
    "Jean Bouchard",
    "Sophie Gagnon",
    "Marc Lavoie",
    "Chantal Roy",
    "Pierre Dubois",
]


def pick_examiner_name() -> str:
    return random.choice(EXAMINER_NAMES)


class AgentRole(StrEnum):
    EXAMINER = "examiner"          # Tâche 1 : mène l'entretien
    INTERLOCUTOR = "interlocutor"  # Tâche 2 : joue le rôle du document_1, répond seulement
    LISTENER = "listener"           # Tâche 3 : pose la question puis écoute


@dataclass(frozen=True)
class TaskBehavior:
    role: AgentRole
    agent_opens: bool
    behavior_note: str
    self_introduces: bool = False  # se présente par son nom avant d'entrer dans le sujet


TASK_BEHAVIOR: dict[int, TaskBehavior] = {
    1: TaskBehavior(
        role=AgentRole.EXAMINER,
        agent_opens=True,
        self_introduces=True,
        behavior_note=(
            "Tu es l'examinateur. Mène un entretien dirigé naturel : demande à l'étudiant "
            "de se présenter (état civil, famille, formation, profession, loisirs, projets), "
            "puis rebondis avec des questions de relance sur ce qu'il vient de dire. Reste "
            "chaleureux mais professionnel, comme un vrai examinateur TCF Canada. Pose une "
            "question à la fois et laisse l'étudiant répondre entièrement avant d'enchaîner."
        ),
    ),
    2: TaskBehavior(
        role=AgentRole.INTERLOCUTOR,
        agent_opens=True,
        self_introduces=False,
        behavior_note=(
            "Tu joues le rôle décrit dans la mise en situation (pas celui de l'examinateur). "
            "Le candidat vient de terminer sa préparation : commence UNIQUEMENT par une phrase "
            "brève du type 'Je vous écoute' ou 'Très bien, nous commençons' pour l'inviter à "
            "démarrer, puis tais-toi et attends. Après cette phrase, c'est le candidat qui mène "
            "l'échange et te pose des questions — réponds à ses questions de façon réaliste et "
            "cohérente avec le rôle, sans jamais prendre l'initiative de poser tes propres "
            "questions ni de diriger la conversation davantage."
        ),
    ),
    3: TaskBehavior(
        role=AgentRole.LISTENER,
        agent_opens=True,
        self_introduces=True,
        behavior_note=(
            "Pose la question donnée une seule fois au début, puis écoute activement pendant "
            "que l'étudiant développe son point de vue. N'interromps pas. Un bref backchannel "
            "minimal est acceptable ('mhm', 'je vois'), mais ne pose une relance que si "
            "l'étudiant reste silencieux plus de 8 secondes ou semble avoir clairement terminé "
            "avant la fin du temps imparti."
        ),
    ),
}


def build_intro_prompt(task) -> str:
    """Tâche 2 uniquement : segment court et séparé dont le seul but est
    de faire lire la mise en situation à voix haute par l'IA, avant la
    pause de préparation hors-connexion. Fermé dès que la lecture est
    terminée (turn_complete) — pas de coût Gemini pendant les 2 minutes
    de préparation qui suivent."""
    situation = task.document_1 or task.instruction_text or ""
    return f"""\
Tu es l'examinateur virtuel du TCF Canada. Lis à voix haute, une seule fois, la mise en \
situation suivante, de façon claire et naturelle. Ne pose aucune question, n'ajoute aucun \
commentaire, ne salue pas le candidat. Une fois la lecture terminée, arrête-toi et reste \
silencieux — le candidat va maintenant se préparer en silence pendant 2 minutes.

MISE EN SITUATION À LIRE :
{situation}
"""


def _opening_instruction(behavior: TaskBehavior, examiner_name: str | None) -> str:
    if not behavior.agent_opens:
        return "L'étudiant a l'initiative — attends qu'il parle en premier. Ne commence pas."
    if behavior.self_introduces and examiner_name:
        return (
            f"Tu as l'initiative. Commence PAR TE PRÉSENTER brièvement et chaleureusement, "
            f'comme un vrai examinateur humain — par exemple : "Bonjour, je m\'appelle '
            f'{examiner_name}, je serai votre examinateur/examinatrice pour cette session." '
            f"Enchaîne ensuite naturellement vers la consigne de la tâche, dans la même prise "
            f"de parole. Ne saute pas cette présentation, mais reste bref (une phrase suffit) — "
            f"le temps de parole officiel de cette tâche ne démarre qu'une fois que tu as "
            f"terminé cette toute première intervention."
        )
    return "Tu as l'initiative — commence à parler maintenant."


def build_system_prompt(task) -> str:
    """Fonction pure : (ExpressionTaskResponse-like) -> str. Une seule
    connexion Gemini Live par tâche (pas de segmentation intra-tâche
    comme sur GoToGermany) donc pas de recap de transcript à gérer ici."""
    behavior = TASK_BEHAVIOR[task.task_number]
    examiner_name = pick_examiner_name() if behavior.self_introduces else None

    context_lines = [task.instruction_text or ""]
    if task.document_1:
        context_lines.append(f"Document 1 (mise en situation) : {task.document_1}")
    if task.document_2:
        context_lines.append(f"Document 2 : {task.document_2}")

    return f"""\
Tu es l'examinateur virtuel pour l'épreuve d'Expression Orale du TCF Canada — Tâche {task.task_number}.

RÔLE POUR CETTE TÂCHE : {behavior.role.value}
{behavior.behavior_note}

CONTEXTE DU SUJET :
{chr(10).join(context_lines)}

RÈGLE D'OUVERTURE : {_opening_instruction(behavior, examiner_name)}

RÈGLES STRICTES :
- Reste dans ton rôle en permanence. Ne donne jamais de correction ni de feedback pendant l'échange.
- Ne parle qu'en français, à un niveau naturel adapté à un candidat B1/B2.
- N'invente rien qui ne soit pas ancré dans le contexte du sujet ci-dessus.
- N'annonce jamais la fin de la tâche ni le passage à autre chose — c'est géré côté système.
"""


# ---------------------------------------------------------------------------
# Grille de correction officielle (France Éducation international) —
# utilisée par grading.py
# ---------------------------------------------------------------------------

# 5 critères transversaux de poids égal, appliqués aux 3 tâches.
# Chaque critère est noté 0-4 (5 × 4 = 20), pour rester cohérent avec la
# note finale officielle sur 20.
GRADING_CRITERIA: list[str] = [
    "Compétence pragmatique",  # répond à la consigne, organise logiquement, connecteurs
    "Compétence lexicale",      # richesse/variété/précision du vocabulaire, évite les répétitions
    "Correction grammaticale",  # structures de phrase, temps, accords
    "Compétence phonologique",  # prononciation, intonation, accent ne gênant pas la compréhension
    "Fluidité et aisance",      # débit naturel, pas de pauses/hésitations excessives
]

# Ce que l'examinateur vérifie concrètement pour CETTE tâche, en plus des
# 5 critères transversaux ci-dessus (appliqués de la même façon aux 3).
TASK_SPECIFIC_GUIDANCE: dict[int, str] = {
    1: (
        "Entretien dirigé : pour valider le niveau max (B2/C1), le candidat ne doit pas se "
        "contenter de réponses courtes ('oui'/'non'). Il doit développer ses réponses avec des "
        "exemples personnels concrets (projets, goûts, expériences passées)."
    ),
    2: (
        "Interaction avec préparation : pour valider le niveau max, le candidat doit initier, "
        "maintenir et guider l'échange lui-même. Il doit utiliser le vouvoiement, un registre "
        "de langue formel adapté, et réagir de façon cohérente aux réponses de l'interlocuteur."
    ),
    3: (
        "Point de vue (monologue suivi) : l'argumentation est le critère central. Le candidat "
        "doit structurer un discours complexe (introduction, arguments pour/contre, exemples "
        "clairs, conclusion) de façon fluide et convaincante."
    ),
}

# Fenêtres de timing par tâche — utilisées pour le prompt de correction
# ET comme garde-fou serveur (recording_time_seconds côté ExpressionTask
# coupe déjà la connexion à la limite haute, donc "dépasser" ne peut pas
# arriver dans notre système ; ce qui reste à surveiller est le
# sous-emploi du temps disponible, qui indique un développement
# insuffisant du canevas/de l'argumentation).
TASK_TIMING_GUIDANCE: dict[int, str] = {
    1: (
        "Durée allouée : 2 minutes (coupure automatique). Viser 1 min 50 à 1 min 55 de "
        "parole effective — un candidat qui s'arrête très en dessous de cette fourchette "
        "n'a probablement pas développé tout le canevas attendu (état civil, formation, "
        "profession, loisirs, projets) et doit être pénalisé sur la compétence pragmatique."
    ),
    2: (
        "Durée de l'échange : 3 minutes 30 après 2 minutes de préparation (coupure "
        "automatique). Un candidat qui conclut l'échange très en dessous de ce temps n'a "
        "probablement pas posé assez de questions pour couvrir le sujet."
    ),
    3: (
        "Durée de l'échange : 4 minutes 30 (coupure automatique). Un candidat qui conclut "
        "très en dessous de ce temps n'a probablement pas développé une argumentation "
        "complète (introduction, arguments, exemples, conclusion)."
    ),
}

# Piège du plafonnement : en dessous d'un sous-emploi extrême du temps
# imparti, la note est automatiquement plafonnée au niveau B1 quel que
# soit le score sur les 5 critères. Seul le seuil de la Tâche 3 (30s) a
# été confirmé explicitement — TODO: confirmer les seuils réels des
# Tâches 1 et 2, ou décider de s'appuyer uniquement sur la pénalité
# naturelle du critère "compétence pragmatique" pour ces deux tâches
# plutôt que sur un plafond mécanique séparé.
MIN_SPEAKING_DURATION_SECONDS: dict[int, int] = {
    3: 30,  # confirmé
}