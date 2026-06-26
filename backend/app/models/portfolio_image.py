"""
PortfolioImage model – stores Cloudinary image metadata.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.database import Base


class PortfolioImage(Base):
    __tablename__ = "portfolio_images"

    id = Column(Integer, primary_key=True, index=True)
    public_id = Column(String(255), nullable=False)          # Cloudinary public_id
    image_url = Column(String(500), nullable=False)           # Cloudinary URL
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    caption = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    edited_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship
    category = relationship("Category", back_populates="images")
