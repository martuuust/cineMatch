
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Plus, Sparkles, Film, Heart, Skull, Laugh, Rocket, Drama } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom, error } = useAppContext();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [genreId, setGenreId] = useState<number | null>(null);

  const GENRES = [
    { id: 28, name: 'Acción', icon: Rocket, color: 'from-orange-500 to-red-500' },
    { id: 35, name: 'Comedia', icon: Laugh, color: 'from-yellow-500 to-orange-500' },
    { id: 18, name: 'Drama', icon: Drama, color: 'from-blue-500 to-indigo-500' },
    { id: 27, name: 'Terror', icon: Skull, color: 'from-gray-600 to-gray-900' },
    { id: 10749, name: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { id: 878, name: 'Sci-Fi', icon: Sparkles, color: 'from-cyan-500 to-blue-500' },
  ];

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);

    const success = await createRoom(name, genreId || undefined);
    if (success) {
      navigate('/waiting');
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] p-6 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
      </div>

      {/* Back Button */}
      <motion.div
        className="mb-6 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button
          onClick={() => navigate('/')}
          className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </motion.div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full z-10">
        {/* Header */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30 animate-float">
            <Plus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Crear Sala</h1>
          <p className="text-slate-400">Configura la sala para tus amigos.</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 bg-white/5 border-white/10 backdrop-blur-xl">
            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Tu Nombre
                </label>
                <Input
                  placeholder="Ej. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-5 h-5" />}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Genre Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Género <span className="text-slate-500 font-normal">(Opcional)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {GENRES.map((g, index) => (
                    <motion.button
                      key={g.id}
                      onClick={() => setGenreId(genreId === g.id ? null : g.id)}
                      className={`relative p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${genreId === g.id
                          ? `bg-gradient-to-br ${g.color} border-transparent shadow-lg`
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <g.icon className={`w-5 h-5 ${genreId === g.id ? 'text-white' : 'text-slate-400'}`} />
                      <span className={`text-xs font-medium ${genreId === g.id ? 'text-white' : 'text-slate-400'}`}>
                        {g.name}
                      </span>
                      {genreId === g.id && (
                        <motion.div
                          className="absolute inset-0 rounded-xl ring-2 ring-white/30"
                          layoutId="genreRing"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Create Button */}
              <Button
                fullWidth
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                isLoading={loading}
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
              >
                <Film className="w-5 h-5 mr-2" />
                {loading ? 'Creando...' : 'Crear Sala'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
