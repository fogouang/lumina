"""
Script pour seed la base de données avec des données de test.

Usage:
    uv run python scripts/seed_db.py
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select

from app.modules.users.models import User
from app.shared.database.session import SessionLocal
from app.shared.enums import UserRole
from app.shared.security.password import hash_password


async def seed_users():
    """
    Créer des utilisateurs de test.
    """
    print("\n📝 Création des utilisateurs de test...")
    
    async with SessionLocal() as db:
        # Vérifier si des users existent déjà
        result = await db.execute(select(User))
        existing_users = result.scalars().all()
        
        if len(existing_users) > 0:
            print(f"⚠️  {len(existing_users)} utilisateur(s) existe(nt) déjà")
            response = input("Voulez-vous continuer? (o/N): ")
            if response.lower() != 'o':
                print("❌ Opération annulée")
                return
        
        # Admin platform
        admin = User(
            email="admin@tcf-canada.com",
            password_hash=hash_password("Admin123!"),
            first_name="Admin",
            last_name="Platform",
            phone="+237600000001",
            role=UserRole.PLATFORM_ADMIN,
            is_active=True
        )
        db.add(admin)
        
        # Admin organisation (centre)
        org_admin = User(
            email="centre@excellence.cm",
            password_hash=hash_password("Centre123!"),
            first_name="Jean",
            last_name="Directeur",
            phone="+237600000002",
            role=UserRole.ORG_ADMIN,
            is_active=True
        )
        db.add(org_admin)
        
        # Enseignant
        teacher = User(
            email="prof@excellence.cm",
            password_hash=hash_password("Prof123!"),
            first_name="Marie",
            last_name="Enseignante",
            phone="+237600000003",
            role=UserRole.TEACHER,
            is_active=True
        )
        db.add(teacher)
        
        # Étudiants
        students = [
            User(
                email=f"etudiant{i}@example.com",
                password_hash=hash_password("Student123!"),
                first_name=f"Étudiant{i}",
                last_name="Test",
                phone=f"+23760000000{i+3}",
                role=UserRole.STUDENT,
                is_active=True
            )
            for i in range(1, 6)  # 5 étudiants
        ]
        
        for student in students:
            db.add(student)
        
        await db.commit()
        
        print("\n✅ Utilisateurs créés:")
        print(f"   - 1 Admin Platform (admin@tcf-canada.com / Admin123!)")
        print(f"   - 1 Admin Centre (centre@excellence.cm / Centre123!)")
        print(f"   - 1 Enseignant (prof@excellence.cm / Prof123!)")
        print(f"   - 5 Étudiants (etudiant1@example.com ... etudiant5@example.com / Student123!)")


async def seed_all():
    """
    Seed toutes les données.
    """
    print("=" * 60)
    print("🌱 Seeding de la base de données TCF Canada")
    print("=" * 60)
    
    await seed_users()
    
    # TODO: Ajouter seed pour organizations, plans, etc.
    
    print("\n" + "=" * 60)
    print("✅ Seeding terminé!")
    print("=" * 60)


async def main():
    """Point d'entrée principal."""
    try:
        await seed_all()
    except KeyboardInterrupt:
        print("\n\n❌ Opération annulée par l'utilisateur")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())