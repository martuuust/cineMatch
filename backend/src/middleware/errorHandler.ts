/**
 * CineMatch Backend - Error Handler Middleware
 * Centralized error handling
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../utils/errors';

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error('[ERROR]', {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Handle AppError
    if (err instanceof AppError) {
        res.status(err.statusCode).json(err.toJSON());
        return;
    }

    // Handle validation errors from express-validator
    if (err.name === 'ValidationError') {
        res.status(400).json({
            error: 'Validation failed',
            code: ErrorCode.VALIDATION_ERROR
        });
        return;
    }

    // Handle unexpected errors
    res.status(500).json({
        error: 'Internal server error',
        code: ErrorCode.INTERNAL_ERROR
    });
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    res.status(404).json({
        error: 'Endpoint not found',
        code: 'NOT_FOUND'
    });
}
