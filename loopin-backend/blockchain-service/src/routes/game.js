import express from 'express';
import * as contractService from '../services/contract.js';

const router = express.Router();

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

        const result = await contractService.createGame(gameType, maxPlayers);

        res.json({
            success: true,
            data: result
        });
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

        if (gameId === undefined) {
            return res.status(400).json({
                success: false,
                error: 'gameId is required'
            });
        }

        const result = await contractService.startGame(gameId);

        res.json({
            success: true,
            data: result
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

        if (gameId === undefined) {
            return res.status(400).json({
                success: false,
                error: 'gameId is required'
            });
        }

        const result = await contractService.endGame(gameId);

        res.json({
            success: true,
            data: result
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

        if (gameId === undefined || !playerAddress || areaCaptured === undefined || rank === undefined) {
            return res.status(400).json({
                success: false,
                error: 'gameId, playerAddress, areaCaptured, and rank are required'
            });
        }

        const result = await contractService.submitPlayerResult(
            gameId,
            playerAddress,
            areaCaptured,
            rank
        );

        res.json({
            success: true,
            data: result
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
 * GET /api/game/:gameId
 * Get game details
 */
router.get('/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;

        const result = await contractService.getGame(parseInt(gameId));

        res.json({
            success: true,
            data: result
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
