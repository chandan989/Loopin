import express from 'express';
import * as contractService from '../services/contract.js';
import * as gameService from '../services/gameService.js';

const router = express.Router();

/**
 * GET /api/game/lobby
 * List active games in lobby
 */
router.get('/lobby', async (req, res) => {
    try {
        const { rows } = await gameService.getLobbyGames();
        res.json({ success: true, data: rows });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/game/create
 * Create a new game
 */
router.post('/create', async (req, res) => {
    try {
        const { gameType, maxPlayers } = req.body;

        // Validate input
        if (!gameType || !maxPlayers) {
            return res.status(400).json({
                success: false,
                error: 'gameType and maxPlayers are required'
            });
        }

        // Validate game type
        const validTypes = ['CASUAL', 'BLITZ', 'ELITE'];
        if (!validTypes.includes(gameType)) {
            return res.status(400).json({
                success: false,
                error: 'gameType must be CASUAL, BLITZ, or ELITE'
            });
        }

        // Create Game Session with UUID (DB Generated or manually passed if needed)
        // We no longer rely on chain ID integer.
        // We will just create the session and return the UUID.

        try {
            // We don't pass an ID, let DB generate UUID
            const newGameId = await gameService.createGameSession(
                null, // id is auto-generated or we could pass one if we wanted
                gameType,
                maxPlayers,
                0, // entryFee
                0  // prizePool
            );

            console.log(`Created DB session ${newGameId}`);

            res.json({
                success: true,
                data: {
                    gameId: newGameId,
                    txId: 'mock_tx_uuid_mode' // Frontend might expect this or we can remove usage
                }
            });
        } catch (e) {
            console.error("Failed to create game session", e);
            throw e;
        }
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/game/start
 * Start a game
 */
router.post('/start', async (req, res) => {
    try {
        const { gameId } = req.body;

        if (!gameId) {
            return res.status(400).json({
                success: false,
                error: 'gameId is required'
            });
        }

        // We skip contract call 'startGame' if it expects int ID, 
        // OR we adapt it if we still want blockchain sync. 
        // For now, assuming pure UUID DB mode based on request:

        // Update DB
        await gameService.updateGameStatus(gameId, 'active');

        res.json({
            success: true,
            data: { success: true, gameId }
        });
    } catch (error) {
        console.error('Error starting game:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/game/end
 * End a game
 */
router.post('/end', async (req, res) => {
    try {
        const { gameId } = req.body;

        if (!gameId) {
            return res.status(400).json({
                success: false,
                error: 'gameId is required'
            });
        }

        // Update DB
        await gameService.updateGameStatus(gameId, 'ended');

        res.json({
            success: true,
            data: { success: true, gameId }
        });
    } catch (error) {
        console.error('Error ending game:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/game/submit-results
 * Submit player results
 */
router.post('/submit-results', async (req, res) => {
    try {
        const { gameId, playerAddress, areaCaptured, rank } = req.body;

        if (!gameId || !playerAddress || areaCaptured === undefined || rank === undefined) {
            return res.status(400).json({
                success: false,
                error: 'gameId, playerAddress, areaCaptured, and rank are required'
            });
        }

        // Sync DB Only
        try {
            // We need player UUID and Game UUID
            const player = await gameService.ensurePlayer(playerAddress);
            const session = await gameService.getGameSession(gameId);

            if (player && session) {
                // prize calc is complex, simpler to pass 0 or estimate if we don't know from contract
                const prize = rank === 1 ? session.prize_pool : 0;

                await gameService.recordGameResult(
                    session.id,
                    player.id,
                    rank,
                    areaCaptured,
                    prize
                );
            }
        } catch (e) {
            console.error("DB Sync failed for submit-result", e);
            throw e;
        }

        res.json({
            success: true,
            data: { success: true }
        });
    } catch (error) {
        console.error('Error submitting results:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/game/distribute-prize
 * Distribute prize to player
 */
router.post('/distribute-prize', async (req, res) => {
    try {
        const { gameId, playerAddress, prizeAmount } = req.body;

        if (gameId === undefined || !playerAddress || prizeAmount === undefined) {
            return res.status(400).json({
                success: false,
                error: 'gameId, playerAddress, and prizeAmount are required'
            });
        }

        const result = await contractService.distributePrize(
            gameId,
            playerAddress,
            prizeAmount
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error distributing prize:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/game/:gameId/confirm-join
 * Register player in local DB for game mechanics
 */
router.post('/:gameId/confirm-join', async (req, res) => {
    try {
        const { gameId } = req.params; // This is likely the Postgres UUID or the Chain ID? 
        // The URL param :gameId usually implies the resource ID.
        // If the frontend sends the chain ID, we need to resolve it to UUID.
        // Let's assume the frontend sends the UUID if it knows it, or we handle Chain ID lookup.

        const { walletAddress } = req.body; // We need walletAddress to resolve/create player

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'walletAddress is required'
            });
        }

        // 1. Ensure Player Exists
        const player = await gameService.ensurePlayer(walletAddress);

        // 2. Join Game
        // gameId param: is it UUID or Integer (ChainID)?
        // If query param "type=chain" is set, resolve. For now assume UUID for API consistency
        // OR, if we only have Chain ID, we might need a lookup function.
        // For simplicity, let's assume the client passes the UUID of the game_session.
        await gameService.joinGame(player.id, gameId);

        res.json({
            success: true,
            message: 'Player joined game session',
            player: player
        });
    } catch (error) {
        console.error('Error joining game:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/game/:gameId
 * Get game details (Combined Chain + Local)
 */
router.get('/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;

        // Skip Contract Data (which relied on Int ID)
        // Fetch from Local DB (Game State)

        let session = null;
        try {
            session = await gameService.getGameSession(gameId);
        } catch (e) {
            console.warn("Session not found", e);
        }

        // Fetch scoped game state
        const localState = await gameService.getGameState(gameId);

        res.json({
            success: true,
            data: {
                ...session, // combine session details
                localState
            }
        });
    } catch (error) {
        console.error('Error getting game:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/game/:gameId/participant/:address
 * Get participant details
 */
router.get('/:gameId/participant/:address', async (req, res) => {
    try {
        const { gameId, address } = req.params;

        const result = await contractService.getParticipant(
            parseInt(gameId),
            address
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting participant:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/game/:gameId/player-count
 * Get player count
 */
router.get('/:gameId/player-count', async (req, res) => {
    try {
        const { gameId } = req.params;

        const result = await contractService.getPlayerCount(parseInt(gameId));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting player count:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/game/next-id
 * Get next game ID
 */
router.get('/next-id', async (req, res) => {
    try {
        const result = await contractService.getNextGameId();

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting next game ID:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
