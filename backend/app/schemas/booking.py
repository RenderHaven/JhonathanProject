"""
Booking schemas.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    """Used by the public website to submit booking inquiries."""
    service_id: Optional[int] = None
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    event_name: Optional[str] = Field(None, max_length=200)
    event_date: Optional[datetime] = None
    message: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    admin_note: Optional[str] = None
    reviewed_at: Optional[datetime] = None


class BookingResponse(BaseModel):
    id: int
    service_id: Optional[int] = None
    name: str
    email: str
    phone: Optional[str] = None
    event_name: Optional[str] = None
    event_date: Optional[datetime] = None
    message: Optional[str] = None
    status: BookingStatus
    admin_note: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
