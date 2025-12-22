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

api_router = APIRouter()

# Enregistrer les routes
api_router.include_router(auth_router,  tags=["Authentication"])
api_router.include_router(users_router,  tags=["Users"])
api_router.include_router(plans_router, tags=["Plans"])
api_router.include_router(organizations_router,  tags=["Organizations"])
api_router.include_router(subscriptions_router,  tags=["Subscriptions"])
api_router.include_router(payments_router,  tags=["Payments"])