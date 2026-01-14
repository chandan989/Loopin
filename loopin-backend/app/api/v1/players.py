from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.player import Player, PlayerStats

router = APIRouter()

class RegisterRequest(BaseModel):
    wallet_address: str
    username: str
    avatar_seed: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
    avatar_seed: Optional[str] = None

class PlayerResponse(BaseModel):
    id: UUID
    wallet_address: str
    username: Optional[str]
    avatar_seed: Optional[str]
    level: int
    joined_at: str

    class Config:
        from_attributes = True

@router.post("/register", response_model=PlayerResponse)
async def register_player(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new player.
    """
    # Check if exists
    result = await db.execute(select(Player).where(Player.wallet_address == request.wallet_address))
    existing_player = result.scalar_one_or_none()
    
    if existing_player:
        raise HTTPException(status_code=400, detail="Player already exists with this wallet address")
    
    # Check username uniqueness
    if request.username:
        result = await db.execute(select(Player).where(Player.username == request.username))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already taken")

    new_player = Player(
        wallet_address=request.wallet_address,
        username=request.username,
        avatar_seed=request.avatar_seed or request.username # Default seed to username
    )
    db.add(new_player)
    
    # Add initial stats
    db.flush() # get id
    stats = PlayerStats(player_id=new_player.id)
    db.add(stats)
    
    await db.commit()
    await db.refresh(new_player)
    
    return PlayerResponse(
        id=new_player.id,
        wallet_address=new_player.wallet_address,
        username=new_player.username,
        avatar_seed=new_player.avatar_seed,
        level=new_player.level,
        joined_at=str(new_player.joined_at)
    )

@router.get("/{wallet_address}", response_model=PlayerResponse)
async def get_player(
    wallet_address: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Player).where(Player.wallet_address == wallet_address))
    player = result.scalar_one_or_none()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
        
    return PlayerResponse(
        id=player.id,
        wallet_address=player.wallet_address,
        username=player.username,
        avatar_seed=player.avatar_seed,
        level=player.level,
        joined_at=str(player.joined_at)
    )

@router.patch("/{wallet_address}/update", response_model=PlayerResponse)
async def update_player(
    wallet_address: str,
    request: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Player).where(Player.wallet_address == wallet_address))
    player = result.scalar_one_or_none()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    if request.username:
        # Check uniqueness if changing
        if request.username != player.username:
            result = await db.execute(select(Player).where(Player.username == request.username))
            if result.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Username already taken")
            player.username = request.username
            
    if request.avatar_seed:
        player.avatar_seed = request.avatar_seed
        
    await db.commit()
    await db.refresh(player)
    
    return PlayerResponse(
        id=player.id,
        wallet_address=player.wallet_address,
        username=player.username,
        avatar_seed=player.avatar_seed,
        level=player.level,
        joined_at=str(player.joined_at)
    )
