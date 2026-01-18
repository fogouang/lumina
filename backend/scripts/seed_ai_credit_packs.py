"""
Script pour créer les packs de crédits IA initiaux.
"""
import asyncio
import sys
from pathlib import Path

# ✅ Ajouter le backend au path Python
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

# ✅ Changer le working directory vers backend/
import os
os.chdir(backend_path)

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import get_settings
from app.modules.ai_credit_purchases.models import AICreditPack

settings = get_settings()

async def seed_packs():
    """Créer les packs de crédits par défaut."""
    # ✅ Convertir PostgresDsn en string
    engine = create_async_engine(str(settings.DATABASE_URL), echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Vérifier si des packs existent déjà
        from sqlalchemy import select
        result = await session.execute(select(AICreditPack))
        existing = result.scalars().all()
        
        if existing:
            print(f"✅ {len(existing)} pack(s) déjà existant(s), skip seed.")
            return
        
        # Créer les packs
        packs = [
            AICreditPack(
                name="Pack Starter",
                credits=20,
                bonus_credits=0,
                price=1000,
                description="Idéal pour démarrer avec l'IA",
                is_active=True,
                display_order=1
            ),
            AICreditPack(
                name="Pack Standard",
                credits=50,
                bonus_credits=5,
                price=2000,
                description="Meilleur rapport qualité-prix (+10% bonus)",
                is_active=True,
                display_order=2
            ),
            AICreditPack(
                name="Pack Premium",
                credits=100,
                bonus_credits=20,
                price=3500,
                description="Maximum d'économies (+20% bonus)",
                is_active=True,
                display_order=3
            ),
            AICreditPack(
                name="Pack Pro",
                credits=200,
                bonus_credits=50,
                price=6000,
                description="Pour les utilisateurs intensifs (+25% bonus)",
                is_active=True,
                display_order=4
            ),
        ]
        
        session.add_all(packs)
        await session.commit()
        
        print(f"✅ {len(packs)} packs de crédits créés avec succès!")
        for pack in packs:
            print(f"  - {pack.name}: {pack.total_credits} crédits pour {pack.price} FCFA")

if __name__ == "__main__":
    asyncio.run(seed_packs())