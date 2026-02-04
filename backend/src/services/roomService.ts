/**
 * CineMatch Backend - Room Service
 * Business logic for room management
 */

import { dataStore } from '../data/store';
import { voteService } from './voteService';
import { Room, User, RoomStatus, UserPublicInfo } from '../types';
import { AppError, ErrorCode } from '../utils/errors';

export class RoomService {
    /**
     * Create a new room with a host user
     */
    async createRoom(hostName: string, genreIds?: number[]): Promise<{ room: Room; user: User }> {
        // Validate input
        if (!hostName || hostName.trim().length === 0) {
            throw new AppError('User name is required', ErrorCode.VALIDATION_ERROR);
        }

        if (hostName.trim().length > 30) {
            throw new AppError('User name must be 30 characters or less', ErrorCode.VALIDATION_ERROR);
        }

        // Get movies from vote service (ensures consistency with frontend)
        let movies: import('../types').Movie[];

        if (genreIds && genreIds.length > 0) {
            movies = await voteService.getMoviesByGenres(genreIds);
        } else {
            movies = await voteService.getAllMoviesAsync();
        }

        const movieIds = movies.map(m => m.id);

        // Create host user first (without roomId, will update after room creation)
        const tempUser = dataStore.createUser(hostName.trim(), '', true);

        // Create room with host
        const room = dataStore.createRoom(tempUser.id, movieIds);

        // Update user with room ID and add to room
        const user = dataStore.getUserById(tempUser.id)!;
        user.roomId = room.id;
        dataStore['usersByRoom'].get(room.id)?.add(user.id);

        return { room, user };
    }

    /**
     * Join an existing room
     */
    joinRoom(roomCode: string, userName: string): { room: Room; user: User } {
        // Validate input
        if (!roomCode || roomCode.trim().length === 0) {
            throw new AppError('Room code is required', ErrorCode.VALIDATION_ERROR);
        }

        if (!userName || userName.trim().length === 0) {
            throw new AppError('User name is required', ErrorCode.VALIDATION_ERROR);
        }

        if (userName.trim().length > 30) {
            throw new AppError('User name must be 30 characters or less', ErrorCode.VALIDATION_ERROR);
        }

        // Find room
        const room = dataStore.getRoomByCode(roomCode.toUpperCase().trim());
        if (!room) {
            throw new AppError('Room not found', ErrorCode.ROOM_NOT_FOUND, 404);
        }

        // Check room status
        if (room.status !== RoomStatus.WAITING) {
            throw new AppError('Room voting has already started', ErrorCode.ROOM_ALREADY_STARTED);
        }

        // Check room capacity (optional limit)
        const existingUsers = dataStore.getUsersByRoom(room.id);
        if (existingUsers.length >= 10) {
            throw new AppError('Room is full (max 10 users)', ErrorCode.ROOM_FULL);
        }

        // Create user
        const user = dataStore.createUser(userName.trim(), room.id, false);

        return { room, user };
    }

    /**
     * Get room by code
     */
    getRoomByCode(code: string): Room | undefined {
        return dataStore.getRoomByCode(code);
    }

    /**
     * Get room by ID
     */
    getRoomById(id: string): Room | undefined {
        return dataStore.getRoomById(id);
    }

    /**
     * Get all users in a room (public info only)
     */
    getRoomUsers(roomId: string): UserPublicInfo[] {
        const users = dataStore.getUsersByRoom(roomId);
        return users.map(u => this.toPublicUserInfo(u));
    }

    /**
     * Get all users in a room by code
     */
    getRoomUsersByCode(roomCode: string): UserPublicInfo[] {
        const room = dataStore.getRoomByCode(roomCode);
        if (!room) return [];
        return this.getRoomUsers(room.id);
    }

    /**
     * Start voting in a room
     */
    startVoting(roomCode: string, userId: string): void {
        const room = dataStore.getRoomByCode(roomCode);
        if (!room) {
            throw new AppError('Room not found', ErrorCode.ROOM_NOT_FOUND, 404);
        }

        // Verify user is host
        if (room.hostId !== userId) {
            throw new AppError('Only the host can start voting', ErrorCode.USER_NOT_HOST, 403);
        }

        // Check room status
        if (room.status !== RoomStatus.WAITING) {
            throw new AppError('Voting has already started or finished', ErrorCode.ROOM_ALREADY_STARTED);
        }

        // Check minimum users
        const users = dataStore.getUsersByRoom(room.id);
        if (users.length < 2) {
            throw new AppError('At least 2 users are required to start voting', ErrorCode.ROOM_NOT_READY);
        }

        // Update room status
        dataStore.updateRoomStatus(room.id, RoomStatus.VOTING);
    }

    /**
     * Get movie by ID (delegates to voteService)
     */
    getMovieById(movieId: number): import('../types').Movie | undefined {
        return voteService.getMovieById(movieId);
    }

    /**
     * Convert User to public info (excludes sensitive data)
     */
    toPublicUserInfo(user: User): UserPublicInfo {
        return {
            id: user.id,
            name: user.name,
            isHost: user.isHost,
            progress: user.progress,
            hasFinished: user.hasFinished
        };
    }

    /**
     * Check if all users have finished voting
     */
    haveAllUsersFinished(roomId: string): boolean {
        const users = dataStore.getUsersByRoom(roomId);
        return users.length > 0 && users.every(u => u.hasFinished);
    }

    /**
     * Mark room as finished
     */
    finishRoom(roomId: string): void {
        dataStore.updateRoomStatus(roomId, RoomStatus.FINISHED);
    }
}

export const roomService = new RoomService();
