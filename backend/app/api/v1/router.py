"""
Router principal API v1.
"""

from fastapi import APIRouter

from app.modules.auth.controller import router as auth_router
from app.modules.users.controller import router as users_router
from app.modules.plans.controller import router as plans_router
from app.modules.organizations.controller import router as organizations_router
from app.modules.subscriptions.controller import router as subscriptions_router
from app.modules.payments.controller import router as payments_router
from app.modules.series.controller import router as series_router
from app.modules.upload.controller import router as upload_router
from app.modules.expression_tasks.controller import router as expression_tasks_router
from app.modules.exam_attempts.controller import router as exam_attempts_router
from app.modules.invoices.controller import router as invoices_router
from app.modules.written_expressions.controller import router as written_expressions_router
from app.modules.oral_expressions.controller import router as oral_expressions_router
from app.modules.notifications.controller import router as notifications_router
from app.modules.ai_credit_purchases import ai_credits_router
from app.modules.analytics import  analytics_router
from app.modules.public_expression.controller import router as public_expression_router
from app.modules.partners.controller import router as partners_router
from app.modules.promo_codes.controller import router as promo_codes_router
from app.modules.expression_orale.controller import router as expression_orale_router



api_router = APIRouter()

# Enregistrer les routes
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(plans_router)
api_router.include_router(organizations_router)
api_router.include_router(subscriptions_router)
api_router.include_router(payments_router)
api_router.include_router(series_router)
api_router.include_router(upload_router)
api_router.include_router(expression_tasks_router)
api_router.include_router(exam_attempts_router)
api_router.include_router(invoices_router)
api_router.include_router(written_expressions_router)
api_router.include_router(oral_expressions_router)
api_router.include_router(notifications_router)
api_router.include_router(ai_credits_router)
api_router.include_router(analytics_router)
api_router.include_router(public_expression_router)
api_router.include_router(partners_router)
api_router.include_router(promo_codes_router)
api_router.include_router(expression_orale_router)


