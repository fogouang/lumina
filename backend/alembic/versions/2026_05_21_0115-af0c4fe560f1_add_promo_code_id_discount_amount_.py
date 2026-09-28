"""add promo_code_id discount_amount amount_paid commission_due to payments

Revision ID: af0c4fe560f1
Revises: 4b9b86447a07
Create Date: 2026-05-21 01:15:18.489240

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'af0c4fe560f1'
down_revision = '4b9b86447a07'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('partners',
    sa.Column('name', sa.String(length=150), nullable=False),
    sa.Column('contact_email', sa.String(length=255), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('contact_email')
    )
    op.create_table('promo_codes',
    sa.Column('partner_id', sa.UUID(), nullable=True),
    sa.Column('code', sa.String(length=50), nullable=False),
    sa.Column('discount_type', sa.String(length=10), nullable=False),
    sa.Column('discount_value', sa.Integer(), nullable=False),
    sa.Column('commission_rate', sa.Float(), nullable=False),
    sa.Column('max_uses', sa.Integer(), nullable=True),
    sa.Column('used_count', sa.Integer(), nullable=False),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint("discount_type != 'percent' OR discount_value <= 100", name='ck_promo_percent_max_100'),
    sa.CheckConstraint('commission_rate >= 0 AND commission_rate <= 100', name='ck_promo_commission_range'),
    sa.CheckConstraint('discount_value > 0', name='ck_promo_discount_positive'),
    sa.ForeignKeyConstraint(['partner_id'], ['partners.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('promo_codes', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_promo_codes_code'), ['code'], unique=True)
        batch_op.create_index(batch_op.f('ix_promo_codes_partner_id'), ['partner_id'], unique=False)

    with op.batch_alter_table('payments', schema=None) as batch_op:
        batch_op.add_column(sa.Column('promo_code_id', sa.UUID(), nullable=True))
        batch_op.add_column(sa.Column('discount_amount', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('amount_paid', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('commission_due', sa.Float(), nullable=False, server_default='0'))
        batch_op.create_index(batch_op.f('ix_payments_promo_code_id'), ['promo_code_id'], unique=False)
        batch_op.create_foreign_key(None, 'promo_codes', ['promo_code_id'], ['id'], ondelete='SET NULL')