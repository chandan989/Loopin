# Loopin Smart Contract Project

## Testing Setup

This project uses the Clarinet JS SDK with Vitest for unit testing and **Rendezvous native clarity fuzzer** for comprehensive property fuzzing, precisely satisfying the grant requirements.

### Prerequisites

- Node.js (v18+)
- Clarinet

### Install Dependencies

```bash
npm install
```

### 1. Unit Testing & Coverage (>90%)

The automated test suite uses the standard Clarinet JS SDK (`@stacks/clarinet-sdk`). We have explicitly tested **all public and read-only functions** across positive states, failures, error bounds, and role checks, achieving >90% code coverage.

Run the unit tests:
```bash
npm run test
```

Generate a coverage report (automatically generated from Vitest/Clarinet LCOV formats):
```bash
npm run test:report
```

### 2. Native Rendezvous Fuzzer (Property Testing)

Instead of relying on fragile JS/TS fuzzing libraries like `fast-check`, we've rigorously implemented native property and invariant logic in `.tests.clar` contracts using Rendezvous. The fuzz tests verify that upper bounds, unauthorized roles, and edge conditions handle randomized, continuous state calls correctly.

To run the Rendezvous native fuzzer against the smart contract properties:
```bash
npx rv . loopin-game test
```

### Project Structure

- `contracts/loopin-game.clar`: The core game smart contract.
- `contracts/loopin-game.tests.clar`: Native Rendezvous property-based checks and invariants. 
- `tests/loopin-game.test.ts`: Complete Clarinet SDK automated unit testing suite simulating tx/rx and edge-cases accurately.

## Deployment to Testnet

1. Ensure you have your mnemonic/key configured in your `settings/Testnet.toml`.
2. Run deployment using the Clarinet CLI:
   ```bash
   clarinet deployments generate --testnet
   clarinet deployment apply --testnet
   ```
3. Update the frontend address configuration in `loopin-web/.env`.
