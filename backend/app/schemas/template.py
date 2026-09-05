from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class WinningAdBase(BaseModel):
    name: str
    image_url: str
    notes: Optional[str] = None
    tags: Optional[str] = None
    analysis: Optional[str] = None
    recreation_prompt: Optional[str] = None
    topic: Optional[str] = None
    mood: Optional[str] = None
    subject_matter: Optional[str] = None
    copy_analysis: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    design_style: Optional[str] = None
    filename: Optional[str] = None
    structural_analysis: Optional[str] = None
    layering: Optional[str] = None
    template_structure: Optional[Dict[str, Any]] = None
    color_palette: Optional[Dict[str, Any]] = None
    typography_system: Optional[Dict[str, Any]] = None
    copy_patterns: Optional[Dict[str, Any]] = None
    visual_elements: Optional[Dict[str, Any]] = None
    template_category: Optional[str] = None

class WinningAd(WinningAdBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
