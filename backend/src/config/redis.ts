/**
 * CineMatch Backend - Redis Configuration
 * Manages primary and pub/sub client lifecycle
 */

import { createClient, RedisClientType } from 'redis';
import { config } from './index';

let primaryClient: RedisClientType | null = null;
let pubClient: RedisClientType | null = null;
let subClient: RedisClientType | null = null;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const MAX_RECONNECT_ATTEMPTS = 10;

function attachErrorHandler(client: RedisClientType, label: string): void {
    client.on('error', (err) => {
        console.error(`[Redis:${label}] Connection error:`, err.message);
    });
    client.on('reconnecting', () => {
        console.warn(`[Redis:${label}] Reconnecting...`);
    });
}

export async function connectRedis(): Promise<RedisClientType> {
    if (primaryClient?.isOpen) {
        return primaryClient;
    }

    primaryClient = createClient({
        url: REDIS_URL,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries >= MAX_RECONNECT_ATTEMPTS) {
                    return new Error('Redis max reconnection attempts reached');
                }
                return Math.min(retries * 100, 3000);
            }
        }
    });

    attachErrorHandler(primaryClient, 'primary');
    await primaryClient.connect();

    if (!config.isTest) {
        console.log(`[Redis] Connected to ${REDIS_URL}`);
    }

    return primaryClient;
}

export async function createPubSubClients(): Promise<{
    pubClient: RedisClientType;
    subClient: RedisClientType;
}> {
    if (pubClient?.isOpen && subClient?.isOpen) {
        return { pubClient, subClient };
    }

    pubClient = createClient({ url: REDIS_URL });
    subClient = pubClient.duplicate();

    attachErrorHandler(pubClient, 'pub');
    attachErrorHandler(subClient, 'sub');

    await Promise.all([pubClient.connect(), subClient.connect()]);

    if (!config.isTest) {
        console.log('[Redis] Pub/Sub clients connected');
    }

    return { pubClient, subClient };
}

export function getRedisClient(): RedisClientType {
    if (!primaryClient?.isOpen) {
        throw new Error('Redis client is not connected');
    }
    return primaryClient;
}

export async function resetRedisForTests(): Promise<void> {
    primaryClient = null;
    pubClient = null;
    subClient = null;
}

export async function disconnectRedis(): Promise<void> {
    const disconnects: Promise<void>[] = [];

    if (subClient?.isOpen) disconnects.push(subClient.quit().then(() => undefined));
    if (pubClient?.isOpen) disconnects.push(pubClient.quit().then(() => undefined));
    if (primaryClient?.isOpen) disconnects.push(primaryClient.quit().then(() => undefined));

    await Promise.all(disconnects);

    subClient = null;
    pubClient = null;
    primaryClient = null;
}
