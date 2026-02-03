/**
 * CineMatch Backend - Movie Routes
 */

import { Router } from 'express';
import { movieController } from '../controllers/movieController';

const router = Router();

// GET /api/movies/batch - Get batch of movies for voting
router.get('/batch', (req, res, next) =>
    movieController.getBatch(req, res, next)
);

// GET /api/movies/:id - Get single movie
router.get('/:id', (req, res, next) =>
    movieController.getById(req, res, next)
);

export default router;
