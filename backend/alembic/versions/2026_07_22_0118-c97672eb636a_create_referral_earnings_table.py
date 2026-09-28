"""create referral_earnings table

Revision ID: c97672eb636a
Revises: 25d00aaff3e7
Create Date: 2026-07-22 01:18:01.214232

NOTE: migration neutralisée. La création de referral_earnings est
faite dans 7d26f6e131b1 (de façon conditionnelle). On garde cette
révision vide pour ne pas casser les bases qui l'ont déjà appliquée.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c97672eb636a'
down_revision = '25d00aaff3e7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass