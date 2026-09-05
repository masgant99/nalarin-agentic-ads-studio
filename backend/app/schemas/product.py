from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    product_shots: Optional[List[str]] = []
    default_url: Optional[str] = None

class ProductCreate(ProductBase):
    id: Optional[str] = None
    brand_id: str

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    id: str
    brand_id: str
    created_at: datetime

    class Config:
        from_attributes = True
