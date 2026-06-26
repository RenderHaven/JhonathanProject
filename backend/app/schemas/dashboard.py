"""
Dashboard schemas.
"""

from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_images: int
    total_categories: int
    total_services: int
    new_bookings: int
    reviewed_bookings: int
