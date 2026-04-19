from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.match import Match, MatchStatus
from app.models.player import Player
from app.models.team import Team
from app.schemas.dashboard import HomeResponse, LiveMatchResponse, PointsTableRow
from app.schemas.player import PlayerRead
from app.services.points import build_points_table

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _player_to_read(player: Player | None) -> PlayerRead | None:
    if not player:
        return None
    return PlayerRead(
        id=player.id,
        name=player.name,
        role=player.role,
        runs=player.runs,
        wickets=player.wickets,
        strike_rate=player.strike_rate,
        team_id=player.team_id,
        team_name=player.team.name if player.team else None,
    )


@router.get("/home", response_model=HomeResponse)
def home_data(limit: int = Query(default=3, ge=1, le=10), db: Session = Depends(get_db)):
    upcoming_matches = (
        db.query(Match)
        .filter(Match.status == MatchStatus.upcoming)
        .order_by(Match.date_time.asc())
        .limit(limit)
        .all()
    )
    top_scorer = db.query(Player).order_by(Player.runs.desc()).first()
    top_wicket_taker = db.query(Player).order_by(Player.wickets.desc()).first()
    return HomeResponse(
        upcoming_matches=upcoming_matches,
        top_scorer=_player_to_read(top_scorer),
        top_wicket_taker=_player_to_read(top_wicket_taker),
    )


@router.get("/points-table", response_model=list[PointsTableRow])
def points_table(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    completed_matches = db.query(Match).filter(Match.status == MatchStatus.completed).all()
    return build_points_table(teams, completed_matches)


@router.get("/live-match", response_model=LiveMatchResponse)
def live_match(db: Session = Depends(get_db)):
    live = (
        db.query(Match)
        .filter(Match.status == MatchStatus.live)
        .order_by(Match.date_time.desc())
        .first()
    )
    if not live:
        return LiveMatchResponse(match=None)
    return LiveMatchResponse(
        match=live,
        striker_name=live.striker.name if live.striker else None,
        non_striker_name=live.non_striker.name if live.non_striker else None,
        bowler_name=live.bowler.name if live.bowler else None,
    )
