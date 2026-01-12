# LOOPIN - Backend

This directory contains the primary backend for **Loopin**.

This server is a consolidated **FastAPI (Python)** application that acts as the core "brain" and "world" of the game. It is responsible for all real-time game logic, strategic AI, and monetization services.

## ⚡ Architectural Role

This backend follows a **Dual-Engine Design**. Responsibilities are split into two separate servers for security and performance:

1. **FastAPI Monolith Engine (This Server):**

      * **What it is:** The "Game World & Brain".
      * **Responsibilities:**
          * **Game Logic:** Manages all real-time player movement, PostGIS-based collision detection, and territory capture via WebSockets.
          * **AI Manager:** Contains the strategic AI that analyzes player positions and decides where to spawn dynamic, high-value events.
          * **Ads Service:** Manages a database of paying sponsors and their locations, providing endpoints for the AI to drive player traffic.
      * **Keys:** Holds *no* blockchain private keys.

2. **Node.js Web3 Manager (Separate Server):**

      * **What it is:** The "Game Treasury".
      * **Responsibilities:**
          * **Web3 Transactions:** Securely holds the `DEPLOYER_PRIVATE_KEY`.
          * **Contract Calls:** Exposes secure, internal-only endpoints (e.g., `/end-game`) that this FastAPI server calls to pay out the prize pool to the winner.

This design allows the FastAPI server to handle thousands of high-frequency, real-time events without ever exposing the sensitive keys that control the game's economy.

-----

## 🚀 Activation Sequence

1. **Clone the Repository**

    ```bash
    git clone https://github.com/chandan989/loopin.git
    cd loopin/loop-backend
    ```

2. **Install Dependencies**
    (Use of a Python virtual environment is highly recommended)

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: .\venv\Scripts\activate
    pip install -r requirements.txt
    ```

3. **Set up PostGIS**
    This backend *requires* PostgreSQL with the PostGIS extension.

    * **Local PostgreSQL:**

      ```sql
      -- Connect to your database and run:
      CREATE EXTENSION postgis;
      ```

    * **Supabase:**
      PostGIS is supported out of the box. Enable it in the Supabase Dashboard:
      `Database` -> `Extensions` -> Search for `postgis` -> Enable.

4. **Configure Environment**
    Create a `.env` file in this directory. Fill it out based on the `.env.example` or the section below.

5. **Initialize Database**

    ```bash
    # Run the database migration script (e.g., using Alembic or a custom script)
    python scripts/init_db.py 
    ```

6. **Launch Backend Core**

    ```bash
    # Start the FastAPI server with auto-reload for development
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ```

🟢 **BACKEND ONLINE**: `http://localhost:8000`
🟢 **API DOCUMENTATION**: `http://localhost:8000/docs` (Provided by FastAPI's Swagger UI)

-----

## ⚙️ Environment Variables (.env)

Create a `.env` file with the following variables:

```bash
# === DATABASE (POSTGIS) ===
# Connection string for your PostGIS-enabled database
DATABASE_URL="postgresql+psycopg2://YOUR_DB_USER:YOUR_DB_PASS@localhost:5432/loopin_gis"



# === BLOCKCHAIN CONSENSUS (READ-ONLY) ===
# Used for read-only calls, e.g., to verify a player's join-game transaction
STACKS_NETWORK="testnet"
STACKS_RPC_URL="https://api.testnet.hiro.so"
CONTRACT_ADDRESS="your_deployed_contract_address"
CONTRACT_NAME="loopin-game-v1"

# === WEB3 MANAGER (NODE.JS) ===
# Internal API endpoints for the separate Node.js treasury server
WEB3_MANAGER_URL="http://localhost:3001/api/web3"
WEB3_MANAGER_API_KEY="your-secret-key-shared-between-fastapi-and-node"

# === GEOSPATIAL CONFIG ===
TERRITORY_MIN_AREA_SQM="100"
COLLISION_TOLERANCE_METERS="5"
MAX_TRAIL_POINTS="10000"

# === GRID ECONOMICS ===
ENTRY_FEE_STX="2"
SHIELD_COST_STX="2"
STEALTH_COST_STX="5"

```

-----

## 📡 API Endpoints (REST)

This server provides all API endpoints for the game, AI, and ad management.

### Public Game API (for Frontend Client)

* **`GET /api/v1/games/lobby`**

  * **Description:** Fetches all active games with a `status` of "lobby" from the database.
  * **Auth:** `None`
  * **Success Response (200 OK):**

        ```json
        [
          {
            "id": "game-uuid-1",
            "status": "lobby",
            "player_count": 5,
            "max_players": 10,
            "entry_fee": 500000,
            "prize_pool": 2500000
          }
        ]
        ```

* **`GET /api/v1/game/{game_id}`**

  * **Description:** Fetches the complete, current state of a specific game.
  * **Auth:** `None`
  * **Success Response (200 OK):** `GameSession` object (see `gameTypes.ts`)

        ```json
        {
          "id": "game-uuid-1",
          "status": "active",
          "players": [...],
          "leaderboard": [...],
          "time_remaining": 2987,
          ...
        }
        ```

* **`POST /api/v1/game/{game_id}/confirm_join`**

  * **Description:** Called by the frontend *after* the user's on-chain `join-game` transaction is confirmed. This officially adds the player to the real-time game loop.
  * **Auth:** `User JWT` (from Supabase)
  * **Success Response (200 OK):**

        ```json
        {
          "status": "success",
          "message": "Player added to game"
        }
        ```

### Internal Ads & AI API (for Admin & Server-to-Server)

* **`POST /api/v1/ads/locations`**

  * **Description:** An endpoint for your business team to add, update, or remove a paying sponsor's location from the database.
  * **Auth:** `Admin API Key`
  * **Request Body:**

        ```json
        {
          "sponsor_name": "Starbucks",
          "address": "123 Main St, Anytown, USA",
          "lat": 34.0522,
          "lng": -118.2437,
          "bid_price": 0.50 
        }
        ```

  * **Success Response (201 Created):** `{ "status": "created", "id": "location-uuid-1" }`

* **`GET /api/v1/ads/locations`**

  * **Description:** An endpoint for the **AI Manager** to query, retrieving a list of all active sponsor locations and their "bids".
  * **Auth:** `Internal API Key`
  * **Success Response (200 OK):**

        ```json
        [
          {
            "id": "location-uuid-1",
            "lat": 34.0522,
            "lng": -118.2437,
            "bid_price": 0.50
          }
        ]
        ```

* **`POST /api/v1/game/{game_id}/spawn-event`**

  * **Description:** Called by the **AI Manager** to inject a dynamic event (like a sponsored Sync Node) into a live game.
  * **Auth:** `Internal API Key` (only the server itself can call this)
  * **Request Body:**

        ```json
        {
          "event_type": "sponsored_sync_node",
          "lat": 34.0522,
          "lng": -118.2437,
          "reward_type": "shield",
          "display_name": "Starbucks Bonus Node"
        }
        ```

  * **Success Response (202 Accepted):** `{ "status": "event_queued" }`

-----

## 🛰️ WebSocket API

This is the real-time communication layer for live gameplay.

**Endpoint:** `ws://localhost:8000/ws/game/{game_id}`

### Client → Server Events

* **Event:** `position_update`
  * **Payload:** `{ "lat": 34.0522, "lng": -118.2437 }`
  * **Description:** Sent by the client continuously to update the server with their current GPS coordinates.

### Server → Client Events

* **Event:** `game_state_update`
  * **Payload:** `GameSession` object
  * **Description:** Broadcast to all players on a regular tick (e.g., 100ms), containing the latest positions, trails, and scores for everyone.
* **Event:** `territory_captured`
  * **Payload:** `{ "player_id": "user-uuid", "new_territory": [...], "new_score": 1250 }`
  * **Description:** Sent when a player successfully closes a loop.
* **Event:** `trail_severed`
  * **Payload:** `{ "attacker_id": "user-uuid-1", "victim_id": "user-uuid-2" }`
  * **Description:** Sent when one player "cuts" an opponent's active trail.
  * **Event:** `dynamic_event_spawned`
    * **Payload:** `{ "event_type": "sponsored_sync_node", "lat": 34.0522, "lng": -118.2437, ... }`
    * **Description:** Broadcast to all players when the **AI Manager** creates a new sponsored event on the map.
  * **Event:** `powerup_activated`
    * **Payload:** `{ "player_id": "user-uuid", "type": "shield", "duration": 60 }`
    * **Description:** Broadcast when a player purchases/activates a power-up (Shield or Stealth).
  * **Event:** `error`
    * **Payload:** `{ "code": 4001, "message": "Invalid position update." }`
    * **Description:** Sent to a specific client if they send a malformed event.

### Flow 5: Power-Ups & Payments

1. **Shield (2 STX)**: Protects against trail severing.
2. **Stealth (5 STX)**: Makes trail invisible for 60 seconds.
3. **Purchase:** User pays STX -> Smart Contract -> Backend confirmation -> Power-up active.

### Flow 6: Partner Checkpoints (B2B)

Local businesses act as "Sync Nodes". Players visit these locations to trigger specific rewards or game events.

-----

## 🗄️ Database Schema (PostGIS)

This server relies on PostGIS for all core game logic and ad management.

### `game_sessions`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identifier for the game session. |
| `on_chain_id` | `Integer` | The game ID from the Stacks smart contract. |
| `status` | `String(20)` | "lobby", "active", "ended", "cancelled". |
| `start_time` | `Timestamp` | Time the game moved from "lobby" to "active". |
| `end_time` | `Timestamp` | Time the game is scheduled to end. |

### `players`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identifier for the player's participation. |
| `wallet_address` | `String(100)`| Player's Stacks principal (e.g., "ST..."). **(Unique)** |
| `id` | `UUID` (PK) | Unique identifier for the player's participation. |
| `wallet_address` | `String(100)`| Player's Stacks principal (e.g., "ST..."). **(Unique)** |
| `username` | `String(50)` | Display name. **(Unique)** |
| `avatar_seed` | `String(100)` | Seed for randomly generating avatars. |
| `level` | `Integer` | Player level. |
| `joined_at` | `Timestamp` | Account creation time. |

### `player_trails`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identifier for this trail segment. |
| `player_id` | `UUID` (FK) | Foreign key to `players.id`. |
| `id` | `UUID` (PK) | Unique identifier for this trail segment. |
| `player_id` | `UUID` (FK) | Foreign key to `players.id`. |
| `trail` | `geography(LINESTRING)` | A PostGIS linestring representing the player's active, un-banked trail. |

### `game_participants`

| Column | Type | Description |
| :--- | :--- | :--- |
| `game_id` | `UUID` (FK) | Foreign key to `game_sessions.id`. |
| `player_id` | `UUID` (FK) | Foreign key to `players.id`. |
| `joined_at` | `Timestamp` | Time the player joined the game. |

### `player_stats`

| Column | Type | Description |
| :--- | :--- | :--- |
| `player_id` | `UUID` (PK, FK) | Foreign key to `players.id`. |
| `total_area` | `Float` | Total area captured across all games. |
| `games_played` | `Integer` | Total number of games participated in. |
| `games_won` | `Integer` | Total number of games won. |
| `total_earnings` | `Float` | Total crypto earnings. |
| `longest_trail` | `Float` | Longest single trail created. |
| `biggest_loop` | `Float` | Largest single loop captured. |
| `current_streak` | `Integer` | Current winning streak. |

### `player_game_history`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identifier. |
| `player_id` | `UUID` (FK) | Foreign key to `players.id`. |
| `game_id` | `UUID` (FK) | Foreign key to `game_sessions.id`. |
| `rank` | `Integer` | Final rank in the game. |
| `area_captured` | `Float` | Area captured in that specific game. |
| `prize_won` | `Float` | Prize amount won. |
| `played_at` | `Timestamp` | Time of the game. |

### `powerups`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `String` (PK) | Unique ID (e.g., 'shield', 'ghost'). |
| `name` | `String` | Display name. |
| `description` | `Text` | Description of effect. |
| `cost` | `Float` | Cost in STX. |
| `type` | `String` | Type (defense, offense, etc.). |

### `player_powerups` (Inventory)

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identifier. |
| `player_id` | `UUID` (FK) | Foreign key to `players.id`. |
| `powerup_id` | `String` (FK) | Foreign key to `powerups.id`. |
| `quantity` | `Integer` | Number of items held. |
| `equipped` | `Boolean` | Whether currently active/equipped. |

### `player_territories`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identifier for this captured territory. |
| `player_id` | `UUID` (FK) | Foreign key to `players.id`. |
| `territory` | `geography(POLYGON)` | A PostGIS polygon representing the captured area. |
| `area_sqm` | `Float` | The calculated area of the polygon, used for scoring. |

### `sponsors`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identifier for the sponsor. |
| `name` | `String(255)` | Legal name of the sponsor (e.g., "Starbucks Inc."). |
| `contact_email` | `String(255)` | Business contact. |

### `sponsored_locations`

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identifier for the ad location. |
| `sponsor_id` | `UUID` (FK) | Foreign key to `sponsors.id`. |
| `name` | `String(255)` | Display name (e.g., "Starbucks on Main"). |
| `location` | `geography(POINT)` | The exact GPS coordinates of the sponsored location. **(Indexed)** |
| `bid_price` | `Decimal` | The amount (e.g., $0.50) the sponsor pays per event/visit. |

-----

## 🔁 Key Process Flows

### Flow 1: Player Joins a Game

1. **Frontend:** User clicks "Join Game" for a lobby.
2. **Frontend:** Prompts user's wallet (Hiro/Xverse) to call the `join-game` function on the Stacks contract, which transfers the STX entry fee.
3. **Frontend:** Polls the Stacks network until the transaction is confirmed.
4. **Frontend:** On confirmation, prompts user to sign a message to prove ownership of the wallet.
5. **Frontend:** Sends a `POST /api/v1/game/{game_id}/confirm_join` request to the FastAPI backend with `wallet_address` and `signature`.
6. **Backend:** The backend verifies the signature, finds/creates the player by `wallet_address`, and marks them as active for that `game_id`.
7. **Backend:** The player is now included in the next `game_state_update` WebSocket broadcast.

### Flow 2: Real-time Gameplay Loop (Trail & Collision)

1. **Client:** Sends `position_update` (e.g., 5x/second) to the WebSocket.
2. **Backend:** Receives the coordinate.
3. **Backend:** Appends the new point to the player's `player_trails` `LINESTRING` in PostGIS.
4. **Backend:** Runs two PostGIS queries:
      * **Collision Check:** `ST_Intersects(this_trail, other_trails)`: Does this new trail segment cross any *other* player's active trail? If yes, fire `trail_severed` event.
      * **Loop Check:** `ST_Intersects(this_trail, ST_StartPoint(this_trail))`: Does this trail's end touch its beginning? If yes, proceed to capture.
5. **Backend (on Loop Capture):**
      * Uses `ST_MakePolygon` to create a polygon from the `LINESTRING`.
      * Uses `ST_Area` to calculate the area.
      * Inserts the new polygon into `player_territories`.
      * Deletes the active `player_trail`.
      * Broadcasts a `territory_captured` event.
6. **Backend:** Broadcasts the new `game_state_update` (with updated positions/scores) to all clients.

### Flow 3: AI-Sponsored Event

1. **Backend (AI Manager):** A background task runs (e.g., every 5 minutes).
2. **AI Manager:** Queries `GET /api/v1/ads/locations` (internally) to get all sponsor locations.
3. **AI Manager:** Queries its own database to get the current `geography(POINT)` of all active players.
4. **AI Manager:** Runs its algorithm (e.g., "find a sponsor location within 500m of a cluster of 3+ players").
5. **AI Manager:** Finds a match\! It calls `POST /api/v1/game/{game_id}/spawn-event` (internally) with the chosen location's details.
6. **Backend (Game Engine):** Receives the command and broadcasts a `dynamic_event_spawned` message to all players in that game.
7. **Client:** The frontend receives the event and renders a special icon on the map at the sponsored location.

### Flow 4: Game End & Payout

1. **Backend (Game Engine):** The `end_time` for a game is reached. The server sets its `status` to "ended".
2. **Backend:** Runs a final query on `player_territories` to find the `player_id` with the `SUM(area_sqm)`.
3. **Backend:** This `player_id` is the winner. The server looks up their `wallet_address` from the `players` table.
4. **Backend:** Sends an internal HTTP request to the **Node.js Web3 Manager**:
      * `POST http://localhost:3001/api/web3/end-game`
      * `Headers: { "X-API-Key": "..." }`
      * `Body: { "game_id": 123, "winner": "ST...WINNER...ADDRESS" }`
5. **Node.js Manager:** Receives the request, validates the API key.
6. **Node.js Manager:** Uses its `DEPLOYER_PRIVATE_KEY` to construct, sign, and broadcast an `end-game` transaction to the Stacks contract, passing the winner's address.
7. **Stacks Contract:** The contract verifies the call, calculates the 5% platform fee, and transfers the remaining prize pool to the winner's address.

-----

## 🛡️ Security & Error Handling

* **Authentication:** All user-facing endpoints that modify data (like `confirm_join`) are protected by Wallet Signature verification.
* **Internal Service Auth:** Communication between the FastAPI server and the Node.js server is secured by a shared secret (`WEB3_MANAGER_API_KEY`) sent in the HTTP headers. This key *must* be a long, randomly generated string.
* **Admin Auth:** Endpoints like `POST /api/v1/ads/locations` must be protected by a separate, distinct `Admin API Key`.
* **Error Codes:** The server uses standard HTTP status codes (e.g., `400` for bad input, `401` for unauthorized, `404` for not found, `500` for internal errors).

-----

## ⚖️ License

MIT License
