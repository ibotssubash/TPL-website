from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "Trichy Premier League API"
    database_url: str = (
        "postgresql+psycopg2://postgres:subash2002@localhost:5432/tpl_db"
    )
    jwt_secret_key: str = "change_me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 180
    admin_username: str = "admin"
    admin_password: str = "admin123"
    upload_dir: str = str(BASE_DIR / "uploads")
    upload_url_prefix: str = "/uploads"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
