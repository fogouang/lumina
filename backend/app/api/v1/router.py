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

api_router = APIRouter()

# Enregistrer les routes
api_router.include_router(auth_router,  tags=["Authentication"])
api_router.include_router(users_router,  tags=["Users"])
api_router.include_router(plans_router, tags=["Plans"])
api_router.include_router(organizations_router,  tags=["Organizations"])
api_router.include_router(subscriptions_router,  tags=["Subscriptions"])
api_router.include_router(payments_router,  tags=["Payments"])
api_router.include_router(series_router, tags=["Series & Questions"])
api_router.include_router(upload_router,  tags=["Upload"])
api_router.include_router(expression_tasks_router,  tags=["Expression Tasks"])
api_router.include_router(exam_attempts_router,  tags=["Exam Attempts"])
api_router.include_router(invoices_router, tags=["Invoices"])
api_router.include_router( written_expressions_router,tags=["Written Expressions"])
api_router.include_router( oral_expressions_router, tags=["Oral Expressions"])
api_router.include_router( notifications_router,tags=["Notifications"])