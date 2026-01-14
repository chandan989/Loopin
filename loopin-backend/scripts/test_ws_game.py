import asyncio
import json
import uuid
import sys
import random

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
    username = f"tester_{uuid.uuid4().hex[:8]}"
    
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
                
                # 3. Simulate Movement Loop
                # Send 3 position updates to generate a trail
                start_lat, start_lng = 12.9716, 77.5946
                
                for i in range(3):
                    lat = start_lat + (i * 0.0001)
                    lng = start_lng + (i * 0.0001)
                    
                    msg = {
                        "type": "position_update", 
                        "lat": lat, 
                        "lng": lng
                    }
                    print(f"Sending: {msg}")
                    await ws.send(json.dumps(msg))
                    
                    # Wait for response
                    response = await ws.recv()
                    data = json.loads(response)
                    
                    if data.get("type") == "game_state":
                        players = data.get("players", [])
                        me = next((p for p in players if p["id"] == player_id), None)
                        
                        if me:
                            trail_len = len(me.get("trail", []))
                            print(f"Game State Received. My Trail Length: {trail_len}")
                            print(f"Position: {me['position']}")
                        else:
                            print("Player not found in game state payload.")
                    else:
                        print("Received unknown message:", data)
                        
                    await asyncio.sleep(0.5)

                # 4. Test Powerup (Expect failure/no-op if empty inventory, but verifies flow)
                print("\nTesting Powerup Usage...")
                await ws.send(json.dumps({
                    "type": "use_powerup",
                    "powerup_id": "invisibility"
                }))
                
                # Receive response (should be a game_state)
                # Note: if inventory is empty, nothing happens in current implementation (no error msg sent back yet)
                # But we should still get the next tick if we implement periodic broadcast or if movement triggers it.
                # Actually, our implementation only broadcasts ON EVENT.
                # If use_powerup fails silent check, no broadcast happens.
                # So we send a move to trigger state update and check active_powerups.
                
                await ws.send(json.dumps({
                    "type": "position_update", 
                    "lat": start_lat, 
                    "lng": start_lng
                }))
                response = await ws.recv()
                data = json.loads(response)
                me = next((p for p in data.get("players", []) if p["id"] == player_id), None)
                if me:
                    print(f"Active Powerups: {me.get('powerups')}")
                    
        except Exception as e:
            print(f"WebSocket Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
