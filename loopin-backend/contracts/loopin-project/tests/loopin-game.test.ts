import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

describe('Loopin Game Contract', () => {

    describe('Read-Only Functions', () => {
        it('should get game details', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(10)], deployer);
            const res = simnet.callReadOnlyFn('loopin-game', 'get-game', [Cl.uint(0)], deployer);
            expect(res.result).toBeSome(Cl.tuple({
                'game-type': Cl.stringAscii('CASUAL'),
                'status': Cl.stringAscii('lobby'),
                'max-players': Cl.uint(10),
                'entry-fee': Cl.uint(0),
                'prize-pool': Cl.uint(0),
                'start-block': Cl.uint(0),
                'end-block': Cl.uint(0),
                'creator': Cl.standardPrincipal(deployer)
            }));
        });

        it('should return none for non-existent game', () => {
            const res = simnet.callReadOnlyFn('loopin-game', 'get-game', [Cl.uint(99)], deployer);
            expect(res.result).toBeNone();
        });

        it('should get participant details', () => {
            const createRes = simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(10)], deployer);
            const gameId = expect(createRes.result).toBeOk(Cl.uint(0)) ? Cl.uint(0) : createRes.result as never;

            simnet.callPublicFn('loopin-game', 'join-game', [gameId], wallet1);
            const res = simnet.callReadOnlyFn('loopin-game', 'get-participant', [gameId, Cl.standardPrincipal(wallet1)], deployer);
            // We just check it's Some, don't strict match tuple to avoid block-height mismatches
            expect(res.result).toBeSome(expect.anything());
        });

        it('should get next game id', () => {
            const res = simnet.callReadOnlyFn('loopin-game', 'get-next-game-id', [], deployer);
            expect(res.result).toBeUint(0);
        });

        it('should get game oracle', () => {
            const res = simnet.callReadOnlyFn('loopin-game', 'get-game-oracle', [], deployer);
            expect(res.result).toBePrincipal(deployer);
        });
    });

    describe('Game Creation', () => {
        it('should create CASUAL game with 0 fee', () => {
            const { result } = simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(5)], deployer);
            expect(result).toBeOk(Cl.uint(0));
            const game = simnet.callReadOnlyFn('loopin-game', 'get-game', [Cl.uint(0)], deployer);
            expect(game.result).toBeSome(expect.anything());
        });

        it('should create BLITZ game with 1 STX fee', () => {
            const { result } = simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('BLITZ'), Cl.uint(5)], deployer);
            expect(result).toBeOk(Cl.uint(0));
        });

        it('should create ELITE game with 10 STX fee', () => {
            const { result } = simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('ELITE'), Cl.uint(5)], deployer);
            expect(result).toBeOk(Cl.uint(0));
        });
    });

    describe('Game Joining', () => {
        it('should join game successfully', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            const { result } = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
            expect(result).toBeOk(Cl.bool(true));
        });

        it('fail: join non-existent game', () => {
            const { result } = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(99)], wallet1);
            expect(result).toBeErr(Cl.uint(101));
        });

        it('fail: game not active (already started)', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            const { result } = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
            expect(result).toBeErr(Cl.uint(105));
        });

        it('fail: game full', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(1)], deployer);
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
            const { result } = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet2);
            expect(result).toBeErr(Cl.uint(103));
        });

        it('fail: already joined', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
            const { result } = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
            expect(result).toBeErr(Cl.uint(106));
        });
    });

    describe('Game Lifecycle (Start / End)', () => {
        it('start-game successfully', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            const { result } = simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            expect(result).toBeOk(Cl.bool(true));
        });

        it('fail start: unauthorized', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            const { result } = simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], wallet1);
            expect(result).toBeErr(Cl.uint(102));
        });

        it('fail start: not in lobby', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            const { result } = simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            expect(result).toBeErr(Cl.uint(105));
        });

        it('end-game successfully', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            const { result } = simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], deployer);
            expect(result).toBeOk(Cl.bool(true));
        });

        it('fail end: unauthorized', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            const { result } = simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], wallet1);
            expect(result).toBeErr(Cl.uint(102));
        });

        it('fail end: not active', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            const { result } = simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], deployer);
            expect(result).toBeErr(Cl.uint(105)); // game is in lobby
        });
    });

    describe('Game Results & Distribution', () => {
        it('submit-player-result successfully', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
            simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], deployer);

            const { result } = simnet.callPublicFn('loopin-game', 'submit-player-result', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(100), Cl.uint(1)], deployer);
            expect(result).toBeOk(Cl.bool(true));

            const stats = simnet.callReadOnlyFn('loopin-game', 'get-player-stats', [Cl.standardPrincipal(wallet1)], deployer);
            expect(stats.result).toBeTuple(expect.anything());
        });

        it('distribute-prize successfully and decrements prize pool', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('BLITZ'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1); // pays 1M uSTX
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet2); // pays 1M uSTX (pool: 2M)
            simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], deployer);

            simnet.callPublicFn('loopin-game', 'submit-player-result', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(100), Cl.uint(1)], deployer);

            // Wait, we distribute 1M to wallet1
            const { result } = simnet.callPublicFn('loopin-game', 'distribute-prize', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(1000000)], deployer);
            expect(result).toBeOk(Cl.uint(950000)); // 5% fee is 50k

            // Check pool decreased by exactly 1,000,000
            let gameAfter = simnet.callReadOnlyFn('loopin-game', 'get-game', [Cl.uint(0)], deployer);

            // Convert to JSON and check the value string
            const cvJSON = require('@stacks/transactions').cvToJSON(gameAfter.result);
            expect(cvJSON.value.value['prize-pool'].value).toEqual("1000000");
        });

        it('handles multiple winners distribution successfully', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('ELITE'), Cl.uint(10)], deployer); // 10 STX entry fee
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet2);
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet3); // Pool is 30M uSTX
            simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], deployer);

            simnet.callPublicFn('loopin-game', 'submit-player-result', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(300), Cl.uint(1)], deployer);
            simnet.callPublicFn('loopin-game', 'submit-player-result', [Cl.uint(0), Cl.standardPrincipal(wallet2), Cl.uint(200), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'submit-player-result', [Cl.uint(0), Cl.standardPrincipal(wallet3), Cl.uint(100), Cl.uint(3)], deployer);

            // Distribute 1st place: 15M uSTX
            let res1 = simnet.callPublicFn('loopin-game', 'distribute-prize', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(15000000)], deployer);
            expect(res1.result).toBeOk(Cl.uint(14250000));

            // Distribute 2nd place: 10M uSTX
            let res2 = simnet.callPublicFn('loopin-game', 'distribute-prize', [Cl.uint(0), Cl.standardPrincipal(wallet2), Cl.uint(10000000)], deployer);
            expect(res2.result).toBeOk(Cl.uint(9500000));

            // Distribute 3rd place: 5M uSTX
            let res3 = simnet.callPublicFn('loopin-game', 'distribute-prize', [Cl.uint(0), Cl.standardPrincipal(wallet3), Cl.uint(5000000)], deployer);
            expect(res3.result).toBeOk(Cl.uint(4750000));

            // Pool should now be 0
            let gameAfter = simnet.callReadOnlyFn('loopin-game', 'get-game', [Cl.uint(0)], deployer);

            const cvJSON = require('@stacks/transactions').cvToJSON(gameAfter.result);
            expect(cvJSON.value.value['prize-pool'].value).toEqual("0");
        });

        it('fail submit: unauthorized (not oracle or owner)', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
            simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], deployer);

            const { result } = simnet.callPublicFn('loopin-game', 'submit-player-result', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(100), Cl.uint(1)], wallet2);
            expect(result).toBeErr(Cl.uint(100)); // err-owner-only
        });

        it('fail submit: game not ended', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);
            simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            // didn't end game

            const { result } = simnet.callPublicFn('loopin-game', 'submit-player-result', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(100), Cl.uint(1)], deployer);
            expect(result).toBeErr(Cl.uint(107)); // err-game-not-ended
        });

        it('fail distribute: insufficient funds', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1); // Casual is 0 fee, prize pool is 0
            simnet.callPublicFn('loopin-game', 'start-game', [Cl.uint(0)], deployer);
            simnet.callPublicFn('loopin-game', 'end-game', [Cl.uint(0)], deployer);

            const { result } = simnet.callPublicFn('loopin-game', 'distribute-prize', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(100)], deployer);
            expect(result).toBeErr(Cl.uint(104)); // err-insufficient-funds
        });

        it('fail distribute: game not ended', () => {
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('CASUAL'), Cl.uint(2)], deployer);
            simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1);

            const { result } = simnet.callPublicFn('loopin-game', 'distribute-prize', [Cl.uint(0), Cl.standardPrincipal(wallet1), Cl.uint(0)], deployer);
            expect(result).toBeErr(Cl.uint(107)); // err-game-not-ended
        });
    });

    describe('Admin Functions', () => {
        it('set-platform-fee successfully', () => {
            const { result } = simnet.callPublicFn('loopin-game', 'set-platform-fee', [Cl.uint(15)], deployer);
            expect(result).toBeOk(Cl.bool(true));
        });

        it('set-game-oracle successfully', () => {
            const { result } = simnet.callPublicFn('loopin-game', 'set-game-oracle', [Cl.standardPrincipal(wallet3)], deployer);
            expect(result).toBeOk(Cl.bool(true));
        });

        it('fail set-game-oracle: unauthorized', () => {
            const { result } = simnet.callPublicFn('loopin-game', 'set-game-oracle', [Cl.standardPrincipal(wallet3)], wallet1);
            expect(result).toBeErr(Cl.uint(100)); // err-owner-only
        });

        it('fail set-platform-fee: over 20%', () => {
            const { result } = simnet.callPublicFn('loopin-game', 'set-platform-fee', [Cl.uint(21)], deployer);
            expect(result).toBeErr(Cl.uint(109));
        });

        it('fail set-platform-fee: unauthorized', () => {
            const { result } = simnet.callPublicFn('loopin-game', 'set-platform-fee', [Cl.uint(10)], wallet1);
            expect(result).toBeErr(Cl.uint(100)); // err-owner-only
        });

        it('emergency-withdraw successfully', () => {
            // First send money to contract so it does not fail with err-insufficient-balance (u3)
            simnet.callPublicFn('loopin-game', 'create-game', [Cl.stringAscii('BLITZ'), Cl.uint(10)], deployer);
            const joinRes = simnet.callPublicFn('loopin-game', 'join-game', [Cl.uint(0)], wallet1); // sends 1 STX to contract
            expect(joinRes.result).toBeOk(Cl.bool(true));

            const { result } = simnet.callPublicFn('loopin-game', 'emergency-withdraw', [Cl.uint(1000000), Cl.standardPrincipal(wallet1)], deployer);
            expect(result).toBeOk(Cl.bool(true));
        });

        it('fail emergency-withdraw: unauthorized', () => {
            const { result } = simnet.callPublicFn('loopin-game', 'emergency-withdraw', [Cl.uint(0), Cl.standardPrincipal(wallet1)], wallet1);
            expect(result).toBeErr(Cl.uint(100));
        });
    });
});
