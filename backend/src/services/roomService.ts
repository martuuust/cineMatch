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
        if (!hostName || hostName.trim().length === 0) {
            throw new AppError('El nombre de usuario es obligatorio', ErrorCode.VALIDATION_ERROR);
        }

        if (hostName.trim().length > 50) {
            throw new AppError('El nombre debe tener 50 caracteres o menos', ErrorCode.VALIDATION_ERROR);
        }

        let movies: import('../types').Movie[];

        if (genreIds && genreIds.length > 0) {
            movies = await voteService.getMoviesByGenres(genreIds);
        } else {
            movies = await voteService.getAllMoviesAsync();
        }

        const movieIds = movies.map(m => m.id);

        const tempUser = await dataStore.createUser(hostName.trim(), '', true);
        const room = await dataStore.createRoom(tempUser.id, movieIds);
        await dataStore.assignUserToRoom(tempUser.id, room.id);

        const user = (await dataStore.getUserById(tempUser.id))!;

        return { room, user };
    }

    /**
     * Join an existing room
     */
    async joinRoom(roomCode: string, userName: string): Promise<{ room: Room; user: User }> {
        if (!roomCode || roomCode.trim().length === 0) {
            throw new AppError('El código de sala es obligatorio', ErrorCode.VALIDATION_ERROR);
        }

        if (!userName || userName.trim().length === 0) {
            throw new AppError('El nombre de usuario es obligatorio', ErrorCode.VALIDATION_ERROR);
        }

        if (userName.trim().length > 50) {
            throw new AppError('El nombre debe tener 50 caracteres o menos', ErrorCode.VALIDATION_ERROR);
        }

        const room = await dataStore.getRoomByCode(roomCode.toUpperCase().trim());
        if (!room) {
            throw new AppError('Sala no encontrada', ErrorCode.ROOM_NOT_FOUND, 404);
        }

        if (room.status !== RoomStatus.WAITING) {
            throw new AppError('La votación ya ha comenzado', ErrorCode.ROOM_ALREADY_STARTED);
        }

        const existingUsers = await dataStore.getUsersByRoom(room.id);
        if (existingUsers.length >= 10) {
            throw new AppError('La sala está llena (máx 10 usuarios)', ErrorCode.ROOM_FULL);
        }

        const user = await dataStore.createUser(userName.trim(), room.id, false);

        return { room, user };
    }

    async getRoomByCode(code: string): Promise<Room | undefined> {
        return dataStore.getRoomByCode(code);
    }

    async getRoomById(id: string): Promise<Room | undefined> {
        return dataStore.getRoomById(id);
    }

    async getRoomUsers(roomId: string): Promise<UserPublicInfo[]> {
        const users = await dataStore.getUsersByRoom(roomId);
        return users.map(u => this.toPublicUserInfo(u));
    }

    async getRoomUsersByCode(roomCode: string): Promise<UserPublicInfo[]> {
        const room = await dataStore.getRoomByCode(roomCode);
        if (!room) return [];
        return this.getRoomUsers(room.id);
    }

    async startVoting(roomCode: string, userId: string): Promise<void> {
        const room = await dataStore.getRoomByCode(roomCode.toUpperCase());
        if (!room) {
            throw new AppError('Sala no encontrada', ErrorCode.ROOM_NOT_FOUND, 404);
        }

        if (room.hostId != userId) {
            throw new AppError('Solo el anfitrión puede iniciar la votación', ErrorCode.USER_NOT_HOST, 403);
        }

        if (room.status !== RoomStatus.WAITING) {
            throw new AppError('La votación ya ha comenzado o terminado', ErrorCode.ROOM_ALREADY_STARTED);
        }

        const users = await dataStore.getUsersByRoom(room.id);
        if (users.length < 1) {
            throw new AppError('Se necesitan al menos 1 usuario para empezar', ErrorCode.ROOM_NOT_READY);
        }

        await dataStore.updateRoomStatus(room.id, RoomStatus.VOTING);
    }

    getMovieById(movieId: number): import('../types').Movie | undefined {
        return voteService.getMovieById(movieId);
    }

    toPublicUserInfo(user: User): UserPublicInfo {
        return {
            id: user.id,
            name: user.name,
            isHost: user.isHost,
            progress: user.progress,
            hasFinished: user.hasFinished
        };
    }

    async haveAllUsersFinished(roomId: string): Promise<boolean> {
        const users = await dataStore.getUsersByRoom(roomId);

        if (users.length === 0) return false;

        const connectedUsers = users.filter(u => u.socketId !== null);

        if (connectedUsers.length === 0) return false;

        return connectedUsers.every(u => u.hasFinished);
    }

    async finishRoom(roomId: string): Promise<void> {
        await dataStore.updateRoomStatus(roomId, RoomStatus.FINISHED);
    }
}

export const roomService = new RoomService();
