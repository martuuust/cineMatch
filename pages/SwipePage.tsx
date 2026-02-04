import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Info, Star, Film } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';

interface DraggableCardProps {
    movie: any;
    onVote: (vote: 'yes' | 'no') => void;
    showInfo: boolean;
    setShowInfo: (show: boolean) => void;
}

export interface DraggableCardRef {
    swipe: (dir: 'left' | 'right') => Promise<void>;
}

const DraggableCard = forwardRef<DraggableCardRef, DraggableCardProps>(({ movie, onVote, showInfo, setShowInfo }, ref) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  useImperativeHandle(ref, () => ({
    swipe: async (dir) => {
        if (dir === 'right') {
            await controls.start({ x: window.innerWidth + 200, rotate: 20, opacity: 0 });
            onVote('yes');
        } else {
            await controls.start({ x: -window.innerWidth - 200, rotate: -20, opacity: 0 });
            onVote('no');
        }
    }
  }));

  useEffect(() => {
    controls.start({ opacity: 1, scale: 1 });
  }, [controls]);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const swipeThreshold = 500;

    if (info.offset.x > threshold || velocity > swipeThreshold) {
      // Swipe Right
      await controls.start({ x: window.innerWidth + 200, rotate: 20, opacity: 0 });
      onVote('yes');
    } else if (info.offset.x < -threshold || velocity < -swipeThreshold) {
      // Swipe Left
      await controls.start({ x: -window.innerWidth - 200, rotate: -20, opacity: 0 });
      onVote('no');
    } else {
      // Spring back
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div
      className="w-full max-w-md h-full max-h-[550px] relative cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragElastic={1}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={controls}
    >
            {/* LIKE Indicator */}
            <motion.div
                className="absolute top-10 left-8 border-4 border-green-500 text-green-500 rounded-2xl px-6 py-3 text-4xl font-black uppercase tracking-widest rotate-[-15deg] z-50 bg-black/20 backdrop-blur-md shadow-xl shadow-green-500/20"
                style={{ opacity: likeOpacity }}
            >
                LIKE
            </motion.div>

            {/* NOPE Indicator */}
            <motion.div
                className="absolute top-10 right-8 border-4 border-red-500 text-red-500 rounded-2xl px-6 py-3 text-4xl font-black uppercase tracking-widest rotate-[15deg] z-50 bg-black/20 backdrop-blur-md shadow-xl shadow-red-500/20"
                style={{ opacity: nopeOpacity }}
            >
                NOPE
            </motion.div>

            {/* Main Card */}
            <Card
                noPadding
                className="w-full h-full bg-slate-900 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col relative border border-white/10 ring-1 ring-white/5"
            >
                {/* Movie Image */}
                <div className="relative flex-1 bg-slate-900 overflow-hidden group">
                <img
                    src={movie.posterPath}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />

            {/* Rating Badge */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold border border-white/10">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 star-glow" />
                <span>{movie.rating}</span>
            </div>

            {/* Info Button */}
            <button
                onClick={() => setShowInfo(!showInfo)}
                className="absolute top-4 left-4 p-3 bg-black/60 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/20 transition-colors"
            >
                <Info className="w-5 h-5" />
            </button>

            {/* Movie Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10">
                <h2 className="text-4xl font-black leading-tight mb-4 drop-shadow-2xl tracking-tight">
                {movie.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/10 shadow-lg">
                        {movie.releaseYear}
                    </span>
                    <span className="px-3 py-1 bg-indigo-500/80 backdrop-blur-md rounded-lg border border-indigo-400/30 shadow-lg shadow-indigo-500/20">
                        {movie.genres.slice(0, 2).join(' / ')}
                    </span>
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                        {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                    </span>
                </div>
            </div>
            </div>

            {/* Info Overlay */}
            <AnimatePresence>
            {showInfo && (
                <motion.div
                className="absolute inset-0 bg-black/95 backdrop-blur-xl z-20 p-6 flex flex-col overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">Sinopsis</h3>
                    <button
                    onClick={() => setShowInfo(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                    <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>
                <p className="text-slate-300 leading-relaxed mb-6">
                    {movie.overview}
                </p>
                <div className="mt-auto">
                    <h4 className="font-bold text-white mb-3">Géneros</h4>
                    <div className="flex flex-wrap gap-2">
                    {movie.genres.map((g: string) => (
                        <span key={g} className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium border border-white/10">
                        {g}
                        </span>
                    ))}
                    </div>
                </div>
                </motion.div>
            )}
            </AnimatePresence>
        </Card>
    </motion.div>
  );
});

DraggableCard.displayName = 'DraggableCard';

const SwipePage: React.FC = () => {
  const navigate = useNavigate();
  const { room, currentUser, movies, submitVote, userProgress } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const cardRef = useRef<DraggableCardRef>(null);

  useEffect(() => {
    if (userProgress && userProgress.hasFinished) {
      if (room?.status === 'finished') {
        navigate('/results');
      }
    }
  }, [userProgress, room, navigate]);

  useEffect(() => {
    if (room?.status === 'finished' || room?.status === 'completed') {
      navigate('/results');
    }
  }, [room?.status, navigate]);

  const handleVote = async (voteType: 'yes' | 'no') => {
    if (!movies || movies.length === 0 || currentIndex >= movies.length) return;

    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(voteType === 'yes' ? [50] : [30, 20, 30]);
    }

    const movieId = movies[currentIndex].id;
    
    // Optimistic update
    setCurrentIndex(prev => prev + 1);
    setShowInfo(false);
    
    // Submit vote in background
    submitVote(movieId, voteType).catch(err => {
      console.error('Vote submission failed:', err);
    });
  };

  const handleButtonVote = (voteType: 'yes' | 'no') => {
      if (cardRef.current) {
          cardRef.current.swipe(voteType === 'yes' ? 'right' : 'left');
      } else {
          // Fallback if ref is not available
          handleVote(voteType);
      }
  };

  // Loading state
  if (!room || !currentUser || !movies || movies.length === 0) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6 relative">
        <div className="animated-bg">
          <div className="floating-orb orb-1" />
          <div className="floating-orb orb-2" />
        </div>
        <div className="text-center z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Film className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-400">Cargando películas...</p>
        </div>
      </div>
    );
  }

  // Finished voting state
  if (currentIndex >= movies.length || (userProgress && userProgress.hasFinished)) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="animated-bg">
          <div className="floating-orb orb-1" />
          <div className="floating-orb orb-2" />
        </div>

        <motion.div
          className="z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 animate-pulse-glow">
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </div>
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ¡Has terminado!
        </motion.h2>
        <motion.p
          className="text-slate-400 mb-8 max-w-xs mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Esperando a que el resto termine de votar...
        </motion.p>

        {/* Progress Bars */}
        <motion.div
          className="w-full max-w-sm bg-white/5 p-6 rounded-2xl backdrop-blur-xl border border-white/10 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 text-left">
            Progreso del Grupo
          </h3>
          <div className="space-y-4">
            {room.users.map(u => (
              <div key={u.id} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className={u.id === currentUser.id ? 'text-indigo-400' : 'text-white'}>
                    {u.name} {u.id === currentUser.id && '(Tú)'}
                  </span>
                  <span className="text-slate-400">
                    {u.hasFinished ? (
                      <span className="text-green-400">✓ Listo</span>
                    ) : (
                      `${Math.round(u.progress || 0)}%`
                    )}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${u.hasFinished ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'progress-bar'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${u.progress || 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];
  const progress = ((currentIndex) / movies.length) * 100;

  return (
    <div className="h-[100dvh] w-full flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
      </div>

      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex justify-between items-center z-10">
        <div className="text-sm font-bold text-slate-400">
          <span className="text-white text-xl">{currentIndex + 1}</span>
          <span className="mx-1">/</span>
          {movies.length}
        </div>

        {/* Progress bar */}
        <div className="flex-1 mx-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full progress-bar rounded-full"
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-400 border border-indigo-500/30 font-mono">
          {room.code}
        </div>
      </div>

      {/* Card Container */}
      <div className="flex-1 px-4 pb-4 flex flex-col justify-center items-center min-h-0 relative z-10">
        <AnimatePresence mode="wait">
            <DraggableCard 
                key={currentMovie.id}
                ref={cardRef}
                movie={currentMovie}
                onVote={handleVote}
                showInfo={showInfo}
                setShowInfo={setShowInfo}
            />
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-6 pb-8 pt-4 flex justify-center items-center gap-8 z-10">
        <motion.button
          onClick={() => handleButtonVote('no')}
          className="w-[72px] h-[72px] rounded-full bg-white/5 backdrop-blur-md border-2 border-red-500/50 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/10"
          whileHover={{ scale: 1.1, borderColor: 'rgba(239, 68, 68, 1)' }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-8 h-8" strokeWidth={3} />
        </motion.button>

        <motion.button
          onClick={() => handleButtonVote('yes')}
          className="w-[72px] h-[72px] rounded-full bg-white/5 backdrop-blur-md border-2 border-green-500/50 flex items-center justify-center text-green-500 shadow-lg shadow-green-500/10"
          whileHover={{ scale: 1.1, borderColor: 'rgba(34, 197, 94, 1)' }}
          whileTap={{ scale: 0.9 }}
        >
          <Check className="w-8 h-8" strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
};

export default SwipePage;
