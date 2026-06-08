/**
 * CineMatch Backend - Room Cleanup Service
 * Automatically evicts inactive and finished rooms to prevent memory exhaustion
 */

import { dataStore } from '../data/store';
import { RoomStatus } from '../types';

/**
 * Executes the eviction check once
 */
export function cleanupRooms(): { evictedCount: number } {
    const rooms = dataStore.getAllRooms();
    const now = new Date();
    let evictedCount = 0;

    const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
    const ONE_HOUR_MS = 1 * 60 * 60 * 1000;

    for (const room of rooms) {
        try {
            const timeSinceActive = now.getTime() - room.lastActiveAt.getTime();

            let shouldEvict = false;
            if (room.status === RoomStatus.FINISHED) {
                if (timeSinceActive > ONE_HOUR_MS) {
                    shouldEvict = true;
                }
            } else {
                if (timeSinceActive > FOUR_HOURS_MS) {
                    shouldEvict = true;
                }
            }

            if (shouldEvict) {
                dataStore.deleteRoom(room.id);
                evictedCount++;
                console.log(`[Cleanup] Evicted room ${room.id} (${room.code}) - Status: ${room.status}, Inactive for: ${Math.round(timeSinceActive / 1000 / 60)}m`);
            }
        } catch (error) {
            console.error(`[Cleanup] Error evicting room ${room.id}:`, error);
        }
    }

    return { evictedCount };
}

let cleanupIntervalId: NodeJS.Timeout | null = null;

/**
 * Starts the periodic background room cleanup runner
 */
export function startCleanupService(intervalMs: number = 10 * 60 * 1000): void {
    if (cleanupIntervalId) {
        console.warn('[Cleanup] Service is already running');
        return;
    }

    console.log(`[Cleanup] Starting periodic room cleanup service (every ${intervalMs / 1000 / 60} minutes)`);
    
    // Execute immediately on startup to clean up any initial stale state
    try {
        cleanupRooms();
    } catch (error) {
        console.error('[Cleanup] Initial execution failed:', error);
    }

    cleanupIntervalId = setInterval(() => {
        try {
            cleanupRooms();
        } catch (error) {
            console.error('[Cleanup] Execution failed:', error);
        }
    }, intervalMs);
}

/**
 * Stops the periodic background room cleanup runner (useful for testing)
 */
export function stopCleanupService(): void {
    if (cleanupIntervalId) {
        clearInterval(cleanupIntervalId);
        cleanupIntervalId = null;
        console.log('[Cleanup] Stopped room cleanup service');
    }
}
