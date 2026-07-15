"""
Dependencies FastAPI pour Expression Orale.
"""

from app.shared.database.session import DbSession

from .service import ExpressionOraleService


async def get_expression_orale_service(db: DbSession) -> ExpressionOraleService:
    """
    Dépendance pour obtenir le service Expression Orale.
    """
    return ExpressionOraleService(db)