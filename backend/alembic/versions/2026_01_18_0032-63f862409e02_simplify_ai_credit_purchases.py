"""simplify_ai_credit_purchases

Revision ID: 32eeb8672594
Revises: 5b9e3fb7226f
Create Date: 2026-01-17 11:04:38.930165

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '32eeb8672594'
down_revision = '5b9e3fb7226f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Supprimer les anciennes tables si elles existent
    op.execute("DROP TABLE IF EXISTS ai_credit_purchases CASCADE")
    op.execute("DROP TABLE IF EXISTS ai_credit_packs CASCADE")
    
    # Créer la nouvelle table simplifiée
    op.create_table(
        'ai_credit_purchases',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('payment_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('payments.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('credits_purchased', sa.Integer(), nullable=False),
        sa.Column('price_per_credit', sa.Numeric(10, 2), nullable=False),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    
    # Créer l'index
    op.create_index('idx_ai_credit_purchases_payment_id', 'ai_credit_purchases', ['payment_id'])


def downgrade() -> None:
    op.drop_index('idx_ai_credit_purchases_payment_id', table_name='ai_credit_purchases')
    op.drop_table('ai_credit_purchases')