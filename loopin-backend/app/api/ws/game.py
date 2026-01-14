from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import Dict, List, Optional
import json
from uuid import UUID

from app.core.database import get_db
from app.models.player import Player, PlayerTrail, PlayerTerritory
from app.models.powerup import PlayerPowerup

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
        self.connection_states[websocket] = {
            "lat": 0.0, 
            "lng": 0.0, 
            "player_id": None,
            "active_powerups": [] # list of 'shield', 'invisibility', etc.
        }

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

    async def broadcast_game_state(self, game_id: UUID, sender_id: UUID, true_lat: float, true_lng: float, db: AsyncSession):
        """
        Custom broadcast for Unified Grid.
        Constructs a "Game State" object with all active players for the client to render.
        Fetches trails from PostGIS to ensure other players see the full path.
        """
        from app.core.unified_grid import project_to_observer
        
        if game_id not in self.active_connections:
            return

        # 1. Build the list of all active players from memory (for ID and metadata)
        active_player_ids = []
        active_players_metadata = {}

        for ws, state in self.connection_states.items():
            if ws in self.active_connections.get(game_id, []):
                 if state["player_id"]:
                     pid = state["player_id"]
                     active_player_ids.append(pid)
                     active_players_metadata[pid] = {
                         "lat": state["lat"],
                         "lng": state["lng"],
                         "active_powerups": state["active_powerups"]
                     }

        if not active_player_ids:
            return

        # 2. Fetch Trails for ALL active players in one go
        # We use ST_AsGeoJSON to get the coordinates array
        trails_map = {}
        
        try:
            stmt = select(PlayerTrail.player_id, func.ST_AsGeoJSON(PlayerTrail.trail).label("geojson")).where(PlayerTrail.player_id.in_(active_player_ids))
            result = await db.execute(stmt)
            for row in result:
                pid = row.player_id
                geojson_str = row.geojson
                if geojson_str:
                    geojson = json.loads(geojson_str)
                    # geojson["coordinates"] is a list of [lng, lat] arrays
                    # Convert to [{"lat": y, "lng": x}, ...]
                    coords = [{"lat": p[1], "lng": p[0]} for p in geojson.get("coordinates", [])]
                    trails_map[pid] = coords
        except Exception as e:
            print(f"Error fetching trails: {e}")


        # 4. Fetch Territories
        territories_list = []
        try:
            # Fetch all territories
            # We want the owner ID and the GeoJSON geometry
            t_stmt = select(PlayerTerritory.player_id, func.ST_AsGeoJSON(PlayerTerritory.territory).label("geojson"), PlayerTerritory.area_sqm)
            t_result = await db.execute(t_stmt)
            for row in t_result:
                t_pid = row.player_id
                t_geojson_str = row.geojson
                t_area = row.area_sqm
                
                if t_geojson_str:
                    t_geojson = json.loads(t_geojson_str)
                    
                    # Convert to simple list of points for frontend Polygon [[lat, lng], ...]
                    # GeoJSON Polygon coordinates are usually [[[lng, lat], [lng, lat], ...]] (nested list for rings)
                    # We assume single outer ring for MVP simplicity, or handle multipolygons
                    
                    # Helper to extract points from a Polygon coordinate ring
                    def extract_points(coords_ring):
                        return [{"lat": p[1], "lng": p[0]} for p in coords_ring]

                    # Handle Polygon vs MultiPolygon
                    polygons = []
                    if t_geojson["type"] == "Polygon":
                        # t_geojson["coordinates"] is [outer_ring, inner_ring1, ...]
                        # We just take the outer ring for now
                        if len(t_geojson["coordinates"]) > 0:
                            polygons.append(extract_points(t_geojson["coordinates"][0]))
                            
                    elif t_geojson["type"] == "MultiPolygon":
                        for poly_coords in t_geojson["coordinates"]:
                            if len(poly_coords) > 0:
                                polygons.append(extract_points(poly_coords[0]))
                                
                    for poly_points in polygons:
                        territories_list.append({
                            "owner_id": str(t_pid),
                            "points": poly_points,
                            "area": t_area
                        })

        except Exception as e:
            print(f"Error fetching territories: {e}")

        # 5. Send customized state to each connected client
        for connection in list(self.active_connections[game_id]):
            recipient_state = self.connection_states.get(connection)
            recipient_id = recipient_state.get("player_id") if recipient_state else None
            
            payload_players = []

            for pid in active_player_ids:
                meta = active_players_metadata[pid]
                is_me = (pid == recipient_id)
                pid_str = str(pid)

                # INVISIBILITY LOGIC:
                # If other_player is invisible AND it's not me, SKIP adding them to payload.
                if "invisibility" in meta["active_powerups"] and not is_me:
                    continue

                # If recipient hasn't moved, use 0,0 or their last known
                r_lat = recipient_state["lat"] if recipient_state else 0.0
                r_lng = recipient_state["lng"] if recipient_state else 0.0
                
                # Projection Logic
                if r_lat != 0.0:
                     proj_lat, proj_lng = project_to_observer(
                         r_lat, r_lng,
                         meta["lat"], meta["lng"]
                     )
                     
                     # Project Trail Points
                     # This is computationally expensive to do for every point for every player.
                     # Optimization: Only project the last N points or simplify?
                     # For MVP: We project ALL points.
                     raw_trail = trails_map.get(pid, [])
                     proj_trail = []
                     for pt in raw_trail:
                         pl, pg = project_to_observer(r_lat, r_lng, pt["lat"], pt["lng"])
                         proj_trail.append({"lat": pl, "lng": pg})
                     
                else:
                     # Fallback: Raw
                     proj_lat, proj_lng = meta["lat"], meta["lng"]
                     proj_trail = trails_map.get(pid, [])
                
                # Construct Player Object for Payload
                payload_players.append({
                    "id": pid_str,
                    "is_me": is_me,
                    "position": {"lat": proj_lat, "lng": proj_lng},
                    "trail": proj_trail, 
                    "status": "active",
                    "powerups": meta["active_powerups"]
                })

            try:
                await connection.send_json({
                    "type": "game_state",
                    "tick": 0, 
                    "players": payload_players,
                    "territories": territories_list 
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
                        
                        # --- GAME LOGIC START ---
                        
                        # 0. Helper: Current Point Geometry
                        point_wkt = f'POINT({lng} {lat})'
                        
                        # 1. Check if inside OWN Territory (Safe Zone)
                        # We need to fetch the territory first
                        territory_sql = select(PlayerTerritory).where(PlayerTerritory.player_id == current_player.id)
                        t_res = await db.execute(territory_sql)
                        player_territory = t_res.scalar_one_or_none()
                        
                        is_inside = False
                        # 1a. Check if inside OWN Territory
                        if player_territory:
                            check_inside = await db.execute(select(func.ST_Contains(player_territory.territory, func.ST_GeomFromText(point_wkt, 4326))))
                            is_inside = check_inside.scalar()

                        # 1b. Check if inside/near SAFE POINT
                        # We use ST_DWithin used against all safe points.
                        # Optimization: In a huge game, we would limit this query to nearby chunks.
                        hit_safe_point_sql = text("""
                            SELECT id, radius FROM safe_points 
                            WHERE ST_DWithin(location, ST_GeomFromText(:pt, 4326), radius)
                            LIMIT 1
                        """)
                        sp_res = await db.execute(hit_safe_point_sql, {"pt": point_wkt})
                        safe_point = sp_res.fetchone()
                        
                        is_safe_zone = is_inside or (safe_point is not None)
                        
                        # 2. Handle Trail Logic
                        trail_sql = select(PlayerTrail).where(PlayerTrail.player_id == current_player.id)
                        tr_res = await db.execute(trail_sql)
                        player_trail = tr_res.scalar_one_or_none()
                        
                        if is_safe_zone:
                            # SCENARIO: Player is SAFE (Territory OR Safe Point)
                            
                            if player_trail:
                                # EVENT: BANKING / SECURING TRAIL
                                # If we hit a Safe Point specifically, OR re-entered territory, we Bank.
                                # Logic is same: Trail -> Buffered Polygon -> Union.
                                
                                # Use ST_Buffer to create a corridor from the line
                                # Buffer width: 2.0 meters (so 4m wide corridor)
                                try:
                                    # Convert trail to buffered polygon
                                    buffer_sql = text("""
                                        SELECT ST_Multi(ST_Buffer(trail::geometry, 2.0, 'endcap=round join=round'))
                                        FROM player_trails WHERE player_id = :pid
                                    """)
                                    buf_res = await db.execute(buffer_sql, {"pid": current_player.id})
                                    new_poly_geom = buf_res.scalar()
                                    
                                    if new_poly_geom:
                                        # Union with existing territory
                                        if player_territory:
                                            update_terr_sql = text("""
                                                UPDATE player_territories
                                                SET territory = ST_Multi(ST_Union(territory::geometry, :new_geom::geometry))::geography,
                                                    area_sqm = ST_Area(ST_Multi(ST_Union(territory::geometry, :new_geom::geometry))::geography)
                                                WHERE player_id = :pid
                                            """)
                                            await db.execute(update_terr_sql, {"new_geom": new_poly_geom, "pid": current_player.id})
                                        else:
                                            # Create new territory from buffer if none exists
                                            area_val = await db.execute(select(func.ST_Area(new_poly_geom)))
                                            new_terr = PlayerTerritory(
                                                player_id=current_player.id, 
                                                territory=new_poly_geom,
                                                area_sqm=area_val.scalar() or 0.0
                                            )
                                            db.add(new_terr)

                                        # Clear the trail
                                        await db.execute(text("DELETE FROM player_trails WHERE player_id = :pid"), {"pid": current_player.id})
                                        
                                        # Notify
                                        await manager.broadcast({
                                            "type": "trail_banked",
                                            "player_id": str(current_player.id),
                                            "reason": "safe_point" if safe_point else "territory"
                                        }, game_id)
                                        
                                except Exception as e:
                                    print(f"Banking Failed: {e}")
                                    await db.execute(text("DELETE FROM player_trails WHERE player_id = :pid"), {"pid": current_player.id})
                                
                            else:
                                pass # Just moving safely
                        
                        else:
                            # SCENARIO: Player is Vulnerable (Outside)
                            # SCENARIO: Player is OUTSIDE territory
                            
                            if not player_trail:
                                # START NEW TRAIL
                                new_trail = PlayerTrail(
                                    player_id=current_player.id, 
                                    trail=func.ST_GeomFromText(f'LINESTRING({lng} {lat}, {lng} {lat})', 4326)
                                )
                                db.add(new_trail)
                            else:
                                # EXTEND TRAIL
                                # Add point
                                await db.execute(
                                    text("""
                                        UPDATE player_trails 
                                        SET trail = ST_AddPoint(trail::geometry, ST_MakePoint(:lng, :lat))::geography
                                        WHERE player_id = :pid
                                    """),
                                    {"lng": lng, "lat": lat, "pid": current_player.id}
                                )
                                
                                # CHECK FOR SELF-INTERSECTION (Loop Closure in Void)
                                # If the updated trail is NOT simple, it crossed itself.
                                # ST_IsSimple returns true if no self-intersections.
                                is_simple_res = await db.execute(
                                    text("SELECT ST_IsSimple(trail::geometry) FROM player_trails WHERE player_id = :pid"),
                                    {"pid": current_player.id}
                                )
                                is_simple = is_simple_res.scalar()
                                
                                if not is_simple:
                                    # Self-intersection detected! CAPTURE.
                                    # For a self-intersecting linestring, ST_Polygonize is useful.
                                    # Or ST_BuildArea?
                                    # Simplest robust approach: ST_Buffer(trail, 0) often fixes/melts it into a polygon if closed.
                                    # But ST_Polygonize is better for lines.
                                    
                                    try:
                                        # Attempt to convert to territory
                                        # Logic: Convert to Polygon -> Update/Create Territory -> Clear Trail
                                        
                                        # 1. Generate Polygon from 'non-simple' line
                                        # ST_Node(trail) splits it at intersections. ST_Polygonize builds faces.
                                        poly_sql = text("""
                                            SELECT ST_Multi(ST_BuildArea(ST_Node(trail::geometry))) 
                                            FROM player_trails WHERE player_id = :pid
                                        """)
                                        res = await db.execute(poly_sql, {"pid": current_player.id})
                                        captured_geom = res.scalar()
                                        
                                        if captured_geom:
                                            if player_territory:
                                                 # Merge
                                                await db.execute(text("""
                                                    UPDATE player_territories
                                                    SET territory = ST_Multi(ST_Union(territory::geometry, :new_geom::geometry))::geography,
                                                        area_sqm = ST_Area(ST_Multi(ST_Union(territory::geometry, :new_geom::geometry))::geography)
                                                    WHERE player_id = :pid
                                                """), {"new_geom": captured_geom, "pid": current_player.id})
                                            else:
                                                # Create New
                                                # area calculation
                                                area_val = await db.execute(select(func.ST_Area(captured_geom)))
                                                new_terr = PlayerTerritory(
                                                    player_id=current_player.id,
                                                    territory=captured_geom,
                                                    area_sqm=area_val.scalar() or 0.0
                                                )
                                                db.add(new_terr)
                                            
                                            # Clear Trail
                                            await db.execute(text("DELETE FROM player_trails WHERE player_id = :pid"), {"pid": current_player.id})
                                            
                                    except Exception as e:
                                        print(f"Self-Intersection Capture Error: {e}")
                                        # await db.execute(text("DELETE FROM player_trails WHERE player_id = :pid"), {"pid": current_player.id})

                        
                        await db.commit()
                        
                        # 3. Broadcast new state
                        await manager.broadcast_game_state(game_id, current_player.id, lat, lng, db)
                        
                elif msg_type == "use_powerup" and current_player:
                    powerup_id = message.get("powerup_id") # 'shield', 'invisibility'
                    
                    # Verify inventory
                    stmt = select(PlayerPowerup).where(
                        PlayerPowerup.player_id == current_player.id,
                        PlayerPowerup.powerup_id == powerup_id,
                        PlayerPowerup.quantity > 0
                    )
                    res = await db.execute(stmt)
                    inventory_item = res.scalar_one_or_none()
                    
                    if inventory_item:
                        # Decrement logic
                        inventory_item.quantity -= 1
                        await db.commit()
                        
                        # Activate powerup in session state
                        # Note: In a real game, this would have a duration/expiry task.
                        # For MVP we just toggle it on or add to list.
                        if powerup_id not in manager.connection_states[websocket]["active_powerups"]:
                            manager.connection_states[websocket]["active_powerups"].append(powerup_id)
                        
                        # Broadcast update immediately so everyone sees it (e.g. they disappear)
                        # We pass dummy lat/lng if we don't have them handy, or use stored ones
                        clat = manager.connection_states[websocket]["lat"]
                        clng = manager.connection_states[websocket]["lng"]
                        await manager.broadcast_game_state(game_id, current_player.id, clat, clng, db)

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
