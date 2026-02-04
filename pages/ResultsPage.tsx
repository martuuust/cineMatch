
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PartyPopper, RefreshCw, Home, Heart, Star, AlertCircle, PlayCircle, Info, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Confetti component
const Confetti: React.FC = () => {
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#14b8a6', '#f59e0b', '#ef4444', '#22c55e'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 10 + 5,
    duration: Math.random() * 2 + 2
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
          initial={{ top: -20, rotate: 0, opacity: 1 }}
          animate={{
            top: '100vh',
            rotate: 720,
            opacity: 0
          }}
          transition={{
            duration: piece.duration,
            delay: parseFloat(piece.delay),
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
};

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { room, movies, leaveRoom, matchResult } = useAppContext();
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!room) {
    navigate('/');
    return null;
  }

  // Unified Results Logic
  const getResults = () => {
    if (matchResult?.type === 'perfect_match') {
      const match = matchResult.match;
      const others = matchResult.otherMatches || [];
      return match ? [match, ...others] : [];
    }
    if (matchResult?.type === 'top_picks') {
      return matchResult.topPicks.map(tp => tp.movie);
    }
    // Fallback for legacy/error states
    const match = movies.find(m => m.id === room?.matchingMovieId);
    return match ? [match] : [];
  };

  const results = getResults();
  const primaryMatch = results[0];
  const otherMatches = results.slice(1);
  const isPerfectMatch = matchResult?.type === 'perfect_match';

  // Determine which movie to display
  const displayMovie = selectedMovieId
    ? (otherMatches.find(m => m.id === selectedMovieId) || primaryMatch)
    : primaryMatch;

  const isShowingPrimary = displayMovie.id === primaryMatch?.id;

  // Reset selection when results change
  useEffect(() => {
    setSelectedMovieId(null);
  }, [matchResult]);

  if (!displayMovie) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6 relative">
        <div className="text-center z-10">
          <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-white">No hay resultados aún</h2>
          <p className="text-slate-400 mb-6">Esperando a que termine la votación...</p>
          <Button onClick={() => navigate('/')} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Home className="mr-2 w-4 h-4" /> Inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col relative overflow-hidden bg-slate-950">
      {/* Background Orbs (Static) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" style={{ background: isPerfectMatch ? 'rgba(34, 197, 94, 0.2)' : undefined }} />
      </div>

      {/* Confetti Effect */}
      {showConfetti && <Confetti />}

      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pt-8 pb-4 px-6 text-center z-10 shrink-0"
      >
        <motion.div
          className="flex items-center justify-center gap-3 mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          {isPerfectMatch ? (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse-glow">
              <Trophy className="w-7 h-7 text-white" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <PartyPopper className="w-7 h-7 text-white" />
            </div>
          )}
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-white mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isShowingPrimary
            ? (isPerfectMatch ? "¡Es un Match!" : "Mejor Opción")
            : "Otra Coincidencia"
          }
        </motion.h1>

        {isShowingPrimary && otherMatches.length > 0 && (
          <motion.div
            className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-white/5 py-2 px-4 rounded-full inline-flex backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Elegida por mejor valoración entre {results.length} coincidencias</span>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content - Movie Card */}
      <div className="flex-1 px-4 pb-4 flex flex-col justify-center items-center min-h-0 z-10">
        <motion.div
          key={displayMovie.id}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md h-full max-h-[500px]"
        >
          <Card noPadding className="bg-slate-900 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-full border border-white/10">

            {/* Movie Poster */}
            <div className="relative h-48 shrink-0 bg-slate-800 overflow-hidden">
              <img
                src={displayMovie.posterPath}
                alt={displayMovie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

              {/* Match Badge */}
              <motion.div
                className="absolute top-4 right-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className={`${isShowingPrimary
                  ? (isPerfectMatch ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600')
                  : 'bg-slate-600'
                  } text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2`}
                >
                  <Heart className="w-4 h-4 fill-white" />
                  {isShowingPrimary
                    ? (isPerfectMatch ? '100% Match' : 'Top Pick')
                    : 'Coincidencia'
                  }
                </div>
              </motion.div>
            </div>

            {/* Movie Info - SCROLLABLE CONTENT */}
            <div className="p-5 flex flex-col gap-4 overflow-y-auto relative -mt-8 bg-slate-900 rounded-t-3xl flex-1 custom-scrollbar">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-white leading-tight pr-4">{displayMovie.title}</h2>
                  <div className="flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30 shrink-0">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 star-glow" />
                    <span className="font-bold text-yellow-400">{displayMovie.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-slate-400 font-medium">
                  <span>{displayMovie.releaseYear}</span>
                  <span>•</span>
                  <span>{typeof displayMovie.duration === 'number' ? `${Math.floor(displayMovie.duration / 60)}h ${displayMovie.duration % 60}m` : displayMovie.duration}</span>
                  <span>•</span>
                  <span className="truncate max-w-[150px]">{displayMovie.genres?.join(', ')}</span>
                </div>
              </div>

              {/* Watch Providers - ALWAYS VISIBLE */}
              {displayMovie.watchProviders && displayMovie.watchProviders.length > 0 ? (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
                  <div className="flex items-center gap-2 mb-3 text-slate-300">
                    <PlayCircle className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Disponible en</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {displayMovie.watchProviders.map((provider) => (
                      <motion.div
                        key={provider.providerId}
                        className="group relative"
                        whileHover={{ scale: 1.1 }}
                      >
                        <img
                          src={provider.logoPath}
                          alt={provider.providerName}
                          className="w-10 h-10 rounded-lg shadow-sm border border-white/10 provider-logo"
                          title={provider.providerName}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center text-slate-500 text-sm shrink-0">
                  No hay información de streaming disponible
                </div>
              )}

              <p className="text-sm text-slate-400 leading-relaxed">
                {displayMovie.overview}
              </p>

              {/* Voted by */}
              <div className="pt-3 border-t border-white/10 shrink-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Votado sí por:</p>
                <div className="flex -space-x-2">
                  {room?.users.map((u, index) => (
                    <motion.div
                      key={u.id}
                      className="border-2 border-slate-900 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Other Matches Horizontal Carousel */}
      {otherMatches.length > 0 && (
        <motion.div
          className="px-6 pb-2 shrink-0 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Otras coincidencias</p>
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
            <button
              onClick={() => setSelectedMovieId(null)}
              className={`shrink-0 w-14 snap-start transition-all rounded-lg overflow-hidden ${isShowingPrimary ? 'ring-2 ring-indigo-500 opacity-100' : 'opacity-50'}`}
            >
              <img src={primaryMatch?.posterPath} className="w-14 h-20 object-cover bg-slate-700" alt="Primary" />
            </button>
            {otherMatches.map(movie => (
              <button
                key={movie.id}
                onClick={() => setSelectedMovieId(movie.id)}
                className={`shrink-0 w-14 snap-start transition-all rounded-lg overflow-hidden ${selectedMovieId === movie.id ? 'ring-2 ring-indigo-500 opacity-100' : 'opacity-50'}`}
              >
                <img src={movie.posterPath} className="w-14 h-20 object-cover bg-slate-700" alt={movie.title} />
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Footer Actions */}
      <motion.div
        className="p-6 pt-3 shrink-0 z-10 grid grid-cols-2 gap-4 w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          variant="outline"
          fullWidth
          onClick={() => navigate('/swipe')}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className="mr-2 w-4 h-4" /> Otra vez
        </Button>
        <Button
          fullWidth
          onClick={() => { leaveRoom(); navigate('/'); }}
          className="bg-gradient-to-r from-indigo-500 to-purple-600"
        >
          <Home className="mr-2 w-4 h-4" /> Inicio
        </Button>
      </motion.div>
    </div>
  );
};

export default ResultsPage;
