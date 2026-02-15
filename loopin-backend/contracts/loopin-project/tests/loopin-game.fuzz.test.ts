
import { describe, it, expect } from 'vitest';
import { Cl, ClarityType } from '@stacks/transactions';
import fc from 'fast-check';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;

describe('Loopin Game Contract Fuzzing', () => {

    // 1. Fuzz Create Game with variety of inputs
    it('should accept valid game creation parameters', () => {
        // We limit runs to avoid state explosion
        fc.assert(
            fc.property(
                fc.nat({ max: 100000 }).map(n => `Type${n}`),     // Valid ASCII generator
                fc.integer({ min: 1, max: 1000 }),               // Valid max players
                (gameType, maxPlayers) => {
                    const { result } = simnet.callPublicFn(
                        'loopin-game',
                        'create-game',
                        [Cl.stringAscii(gameType), Cl.uint(maxPlayers)],
                        deployer
                    );

                    // Should always succeed for valid inputs
                    // Manual type check since we don't know the exact ID
                    expect(result.type).toBe(ClarityType.ResponseOk);
                }
            ),
            { numRuns: 20 }
        );
    });

    // 2. Fuzz Join Game with invalid IDs
    it('should reject joining non-existent games', () => {
        // Try large IDs that definitely don't exist yet
        fc.assert(
            fc.property(
                fc.integer({ min: 100000, max: 200000 }),
                (gameId) => {
                    const { result } = simnet.callPublicFn(
                        'loopin-game',
                        'join-game',
                        [Cl.uint(gameId)],
                        wallet1
                    );
                    expect(result).toBeErr(Cl.uint(101)); // err-not-found
                }
            ),
            { numRuns: 20 }
        );
    });

    // 3. Fuzz Platform Fee Setting (0-20% allowed)
    it('should strictly enforce fee percentage (0-20)', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 100 }),
                (fee) => {
                    const { result } = simnet.callPublicFn(
                        'loopin-game',
                        'set-platform-fee',
                        [Cl.uint(fee)],
                        deployer
                    );

                    if (fee <= 20) {
                        expect(result).toBeOk(Cl.bool(true));
                    } else {
                        // Should fail with u109 (custom error for fee > 20)
                        // Or Cl.uint(109)
                        expect(result).toBeErr(Cl.uint(109));
                    }
                }
            ),
            { numRuns: 50 }
        );
    });
});
