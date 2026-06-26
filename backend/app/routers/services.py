"""
Service CRUD endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin import Admin
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.schemas.common import APIResponse
from app.utils.auth import get_current_admin

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("", response_model=APIResponse)
def get_services(db: Session = Depends(get_db)):
    """Get all services."""
    services = db.query(Service).order_by(Service.created_at.desc()).all()
    return APIResponse(
        success=True,
        message="Services fetched successfully.",
        data=[ServiceResponse.model_validate(s).model_dump() for s in services],
    )


@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Create a new service package."""
    service = Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)

    return APIResponse(
        success=True,
        message="Service created successfully.",
        data=ServiceResponse.model_validate(service).model_dump(),
    )


@router.get("/{service_id}", response_model=APIResponse)
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
):
    """Get a single service by ID."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")

    return APIResponse(
        success=True,
        message="Service fetched successfully.",
        data=ServiceResponse.model_validate(service).model_dump(),
    )


@router.put("/{service_id}", response_model=APIResponse)
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Update an existing service."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(service, key, value)

    db.commit()
    db.refresh(service)

    return APIResponse(
        success=True,
        message="Service updated successfully.",
        data=ServiceResponse.model_validate(service).model_dump(),
    )


@router.delete("/{service_id}", response_model=APIResponse)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    """Delete a service."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found.")

    db.delete(service)
    db.commit()

    return APIResponse(
        success=True,
        message="Service deleted successfully.",
    )
