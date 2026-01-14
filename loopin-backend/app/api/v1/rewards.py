from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
from uuid import UUID

from app.core.database import get_db
from app.models.player import Player, PlayerStats

router = APIRouter()

class RewardStatusResponse(BaseModel):
    streak: int
    claimable: bool
    next_reward: float
    claimed_today: bool
    last_claimed_at: Optional[datetime]

class ClaimResponse(BaseModel):
    success: bool
    reward_amount: float
    new_streak: int
    new_total_earnings: float

def calculate_reward(streak: int) -> float:
    # Base reward 100, increases by 50 for each streak day up to 1000 max
    return min(100 + (streak * 50), 1000)

@router.get("/status", response_model=RewardStatusResponse)
async def get_daily_reward_status(wallet_address: str, db: AsyncSession = Depends(get_db)):
    """
    Check if the player can claim a daily reward.
    """
    result = await db.execute(select(Player).where(Player.wallet_address == wallet_address))
    player = result.scalar_one_or_none()

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Ensure player has stats
    if not player.stats:
        player.stats = PlayerStats(player_id=player.id)
        db.add(player.stats)
        await db.commit()
        await db.refresh(player)

    last_claimed = player.stats.last_daily_reward_claimed_at
    current_time = datetime.utcnow()
    streak = player.stats.current_streak or 0
    
    claimed_today = False
    claimable = False
    
    if last_claimed:
        time_diff = current_time - last_claimed
        
        # If claimed within the last 24 hours (roughly), consider it claimed today
        # For a more "calendar day" approach reset at midnight, but 24h window is safer for global users initially
        # Let's use a simple "can claim once every 20 hours" to be generous
        
        if time_diff < timedelta(hours=20):
            claimed_today = True
            claimable = False
        elif time_diff > timedelta(hours=48):
            # Streak broken
            streak = 0
            claimable = True
        else:
            # Within window to claim next reward
            claimable = True
    else:
        # Never claimed
        claimable = True
        streak = 0

    next_reward = calculate_reward(streak + 1 if claimable else streak)

    return RewardStatusResponse(
        streak=streak,
        claimable=claimable,
        next_reward=next_reward,
        claimed_today=claimed_today,
        last_claimed_at=last_claimed
    )

@router.post("/claim", response_model=ClaimResponse)
async def claim_daily_reward(
    wallet_address: str = Body(..., embed=True), 
    db: AsyncSession = Depends(get_db)
):
    """
    Claim the daily reward if available.
    """
    result = await db.execute(select(Player).where(Player.wallet_address == wallet_address))
    player = result.scalar_one_or_none()

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
        
    if not player.stats:
        player.stats = PlayerStats(player_id=player.id)
        db.add(player.stats)
    
    last_claimed = player.stats.last_daily_reward_claimed_at
    current_time = datetime.utcnow()
    current_streak = player.stats.current_streak or 0
    
    if last_claimed:
        time_diff = current_time - last_claimed
        if time_diff < timedelta(hours=20):
            raise HTTPException(status_code=400, detail="Daily reward already claimed today")
        
        if time_diff > timedelta(hours=48):
            # Streak broken
            current_streak = 0
    
    # Calculate reward for the NEW streak
    new_streak = current_streak + 1
    reward_amount = calculate_reward(new_streak)
    
    # Update stats
    player.stats.current_streak = new_streak
    player.stats.total_earnings = (player.stats.total_earnings or 0.0) + reward_amount
    player.stats.last_daily_reward_claimed_at = current_time
    
    await db.commit()
    
    return ClaimResponse(
        success=True,
        reward_amount=reward_amount,
        new_streak=new_streak,
        new_total_earnings=player.stats.total_earnings
    )
