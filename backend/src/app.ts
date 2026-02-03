/**
 * CineMatch Backend - Express Application Setup
 */

import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Application {
    const app = express();

    // CORS configuration
    app.use(cors({
        origin: config.corsOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));

    // Body parsing
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true }));

    // Request logging (development)
    if (config.nodeEnv === 'development') {
        app.use((req, _res, next) => {
            console.log(`[HTTP] ${req.method} ${req.path}`);
            next();
        });
    }

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
