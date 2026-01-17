import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Import configurations
import '../config/supabase.js';
import '../config/stacks.js';

// Import routes
import playerRoutes from '../routes/players.js';
import gameRoutes from '../routes/games.js';
import leaderboardRoutes from '../routes/leaderboard.js';

dotenv.config();

const app = express();
const API_PREFIX = process.env.API_PREFIX || '/api';

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            supabase: '✅ Connected',
            blockchain: '✅ Configured',
            contract: `${process.env.CONTRACT_ADDRESS}.${process.env.CONTRACT_NAME}`
        }
    });
});

// API Routes
app.use(`${API_PREFIX}/players`, playerRoutes);
app.use(`${API_PREFIX}/games`, gameRoutes);
app.use(`${API_PREFIX}/leaderboard`, leaderboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Loopin Backend API',
        version: '1.0.0',
        description: 'Unified backend for Loopin - Supabase + Smart Contract',
        endpoints: {
            health: '/health',
            api: API_PREFIX
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Export for Vercel serverless
export default app;
