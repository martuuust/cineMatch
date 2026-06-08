/**
 * CineMatch Backend - Room Service Tests
 */

import { dataStore } from '../data/store';
import { roomService } from './roomService';

describe('RoomService - Disconnection Handling', () => {
    beforeEach(() => {
        // Clear all rooms to guarantee isolation
        for (const room of dataStore.getAllRooms()) {
            dataStore.deleteRoom(room.id);
        }
    });

    afterEach(() => {
        for (const room of dataStore.getAllRooms()) {
            dataStore.deleteRoom(room.id);
        }
    });

    it('should complete voting if all connected users finished, ignoring disconnected ones (DH-1.1)', () => {
        const room = dataStore.createRoom('host-id', [101, 102]);
        const user1 = dataStore.createUser('Alice', room.id, true);
        const user2 = dataStore.createUser('Bob', room.id, false);
        const user3 = dataStore.createUser('Charlie', room.id, false);

        // Alice and Bob are connected, Charlie is disconnected
        dataStore.updateUserSocket(user1.id, 'socket-1');
        dataStore.updateUserSocket(user2.id, 'socket-2');
        dataStore.updateUserSocket(user3.id, null);

        // Alice and Bob finish voting
        dataStore.updateUserProgress(user1.id, 100, true);
        dataStore.updateUserProgress(user2.id, 100, true);

        // Charlie has not finished
        dataStore.updateUserProgress(user3.id, 50, false);

        expect(roomService.haveAllUsersFinished(room.id)).toBe(true);
    });

    it('should include reconnected user in the check (DH-1.2)', () => {
        const room = dataStore.createRoom('host-id', [101, 102]);
        const user1 = dataStore.createUser('Alice', room.id, true);
        const user2 = dataStore.createUser('Bob', room.id, false);
        const user3 = dataStore.createUser('Charlie', room.id, false);

        // All reconnect/connect
        dataStore.updateUserSocket(user1.id, 'socket-1');
        dataStore.updateUserSocket(user2.id, 'socket-2');
        dataStore.updateUserSocket(user3.id, 'socket-3'); // Charlie reconnected!

        // Alice and Bob finish, Charlie has not
        dataStore.updateUserProgress(user1.id, 100, true);
        dataStore.updateUserProgress(user2.id, 100, true);
        dataStore.updateUserProgress(user3.id, 50, false);

        expect(roomService.haveAllUsersFinished(room.id)).toBe(false);
    });

    it('should not mark room as finished if all users are disconnected (DH-2.1)', () => {
        const room = dataStore.createRoom('host-id', [101, 102]);
        const user1 = dataStore.createUser('Alice', room.id, true);
        const user2 = dataStore.createUser('Bob', room.id, false);

        // Both are disconnected
        dataStore.updateUserSocket(user1.id, null);
        dataStore.updateUserSocket(user2.id, null);

        expect(roomService.haveAllUsersFinished(room.id)).toBe(false);
    });

    it('should evaluate to true if the last active user finishes voting (DH-2.2)', () => {
        const room = dataStore.createRoom('host-id', [101, 102]);
        const user1 = dataStore.createUser('Alice', room.id, true);
        const user2 = dataStore.createUser('Bob', room.id, false);
        const user3 = dataStore.createUser('Charlie', room.id, false);

        // Alice is connected, Bob and Charlie are disconnected
        dataStore.updateUserSocket(user1.id, 'socket-1');
        dataStore.updateUserSocket(user2.id, null);
        dataStore.updateUserSocket(user3.id, null);

        // Alice finishes
        dataStore.updateUserProgress(user1.id, 100, true);

        expect(roomService.haveAllUsersFinished(room.id)).toBe(true);
    });
});
