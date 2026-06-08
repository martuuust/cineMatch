/**
 * CineMatch Backend - Room Cleanup Service Tests
 */

import { connectRedis } from '../config/redis';
import { dataStore } from '../data/store';
import { cleanupRooms } from './cleanupService';
import { RoomStatus } from '../types';

describe('CleanupService', () => {
    beforeEach(async () => {
        await connectRedis();
    });

    it('should evict an inactive room if inactive for more than 4 hours (RC-1.1)', async () => {
        const room = await dataStore.createRoom('host1', [1, 2]);
        await dataStore.setRoomLastActiveAt(
            room.id,
            new Date(Date.now() - (4 * 60 * 60 * 1000 + 60 * 1000))
        );

        const result = await cleanupRooms();
        expect(result.evictedCount).toBe(1);
        expect(await dataStore.getRoomById(room.id)).toBeUndefined();
    });

    it('should retain a room if inactive for less than 4 hours (RC-1.2)', async () => {
        const room = await dataStore.createRoom('host1', [1, 2]);
        await dataStore.setRoomLastActiveAt(
            room.id,
            new Date(Date.now() - (4 * 60 * 60 * 1000 - 60 * 1000))
        );

        const result = await cleanupRooms();
        expect(result.evictedCount).toBe(0);
        expect(await dataStore.getRoomById(room.id)).toBeDefined();
    });

    it('should evict a finished room if finished for more than 1 hour (RC-2.1)', async () => {
        const room = await dataStore.createRoom('host1', [1, 2]);
        await dataStore.updateRoomStatus(room.id, RoomStatus.FINISHED);
        await dataStore.setRoomLastActiveAt(
            room.id,
            new Date(Date.now() - (1 * 60 * 60 * 1000 + 60 * 1000))
        );

        const result = await cleanupRooms();
        expect(result.evictedCount).toBe(1);
        expect(await dataStore.getRoomById(room.id)).toBeUndefined();
    });

    it('should retain a finished room if finished for less than 1 hour (RC-2.2)', async () => {
        const room = await dataStore.createRoom('host1', [1, 2]);
        await dataStore.updateRoomStatus(room.id, RoomStatus.FINISHED);
        await dataStore.setRoomLastActiveAt(
            room.id,
            new Date(Date.now() - (1 * 60 * 60 * 1000 - 60 * 1000))
        );

        const result = await cleanupRooms();
        expect(result.evictedCount).toBe(0);
        expect(await dataStore.getRoomById(room.id)).toBeDefined();
    });
});
