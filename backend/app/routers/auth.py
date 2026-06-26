"""
Authentication endpoints: login & logout.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.common import APIResponse
from app.utils.auth import verify_password, create_access_token, get_current_admin
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=APIResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate admin and return JWT token."""
    admin = db.query(Admin).filter(Admin.email == payload.email).first()

    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated.",
        )

    token = create_access_token(data={"sub": str(admin.id), "email": admin.email})

    return APIResponse(
        success=True,
        message="Login successful.",
        data=TokenResponse(
            token=token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        ).model_dump(),
    )


@router.post("/logout", response_model=APIResponse)
def logout(admin: Admin = Depends(get_current_admin)):
    """
    Logout endpoint.
    Since JWT is stateless, the client should discard the token.
    This endpoint exists for API contract compliance.
    """
    return APIResponse(
        success=True,
        message="Logged out successfully.",
    )
