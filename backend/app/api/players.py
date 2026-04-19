from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_current_admin, get_db
from app.models.player import Player
from app.models.team import Team
from app.schemas.player import PlayerCreate, PlayerRead, PlayerUpdate, TopPerformers

router = APIRouter(prefix="/players", tags=["Players"])


def _serialize_player(player: Player) -> PlayerRead:
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


@router.get("/", response_model=list[PlayerRead])
def list_players(
    team_id: int | None = Query(default=None),
    search: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Player)
    if team_id:
        query = query.filter(Player.team_id == team_id)
    if search:
        query = query.filter(Player.name.ilike(f"%{search}%"))
    players = query.order_by(Player.runs.desc(), Player.wickets.desc()).offset(skip).limit(limit).all()
    return [_serialize_player(player) for player in players]


@router.get("/leaderboard", response_model=list[PlayerRead])
def leaderboard(
    limit: int = Query(default=10, ge=1, le=50), db: Session = Depends(get_db)
):
    players = db.query(Player).order_by(Player.runs.desc(), Player.wickets.desc()).limit(limit).all()
    return [_serialize_player(player) for player in players]


@router.get("/top-performers", response_model=TopPerformers)
def top_performers(db: Session = Depends(get_db)):
    top_scorer = db.query(Player).order_by(Player.runs.desc()).first()
    top_wicket_taker = db.query(Player).order_by(Player.wickets.desc()).first()
    return TopPerformers(
        top_scorer=_serialize_player(top_scorer) if top_scorer else None,
        top_wicket_taker=_serialize_player(top_wicket_taker) if top_wicket_taker else None,
    )


@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
    return _serialize_player(player)


@router.post("/", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
def create_player(
    payload: PlayerCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    team = db.query(Team).filter(Team.id == payload.team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team_id")
    player = Player(**payload.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return _serialize_player(player)


@router.put("/{player_id}", response_model=PlayerRead)
def update_player(
    player_id: int,
    payload: PlayerUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")

    if payload.team_id is not None:
        team = db.query(Team).filter(Team.id == payload.team_id).first()
        if not team:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team_id")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(player, key, value)

    db.commit()
    db.refresh(player)
    return _serialize_player(player)


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(
    player_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Player not found")
    db.delete(player)
    db.commit()
    return None
