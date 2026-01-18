# Loopin Game Server (WebServer)

The Node.js backend for Loopin, responsible for real-time game mechanics, player persistence, and blockchain interactions.

## 🚀 Features

* **Real-time WebSocket Game Loop**: Handles player position updates, trail formation, loop detection (territory capture), and collisions.
* **Supabase / PostGIS Integration**: Stores all geospatial data (trails, territories, safe points) and handles complex spatial queries via RPCs.
* **Stacks Blockchain Integration**: Syncs game lifecycle (lobby -> start -> end) and player stats with the Stacks blockchain.
* **Monetization**: API for purchasing powerups and managing inventory.

## 🛠 Tech Stack

* **Runtime**: Node.js (Express)
* **Database**: Supabase (PostgreSQL + PostGIS)
* **Blockchain SDK**: Stacks.js
* **Communication**: WebSockets (`ws`), REST API

## 📦 Installation

1. **Install Dependencies**:

    ```bash
    cd WebServer
    npm install
    ```

2. **Environment Configuration**:
    Create a `.env` file based on `.env.example`:

    ```bash
    PORT=8000
    API_PREFIX=/api
    
    # Supabase (Required for Game Mechanics)
    SUPABASE_URL="https://your-project.supabase.co"
    SUPABASE_KEY="your-service-role-key"
    
    # Stacks Blockchain
    STACKS_NETWORK="testnet"
    CONTRACT_ADDRESS="ST1PQHQKBV3YX530PXHXSMXE7SXQ8D5X8AKQNMQM.loopin-game-v1"
    
    # CORS
    CORS_ORIGIN="http://localhost:5173"
    ```

3. **Database Setup (Critical)**:
    You **MUST** execute the SQL functions found in `supabase_rpc.sql` in your Supabase Project's SQL Editor. These functions (`update_player_position_rpc`, `join_game`, etc.) handle the core game logic atomically.

## 🚀 Running the Server

```bash
npm start
```

The server will start on port `8000`.

* **HTTP API**: `http://localhost:8000/api`
* **WebSocket**: `ws://localhost:8000/ws/game`

## 🔗 API Endpoints

### Game

* `GET /api/game/lobby`: List active game sessions.
* `POST /api/game/:id/confirm-join`: Join a game (Syncs with DB).
* `POST /api/game/create`, `start`, `end`: Blockchain syncing endpoints (Admin/Automated).

### Player

* `GET /api/player/:address/profile`: Get player profile, stats, and powerup inventory.
* `GET /api/player/:address/stats`: Get blockchain-recorded stats.

### Powerups & Ads

* `POST /api/powerup/purchase`: Buy a powerup.
* `GET /api/ads/locations`: Get sponsored locations.

## 🧩 Architecture

The server acts as the authoritative source for the "Game World".

1. **Clients** send `position_update` via WebSocket.
2. **Server** calls `update_player_position_rpc` in Supabase.
3. **PosGIS** calculates intersections, captures, and banks.
4. **Supabase** returns events (Territory Captured, Trail Severed).
5. **Server** broadcasts updated Game State to all connected clients.
