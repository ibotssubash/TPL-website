from fastapi import APIRouter

from app.api import auth, dashboard, matches, media, players, teams

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(teams.router)
api_router.include_router(players.router)
api_router.include_router(matches.router)
api_router.include_router(dashboard.router)
api_router.include_router(media.router)
