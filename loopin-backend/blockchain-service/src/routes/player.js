import express from 'express';
import * as contractService from '../services/contract.js';

const router = express.Router();

/**
 * GET /api/player/:address/stats
 * Get player statistics
 */
router.get('/:address/stats', async (req, res) => {
    try {
        const { address } = req.params;

        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Player address is required'
            });
        }

        const result = await contractService.getPlayerStats(address);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error getting player stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
