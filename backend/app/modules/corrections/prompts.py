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




def get_combined_correction_prompt(
    task1_text: str,
    task1_instruction: str,
    task2_text: str,
    task2_instruction: str,
    task3_text: str,
    task3_instruction: str,
) -> str:
    """
    Générer le prompt pour corriger les 3 tâches selon la méthodologie officielle TCF Canada.
    
    Returns:
        Prompt complet pour évaluation globale
    """
    
    return f"""Tu es un correcteur officiel du TCF Canada certifié par France Éducation international.

# CONTEXTE
Le candidat a réalisé les 3 tâches obligatoires de l'épreuve d'expression écrite du TCF Canada.
Tu dois évaluer l'ENSEMBLE de ces 3 productions pour donner UN SEUL SCORE GLOBAL sur 20 points.

═══════════════════════════════════════════════════════════════════════════
# TÂCHE 1 : MESSAGE (DESCRIPTION/EXPLICATION) - 60-120 mots
═══════════════════════════════════════════════════════════════════════════

**Consigne:** {task1_instruction}

**Texte du candidat:**
{task1_text}

**STRUCTURE OBLIGATOIRE pour cette tâche:**
1. **Salutation appropriée:**
   - Exemples: "Bonjour Francis, j'espère que tu vas bien !"
   - "Bonsoir cher(e)s ami(e)s, j'espère que vous vous portez bien !"
   - "Bonjour Monsieur"

2. **Introduction claire de l'objet:**
   - Exemple: "Je t'écris afin de te parler de..."
   - "Suite à ta demande, je me permets de..."

3. **Corps du message (informations détaillées):**
   - Fournir les informations demandées
   - Décrire, raconter ou expliquer clairement

4. **Formule de recommandation:**
   - Exemple: "Je te suggère de..."
   - "Je t'invite à..."

5. **Formule de politesse:**
   - Exemples: "À très bientôt", "Cordialement", "Toutes mes salutations"

**EXEMPLE TYPE COMPLET (60-120 mots):**
```
Bonjour Yvan, j'espère que ce message te trouvera en pleine forme !

Une nouvelle aventure sportive m'attend, et je pense à quel point ce serait génial de la partager avec toi. Que dirais-tu de relever ce défi ensemble ?

En effet, j'ai repéré un club de fitness non loin de chez nous, et je suis convaincue que cela pourrait être une expérience motivante pour nous deux. Les séances débutent en fin d'après-midi, ce qui serait une excellente manière de décompresser après le travail. Nous pourrions nous soutenir mutuellement dans cette aventure pour atteindre nos objectifs de remise en forme. Si l'idée te plaît, discutons-en davantage !

J'attends ta réponse avec impatience.

À très bientôt,

Francine.
```
6. **Signature (prénom uniquement):**
   - Exemples: "Romeo", "Ines"

**NB CRITIQUE:**
- Utiliser les MAJUSCULES au début de chaque phrase et nom propre
- Utiliser le CONDITIONNEL et SUBJONCTIF (niveau C1/C2)
- Former plusieurs PARAGRAPHES
- Ponctuation correcte

═══════════════════════════════════════════════════════════════════════════
# TÂCHE 2 : ARTICLE DE BLOG (RÉCIT/NARRATION) - 120-150 mots
═══════════════════════════════════════════════════════════════════════════

**Consigne:** {task2_instruction}

**Texte du candidat:**
{task2_text}

**STRUCTURE OBLIGATOIRE pour un article de blog:**

1. **Titre accrocheur qui suscite l'envie de lecture:**
   - Exemples: "Un semestre mémorable", "Mon expérience enrichissante dans le monde du fitness"

2. **Salutation aux lecteurs:**
   - Exemples: "Bonjour à toutes et à tous, j'espère que vous vous portez bien"
   - "Chers internautes, bonjour !"

3. **Introduction (répondre à: QUI? QUOI? QUAND? OÙ?):**
   - Exemple: "Récemment, j'ai pris la décision d'ajouter une activité physique à ma routine quotidienne..."
   - "Après avoir passé six mois à l'étranger..."

4. **Expérience détaillée (répondre à: COMMENT?):**
   - **UTILISER "JE" à la première personne**
   - **CONNECTEURS LOGIQUES OBLIGATOIRES:** "En effet", "Plus précisément", "Ensuite", "De plus", "Ainsi"
   - Raconter ce qui a été fait, vu, entendu, retenu
   - Mentionner ce qui a suscité de l'intérêt
   - Exemple: "En effet, chaque séance d'entraînement est un nouveau défi. Les cours de cardio intense m'ont permis de découvrir..."

5. **Recommandation aux lecteurs:**
   - Exemple: "Je vous encourage vivement à..."
   - "Ainsi, chers lecteurs, je vous recommande..."

6. **Remerciements:**
   - Exemple: "Enfin, je tiens à vous remercier d'avoir consacré un peu de votre temps"

7. **Formule de politesse:**
   - Exemples: "À très bientôt", "Cordialement", "Restez connectés"

8. **Signature:**
   - Exemples: "Aboubakar", "Stephanie", "Votre fidèle blogueuse !"

**EXEMPLE TYPE COMPLET (120-150 mots):**
```
Titre : Mon expérience enrichissante dans le monde du fitness

Bonjour à tous,

Je suis ravie de partager avec vous le début de mon périple dans le monde du fitness. Récemment, j'ai pris la décision d'ajouter une activité physique à ma routine quotidienne, et rejoindre le club de fitness local a été une étape décisive.

En effet, chaque séance d'entraînement est un nouveau défi que je relève avec détermination. Les cours de cardio intense et les sessions de musculation m'ont permis de découvrir de nouvelles facettes de ma force intérieure. Je suis étonnée de constater à quel point cette nouvelle activité a déjà eu un impact positif sur ma vie quotidienne. Non seulement je me sens plus énergique, mais je remarque également des améliorations dans ma force et ma flexibilité.

Je vous encourage vivement à vous inscrire au club de fitness pour découvrir par vous-même les bienfaits de l'activité physique régulière.

Restez connectés pour suivre mon évolution dans ce passionnant voyage.

À bientôt,
Madeleine
```

═══════════════════════════════════════════════════════════════════════════
# TÂCHE 3 : ARGUMENTATION/COMPARAISON - 120-180 mots
═══════════════════════════════════════════════════════════════════════════

**Consigne:** {task3_instruction}

**Texte du candidat:**
{task3_text}

**STRUCTURE OBLIGATOIRE pour l'argumentation:**

1. **Titre résumant l'idée générale des 2 documents:**
   - Exemples: "La gratuité des musées", "L'Uniforme Scolaire : Entre Avantages et Limitations"

2. **PREMIER PARAGRAPHE (40-60 mots):**
   
   **a) Introduction du débat:**
   - Formules: "De nos jours, le débat sur [X] divise l'opinion publique"
   - "Aujourd'hui, la question de [X] divise l'opinion publique"
   - "La question de [X] suscite des débats passionnés"
   
   **b) Résumé du document 1:**
   - Formules: "Certaines personnes pensent que..."
   - "Certaines personnes trouvent que..."
   - "Selon [nom auteur], ..."
   
   **c) Résumé du document 2:**
   - Formules: "D'aucun trouvent que..."
   - "Par contre, d'autres pensent que..."
   - "[Nom auteur] quant à lui, affirme que..."

3. **DEUXIÈME PARAGRAPHE (Position personnelle):**
   - Formules: "À mon sens, ..."
   - "Personnellement, je suis convaincu que..."
   - "De mon point de vue, ..."
   - "À ce sujet, il est important/impératif/indéniable que..."

4. **TROISIÈME PARAGRAPHE (Argument 1 + justification + exemple):**
   - Commencer par: "Tout d'abord, ..." ou "Premièrement, ..."
   - Exemple: "Tout d'abord, la gratuité des musées élargit l'accès à la culture, favorisant ainsi l'égalité sociale. Par exemple, dans des villes où l'entrée est gratuite, le nombre de visiteurs issus de milieux socio-économiques divers a considérablement augmenté."

5. **QUATRIÈME PARAGRAPHE (Argument 2 + justification + exemple):**
   - Commencer par: "Ensuite, ..." ou "Puis, ..." ou "De plus, ..."
   - Exemple: "Ensuite, elle encourage la préservation culturelle en stimulant l'intérêt du public. Ainsi, des études ont montré que les visiteurs ayant bénéficié de l'accès gratuit sont plus enclins à participer à des initiatives de financement participatif."

6. **CONCLUSION (nuancée avec opinion contraire):**
   - Formules: "Pour conclure, bien que [votre opinion], il n'en demeure pas moins que [opinion contraire]"
   - "En somme, bien que [votre opinion], il n'en demeure pas moins que [opinion contraire]"
   - "En résumé, bien que [votre opinion], il n'en demeure pas moins que [opinion contraire]"

**EXEMPLE TYPE COMPLET (120-180 mots):**
```
Titre: La gratuité des musées

La question de la gratuité des musées suscite des débats passionnés. Certaines personnes soulignent les risques d'une forte fréquentation et l'épuisement des ressources financières. Par contre, d'autres disent que la gratuité favorise un accès à la culture pour le plus grand nombre.

Personnellement, je suis convaincu que l'accessibilité à la culture ne devrait pas être conditionnée par des barrières financières.

Tout d'abord, la gratuité des musées élargit l'accès à la culture, favorisant ainsi l'égalité sociale. Par exemple, dans des villes où l'entrée des musées est gratuite, le nombre de visiteurs issus de milieux socio-économiques divers a considérablement augmenté.

Ensuite, elle encourage la préservation culturelle en stimulant l'intérêt du public pour l'histoire et les arts. Ainsi, des études ont montré que les visiteurs qui ont bénéficié de l'accès gratuit sont plus enclins à participer à des initiatives de financement participatif.

En résumé, bien que la gratuité demeure une initiative cruciale pour encourager l'éducation culturelle, un équilibre peut être trouvé en explorant des alternatives tout en préservant la valeur fondamentale de l'accessibilité culturelle.
```

**NB:** Maximum 2 arguments. Concentrez-vous sur la qualité du français et des arguments.

═══════════════════════════════════════════════════════════════════════════
# GRILLE OFFICIELLE D'ÉVALUATION TCF CANADA (20 points)
═══════════════════════════════════════════════════════════════════════════

## 1. STRUCTURE ET ORGANISATION (5 points)
- Respect EXACT de la structure attendue pour chaque type de tâche
- Présence de TOUS les éléments requis (titre, salutation, introduction, corps, conclusion, signature)
- Organisation logique et progression cohérente
- Adaptation parfaite au destinataire et au contexte

## 2. COHÉSION ET COHÉRENCE (4 points)
- Utilisation CORRECTE des connecteurs logiques (tout d'abord, ensuite, par contre, cependant, en effet, ainsi, de plus)
- Liens logiques entre phrases et paragraphes
- Fluidité de la lecture
- Enchaînement cohérent des idées

## 3. RICHESSE LEXICALE (4 points)
- Variété du vocabulaire adapté au contexte
- Précision des termes utilisés
- Registre de langue approprié (formel/semi-formel selon la tâche)
- Absence de répétitions excessives

## 4. GRAMMAIRE ET ORTHOGRAPHE (3 points)
- Correction grammaticale générale
- Conjugaison correcte (passé composé, imparfait, conditionnel, subjonctif)
- Accords (genre, nombre)
- Orthographe et ponctuation
- **BONUS C1/C2:** Utilisation du conditionnel et subjonctif

## 5. PERTINENCE ET RÉALISATION DES TÂCHES (4 points)
- **CRITIQUE:** Respect ABSOLU de la consigne
- Message clair et compréhensible
- Adaptation PARFAITE au type de tâche demandé
- Nombre de mots respecté (±10% tolérance)

═══════════════════════════════════════════════════════════════════════════
# ⚠️ RÈGLES CRITIQUES POUR LA CORRECTION
═══════════════════════════════════════════════════════════════════════════

## ANALYSE DU RESPECT DE LA CONSIGNE

**AVANT de corriger, tu DOIS vérifier:**

### Pour la TÂCHE 1 (Message):
- ✅ A-t-il rédigé un MESSAGE avec salutation + signature?
- ✅ S'adresse-t-il au BON destinataire?
- ✅ Répond-il EXACTEMENT à la consigne?
- ❌ **SI HORS SUJET:** task_score = 0/4, overall_score MAX = 5/20

### Pour la TÂCHE 2 (Article de blog):
- ✅ A-t-il un TITRE accrocheur?
- ✅ A-t-il salué les lecteurs ("Bonjour à tous")?
- ✅ Utilise-t-il "JE" à la première personne?
- ✅ A-t-il des CONNECTEURS LOGIQUES ("En effet", "Ensuite", "Ainsi")?
- ✅ Parle-t-il d'une EXPÉRIENCE PERSONNELLE?
- ✅ A-t-il remercié les lecteurs à la fin?
- ❌ **SI HORS SUJET:** task_score = 0/4

### Pour la TÂCHE 3 (Argumentation):
- ✅ A-t-il un TITRE?
- ✅ A-t-il résumé les DEUX documents dans le 1er paragraphe?
- ✅ A-t-il donné SA POSITION ("Personnellement", "À mon sens")?
- ✅ A-t-il 2 ARGUMENTS avec "Tout d'abord" et "Ensuite"?
- ✅ Chaque argument a-t-il un EXEMPLE concret?
- ✅ A-t-il une CONCLUSION nuancée?
- ❌ **SI HORS SUJET:** task_score = 0/4

═══════════════════════════════════════════════════════════════════════════
## POUR LE TEXTE CORRIGÉ (corrected_text)
═══════════════════════════════════════════════════════════════════════════

### ⚠️ CAS 1: CANDIDAT HORS SUJET

**Tu DOIS réécrire ENTIÈREMENT le texte en:**
1. **RESPECTANT la structure EXACTE** du type de tâche
2. **SUIVANT les exemples types** fournis ci-dessus
3. **GARDANT le niveau de langue** du candidat
4. **RÉUTILISANT ses bonnes idées** si possible

**Exemple TÂCHE 2 - HORS SUJET:**
- Consigne: "Parler d'une nouvelle activité de loisir"
- Candidat: Écrit sur son artiste préféré (HORS SUJET)
- ✅ BON corrected_text: Article de blog COMPLET sur une activité sportive, avec titre, "Bonjour à tous", "JE", connecteurs, remerciements, signature

### ✅ CAS 2: CANDIDAT DANS LE SUJET

**Tu corriges UNIQUEMENT:**
- Fautes de grammaire et orthographe
- Connecteurs mal utilisés
- Formulations maladroites
- **MAIS tu gardes ses idées**

═══════════════════════════════════════════════════════════════════════════
## PÉNALITÉS AUTOMATIQUES
═══════════════════════════════════════════════════════════════════════════

1. **HORS SUJET:** Maximum 5/20
   - task_score = 0/4
   - Le corrected_text DOIT être réécrit EN ENTIER

2. **Pas de titre (tâche 2, 3):** structure_score -1

3. **Pas de connecteurs logiques:** cohesion_score MAX = 2/4

4. **Pas de "JE" dans tâche 2:** structure_score -1

5. **Pas de résumé des 2 documents (tâche 3):** task_score -2

6. **Moins de 2 arguments (tâche 3):** task_score -1

7. **Nombre de mots:** Hors fourchette → -2 points

═══════════════════════════════════════════════════════════════════════════
# FORMAT DE RÉPONSE JSON
═══════════════════════════════════════════════════════════════════════════

{{
  "global_assessment": {{
    "overall_score": 12,
    "cecrl_level": "B2",
    "appreciation": "Appréciation générale"
  }},
  
  "criteria_scores": {{
    "structure_score": 3,
    "structure_feedback": "Analyse structure",
    "cohesion_score": 3,
    "cohesion_feedback": "Analyse connecteurs",
    "vocabulary_score": 3,
    "vocabulary_feedback": "Analyse vocabulaire",
    "grammar_score": 2,
    "grammar_feedback": "Analyse grammaire",
    "task_score": 1,
    "task_feedback": "Respect consignes"
  }},
  
  "task_feedbacks": {{
    "task1": {{
      "corrected_text": "TEXTE RÉÉCRIT selon structure officielle si hors sujet",
      "main_strengths": ["Points forts"],
      "main_weaknesses": ["❌ HORS SUJET" si applicable]
    }},
    "task2": {{
      "corrected_text": "Article complet avec titre, salutation, JE, connecteurs, remerciements, signature",
      "main_strengths": ["Points forts"],
      "main_weaknesses": ["Points faibles"]
    }},
    "task3": {{
      "corrected_text": "Article avec titre, intro, résumés, position, 2 arguments, conclusion",
      "main_strengths": ["Points forts"],
      "main_weaknesses": ["Points faibles"]
    }}
  }},
  
  "corrections": [
    {{"error": "erreur", "correction": "fix", "task": "1", "explanation": "raison"}}
  ],
  
  "suggestions": [
    "Conseil structure",
    "Conseil connecteurs",
    "Conseil respect consignes"
  ]
}}

═══════════════════════════════════════════════════════════════════════════
# BARÈME CECRL | CALCUL SCORE
═══════════════════════════════════════════════════════════════════════════

**0-1:** A1 | **2-5:** A2 | **6-9:** B1 | **10-13:** B2 | **14-17:** C1 | **18-20:** C2

**overall_score = structure + cohesion + vocabulary + grammar + task**

COMMENCE TA RÉPONSE PAR {{ et TERMINE PAR }}. RIEN D'AUTRE."""