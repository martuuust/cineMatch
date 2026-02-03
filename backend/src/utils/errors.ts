/**
 * CineMatch Backend - Error Codes
 * Standardized error codes for API responses
 */

export enum ErrorCode {
    // Room errors
    ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
    ROOM_ALREADY_STARTED = 'ROOM_ALREADY_STARTED',
    ROOM_NOT_READY = 'ROOM_NOT_READY',
    ROOM_FULL = 'ROOM_FULL',

    // User errors
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    USER_NOT_HOST = 'USER_NOT_HOST',
    USER_ALREADY_IN_ROOM = 'USER_ALREADY_IN_ROOM',

    // Voting errors
    VOTING_NOT_STARTED = 'VOTING_NOT_STARTED',
    DUPLICATE_VOTE = 'DUPLICATE_VOTE',
    INVALID_MOVIE = 'INVALID_MOVIE',
    VOTING_ALREADY_FINISHED = 'VOTING_ALREADY_FINISHED',

    // General errors
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    INVALID_REQUEST = 'INVALID_REQUEST'
}

export class AppError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly details?: unknown;

    constructor(
        message: string,
        code: ErrorCode,
        statusCode: number = 400,
        details?: unknown
    ) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }

    toJSON() {
        return {
            error: this.message,
            code: this.code,
            details: this.details
        };
    }
}
