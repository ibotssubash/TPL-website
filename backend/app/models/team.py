from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), unique=True, nullable=False, index=True)
    logo_url = Column(String(300), nullable=True)
    captain = Column(String(120), nullable=False)

    players = relationship(
        "Player",
        back_populates="team",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
