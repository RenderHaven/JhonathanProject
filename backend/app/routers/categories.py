"""
Category CRUD endpoints.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import Admin
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.common import APIResponse
from app.utils.auth import get_current_admin

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=APIResponse)
def get_categories(db: Session = Depends(get_db)):
    """Get all categories ordered by display_order."""
    categories = db.query(Category).order_by(Category.display_order).all()
    return APIResponse(
        success=True,
        message="Categories fetched successfully.",
        data=[CategoryResponse.model_validate(c).model_dump() for c in categories],
    )


@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Create a new category."""
    # Check uniqueness
    existing = db.query(Category).filter(Category.name == payload.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category '{payload.name}' already exists.",
        )

    # Auto-assign next display_order
    max_order = db.query(Category.display_order).order_by(Category.display_order.desc()).first()
    next_order = (max_order[0] + 1) if max_order else 1

    category = Category(name=payload.name, display_order=next_order)
    db.add(category)
    db.commit()
    db.refresh(category)

    return APIResponse(
        success=True,
        message="Category created successfully.",
        data=CategoryResponse.model_validate(category).model_dump(),
    )


@router.put("/{category_id}", response_model=APIResponse)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Update an existing category."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    # Check name uniqueness if being updated
    if payload.name and payload.name != category.name:
        existing = db.query(Category).filter(Category.name == payload.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category '{payload.name}' already exists.",
            )

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(category, key, value)

    db.commit()
    db.refresh(category)

    return APIResponse(
        success=True,
        message="Category updated successfully.",
        data=CategoryResponse.model_validate(category).model_dump(),
    )


@router.delete("/{category_id}", response_model=APIResponse)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Delete a category and all its images."""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    db.delete(category)
    db.commit()

    return APIResponse(
        success=True,
        message="Category deleted successfully.",
    )
