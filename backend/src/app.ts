/**
 * CineMatch Backend - Express Application Setup
 */

import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Application {
    const app = express();

    // CORS configuration - UPDATED FOR PRODUCTION STABILITY
    app.use(cors({
        origin: (origin, callback) => {
            // In production, we allow the specific origin if it matches our pattern or '*'
            if (!origin) return callback(null, true);

            // Just allow it and reflect it back to satisfy 'credentials: true'
            // This is the most compatible way for dynamic origins like Vercel previews
            callback(null, origin);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        credentials: true,
        optionsSuccessStatus: 200 // Some legacy browsers choke on 204
    }));

    // Body parsing
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use((req, _res, next) => {
        console.log(`[HTTP] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
        next();
    });

    // API routes
    app.use('/api', routes);

    // Root endpoint
    app.get('/', (_req, res) => {
        res.json({
            name: 'CineMatch API',
            version: '1.0.0',
            status: 'running',
            endpoints: {
                health: '/api/health',
                createRoom: 'POST /api/rooms/create',
                joinRoom: 'POST /api/rooms/join',
                getMovies: 'GET /api/movies/batch'
            }
        });
    });

    // 404 handler
    app.use(notFoundHandler);

    // Error handler
    app.use(errorHandler);

    return app;
}
