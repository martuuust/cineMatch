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
    <div className="h-[100dvh] flex flex-col relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" style={{ background: isPerfectMatch ? 'rgba(34, 197, 94, 0.2)' : undefined }} />
      </div>

      {showConfetti && <Confetti />}

      {/* Main Layout - Split for Desktop, Stacked for Mobile - No Page Scroll */}
      <div className="flex-1 flex flex-col md:flex-row relative z-10 w-full h-full p-4 gap-4 max-w-6xl mx-auto">

        {/* Left/Top: Visuals & Header */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header Badge */}
          <div className="text-center mb-4 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-block"
            >
              {isPerfectMatch ? (
                <div className="bg-gradient-to-r from-green-400 to-emerald-600 text-white px-6 py-2 rounded-full font-black text-lg shadow-lg shadow-green-500/30 flex items-center gap-2 animate-pulse-glow">
                  <PartyPopper className="w-5 h-5" />
                  ¡IT'S A MATCH!
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-400 to-orange-600 text-white px-6 py-2 rounded-full font-black text-lg shadow-lg shadow-orange-500/30 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-current" />
                  TOP PICKS
                </div>
              )}
            </motion.div>
          </div>

          {/* Poster Card */}
          <div className="flex-1 relative min-h-0 flex justify-center items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={displayMovie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="relative h-full max-h-[50vh] md:max-h-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group"
              >
                <img
                  src={displayMovie.posterPath}
                  alt={displayMovie.title}
                  className="w-full h-full object-cover"
                />

                {/* Winner Badge */}
                {isShowingPrimary && isPerfectMatch && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-1">
                      <Trophy className="w-3 h-3 fill-current" /> WINNER
                    </span>
                  </div>
                )}

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold border border-white/10 shadow-lg z-10">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{displayMovie.rating}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Other Matches Carousel (Compact) */}
          {otherMatches.length > 0 && (
            <div className="mt-4 flex-shrink-0 h-24">
              <div className="flex gap-3 overflow-x-auto pb-2 h-full items-center justify-center snap-x hide-scrollbar px-2">
                <button
                  onClick={() => setSelectedMovieId(null)}
                  className={`
                      relative flex-shrink-0 h-20 aspect-[2/3] rounded-lg overflow-hidden snap-center transition-all duration-200
                      ${isShowingPrimary ? 'ring-2 ring-green-500 scale-105 z-10' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}
                    `}
                >
                  <img src={primaryMatch?.posterPath} className="w-full h-full object-cover" alt="Winner" />
                </button>

                {otherMatches.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => setSelectedMovieId(movie.id)}
                    className={`
                      relative flex-shrink-0 h-20 aspect-[2/3] rounded-lg overflow-hidden snap-center transition-all duration-200
                      ${selectedMovieId === movie.id ? 'ring-2 ring-indigo-500 scale-105 z-10' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}
                    `}
                  >
                    <img src={movie.posterPath} className="w-full h-full object-cover" alt={movie.title} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right/Bottom: Details & Info */}
        <div className="flex-1 flex flex-col min-h-0 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <h1 className="text-3xl font-black text-white leading-tight mb-2">
              {displayMovie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white border border-white/5">
                {displayMovie.releaseYear}
              </span>
              <span className="px-2 py-1 bg-indigo-500/30 text-indigo-200 rounded-md text-xs font-bold border border-indigo-500/20">
                {displayMovie.genres.join(', ')}
              </span>
              <span className="px-2 py-1 bg-white/10 rounded-md text-xs font-bold text-white border border-white/5">
                {Math.floor(displayMovie.duration / 60)}h {displayMovie.duration % 60}m
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {displayMovie.overview}
            </p>

            {/* Providers - Always Visible */}
            {displayMovie.watchProviders && displayMovie.watchProviders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Disponible en</h3>
                <div className="flex flex-wrap gap-3">
                  {displayMovie.watchProviders.map((provider: any) => (
                    <div key={provider.providerId} className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg border border-white/5">
                      {provider.logoPath && (
                        <img
                          src={provider.logoPath}
                          alt={provider.providerName}
                          className="w-6 h-6 rounded-md"
                        />
                      )}
                      <span className="text-xs font-medium text-slate-300">{provider.providerName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed at bottom of panel */}
          <div className="pt-4 mt-auto border-t border-white/10 grid grid-cols-2 gap-3">
            <Button
              className="bg-white text-slate-900 hover:bg-slate-200"
              icon={<PlayCircle className="w-4 h-4" />}
              onClick={() => {
                if (displayMovie.watchUrl) {
                  window.open(displayMovie.watchUrl, '_blank');
                } else {
                  window.open(`https://www.google.com/search?q=ver+${encodeURIComponent(displayMovie.title)}+online`, '_blank');
                }
              }}
            >
              Ver Ahora
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => {
                leaveRoom();
                navigate('/');
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultsPage;