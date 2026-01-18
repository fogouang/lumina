"""
Import centralisé de tous les modèles dans le bon ordre.
"""
# 1. Base
from app.shared.database.base import Base

# 2. Tables d'association EN PREMIER (avant User/Organization)
from app.modules.organizations.associations import (
    organization_admins,
    organization_teachers,
)

# 3. Users et Organizations (après les tables d'association)
from app.modules.users.models import User, UserRole
from app.modules.organizations.models import Organization, OrganizationType

# 4. Plans & Subscriptions
from app.modules.plans.models import Plan
from app.modules.subscriptions.models import Subscription, OrganizationSubscription

# 5. Series & Tasks
from app.modules.series.models import Series
from app.modules.expression_tasks.models import ExpressionTask
from app.modules.questions.models import ComprehensionQuestion

# 6. Attempts & Answers
from app.modules.exam_attempts.models import ExamAttempt
from app.modules.comprehension_answers.models import ComprehensionAnswer, ComprehensionResult

# 7. Expressions
from app.modules.written_expressions.models import (
    WrittenExpression,
    WrittenExpressionAICorrection,
    WrittenExpressionManualCorrection,
)
from app.modules.oral_expressions.models import OralExpression, OralExpressionCorrection

# 8. Payments & Stats
from app.modules.payments.models import Payment
from app.modules.ai_credit_purchases.models import  AICreditPurchase
from app.modules.analytics.models import StudentAggregatedStats
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
    "AICreditPurchase",
    
    # Stats & Notifications
    "StudentAggregatedStats",
    "Notification",
]