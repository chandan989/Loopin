from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class PlayerStatsSchema(BaseModel):
    player_id: UUID
    total_area: float
    games_played: int
    games_won: int
    total_earnings: float
    longest_trail: float
    biggest_loop: float
    current_streak: int

    model_config = ConfigDict(from_attributes=True)

class PlayerGameHistorySchema(BaseModel):
    id: UUID
    game_id: Optional[UUID]
    rank: Optional[int]
    area_captured: Optional[float]
    prize_won: Optional[float]
    played_at: datetime

    model_config = ConfigDict(from_attributes=True)
