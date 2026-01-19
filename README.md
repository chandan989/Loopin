<div align="center">

# LOOPIN

*Where Reality Becomes Territory. Where Movement Becomes Power.*

<img src="LoopIn.png" width="400" alt="Loopin Logo">

**🌐 COMMAND CENTER**: [https://www.loopin.fit](https://www.loopin.fit)  
**⚙️ SOURCE VAULT**: [https://github.com/chandan989/Loopin](https://github.com/chandan989/Loopin)

</div>

---

## 🌌 THE CONVERGENCE

> *The year is 2025. The membrane between digital and physical reality has shattered. In the aftermath, a new domain emerged—a network grid overlaying the physical world where movement creates power and territory translates to victory.*

You are now a **Grid Runner**—an operator capable of manifesting digital constructs in physical space through pure movement. Your body becomes the interface. Your path becomes the code. Your goal is to capture more territory than anyone else to win the prize.

This isn't augmented reality. This is **reality amplified**.

---

## ⚡ THE PROTOCOL

The game is session-based. Players pay an entry fee in STX to join, which contributes to a prize pool. The winner at the end of the session takes the prize.

### 🔹 PHASE ONE: TRAIL EMISSION

Your physical presence bleeds data. As you move through the world, your neural interface generates a **Quantum Trail**—a cryptographically signed path visible to all Grid Runners in your sector.

```
[PHYSICAL MOVEMENT] → [GPS CAPTURE] → [DIGITAL TRAIL GENERATION] → [REAL-TIME BROADCAST]
```

### 🔹 PHASE TWO: TERRITORIAL CAPTURE

**Loop Formation**: Complete the circuit. Return to any point on your own trail to close the loop, initiating a **Territory Capture Protocol**. The enclosed area becomes yours for the duration of the game.

Each captured zone is:

- **Session-Persistent**: Recorded for the duration of the game session.
- **Strategic**: Control key sectors to dominate the grid and expand your area.

### 🔹 PHASE THREE: GLOBAL CROSSPLAY

To ensure constant competition, the system employs **Spatial Folding** when local runners are scarce.

- **Unified Grid**: The system maps 1km² or 500m² sectors from different physical locations, effectively overlapping them into a single virtual arena.
- **Phantom Runners**: Opponents from across the globe appear on your interface. You see their trails and movements in real-time, as if they were running beside you.
- **Asymmetric Warfare**: While physically separate, you compete for the same virtual territory. Cut their trails, steal their land, and dominate the global grid.

### 🔹 PHASE FOUR: INTERFERENCE WARFARE

You're not alone on the grid. Other runners are creating their own trails, capturing their own territories.

**Trail Severing**: Intersect an opponent's active trail to cut it, collapsing their loop potential and forcing them to restart. Territory capture is zero-sum. Show no mercy.

### 🔹 PHASE FIVE: POWER-UPS & PAYMENTS

The Web3 integration is focused on the game's economy. At **Sync Nodes** that appear throughout your city, you can:

- Purchase tactical upgrades (Power-ups) using STX.
- View the current prize pool.
- Manage your wallet for entry fees and potential winnings.

---

## 🏦 THE ECOSYSTEM

The Grid is not just a game; it's a thriving digital economy overlaid on the physical world. We've built a sustainable revenue model that benefits everyone in the ecosystem—players, businesses, and the platform.

### 🔹 PARTNER CHECKPOINTS (B2B)

Local businesses (cafes, retail stores, gyms) can join the Loopin network as **Partner Checkpoints**.

- **The Value**: Businesses pay to become designated checkpoints or "Sync Nodes" on the grid.
- **The Result**: This drives physical footfall to their locations as players visit these nodes to collect items, recharge, or secure their trails.
- **The Cycle**: A portion of this B2B revenue goes directly into the player prize pool.

### 🔹 GRID ADS

The map interface itself is valuable real estate.

- **Hyped Zones**: Brands can sponsor specific territories or display non-intrusive ads within the tactical interface.
- **Revenue Sharing**: Advertising revenue is not hoarded; it is shared with the community to increase the stakes of every session.

### 🔹 SUSTAINABLE REWARDS

Unlike traditional "move-to-earn" models that rely on inflationary tokenomics, Loopin is built on **Real Yield**.

- **No Out-of-Pocket Payouts**: We don't pay players from our own treasury or by printing tokens.
- **Profit Redistribution**: The prize pool is fueled by Entry Fees + B2B Revenue + Ad Revenue.
- **The Flywheel**: more players → more valuable B2B spots → larger prize pools → more players.

---

## 🛸 SYSTEM ARCHITECTURE

### 🔷 TECHNOLOGY STACK

<div align="center">

| **LAYER** | **PROTOCOL** | **FUNCTION** |
|-----------|--------------|--------------|
| 💻 **Interface** | React + Vite + TypeScript | Real-time GPS tracking, tactical visualization, neural feedback |
| ⚡ **Core Logic** | FastAPI (Python) | Game state management, collision detection, territory calculation |
| 🔐 **Identity Matrix** | Supabase Auth | Secure runner authentication and session management |
| ⛓️ **Web3 Layer** | Stacks Blockchain | Entry Fees, Power-ups, and Prize Distribution |
| 💾 **State Archive** | PostgreSQL (PostGIS) | Persistent storage of trails, territories, and runner data |
| 📡 **Communication** | WebSocket | Real-time position updates and trail synchronization |

</div>

---

## 🚀 PRODUCTION DEPLOYMENT

### 🔹 1. SMART CONTRACT (STACKS COMPONENT)

The core game logic and economy live on the Stacks blockchain.

- **Contract Address**: `ST36BMEQDCRCKYF8HPPDMN1BCSY6TR2NG0BZSQPYG`
- **Contract Name**: `loopin-game`
- **Network**: Stacks Testnet
- **Explorer**: [View Contract on Explorer](https://explorer.hiro.so/txid/ST36BMEQDCRCKYF8HPPDMN1BCSY6TR2NG0BZSQPYG.loopin-game?chain=testnet)

#### Deployment Status

✅ **DEPLOYED & ACTIVE**

### 🔹 2. BACKEND ENGINE (AZURE WEB APP)

The `WebServer` (Node.js) handles real-time gameplay via WebSockets, player authentication, and PostGIS trail logic.

- **Live URL**: `https://loopin-server.azurewebsites.net`
- **WebSocket Endpoint**: `wss://loopin-server.azurewebsites.net/ws/game`
- **Status**: ✅ **ONLINE**

#### Deployment Instructions

The backend is deployed to **Azure Web Apps**.

1. **Configuration**:
   Ensure these Environment Variables are set in the Azure Portal:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_KEY`: Your Supabase Service Role Key (for secure DB access)
   - `PRIVATE_KEY`: Oracle Wallet Private Key (for processing payouts)

2. **Deploy Command**:

   ```bash
   cd WebServer
   # Install dependencies
   npm install
   # Build (if using TypeScript/build step) or Start directly
   npm start
   ```

### 🔹 3. FRONTEND INTERFACE (LOOPIN-WEB)

The client-side React application where players interact with the map and wallet.

- **Recommended Host**: Vercel or Netlify
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Environment Configuration

Set these variables in your Vercel/Netlify dashboard:

```env
# Connects to the Azure Backend
VITE_API_BASE=https://loopin-server.azurewebsites.net/api
VITE_WS_URL=wss://loopin-server.azurewebsites.net

# Connects to the Smart Contract
VITE_CONTRACT_ADDRESS=ST36BMEQDCRCKYF8HPPDMN1BCSY6TR2NG0BZSQPYG
VITE_CONTRACT_NAME=loopin-game
VITE_NETWORK=testnet
```

#### Deployment Steps

1. Connect your GitHub repository to Vercel/Netlify.
2. Select the `loopin-web` directory as the Root Directory.
3. Keep the default build command (`npm run build`).
4. Add the Environment Variables listed above.
5. Deploy!

---

## 🎮 OPERATOR'S MANUAL

### 🔻 GRID ENTRY PROTOCOL

1. **🔗 WALLET SYNCHRONIZATION**
   - Connect your Hiro Wallet to establish your Grid Runner identity.
   - Your wallet address becomes your immutable operator ID.

2. **💳 ENTRY FEE**
   - Pay an entry fee in STX to join an active game session.
   - The entry fee contributes to the prize pool for the winner.

3. **📡 GPS ACTIVATION**
   - Enable location services for trail emission.
   - Your movement data is encrypted and transmitted in real-time.

### 🔻 TERRITORIAL OPERATIONS

1. **🏃 TRAIL GENERATION**
   - Begin movement to emit your quantum trail.
   - The trail persists for the duration of the game session.

2. **➰ LOOP FORMATION**
   - Return to any previous point on your trail.
   - The system automatically detects loop closure and calculates the captured area, adding it to your score.

### 🔻 TACTICAL WARFARE

1. **⚔️ TRAIL SEVERING**
   - Cross an opponent's trail to cut it.
   - Severed trails collapse, preventing loop formation.

2. **🛡️ DEFENSIVE UPGRADES (POWER-UPS)**
   - **Shield (2 STX)**: One-time protection against trail severing.
   - **Stealth (5 STX)**: Temporary trail invisibility (60 seconds).
   - Upgrades are purchased with STX and are consumable.

### 🔻 REWARD ACQUISITION

1. **🏆 END OF GAME**
   - The game session ends after a predetermined time.
   - The player with the largest total captured area is declared the winner.
   - The prize pool (funded by entry fees) is automatically transferred to the winner's wallet.

---

<div align="center">

## 🌌 EVOLUTION TIMELINE

### **⚡ PHASE ALPHA: FOUNDATION** ✅

*Core gameplay loop. Stacks integration for payments. GPS trail mechanics.*

### **🔥 PHASE BETA: WARFARE** 🔄

- [ ] **Real-time PvP Combat**: Live trail warfare with collision detection.
- [ ] **Squad Formation**: Team-based territorial conquest.
- [ ] **Global Leaderboards**: Rankings by area captured and games won.
- [ ] **Dynamic Sync Nodes**: Rotating node locations for strategic gameplay.

### **🌐 PHASE GAMMA: EXPANSION** 🔮

- [ ] **Bitcoin Lightning Integration**: Instant micropayments for upgrades.
- [ ] **Advanced Game Modes**: New rulesets, larger maps, and bigger tournaments.
- [ ] **Mobile Native Apps**: iOS and Android grid interfaces.

### **🏆 PHASE OMEGA: ASCENSION** 🌟

- [ ] **Mainnet Deployment**: Full security audit and Stacks mainnet launch.
- [ ] **Global Grid Network**: Synchronized worldwide gameplay.
- [ ] **Player Governance**: DAO voting for grid rule modifications.
- [ ] **Cross-chain Bridges**: Expand beyond the Stacks ecosystem for payments.

---

## ⚖️ LICENSE

MIT License - The grid belongs to everyone and no one.

---

## **⚡ THE GRID AWAITS ⚡**

*Your movement has value.*  
*Your territory is power.*  
*Your time is now.*

**[CONNECT TO GRID](https://www.loopin.fit)** | **[VIEW PROTOCOL](https://github.com/your-username/loopin)** | **[DEPLOY NODE](https://docs.loopin.fit)**

---

<sub>Built on Stacks. Secured by Bitcoin. Powered by human movement. The future of territorial warfare is location-based.</sub>
</div>
