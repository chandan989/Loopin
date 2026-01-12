from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Literal, Optional, List

class PowerupBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    cost: float
    type: str

class PowerupSchema(PowerupBase):
    model_config = ConfigDict(from_attributes=True)

class PlayerPowerupSchema(BaseModel):
    id: UUID
    powerup_id: str
    quantity: int
    equipped: bool
    
    powerup: PowerupSchema # Nested details

    model_config = ConfigDict(from_attributes=True)

class PowerupPurchase(BaseModel):
    player_id: UUID
    type: str 
    transaction_id: str 

class PowerupActive(BaseModel):
    player_id: UUID
    type: str
    duration_seconds: int
    active_until: float 
