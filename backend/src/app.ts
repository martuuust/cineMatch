/**
 * CineMatch Backend - Express Application Setup
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
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

    // 1. Security Headers via Helmet
    app.use(helmet());

    // CORS configuration - UPDATED FOR PRODUCTION STABILITY
    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like server-to-server or curl)
            if (!origin) {
                return callback(null, true);
            }
            
            if (origin === config.corsOrigin) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        credentials: true,
        optionsSuccessStatus: 200
    }));

    // 2. Request Rate Limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per window
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde', code: 'TOO_MANY_REQUESTS' }
    });
    app.use(limiter);

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
