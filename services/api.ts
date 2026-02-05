/**
 * CineMatch - API Service
 * HTTP client for backend REST API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

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

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('La solicitud tardó demasiado tiempo. Verifica tu conexión.');
        }
        throw error;
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = {};
        }

        // Handle specific status codes
        if (response.status === 404) {
             throw new ApiError(
                errorData.code || 'ROOM_NOT_FOUND',
                errorData.error || 'Sala no encontrada. Verifica el código.',
                response.status
            );
        }

        if (response.status === 502 || response.status === 504) {
             throw new ApiError(
                'GATEWAY_ERROR',
                'Error de conexión con el servidor (Gateway). Intenta de nuevo.',
                response.status
            );
        }

        throw new ApiError(
            errorData.code || 'UNKNOWN_ERROR',
            errorData.error || `Error del servidor (${response.status})`,
            response.status
        );
    }
    return response.json();
}

export const api = {
    /**
     * Create a new room
     */
    async createRoom(userName: string, genreIds?: number[]): Promise<CreateRoomResponse> {
        const response = await fetchWithTimeout(`${API_BASE_URL}/rooms/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, genreIds })
        });
        return handleResponse<CreateRoomResponse>(response);
    },

    /**
     * Join an existing room
     */
    async joinRoom(roomCode: string, userName: string): Promise<JoinRoomResponse> {
        const response = await fetchWithTimeout(`${API_BASE_URL}/rooms/join`, {
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
        const response = await fetchWithTimeout(`${API_BASE_URL}/rooms/${roomCode}`);
        return handleResponse(response);
    },

    /**
     * Get movies for voting
     */
    async getMovies(): Promise<Movie[]> {
        const response = await fetchWithTimeout(`${API_BASE_URL}/movies/batch`);
        const data = await handleResponse<MovieBatchResponse>(response);
        return data.movies;
    },

    /**
     * Health check
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }
};

export type { CreateRoomResponse, JoinRoomResponse, Movie };
