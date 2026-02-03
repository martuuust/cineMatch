/**
 * CineMatch Backend - Route Index
 * Aggregates all API routes
 */

import { Router } from 'express';
import roomRoutes from './roomRoutes';
import movieRoutes from './movieRoutes';

const router = Router();

// Mount routes
router.use('/rooms', roomRoutes);
router.use('/movies', movieRoutes);

// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

export default router;
