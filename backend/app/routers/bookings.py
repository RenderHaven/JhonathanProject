"""
Booking inquiry endpoints.
"""

from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import Admin
from app.models.booking import Booking, BookingStatus
from app.schemas.booking import BookingCreate, BookingStatusUpdate, BookingResponse
from app.schemas.common import APIResponse, PaginatedResponse
from app.utils.auth import get_current_admin

router = APIRouter(prefix="/bookings", tags=["Bookings"])


# ── Public endpoint (no auth) – used by the customer website ──
@router.post("/public", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    """Submit a booking inquiry from the public website (no auth required)."""
    booking = Booking(**payload.model_dump())
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return APIResponse(
        success=True,
        message="Booking inquiry submitted successfully.",
        data=BookingResponse.model_validate(booking).model_dump(),
    )


# ── Admin endpoints ───────────────────────────────────────────
@router.get("", response_model=PaginatedResponse)
def get_bookings(
    status_filter: Optional[BookingStatus] = Query(None, alias="status"),
    page: int = 1,
    limit: int = 20,
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """List bookings with optional filters and pagination."""
    query = db.query(Booking)

    if status_filter:
        query = query.filter(Booking.status == status_filter)

    if from_date:
        try:
            from_dt = datetime.fromisoformat(from_date)
            query = query.filter(Booking.created_at >= from_dt)
        except ValueError:
            pass

    if to_date:
        try:
            to_dt = datetime.fromisoformat(to_date)
            query = query.filter(Booking.created_at <= to_dt)
        except ValueError:
            pass

    total = query.count()
    bookings = (
        query.order_by(Booking.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return PaginatedResponse(
        data=[BookingResponse.model_validate(b).model_dump() for b in bookings],
        page=page,
        limit=limit,
        total=total,
    )


@router.get("/{booking_id}", response_model=APIResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Get a single booking inquiry."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    return APIResponse(
        success=True,
        message="Booking fetched successfully.",
        data=BookingResponse.model_validate(booking).model_dump(),
    )


@router.patch("/{booking_id}/status", response_model=APIResponse)
def update_booking_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Update booking status and optional admin note."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    booking.status = payload.status

    if payload.admin_note is not None:
        booking.admin_note = payload.admin_note

    # Set reviewed_at from payload or auto-set when moving to REVIEWED
    if payload.reviewed_at:
        booking.reviewed_at = payload.reviewed_at
    elif payload.status == BookingStatus.REVIEWED and booking.reviewed_at is None:
        booking.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(booking)

    return APIResponse(
        success=True,
        message="Booking status updated successfully.",
        data=BookingResponse.model_validate(booking).model_dump(),
    )
