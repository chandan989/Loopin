from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from pydantic import BaseModel

from app.core.database import get_db
from app.models.game import GameSession
from app.models.player import Player
from app.schemas.game import GameResponse, GameSessionDetail

router = APIRouter()

class JoinRequest(BaseModel):
    wallet_address: str
    signature: str # Placeholder for now, used to verify ownership

@router.get("/lobby", response_model=List[GameResponse])
async def get_lobby(db: AsyncSession = Depends(get_db)):
    """
    Fetch all active games with status 'lobby'.
    """
    result = await db.execute(select(GameSession).where(GameSession.status == "lobby"))
    games = result.scalars().all()
    # In a real scenario, we'd calculate player_count and prize_pool dynamicallly
    return games

@router.get("/{game_id}", response_model=GameSessionDetail)
async def get_game_details(game_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Fetch complete state of a specific game.
    """
    result = await db.execute(select(GameSession).where(GameSession.id == game_id))
    game = result.scalar_one_or_none()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
        
    return game

@router.post("/{game_id}/confirm_join")
async def confirm_join(
    game_id: UUID, 
    join_request: JoinRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Confirm player join. 
    1. Verify signature (TODO)
    2. Check if player exists by wallet_address, if not create.
    3. Add to game.
    """
    # 1. Verify Signature (TODO: Implement Stacks/Bitcoin signature verification)
    # verify_signature(join_request.wallet_address, join_request.signature)

    # 2. Find or Create Player
    result = await db.execute(select(Player).where(Player.wallet_address == join_request.wallet_address))
    player = result.scalar_one_or_none()

    if not player:
        player = Player(wallet_address=join_request.wallet_address)
        db.add(player)
        await db.flush()

    # 3. Add to Game
    # CRITICAL: Clean up old trails from previous sessions to prevent artifacting
    # This ensures every new game starts with a clean slate for the player.
    from sqlalchemy import delete
    from app.models.player import PlayerTrail
    await db.execute(delete(PlayerTrail).where(PlayerTrail.player_id == player.id))

    # Check if already in this game via GameParticipant
    from app.models.game import GameParticipant
    
    result = await db.execute(
        select(GameParticipant).where(
            GameParticipant.player_id == player.id,
            GameParticipant.game_id == game_id
        )
    )
    participant = result.scalar_one_or_none()

    if not participant:
        # Create new participation
        participant = GameParticipant(player_id=player.id, game_id=game_id)
        db.add(participant)
    
    await db.commit()

    return {"status": "success", "message": "Player added to game", "player_id": str(player.id)}
