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
  createRoom: (userName: string, genreIds?: number[]) => Promise<{ room: Room; user: User }>;
  joinRoom: (roomCode: string, userName: string) => Promise<{ room: Room; user: User }>;
  leaveRoom: () => Promise<void>;
  startVoting: (roomCode?: string, userId?: string | number) => void;
  submitVote: (movieId: number, vote: 'yes' | 'no') => void;
  votes: Record<number, number>;
  matchResult: MatchingCompletePayload | null;
  isConnected: boolean;
  isInitializing: boolean;
  error: string | null;
  refreshRoom: () => Promise<void>;
  forceFinishVoting: () => void;
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
  const [isInitializing, setIsInitializing] = useState(true);

  // Constants
  const SESSION_KEY = 'cinematch_session';

  // Helper to setup room state and socket connection
  const initializeRoomSession = useCallback((roomDetails: any, userId: number, initialMovies?: Movie[]) => {
    // Identify current user
    const userData = roomDetails.users.find((u: any) => u.id === userId);

    // Construct user object carefully to ensure isHost is preserved
    const user = {
      id: userId,
      name: userData ? userData.name : 'User',
      isHost: userData ? userData.isHost : false, // CRITICAL: Explicitly take isHost from server data
      progress: userData ? userData.progress : 0,
      hasFinished: userData ? userData.hasFinished : false
    };

    // Map room data
    const roomState: Room = {
      code: roomDetails.code,
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

    // Update state
    setCurrentUser(user);
    setCurrentRoom(roomState);

    // Update movies if provided or in room details
    if (initialMovies && initialMovies.length > 0) {
      setMovies(initialMovies);
    } else if (roomDetails.movies && roomDetails.movies.length > 0) {
      setMovies(roomDetails.movies);
    }

    setVotes({});
    setMatchResult(null);

    // Persist session
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      roomCode: roomDetails.code,
      userId: userId
    }));

    // Socket setup
    const socketCallbacks = {
      onConnect: () => {
        setIsConnected(true);
        socketService.emitUserJoined(roomDetails.code, userId);
      },
      onDisconnect: () => setIsConnected(false),
      onUserListUpdated: (users: any[]) => {
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
      onUserProgress: (data: any) => {
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
      onMatchingComplete: (result: any) => {
        setMatchResult(result);
        setCurrentRoom(prev => prev ? {
          ...prev,
          status: 'completed',
          matchingMovieId: result.match?.id
        } : null);
      },
      onError: (err: any) => {
        setError(err.error);
      }
    };

    if (socketService.isConnected()) {
      socketService.updateCallbacks(socketCallbacks);
      socketService.emitUserJoined(roomDetails.code, userId);
      setIsConnected(true);
    } else {
      socketService.connect(socketCallbacks);
    }

    return { room: roomState, user };
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) {
        setIsInitializing(false);
        return;
      }

      try {
        const { roomCode, userId } = JSON.parse(session);
        // If already connected to this room, skip
        if (currentRoom?.code === roomCode && currentUser?.id === userId) {
          setIsInitializing(false);
          return;
        }

        console.log('Restoring session for room:', roomCode);
        const roomDetails = await api.getRoom(roomCode);

        // Verify user exists in room
        const userExists = roomDetails.users.some((u: any) => u.id === userId);
        if (!userExists) {
          console.warn('User not found in room, clearing session');
          localStorage.removeItem(SESSION_KEY);
          setIsInitializing(false);
          return;
        }

        initializeRoomSession(roomDetails, userId);
      } catch (err) {
        console.error('Failed to restore session:', err);
        // Do NOT clear session immediately if it's a temporary network error
        if (err instanceof Error && (err.message.includes('tiempo') || err.message.includes('Gateway'))) {
          setError('Error de conexión al restaurar sesión. Recarga la página.');
          // Keep session in localStorage so they can try again by reloading
        } else {
          // If 404 or other permanent error, clear session
          localStorage.removeItem(SESSION_KEY);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []); // Run once on mount

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
        setError('Error al cargar películas del servidor');
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

  const refreshRoom = useCallback(async () => {
    if (!currentRoom?.code) return;
    try {
      const roomDetails = await api.getRoom(currentRoom.code);
      setCurrentRoom(prev => {
        if (!prev) return null;
        // Merge users to keep local state if needed, but for now just update list
        const mappedUsers: User[] = roomDetails.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          isHost: u.isHost,
          progress: u.progress,
          hasFinished: u.hasFinished
        }));

        // Only update if something changed to avoid re-renders (simple check)
        if (JSON.stringify(prev.users) !== JSON.stringify(mappedUsers) || prev.status !== roomDetails.status) {
          return {
            ...prev,
            users: mappedUsers,
            status: roomDetails.status,
            movieIds: roomDetails.movieIds
          };
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to refresh room:', err);
    }
  }, [currentRoom?.code]);

  const createRoom = useCallback(async (userName: string, genreIds?: number[]) => {
    try {
      setError(null);

      // Create room via API
      const { roomCode, userId } = await api.createRoom(userName, genreIds);

      // Fetch authoritative room state
      const roomDetails = await api.getRoom(roomCode);

      return initializeRoomSession(roomDetails, userId);
    } catch (err) {
      console.error('Failed to join room:', err);
      // Pass the actual error message from API
      const errorMessage = err instanceof Error ? err.message : 'Error al unirse a la sala';
      setError(errorMessage);
      throw err; // Propagate error so component can see it immediately
    }
  }, [initializeRoomSession]);

  const joinRoom = useCallback(async (roomCode: string, userName: string): Promise<{ room: Room; user: User }> => {
    try {
      setError(null);

      // Join room via API
      const { userId, movies: roomMovies } = await api.joinRoom(roomCode, userName);

      // Fetch authoritative room state
      const roomDetails = await api.getRoom(roomCode);

      return initializeRoomSession(roomDetails, userId, roomMovies);
    } catch (err) {
      console.error('Failed to join room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room');
      throw err;
    }
  }, [initializeRoomSession]);

  const leaveRoom = useCallback(async () => {
    if (currentRoom && currentUser) {
      await socketService.emitLeaveRoom(currentRoom.code, currentUser.id);
    }

    socketService.disconnect();
    setCurrentUser(null);
    setCurrentRoom(null);
    setVotes({});
    setMatchResult(null);
    setIsConnected(false);
    setError(null);
    localStorage.removeItem(SESSION_KEY);
  }, [currentRoom, currentUser]);

  const startVoting = useCallback((roomCodeOverride?: string, userIdOverride?: string | number) => {
    const code = roomCodeOverride || currentRoom?.code;
    const uid = userIdOverride || currentUser?.id;

    // We allow proceeding if we have the IDs, even if context local isHost check is skipped
    // The backend will validate isHost anyway.
    if (code && uid) {
      socketService.emitStartVoting(code, uid);
    } else {
      console.warn("startVoting called but missing roomCode or userId", { code, uid });
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

  const forceFinishVoting = useCallback(() => {
    if (currentRoom && currentUser?.isHost) {
      socketService.emitForceFinishVoting(currentRoom.code, currentUser.id);
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
        isInitializing,
        error,
        refreshRoom,
        forceFinishVoting
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
