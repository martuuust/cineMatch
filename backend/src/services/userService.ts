/**
 * CineMatch Backend - User Service
 * Business logic for user management
 */

import { dataStore } from '../data/store';
import { User, UserPublicInfo } from '../types';
// Error utilities available if needed for future extensions

export class UserService {
    /**
     * Get user by ID
     */
    getUserById(userId: string): User | undefined {
        return dataStore.getUserById(userId);
    }

    /**
     * Get user by socket ID
     */
    getUserBySocketId(socketId: string): User | undefined {
        return dataStore.getUserBySocketId(socketId);
    }

    /**
     * Update user's socket connection
     */
    updateSocket(userId: string, socketId: string | null): boolean {
        return dataStore.updateUserSocket(userId, socketId);
    }

    /**
     * Handle user disconnection
     */
    handleDisconnect(socketId: string): { user: User; roomId: string } | null {
        const user = dataStore.getUserBySocketId(socketId);
        if (!user) return null;

        // Just clear socket, don't remove user (allow reconnection)
        dataStore.updateUserSocket(user.id, null);

        return { user, roomId: user.roomId };
    }

    /**
     * Reconnect user to socket
     */
    reconnect(userId: string, socketId: string): User | null {
        const user = dataStore.getUserById(userId);
        if (!user) return null;

        dataStore.updateUserSocket(userId, socketId);
        return user;
    }

    /**
     * Convert User to public info
     */
    toPublicInfo(user: User): UserPublicInfo {
        return {
            id: user.id,
            name: user.name,
            isHost: user.isHost,
            progress: user.progress,
            hasFinished: user.hasFinished
        };
    }

    /**
     * Remove user from room (leave)
     */
    removeUser(userId: string): boolean {
        return dataStore.deleteUser(userId);
    }

    /**
     * Check if user is host of their room
     */
    isHost(userId: string): boolean {
        const user = dataStore.getUserById(userId);
        return user?.isHost ?? false;
    }
}

export const userService = new UserService();
