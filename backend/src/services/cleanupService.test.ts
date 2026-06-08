/**
 * CineMatch Backend - Room Cleanup Service Tests
 */

import { dataStore } from '../data/store';
import { cleanupRooms } from './cleanupService';
import { RoomStatus } from '../types';

describe('CleanupService', () => {
    beforeEach(() => {
        // Clear all rooms from the store to guarantee isolation
        for (const room of dataStore.getAllRooms()) {
            dataStore.deleteRoom(room.id);
        }
    });

    afterEach(() => {
        // Clear after run as well
        for (const room of dataStore.getAllRooms()) {
            dataStore.deleteRoom(room.id);
        }
    });

    it('should evict an inactive room if inactive for more than 4 hours (RC-1.1)', () => {
        const room = dataStore.createRoom('host1', [1, 2]);
        // Set lastActiveAt to 4 hours and 1 minute ago
        room.lastActiveAt = new Date(Date.now() - (4 * 60 * 60 * 1000 + 60 * 1000));

        const result = cleanupRooms();
        expect(result.evictedCount).toBe(1);
        expect(dataStore.getRoomById(room.id)).toBeUndefined();
    });

    it('should retain a room if inactive for less than 4 hours (RC-1.2)', () => {
        const room = dataStore.createRoom('host1', [1, 2]);
        // Set lastActiveAt to 3 hours and 59 minutes ago
        room.lastActiveAt = new Date(Date.now() - (4 * 60 * 60 * 1000 - 60 * 1000));

        const result = cleanupRooms();
        expect(result.evictedCount).toBe(0);
        expect(dataStore.getRoomById(room.id)).toBeDefined();
    });

    it('should evict a finished room if finished for more than 1 hour (RC-2.1)', () => {
        const room = dataStore.createRoom('host1', [1, 2]);
        dataStore.updateRoomStatus(room.id, RoomStatus.FINISHED);
        // Set lastActiveAt to 1 hour and 1 minute ago
        room.lastActiveAt = new Date(Date.now() - (1 * 60 * 60 * 1000 + 60 * 1000));

        const result = cleanupRooms();
        expect(result.evictedCount).toBe(1);
        expect(dataStore.getRoomById(room.id)).toBeUndefined();
    });

    it('should retain a finished room if finished for less than 1 hour (RC-2.2)', () => {
        const room = dataStore.createRoom('host1', [1, 2]);
        dataStore.updateRoomStatus(room.id, RoomStatus.FINISHED);
        // Set lastActiveAt to 59 minutes ago
        room.lastActiveAt = new Date(Date.now() - (1 * 60 * 60 * 1000 - 60 * 1000));

        const result = cleanupRooms();
        expect(result.evictedCount).toBe(0);
        expect(dataStore.getRoomById(room.id)).toBeDefined();
    });
});
