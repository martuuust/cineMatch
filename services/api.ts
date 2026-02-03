/**
 * CineMatch - API Service
 * HTTP client for backend REST API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface CreateRoomResponse {
    roomCode: string;
    userId: string;
    movieIds: number[];
    movies: Movie[];
}

interface JoinRoomResponse {
    roomId: string;
    userId: string;
    roomCode: string;
    movieIds: number[];
    users: any[];
    movies: Movie[];
}

interface Movie {
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
}

interface MovieBatchResponse {
    movies: Movie[];
}

class ApiError extends Error {
    constructor(public code: string, message: string, public statusCode: number) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            errorData.code || 'UNKNOWN_ERROR',
            errorData.error || 'An error occurred',
            response.status
        );
    }
    return response.json();
}

export const api = {
    /**
     * Create a new room
     */
    async createRoom(userName: string, genreId?: number): Promise<CreateRoomResponse> {
        const response = await fetch(`${API_BASE_URL}/rooms/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, genreId })
        });
        return handleResponse<CreateRoomResponse>(response);
    },

    /**
     * Join an existing room
     */
    async joinRoom(roomCode: string, userName: string): Promise<JoinRoomResponse> {
        const response = await fetch(`${API_BASE_URL}/rooms/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomCode, userName })
        });
        return handleResponse<JoinRoomResponse>(response);
    },

    /**
     * Get room details
     */
    async getRoom(roomCode: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomCode}`);
        return handleResponse(response);
    },

    /**
     * Get movies for voting
     */
    async getMovies(): Promise<Movie[]> {
        const response = await fetch(`${API_BASE_URL}/movies/batch`);
        const data = await handleResponse<MovieBatchResponse>(response);
        return data.movies;
    },

    /**
     * Health check
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }
};

export type { CreateRoomResponse, JoinRoomResponse, Movie };
