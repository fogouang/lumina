"""cascade expression_orale_attempts

Revision ID: ae4f4a91a1b2
Revises: e5751e0441ea
Create Date: 2026-09-27 23:50:00

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'ae4f4a91a1b2'
down_revision = 'e5751e0441ea'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint(
        "expression_orale_attempts_task_id_fkey",
        "expression_orale_attempts",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "expression_orale_attempts_task_id_fkey",
        "expression_orale_attempts",
        "expression_tasks",
        ["task_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint(
        "expression_orale_attempts_series_id_fkey",
        "expression_orale_attempts",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "expression_orale_attempts_series_id_fkey",
        "expression_orale_attempts",
        "series",
        ["series_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint(
        "expression_orale_attempts_series_id_fkey",
        "expression_orale_attempts",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "expression_orale_attempts_series_id_fkey",
        "expression_orale_attempts",
        "series",
        ["series_id"],
        ["id"],
    )

    op.drop_constraint(
        "expression_orale_attempts_task_id_fkey",
        "expression_orale_attempts",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "expression_orale_attempts_task_id_fkey",
        "expression_orale_attempts",
        "expression_tasks",
        ["task_id"],
        ["id"],
    )