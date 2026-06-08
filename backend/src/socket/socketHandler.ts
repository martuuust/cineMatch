/**
 * CineMatch Backend - Socket Handler
 * Real-time event handling with Socket.io
 */

import { Server, Socket } from 'socket.io';
import { roomService } from '../services/roomService';
import { voteService } from '../services/voteService';
import { userService } from '../services/userService';
import {
    VoteType,
    StartVotingPayload,
    VotePayload,
    RoomStatus
} from '../types';
import { AppError, ErrorCode } from '../utils/errors';

const EVENTS = {
    USER_JOINED: 'user-joined',
    START_VOTING: 'start-voting',
    VOTE: 'vote',
    RECONNECT: 'reconnect-user',
    LEAVE_ROOM: 'leave-room',
    FORCE_FINISH: 'force-finish-voting',
    USER_LIST_UPDATED: 'user-list-updated',
    VOTING_STARTED: 'voting-started',
    USER_PROGRESS: 'user-progress',
    MATCHING_COMPLETE: 'matching-complete',
    ERROR: 'error'
} as const;

export function setupSocketHandlers(io: Server): void {
    io.on('connection', (socket: Socket) => {
        socket.on(EVENTS.USER_JOINED, (payload: { roomCode: string; userId: string }) => {
            void handleUserJoined(io, socket, payload);
        });

        socket.on(EVENTS.RECONNECT, (payload: { roomCode: string; userId: string }) => {
            void handleReconnect(io, socket, payload);
        });

        socket.on(EVENTS.FORCE_FINISH, (payload: { roomCode: string; userId: string }) => {
            void handleForceFinish(io, socket, payload);
        });

        socket.on(EVENTS.START_VOTING, (payload: StartVotingPayload) => {
            void handleStartVoting(io, socket, payload);
        });

        socket.on(EVENTS.VOTE, (payload: VotePayload) => {
            void handleVote(io, socket, payload);
        });

        socket.on(EVENTS.LEAVE_ROOM, (payload: { roomCode: string; userId: string }, callback?: () => void) => {
            void handleLeaveRoom(io, socket, payload, callback);
        });

        socket.on('disconnect', () => {
            void handleDisconnect(io, socket);
        });
    });
}

async function handleUserJoined(
    io: Server,
    socket: Socket,
    payload: { roomCode: string; userId: string }
): Promise<void> {
    try {
        console.log(`[Socket] user-joined:`, payload);
        const { roomCode, userId } = payload;

        if (!roomCode || !userId) {
            socket.emit(EVENTS.ERROR, {
                error: 'Room code and user ID are required',
                code: ErrorCode.VALIDATION_ERROR
            });
            return;
        }

        const normalizedRoomCode = roomCode.toUpperCase();
        socket.join(normalizedRoomCode);

        await userService.updateSocket(userId, socket.id);

        const users = await roomService.getRoomUsersByCode(normalizedRoomCode);
        io.to(normalizedRoomCode).emit(EVENTS.USER_LIST_UPDATED, { users });

        const room = await roomService.getRoomByCode(normalizedRoomCode);
        if (room && room.status === RoomStatus.VOTING) {
            socket.emit(EVENTS.VOTING_STARTED);
            users.forEach(u => {
                socket.emit(EVENTS.USER_PROGRESS, {
                    userId: u.id,
                    progress: u.progress,
                    hasFinished: u.hasFinished
                });
            });
        }
    } catch (error) {
        handleSocketError(socket, error);
    }
}

async function handleReconnect(
    _io: Server,
    socket: Socket,
    payload: { roomCode: string; userId: string }
): Promise<void> {
    try {
        console.log(`[Socket] reconnect:`, payload);
        const { roomCode, userId } = payload;

        if (!roomCode || !userId) return;

        const normalizedRoomCode = roomCode.toUpperCase();
        socket.join(normalizedRoomCode);

        await userService.updateSocket(userId, socket.id);

        const room = await roomService.getRoomByCode(normalizedRoomCode);
        if (room) {
            const users = await roomService.getRoomUsers(room.id);
            socket.emit(EVENTS.USER_LIST_UPDATED, { users });

            if (room.status === RoomStatus.VOTING) {
                socket.emit(EVENTS.VOTING_STARTED);
                users.forEach(u => {
                    socket.emit(EVENTS.USER_PROGRESS, {
                        userId: u.id,
                        progress: u.progress,
                        hasFinished: u.hasFinished
                    });
                });
            }
        }
    } catch (error) {
        handleSocketError(socket, error);
    }
}

async function handleForceFinish(
    io: Server,
    socket: Socket,
    payload: { roomCode: string; userId: string }
): Promise<void> {
    try {
        console.log(`[Socket] force-finish-voting:`, payload);
        const { roomCode, userId } = payload;

        if (!roomCode || !userId) return;

        const room = await roomService.getRoomByCode(roomCode);
        if (!room) {
            socket.emit(EVENTS.ERROR, { error: 'Room not found', code: ErrorCode.ROOM_NOT_FOUND });
            return;
        }

        const user = await userService.getUserById(userId);
        if (!user || !user.isHost) {
            socket.emit(EVENTS.ERROR, { error: 'Only host can force finish', code: ErrorCode.USER_NOT_HOST });
            return;
        }

        if (room.status === RoomStatus.VOTING) {
            console.log(`[Socket] Host ${user.name} forced finish in room ${roomCode}`);
            const results = await voteService.calculateResults(room.id);
            await roomService.finishRoom(room.id);
            io.to(roomCode.toUpperCase()).emit(EVENTS.MATCHING_COMPLETE, results);
        }
    } catch (error) {
        handleSocketError(socket, error);
    }
}

async function handleStartVoting(
    io: Server,
    socket: Socket,
    payload: StartVotingPayload
): Promise<void> {
    try {
        console.log(`[Socket] start-voting:`, payload);
        const { roomCode, userId } = payload;

        if (!roomCode || !userId) {
            socket.emit(EVENTS.ERROR, {
                error: 'Room code and user ID are required',
                code: ErrorCode.VALIDATION_ERROR
            });
            return;
        }

        const room = await roomService.getRoomByCode(roomCode);
        if (!room) {
            socket.emit(EVENTS.ERROR, { error: 'Room not found', code: ErrorCode.ROOM_NOT_FOUND });
            return;
        }

        const user = await userService.getUserById(userId);
        if (!user || !user.isHost) {
            socket.emit(EVENTS.ERROR, { error: 'Only host can start voting', code: ErrorCode.USER_NOT_HOST });
            return;
        }

        await roomService.startVoting(roomCode, userId);

        io.to(roomCode.toUpperCase()).emit(EVENTS.VOTING_STARTED);
        console.log(`[Socket] Voting started in room ${roomCode}`);
    } catch (error) {
        handleSocketError(socket, error);
    }
}

async function handleVote(
    io: Server,
    socket: Socket,
    payload: VotePayload
): Promise<void> {
    try {
        console.log(`[Socket] vote:`, payload);

        const { roomCode, userId, movieId, voteType } = payload;

        if (!roomCode || !userId || movieId === undefined || !voteType) {
            socket.emit(EVENTS.ERROR, {
                error: 'Invalid vote payload',
                code: ErrorCode.VALIDATION_ERROR
            });
            return;
        }

        if (voteType !== VoteType.YES && voteType !== VoteType.NO) {
            socket.emit(EVENTS.ERROR, {
                error: 'Vote type must be "yes" or "no"',
                code: ErrorCode.VALIDATION_ERROR
            });
            return;
        }

        const { progress, hasFinished } = await voteService.submitVote(
            roomCode,
            userId,
            movieId,
            voteType
        );

        io.to(roomCode.toUpperCase()).emit(EVENTS.USER_PROGRESS, {
            userId,
            progress,
            hasFinished
        });

        const room = await roomService.getRoomByCode(roomCode);
        if (room && await roomService.haveAllUsersFinished(room.id)) {
            const results = await voteService.calculateResults(room.id);
            await roomService.finishRoom(room.id);

            io.to(roomCode.toUpperCase()).emit(EVENTS.MATCHING_COMPLETE, results);
            console.log(`[Socket] Matching complete in room ${roomCode}:`, results.type);
        }
    } catch (error) {
        handleSocketError(socket, error);
    }
}

async function handleLeaveRoom(
    io: Server,
    socket: Socket,
    payload: { roomCode: string; userId: string },
    callback?: () => void
): Promise<void> {
    try {
        console.log(`[Socket] leave-room:`, payload);
        const { roomCode, userId } = payload;

        if (!roomCode || !userId) {
            if (callback) callback();
            return;
        }

        const user = await userService.getUserById(userId);
        if (user) {
            await userService.removeUser(userId);

            const room = await roomService.getRoomByCode(roomCode);
            if (room) {
                const users = await roomService.getRoomUsers(room.id);
                io.to(roomCode.toUpperCase()).emit(EVENTS.USER_LIST_UPDATED, { users });
                console.log(`[Socket] User ${user.name} left room ${roomCode}`);

                if (room.status === RoomStatus.VOTING && users.length > 0) {
                    if (await roomService.haveAllUsersFinished(room.id)) {
                        console.log(`[Socket] All remaining users finished voting in room ${roomCode}`);
                        const results = await voteService.calculateResults(room.id);
                        await roomService.finishRoom(room.id);
                        io.to(roomCode.toUpperCase()).emit(EVENTS.MATCHING_COMPLETE, results);
                    }
                }
            }
        }

        if (callback) callback();
    } catch (error) {
        handleSocketError(socket, error);
        if (callback) callback();
    }
}

async function handleDisconnect(io: Server, socket: Socket): Promise<void> {
    try {
        const result = await userService.handleDisconnect(socket.id);

        if (result) {
            const room = await roomService.getRoomById(result.roomId);
            if (room) {
                if (result.shouldFinish) {
                    console.log(`[Socket] Room ${room.code} finished because remaining active users are done (and blocked user disconnected)`);
                    const results = await voteService.calculateResults(room.id);
                    await roomService.finishRoom(room.id);
                    io.to(room.code.toUpperCase()).emit(EVENTS.MATCHING_COMPLETE, results);
                }
            }
            console.log(`[Socket] User ${result.user.name} disconnected (marked as inactive)`);
        } else {
            console.log(`[Socket] Unknown client disconnected: ${socket.id}`);
        }
    } catch (error) {
        console.error('[Socket] Error handling disconnect:', error);
    }
}

function handleSocketError(socket: Socket, error: unknown): void {
    console.error('[Socket Error]', error);

    if (error instanceof AppError) {
        socket.emit(EVENTS.ERROR, error.toJSON());
    } else if (error instanceof Error) {
        socket.emit(EVENTS.ERROR, {
            error: error.message,
            code: ErrorCode.INTERNAL_ERROR
        });
    } else {
        socket.emit(EVENTS.ERROR, {
            error: 'An unexpected error occurred',
            code: ErrorCode.INTERNAL_ERROR
        });
    }
}
