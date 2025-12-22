"""
Gestion des sessions de base de données.

Ce module fournit:
- Le moteur SQLAlchemy async
- Le SessionLocal pour créer des sessions
- La dépendance get_db pour FastAPI
"""

from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import get_settings

settings = get_settings()


# === MOTEUR DE BASE DE DONNÉES ===

def create_engine() -> AsyncEngine:
    """
    Crée le moteur de base de données async.
    
    Configure le pool de connexions et les options de logging.
    
    Returns:
        AsyncEngine: Moteur SQLAlchemy async
        
    Note:
        - pool_size: Nombre de connexions maintenues ouvertes
        - max_overflow: Connexions supplémentaires si pool saturé
        - echo: Active le logging SQL (utile en dev)
    """
    return create_async_engine(
        str(settings.DATABASE_URL),
        echo=settings.DB_ECHO,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_pre_ping=True,  # Vérifie que la connexion est vivante avant utilisation
        pool_recycle=3600,   # Recycle les connexions après 1h
    )


# Instance globale du moteur
engine: AsyncEngine = create_engine()


# === SESSION MAKER ===

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Garde les objets accessibles après commit
    autoflush=False,         # Contrôle manuel du flush
    autocommit=False,        # Transactions explicites
)


# === DÉPENDANCE FASTAPI ===

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dépendance FastAPI pour obtenir une session de base de données.
    
    Gère automatiquement:
    - Création de la session
    - Commit si succès
    - Rollback si erreur
    - Fermeture de la session
    
    Yields:
        AsyncSession: Session SQLAlchemy active
        
    Example:
        >>> from fastapi import APIRouter, Depends
        >>> from sqlalchemy.ext.asyncio import AsyncSession
        >>> 
        >>> router = APIRouter()
        >>> 
        >>> @router.get("/users")
        >>> async def get_users(db: AsyncSession = Depends(get_db)):
        ...     result = await db.execute(select(User))
        ...     return result.scalars().all()
        
    Note:
        Le commit/rollback automatique est géré par le context manager.
        Pour des opérations complexes, vous pouvez gérer manuellement:
        
        >>> async with get_db() as db:
        ...     try:
        ...         # Vos opérations
        ...         await db.commit()
        ...     except Exception:
        ...         await db.rollback()
        ...         raise
    """
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Type annoté pour faciliter l'utilisation dans les endpoints
DbSession = Annotated[AsyncSession, Depends(get_db)]


# === UTILITAIRES ===

async def init_db() -> None:
    """
    Initialise la base de données.
    
    Crée toutes les tables définies dans les modèles.
    
    Warning:
        À utiliser uniquement en développement!
        En production, utilisez Alembic pour les migrations.
        
    Example:
        >>> import asyncio
        >>> from app.shared.database.session import init_db
        >>> 
        >>> async def main():
        ...     await init_db()
        ...     print("Base de données initialisée!")
        >>> 
        >>> asyncio.run(main())
    """
    from app.shared.database.base import Base
    
    async with engine.begin() as conn:
        # Attention: Ceci DROP et recrée toutes les tables!
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """
    Ferme proprement toutes les connexions à la base de données.
    
    À appeler lors du shutdown de l'application.
    
    Example:
        >>> # Dans app/main.py
        >>> from fastapi import FastAPI
        >>> from app.shared.database.session import close_db
        >>> 
        >>> app = FastAPI()
        >>> 
        >>> @app.on_event("shutdown")
        >>> async def shutdown_event():
        ...     await close_db()
    """
    await engine.dispose()


async def check_db_connection() -> bool:
    """
    Vérifie que la connexion à la base de données fonctionne.
    
    Returns:
        bool: True si la connexion est OK, False sinon
        
    Example:
        >>> import asyncio
        >>> from app.shared.database.session import check_db_connection
        >>> 
        >>> async def main():
        ...     if await check_db_connection():
        ...         print("✅ Connexion DB OK")
        ...     else:
        ...         print("❌ Connexion DB Failed")
        >>> 
        >>> asyncio.run(main())
    """
    try:
        from sqlalchemy import text  # Import nécessaire
        
        async with SessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"❌ Erreur connexion DB: {e}")
        return False