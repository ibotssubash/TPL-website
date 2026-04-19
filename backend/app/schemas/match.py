from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.match import MatchStatus
from app.schemas.team import TeamRead


class MatchBase(BaseModel):
    team_a_id: int
    team_b_id: int
    date_time: datetime
    venue: str
    status: MatchStatus = MatchStatus.upcoming
    winner_team_id: int | None = None

    team_a_runs: int = 0
    team_a_wickets: int = 0
    team_a_overs: float = 0.0
    team_b_runs: int = 0
    team_b_wickets: int = 0
    team_b_overs: float = 0.0
    current_innings: int = 1
    striker_id: int | None = None
    non_striker_id: int | None = None
    bowler_id: int | None = None
    commentary: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_teams(self):
        if self.team_a_id == self.team_b_id:
            raise ValueError("team_a_id and team_b_id cannot be the same")
        return self


class MatchCreate(MatchBase):
    pass


class MatchUpdate(BaseModel):
    team_a_id: int | None = None
    team_b_id: int | None = None
    date_time: datetime | None = None
    venue: str | None = None
    status: MatchStatus | None = None
    winner_team_id: int | None = None

    team_a_runs: int | None = None
    team_a_wickets: int | None = None
    team_a_overs: float | None = None
    team_b_runs: int | None = None
    team_b_wickets: int | None = None
    team_b_overs: float | None = None
    current_innings: int | None = None
    striker_id: int | None = None
    non_striker_id: int | None = None
    bowler_id: int | None = None
    commentary: list[str] | None = None


class MatchScoreUpdate(BaseModel):
    status: MatchStatus | None = None
    winner_team_id: int | None = None

    team_a_runs: int | None = None
    team_a_wickets: int | None = None
    team_a_overs: float | None = None
    team_b_runs: int | None = None
    team_b_wickets: int | None = None
    team_b_overs: float | None = None
    current_innings: int | None = None
    striker_id: int | None = None
    non_striker_id: int | None = None
    bowler_id: int | None = None
    commentary: list[str] | None = None


class MatchRead(BaseModel):
    id: int
    team_a_id: int
    team_b_id: int
    date_time: datetime
    venue: str
    status: MatchStatus
    winner_team_id: int | None = None

    team_a_runs: int
    team_a_wickets: int
    team_a_overs: float
    team_b_runs: int
    team_b_wickets: int
    team_b_overs: float
    current_innings: int
    striker_id: int | None = None
    non_striker_id: int | None = None
    bowler_id: int | None = None
    commentary: list[str]

    team_a: TeamRead | None = None
    team_b: TeamRead | None = None
    winner_team: TeamRead | None = None

    model_config = ConfigDict(from_attributes=True)
