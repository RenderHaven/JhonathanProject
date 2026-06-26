"""
Service schemas.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ServiceCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    includes: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None


class ServiceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    includes: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ServiceResponse(BaseModel):
    id: int
    title: str
    description: str
    includes: str
    price: float
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    edited_at: datetime

    class Config:
        from_attributes = True
