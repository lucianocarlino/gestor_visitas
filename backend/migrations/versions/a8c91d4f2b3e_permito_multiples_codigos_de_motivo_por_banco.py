"""permito multiples codigos de motivo por banco

Revision ID: a8c91d4f2b3e
Revises: 513fb6b5d360
Create Date: 2026-11-11 08:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a8c91d4f2b3e'
down_revision: Union[str, Sequence[str], None] = '513fb6b5d360'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'reporte_items',
        'codigo_motivo',
        existing_type=sa.String(length=50),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
    op.alter_column(
        'reporte_items',
        'codigo_res',
        existing_type=sa.String(length=50),
        type_=sa.String(length=255),
        existing_nullable=False,
    )
    op.alter_column(
        'reportes_sinclair',
        'codigo_motivo',
        existing_type=sa.String(length=50),
        type_=sa.String(length=255),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'reportes_sinclair',
        'codigo_motivo',
        existing_type=sa.String(length=255),
        type_=sa.String(length=50),
        existing_nullable=False,
    )
    op.alter_column(
        'reporte_items',
        'codigo_res',
        existing_type=sa.String(length=255),
        type_=sa.String(length=50),
        existing_nullable=False,
    )
    op.alter_column(
        'reporte_items',
        'codigo_motivo',
        existing_type=sa.String(length=255),
        type_=sa.String(length=50),
        existing_nullable=False,
    )
