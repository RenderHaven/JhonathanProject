"""
Portfolio image endpoints: upload, list, get, update, delete, reorder.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import Admin
from app.models.category import Category
from app.models.portfolio_image import PortfolioImage
from app.schemas.portfolio import (
    PortfolioImageResponse,
    PortfolioImageUpdate,
    ImageReorderRequest,
)
from app.schemas.common import APIResponse, PaginatedResponse
from app.utils.auth import get_current_admin
from app.utils.cloudinary import upload_image, delete_image

router = APIRouter(prefix="/portfolio/images", tags=["Portfolio Images"])


@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def upload_portfolio_image(
    image: UploadFile = File(...),
    category_id: int = Form(...),
    caption: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Upload an image to Cloudinary and store metadata."""
    # Validate category exists
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    # Upload to Cloudinary
    cloud_result = await upload_image(image)

    # Auto-assign next display_order within category
    max_order = (
        db.query(PortfolioImage.display_order)
        .filter(PortfolioImage.category_id == category_id)
        .order_by(PortfolioImage.display_order.desc())
        .first()
    )
    next_order = (max_order[0] + 1) if max_order else 1

    portfolio_image = PortfolioImage(
        public_id=cloud_result["public_id"],
        image_url=cloud_result["secure_url"],
        category_id=category_id,
        caption=caption,
        display_order=next_order,
    )
    db.add(portfolio_image)
    db.commit()
    db.refresh(portfolio_image)

    return APIResponse(
        success=True,
        message="Image uploaded successfully.",
        data=PortfolioImageResponse.model_validate(portfolio_image).model_dump(),
    )


@router.get("", response_model=PaginatedResponse)
def get_images(
    category_id: Optional[int] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """List portfolio images with optional category filter and pagination."""
    query = db.query(PortfolioImage)

    if category_id:
        query = query.filter(PortfolioImage.category_id == category_id)

    total = query.count()
    images = (
        query.order_by(PortfolioImage.display_order)
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return PaginatedResponse(
        data=[PortfolioImageResponse.model_validate(img).model_dump() for img in images],
        page=page,
        limit=limit,
        total=total,
    )


@router.get("/{image_id}", response_model=APIResponse)
def get_image(
    image_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Get a single portfolio image by ID."""
    image = db.query(PortfolioImage).filter(PortfolioImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    return APIResponse(
        success=True,
        message="Image fetched successfully.",
        data=PortfolioImageResponse.model_validate(image).model_dump(),
    )


@router.put("/{image_id}", response_model=APIResponse)
def update_image(
    image_id: int,
    payload: PortfolioImageUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Update image metadata (caption, category, display_order)."""
    image = db.query(PortfolioImage).filter(PortfolioImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    # If changing category, validate it exists
    if payload.category_id is not None:
        category = db.query(Category).filter(Category.id == payload.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target category not found.",
            )

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(image, key, value)

    db.commit()
    db.refresh(image)

    return APIResponse(
        success=True,
        message="Image updated successfully.",
        data=PortfolioImageResponse.model_validate(image).model_dump(),
    )


@router.delete("/{image_id}", response_model=APIResponse)
def delete_portfolio_image(
    image_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Delete an image from both Cloudinary and the database."""
    image = db.query(PortfolioImage).filter(PortfolioImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")

    # Delete from Cloudinary (best-effort)
    delete_image(image.public_id)

    db.delete(image)
    db.commit()

    return APIResponse(
        success=True,
        message="Image deleted successfully.",
    )


@router.patch("/reorder", response_model=APIResponse)
def reorder_images(
    payload: ImageReorderRequest,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Bulk-update display_order for images within a category."""
    # Validate category exists
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    for item in payload.images:
        image = db.query(PortfolioImage).filter(
            PortfolioImage.id == item.id,
            PortfolioImage.category_id == payload.category_id,
        ).first()
        if image:
            image.display_order = item.display_order

    db.commit()

    return APIResponse(
        success=True,
        message="Image order updated.",
    )
