/**
 * CineMatch Backend - Room Routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
    roomController,
    createRoomValidation,
    joinRoomValidation
} from '../controllers/roomController';

const router = Router();

// POST /api/rooms/create - Create new room
router.post('/create', createRoomValidation, (req: Request, res: Response, next: NextFunction) =>
    roomController.create(req, res, next)
);

// POST /api/rooms/join - Join existing room
router.post('/join', joinRoomValidation, (req: Request, res: Response, next: NextFunction) =>
    roomController.join(req, res, next)
);

// GET /api/rooms/:code - Get room info
router.get('/:code', (req: Request, res: Response, next: NextFunction) =>
    roomController.getRoom(req, res, next)
);

// GET /api/rooms/:code/users - Get users in room
router.get('/:code/users', (req: Request, res: Response, next: NextFunction) =>
    roomController.getUsers(req, res, next)
);

export default router;
