/**
 * CineMatch - Application Context
 * Real-time state management with backend integration
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Room, Movie } from '../types';
import { api } from '../services/api';
import { socketService, MatchingCompletePayload, UserPublicInfo } from '../services/socket';

interface AppContextType {
  currentUser: User | null;
  currentRoom: Room | null;
  room: Room | null; // Alias for currentRoom
  movies: Movie[];
  createRoom: (userName: string, genreIds?: number[]) => Promise<boolean>;
  joinRoom: (roomCode: string, userName: string) => Promise<boolean>;
  leaveRoom: () => void;
  startVoting: () => void;
  submitVote: (movieId: number, vote: 'yes' | 'no') => void;
  votes: Record<number, number>;
  matchResult: MatchingCompletePayload | null;
  isConnected: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [matchResult, setMatchResult] = useState<MatchingCompletePayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load movies on mount
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const movieList = await api.getMovies();
        if (!Array.isArray(movieList)) {
          console.error('Invalid movie list received:', movieList);
          setMovies([]);
          return;
        }
        // Keep duration as number (minutes)
        const formattedMovies: Movie[] = movieList.map(m => ({
          ...m,
          releaseYear: m.releaseYear || 2024
        }));
        setMovies(formattedMovies);
      } catch (err) {
        console.error('Failed to load movies:', err);
        setError('Failed to load movies from server');
      }
    };
    loadMovies();
  }, []);

  // Setup socket callbacks when room/user changes
  useEffect(() => {
    if (currentRoom && currentUser) {
      socketService.updateCallbacks({
        onUserListUpdated: (users: UserPublicInfo[]) => {
          const mappedUsers: User[] = users.map(u => ({
            id: u.id,
            name: u.name,
            isHost: u.isHost,
            progress: u.progress,
            hasFinished: u.hasFinished
          }));
          setCurrentRoom(prev => prev ? { ...prev, users: mappedUsers } : null);
        },
        onVotingStarted: () => {
          setCurrentRoom(prev => prev ? { ...prev, status: 'voting' } : null);
        },
        onUserProgress: (data) => {
          setCurrentRoom(prev => {
            if (!prev) return null;
            const updatedUsers = prev.users.map(u =>
              u.id === data.userId
                ? { ...u, progress: data.progress, hasFinished: data.hasFinished }
                : u
            );
            return { ...prev, users: updatedUsers };
          });
          // Update current user progress
          if (data.userId === currentUser?.id) {
            setCurrentUser(prev => prev ? {
              ...prev,
              progress: data.progress,
              hasFinished: data.hasFinished
            } : null);
          }
        },
        onMatchingComplete: (result) => {
          setMatchResult(result);
          setCurrentRoom(prev => prev ? {
            ...prev,
            status: 'completed',
            matchingMovieId: result.match?.id
          } : null);
        },
        onError: (err) => {
          setError(err.error);
        }
      });
    }
  }, [currentRoom?.code, currentUser?.id]);

  const createRoom = useCallback(async (userName: string, genreIds?: number[]) => {
    try {
      setError(null);

      // Create room via API
      const { roomCode, userId } = await api.createRoom(userName, genreIds);

      // Fetch authoritative room state
      const roomDetails = await api.getRoom(roomCode);

      // Identify current user from the authoritative list
      const user = roomDetails.users.find((u: any) => u.id === userId) || {
        id: userId,
        name: userName,
        isHost: true,
        progress: 0,
        hasFinished: false
      };

      // Create local room state
      const newRoom: Room = {
        code: roomCode,
        users: roomDetails.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          isHost: u.isHost,
          progress: u.progress,
          hasFinished: u.hasFinished
        })),
        status: roomDetails.status,
        movieIds: roomDetails.movieIds
      };

      setCurrentUser(user);
      setCurrentRoom(newRoom);

      // Force update movies with the ones from the room
      if (roomDetails.movies && roomDetails.movies.length > 0) {
        setMovies(roomDetails.movies);
      }

      setVotes({});
      setMatchResult(null);

      // Connect to socket
      socketService.connect({
        onConnect: () => {
          setIsConnected(true);
          socketService.emitUserJoined(roomCode, userId);
        },
        onDisconnect: () => setIsConnected(false),
        onUserListUpdated: (users) => {
          const mappedUsers: User[] = users.map(u => ({
            id: u.id,
            name: u.name,
            isHost: u.isHost,
            progress: u.progress,
            hasFinished: u.hasFinished
          }));
          setCurrentRoom(prev => prev ? { ...prev, users: mappedUsers } : null);
        },
        onVotingStarted: () => {
          setCurrentRoom(prev => prev ? { ...prev, status: 'voting' } : null);
        },
        onUserProgress: (data) => {
          setCurrentRoom(prev => {
            if (!prev) return null;
            const updatedUsers = prev.users.map(u =>
              u.id === data.userId
                ? { ...u, progress: data.progress, hasFinished: data.hasFinished }
                : u
            );
            return { ...prev, users: updatedUsers };
          });
          if (data.userId === userId) {
            setCurrentUser(prev => prev ? {
              ...prev,
              progress: data.progress,
              hasFinished: data.hasFinished
            } : null);
          }
        },
        onMatchingComplete: (result) => {
          setMatchResult(result);
          setCurrentRoom(prev => prev ? {
            ...prev,
            status: 'completed',
            matchingMovieId: result.match?.id
          } : null);
        },
        onError: (err) => setError(err.error)
      });
      return true;
    } catch (err) {
      console.error('Failed to create room:', err);
      setError(err instanceof Error ? err.message : 'Failed to create room');
      return false;
    }
  }, []);

  const joinRoom = useCallback(async (roomCode: string, userName: string): Promise<boolean> => {
    try {
      setError(null);

      // Join room via API
      const { userId, movies: roomMovies } = await api.joinRoom(roomCode, userName);

      // Fetch authoritative room state
      const roomDetails = await api.getRoom(roomCode);

      // Identify current user
      const user = roomDetails.users.find((u: any) => u.id === userId) || {
        id: userId,
        name: userName,
        isHost: false,
        progress: 0,
        hasFinished: false
      };

      setCurrentUser(user);
      setCurrentRoom({
        code: roomCode.toUpperCase(),
        users: roomDetails.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          isHost: u.isHost,
          progress: u.progress,
          hasFinished: u.hasFinished
        })),
        status: roomDetails.status,
        movieIds: roomDetails.movieIds
      });

      // Force update movies with the ones from the room
      if (roomMovies && roomMovies.length > 0) {
        setMovies(roomMovies);
      } else if (roomDetails.movies && roomDetails.movies.length > 0) {
        setMovies(roomDetails.movies);
      }

      setVotes({});
      setMatchResult(null);

      // Connect to socket
      socketService.connect({
        onConnect: () => {
          setIsConnected(true);
          socketService.emitUserJoined(roomCode, userId);
        },
        onDisconnect: () => setIsConnected(false),
        onUserListUpdated: (users) => {
          const mappedUsers: User[] = users.map(u => ({
            id: u.id,
            name: u.name,
            isHost: u.isHost,
            progress: u.progress,
            hasFinished: u.hasFinished
          }));
          setCurrentRoom(prev => prev ? { ...prev, users: mappedUsers } : null);
        },
        onVotingStarted: () => {
          setCurrentRoom(prev => prev ? { ...prev, status: 'voting' } : null);
        },
        onUserProgress: (data) => {
          setCurrentRoom(prev => {
            if (!prev) return null;
            const updatedUsers = prev.users.map(u =>
              u.id === data.userId
                ? { ...u, progress: data.progress, hasFinished: data.hasFinished }
                : u
            );
            return { ...prev, users: updatedUsers };
          });
          if (data.userId === userId) {
            setCurrentUser(prev => prev ? {
              ...prev,
              progress: data.progress,
              hasFinished: data.hasFinished
            } : null);
          }
        },
        onMatchingComplete: (result) => {
          setMatchResult(result);
          setCurrentRoom(prev => prev ? {
            ...prev,
            status: 'completed',
            matchingMovieId: result.match?.id
          } : null);
        },
        onError: (err) => setError(err.error)
      });

      return true;
    } catch (err) {
      console.error('Failed to join room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room');
      return false;
    }
  }, []);

  const leaveRoom = useCallback(() => {
    socketService.disconnect();
    setCurrentUser(null);
    setCurrentRoom(null);
    setVotes({});
    setMatchResult(null);
    setIsConnected(false);
    setError(null);
  }, []);

  const startVoting = useCallback(() => {
    if (currentRoom && currentUser?.isHost) {
      socketService.emitStartVoting(currentRoom.code, currentUser.id);
    }
  }, [currentRoom, currentUser]);

  const submitVote = useCallback((movieId: number, vote: 'yes' | 'no') => {
    if (!currentRoom || !currentUser) return;

    // Emit vote to server
    socketService.emitVote(currentRoom.code, currentUser.id, movieId, vote);

    // Track local yes votes for display
    if (vote === 'yes') {
      setVotes(v => ({ ...v, [movieId]: (v[movieId] || 0) + 1 }));
    }
  }, [currentRoom, currentUser]);

  const displayedMovies = React.useMemo(() => {
    if (currentRoom?.movieIds && currentRoom.movieIds.length > 0) {
      return movies.filter(m => currentRoom.movieIds!.includes(m.id));
    }
    return movies;
  }, [movies, currentRoom?.movieIds]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRoom,
        room: currentRoom,
        movies: displayedMovies,
        createRoom,
        joinRoom,
        leaveRoom,
        startVoting,
        submitVote,
        votes,
        matchResult,
        isConnected,
        error
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
