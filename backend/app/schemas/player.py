from pydantic import BaseModel, ConfigDict

from app.models.player import PlayerRole


class PlayerBase(BaseModel):
    name: str
    role: PlayerRole
    runs: int = 0
    wickets: int = 0
    strike_rate: float = 0.0


class PlayerCreate(PlayerBase):
    team_id: int


class PlayerUpdate(BaseModel):
    name: str | None = None
    role: PlayerRole | None = None
    runs: int | None = None
    wickets: int | None = None
    strike_rate: float | None = None
    team_id: int | None = None


class PlayerRead(PlayerBase):
    id: int
    team_id: int
    team_name: str | None = None
    model_config = ConfigDict(from_attributes=True)


class TopPerformers(BaseModel):
    top_scorer: PlayerRead | None = None
    top_wicket_taker: PlayerRead | None = None
