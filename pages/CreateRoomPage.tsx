import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Plus, Sparkles, Film, Heart, Skull, Laugh, Rocket, Drama, AlertCircle, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const CreateRoomPage: React.FC = () => {
    const navigate = useNavigate();
    const { createRoom, error } = useAppContext();
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('😎'); // Default avatar
    const [loading, setLoading] = useState(false);
    const [genreIds, setGenreIds] = useState<number[]>([]);

    // Cycle index for multiple genres
    const [cycleIndex, setCycleIndex] = useState(0);

    const AVATARS = ['😎', '👻', '👾', '🤖', '👽', '🦊', '🐼', '🦁', '🦄', '🐯', '🐶', '🐱', '🐲', '🐙', '🐵'];

    const GENRES = [
        { id: 28, name: 'Acción', icon: Rocket, color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/50' },
        { id: 35, name: 'Comedia', icon: Laugh, color: 'from-yellow-500 to-orange-500', shadow: 'shadow-yellow-500/50' },
        { id: 18, name: 'Drama', icon: Drama, color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/50' },
        { id: 27, name: 'Terror', icon: Skull, color: 'from-gray-600 to-gray-900', shadow: 'shadow-gray-500/50' },
        { id: 10749, name: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/50' },
        { id: 878, name: 'Ciencia Ficción', icon: Sparkles, color: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/50' },
    ];

    // Auto-cycle through selected genres
    useEffect(() => {
        if (genreIds.length <= 1) return;

        const interval = setInterval(() => {
            setCycleIndex(prev => (prev + 1) % genreIds.length);
        }, 1500); // Switch every 1.5s

        return () => clearInterval(interval);
    }, [genreIds.length]);

    // Derive active genre for display
    const activeGenre = React.useMemo(() => {
        if (genreIds.length > 1) {
            // Get the current cycled genre
            const currentId = genreIds[cycleIndex];
            const genre = GENRES.find(g => g.id === currentId);
            return genre ? { ...genre, isMulti: true } : null;
        }
        if (genreIds.length === 1) {
            return GENRES.find(g => g.id === genreIds[0]) || null;
        }
        return null; // Default state
    }, [genreIds, cycleIndex]);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setLoading(true);

        try {
            const { room, user } = await createRoom(name, genreIds.length > 0 ? genreIds : undefined);
            if (room && user) {
                navigate('/waiting', { state: { room, user } });
            } else {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
        }
    };

    const toggleGenre = (id: number) => {
        setGenreIds(prev =>
            prev.includes(id)
                ? prev.filter(g => g !== id)
                : [...prev, id]
        );
        // Reset cycle to avoid out of bounds
        setCycleIndex(0);
    };

    return (
        <div className="h-[100dvh] p-4 flex flex-col relative overflow-hidden bg-slate-950">
            {/* Background Gradients - Dynamic based on genre */}
            <motion.div
                className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] blur-[100px] rounded-full pointer-events-none"
                animate={{
                    // Use activeGenre color if available, else default purple
                    // We can try to extract the first color from the gradient string "from-color-500" -> "color-500"
                    // But for simplicity/robustness let's stick to the manual mapping or just use a generic "opacity" change if we can't map easily.
                    // Actually, since I have the `color` string like "from-orange-500 ...", I can't easily use it in `background` color directly without tailwind eval.
                    // Let's use the explicit mapping I had, but using activeGenre.id
                    opacity: 0.2
                }}
                style={{
                    background: activeGenre
                        ? (activeGenre.id === 28 ? '#f97316' :
                            activeGenre.id === 35 ? '#eab308' :
                                activeGenre.id === 18 ? '#3b82f6' :
                                    activeGenre.id === 27 ? '#4b5563' :
                                        activeGenre.id === 10749 ? '#ec4899' :
                                            activeGenre.id === 878 ? '#06b6d4' : '#9333ea')
                        : '#9333ea',
                    transition: 'background 0.5s ease'
                }}
            />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Back Button */}
            <div className="absolute top-4 left-4 z-20">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full z-10 h-full">
                {/* Header - Interactive Hero */}
                <motion.div
                    className="mb-4 text-center flex-shrink-0 relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="relative mx-auto mb-3 w-20 h-20">
                        {/* Ambient Glow behind Icon */}
                        <motion.div
                            className={`absolute inset-0 rounded-2xl blur-xl opacity-60 transition-colors duration-500
                                bg-gradient-to-br ${activeGenre ? activeGenre.color : 'from-indigo-500 to-purple-600'}
                            `}
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 0.7, 0.5]
                            }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        />

                        {/* Icon Container */}
                        <div className="relative w-full h-full overflow-hidden rounded-2xl">
                            <AnimatePresence mode="popLayout" initial={false}>
                                <motion.div
                                    key={activeGenre ? activeGenre.id : 'default'}
                                    className={`absolute inset-0 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500
                                        bg-gradient-to-br ${activeGenre ? activeGenre.color : 'from-indigo-500 to-purple-600'}
                                        ${activeGenre ? activeGenre.shadow : 'shadow-indigo-500/30'}
                                    `}
                                    initial={{ x: '100%', opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: '-100%', opacity: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                        mass: 1
                                    }}
                                >
                                    {activeGenre ? (
                                        <activeGenre.icon className="w-10 h-10 text-white drop-shadow-md" />
                                    ) : (
                                        <Plus className="w-10 h-10 text-white drop-shadow-md" />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Crear Sala</h1>
                    <p className="text-sm text-slate-400 font-medium">Configura tu perfil y lánzate.</p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    className="flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                >
                    <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
                            <div className="space-y-5 p-2">

                                {/* Avatar Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-3 text-center uppercase tracking-wider">
                                    Elige tu Avatar
                                </label>
                                <div className="flex flex-wrap justify-center gap-2 max-h-[160px] overflow-y-auto custom-scrollbar px-1 pb-1">
                                    {AVATARS.map((avatar, index) => (
                                        <motion.button
                                            key={avatar}
                                            type="button"
                                            onClick={() => setSelectedAvatar(avatar)}
                                            className={`
                                                w-14 h-14 flex items-center justify-center text-3xl rounded-2xl transition-all border-2
                                                ${selectedAvatar === avatar
                                                    ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-500/40 scale-110 z-10'
                                                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-500 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}
                                            `}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 + (index * 0.05) }}
                                        >
                                            {avatar}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                                    Tu Nombre
                                </label>
                                <Input
                                    placeholder="Ej. Alex"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    icon={<User className="w-5 h-5" />}
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500 h-11 text-base"
                                />
                            </div>

                            {/* Genre Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex justify-between items-center">
                                    <span>Géneros</span>
                                    <span className="text-[10px] text-slate-500 font-normal bg-slate-800 px-2 py-0.5 rounded">Opcional</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {GENRES.map((g, index) => {
                                        const isSelected = genreIds.includes(g.id);
                                        return (
                                            <motion.button
                                                key={g.id}
                                                type="button"
                                                onClick={() => toggleGenre(g.id)}
                                                className={`relative p-2 rounded-xl border transition-all flex flex-col items-center gap-1 overflow-hidden group ${isSelected
                                                    ? `bg-gradient-to-br ${g.color} border-transparent shadow-lg text-white scale-[1.02]`
                                                    : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-200'
                                                    }`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {/* Background Pulse Effect on Click */}
                                                {isSelected && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-white/20"
                                                        initial={{ opacity: 0.5, scale: 0 }}
                                                        animate={{ opacity: 0, scale: 2 }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                )}

                                                <g.icon className={`w-4 h-4 relative z-10 transition-colors ${isSelected ? 'text-white' : 'text-current'}`} />
                                                <span className="text-[9px] uppercase font-bold tracking-wide text-center leading-tight relative z-10">
                                                    {g.name}
                                                </span>
                                                {isSelected && (
                                                    <motion.div
                                                        className="absolute inset-0 rounded-xl ring-2 ring-white/30"
                                                    />
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
                                        className="p-3 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 flex items-center gap-2 font-medium"
                                    >
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Create Button */}
                            <Button
                                fullWidth
                                type="submit"
                                disabled={!name.trim() || loading}
                                isLoading={loading}
                                size="lg"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-500/30 text-base font-bold py-3"
                            >
                                {!loading && <Film className="w-5 h-5 mr-2" />}
                                {loading ? 'Creando...' : 'Crear Sala'}
                            </Button>
                        </div>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateRoomPage;
