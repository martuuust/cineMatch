/**
 * CineMatch Backend - User Service
 * Business logic for user management
 */

import { dataStore } from '../data/store';
import { User, UserPublicInfo } from '../types';
import { roomService } from './roomService';
import { voteService } from './voteService';
import { RoomStatus } from '../types';
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
    handleDisconnect(socketId: string): { user: User; roomId: string; shouldFinish: boolean } | null {
        const user = dataStore.getUserBySocketId(socketId);
        if (!user) return null;

        // Only clear socket association, DO NOT remove user from room
        // This allows users to reconnect/refresh without losing their spot
        dataStore.updateUserSocket(user.id, null);
        
        // Check if room should finish now that this user is "gone" (inactive)
        let shouldFinish = false;
        const room = dataStore.getRoomById(user.roomId);
        
        if (room && room.status === RoomStatus.VOTING) {
            // Check if ALL remaining active users have finished
            // This prevents the room from being blocked by the disconnected user
            if (roomService.haveAllUsersFinished(room.id)) {
                shouldFinish = true;
            }
        }
        
        return { user, roomId: user.roomId, shouldFinish };
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
