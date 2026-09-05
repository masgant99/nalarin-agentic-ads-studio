from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class FacebookAdBase(BaseModel):
    name: str
    creative_name: Optional[str] = None
    image_url: Optional[str] = None
    bodies: Optional[List[str]] = []
    headlines: Optional[List[str]] = []
    description: Optional[str] = None
    cta: Optional[str] = None
    website_url: Optional[str] = None
    status: Optional[str] = 'PAUSED'
    fb_ad_id: Optional[str] = None
    fb_creative_id: Optional[str] = None

class FacebookAdCreate(FacebookAdBase):
    id: Optional[str] = None
    adsetId: str

class FacebookAd(FacebookAdBase):
    id: str
    adset_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class FacebookAdSetBase(BaseModel):
    name: str
    optimization_goal: str
    daily_budget: Optional[int] = None
    bid_strategy: Optional[str] = None
    bid_amount: Optional[int] = None
    targeting: Optional[Dict[str, Any]] = None
    pixel_id: Optional[str] = None
    conversion_event: Optional[str] = None
    status: Optional[str] = 'PAUSED'
    fb_adset_id: Optional[str] = None

class FacebookAdSetCreate(FacebookAdSetBase):
    id: Optional[str] = None
    campaignId: str

class FacebookAdSet(FacebookAdSetBase):
    id: str
    campaign_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class FacebookCampaignBase(BaseModel):
    name: str
    objective: str
    budget_type: str
    daily_budget: Optional[int] = None
    bid_strategy: Optional[str] = None
    status: Optional[str] = 'PAUSED'
    fb_campaign_id: Optional[str] = None

class FacebookCampaignCreate(FacebookCampaignBase):
    id: Optional[str] = None

class FacebookCampaign(FacebookCampaignBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
