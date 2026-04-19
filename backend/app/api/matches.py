from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_admin, get_db
from app.models.match import Match, MatchStatus
from app.models.player import Player
from app.models.team import Team
from app.schemas.match import MatchCreate, MatchRead, MatchScoreUpdate, MatchUpdate

router = APIRouter(prefix="/matches", tags=["Matches"])


def _validate_match_entities(
    db: Session,
    team_a_id: int | None = None,
    team_b_id: int | None = None,
    winner_team_id: int | None = None,
    striker_id: int | None = None,
    non_striker_id: int | None = None,
    bowler_id: int | None = None,
) -> None:
    for team_id in [team_a_id, team_b_id]:
        if team_id is not None and not db.query(Team).filter(Team.id == team_id).first():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team id")
    if team_a_id and team_b_id and team_a_id == team_b_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Teams in a match must be different"
        )

    if winner_team_id is not None and not db.query(Team).filter(Team.id == winner_team_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid winner_team_id"
        )

    for player_id in [striker_id, non_striker_id, bowler_id]:
        if player_id is not None and not db.query(Player).filter(Player.id == player_id).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid player id in live fields"
            )


@router.get("/", response_model=list[MatchRead])
def list_matches(
    status_filter: MatchStatus | None = Query(default=None, alias="status"),
    team_id: int | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Match)
    if status_filter:
        query = query.filter(Match.status == status_filter)
    if team_id:
        query = query.filter((Match.team_a_id == team_id) | (Match.team_b_id == team_id))
    return query.order_by(Match.date_time.desc()).offset(skip).limit(limit).all()


@router.get("/{match_id}", response_model=MatchRead)
def get_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    return match


@router.post("/", response_model=MatchRead, status_code=status.HTTP_201_CREATED)
def create_match(
    payload: MatchCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    _validate_match_entities(
        db,
        team_a_id=payload.team_a_id,
        team_b_id=payload.team_b_id,
        winner_team_id=payload.winner_team_id,
        striker_id=payload.striker_id,
        non_striker_id=payload.non_striker_id,
        bowler_id=payload.bowler_id,
    )
    match = Match(**payload.model_dump())
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


@router.put("/{match_id}", response_model=MatchRead)
def update_match(
    match_id: int,
    payload: MatchUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    data = payload.model_dump(exclude_unset=True)
    _validate_match_entities(
        db,
        team_a_id=data.get("team_a_id", match.team_a_id),
        team_b_id=data.get("team_b_id", match.team_b_id),
        winner_team_id=data.get("winner_team_id", match.winner_team_id),
        striker_id=data.get("striker_id", match.striker_id),
        non_striker_id=data.get("non_striker_id", match.non_striker_id),
        bowler_id=data.get("bowler_id", match.bowler_id),
    )

    for key, value in data.items():
        setattr(match, key, value)
    db.commit()
    db.refresh(match)
    return match


@router.patch("/{match_id}/score", response_model=MatchRead)
def update_match_score(
    match_id: int,
    payload: MatchScoreUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    data = payload.model_dump(exclude_unset=True)
    _validate_match_entities(
        db,
        winner_team_id=data.get("winner_team_id", match.winner_team_id),
        striker_id=data.get("striker_id", match.striker_id),
        non_striker_id=data.get("non_striker_id", match.non_striker_id),
        bowler_id=data.get("bowler_id", match.bowler_id),
    )

    for key, value in data.items():
        setattr(match, key, value)
    db.commit()
    db.refresh(match)
    return match


@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match(
    match_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    db.delete(match)
    db.commit()
    return None
