"""
Dashboard summary endpoint.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import Admin
from app.models.portfolio_image import PortfolioImage
from app.models.category import Category
from app.models.service import Service
from app.models.booking import Booking, BookingStatus
from app.schemas.dashboard import DashboardResponse
from app.schemas.common import APIResponse
from app.utils.auth import get_current_admin

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=APIResponse)
def get_dashboard(db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    """Get aggregate counts for the admin dashboard."""
    total_images = db.query(PortfolioImage).count()
    total_categories = db.query(Category).count()
    total_services = db.query(Service).count()
    new_bookings = db.query(Booking).filter(Booking.status == BookingStatus.NEW).count()
    reviewed_bookings = db.query(Booking).filter(Booking.status == BookingStatus.REVIEWED).count()

    data = DashboardResponse(
        total_images=total_images,
        total_categories=total_categories,
        total_services=total_services,
        new_bookings=new_bookings,
        reviewed_bookings=reviewed_bookings,
    )

    return APIResponse(
        success=True,
        message="Dashboard data fetched successfully.",
        data=data.model_dump(),
    )
