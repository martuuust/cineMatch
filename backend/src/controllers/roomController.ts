/**
 * CineMatch Backend - Room Controller
 * HTTP handlers for room-related endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import { roomService } from '../services/roomService';
import { AppError, ErrorCode } from '../utils/errors';

export class RoomController {
    /**
     * POST /api/rooms/create
     * Create a new room
     */
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError(
                    'Validation failed',
                    ErrorCode.VALIDATION_ERROR,
                    400,
                    errors.array()
                );
            }

            const { userName, genreId } = req.body;

            // Create room
            const { room, user } = await roomService.createRoom(userName, genreId);

            // Get movies for the room
            const movies = room.movieIds
                .map(id => roomService.getMovieById(id))
                .filter(m => m !== undefined);

            res.status(201).json({
                roomCode: room.code,
                userId: user.id,
                movieIds: room.movieIds,
                movies
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/rooms/join
     * Join an existing room
     */
    async join(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError(
                    'Validation failed',
                    ErrorCode.VALIDATION_ERROR,
                    400,
                    errors.array()
                );
            }

            const { roomCode, userName } = req.body;

            // Join room
            const { room, user } = roomService.joinRoom(roomCode, userName);
            const users = roomService.getRoomUsers(room.id);
            
            // Get movies for the room
            const movies = room.movieIds
                .map(id => roomService.getMovieById(id))
                .filter(m => m !== undefined);

            res.status(200).json({
                roomId: room.id,
                userId: user.id,
                roomCode: room.code,
                movieIds: room.movieIds,
                users,
                movies
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/rooms/:code/users
     * Get users in a room
     */
    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { code } = req.params;

            const users = roomService.getRoomUsersByCode(code);

            res.status(200).json({ users });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/rooms/:code
     * Get room info
     */
    async getRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { code } = req.params;

            const room = roomService.getRoomByCode(code);
            if (!room) {
                throw new AppError('Room not found', ErrorCode.ROOM_NOT_FOUND, 404);
            }

            const users = roomService.getRoomUsers(room.id);

            // Get movies for the room
            const movies = room.movieIds
                .map(id => roomService.getMovieById(id))
                .filter(m => m !== undefined);

            res.status(200).json({
                code: room.code,
                status: room.status,
                users,
                movieCount: room.movieIds.length,
                movieIds: room.movieIds,
                movies
            });
        } catch (error) {
            next(error);
        }
    }
}

// Validation rules
export const createRoomValidation = [
    body('userName')
        .trim()
        .notEmpty().withMessage('User name is required')
        .isLength({ max: 30 }).withMessage('User name must be 30 characters or less'),
    body('genreId')
        .optional()
        .isInt().withMessage('Genre ID must be an integer')
];

export const joinRoomValidation = [
    body('roomCode')
        .trim()
        .notEmpty().withMessage('Room code is required')
        .matches(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/i).withMessage('Invalid room code format'),
    body('userName')
        .trim()
        .notEmpty().withMessage('User name is required')
        .isLength({ max: 30 }).withMessage('User name must be 30 characters or less')
];

export const roomController = new RoomController();
