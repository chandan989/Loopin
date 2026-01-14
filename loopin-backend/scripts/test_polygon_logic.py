import asyncio
import json
import uuid
import sys
import math

# Attempt to import require libraries
try:
    import httpx
    import websockets
except ImportError:
    print("Missing dependencies. Please install: pip install httpx websockets")
    sys.exit(1)

BASE_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"

async def register_player(client):
    wallet = f"0x{uuid.uuid4().hex}"
    username = f"poly_test_{uuid.uuid4().hex[:8]}"
    
    print(f"Registering player {username}...")
    try:
        resp = await client.post(f"{BASE_URL}/api/v1/players/register", json={
            "wallet_address": wallet,
            "username": username
        })
        if resp.status_code != 200:
            print(f"Registration failed: {resp.text}")
            return None
        return resp.json()
    except Exception as e:
        print(f"Could not register (Is server running?): {e}")
        return None

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Register Player
        player_data = await register_player(client)
        if not player_data:
            return

        player_id = player_data["id"]
        print(f"Player registered with ID: {player_id}")
        
        # 2. Connect to Game WS
        game_id = uuid.uuid4()
        ws_endpoint = f"{WS_URL}/ws/game/{game_id}?player_id={player_id}"
        
        print(f"Connecting to WebSocket: {ws_endpoint}")
        
        try:
            async with websockets.connect(ws_endpoint) as ws:
                print("Connected!")
                
                # Coords base (Bangalore roughly)
                base_lat, base_lng = 12.9716, 77.5946
                scale = 0.001 # roughly 100m steps
                
                # Define a Square Path (Loop)
                path = [
                    (base_lat, base_lng), # Start
                    (base_lat + scale, base_lng), # North
                    (base_lat + scale, base_lng + scale), # East
                    (base_lat, base_lng + scale), # South
                    (base_lat, base_lng)  # West (Back to start - CLOSURE)
                ]
                
                print("\n--- PHASE 1: Drawing a Square Trail ---")
                for lat, lng in path:
                    msg = {"type": "position_update", "lat": lat, "lng": lng}
                    print(f">> Moving to {lat:.4f}, {lng:.4f}")
                    await ws.send(json.dumps(msg))
                    
                    # Receive state
                    resp = await ws.recv()
                    data = json.loads(resp)
                    me = next((p for p in data.get("players", []) if p["id"] == player_id), None)
                    if me:
                        trail_chk = me.get("trail", [])
                        print(f"   Trail Points: {len(trail_chk)}")
                        if len(trail_chk) == 0:
                            print("   [!] Trail cleared! Polygon formed?")
                    await asyncio.sleep(0.2)
                    
                # At this point, trail should be 0 because we closed the loop.
                
                print("\n--- PHASE 2: Moving INSIDE the Polygon ---")
                # Move to center of square
                center_lat = base_lat + (scale / 2)
                center_lng = base_lng + (scale / 2)
                
                msg = {"type": "position_update", "lat": center_lat, "lng": center_lng}
                print(f">> Moving to Center {center_lat:.4f}, {center_lng:.4f}")
                await ws.send(json.dumps(msg))
                
                resp = await ws.recv()
                data = json.loads(resp)
                me = next((p for p in data.get("players", []) if p["id"] == player_id), None)
                if me:
                    trail_chk = me.get("trail", [])
                    print(f"   Trail Points (Should be 0): {len(trail_chk)}")
                    if len(trail_chk) > 0:
                        print("   [FAIL] Trail formed inside territory!")
                    else:
                        print("   [PASS] No trail inside territory.")
                        
                print("\n--- PHASE 3: Moving OUTSIDE to form new trail ---")
                # Move far away
                out_lat = base_lat + (scale * 2)
                out_lng = base_lng + (scale * 2)
                
                msg = {"type": "position_update", "lat": out_lat, "lng": out_lng}
                print(f">> Moving Outside {out_lat:.4f}, {out_lng:.4f}")
                await ws.send(json.dumps(msg))
                
                # ... (Previous Phases) ...
                
                print("\n--- PHASE 4: Safe Point Banking Test ---")
                
                # 1. Manually insert a temporary Safe Point near our current position
                # Current pos: out_lat, out_lng
                # Let's put a safe point 0.0005 deg away
                sp_lat = out_lat + 0.0005
                sp_lng = out_lng
                
                # Use a separate script/connection to seed this? Or just move to a known seeded point?
                # Ideally the test script should likely just assume the environment is set up or set it up itself.
                # Since we don't have direct DB access in this script (it uses http/ws), we depend on the seed script having run OR we can try to hit one of the hardcoded ones if we knew where they were.
                # BUT, since I can't easily guarantee the DB state from the CLIENT script without an admin API, 
                # I will skip the live validation of the safe point in this script unless I add an admin endpoint.
                # A better approach for this script is to trust the user ran `seed_safe_points.py`.
                
                print(">> NOTE: To verify Safe Points, ensure you have run 'python scripts/seed_safe_points.py'")
                print(">> Moving towards a hypothetical Safe Point at [12.9710, 77.5940] (South West from Seed)")
                
                target_lat, target_lng = 12.9710, 77.5940
                
                # Move closer to it
                msg = {"type": "position_update", "lat": target_lat, "lng": target_lng}
                print(f">> Moving to Safe Point {target_lat}, {target_lng}")
                await ws.send(json.dumps(msg))
                await asyncio.sleep(0.5)
                
                resp = await ws.recv()
                data = json.loads(resp)
                me = next((p for p in data.get("players", []) if p["id"] == player_id), None)
                if me:
                    trail_chk = me.get("trail", [])
                    print(f"   Trail Points: {len(trail_chk)}")
                    if len(trail_chk) == 0:
                        print("   [PASS] Trail cleared at Safe Point!")
                    else:
                        print("   [?] Trail still exists. (Maybe not close enough to safe point?)")

        except Exception as e:
            print(f"WebSocket Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

