/**
 * CineMatch Backend - Redis Data Store
 * Async storage for rooms, users, and votes with horizontal scaling support
 */

import { Room, User, Vote, RoomStatus, VoteType } from '../types';
import { generateRoomId, generateUserId, generateRoomCode, generateVoteId } from '../utils/helpers';
import { connectRedis, getRedisClient } from '../config/redis';

const KEYS = {
    room: (id: string) => `room:${id}`,
    roomCode: (code: string) => `roomCode:${code.toUpperCase()}`,
    user: (id: string) => `user:${id}`,
    vote: (id: string) => `vote:${id}`,
    socketUser: (socketId: string) => `socketUser:${socketId}`,
    roomUsers: (roomId: string) => `roomUsers:${roomId}`,
    roomVotes: (roomId: string) => `roomVotes:${roomId}`,
    userVotes: (userId: string) => `userVotes:${userId}`
};

function roomToHash(room: Room): Record<string, string> {
    return {
        id: room.id,
        code: room.code,
        status: room.status,
        hostId: room.hostId,
        movieIds: JSON.stringify(room.movieIds),
        createdAt: room.createdAt.toISOString(),
        lastActiveAt: room.lastActiveAt.toISOString()
    };
}

function parseRoom(data: Record<string, string>): Room {
    return {
        id: data.id,
        code: data.code,
        status: data.status as RoomStatus,
        hostId: data.hostId,
        movieIds: JSON.parse(data.movieIds),
        createdAt: new Date(data.createdAt),
        lastActiveAt: new Date(data.lastActiveAt)
    };
}

function userToHash(user: User): Record<string, string> {
    return {
        id: user.id,
        name: user.name,
        roomId: user.roomId,
        isHost: String(user.isHost),
        progress: String(user.progress),
        socketId: user.socketId ?? 'null',
        hasFinished: String(user.hasFinished)
    };
}

function parseUser(data: Record<string, string>): User {
    return {
        id: data.id,
        name: data.name,
        roomId: data.roomId,
        isHost: data.isHost === 'true',
        progress: parseInt(data.progress, 10),
        socketId: data.socketId === 'null' ? null : data.socketId,
        hasFinished: data.hasFinished === 'true'
    };
}

function parseVote(data: Record<string, string>): Vote {
    return {
        id: data.id,
        userId: data.userId,
        roomId: data.roomId,
        movieId: parseInt(data.movieId, 10),
        vote: data.vote as VoteType,
        createdAt: new Date(data.createdAt)
    };
}

class DataStore {
    private async client() {
        try {
            return getRedisClient();
        } catch {
            return connectRedis();
        }
    }

    // ============= ROOM OPERATIONS =============

    async createRoom(hostId: string, movieIds: number[]): Promise<Room> {
        const client = await this.client();
        const roomId = generateRoomId();
        let code = generateRoomCode();
        let reserved = false;

        for (let attempt = 0; attempt < 20; attempt++) {
            reserved = (await client.setNX(KEYS.roomCode(code), roomId)) === 1;
            if (reserved) break;
            code = generateRoomCode();
        }

        if (!reserved) {
            throw new Error('Failed to generate unique room code');
        }

        const now = new Date();
        const room: Room = {
            id: roomId,
            code,
            status: RoomStatus.WAITING,
            hostId,
            movieIds,
            createdAt: now,
            lastActiveAt: now
        };

        await client.hSet(KEYS.room(roomId), roomToHash(room));
        return room;
    }

    async getRoomById(roomId: string): Promise<Room | undefined> {
        const client = await this.client();
        const data = await client.hGetAll(KEYS.room(roomId));
        if (!data.id) return undefined;
        return parseRoom(data);
    }

    async getRoomByCode(code: string): Promise<Room | undefined> {
        const client = await this.client();
        const roomId = await client.get(KEYS.roomCode(code.toUpperCase()));
        if (!roomId) return undefined;
        return this.getRoomById(roomId);
    }

    async getAllRooms(): Promise<Room[]> {
        const client = await this.client();
        const rooms: Room[] = [];

        for await (const key of client.scanIterator({ MATCH: 'room:*', COUNT: 100 })) {
            const roomKey = Array.isArray(key) ? key[0] : key;
            const data = await client.hGetAll(roomKey);
            if (data.id) {
                rooms.push(parseRoom(data));
            }
        }

        return rooms;
    }

    async updateRoomStatus(roomId: string, status: RoomStatus): Promise<boolean> {
        const client = await this.client();
        const exists = await client.exists(KEYS.room(roomId));
        if (!exists) return false;

        await client.hSet(KEYS.room(roomId), {
            status,
            lastActiveAt: new Date().toISOString()
        });
        return true;
    }

    async setRoomLastActiveAt(roomId: string, lastActiveAt: Date): Promise<boolean> {
        const client = await this.client();
        const exists = await client.exists(KEYS.room(roomId));
        if (!exists) return false;

        await client.hSet(KEYS.room(roomId), 'lastActiveAt', lastActiveAt.toISOString());
        return true;
    }

    async deleteRoom(roomId: string): Promise<boolean> {
        const room = await this.getRoomById(roomId);
        if (!room) return false;

        const client = await this.client();
        const userIds = await client.sMembers(KEYS.roomUsers(roomId));
        const voteIds = await client.sMembers(KEYS.roomVotes(roomId));

        const keysToDelete: string[] = [
            KEYS.room(roomId),
            KEYS.roomCode(room.code),
            KEYS.roomUsers(roomId),
            KEYS.roomVotes(roomId)
        ];

        for (const userId of userIds) {
            keysToDelete.push(KEYS.user(userId));
            keysToDelete.push(KEYS.userVotes(userId));
            const user = await this.getUserById(userId);
            if (user?.socketId) {
                keysToDelete.push(KEYS.socketUser(user.socketId));
            }
        }

        for (const voteId of voteIds) {
            keysToDelete.push(KEYS.vote(voteId));
        }

        await client.del(keysToDelete);
        return true;
    }

    // ============= USER OPERATIONS =============

    async createUser(name: string, roomId: string, isHost: boolean): Promise<User> {
        const client = await this.client();
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

        await client.hSet(KEYS.user(userId), userToHash(user));

        if (roomId) {
            await client.sAdd(KEYS.roomUsers(roomId), userId);
            await this.touchRoom(roomId);
        }

        return user;
    }

    async assignUserToRoom(userId: string, roomId: string): Promise<boolean> {
        const client = await this.client();
        const exists = await client.exists(KEYS.user(userId));
        if (!exists) return false;

        await client.hSet(KEYS.user(userId), 'roomId', roomId);
        await client.sAdd(KEYS.roomUsers(roomId), userId);
        await this.touchRoom(roomId);
        return true;
    }

    async getUserById(userId: string): Promise<User | undefined> {
        const client = await this.client();
        const data = await client.hGetAll(KEYS.user(userId));
        if (!data.id) return undefined;
        return parseUser(data);
    }

    async getUserBySocketId(socketId: string): Promise<User | undefined> {
        const client = await this.client();
        const userId = await client.get(KEYS.socketUser(socketId));
        if (!userId) return undefined;
        return this.getUserById(userId);
    }

    async getUsersByRoom(roomId: string): Promise<User[]> {
        const client = await this.client();
        const userIds = await client.sMembers(KEYS.roomUsers(roomId));

        const users = await Promise.all(userIds.map(id => this.getUserById(id)));
        return users.filter((u): u is User => u !== undefined);
    }

    async updateUserSocket(userId: string, socketId: string | null): Promise<boolean> {
        const user = await this.getUserById(userId);
        if (!user) return false;

        const client = await this.client();

        if (user.socketId) {
            await client.del(KEYS.socketUser(user.socketId));
        }

        await client.hSet(KEYS.user(userId), 'socketId', socketId ?? 'null');

        if (socketId) {
            await client.set(KEYS.socketUser(socketId), userId);
        }

        if (user.roomId) {
            await this.touchRoom(user.roomId);
        }

        return true;
    }

    async updateUserProgress(userId: string, progress: number, hasFinished: boolean): Promise<boolean> {
        const user = await this.getUserById(userId);
        if (!user) return false;

        const client = await this.client();
        await client.hSet(KEYS.user(userId), {
            progress: String(progress),
            hasFinished: String(hasFinished)
        });

        if (user.roomId) {
            await this.touchRoom(user.roomId);
        }

        return true;
    }

    async deleteUser(userId: string): Promise<boolean> {
        const user = await this.getUserById(userId);
        if (!user) return false;

        const client = await this.client();
        const voteIds = await client.sMembers(KEYS.userVotes(userId));

        const keysToDelete = [
            KEYS.user(userId),
            KEYS.userVotes(userId),
            ...voteIds.map(id => KEYS.vote(id))
        ];

        if (user.socketId) {
            keysToDelete.push(KEYS.socketUser(user.socketId));
        }

        await client.sRem(KEYS.roomUsers(user.roomId), userId);

        for (const voteId of voteIds) {
            await client.sRem(KEYS.roomVotes(user.roomId), voteId);
        }

        await client.del(keysToDelete);

        if (user.roomId) {
            await this.touchRoom(user.roomId);
        }

        return true;
    }

    // ============= VOTE OPERATIONS =============

    async createVote(userId: string, roomId: string, movieId: number, voteType: VoteType): Promise<Vote> {
        const client = await this.client();
        const voteId = generateVoteId();
        const now = new Date();

        const vote: Vote = {
            id: voteId,
            userId,
            roomId,
            movieId,
            vote: voteType,
            createdAt: now
        };

        await client.hSet(KEYS.vote(voteId), {
            id: voteId,
            userId,
            roomId,
            movieId: String(movieId),
            vote: voteType,
            createdAt: now.toISOString()
        });

        await client.sAdd(KEYS.roomVotes(roomId), voteId);
        await client.sAdd(KEYS.userVotes(userId), voteId);
        await this.touchRoom(roomId);

        return vote;
    }

    async hasUserVotedForMovie(userId: string, movieId: number): Promise<boolean> {
        const client = await this.client();
        const voteIds = await client.sMembers(KEYS.userVotes(userId));

        for (const voteId of voteIds) {
            const data = await client.hGetAll(KEYS.vote(voteId));
            if (data.movieId && parseInt(data.movieId, 10) === movieId) {
                return true;
            }
        }

        return false;
    }

    async getVotesByRoom(roomId: string): Promise<Vote[]> {
        const client = await this.client();
        const voteIds = await client.sMembers(KEYS.roomVotes(roomId));

        const votes = await Promise.all(voteIds.map(async (voteId) => {
            const data = await client.hGetAll(KEYS.vote(voteId));
            return data.id ? parseVote(data) : undefined;
        }));

        return votes.filter((v): v is Vote => v !== undefined);
    }

    async getVotesByUser(userId: string): Promise<Vote[]> {
        const client = await this.client();
        const voteIds = await client.sMembers(KEYS.userVotes(userId));

        const votes = await Promise.all(voteIds.map(async (voteId) => {
            const data = await client.hGetAll(KEYS.vote(voteId));
            return data.id ? parseVote(data) : undefined;
        }));

        return votes.filter((v): v is Vote => v !== undefined);
    }

    async getUserVoteCount(userId: string): Promise<number> {
        const client = await this.client();
        return client.sCard(KEYS.userVotes(userId));
    }

    // ============= STATISTICS =============

    async getRoomStats(): Promise<{ rooms: number; users: number; votes: number }> {
        const client = await this.client();

        const countKeys = async (pattern: string): Promise<number> => {
            let count = 0;
            for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
                void key;
                count++;
            }
            return count;
        };

        const [rooms, users, votes] = await Promise.all([
            countKeys('room:*'),
            countKeys('user:*'),
            countKeys('vote:*')
        ]);

        return { rooms, users, votes };
    }

    private async touchRoom(roomId: string): Promise<void> {
        const client = await this.client();
        const exists = await client.exists(KEYS.room(roomId));
        if (exists) {
            await client.hSet(KEYS.room(roomId), 'lastActiveAt', new Date().toISOString());
        }
    }
}

export const dataStore = new DataStore();
