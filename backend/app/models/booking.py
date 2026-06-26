"""
Booking model – customer booking inquiries.
"""

import enum

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, func
from sqlalchemy.orm import relationship

from app.database import Base


class BookingStatus(str, enum.Enum):
    NEW = "NEW"
    REVIEWED = "REVIEWED"
    RESPONDED = "RESPONDED"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    event_name = Column(String(200), nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=True)
    message = Column(Text, nullable=True)
    status = Column(Enum(BookingStatus), default=BookingStatus.NEW, nullable=False)
    admin_note = Column(Text, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    service = relationship("Service", back_populates="bookings")
