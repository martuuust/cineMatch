/**
 * CineMatch Backend - Movie Controller
 * HTTP handlers for movie-related endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { voteService } from '../services/voteService';

export class MovieController {
    /**
     * GET /api/movies/batch
     * Get batch of movies for voting
     */
    async getBatch(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Use async version to ensure TMDB movies are loaded
            const movies = await voteService.getAllMoviesAsync();

            res.status(200).json({
                movies,
                source: movies.length > 0 && movies[0].id > 1000 ? 'tmdb' : 'mock'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/movies/:id
     * Get single movie by ID
     */
    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            const movie = voteService.getMovieById(id);

            if (!movie) {
                res.status(404).json({ error: 'Movie not found', code: 'MOVIE_NOT_FOUND' });
                return;
            }

            res.status(200).json(movie);
        } catch (error) {
            next(error);
        }
    }
}

export const movieController = new MovieController();
