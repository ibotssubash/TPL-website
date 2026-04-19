"""add media and live stream tables

Revision ID: 20260416_0002
Revises: 20260416_0001
Create Date: 2026-04-16
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260416_0002"
down_revision: Union[str, Sequence[str], None] = "20260416_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "media_assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("original_name", sa.String(length=255), nullable=False),
        sa.Column("stored_name", sa.String(length=255), nullable=False),
        sa.Column("file_url", sa.String(length=500), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stored_name"),
    )
    op.create_index(op.f("ix_media_assets_id"), "media_assets", ["id"], unique=False)
    op.create_index(op.f("ix_media_assets_stored_name"), "media_assets", ["stored_name"], unique=False)

    op.create_table(
        "live_stream_configs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stream_url", sa.String(length=500), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_live_stream_configs_id"), "live_stream_configs", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_live_stream_configs_id"), table_name="live_stream_configs")
    op.drop_table("live_stream_configs")

    op.drop_index(op.f("ix_media_assets_stored_name"), table_name="media_assets")
    op.drop_index(op.f("ix_media_assets_id"), table_name="media_assets")
    op.drop_table("media_assets")
