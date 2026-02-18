/**
 * CineMatch Backend - Express Application Setup
 */

import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Application {
    const app = express();

    // 0. Emergency Debug Logger (TOP of stack)
    app.use((req, _res, next) => {
        console.log(`[DEBUG] ${req.method} ${req.url}`);
        console.log(`[DEBUG] Headers: ${JSON.stringify(req.headers)}`);
        next();
    });

    // CORS configuration - UPDATED FOR PRODUCTION STABILITY
    app.use(cors({
        origin: true, // Reflect any origin
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        credentials: true,
        optionsSuccessStatus: 200
    }));

    // Body parsing
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true }));

    // API routes
    app.use('/api', routes);

    // Ultra-basic test route
    app.get('/ping', (_req, res) => {
        res.send('pong');
    });

    // Root endpoint
    app.get('/', (_req, res) => {
        res.json({
            status: 'online',
            service: 'CineMatch API',
            timestamp: new Date().toISOString()
        });
    });

    // 404 handler
    app.use(notFoundHandler);

    // Error handler
    app.use(errorHandler);

    return app;
}
