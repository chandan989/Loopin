
# Loopin Smart Contract Project

## Running Tests

This project uses the Clarinet SDK with Vitest for comprehensive unit and fuzz testing, as required for the grant.

### Prerequisites
- Node.js (v18+)
- Clarinet (for Clarity checking, though SDK tests run in Node)

### Install Dependencies
```bash
npm install
```

### Run Tests
Execute both unit and fuzz tests:
```bash
npm test
```

### Coverage Report
To generate a coverage report:
```bash
npm run test:report
```

### Project Structure
- `contracts/`: Contains the Clarity smart contracts (`loopin-game.clar`).
- `tests/`: Contains the test suite.
  - `loopin-game.test.ts`: Unit tests covering functions and edge cases.
  - `loopin-game.fuzz.test.ts`: Fuzz tests using `fast-check` for property verification.

## Deployment to Testnet

1. Ensure you have the Stacks wallet private key for deployment.
2. Update `settings/Testnet.toml` with your mnemonic or private key (never commit this file!).
3. Run deployment:
   ```bash
   clarinet deploy --network testnet
   ```
4. Update the frontend configuration:
   - Copy the deployed contract address.
   - Update `loopin-web/.env`:
     ```env
     VITE_CONTRACT_ADDRESS=<your-deployed-address>
     VITE_CONTRACT_NAME=loopin-game
     ```
