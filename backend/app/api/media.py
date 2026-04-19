from pathlib import Path
import shutil
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.dependencies import get_current_admin, get_db
from app.models.media import LiveStreamConfig, MediaAsset
from app.schemas.media import LiveStreamRead, LiveStreamUpdate, MediaAssetRead

router = APIRouter(prefix="/media", tags=["Media"])

upload_url_prefix = (
    settings.upload_url_prefix
    if settings.upload_url_prefix.startswith("/")
    else f"/{settings.upload_url_prefix}"
)


def _safe_extension(filename: str) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}:
        return suffix
    return ".jpg"


def _get_or_create_stream_config(db: Session) -> LiveStreamConfig:
    config = db.query(LiveStreamConfig).order_by(LiveStreamConfig.id.asc()).first()
    if config:
        return config
    config = LiveStreamConfig(stream_url=None)
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


@router.get("/images", response_model=list[MediaAssetRead])
def list_images(db: Session = Depends(get_db)):
    return db.query(MediaAsset).order_by(MediaAsset.created_at.desc()).all()


@router.post("/images/upload", response_model=list[MediaAssetRead], status_code=status.HTTP_201_CREATED)
def upload_images(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    saved_assets: list[MediaAsset] = []
    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file.filename}' is not a valid image.",
            )
        ext = _safe_extension(file.filename or "")
        stored_name = f"{uuid4().hex}{ext}"
        destination = upload_dir / stored_name
        with destination.open("wb") as output:
            shutil.copyfileobj(file.file, output)

        asset = MediaAsset(
            original_name=file.filename or stored_name,
            stored_name=stored_name,
            file_url=f"{upload_url_prefix}/{stored_name}",
        )
        db.add(asset)
        saved_assets.append(asset)

    db.commit()
    for asset in saved_assets:
        db.refresh(asset)
    return saved_assets


@router.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    asset = db.query(MediaAsset).filter(MediaAsset.id == image_id).first()
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    image_path = Path(settings.upload_dir) / asset.stored_name
    db.delete(asset)
    db.commit()
    if image_path.exists():
        image_path.unlink(missing_ok=True)
    return None


@router.get("/live-stream", response_model=LiveStreamRead)
def get_live_stream(db: Session = Depends(get_db)):
    config = db.query(LiveStreamConfig).order_by(LiveStreamConfig.id.asc()).first()
    if not config:
        return LiveStreamRead(stream_url=None, updated_at=None)
    return LiveStreamRead(stream_url=config.stream_url, updated_at=config.updated_at)


@router.put("/live-stream", response_model=LiveStreamRead)
def update_live_stream(
    payload: LiveStreamUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    config = _get_or_create_stream_config(db)
    config.stream_url = payload.stream_url.strip() if payload.stream_url else None
    db.commit()
    db.refresh(config)
    return LiveStreamRead(stream_url=config.stream_url, updated_at=config.updated_at)
