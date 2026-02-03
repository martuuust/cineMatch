/**
 * CineMatch Backend - Helper Utilities
 * Common utility functions
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique room code in format XXXX-XXXX
 */
export function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars: I, O, 1, 0
    let code = '';

    for (let i = 0; i < 8; i++) {
        if (i === 4) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
}

/**
 * Generates a unique user ID
 */
export function generateUserId(): string {
    return uuidv4();
}

/**
 * Generates a unique room ID
 */
export function generateRoomId(): string {
    return uuidv4();
}

/**
 * Generates a unique vote ID
 */
export function generateVoteId(): string {
    return uuidv4();
}

/**
 * Calculates voting progress as percentage (0-100)
 */
export function calculateProgress(votedCount: number, totalMovies: number): number {
    if (totalMovies === 0) return 0;
    return Math.round((votedCount / totalMovies) * 100);
}

/**
 * Validates room code format (XXXX-XXXX)
 */
export function isValidRoomCode(code: string): boolean {
    const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return pattern.test(code);
}
