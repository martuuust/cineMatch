/**
 * CineMatch Backend - TMDB Service
 * Integration with The Movie Database API
 */

import { config } from '../config';
import { Movie } from '../types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

interface TMDBMovie {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
    runtime?: number;
    genre_ids?: number[];
    genres?: { id: number; name: string }[];
    overview: string;
    release_date?: string;
}

interface TMDBResponse {
    results: TMDBMovie[];
    page: number;
    total_pages: number;
}

// TMDBGenre interface available for future genre endpoint integration

// Genre ID to name mapping (cached)
const GENRE_MAP: Record<number, string> = {
    28: 'Acción',
    12: 'Aventura',
    16: 'Animación',
    35: 'Comedia',
    80: 'Crimen',
    99: 'Documental',
    18: 'Drama',
    10751: 'Familia',
    14: 'Fantasía',
    36: 'Historia',
    27: 'Terror',
    10402: 'Música',
    9648: 'Misterio',
    10749: 'Romance',
    878: 'Ciencia Ficción',
    10770: 'Película de TV',
    53: 'Suspense',
    10752: 'Guerra',
    37: 'Western'
};

// Cache for movies to avoid repeated API calls
let movieCache: Movie[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export class TMDBService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = config.tmdb.apiKey;
        this.baseUrl = config.tmdb.baseUrl;
        console.log('[TMDBService] Initialized with API Key present:', this.isConfigured());
    }

    /**
     * Check if TMDB is configured
     */
    isConfigured(): boolean {
        return !!this.apiKey && this.apiKey.length > 0;
    }

    /**
     * Fetch popular movies from TMDB
     */
    async getPopularMovies(count: number = 20): Promise<Movie[]> {
        // Check cache first
        if (movieCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
            console.log('[TMDB] Returning cached movies');
            return movieCache.slice(0, count);
        }

        if (!this.isConfigured()) {
            console.log('[TMDB] API key not configured, using fallback');
            return [];
        }

        try {
            const movies: Movie[] = [];
            const pages = Math.ceil(count / 20);

            for (let page = 1; page <= pages && movies.length < count; page++) {
                const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=es-ES&page=${page}`;

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`TMDB API error: ${response.status}`);
                }

                const data = await response.json() as TMDBResponse;

                for (const tmdbMovie of data.results) {
                    if (movies.length >= count) break;

                    // Skip movies without poster
                    if (!tmdbMovie.poster_path) continue;

                    // Get full movie details for runtime and providers
                    const details = await this.getMovieDetails(tmdbMovie.id);

                    const movie: Movie = {
                        id: tmdbMovie.id,
                        title: tmdbMovie.title,
                        posterPath: `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}`,
                        rating: Math.round(tmdbMovie.vote_average * 10) / 10,
                        duration: details?.runtime || 120,
                        genres: this.mapGenres(tmdbMovie.genre_ids || []),
                        overview: tmdbMovie.overview || 'Sin descripción disponible.',
                        releaseYear: tmdbMovie.release_date
                            ? parseInt(tmdbMovie.release_date.split('-')[0])
                            : new Date().getFullYear(),
                        watchProviders: details?.watchProviders || []
                    };

                    movies.push(movie);
                }
            }

            // Update cache
            movieCache = movies;
            cacheTimestamp = Date.now();

            console.log(`[TMDB] Fetched ${movies.length} movies from API`);
            return movies;
        } catch (error) {
            console.error('[TMDB] Error fetching movies:', error);
            return [];
        }
    }

    /**
     * Get movie details (runtime and watch providers)
     */
    private async getMovieDetails(movieId: number): Promise<{
        runtime: number;
        watchProviders: { providerId: number; providerName: string; logoPath: string }[]
    } | null> {
        try {
            const url = `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=es-ES&append_to_response=watch/providers`;
            const response = await fetch(url);

            if (!response.ok) return null;

            const data = await response.json() as any;
            const providers = data['watch/providers']?.results?.ES?.flatrate || [];

            return {
                runtime: data.runtime || 120,
                watchProviders: providers.map((p: any) => ({
                    providerId: p.provider_id,
                    providerName: p.provider_name,
                    logoPath: `${TMDB_IMAGE_BASE}${p.logo_path}`
                }))
            };
        } catch {
            return null;
        }
    }

    /**
     * Search movies by query
     */
    async searchMovies(query: string, count: number = 20): Promise<Movie[]> {
        if (!this.isConfigured()) {
            console.log('[TMDB] API key not configured');
            return [];
        }

        try {
            const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=es-ES&query=${encodeURIComponent(query)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`TMDB API error: ${response.status}`);
            }

            const data = await response.json() as TMDBResponse;

            return data.results
                .filter(m => m.poster_path)
                .slice(0, count)
                .map(m => ({
                    id: m.id,
                    title: m.title,
                    posterPath: `${TMDB_IMAGE_BASE}${m.poster_path}`,
                    rating: Math.round(m.vote_average * 10) / 10,
                    duration: 120, // Default, would need separate call for runtime
                    genres: this.mapGenres(m.genre_ids || []),
                    overview: m.overview || 'Sin descripción disponible.',
                    releaseYear: m.release_date
                        ? parseInt(m.release_date.split('-')[0])
                        : new Date().getFullYear()
                }));
        } catch (error) {
            console.error('[TMDB] Error searching movies:', error);
            return [];
        }
    }

    /**
     * Get movies by genre
     */
    async getMoviesByGenre(genreId: number, count: number = 20): Promise<Movie[]> {
        if (!this.isConfigured()) return [];

        try {
            const url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=es-ES&with_genres=${genreId}&sort_by=popularity.desc`;
            const response = await fetch(url);

            if (!response.ok) return [];

            const data = await response.json() as TMDBResponse;
            const movies: Movie[] = [];

            for (const tmdbMovie of data.results) {
                if (movies.length >= count) break;
                if (!tmdbMovie.poster_path) continue;

                const details = await this.getMovieDetails(tmdbMovie.id);

                movies.push({
                    id: tmdbMovie.id,
                    title: tmdbMovie.title,
                    posterPath: `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}`,
                    rating: Math.round(tmdbMovie.vote_average * 10) / 10,
                    duration: details?.runtime || 120,
                    genres: this.mapGenres(tmdbMovie.genre_ids || []),
                    overview: tmdbMovie.overview || 'Sin descripción disponible.',
                    releaseYear: tmdbMovie.release_date
                        ? parseInt(tmdbMovie.release_date.split('-')[0])
                        : new Date().getFullYear(),
                    watchProviders: details?.watchProviders || []
                });
            }

            return movies;
        } catch (error) {
            console.error('[TMDB] Error fetching movies by genre:', error);
            return [];
        }
    }

    /**
     * Map genre IDs to names
     */
    private mapGenres(genreIds: number[]): string[] {
        return genreIds
            .slice(0, 3)
            .map(id => GENRE_MAP[id])
            .filter(Boolean);
    }

    /**
     * Clear movie cache
     */
    clearCache(): void {
        movieCache = null;
        cacheTimestamp = 0;
    }
}

export const tmdbService = new TMDBService();
