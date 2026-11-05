"""whatsapp invite columns

Revision ID: fa4cd22c8b0f
Revises: 7219e1d59eb5
Create Date: 2026-11-05 12:55:53.540398

"""
from app.modules.users.phone import normalize_phone
from alembic import op
import sqlalchemy as sa



# revision identifiers, used by Alembic.
revision = 'fa4cd22c8b0f'
down_revision = '7219e1d59eb5'
branch_labels = None
depends_on = None


def _normalize_existing_phones() -> None:
    """
    Avant l'index unique :
    - vide → NULL
    - valide → format +<indicatif><numéro>
    - invalide ou doublon après normalisation → NULL (modale téléphone à la connexion)
    """
    conn = op.get_bind()
    rows = conn.execute(
        sa.text("SELECT id, phone FROM users WHERE phone IS NOT NULL ORDER BY created_at")
    ).fetchall()

    seen: set[str] = set()
    for user_id, raw in rows:
        new_value = None
        try:
            normalized = normalize_phone(raw)
            if normalized not in seen:
                new_value = normalized
                seen.add(normalized)
        except ValueError:
            new_value = None

        if new_value != raw:
            conn.execute(
                sa.text("UPDATE users SET phone = :phone WHERE id = :id"),
                {"phone": new_value, "id": user_id},
            )


def upgrade() -> None:
    _normalize_existing_phones()

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('whatsapp_invite_clicked_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('whatsapp_invite_dismissed_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('whatsapp_invite_dismiss_count', sa.Integer(), server_default='0', nullable=False))
        batch_op.alter_column('email',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)
        batch_op.create_index(batch_op.f('ix_users_phone'), ['phone'], unique=True)


def downgrade() -> None:
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_users_phone'))
        batch_op.alter_column('email',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
        batch_op.drop_column('whatsapp_invite_dismiss_count')
        batch_op.drop_column('whatsapp_invite_dismissed_at')
        batch_op.drop_column('whatsapp_invite_clicked_at')