import enum

from sqlalchemy import JSON, Column, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class MatchStatus(str, enum.Enum):
    upcoming = "Upcoming"
    completed = "Completed"
    live = "Live"


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    team_a_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    team_b_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    date_time = Column(DateTime(timezone=True), nullable=False, index=True)
    venue = Column(String(200), nullable=False)
    status = Column(
        Enum(MatchStatus, name="match_status"), nullable=False, default=MatchStatus.upcoming
    )
    winner_team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)

    team_a_runs = Column(Integer, nullable=False, default=0)
    team_a_wickets = Column(Integer, nullable=False, default=0)
    team_a_overs = Column(Float, nullable=False, default=0.0)

    team_b_runs = Column(Integer, nullable=False, default=0)
    team_b_wickets = Column(Integer, nullable=False, default=0)
    team_b_overs = Column(Float, nullable=False, default=0.0)

    current_innings = Column(Integer, nullable=False, default=1)
    striker_id = Column(Integer, ForeignKey("players.id", ondelete="SET NULL"), nullable=True)
    non_striker_id = Column(Integer, ForeignKey("players.id", ondelete="SET NULL"), nullable=True)
    bowler_id = Column(Integer, ForeignKey("players.id", ondelete="SET NULL"), nullable=True)
    commentary = Column(JSON, nullable=False, default=list)

    team_a = relationship("Team", foreign_keys=[team_a_id])
    team_b = relationship("Team", foreign_keys=[team_b_id])
    winner_team = relationship("Team", foreign_keys=[winner_team_id])

    striker = relationship("Player", foreign_keys=[striker_id])
    non_striker = relationship("Player", foreign_keys=[non_striker_id])
    bowler = relationship("Player", foreign_keys=[bowler_id])
