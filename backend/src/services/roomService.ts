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
            throw new AppError('El nombre de usuario es obligatorio', ErrorCode.VALIDATION_ERROR);
        }

        if (hostName.trim().length > 50) {
            throw new AppError('El nombre debe tener 50 caracteres o menos', ErrorCode.VALIDATION_ERROR);
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
            throw new AppError('El código de sala es obligatorio', ErrorCode.VALIDATION_ERROR);
        }

        if (!userName || userName.trim().length === 0) {
            throw new AppError('El nombre de usuario es obligatorio', ErrorCode.VALIDATION_ERROR);
        }

        if (userName.trim().length > 50) {
            throw new AppError('El nombre debe tener 50 caracteres o menos', ErrorCode.VALIDATION_ERROR);
        }

        // Find room
        const room = dataStore.getRoomByCode(roomCode.toUpperCase().trim());
        if (!room) {
            throw new AppError('Sala no encontrada', ErrorCode.ROOM_NOT_FOUND, 404);
        }

        // Check room status
        if (room.status !== RoomStatus.WAITING) {
            throw new AppError('La votación ya ha comenzado', ErrorCode.ROOM_ALREADY_STARTED);
        }

        // Check room capacity (optional limit)
        const existingUsers = dataStore.getUsersByRoom(room.id);
        if (existingUsers.length >= 10) {
            throw new AppError('La sala está llena (máx 10 usuarios)', ErrorCode.ROOM_FULL);
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
            throw new AppError('Sala no encontrada', ErrorCode.ROOM_NOT_FOUND, 404);
        }

        // Verify user is host
        if (room.hostId !== userId) {
            throw new AppError('Solo el anfitrión puede iniciar la votación', ErrorCode.USER_NOT_HOST, 403);
        }

        // Check room status
        if (room.status !== RoomStatus.WAITING) {
            throw new AppError('La votación ya ha comenzado o terminado', ErrorCode.ROOM_ALREADY_STARTED);
        }

        // Check minimum users
        const users = dataStore.getUsersByRoom(room.id);
        if (users.length < 2) {
            throw new AppError('Se necesitan al menos 2 usuarios para empezar', ErrorCode.ROOM_NOT_READY);
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
     * Consider users finished if:
     * 1. They explicitly finished voting (hasFinished = true)
     * 2. OR they are disconnected (socketId = null) - to prevent blocking
     */
    haveAllUsersFinished(roomId: string): boolean {
        const users = dataStore.getUsersByRoom(roomId);
        
        // If no users, return false
        if (users.length === 0) return false;

        // Check if every user has either finished OR is disconnected
        const allFinishedOrDisconnected = users.every(u => u.hasFinished || !u.socketId);
        
        // Also ensure at least one active user has finished to avoid premature closing 
        // if everyone disconnects before starting
        const atLeastOneFinished = users.some(u => u.hasFinished);

        return allFinishedOrDisconnected && atLeastOneFinished;
    }

    /**
     * Mark room as finished
     */
    finishRoom(roomId: string): void {
        dataStore.updateRoomStatus(roomId, RoomStatus.FINISHED);
    }
}

export const roomService = new RoomService();
