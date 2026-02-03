/**
 * CineMatch Backend - Configuration
 * Centralized configuration management with validation
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env file
const result = dotenv.config({ path: path.join(__dirname, '../../.env') });

if (result.error) {
    console.log('[Config] Error loading .env file:', result.error);
    // Try default location
    dotenv.config();
} else {
    console.log('[Config] Loaded .env file successfully');
}

interface Config {
    port: number;
    nodeEnv: string;
    corsOrigin: string;
    tmdb: {
        apiKey: string;
        baseUrl: string;
    };
}

function validateConfig(): Config {
    const port = parseInt(process.env.PORT || '3001', 10);
    const nodeEnv = process.env.NODE_ENV || 'development';
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    const tmdbApiKey = process.env.TMDB_API_KEY || '';
    const tmdbBaseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

    if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error('Invalid PORT configuration');
    }

    return {
        port,
        nodeEnv,
        corsOrigin,
        tmdb: {
            apiKey: tmdbApiKey,
            baseUrl: tmdbBaseUrl
        }
    };
}

export const config = validateConfig();
