import enum

from sqlalchemy import Column, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class PlayerRole(str, enum.Enum):
    batsman = "Batsman"
    bowler = "Bowler"
    all_rounder = "All-rounder"


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False, index=True)
    role = Column(Enum(PlayerRole, name="player_role"), nullable=False)
    runs = Column(Integer, nullable=False, default=0)
    wickets = Column(Integer, nullable=False, default=0)
    strike_rate = Column(Float, nullable=False, default=0.0)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)

    team = relationship("Team", back_populates="players")
