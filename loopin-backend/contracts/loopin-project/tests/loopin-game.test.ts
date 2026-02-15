
import { describe, it, expect, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

describe('Loopin Game Contract', () => {
    it('should create a game successfully', () => {
        const { result } = simnet.callPublicFn(
            'loopin-game',
            'create-game',
            [
                Cl.stringAscii('CASUAL'),
                Cl.uint(10)
            ],
            deployer
        );

        expect(result).toBeOk(Cl.uint(0)); // First game ID is 0
    });

    it('should join a game successfully', () => {
        // 1. Create Game
        simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(10)], deployer);

        // 2. Join Game
        const { result } = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
        expect(result).toBeOk(Cl.bool(true));

        // 3. Verify Player Count
        const count = simnet.callReadOnlyFn('loopin-game', 'get-player-count', [Cl.uint(0)], deployer);
        expect(count.result).toBeUint(1);
    });

    it('should prevent joining the same game twice', () => {
        simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(10)], deployer);
        simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);

        const { result } = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
        expect(result).toBeErr(Cl.uint(106)); // err-already-joined
    });

    it('should prevent joining a full game', () => {
        // Create game with max 1 player
        simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(1)], deployer);

        // Player 1 joins
        simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);

        // Player 2 tries to join
        const { result } = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet2);
        expect(result).toBeErr(Cl.uint(103)); // err-game-full
    });

    it('should handle game lifecycle: Start -> End -> Submit -> Distribute', () => {
        // 1. Create BLITZ (Entry Fee: 1 STX)
        simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('BLITZ'), Cl.uint(10)], deployer);

        // 2. Join (Wallet 1 pays 1 STX)
        const joinResult = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
        expect(joinResult.result).toBeOk(Cl.bool(true));

        // 3. Start Game (Only creator)
        const startResult = simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
        expect(startResult.result).toBeOk(Cl.bool(true));

        // 4. Try to join active game (Should fail)
        const lateJoin = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet2);
        expect(lateJoin.result).toBeErr(Cl.uint(105)); // err-game-not-active

        // 5. End Game
        simnet.mineEmptyBlock(10); // Advance chain
        const endResult = simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], deployer);
        expect(endResult.result).toBeOk(Cl.bool(true));

        // 6. Submit Results (Oracle/Owner only)
        const submitResult = simnet.callPublicFn(
            'loopin-game',
            'submit-player-result',
            [
                Cl.uint(0),
                Cl.standardPrincipal(wallet1),
                Cl.uint(5000), // area
                Cl.uint(1)     // rank
            ],
            deployer
        );
        expect(submitResult.result).toBeOk(Cl.bool(true));

        // 7. Verify Player Stats Updated
        const stats = simnet.callReadOnlyFn('loopin-game', 'get-player-stats', [Cl.standardPrincipal(wallet1)], deployer);
        expect(stats.result).toBeTuple({
            'games-played': Cl.uint(1),
            'games-won': Cl.uint(1),
            'total-area': Cl.uint(5000),
            'total-earnings': Cl.uint(0), // Not distributed yet
            'level': Cl.uint(1)
        });

        // 8. Distribute Prize
        // Prize pool should be 1 STX (1000000 uSTX)
        const distributeResult = simnet.callPublicFn(
            'loopin-game',
            'distribute-prize',
            [
                Cl.uint(0),
                Cl.standardPrincipal(wallet1),
                Cl.uint(1000000) // 1 STX
            ],
            deployer
        );
        // Should return amount distributed minus 5% fee (50,000 uSTX) -> 950,000 uSTX
        expect(distributeResult.result).toBeOk(Cl.uint(950000));

        // 9. Verify Earnings Updated
        const finalStats = simnet.callReadOnlyFn('loopin-game', 'get-player-stats', [Cl.standardPrincipal(wallet1)], deployer);
        expect(finalStats.result).toBeTuple({
            'games-played': Cl.uint(1),
            'games-won': Cl.uint(1),
            'total-area': Cl.uint(5000),
            'total-earnings': Cl.uint(950000),
            'level': Cl.uint(1)
        });
    });

    it('should enforce access controls', () => {
        simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(10)], deployer);

        // Wallet1 tries to start game (should fail)
        const startFail = simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], wallet1);
        expect(startFail.result).toBeErr(Cl.uint(102)); // err-unauthorized

        // Wallet1 tries to set platform fee (should fail)
        const feeFail = simnet.callPublicFn('loopin-game', 'set-platform-fee', [Cl.uint(10)], wallet1);
        expect(feeFail.result).toBeErr(Cl.uint(100)); // err-owner-only
    });

    it('should update platform fee correctly', () => {
        // Owner sets fee to 10%
        const setFee = simnet.callPublicFn('loopin-game', 'set-platform-fee', [Cl.uint(10)], deployer);
        expect(setFee.result).toBeOk(Cl.bool(true));

        // Simulate prize distribution with new fee
        simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('BLITZ'), Cl.uint(10)], deployer);
        simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1); // Pays 1M uSTX
        simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
        simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], deployer);
        simnet.callPublicFn('loopin-game', 'submit-player-result', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(100), Cl.uint(1)], deployer);

        const distribute = simnet.callPublicFn('loopin-game', 'distribute-prize', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(1000000)], deployer);
        // 1M - 10% = 900k
        expect(distribute.result).toBeOk(Cl.uint(900000));
    });

    it('should allow oracle to submit results', () => {
        // Set Oracle to Wallet 2
        simnet.callPublicFn('loopin-game', 'set-game-oracle', [Cl.standardPrincipal(wallet2)], deployer);

        simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(10)], deployer);
        simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
        simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
        simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], deployer);

        // Wallet 2 (Oracle) submits result
        const submit = simnet.callPublicFn('loopin-game', 'submit-player-result',
            [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(1000), Cl.uint(1)],
            wallet2 // Caller is oracle
        );
        expect(submit.result).toBeOk(Cl.bool(true));
    });
});
