"""
Seed script: creates the initial admin user if one doesn't exist.
Run with: python -m app.seed
"""

from app.database import SessionLocal, engine, Base
from app.models.admin import Admin
from app.utils.auth import hash_password
from app.config import settings


def seed_admin():
    """Insert the default admin user if the admins table is empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing = db.query(Admin).filter(Admin.email == settings.ADMIN_EMAIL).first()
        if existing:
            print(f"✓ Admin '{settings.ADMIN_EMAIL}' already exists. Skipping seed.")
            return

        admin = Admin(
            name=settings.ADMIN_NAME,
            email=settings.ADMIN_EMAIL,
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print(f"✓ Admin '{settings.ADMIN_EMAIL}' created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
