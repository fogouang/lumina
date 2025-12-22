"""
Configuration Alembic pour les migrations de base de données.

Ce fichier est utilisé par Alembic pour:
- Se connecter à la base de données
- Détecter les changements dans les modèles
- Générer et appliquer les migrations
"""

from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from sqlalchemy.engine import Connection

from alembic import context

# Import de la configuration de l'app
from app.config import get_settings
from app.shared.database.base import Base

# Import de tous les modèles pour que Alembic les détecte
# IMPORTANT: Ajouter tous les imports de modèles ici au fur et à mesure
# from app.modules.users.models import User
# from app.modules.organizations.models import Organization
# etc...

# Remplace la section imports par:
from app.modules.analytics.models import StudentAggregatedStats
from app.modules.comprehension_answers.models import ComprehensionAnswer, ComprehensionResult
from app.modules.exam_attempts.models import ExamAttempt
from app.modules.expression_tasks.models import ExpressionTask
from app.modules.notifications.models import Notification
from app.modules.oral_expressions.models import OralExpression, OralExpressionCorrection
from app.modules.organizations.models import Organization
from app.modules.payments.models import Payment
from app.modules.plans.models import Plan
from app.modules.questions.models import ComprehensionQuestion
from app.modules.series.models import Series
from app.modules.subscriptions.models import OrganizationSubscription, Subscription
from app.modules.users.models import User
from app.modules.written_expressions.models import (
    WrittenExpression,
    WrittenExpressionAICorrection,
    WrittenExpressionManualCorrection,
)

settings = get_settings()

# this is the Alembic Config object
config = context.config

# Surcharge de l'URL de la base de données depuis .env
config.set_main_option("sqlalchemy.url", str(settings.DATABASE_URL_SYNC))

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    Utilisé pour générer des scripts SQL sans connexion DB.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    
    Utilise une connexion synchrone (psycopg2) pour Alembic.
    """
    connectable = create_engine(
        str(settings.DATABASE_URL_SYNC),
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            render_as_batch=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()