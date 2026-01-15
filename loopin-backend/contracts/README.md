# Loopin Smart Contract Integration Guide

## Contract Overview

The `loopin-game.clar` smart contract handles:
- ✅ Game session creation and management
- ✅ Player joins with entry fees
- ✅ Prize pool accumulation
- ✅ Results submission and prize distribution
- ✅ Player statistics tracking

## Contract Functions

### Public Functions (User-Callable)

#### 1. `create-game`
```clarity
(create-game (game-type (string-ascii 20)) (max-players uint))
```
Creates a new game session.
- **game-type**: "CASUAL" (free), "BLITZ" (1 STX), or "ELITE" (10 STX)
- **max-players**: Maximum number of players (e.g., 10)
- **Returns**: Game ID

#### 2. `join-game`
```clarity
(join-game (game-id uint))
```
Player joins a game and pays entry fee if required.
- Transfers STX to contract if entry fee > 0
- Adds player to game participants
- Updates prize pool

#### 3. `start-game`
```clarity
(start-game (game-id uint))
```
Starts a game (only creator or contract owner).
- Changes status from "lobby" to "active"
- Records start block height

### Admin Functions (Backend-Callable)

#### 4. `end-game`
```clarity
(end-game (game-id uint))
```
Ends an active game.
- Changes status to "ended"
- Records end block height

#### 5. `submit-player-result`
```clarity
(submit-player-result (game-id uint) (player principal) (area-captured uint) (rank uint))
```
Submits final results for a player after game ends.
- **area-captured**: Area in square meters × 1000 (for precision)
- **rank**: Player's final ranking (1 = winner)
- Updates player stats (total area, games played, games won)

#### 6. `distribute-prize`
```clarity
(distribute-prize (game-id uint) (player principal) (prize-amount uint))
```
Distributes prize to a player.
- Deducts 5% platform fee
- Transfers STX to player
- Updates player total earnings

### Read-Only Functions

```clarity
(get-game (game-id uint))
(get-participant (game-id uint) (player principal))
(get-player-stats (player principal))
(get-player-count (game-id uint))
(get-next-game-id)
```

## Integration with Backend

### 1. Game Creation Flow

**Frontend** → **Backend** → **Smart Contract**

```python
# Backend: app/api/v1/games.py

async def create_game_on_chain(game_type: str, max_players: int):
    # Call smart contract
    contract_call = await stacks_client.call_contract(
        contract_address="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        contract_name="loopin-game",
        function_name="create-game",
        function_args=[
            ClarityValue.string_ascii(game_type),
            ClarityValue.uint(max_players)
        ]
    )
    
    on_chain_id = contract_call.result
    
    # Store in database
    game = GameSession(
        on_chain_id=on_chain_id,
        game_type=game_type,
        max_players=max_players,
        status="lobby"
    )
    db.add(game)
    await db.commit()
    
    return game
```

### 2. Player Join Flow

**Frontend** → **Smart Contract** (direct) → **Backend** (confirmation)

```typescript
// Frontend: User clicks "Join Game"
import { openContractCall } from '@stacks/connect';

await openContractCall({
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'loopin-game',
  functionName: 'join-game',
  functionArgs: [uintCV(gameId)],
  onFinish: (data) => {
    // After transaction confirms, call backend
    fetch(`/api/v1/games/${gameId}/confirm_join`, {
      method: 'POST',
      body: JSON.stringify({
        wallet_address: userAddress,
        tx_id: data.txId
      })
    });
  }
});
```

### 3. Game End and Prize Distribution Flow

**Backend** → **Smart Contract**

```python
# After game ends and results are calculated

async def finalize_game(game_id: UUID, results: List[PlayerResult]):
    # 1. End game on-chain
    await stacks_client.call_contract(
        function_name="end-game",
        function_args=[ClarityValue.uint(on_chain_id)]
    )
    
    # 2. Submit each player's results
    for result in results:
        await stacks_client.call_contract(
            function_name="submit-player-result",
            function_args=[
                ClarityValue.uint(on_chain_id),
                ClarityValue.principal(result.wallet_address),
                ClarityValue.uint(int(result.area_captured * 1000)),  # Scale for precision
                ClarityValue.uint(result.rank)
            ]
        )
    
    # 3. Distribute prizes
    prize_distribution = calculate_prizes(results, prize_pool)
    for player, prize in prize_distribution.items():
        await stacks_client.call_contract(
            function_name="distribute-prize",
            function_args=[
                ClarityValue.uint(on_chain_id),
                ClarityValue.principal(player),
                ClarityValue.uint(prize)
            ]
        )
```

## Prize Distribution Logic

The contract uses a 5% platform fee. Example:

```
Prize Pool: 10 STX
Winner Prize: 10 STX
Platform Fee: 0.5 STX (5%)
Player Receives: 9.5 STX
```

You can implement different distribution strategies in your backend:

### Winner Takes All
```python
def calculate_prizes(results, prize_pool):
    winner = results[0]  # Rank 1
    return {winner.wallet_address: prize_pool}
```

### Top 3 Split (60/30/10)
```python
def calculate_prizes(results, prize_pool):
    return {
        results[0].wallet_address: int(prize_pool * 0.60),  # 1st place
        results[1].wallet_address: int(prize_pool * 0.30),  # 2nd place
        results[2].wallet_address: int(prize_pool * 0.10),  # 3rd place
    }
```

## Database Sync

Keep your PostgreSQL database in sync with on-chain data:

```python
# After on-chain transaction confirms
async def sync_game_state(game_id: UUID, tx_id: str):
    # Wait for transaction confirmation
    tx = await stacks_client.get_transaction(tx_id)
    
    if tx.status == "success":
        # Update database
        game = await db.get(GameSession, game_id)
        game.status = "active"  # or "ended"
        await db.commit()
```

## Testing

### Local Testing with Clarinet

1. Install Clarinet:
```bash
brew install clarinet
```

2. Initialize project:
```bash
cd loopin-backend/contracts
clarinet new loopin
```

3. Add contract to `Clarinet.toml`:
```toml
[contracts.loopin-game]
path = "contracts/loopin-game.clar"
```

4. Run tests:
```bash
clarinet test
```

### Example Test
```clarity
;; tests/loopin-game_test.clar

(define-public (test-create-and-join-game)
    (let
        (
            (game-id (unwrap-panic (contract-call? .loopin-game create-game "BLITZ" u10)))
        )
        ;; Join game
        (try! (stx-transfer? u1000000 tx-sender .loopin-game))
        (try! (contract-call? .loopin-game join-game game-id))
        
        ;; Verify
        (asserts! (is-some (contract-call? .loopin-game get-participant game-id tx-sender)) (err u1))
        (ok true)
    )
)
```

## Deployment

### Testnet Deployment
```bash
clarinet deployments generate --testnet
clarinet deployments apply -p testnet
```

### Mainnet Deployment
```bash
clarinet deployments generate --mainnet
clarinet deployments apply -p mainnet
```

## Security Considerations

1. ✅ **Only contract owner can**:
   - Submit player results
   - Distribute prizes
   - Update platform fee

2. ✅ **Entry fees are held in contract** until prizes are distributed

3. ✅ **Emergency withdraw** function for contract owner (use carefully!)

4. ⚠️ **Important**: Verify all transactions on backend before updating database

## Next Steps

1. **Install Stacks.js** in your backend:
```bash
cd loopin-backend
pip install stacks-blockchain
```

2. **Create Stacks client wrapper**:
```python
# app/core/stacks_client.py
from stacks_blockchain import StacksClient

client = StacksClient(
    network="testnet",  # or "mainnet"
    contract_address="YOUR_CONTRACT_ADDRESS"
)
```

3. **Update game creation endpoint** to call smart contract

4. **Add transaction confirmation webhooks** to sync database

---

**Questions?** Check the [Clarity Language Reference](https://docs.stacks.co/clarity/language-functions) or ask!
