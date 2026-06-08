/**
 * CineMatch Backend - Route Index
 * Aggregates all API routes
 */

import { Router } from 'express';
import { dataStore } from '../data/store';
import roomRoutes from './roomRoutes';
import movieRoutes from './movieRoutes';

const router = Router();

// Mount routes
router.use('/rooms', roomRoutes);
router.use('/movies', movieRoutes);

// Health check
router.get('/health', async (_req, res) => {
    const stats = await dataStore.getRoomStats();
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        stats: {
            rooms: stats.rooms,
            users: stats.users,
            votes: stats.votes
        }
    });
});

export default router;
