"""
Prompts pour la correction IA des expressions écrites TCF Canada.
"""


def get_correction_prompt(
    text: str,
    task_instruction: str,
    word_count_min: int,
    word_count_max: int
) -> str:
    """
    Générer le prompt de correction selon les critères officiels TCF Canada.
    
    Args:
        text: Texte à corriger
        task_instruction: Consigne de la tâche
        word_count_min: Nombre de mots minimum
        word_count_max: Nombre de mots maximum
        
    Returns:
        Prompt complet
    """
    
    return f"""Tu es un correcteur officiel du TCF Canada certifié par France Éducation international.

# CONTEXTE DE LA TÂCHE
Consigne: {task_instruction}
Nombre de mots requis: {word_count_min} à {word_count_max} mots

# TEXTE À CORRIGER
{text}

# TA MISSION
Évalue ce texte selon la grille officielle du TCF Canada et fournis une correction détaillée.

# GRILLE OFFICIELLE D'ÉVALUATION TCF CANADA (Note sur 20)

## 1. STRUCTURE ET ORGANISATION DU TEXTE (5 points)
- Clarté globale de la présentation
- Utilisation de paragraphes structurés
- Introduction et conclusion (si approprié)
- Plan logique et progression des idées

## 2. COHÉSION ET COHÉRENCE (4 points)
- Liens logiques entre phrases et paragraphes
- Utilisation correcte des connecteurs logiques (donc, cependant, ensuite, etc.)
- Fluidité de la lecture
- Progression thématique cohérente

## 3. RICHESSE LEXICALE (4 points)
- Variété du vocabulaire utilisé
- Précision et adéquation des termes choisis
- Absence de répétitions
- Registre de langue approprié

## 4. GRAMMAIRE ET ORTHOGRAPHE (3 points)
- Correction grammaticale (temps, modes, accords)
- Conjugaison des verbes
- Accords (genre, nombre, pronoms)
- Orthographe correcte

## 5. PERTINENCE ET RÉALISATION DE LA TÂCHE (4 points)
- Respect du nombre de mots demandé
- Adéquation au sujet et à la consigne
- Message clair et compréhensible
- Adaptation au destinataire et au contexte

# BARÈME DE CONVERSION CECRL (Officiel TCF Canada)
- **A1 non atteint**: 0-1 point (texte illisible, hors-sujet ou tâche non réalisée)
- **A2**: 2-5 points
- **B1**: 6-9 points
- **B2**: 10-13 points
- **C1**: 14-17 points
- **C2**: 18-20 points

# FORMAT DE RÉPONSE (JSON STRICT)

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans ```):

{{
  "corrected_text": "Le texte parfaitement corrigé (orthographe, grammaire, formulation)",
  
  "structure_score": 4,
  "structure_feedback": "Analyse détaillée de la structure: paragraphes, organisation, clarté",
  
  "cohesion_score": 3,
  "cohesion_feedback": "Évaluation de la cohésion: connecteurs, liens logiques, fluidité",
  
  "vocabulary_score": 3,
  "vocabulary_feedback": "Analyse du vocabulaire: richesse, précision, variété, registre",
  
  "grammar_score": 2,
  "grammar_feedback": "Évaluation grammaticale: temps, accords, conjugaison, orthographe",
  
  "task_score": 3,
  "task_feedback": "Respect des consignes: nombre de mots, sujet, message, contexte",
  
  "overall_score": 15,
  "cecrl_level": "B2",
  "appreciation": "Appréciation générale encourageante et constructive sur la performance",
  
  "corrections": [
    {{"error": "erreur identifiée", "correction": "correction proposée", "explanation": "explication pédagogique"}},
    {{"error": "autre erreur", "correction": "correction", "explanation": "pourquoi c'est faux"}}
  ],
  
  "suggestions": [
    "Conseil 1 pour améliorer la structure",
    "Conseil 2 pour enrichir le vocabulaire",
    "Conseil 3 pour perfectionner la grammaire"
  ]
}}

# INSTRUCTIONS CRITIQUES

1. **NOTATION STRICTE**: Suis EXACTEMENT la grille officielle (5+4+4+3+4 = 20 points max)

2. **CALCUL DU SCORE TOTAL**: 
   overall_score = structure_score + cohesion_score + vocabulary_score + grammar_score + task_score

3. **NIVEAU CECRL**: Applique RIGOUREUSEMENT le barème officiel:
   - 0-1: A1 non atteint
   - 2-5: A2
   - 6-9: B1
   - 10-13: B2
   - 14-17: C1
   - 18-20: C2

4. **PÉNALITÉS AUTOMATIQUES**:
   - Hors sujet → Maximum 5/20
   - Nombre de mots non respecté (±10%) → -2 points
   - Texte illisible ou incompréhensible → 0-1/20

5. **CORRECTIONS**: Identifie 4-6 erreurs PRINCIPALES avec explications claires

6. **SUGGESTIONS**: Donne 3-4 conseils CONCRETS et ACTIONNABLES

7. **TON**: Reste professionnel, encourageant mais objectif comme un vrai correcteur

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, SANS texte avant ou après, SANS balises markdown."""




# Dans app/modules/corrections/prompts.py

def get_combined_correction_prompt(
    task1_text: str,
    task1_instruction: str,
    task2_text: str,
    task2_instruction: str,
    task3_text: str,
    task3_instruction: str,
) -> str:
    """
    Générer le prompt pour corriger les 3 tâches d'expression écrite ensemble.
    
    Returns:
        Prompt complet pour évaluation globale
    """
    
    return f"""Tu es un correcteur officiel du TCF Canada certifié par France Éducation international.

# CONTEXTE
Le candidat a réalisé les 3 tâches obligatoires de l'épreuve d'expression écrite du TCF Canada.
Tu dois évaluer l'ENSEMBLE de ces 3 productions pour donner UN SEUL SCORE GLOBAL sur 20 points.

# TÂCHE 1 : DESCRIPTION/EXPLICATION
Consigne: {task1_instruction}

Texte du candidat:
{task1_text}

---

# TÂCHE 2 : RÉCIT/NARRATION
Consigne: {task2_instruction}

Texte du candidat:
{task2_text}

---

# TÂCHE 3 : ARGUMENTATION/COMPARAISON
Consigne: {task3_instruction}

Texte du candidat:
{task3_text}

---

# TA MISSION
Évalue l'ENSEMBLE des 3 productions selon la grille officielle du TCF Canada.
Le score final sur 20 points reflète la performance GLOBALE sur les 3 tâches.

# GRILLE OFFICIELLE D'ÉVALUATION TCF CANADA (Note sur 20)

## 1. STRUCTURE ET ORGANISATION GLOBALE (5 points)
- Clarté de la présentation dans chaque tâche
- Organisation logique de chaque production
- Adaptation de la structure au type de tâche
- Progression cohérente des idées

## 2. COHÉSION ET COHÉRENCE (4 points)
- Liens logiques entre phrases et paragraphes
- Utilisation correcte des connecteurs logiques
- Fluidité de la lecture dans les 3 productions
- Progression thématique cohérente

## 3. RICHESSE LEXICALE (4 points)
- Variété du vocabulaire à travers les 3 tâches
- Précision et adéquation des termes
- Capacité à utiliser un vocabulaire adapté au contexte
- Registre de langue approprié

## 4. GRAMMAIRE ET ORTHOGRAPHE (3 points)
- Correction grammaticale générale
- Conjugaison des verbes
- Accords (genre, nombre)
- Orthographe correcte

## 5. PERTINENCE ET RÉALISATION DES TÂCHES (4 points)
- Respect des consignes de chaque tâche
- Messages clairs et compréhensibles
- Adaptation au destinataire et au contexte
- Capacité à traiter différents types de productions

# BARÈME DE CONVERSION CECRL (Officiel TCF Canada)
- **A1 non atteint**: 0-1 point
- **A2**: 2-5 points
- **B1**: 6-9 points
- **B2**: 10-13 points
- **C1**: 14-17 points
- **C2**: 18-20 points

# FORMAT DE RÉPONSE (JSON STRICT)

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans ```):

{{
  "global_assessment": {{
    "overall_score": 15,
    "cecrl_level": "B2",
    "appreciation": "Appréciation générale sur la performance globale"
  }},
  
  "criteria_scores": {{
    "structure_score": 4,
    "structure_feedback": "Analyse de la structure à travers les 3 tâches",
    
    "cohesion_score": 3,
    "cohesion_feedback": "Évaluation de la cohésion globale",
    
    "vocabulary_score": 3,
    "vocabulary_feedback": "Analyse du vocabulaire utilisé",
    
    "grammar_score": 2,
    "grammar_feedback": "Évaluation grammaticale globale",
    
    "task_score": 3,
    "task_feedback": "Respect des consignes des 3 tâches"
  }},
  
  "task_feedbacks": {{
    "task1": {{
      "corrected_text": "Texte 1 corrigé",
      "main_strengths": ["Point fort 1", "Point fort 2"],
      "main_weaknesses": ["Point faible 1", "Point faible 2"]
    }},
    "task2": {{
      "corrected_text": "Texte 2 corrigé",
      "main_strengths": ["Point fort 1"],
      "main_weaknesses": ["Point faible 1"]
    }},
    "task3": {{
      "corrected_text": "Texte 3 corrigé",
      "main_strengths": ["Point fort 1"],
      "main_weaknesses": ["Point faible 1"]
    }}
  }},
  
  "corrections": [
    {{"error": "erreur identifiée", "correction": "correction proposée", "task": "1|2|3", "explanation": "explication"}},
    {{"error": "autre erreur", "correction": "correction", "task": "1|2|3", "explanation": "pourquoi"}}
  ],
  
  "suggestions": [
    "Conseil 1 pour améliorer globalement",
    "Conseil 2 pour les prochaines productions",
    "Conseil 3 actionnable"
  ]
}}

# INSTRUCTIONS CRITIQUES

1. **UN SEUL SCORE GLOBAL**: Les 3 tâches donnent UN score sur 20, pas 3 scores séparés

2. **NOTATION STRICTE**: Suis EXACTEMENT la grille (5+4+4+3+4 = 20 points max)

3. **CALCUL**: overall_score = structure + cohesion + vocabulary + grammar + task

4. **NIVEAU CECRL**: Applique le barème officiel

5. **CORRECTIONS**: 5-8 erreurs PRINCIPALES à travers les 3 tâches

6. **TON**: Professionnel, encourageant, objectif

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, SANS texte avant/après, SANS balises markdown."""