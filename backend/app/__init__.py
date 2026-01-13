"""
Import centralisé de tous les modèles dans le bon ordre.
Ceci garantit que SQLAlchemy connaît tous les modèles et leurs relations.
"""

# 1. Importer Base en premier
from app.shared.database.base import Base

# 2. Importer les tables d'association (many-to-many)
from app.modules.organizations.associations import (
    organization_admins,
    organization_teachers,
)

# 3. Importer les modèles dans l'ordre le plus proche possible des dépendances

# Utilisateurs & Organisations (base de la hiérarchie)
from app.modules.users.models import User
from app.modules.organizations.models import Organization

# Plans & Souscriptions
from app.modules.plans.models import Plan
from app.modules.subscriptions.models import (
    Subscription,
    OrganizationSubscription,
)

# Séries d'examen & tâches
from app.modules.series.models import Series
from app.modules.expression_tasks.models import ExpressionTask

# Questions de compréhension (QCM)
from app.modules.questions.models import ComprehensionQuestion

# Tentatives d'examen & réponses
from app.modules.exam_attempts.models import ExamAttempt
from app.modules.comprehension_answers.models import (
    ComprehensionAnswer,
    ComprehensionResult,
)

# Productions écrites + corrections
from app.modules.written_expressions.models import (
    WrittenExpression,
    WrittenExpressionAICorrection,
    WrittenExpressionManualCorrection,
)

# Productions orales + corrections
from app.modules.oral_expressions.models import (
    OralExpression,
    OralExpressionCorrection,
)

# Paiements & factures
from app.modules.payments.models import Payment

# Statistiques agrégées étudiants (post-expiration)
from app.modules.analytics.models import StudentAggregatedStats

# Notifications
from app.modules.notifications.models import Notification

# 4. Export explicite (utile pour `from .models import *` ou introspection)
__all__ = [
    # Base & associations
    "Base",
    "organization_admins",
    "organization_teachers",
    
    # Core
    "User",
    "Organization",
    
    # Abonnements
    "Plan",
    "Subscription",
    "OrganizationSubscription",
    
    # Contenu examen
    "Series",
    "ExpressionTask",
    "ComprehensionQuestion",
    
    # Passage d'examen
    "ExamAttempt",
    "ComprehensionAnswer",
    "ComprehensionResult",
    
    # Expression écrite
    "WrittenExpression",
    "WrittenExpressionAICorrection",
    "WrittenExpressionManualCorrection",
    
    # Expression orale
    "OralExpression",
    "OralExpressionCorrection",
    
    # Paiement
    "Payment",
    
    # Stats & Notifications
    "StudentAggregatedStats",
    "Notification",
]