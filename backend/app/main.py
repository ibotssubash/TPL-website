from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.database import SessionLocal
from app.services.seed import seed_default_admin

app = FastAPI(title=settings.app_name)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_dir = Path(settings.upload_dir)
upload_dir.mkdir(parents=True, exist_ok=True)
upload_url_prefix = (
    settings.upload_url_prefix
    if settings.upload_url_prefix.startswith("/")
    else f"/{settings.upload_url_prefix}"
)
app.mount(upload_url_prefix, StaticFiles(directory=str(upload_dir)), name="uploads")

app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "Trichy Premier League API is running"}


@app.on_event("startup")
def startup_seed_admin():
    db = SessionLocal()
    try:
        seed_default_admin(db)
    finally:
        db.close()
