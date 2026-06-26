import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.admin import Admin
from app.utils.auth import create_access_token, decode_access_token, verify_password
from app.config import settings

db = SessionLocal()
admin = db.query(Admin).filter(Admin.email == settings.ADMIN_EMAIL).first()
if not admin:
    print("Admin not found!")
    sys.exit(1)

print(f"Admin found: id={admin.id}, email={admin.email}")
token = create_access_token(data={"sub": admin.id, "email": admin.email})
print(f"Token: {token}")

payload = decode_access_token(token)
print(f"Payload: {payload}")

admin_id = payload.get("sub")
print(f"Admin id from payload: {admin_id} (type: {type(admin_id)})")

admin_lookup = db.query(Admin).filter(Admin.id == admin_id, Admin.is_active == True).first()
print(f"Lookup success: {admin_lookup is not None}")

