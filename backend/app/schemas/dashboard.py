from pydantic import BaseModel

from app.schemas.match import MatchRead
from app.schemas.player import PlayerRead


class PointsTableRow(BaseModel):
    team_id: int
    team_name: str
    logo_url: str | None = None
    matches_played: int
    wins: int
    losses: int
    points: int
    net_run_rate: float


class HomeResponse(BaseModel):
    upcoming_matches: list[MatchRead]
    top_scorer: PlayerRead | None = None
    top_wicket_taker: PlayerRead | None = None


class LiveMatchResponse(BaseModel):
    match: MatchRead | None = None
    striker_name: str | None = None
    non_striker_name: str | None = None
    bowler_name: str | None = None
