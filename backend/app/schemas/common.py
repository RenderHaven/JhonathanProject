"""
Common response wrappers used across all API endpoints.
"""

from typing import Any, Optional
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standard API response envelope."""
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[Any] = None


class PaginatedResponse(BaseModel):
    """Paginated list response."""
    success: bool = True
    message: str = "Data fetched successfully."
    data: Any
    page: int
    limit: int
    total: int
