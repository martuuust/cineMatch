/**
 * CineMatch Backend - In-Memory Data Store
 * Thread-safe (single-threaded Node.js) storage for rooms, users, and votes
 * Production: Replace with Redis or PostgreSQL
 */

import { Room, User, Vote, RoomStatus, VoteType } from '../types';
import { generateRoomId, generateUserId, generateRoomCode, generateVoteId } from '../utils/helpers';

class DataStore {
    private rooms: Map<string, Room> = new Map();
    private users: Map<string, User> = new Map();
    private votes: Map<string, Vote> = new Map();

    // Indexes for fast lookups
    private roomByCode: Map<string, string> = new Map(); // code -> roomId
    private usersByRoom: Map<string, Set<string>> = new Map(); // roomId -> Set<userId>
    private votesByRoom: Map<string, Set<string>> = new Map(); // roomId -> Set<voteId>
    private votesByUser: Map<string, Set<string>> = new Map(); // odId -> Set<voteId>
    private userBySocket: Map<string, string> = new Map(); // socketId -> userId

    // ============= ROOM OPERATIONS =============

    createRoom(hostId: string, movieIds: number[]): Room {
        const roomId = generateRoomId();
        let code = generateRoomCode();

        // Ensure unique code
        while (this.roomByCode.has(code)) {
            code = generateRoomCode();
        }

        const room: Room = {
            id: roomId,
            code,
            status: RoomStatus.WAITING,
            hostId,
            movieIds,
            createdAt: new Date()
        };

        this.rooms.set(roomId, room);
        this.roomByCode.set(code, roomId);
        this.usersByRoom.set(roomId, new Set());
        this.votesByRoom.set(roomId, new Set());

        return room;
    }

    getRoomById(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    getRoomByCode(code: string): Room | undefined {
        const roomId = this.roomByCode.get(code.toUpperCase());
        return roomId ? this.rooms.get(roomId) : undefined;
    }

    updateRoomStatus(roomId: string, status: RoomStatus): boolean {
        const room = this.rooms.get(roomId);
        if (!room) return false;
        room.status = status;
        return true;
    }

    deleteRoom(roomId: string): boolean {
        const room = this.rooms.get(roomId);
        if (!room) return false;

        // Clean up users
        const userIds = this.usersByRoom.get(roomId);
        if (userIds) {
            for (const userId of userIds) {
                this.deleteUser(userId);
            }
        }

        // Clean up votes
        const voteIds = this.votesByRoom.get(roomId);
        if (voteIds) {
            for (const voteId of voteIds) {
                this.votes.delete(voteId);
            }
        }

        this.roomByCode.delete(room.code);
        this.usersByRoom.delete(roomId);
        this.votesByRoom.delete(roomId);
        this.rooms.delete(roomId);

        return true;
    }

    // ============= USER OPERATIONS =============

    createUser(name: string, roomId: string, isHost: boolean): User {
        const userId = generateUserId();

        const user: User = {
            id: userId,
            name,
            roomId,
            isHost,
            progress: 0,
            socketId: null,
            hasFinished: false
        };

        this.users.set(userId, user);
        this.usersByRoom.get(roomId)?.add(userId);
        this.votesByUser.set(userId, new Set());

        return user;
    }

    getUserById(userId: string): User | undefined {
        return this.users.get(userId);
    }

    getUserBySocketId(socketId: string): User | undefined {
        const userId = this.userBySocket.get(socketId);
        return userId ? this.users.get(userId) : undefined;
    }

    getUsersByRoom(roomId: string): User[] {
        const userIds = this.usersByRoom.get(roomId);
        if (!userIds) return [];

        return Array.from(userIds)
            .map(id => this.users.get(id))
            .filter((u): u is User => u !== undefined);
    }

    updateUserSocket(userId: string, socketId: string | null): boolean {
        const user = this.users.get(userId);
        if (!user) return false;

        // Remove old socket mapping
        if (user.socketId) {
            this.userBySocket.delete(user.socketId);
        }

        // Set new socket mapping
        user.socketId = socketId;
        if (socketId) {
            this.userBySocket.set(socketId, userId);
        }

        return true;
    }

    updateUserProgress(userId: string, progress: number, hasFinished: boolean): boolean {
        const user = this.users.get(userId);
        if (!user) return false;
        user.progress = progress;
        user.hasFinished = hasFinished;
        return true;
    }

    deleteUser(userId: string): boolean {
        const user = this.users.get(userId);
        if (!user) return false;

        // Clean up socket mapping
        if (user.socketId) {
            this.userBySocket.delete(user.socketId);
        }

        // Remove from room
        this.usersByRoom.get(user.roomId)?.delete(userId);

        // Clean up votes
        const voteIds = this.votesByUser.get(userId);
        if (voteIds) {
            for (const voteId of voteIds) {
                this.votes.delete(voteId);
            }
        }
        this.votesByUser.delete(userId);

        this.users.delete(userId);
        return true;
    }

    // ============= VOTE OPERATIONS =============

    createVote(userId: string, roomId: string, movieId: number, voteType: VoteType): Vote {
        const voteId = generateVoteId();

        const vote: Vote = {
            id: voteId,
            userId,
            roomId,
            movieId,
            vote: voteType,
            createdAt: new Date()
        };

        this.votes.set(voteId, vote);
        this.votesByRoom.get(roomId)?.add(voteId);
        this.votesByUser.get(userId)?.add(voteId);

        return vote;
    }

    hasUserVotedForMovie(userId: string, movieId: number): boolean {
        const voteIds = this.votesByUser.get(userId);
        if (!voteIds) return false;

        for (const voteId of voteIds) {
            const vote = this.votes.get(voteId);
            if (vote && vote.movieId === movieId) {
                return true;
            }
        }
        return false;
    }

    getVotesByRoom(roomId: string): Vote[] {
        const voteIds = this.votesByRoom.get(roomId);
        if (!voteIds) return [];

        return Array.from(voteIds)
            .map(id => this.votes.get(id))
            .filter((v): v is Vote => v !== undefined);
    }

    getVotesByUser(userId: string): Vote[] {
        const voteIds = this.votesByUser.get(userId);
        if (!voteIds) return [];

        return Array.from(voteIds)
            .map(id => this.votes.get(id))
            .filter((v): v is Vote => v !== undefined);
    }

    getUserVoteCount(userId: string): number {
        return this.votesByUser.get(userId)?.size || 0;
    }

    // ============= STATISTICS =============

    getRoomStats(): { rooms: number; users: number; votes: number } {
        return {
            rooms: this.rooms.size,
            users: this.users.size,
            votes: this.votes.size
        };
    }
}

// Singleton instance
export const dataStore = new DataStore();
