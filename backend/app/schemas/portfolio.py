"""
Portfolio image schemas.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class PortfolioImageResponse(BaseModel):
    id: int
    public_id: str
    image_url: str
    category_id: int
    caption: Optional[str] = None
    display_order: int
    is_active: bool
    created_at: datetime
    edited_at: datetime

    class Config:
        from_attributes = True


class PortfolioImageUpdate(BaseModel):
    category_id: Optional[int] = None
    caption: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = None,
    is_active: Optional[bool] = None


class ImageReorderItem(BaseModel):
    id: int
    display_order: int


class ImageReorderRequest(BaseModel):
    category_id: int
    images: List[ImageReorderItem]
