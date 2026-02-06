/**
 * CineMatch Backend - Socket Handler
 * Real-time event handling with Socket.io
 */

import { Server, Socket } from 'socket.io';
import { roomService } from '../services/roomService';
import { voteService } from '../services/voteService';
import { userService } from '../services/userService';
// Data store accessed through services
import {
    VoteType,
    StartVotingPayload,
    VotePayload,
    RoomStatus
} from '../types';
import { AppError, ErrorCode } from '../utils/errors';

// Socket event names
const EVENTS = {
    // Client -> Server
    USER_JOINED: 'user-joined',
    START_VOTING: 'start-voting',
    VOTE: 'vote',
    RECONNECT: 'reconnect-user',
    LEAVE_ROOM: 'leave-room',
    FORCE_FINISH: 'force-finish-voting',

    // Server -> Client
    USER_LIST_UPDATED: 'user-list-updated',
    VOTING_STARTED: 'voting-started',
    USER_PROGRESS: 'user-progress',
    MATCHING_COMPLETE: 'matching-complete',
    ERROR: 'error'
} as const;

export function setupSocketHandlers(io: Server): void {
    io.on('connection', (socket: Socket) => {
        // ============= USER JOINED =============
        socket.on(EVENTS.USER_JOINED, (payload: { roomCode: string; userId: string }) => {
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

                // IMPORTANT: Join the uppercase room ID to ensure consistency
                const normalizedRoomCode = roomCode.toUpperCase();
                socket.join(normalizedRoomCode);

                // Update socket association
                userService.updateSocket(userId, socket.id);

                // Notify room
                const users = roomService.getRoomUsersByCode(normalizedRoomCode);
                io.to(normalizedRoomCode).emit(EVENTS.USER_LIST_UPDATED, { users });

                // If reconnecting during voting, send current state
                const room = roomService.getRoomByCode(normalizedRoomCode);
                if (room && room.status === RoomStatus.VOTING) {
                    socket.emit(EVENTS.VOTING_STARTED);
                    // Also send current progress of all users
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
        });

        // ============= RECONNECT =============
        socket.on(EVENTS.RECONNECT, (payload: { roomCode: string; userId: string }) => {
            try {
                console.log(`[Socket] reconnect:`, payload);
                const { roomCode, userId } = payload;

                if (!roomCode || !userId) return;

                const normalizedRoomCode = roomCode.toUpperCase();
                socket.join(normalizedRoomCode);

                userService.updateSocket(userId, socket.id);

                // Send current room state
                const room = roomService.getRoomByCode(normalizedRoomCode);
                if (room) {
                    const users = roomService.getRoomUsers(room.id);
                    socket.emit(EVENTS.USER_LIST_UPDATED, { users });

                    if (room.status === RoomStatus.VOTING) {
                        socket.emit(EVENTS.VOTING_STARTED);
                        // Sync progress
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
        });

        // ============= FORCE FINISH =============
        socket.on(EVENTS.FORCE_FINISH, (payload: { roomCode: string; userId: string }) => {
            try {
                console.log(`[Socket] force-finish-voting:`, payload);
                const { roomCode, userId } = payload;

                if (!roomCode || !userId) return;

                const room = roomService.getRoomByCode(roomCode);
                if (!room) {
                    socket.emit(EVENTS.ERROR, { error: 'Room not found', code: ErrorCode.ROOM_NOT_FOUND });
                    return;
                }

                // Verify host
                const user = userService.getUserById(userId);
                if (!user || !user.isHost) {
                    socket.emit(EVENTS.ERROR, { error: 'Only host can force finish', code: ErrorCode.USER_NOT_HOST });
                    return;
                }

                if (room.status === RoomStatus.VOTING) {
                    console.log(`[Socket] Host ${user.name} forced finish in room ${roomCode}`);
                    const results = voteService.calculateResults(room.id);
                    roomService.finishRoom(room.id);
                    io.to(roomCode.toUpperCase()).emit(EVENTS.MATCHING_COMPLETE, results);
                }

            } catch (error) {
                handleSocketError(socket, error);
            }
        });

        // ============= START VOTING =============
        socket.on(EVENTS.START_VOTING, (payload: StartVotingPayload) => {
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

                const room = roomService.getRoomByCode(roomCode);
                if (!room) {
                    socket.emit(EVENTS.ERROR, { error: 'Room not found', code: ErrorCode.ROOM_NOT_FOUND });
                    return;
                }

                // Verify host
                const user = userService.getUserById(userId);
                if (!user || !user.isHost) {
                    socket.emit(EVENTS.ERROR, { error: 'Only host can start voting', code: ErrorCode.USER_NOT_HOST });
                    return;
                }

                // Start voting (validates host and minimum users)
                roomService.startVoting(roomCode, userId);

                // Broadcast to room
                io.to(roomCode.toUpperCase()).emit(EVENTS.VOTING_STARTED);

                console.log(`[Socket] Voting started in room ${roomCode}`);
            } catch (error) {
                handleSocketError(socket, error);
            }
        });

        // ============= VOTE =============
        socket.on(EVENTS.VOTE, (payload: VotePayload) => {
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

                // Validate vote type
                if (voteType !== VoteType.YES && voteType !== VoteType.NO) {
                    socket.emit(EVENTS.ERROR, {
                        error: 'Vote type must be "yes" or "no"',
                        code: ErrorCode.VALIDATION_ERROR
                    });
                    return;
                }

                // Submit vote
                const { progress, hasFinished } = voteService.submitVote(
                    roomCode,
                    userId,
                    movieId,
                    voteType
                );

                // Emit user progress to room
                io.to(roomCode.toUpperCase()).emit(EVENTS.USER_PROGRESS, {
                    userId,
                    progress,
                    hasFinished
                });

                // Check if all users have finished
                const room = roomService.getRoomByCode(roomCode);
                if (room && roomService.haveAllUsersFinished(room.id)) {
                    // Calculate and emit results
                    const results = voteService.calculateResults(room.id);
                    roomService.finishRoom(room.id);

                    io.to(roomCode.toUpperCase()).emit(EVENTS.MATCHING_COMPLETE, results);
                    console.log(`[Socket] Matching complete in room ${roomCode}:`, results.type);
                }

            } catch (error) {
                handleSocketError(socket, error);
            }
        });

        // ============= LEAVE ROOM =============
        socket.on(EVENTS.LEAVE_ROOM, (payload: { roomCode: string; userId: string }, callback?: () => void) => {
            try {
                console.log(`[Socket] leave-room:`, payload);
                const { roomCode, userId } = payload;

                if (!roomCode || !userId) {
                    if (callback) callback();
                    return;
                }

                const user = userService.getUserById(userId);
                if (user) {
                    userService.removeUser(userId);

                    const room = roomService.getRoomByCode(roomCode);
                    if (room) {
                        const users = roomService.getRoomUsers(room.id);
                        io.to(roomCode.toUpperCase()).emit(EVENTS.USER_LIST_UPDATED, { users });
                        console.log(`[Socket] User ${user.name} left room ${roomCode}`);

                        // If voting is in progress, check if remaining users have finished
                        if (room.status === RoomStatus.VOTING && users.length > 0) {
                            if (roomService.haveAllUsersFinished(room.id)) {
                                console.log(`[Socket] All remaining users finished voting in room ${roomCode}`);
                                const results = voteService.calculateResults(room.id);
                                roomService.finishRoom(room.id);
                                io.to(roomCode.toUpperCase()).emit(EVENTS.MATCHING_COMPLETE, results);
                            }
                        }
                    }
                }

                // Acknowledge receipt
                if (callback) callback();
            } catch (error) {
                handleSocketError(socket, error);
                if (callback) callback();
            }
        });

        // ============= DISCONNECT =============
        socket.on('disconnect', () => {
            try {
                const result = userService.handleDisconnect(socket.id);

                if (result) {
                    const room = roomService.getRoomById(result.roomId);
                    if (room) {
                        // Notify others that user is disconnected (optional, currently we just update list silently)
                        // In a more advanced UI, we could show a "connection lost" icon next to the user
                        // const users = roomService.getRoomUsers(room.id);
                        // io.to(room.code).emit(EVENTS.USER_LIST_UPDATED, { users });

                        // If the disconnected user was the last one holding up the vote, FINISH IT
                        if (result.shouldFinish) {
                            console.log(`[Socket] Room ${room.code} finished because remaining active users are done (and blocked user disconnected)`);
                            const results = voteService.calculateResults(room.id);
                            roomService.finishRoom(room.id);
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
        });
    });
}

/**
 * Handle socket errors consistently
 */
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
