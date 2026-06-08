/**
 * In-memory Redis emulator for Jest tests.
 * Simulates strings, hashes, sets, and multi/exec transactions.
 */

type HashStore = Map<string, string>;
type SetStore = Set<string>;

interface MockStore {
    strings: Map<string, string>;
    hashes: Map<string, HashStore>;
    sets: Map<string, SetStore>;
}

const globalStore: MockStore = {
    strings: new Map(),
    hashes: new Map(),
    sets: new Map()
};

export function resetMockStore(): void {
    globalStore.strings.clear();
    globalStore.hashes.clear();
    globalStore.sets.clear();
}

function matchPattern(pattern: string, key: string): boolean {
    if (!pattern.includes('*')) {
        return key === pattern;
    }
    const prefix = pattern.slice(0, pattern.indexOf('*'));
    return key.startsWith(prefix);
}

function ensureHash(key: string): HashStore {
    if (!globalStore.hashes.has(key)) {
        globalStore.hashes.set(key, new Map());
    }
    return globalStore.hashes.get(key)!;
}

function ensureSet(key: string): SetStore {
    if (!globalStore.sets.has(key)) {
        globalStore.sets.set(key, new Set());
    }
    return globalStore.sets.get(key)!;
}

interface MockRedisClient {
    isOpen: boolean;
    connect: jest.Mock<Promise<void>, []>;
    disconnect: jest.Mock<Promise<void>, []>;
    quit: jest.Mock<Promise<void>, []>;
    on: jest.Mock;
    duplicate: jest.Mock<MockRedisClient, []>;
    get: jest.Mock<Promise<string | null>, [string]>;
    set: jest.Mock<Promise<string>, [string, string]>;
    setNX: jest.Mock<Promise<number>, [string, string]>;
    exists: jest.Mock<Promise<number>, [string]>;
    del: jest.Mock<Promise<number>, [string | string[]]>;
    keys: jest.Mock<Promise<string[]>, [string]>;
    scanIterator: jest.Mock<AsyncGenerator<string>, [object?]>;
    hSet: jest.Mock<Promise<number>, [string, string | Record<string, string>, string?]>;
    hGet: jest.Mock<Promise<string | null>, [string, string]>;
    hGetAll: jest.Mock<Promise<Record<string, string>>, [string]>;
    hDel: jest.Mock<Promise<number>, [string, string]>;
    sAdd: jest.Mock<Promise<number>, [string, string | string[]]>;
    sRem: jest.Mock<Promise<number>, [string, string | string[]]>;
    sIsMember: jest.Mock<Promise<boolean>, [string, string]>;
    sMembers: jest.Mock<Promise<string[]>, [string]>;
    sCard: jest.Mock<Promise<number>, [string]>;
    multi: jest.Mock;
}

function createMockClient(): MockRedisClient {
    const client: MockRedisClient = {
        isOpen: false,
        connect: jest.fn(async () => {
            client.isOpen = true;
        }),
        disconnect: jest.fn(async () => {
            client.isOpen = false;
        }),
        quit: jest.fn(async () => {
            client.isOpen = false;
        }),
        on: jest.fn(),
        duplicate: jest.fn(() => createMockClient()),
        get: jest.fn(async (key: string) => globalStore.strings.get(key) ?? null),
        set: jest.fn(async (key: string, val: string) => {
            globalStore.strings.set(key, val);
            return 'OK';
        }),
        setNX: jest.fn(async (key: string, val: string) => {
            if (globalStore.strings.has(key)) return 0;
            globalStore.strings.set(key, val);
            return 1;
        }),
        exists: jest.fn(async (key: string) => {
            return (
                globalStore.strings.has(key) ||
                globalStore.hashes.has(key) ||
                globalStore.sets.has(key)
            ) ? 1 : 0;
        }),
        del: jest.fn(async (keys: string | string[]) => {
            const keyList = Array.isArray(keys) ? keys : [keys];
            let deleted = 0;
            for (const key of keyList) {
                if (globalStore.strings.delete(key)) deleted++;
                else if (globalStore.hashes.delete(key)) deleted++;
                else if (globalStore.sets.delete(key)) deleted++;
            }
            return deleted;
        }),
        keys: jest.fn(async (pattern: string) => {
            const allKeys = [
                ...globalStore.strings.keys(),
                ...globalStore.hashes.keys(),
                ...globalStore.sets.keys()
            ];
            return allKeys.filter(key => matchPattern(pattern, key));
        }),
        scanIterator: jest.fn(async function* (options?: { MATCH?: string; COUNT?: number }) {
            const pattern = options?.MATCH ?? '*';
            const keys = [
                ...globalStore.strings.keys(),
                ...globalStore.hashes.keys(),
                ...globalStore.sets.keys()
            ].filter(key => matchPattern(pattern, key));
            for (const key of keys) {
                yield key;
            }
        }),
        hSet: jest.fn(async (key: string, fieldOrRecord: string | Record<string, string>, value?: string) => {
            const hash = ensureHash(key);
            if (typeof fieldOrRecord === 'object') {
                for (const [field, val] of Object.entries(fieldOrRecord)) {
                    hash.set(field, String(val));
                }
                return Object.keys(fieldOrRecord).length;
            }
            hash.set(fieldOrRecord, String(value));
            return 1;
        }),
        hGet: jest.fn(async (key: string, field: string) => hashGet(key, field)),
        hGetAll: jest.fn(async (key: string) => {
            const hash = globalStore.hashes.get(key);
            if (!hash) return {};
            return Object.fromEntries(hash.entries());
        }),
        hDel: jest.fn(async (key: string, field: string) => {
            const hash = globalStore.hashes.get(key);
            if (!hash) return 0;
            return hash.delete(field) ? 1 : 0;
        }),
        sAdd: jest.fn(async (key: string, member: string | string[]) => {
            const set = ensureSet(key);
            const members = Array.isArray(member) ? member : [member];
            let added = 0;
            for (const m of members) {
                if (!set.has(m)) {
                    set.add(m);
                    added++;
                }
            }
            return added;
        }),
        sRem: jest.fn(async (key: string, member: string | string[]) => {
            const set = globalStore.sets.get(key);
            if (!set) return 0;
            const members = Array.isArray(member) ? member : [member];
            let removed = 0;
            for (const m of members) {
                if (set.delete(m)) removed++;
            }
            return removed;
        }),
        sIsMember: jest.fn(async (key: string, member: string) => {
            return globalStore.sets.get(key)?.has(member) ?? false;
        }),
        sMembers: jest.fn(async (key: string) => Array.from(globalStore.sets.get(key) ?? [])),
        sCard: jest.fn(async (key: string) => globalStore.sets.get(key)?.size ?? 0),
        multi: jest.fn(() => {
            const queue: Array<() => Promise<unknown>> = [];
            const multiObj = {
                hSet: (k: string, f: string, v: string) => {
                    queue.push(() => client.hSet(k, f, v));
                    return multiObj;
                },
                set: (k: string, v: string) => {
                    queue.push(() => client.set(k, v));
                    return multiObj;
                },
                del: (k: string | string[]) => {
                    queue.push(() => client.del(k));
                    return multiObj;
                },
                sAdd: (k: string, m: string) => {
                    queue.push(() => client.sAdd(k, m));
                    return multiObj;
                },
                exec: async () => Promise.all(queue.map(cmd => cmd()))
            };
            return multiObj;
        })
    };

    return client;
}

function hashGet(key: string, field: string): string | null {
    return globalStore.hashes.get(key)?.get(field) ?? null;
}

export const createClient = jest.fn(() => createMockClient());
