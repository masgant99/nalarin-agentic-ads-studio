from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import WinningAd as WinningAdModel, User
from app.schemas.template import WinningAd
from app.core.deps import get_current_active_user, require_permission
import uuid

router = APIRouter()

@router.get("/", response_model=List[WinningAd])
def read_winning_ads(
    search: Optional[str] = None,
    category: Optional[str] = None,
    style: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(WinningAdModel)
    
    if category:
        query = query.filter(WinningAdModel.template_category == category)
    if style:
        query = query.filter(WinningAdModel.design_style == style)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (WinningAdModel.name.ilike(search_term)) |
            (WinningAdModel.tags.ilike(search_term)) |
            (WinningAdModel.product_name.ilike(search_term))
        )
    
    return query.all()

@router.get("/filters")
def read_template_filters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    categories = db.query(WinningAdModel.template_category).distinct().filter(WinningAdModel.template_category != None).all()
    styles = db.query(WinningAdModel.design_style).distinct().filter(WinningAdModel.design_style != None).all()
    
    return {
        "categories": [c[0] for c in categories],
        "styles": [s[0] for s in styles]
    }

@router.get("/{id}/preview", response_model=WinningAd)
def read_template_preview(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    template = db.query(WinningAdModel).filter(WinningAdModel.id == id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

from fastapi import File, UploadFile
import shutil
from pathlib import Path
import os

UPLOAD_DIR = Path(__file__).parent.parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_winning_ad(
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("templates:write"))
):
    saved_ads = []
    for image in images:
        # Generate unique filename
        filename = f"template_{uuid.uuid4()}_{image.filename}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        # Create DB record
        # Note: In a real app, we'd probably analyze the image here or let the user fill in details
        # For now, we create a basic record
        new_ad = WinningAdModel(
            name=image.filename,
            image_url=f"/uploads/{filename}",
            filename=filename,
            template_category="Uploaded",
            design_style="Unknown"
        )
        db.add(new_ad)
        db.commit()
        db.refresh(new_ad)
        saved_ads.append(new_ad)
        
    return {"message": f"Successfully uploaded {len(saved_ads)} templates", "ads": saved_ads}
