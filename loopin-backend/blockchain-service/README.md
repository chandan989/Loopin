# Loopin Blockchain Service

Node.js service for interacting with the Loopin smart contract on Stacks blockchain.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd loopin-backend/blockchain-service
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
NETWORK=testnet
CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
CONTRACT_NAME=loopin-game
PRIVATE_KEY=your-private-key-here
```

### 3. Run the Service

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The service will start on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Game Management

#### Create Game
```bash
POST /api/game/create
Content-Type: application/json

{
  "gameType": "BLITZ",
  "maxPlayers": 10
}
```

#### Start Game
```bash
POST /api/game/start
Content-Type: application/json

{
  "gameId": 0
}
```

#### End Game
```bash
POST /api/game/end
Content-Type: application/json

{
  "gameId": 0
}
```

#### Submit Player Results
```bash
POST /api/game/submit-results
Content-Type: application/json

{
  "gameId": 0,
  "playerAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "areaCaptured": 1000000,
  "rank": 1
}
```

#### Distribute Prize
```bash
POST /api/game/distribute-prize
Content-Type: application/json

{
  "gameId": 0,
  "playerAddress": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  "prizeAmount": 1000000
}
```

### Read-Only Queries

#### Get Game Details
```bash
GET /api/game/:gameId
```

#### Get Participant Details
```bash
GET /api/game/:gameId/participant/:address
```

#### Get Player Count
```bash
GET /api/game/:gameId/player-count
```

#### Get Player Stats
```bash
GET /api/player/:address/stats
```

## 🧪 Testing with cURL

### Create a CASUAL game:
```bash
curl -X POST http://localhost:3001/api/game/create \
  -H "Content-Type: application/json" \
  -d '{"gameType":"CASUAL","maxPlayers":10}'
```

### Get game details:
```bash
curl http://localhost:3001/api/game/0
```

### Get player stats:
```bash
curl http://localhost:3001/api/player/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/stats
```

## 🔗 Integration with Python Backend

### Example: Call from FastAPI

```python
import httpx

BLOCKCHAIN_SERVICE_URL = "http://localhost:3001"

async def create_game_on_chain(game_type: str, max_players: int):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BLOCKCHAIN_SERVICE_URL}/api/game/create",
            json={
                "gameType": game_type,
                "maxPlayers": max_players
            }
        )
        data = response.json()
        
        if data["success"]:
            return data["data"]["txId"]
        else:
            raise Exception(data["error"])

async def end_game_and_distribute_prizes(game_id: int, results: list):
    async with httpx.AsyncClient() as client:
        # End game
        await client.post(
            f"{BLOCKCHAIN_SERVICE_URL}/api/game/end",
            json={"gameId": game_id}
        )
        
        # Submit results for each player
        for result in results:
            await client.post(
                f"{BLOCKCHAIN_SERVICE_URL}/api/game/submit-results",
                json={
                    "gameId": game_id,
                    "playerAddress": result.wallet_address,
                    "areaCaptured": int(result.area * 1000),
                    "rank": result.rank
                }
            )
        
        # Distribute prizes
        for result in results:
            if result.prize > 0:
                await client.post(
                    f"{BLOCKCHAIN_SERVICE_URL}/api/game/distribute-prize",
                    json={
                        "gameId": game_id,
                        "playerAddress": result.wallet_address,
                        "prizeAmount": result.prize
                    }
                )
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "txId": "0x1234...",
    "gameId": 0
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🔒 Security Notes

1. **Never commit `.env` file** - It contains your private key
2. **Use environment variables** for sensitive data
3. **Rotate private keys** regularly
4. **Use different keys** for testnet and mainnet
5. **Monitor transaction costs** to avoid unexpected fees

## 🐛 Troubleshooting

### Service won't start
- Check if port 3001 is already in use
- Verify all dependencies are installed
- Check `.env` file exists and is configured

### Transactions failing
- Verify private key is correct
- Check contract address is deployed
- Ensure sufficient STX balance
- Verify network setting (testnet vs mainnet)

### Read-only calls failing
- Check contract address and name
- Verify network connectivity
- Ensure contract is deployed on the network

## 📝 Development

### Project Structure
```
blockchain-service/
├── src/
│   ├── index.js              # Main server
│   ├── config/
│   │   └── stacks.js         # Stacks configuration
│   ├── services/
│   │   └── contract.js       # Contract interactions
│   ├── routes/
│   │   ├── game.js           # Game endpoints
│   │   └── player.js         # Player endpoints
├── .env                      # Environment config
├── .env.example              # Example config
├── package.json
└── README.md
```

### Adding New Endpoints

1. Add function to `src/services/contract.js`
2. Create route in `src/routes/`
3. Mount route in `src/index.js`
4. Test with cURL or Postman

## 🚀 Deployment

### Production Checklist
- [ ] Update `.env` with mainnet settings
- [ ] Set `NETWORK=mainnet`
- [ ] Use production private key
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx)
- [ ] Enable HTTPS
- [ ] Set up process manager (PM2)

### Deploy with PM2
```bash
npm install -g pm2
pm2 start src/index.js --name loopin-blockchain
pm2 save
pm2 startup
```

## 📞 Support

For issues or questions:
- Check the logs: `pm2 logs loopin-blockchain`
- Review Stacks.js documentation
- Check transaction on Stacks Explorer

---

**Version:** 1.0.0  
**License:** MIT
