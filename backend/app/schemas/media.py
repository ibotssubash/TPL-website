from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MediaAssetRead(BaseModel):
    id: int
    original_name: str
    file_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LiveStreamRead(BaseModel):
    stream_url: str | None = None
    updated_at: datetime | None = None


class LiveStreamUpdate(BaseModel):
    stream_url: str | None = None
