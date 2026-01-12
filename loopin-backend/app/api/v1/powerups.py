from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import time

from app.core.database import get_db
from app.schemas.powerup import PowerupPurchase, PowerupActive
from app.models.player import Player
from app.models.powerup import PlayerPowerup
from app.core.config import settings

router = APIRouter()

@router.post("/purchase", response_model=PowerupActive)
async def purchase_powerup(purchase: PowerupPurchase, db: AsyncSession = Depends(get_db)):
    """
    Validate purchase from Stacks chain (mocked for now) and activate powerup.
    """
    # Verify player exists
    result = await db.execute(select(Player).where(Player.id == purchase.player_id))
    player = result.scalar_one_or_none()
    
    if not player:
         raise HTTPException(status_code=404, detail="Player not found")

    # TODO: Verify transaction_id with Stacks node using settings.STACKS_RPC_URL
    
    # Logic: Add to inventory (PlayerPowerup)
    # Check if they already have this powerup
    result = await db.execute(select(PlayerPowerup).where(
        PlayerPowerup.player_id == player.id,
        PlayerPowerup.powerup_id == purchase.type
    ))
    player_powerup = result.scalar_one_or_none()

    if player_powerup:
        player_powerup.quantity += 1
    else:
        player_powerup = PlayerPowerup(
            player_id=player.id, 
            powerup_id=purchase.type, 
            quantity=1,
            equipped=False 
        )
        db.add(player_powerup)
    
    # Check if we should auto-equip/activate?
    # Schema says "equipped" field exists.
    # The response expects "PowerupActive" with duration.
    # Let's assume purchasing activates it immediately for this MVP flow.
    
    duration = 60 # Default
    
    # We could update 'equipped' to True here if we wanted to persist state
    player_powerup.equipped = True
    
    await db.commit()
        
    return PowerupActive(
        player_id=purchase.player_id,
        type=purchase.type,
        duration_seconds=duration,
        active_until=time.time() + duration
    )
