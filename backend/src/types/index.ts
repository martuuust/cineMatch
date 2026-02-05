/**
 * CineMatch Backend - Type Definitions
 * Strict typing for all domain models and DTOs
 */

// ============= ENUMS =============

export enum RoomStatus {
    WAITING = 'waiting',
    VOTING = 'voting',
    FINISHED = 'finished'
}

export enum VoteType {
    YES = 'yes',
    NO = 'no'
}

// ============= DOMAIN MODELS =============

export interface User {
    id: string;
    name: string;
    roomId: string;
    isHost: boolean;
    progress: number;
    socketId: string | null;
    hasFinished: boolean;
}

export interface Room {
    id: string;
    code: string;
    status: RoomStatus;
    hostId: string;
    movieIds: number[];
    createdAt: Date;
}

export interface Vote {
    id: string;
    userId: string;
    roomId: string;
    movieId: number;
    vote: VoteType;
    createdAt: Date;
}

export interface Movie {
    id: number;
    title: string;
    posterPath: string;
    rating: number;
    duration: number;
    genres: string[];
    overview: string;
    releaseYear?: number;
    watchProviders?: {
        providerId: number;
        providerName: string;
        logoPath: string;
    }[];
    watchUrl?: string;
}

// ============= API REQUEST DTOs =============

export interface CreateRoomRequest {
    userName: string;
}

export interface JoinRoomRequest {
    roomCode: string;
    userName: string;
}

// ============= API RESPONSE DTOs =============

export interface CreateRoomResponse {
    roomCode: string;
    userId: string;
}

export interface JoinRoomResponse {
    roomId: string;
    userId: string;
}

export interface MovieBatchResponse {
    movies: Movie[];
}

export interface ErrorResponse {
    error: string;
    code: string;
    details?: unknown;
}

// ============= SOCKET EVENT PAYLOADS =============

export interface UserJoinedPayload {
    roomCode: string;
    userName: string;
    userId?: string;
}

export interface StartVotingPayload {
    roomCode: string;
    userId: string;
}

export interface VotePayload {
    roomCode: string;
    userId: string;
    movieId: number;
    voteType: VoteType;
}

// ============= SOCKET EMISSION DTOs =============

export interface UserListUpdatedPayload {
    users: UserPublicInfo[];
}

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

export interface MatchingCompletePayload {
    type: 'perfect_match' | 'top_picks';
    match?: Movie;
    otherMatches?: Movie[];
    topPicks?: MovieWithScore[];
}

export interface MovieWithScore {
    movie: Movie;
    yesVotes: number;
    totalVotes: number;
    ratio: number;
}

// ============= INTERNAL TYPES =============

export interface VotingResult {
    movieId: number;
    yesCount: number;
    totalVoters: number;
    ratio: number;
}
