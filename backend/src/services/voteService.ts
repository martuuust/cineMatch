/**
 * CineMatch Backend - Vote Service
 * Business logic for voting and matching
 */

import { dataStore } from '../data/store';
import { MOCK_MOVIES } from '../data/movies';
import { tmdbService } from './tmdbService';
import {
    Vote, VoteType, RoomStatus,
    VotingResult, Movie, MatchingCompletePayload, MovieWithScore
} from '../types';
import { AppError, ErrorCode } from '../utils/errors';
import { calculateProgress } from '../utils/helpers';

// Movie cache - shared across all rooms for consistency
let movieCache: Movie[] | null = null;

// Map TMDB Genre IDs to Mock Data Genre Names (English)
const MOCK_GENRE_MAP: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
};

export class VoteService {
    private totalMovies: number = 20;

    /**
     * Initialize movies from TMDB or fallback to mock data
     */
    async initializeMovies(): Promise<Movie[]> {
        if (movieCache) {
            return movieCache;
        }

        // Try TMDB first
        if (tmdbService.isConfigured()) {
            try {
                console.log('[VoteService] Fetching movies from TMDB...');
                const tmdbMovies = await tmdbService.getPopularMovies(20);

                if (tmdbMovies.length >= 20) {
                    movieCache = tmdbMovies;
                    this.totalMovies = tmdbMovies.length;
                    console.log(`[VoteService] Loaded ${tmdbMovies.length} movies from TMDB`);
                    return movieCache;
                }
            } catch (error) {
                console.error('[VoteService] Failed to load movies from TMDB, falling back to mock data:', error);
            }
        }

        // Fallback to mock data
        console.log('[VoteService] Using mock movie data');
        movieCache = [...MOCK_MOVIES];
        this.totalMovies = MOCK_MOVIES.length;
        return movieCache;
    }

    /**
     * Get the current movie list
     */
    getMovies(): Movie[] {
        return movieCache || [...MOCK_MOVIES];
    }

    /**
     * Get total number of movies
     */
    getTotalMovies(): number {
        return this.totalMovies;
    }

    /**
     * Register a vote from a user
     */
    submitVote(
        roomCode: string,
        userId: string,
        movieId: number,
        voteType: VoteType
    ): { vote: Vote; progress: number; hasFinished: boolean } {
        // Get room
        const room = dataStore.getRoomByCode(roomCode);
        if (!room) {
            throw new AppError('Room not found', ErrorCode.ROOM_NOT_FOUND, 404);
        }

        // Check room status
        if (room.status !== RoomStatus.VOTING) {
            throw new AppError('Voting has not started or has finished', ErrorCode.VOTING_NOT_STARTED);
        }

        // Verify user belongs to room
        const user = dataStore.getUserById(userId);
        if (!user || user.roomId !== room.id) {
            throw new AppError('User not found in room', ErrorCode.USER_NOT_FOUND, 404);
        }

        // Check if user already finished
        if (user.hasFinished) {
            throw new AppError('User has already finished voting', ErrorCode.VOTING_ALREADY_FINISHED);
        }

        // Validate movie ID
        if (!room.movieIds.includes(movieId)) {
            throw new AppError('Invalid movie ID', ErrorCode.INVALID_MOVIE);
        }

        // Check for duplicate vote
        if (dataStore.hasUserVotedForMovie(userId, movieId)) {
            throw new AppError('Already voted for this movie', ErrorCode.DUPLICATE_VOTE);
        }

        // Create vote
        const vote = dataStore.createVote(userId, room.id, movieId, voteType);

        // Calculate progress
        const voteCount = dataStore.getUserVoteCount(userId);
        const progress = calculateProgress(voteCount, this.totalMovies);
        const hasFinished = voteCount >= this.totalMovies;

        // Update user progress
        dataStore.updateUserProgress(userId, progress, hasFinished);

        return { vote, progress, hasFinished };
    }

    /**
     * Get movies by genre
     */
    async getMoviesByGenre(genreId: number): Promise<Movie[]> {
        if (tmdbService.isConfigured()) {
            const movies = await tmdbService.getMoviesByGenre(genreId);
            if (movies.length > 0) {
                // We don't update the global cache here to avoid race conditions with other rooms
                // Instead, we just return the movies. 
                // Note: getMovieById will need to be able to find these movies.
                // For now, let's update the cache IF it's not set, or maybe we need a better strategy.
                // A better strategy is to let the room store the movies, but that requires data structure changes.
                // For this prototype, we can assume the cache might be overwritten or we append to it.
                // Let's append unique movies to cache.
                
                if (!movieCache) movieCache = [];
                
                const newMovies = movies.filter(m => !movieCache!.find(c => c.id === m.id));
                movieCache = [...movieCache, ...newMovies];
                
                return movies;
            }
        }

        // Fallback: Filter mock movies by genre
        const genreName = MOCK_GENRE_MAP[genreId];
        if (genreName) {
            const allMovies = this.getMovies();
            const filteredMovies = allMovies.filter(m => 
                m.genres && m.genres.some(g => g.toLowerCase() === genreName.toLowerCase())
            );
            
            if (filteredMovies.length > 0) {
                console.log(`[VoteService] Found ${filteredMovies.length} mock movies for genre ${genreName}`);
                return filteredMovies;
            }
        }

        return this.getMovies(); // Final Fallback
    }

    /**
     * Calculate matching results for a room
     */
    calculateResults(roomId: string): MatchingCompletePayload {
        const room = dataStore.getRoomById(roomId);
        if (!room) {
            throw new AppError('Room not found', ErrorCode.ROOM_NOT_FOUND, 404);
        }

        const users = dataStore.getUsersByRoom(roomId);
        const votes = dataStore.getVotesByRoom(roomId);
        const totalVoters = users.length;

        // Aggregate votes per movie
        const votesByMovie = new Map<number, { yes: number; total: number }>();

        for (const movieId of room.movieIds) {
            votesByMovie.set(movieId, { yes: 0, total: 0 });
        }

        for (const vote of votes) {
            const counts = votesByMovie.get(vote.movieId);
            if (counts) {
                counts.total++;
                if (vote.vote === VoteType.YES) {
                    counts.yes++;
                }
            }
        }

        // Calculate voting results
        const results: VotingResult[] = [];
        for (const [movieId, counts] of votesByMovie) {
            if (counts.total > 0) {
                results.push({
                    movieId,
                    yesCount: counts.yes,
                    totalVoters,
                    ratio: counts.yes / totalVoters
                });
            }
        }

        // Sort by ratio (descending)
        results.sort((a, b) => b.ratio - a.ratio);

        // Check for perfect matches (100% yes votes)
        // Improved logic: Find ALL perfect matches and pick the one with highest rating
        const perfectMatches = results.filter(r => r.ratio === 1 && r.yesCount === totalVoters);

        if (perfectMatches.length > 0) {
            // Sort by rating
            const perfectMatchMovies = perfectMatches
                .map(pm => this.getMovieById(pm.movieId))
                .filter((m): m is Movie => !!m)
                .sort((a, b) => b.rating - a.rating); // Highest rating first

            if (perfectMatchMovies.length > 0) {
                return {
                    type: 'perfect_match',
                    match: perfectMatchMovies[0],
                    otherMatches: perfectMatchMovies.slice(1)
                };
            }
        }

        // Return top 3 movies
        // Also improve top picks sorting: Ratio > YesVotes > Rating
        const topPicks: MovieWithScore[] = results
            .slice(0, 5) // Take top 5 candidates first
            .map(r => {
                const movie = this.getMovieById(r.movieId);
                return movie ? {
                    movie,
                    yesVotes: r.yesCount,
                    totalVotes: totalVoters,
                    ratio: r.ratio
                } : null;
            })
            .filter((m): m is MovieWithScore => m !== null)
            .sort((a, b) => {
                if (b.ratio !== a.ratio) return b.ratio - a.ratio;
                if (b.yesVotes !== a.yesVotes) return b.yesVotes - a.yesVotes;
                return b.movie.rating - a.movie.rating;
            })
            .slice(0, 3);

        return {
            type: 'top_picks',
            topPicks
        };
    }

    /**
     * Get movie by ID
     */
    getMovieById(movieId: number): Movie | undefined {
        const movies = this.getMovies();
        return movies.find(m => m.id === movieId);
    }

    /**
     * Get all movies (async version that ensures initialization)
     */
    async getAllMoviesAsync(): Promise<Movie[]> {
        if (!movieCache) {
            await this.initializeMovies();
        }
        return this.getMovies();
    }

    /**
     * Get all movies (sync version)
     */
    getAllMovies(): Movie[] {
        return this.getMovies();
    }

    /**
     * Get user's current progress
     */
    getUserProgress(userId: string): { progress: number; hasFinished: boolean } {
        const user = dataStore.getUserById(userId);
        if (!user) {
            throw new AppError('User not found', ErrorCode.USER_NOT_FOUND, 404);
        }
        return {
            progress: user.progress,
            hasFinished: user.hasFinished
        };
    }

    /**
     * Refresh movies from TMDB
     */
    async refreshMovies(): Promise<Movie[]> {
        movieCache = null;
        tmdbService.clearCache();
        return this.initializeMovies();
    }
}

export const voteService = new VoteService();
