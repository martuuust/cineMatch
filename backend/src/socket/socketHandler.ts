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
    UserJoinedPayload,
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

    // Server -> Client
    USER_LIST_UPDATED: 'user-list-updated',
    VOTING_STARTED: 'voting-started',
    USER_PROGRESS: 'user-progress',
    MATCHING_COMPLETE: 'matching-complete',
    ERROR: 'error'
} as const;

export function setupSocketHandlers(io: Server): void {
    io.on('connection', (socket: Socket) => {
        console.log(`[Socket] Client connected: ${socket.id}, Handshake Origin: ${socket.handshake.headers.origin}`);

        // ============= USER JOINED =============
        socket.on(EVENTS.USER_JOINED, (payload: UserJoinedPayload) => {
            try {
                console.log(`[Socket] user-joined event received from ${socket.id}:`, payload);

                const { roomCode, userId } = payload;

                if (!roomCode || !userId) {
                    socket.emit(EVENTS.ERROR, {
                        error: 'Room code and user ID are required',
                        code: ErrorCode.VALIDATION_ERROR
                    });
                    return;
                }

                // Get room
                const room = roomService.getRoomByCode(roomCode);
                if (!room) {
                    socket.emit(EVENTS.ERROR, {
                        error: 'Room not found',
                        code: ErrorCode.ROOM_NOT_FOUND
                    });
                    return;
                }

                // Get user
                const user = userService.getUserById(userId);
                if (!user || user.roomId !== room.id) {
                    socket.emit(EVENTS.ERROR, {
                        error: 'User not found in room',
                        code: ErrorCode.USER_NOT_FOUND
                    });
                    return;
                }

                // Update socket ID
                userService.updateSocket(userId, socket.id);

                // Join socket room
                socket.join(room.code);

                // Broadcast updated user list
                const users = roomService.getRoomUsers(room.id);
                const roomSize = io.sockets.adapter.rooms.get(room.code)?.size || 0;
                console.log(`[Socket] Broadcasting user-list-updated to room ${room.code}. Socket room size: ${roomSize}`);
                
                io.to(room.code).emit(EVENTS.USER_LIST_UPDATED, { users });

                console.log(`[Socket] User ${user.name} joined room ${room.code}`);
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

                // Start voting (validates host and minimum users)
                roomService.startVoting(roomCode, userId);

                // Broadcast to room
                io.to(roomCode).emit(EVENTS.VOTING_STARTED);

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
                io.to(roomCode).emit(EVENTS.USER_PROGRESS, {
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

                    io.to(roomCode).emit(EVENTS.MATCHING_COMPLETE, results);
                    console.log(`[Socket] Matching complete in room ${roomCode}:`, results.type);
                }

            } catch (error) {
                handleSocketError(socket, error);
            }
        });

        // ============= RECONNECT =============
        socket.on(EVENTS.RECONNECT, (payload: { userId: string; roomCode: string }) => {
            try {
                console.log(`[Socket] reconnect:`, payload);

                const { userId, roomCode } = payload;

                if (!userId || !roomCode) {
                    socket.emit(EVENTS.ERROR, {
                        error: 'User ID and room code required',
                        code: ErrorCode.VALIDATION_ERROR
                    });
                    return;
                }

                const user = userService.reconnect(userId, socket.id);
                if (!user) {
                    socket.emit(EVENTS.ERROR, {
                        error: 'User not found',
                        code: ErrorCode.USER_NOT_FOUND
                    });
                    return;
                }

                const room = roomService.getRoomByCode(roomCode);
                if (!room || user.roomId !== room.id) {
                    socket.emit(EVENTS.ERROR, {
                        error: 'Room not found or user not in room',
                        code: ErrorCode.ROOM_NOT_FOUND
                    });
                    return;
                }

                // Rejoin socket room
                socket.join(room.code);

                // Send current state
                const users = roomService.getRoomUsers(room.id);
                socket.emit(EVENTS.USER_LIST_UPDATED, { users });

                // If voting finished, send results
                if (room.status === RoomStatus.FINISHED) {
                    const results = voteService.calculateResults(room.id);
                    socket.emit(EVENTS.MATCHING_COMPLETE, results);
                } else if (room.status === RoomStatus.VOTING) {
                    socket.emit(EVENTS.VOTING_STARTED);
                }

                console.log(`[Socket] User ${user.name} reconnected to room ${room.code}`);
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
                        io.to(roomCode).emit(EVENTS.USER_LIST_UPDATED, { users });
                        console.log(`[Socket] User ${user.name} left room ${roomCode}`);

                        // If voting is in progress, check if remaining users have finished
                        if (room.status === RoomStatus.VOTING && users.length > 0) {
                            if (roomService.haveAllUsersFinished(room.id)) {
                                console.log(`[Socket] All remaining users finished voting in room ${roomCode}`);
                                const results = voteService.calculateResults(room.id);
                                roomService.finishRoom(room.id);
                                io.to(roomCode).emit(EVENTS.MATCHING_COMPLETE, results);
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
                        const users = roomService.getRoomUsers(room.id);
                        // io.to(room.code).emit(EVENTS.USER_LIST_UPDATED, { users }); 

                        // If the disconnected user was the last one holding up the vote, FINISH IT
                        if (result.shouldFinish) {
                             console.log(`[Socket] Room ${room.code} finished because remaining active users are done (and blocked user disconnected)`);
                             const results = voteService.calculateResults(room.id);
                             roomService.finishRoom(room.id);
                             io.to(room.code).emit(EVENTS.MATCHING_COMPLETE, results);
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
