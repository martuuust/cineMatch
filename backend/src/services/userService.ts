/**
 * CineMatch Backend - User Service
 * Business logic for user management
 */

import { dataStore } from '../data/store';
import { User, UserPublicInfo } from '../types';
import { roomService } from './roomService';
import { RoomStatus } from '../types';

export class UserService {
    async getUserById(userId: string): Promise<User | undefined> {
        return dataStore.getUserById(userId);
    }

    async getUserBySocketId(socketId: string): Promise<User | undefined> {
        return dataStore.getUserBySocketId(socketId);
    }

    async updateSocket(userId: string, socketId: string | null): Promise<boolean> {
        return dataStore.updateUserSocket(userId, socketId);
    }

    async handleDisconnect(socketId: string): Promise<{ user: User; roomId: string; shouldFinish: boolean } | null> {
        const user = await dataStore.getUserBySocketId(socketId);
        if (!user) return null;

        await dataStore.updateUserSocket(user.id, null);

        let shouldFinish = false;
        const room = await dataStore.getRoomById(user.roomId);

        if (room && room.status === RoomStatus.VOTING) {
            if (await roomService.haveAllUsersFinished(room.id)) {
                shouldFinish = true;
            }
        }

        return { user, roomId: user.roomId, shouldFinish };
    }

    async reconnect(userId: string, socketId: string): Promise<User | null> {
        const user = await dataStore.getUserById(userId);
        if (!user) return null;

        await dataStore.updateUserSocket(userId, socketId);
        return user;
    }

    toPublicInfo(user: User): UserPublicInfo {
        return {
            id: user.id,
            name: user.name,
            isHost: user.isHost,
            progress: user.progress,
            hasFinished: user.hasFinished
        };
    }

    async removeUser(userId: string): Promise<boolean> {
        return dataStore.deleteUser(userId);
    }

    async isHost(userId: string): Promise<boolean> {
        const user = await dataStore.getUserById(userId);
        return user?.isHost ?? false;
    }
}

export const userService = new UserService();
