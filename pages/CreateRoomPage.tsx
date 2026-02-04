
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Plus, Sparkles, Film, Heart, Skull, Laugh, Rocket, Drama, AlertCircle, Dices, Ghost, Gamepad2, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom, error } = useAppContext();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [genreIds, setGenreIds] = useState<number[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [userEmoji, setUserEmoji] = useState('😎');

  const EMOJIS = ['😎', '🎬', '🍿', '👻', '👽', '🤠', '🤖', '🐱', '🐶', '🦄', '🦁', '🐵'];

  const GENRES = [
    { id: 28, name: 'Acción', icon: Rocket, color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/50' },
    { id: 35, name: 'Comedia', icon: Laugh, color: 'from-yellow-400 to-orange-500', shadow: 'shadow-yellow-500/50' },
    { id: 18, name: 'Drama', icon: Drama, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-indigo-500/50' },
    { id: 27, name: 'Terror', icon: Skull, color: 'from-gray-600 to-gray-900', shadow: 'shadow-gray-500/50' },
    { id: 10749, name: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/50' },
    { id: 878, name: 'Ciencia Fic.', icon: Gamepad2, color: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/50' },
  ];

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    // Append emoji to name if it's not already there (optional, but fun)
    const displayName = `${userEmoji} ${name}`;
    
    const success = await createRoom(displayName, genreIds.length > 0 ? genreIds : undefined);
    if (success) {
      navigate('/waiting');
    } else {
      setLoading(false);
    }
  };

  const toggleGenre = (id: number) => {
    if (navigator.vibrate) navigator.vibrate(20);
    setGenreIds(prev =>
      prev.includes(id)
        ? prev.filter(g => g !== id)
        : [...prev, id]
    );
  };

  const handleRandomize = () => {
    if (isShuffling) return;
    setIsShuffling(true);
    if (navigator.vibrate) navigator.vibrate(50);
    
    let steps = 0;
    const maxSteps = 12;
    const interval = setInterval(() => {
      // Visual shuffle
      const randomGenre = GENRES[Math.floor(Math.random() * GENRES.length)];
      setGenreIds([randomGenre.id]);
      
      steps++;
      if (steps >= maxSteps) {
        clearInterval(interval);
        const count = Math.floor(Math.random() * 3) + 1;
        const shuffled = [...GENRES].sort(() => 0.5 - Math.random());
        setGenreIds(shuffled.slice(0, count).map(g => g.id));
        setIsShuffling(false);
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
      }
    }, 100);
  };

  const cycleEmoji = () => {
    const idx = EMOJIS.indexOf(userEmoji);
    setUserEmoji(EMOJIS[(idx + 1) % EMOJIS.length]);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  // Determine dynamic header content
  const getHeaderContent = () => {
    if (genreIds.length === 0) return { icon: Plus, color: 'from-indigo-500 to-purple-600', text: 'Crear Sala' };
    if (genreIds.length > 1) return { icon: Sparkles, color: 'from-pink-500 to-cyan-500', text: 'Mix de Películas' };
    
    const genre = GENRES.find(g => g.id === genreIds[0]);
    return genre 
      ? { icon: genre.icon, color: genre.color, text: `Sala de ${genre.name}` }
      : { icon: Plus, color: 'from-indigo-500 to-purple-600', text: 'Crear Sala' };
  };

  const headerData = getHeaderContent();
  const HeaderIcon = headerData.icon;

  return (
    <div className="h-[100dvh] p-4 flex flex-col relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
      </div>

      {/* Back Button */}
      <div className="mb-2 z-10">
        <button
          onClick={() => navigate('/')}
          className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full z-10">
        {/* Dynamic Header */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          key={headerData.text} // Re-animate on change
        >
          <motion.div 
            className={`w-20 h-20 bg-gradient-to-br ${headerData.color} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl animate-float relative group`}
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <HeaderIcon className="w-10 h-10 text-white drop-shadow-md z-10" />
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight drop-shadow-lg">
            {headerData.text}
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {genreIds.length === 0 ? "Elige tu aventura cinematográfica" : "¡Buena elección!"}
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-4 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl overflow-visible">
            <div className="space-y-6">
              {/* Name Input with Emoji Picker */}
              <div className="relative group">
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Tu Identidad
                </label>
                <div className="relative flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={cycleEmoji}
                    className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-2xl hover:bg-white/10 transition-colors cursor-pointer select-none"
                  >
                    {userEmoji}
                  </motion.button>
                  <Input
                    placeholder="Tu nombre..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl focus:ring-indigo-500/50 text-base font-medium pl-4"
                  />
                </div>
              </div>

              {/* Genre Selection */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Géneros <span className="text-slate-500 ml-1 font-normal lowercase">(opcional)</span>
                  </label>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRandomize}
                    disabled={isShuffling}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-lg border border-white/10
                      ${isShuffling 
                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-400/50' 
                        : 'text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-white'}`}
                  >
                    <Dices className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
                    {isShuffling ? 'Mezclando...' : 'Sorpréndeme'}
                  </motion.button>
                </div>
                
                <div className="grid grid-cols-3 gap-2.5">
                  {GENRES.map((g, index) => {
                    const isSelected = genreIds.includes(g.id);
                    return (
                      <motion.button
                        key={g.id}
                        onClick={() => toggleGenre(g.id)}
                        className={`relative h-28 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 overflow-hidden group 
                          ${isSelected
                          ? `bg-gradient-to-br ${g.color} border-transparent shadow-lg ${g.shadow} scale-[1.02] ring-1 ring-white/30 z-10`
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div className={`p-2.5 rounded-full transition-colors duration-300 
                          ${isSelected ? 'bg-white/20 shadow-inner' : 'bg-white/5 group-hover:bg-white/10'}`}>
                          <g.icon className={`w-8 h-8 transition-colors duration-300 
                            ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
                        </div>
                        <span className={`text-xs font-bold transition-colors duration-300 
                          ${isSelected ? 'text-white drop-shadow-md' : 'text-slate-400 group-hover:text-slate-300'}`}>
                          {g.name}
                        </span>
                        
                        {/* Dynamic Glow effect for selected */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-50 mix-blend-overlay" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Create Button */}
              <Button
                fullWidth
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                isLoading={loading}
                size="lg"
                className={`
                  h-14 text-lg font-bold shadow-xl transition-all duration-300
                  ${!name.trim() 
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-purple-600 shadow-indigo-500/30 animate-pulse-glow'}
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  {loading ? (
                    'Preparando...'
                  ) : (
                    <>
                      <Film className="w-5 h-5" />
                      <span>Comenzar Aventura</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
