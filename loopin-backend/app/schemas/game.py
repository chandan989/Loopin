from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class PlayerSchema(BaseModel):
    id: UUID
    wallet_address: str
    username: Optional[str] = None
    level: int = 1
    avatar_seed: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class GameBase(BaseModel):
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    on_chain_id: Optional[int] = None

class GameCreate(BaseModel):
    max_players: int = 10
    entry_fee: float = 0.0

class GameParticipantSchema(BaseModel):
    player_id: UUID
    joined_at: datetime
    # We include nested player info
    player: PlayerSchema

    model_config = ConfigDict(from_attributes=True)

class GameResponse(GameBase):
    id: UUID
    player_count: int = 0
    max_players: int = 10
    entry_fee: float = 0.0
    prize_pool: float = 0.0
    
    model_config = ConfigDict(from_attributes=True)

class GameSessionDetail(GameResponse):
    participations: List[GameParticipantSchema] = [] 
