/**
 * Redis mock compatibility tests
 */

import { createClient } from '../__mocks__/redis';

describe('Redis Mock Client', () => {
    it('should support string operations (set, get, setNX, del)', async () => {
        const client = createClient();
        await client.connect();

        await client.set('roomCode:CINE-ABCD', 'room-1');
        expect(await client.get('roomCode:CINE-ABCD')).toBe('room-1');

        const reserved = await client.setNX('roomCode:CINE-EFGH', 'room-2');
        expect(reserved).toBe(1);
        expect(await client.setNX('roomCode:CINE-EFGH', 'room-3')).toBe(0);

        await client.del('roomCode:CINE-ABCD');
        expect(await client.get('roomCode:CINE-ABCD')).toBeNull();
    });

    it('should support hash operations (hSet, hGet, hGetAll, hDel)', async () => {
        const client = createClient();
        await client.connect();

        await client.hSet('room:1', 'id', '1');
        await client.hSet('room:1', { code: 'CINE-TEST', status: 'waiting' });

        expect(await client.hGet('room:1', 'code')).toBe('CINE-TEST');
        expect(await client.hGetAll('room:1')).toEqual({
            id: '1',
            code: 'CINE-TEST',
            status: 'waiting'
        });

        await client.hDel('room:1', 'status');
        expect(await client.hGet('room:1', 'status')).toBeNull();
    });

    it('should support set operations (sAdd, sRem, sIsMember, sMembers)', async () => {
        const client = createClient();
        await client.connect();

        await client.sAdd('roomUsers:1', 'user-a');
        await client.sAdd('roomUsers:1', 'user-b');

        expect(await client.sIsMember('roomUsers:1', 'user-a')).toBe(true);
        expect(await client.sMembers('roomUsers:1')).toEqual(expect.arrayContaining(['user-a', 'user-b']));

        await client.sRem('roomUsers:1', 'user-a');
        expect(await client.sIsMember('roomUsers:1', 'user-a')).toBe(false);
    });

    it('should support multi/exec transactions', async () => {
        const client = createClient();
        await client.connect();

        const multi = client.multi();
        multi.hSet('room:1', 'id', '1');
        multi.set('roomCode:CINE-TEST', '1');
        const results = await multi.exec();

        expect(results).toHaveLength(2);
        expect(await client.hGet('room:1', 'id')).toBe('1');
        expect(await client.get('roomCode:CINE-TEST')).toBe('1');
    });

    it('should support scanIterator for key enumeration', async () => {
        const client = createClient();
        await client.connect();

        await client.hSet('room:1', 'id', '1');
        await client.hSet('room:2', 'id', '2');
        await client.sAdd('roomUsers:1', 'user-a');

        const keys: string[] = [];
        for await (const key of client.scanIterator({ MATCH: 'room:*' })) {
            keys.push(key);
        }

        expect(keys).toEqual(expect.arrayContaining(['room:1', 'room:2']));
        expect(keys).not.toContain('roomUsers:1');
    });
});
