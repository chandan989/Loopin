from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import Dict, List, Optional
import json
from uuid import UUID

from app.core.database import get_db
from app.models.player import Player, PlayerTrail, PlayerTerritory

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # game_id -> list of WebSockets
        self.active_connections: Dict[UUID, List[WebSocket]] = {}
        # connection (WebSocket) -> {lat: float, lng: float, player_id: UUID}
        self.connection_states: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, game_id: UUID):
        await websocket.accept()
        if game_id not in self.active_connections:
            self.active_connections[game_id] = []
        self.active_connections[game_id].append(websocket)
        self.connection_states[websocket] = {"lat": 0.0, "lng": 0.0, "player_id": None}

    def disconnect(self, websocket: WebSocket, game_id: UUID):
        if game_id in self.active_connections:
            if websocket in self.active_connections[game_id]:
                self.active_connections[game_id].remove(websocket)
            if not self.active_connections[game_id]:
                del self.active_connections[game_id]
        if websocket in self.connection_states:
            del self.connection_states[websocket]

    async def broadcast(self, message: dict, game_id: UUID):
        if game_id in self.active_connections:
            for connection in list(self.active_connections[game_id]):
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    async def broadcast_game_state(self, game_id: UUID, sender_id: UUID, true_lat: float, true_lng: float):
        """
        Custom broadcast for Unified Grid.
        Calculates the virtual position of the sender RELATIVE to each recipient.
        """
        from app.core.unified_grid import project_to_observer
        
        if game_id not in self.active_connections:
            return

        for connection in list(self.active_connections[game_id]):
            recipient_state = self.connection_states.get(connection)
            
            # If recipient hasn't sent a location yet, we can't project relative to them.
            # Default to raw coords or skip? Let's send raw to be safe, or 0,0.
            # If we send raw, they see the player far away.
            # If we project with 0,0, they see player relative to 0,0.
            
            if recipient_state and recipient_state["lat"] != 0.0:
                 proj_lat, proj_lng = project_to_observer(
                     recipient_state["lat"], recipient_state["lng"],
                     true_lat, true_lng
                 )
            else:
                 # Fallback: Just send raw.
                 # This means if I haven't moved, I see you where you really are.
                 proj_lat, proj_lng = true_lat, true_lng

            try:
                await connection.send_json({
                    "type": "game_state_update",
                    "player_id": str(sender_id),
                    "lat": proj_lat,
                    "lng": proj_lng
                })
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/game/{game_id}")
async def game_endpoint(
    websocket: WebSocket, 
    game_id: UUID,
    player_id: Optional[UUID] = None, # Passed via query param
    db: AsyncSession = Depends(get_db)
):
    await manager.connect(websocket, game_id)
    
    # Identify player if provided
    current_player = None
    if player_id:
        result = await db.execute(select(Player).where(Player.id == player_id))
        current_player = result.scalar_one_or_none()
        
    # Update initial state with player ID
    if current_player:
        manager.connection_states[websocket]["player_id"] = current_player.id

    try:
        while True:
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                msg_type = message.get("type")
                
                if msg_type == "position_update" and current_player:
                    lat = message.get("lat")
                    lng = message.get("lng")
                    
                    if lat is not None and lng is not None:
                        # Update connection state for projection
                        manager.connection_states[websocket]["lat"] = lat
                        manager.connection_states[websocket]["lng"] = lng
                        # 1. Update/Extend Trail
                        # Check if trail exists
                        trail_result = await db.execute(select(PlayerTrail).where(PlayerTrail.player_id == current_player.id))
                        trail = trail_result.scalar_one_or_none()
                        
                        if not trail:
                            # Create new trail (Start with a small line or point? Point isn't a linestring)
                            # PostGIS Linestring requires 2 points minimum typically.
                            # For now, we'll create a degenerate linestring or wait for 2 points?
                            # Let's try creating a linestring with the same point twice to start.
                            # ST_MakeLine(ST_MakePoint(lng, lat), ST_MakePoint(lng, lat))
                            
                            new_trail_stmt = f"ST_SetSRID(ST_MakeLine(ST_MakePoint({lng}, {lat}), ST_MakePoint({lng}, {lat})), 4326)"
                            trail = PlayerTrail(player_id=current_player.id, trail=func.ST_GeomFromText(f'LINESTRING({lng} {lat}, {lng} {lat})', 4326))
                            # Note: inserting raw SQL function via ORM creates complexity; simpler to just insert WKT
                            # But SQLAlchemy/GeoAlchemy2 handles WKT strings automatically.
                            
                            db.add(trail)
                        else:
                            # Append point to existing trail
                            # ST_AddPoint(geometry, point) 
                            # We need to cast geography to geometry, add point, cast back
                            # This is complex in pure ORM update. We'll execute a raw UPDATE for speed/function support.
                            
                            await db.execute(
                                text("""
                                    UPDATE player_trails 
                                    SET trail = ST_AddPoint(trail::geometry, ST_MakePoint(:lng, :lat))::geography
                                    WHERE player_id = :pid
                                """),
                                {"lng": lng, "lat": lat, "pid": current_player.id}
                            )
                            # No need to db.add/refresh since we did raw update.
                        
                        await db.commit()
                        
                        # 2. Collision Detection (Placeholder)
                        # TODO: Run ST_Intersects checks here
                        
                        # 3. Broadcast new state
                        # UNIFIED GRID / CROSSPLAY IMPLEMENTATION
                        # We project the current player's position into the virtual sector of every OTHER player
                        # However, for simplicity and performance in this MVP:
                        # We will make the client responsibly "relative" or just standardizing everyone to a "Virtual Arena"
                        # But per our plan: "Phantom Projection" -> Map B to A's vicinity.
                        
                        # Broadcasting logic needs to be per-connection if we want custom projections per user.
                        # ConnectionManager.broadcast sends the SAME message to everyone.
                        # To implement specific projections, we need to iterate connections and send custom messages.
                        
                        await manager.broadcast_game_state(game_id, current_player.id, lat, lng)
                        
                elif msg_type == "ping":
                    await websocket.send_json({"type": "pong"})

            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "Invalid JSON"})
            except Exception as e:
                print(f"WS Error: {e}")
                await websocket.send_json({"type": "error", "message": "Internal error"})

    except WebSocketDisconnect:
        manager.disconnect(websocket, game_id)
        if current_player:
            await manager.broadcast({
                "type": "player_left",
                "player_id": str(current_player.id)
            }, game_id)
