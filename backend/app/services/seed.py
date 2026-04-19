from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.admin import AdminUser


def seed_default_admin(db: Session) -> None:
    existing = db.query(AdminUser).filter(AdminUser.username == settings.admin_username).first()
    if existing:
        return

    admin = AdminUser(
        username=settings.admin_username,
        password_hash=get_password_hash(settings.admin_password),
        is_active=True,
    )
    db.add(admin)
    db.commit()
