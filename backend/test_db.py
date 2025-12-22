"""Test de connexion à la base de données."""

import asyncio
from app.shared.database.session import check_db_connection, init_db


async def main():
    print("🔍 Test de connexion à la base de données...")
    
    # Test 1: Vérifier la connexion
    if await check_db_connection():
        print("✅ Connexion DB OK")
    else:
        print("❌ Connexion DB Failed")
        return
    
    # Test 2: Initialiser les tables (optionnel)
    # print("\n📦 Création des tables...")
    # await init_db()
    # print("✅ Tables créées")


if __name__ == "__main__":
    asyncio.run(main())