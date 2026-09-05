from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class AdBlueprint(BaseModel):
    """Structural blueprint extracted from a winning ad template"""
    layout_framework: str = Field(..., description="Visual grid/composition (e.g., '4-panel comic grid', 'split screen vertical')")
    narrative_arc: str = Field(..., description="Storytelling sequence (e.g., 'Problem -> Discovery -> Solution -> CTA')")
    text_hierarchy: str = Field(..., description="Text organization (e.g., 'Large headline, bullet points, button')")
    psychological_triggers: List[str] = Field(..., description="What makes it work (e.g., ['Social Proof', 'Urgency', 'Identity Validation'])")
    visual_style_guide: str = Field(..., description="Aesthetic vibe (e.g., 'Retro Pop Art', 'Minimalist Apple-style', 'UGC Selfie')")


class AdBlueprintResponse(AdBlueprint):
    """Blueprint with metadata"""
    id: int
    template_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BrandData(BaseModel):
    """Input data for reconstructing an ad with new brand content"""
    brand_name: str
    brand_voice: Optional[str] = None
    product_name: str
    product_description: str
    audience_demographics: str
    audience_pain_points: Optional[str] = None
    audience_goals: Optional[str] = None
    campaign_offer: str
    campaign_urgency: Optional[str] = None
    campaign_messaging: str


class AdConcept(BaseModel):
    """Generated ad concept from blueprint + brand data"""
    headline_remix: str = Field(..., description="New headline matching blueprint's text hierarchy")
    visual_description: str = Field(..., description="Description of the new image (keeps blueprint's layout)")
    body_copy: str = Field(..., description="Supporting text/bullets adapted to new brand")
    cta_button: str = Field(..., description="Call to action matching blueprint's style")
    image_generation_prompt: str = Field(..., description="Detailed prompt for Fal.ai/Midjourney to generate the visual")


class DeconstructRequest(BaseModel):
    """Request to deconstruct a template into a blueprint"""
    template_id: int


class ReconstructRequest(BaseModel):
    """Request to reconstruct an ad from blueprint + brand data"""
    template_id: int  # Template with blueprint
    brand_id: int
    product_id: int
    profile_id: int
    campaign_offer: str
    campaign_urgency: Optional[str] = None
    campaign_messaging: str
