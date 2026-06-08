/**
 * CineMatch Backend - Redis DataStore Tests
 */

import { connectRedis } from '../config/redis';
import { dataStore } from './store';
import { RoomStatus, VoteType } from '../types';

describe('DataStore - Redis', () => {
    beforeEach(async () => {
        await connectRedis();
    });

    afterEach(async () => {
        for (const room of await dataStore.getAllRooms()) {
            await dataStore.deleteRoom(room.id);
        }
    });

    it('should create and retrieve a room by code atomically', async () => {
        const room = await dataStore.createRoom('host-id', [1, 2, 3]);

        expect(room.code).toMatch(/^CINE-[A-Z0-9]{4}$/);
        expect(await dataStore.getRoomById(room.id)).toEqual(room);
        expect(await dataStore.getRoomByCode(room.code)).toEqual(room);
    });

    it('should create user and associate votes with room indices', async () => {
        const room = await dataStore.createRoom('host-id', [101]);
        const user = await dataStore.createUser('Alice', room.id, true);

        const vote = await dataStore.createVote(user.id, room.id, 101, VoteType.YES);

        expect(await dataStore.hasUserVotedForMovie(user.id, 101)).toBe(true);
        expect(await dataStore.getUserVoteCount(user.id)).toBe(1);
        expect(await dataStore.getVotesByRoom(room.id)).toEqual([vote]);
    });

    it('should cascade delete room with users and votes', async () => {
        const room = await dataStore.createRoom('host-id', [1]);
        const user = await dataStore.createUser('Bob', room.id, false);
        await dataStore.createVote(user.id, room.id, 1, VoteType.NO);
        await dataStore.updateUserSocket(user.id, 'socket-1');

        await dataStore.deleteRoom(room.id);

        expect(await dataStore.getRoomById(room.id)).toBeUndefined();
        expect(await dataStore.getUserById(user.id)).toBeUndefined();
        expect(await dataStore.getUserBySocketId('socket-1')).toBeUndefined();
        expect(await dataStore.getAllRooms()).toHaveLength(0);
    });

    it('should update room status and track lastActiveAt', async () => {
        const room = await dataStore.createRoom('host-id', [1]);
        const past = new Date(Date.now() - 60_000);

        await dataStore.setRoomLastActiveAt(room.id, past);
        await dataStore.updateRoomStatus(room.id, RoomStatus.VOTING);

        const updated = await dataStore.getRoomById(room.id);
        expect(updated?.status).toBe(RoomStatus.VOTING);
        expect(updated!.lastActiveAt.getTime()).toBeGreaterThan(past.getTime());
    });
});
