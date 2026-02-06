/**
 * CineMatch - Socket Service
 * Socket.io client for real-time communication
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

// Socket event types
export interface UserPublicInfo {
    id: string;
    name: string;
    isHost: boolean;
    progress: number;
    hasFinished: boolean;
}

export interface UserProgressPayload {
    userId: string;
    progress: number;
    hasFinished: boolean;
}

export interface MovieWithScore {
    movie: {
        id: number;
        title: string;
        posterPath: string;
        rating: number;
        duration: number;
        genres: string[];
        overview: string;
        watchProviders?: {
            providerId: number;
            providerName: string;
            logoPath: string;
        }[];
    };
    yesVotes: number;
    totalVotes: number;
    ratio: number;
}

export interface MatchingCompletePayload {
    type: 'perfect_match' | 'top_picks';
    match?: MovieWithScore['movie'];
    otherMatches?: MovieWithScore['movie'][];
    topPicks?: MovieWithScore[];
}

export interface SocketError {
    error: string;
    code: string;
}

type EventCallbacks = {
    onUserListUpdated?: (users: UserPublicInfo[]) => void;
    onVotingStarted?: () => void;
    onUserProgress?: (data: UserProgressPayload) => void;
    onMatchingComplete?: (result: MatchingCompletePayload) => void;
    onError?: (error: SocketError) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
};

class SocketService {
    private socket: Socket | null = null;
    private callbacks: EventCallbacks = {};

    /**
     * Connect to the socket server
     */
    connect(callbacks: EventCallbacks = {}): void {
        if (this.socket?.connected) {
            console.log('[Socket] Already connected');
            return;
        }

        this.callbacks = callbacks;

        this.socket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('[Socket] Connected:', this.socket?.id);
            this.callbacks.onConnect?.();
        });

        this.socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            this.callbacks.onDisconnect?.();
        });

        this.socket.on('user-list-updated', (data: { users: UserPublicInfo[] }) => {
            console.log('[Socket] User list updated:', data.users);
            this.callbacks.onUserListUpdated?.(data.users);
        });

        this.socket.on('voting-started', () => {
            console.log('[Socket] Voting started');
            this.callbacks.onVotingStarted?.();
        });

        this.socket.on('user-progress', (data: UserProgressPayload) => {
            console.log('[Socket] User progress:', data);
            this.callbacks.onUserProgress?.(data);
        });

        this.socket.on('matching-complete', (result: MatchingCompletePayload) => {
            console.log('[Socket] Matching complete:', result);
            this.callbacks.onMatchingComplete?.(result);
        });

        this.socket.on('error', (error: SocketError) => {
            console.error('[Socket] Error:', error);
            this.callbacks.onError?.(error);
        });
    }

    /**
     * Disconnect from the socket server
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Emit user-joined event
     */
    emitUserJoined(roomCode: string, userId: string | number): void {
        this.socket?.emit('user-joined', { roomCode, userId: userId.toString() });
    }

    /**
     * Emit start-voting event (host only)
     */
    emitStartVoting(roomCode: string, userId: string | number): void {
        this.socket?.emit('start-voting', { roomCode, userId: userId.toString() });
    }

    /**
     * Emit vote event
     */
    emitVote(roomCode: string, userId: string | number, movieId: number, voteType: 'yes' | 'no'): void {
        this.socket?.emit('vote', { roomCode, userId: userId.toString(), movieId, voteType });
    }

    /**
     * Emit leave-room event
     */
    emitLeaveRoom(roomCode: string, userId: string | number): Promise<void> {
        return new Promise((resolve) => {
            if (!this.socket?.connected) {
                resolve();
                return;
            }

            // Timeout in case server doesn't respond
            const timeout = setTimeout(() => resolve(), 1000);

            this.socket.emit('leave-room', { roomCode, userId: userId.toString() }, () => {
                clearTimeout(timeout);
                resolve();
            });
        });
    }

    /**
     * Emit reconnect event
     */
    emitReconnect(userId: string | number, roomCode: string): void {
        this.socket?.emit('reconnect-user', { userId: userId.toString(), roomCode });
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    /**
     * Emit force-finish-voting event (host only)
     */
    emitForceFinishVoting(roomCode: string, userId: string | number): void {
        this.socket?.emit('force-finish-voting', { roomCode, userId: userId.toString() });
    }

    /**
     * Update callbacks
     */
    updateCallbacks(callbacks: Partial<EventCallbacks>): void {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }
}

// Singleton instance
export const socketService = new SocketService();
