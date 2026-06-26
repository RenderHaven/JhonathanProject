"""
Cloudinary upload and delete helpers.
"""

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException, status

from app.config import settings

# Configure Cloudinary on module load
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

ALLOWED_FORMATS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def upload_image(file: UploadFile, folder: str = "jonathan_portfolio") -> dict:
    """
    Upload an image to Cloudinary.
    Returns dict with 'public_id' and 'secure_url'.
    """
    # Validate format
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else ""
    if ext not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image format. Allowed: {', '.join(ALLOWED_FORMATS)}",
        )

    # Validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image exceeds maximum size of 10 MB.",
        )

    # Upload to Cloudinary
    try:
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type="image",
        )
        return {
            "public_id": result["public_id"],
            "secure_url": result["secure_url"],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cloudinary upload failed: {str(e)}",
        )


def delete_image(public_id: str) -> bool:
    """Delete an image from Cloudinary by its public_id."""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception:
        return False
