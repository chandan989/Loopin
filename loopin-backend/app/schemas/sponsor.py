from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import List, Optional

class SponsoredLocationBase(BaseModel):
    name: Optional[str] = None
    lat: float
    lng: float
    bid_price: float = 0.0

class SponsoredLocationCreate(SponsoredLocationBase):
    sponsor_name: str # Used to look up or create sponsor
    address: Optional[str] = None

class SponsoredLocationResponse(SponsoredLocationBase):
    id: UUID
    sponsor_id: UUID

    model_config = ConfigDict(from_attributes=True)

class SponsorBase(BaseModel):
    name: str
    contact_email: Optional[str] = None

class SponsorResponse(SponsorBase):
    id: UUID
    locations: List[SponsoredLocationResponse] = []

    model_config = ConfigDict(from_attributes=True)
