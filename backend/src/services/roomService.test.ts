/**
 * CineMatch Backend - Room Service Tests
 */

import { connectRedis } from '../config/redis';
import { dataStore } from '../data/store';
import { roomService } from './roomService';

describe('RoomService - Disconnection Handling', () => {
    beforeEach(async () => {
        await connectRedis();
    });

    it('should complete voting if all connected users finished, ignoring disconnected ones (DH-1.1)', async () => {
        const room = await dataStore.createRoom('host-id', [101, 102]);
        const user1 = await dataStore.createUser('Alice', room.id, true);
        const user2 = await dataStore.createUser('Bob', room.id, false);
        const user3 = await dataStore.createUser('Charlie', room.id, false);

        await dataStore.updateUserSocket(user1.id, 'socket-1');
        await dataStore.updateUserSocket(user2.id, 'socket-2');
        await dataStore.updateUserSocket(user3.id, null);

        await dataStore.updateUserProgress(user1.id, 100, true);
        await dataStore.updateUserProgress(user2.id, 100, true);
        await dataStore.updateUserProgress(user3.id, 50, false);

        expect(await roomService.haveAllUsersFinished(room.id)).toBe(true);
    });

    it('should include reconnected user in the check (DH-1.2)', async () => {
        const room = await dataStore.createRoom('host-id', [101, 102]);
        const user1 = await dataStore.createUser('Alice', room.id, true);
        const user2 = await dataStore.createUser('Bob', room.id, false);
        const user3 = await dataStore.createUser('Charlie', room.id, false);

        await dataStore.updateUserSocket(user1.id, 'socket-1');
        await dataStore.updateUserSocket(user2.id, 'socket-2');
        await dataStore.updateUserSocket(user3.id, 'socket-3');

        await dataStore.updateUserProgress(user1.id, 100, true);
        await dataStore.updateUserProgress(user2.id, 100, true);
        await dataStore.updateUserProgress(user3.id, 50, false);

        expect(await roomService.haveAllUsersFinished(room.id)).toBe(false);
    });

    it('should not mark room as finished if all users are disconnected (DH-2.1)', async () => {
        const room = await dataStore.createRoom('host-id', [101, 102]);
        const user1 = await dataStore.createUser('Alice', room.id, true);
        const user2 = await dataStore.createUser('Bob', room.id, false);

        await dataStore.updateUserSocket(user1.id, null);
        await dataStore.updateUserSocket(user2.id, null);

        expect(await roomService.haveAllUsersFinished(room.id)).toBe(false);
    });

    it('should evaluate to true if the last active user finishes voting (DH-2.2)', async () => {
        const room = await dataStore.createRoom('host-id', [101, 102]);
        const user1 = await dataStore.createUser('Alice', room.id, true);
        const user2 = await dataStore.createUser('Bob', room.id, false);
        const user3 = await dataStore.createUser('Charlie', room.id, false);

        await dataStore.updateUserSocket(user1.id, 'socket-1');
        await dataStore.updateUserSocket(user2.id, null);
        await dataStore.updateUserSocket(user3.id, null);

        await dataStore.updateUserProgress(user1.id, 100, true);

        expect(await roomService.haveAllUsersFinished(room.id)).toBe(true);
    });
});
