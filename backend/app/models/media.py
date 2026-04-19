from sqlalchemy import Column, DateTime, Integer, String, func

from app.database import Base


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)
    original_name = Column(String(255), nullable=False)
    stored_name = Column(String(255), nullable=False, unique=True, index=True)
    file_url = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class LiveStreamConfig(Base):
    __tablename__ = "live_stream_configs"

    id = Column(Integer, primary_key=True, index=True)
    stream_url = Column(String(500), nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
