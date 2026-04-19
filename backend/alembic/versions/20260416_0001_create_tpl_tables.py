"""create tpl tables

Revision ID: 20260416_0001
Revises:
Create Date: 2026-04-16
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260416_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


player_role = sa.Enum("batsman", "bowler", "all_rounder", name="player_role")
match_status = sa.Enum("upcoming", "completed", "live", name="match_status")


def upgrade() -> None:
    bind = op.get_bind()
    player_role.create(bind, checkfirst=True)
    match_status.create(bind, checkfirst=True)

    op.create_table(
        "admin_users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index(op.f("ix_admin_users_id"), "admin_users", ["id"], unique=False)
    op.create_index(op.f("ix_admin_users_username"), "admin_users", ["username"], unique=False)

    op.create_table(
        "teams",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("logo_url", sa.String(length=300), nullable=True),
        sa.Column("captain", sa.String(length=120), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_teams_id"), "teams", ["id"], unique=False)
    op.create_index(op.f("ix_teams_name"), "teams", ["name"], unique=False)

    op.create_table(
        "players",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("role", player_role, nullable=False),
        sa.Column("runs", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("wickets", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("strike_rate", sa.Float(), nullable=False, server_default="0"),
        sa.Column("team_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_players_id"), "players", ["id"], unique=False)
    op.create_index(op.f("ix_players_name"), "players", ["name"], unique=False)

    op.create_table(
        "matches",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("team_a_id", sa.Integer(), nullable=False),
        sa.Column("team_b_id", sa.Integer(), nullable=False),
        sa.Column("date_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("venue", sa.String(length=200), nullable=False),
        sa.Column("status", match_status, nullable=False, server_default="upcoming"),
        sa.Column("winner_team_id", sa.Integer(), nullable=True),
        sa.Column("team_a_runs", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("team_a_wickets", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("team_a_overs", sa.Float(), nullable=False, server_default="0"),
        sa.Column("team_b_runs", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("team_b_wickets", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("team_b_overs", sa.Float(), nullable=False, server_default="0"),
        sa.Column("current_innings", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("striker_id", sa.Integer(), nullable=True),
        sa.Column("non_striker_id", sa.Integer(), nullable=True),
        sa.Column("bowler_id", sa.Integer(), nullable=True),
        sa.Column("commentary", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.ForeignKeyConstraint(["bowler_id"], ["players.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["non_striker_id"], ["players.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["striker_id"], ["players.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["team_a_id"], ["teams.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["team_b_id"], ["teams.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["winner_team_id"], ["teams.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_matches_date_time"), "matches", ["date_time"], unique=False)
    op.create_index(op.f("ix_matches_id"), "matches", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_matches_id"), table_name="matches")
    op.drop_index(op.f("ix_matches_date_time"), table_name="matches")
    op.drop_table("matches")

    op.drop_index(op.f("ix_players_name"), table_name="players")
    op.drop_index(op.f("ix_players_id"), table_name="players")
    op.drop_table("players")

    op.drop_index(op.f("ix_teams_name"), table_name="teams")
    op.drop_index(op.f("ix_teams_id"), table_name="teams")
    op.drop_table("teams")

    op.drop_index(op.f("ix_admin_users_username"), table_name="admin_users")
    op.drop_index(op.f("ix_admin_users_id"), table_name="admin_users")
    op.drop_table("admin_users")

    bind = op.get_bind()
    match_status.drop(bind, checkfirst=True)
    player_role.drop(bind, checkfirst=True)
