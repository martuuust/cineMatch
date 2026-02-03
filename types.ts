
export interface Movie {
  id: number;
  title: string;
  posterPath: string;
  rating: number;
  duration: number;
  genres: string[];
  overview: string;
  releaseYear: number;
  watchProviders?: {
    providerId: number;
    providerName: string;
    logoPath: string;
  }[];
}

export interface User {
  id: string;
  name: string;
  isHost: boolean;
  progress: number;
  hasFinished: boolean;
}

export interface Room {
  code: string;
  users: User[];
  status: 'waiting' | 'voting' | 'completed';
  matchingMovieId?: number;
  movieIds?: number[];
}
