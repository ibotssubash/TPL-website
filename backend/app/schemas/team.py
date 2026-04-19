from pydantic import BaseModel, ConfigDict


class TeamBase(BaseModel):
    name: str
    logo_url: str | None = None
    captain: str


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: str | None = None
    logo_url: str | None = None
    captain: str | None = None


class TeamRead(TeamBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
