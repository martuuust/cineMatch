
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash, LogIn, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const JoinRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { joinRoom } = useAppContext();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmoji, setUserEmoji] = useState('😎');

  const EMOJIS = ['😎', '🎬', '🍿', '👻', '👽', '🤠', '🤖', '🐱', '🐶', '🦄', '🦁', '🐵'];

  const handleJoin = async () => {
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    setError('');

    const displayName = `${userEmoji} ${name}`;
    const success = await joinRoom(code.toUpperCase(), displayName);
    if (success) {
      navigate('/waiting');
    } else {
      setError('Código inválido. Asegúrate de que es correcto.');
      setLoading(false);
    }
  };

  const cycleEmoji = () => {
    const idx = EMOJIS.indexOf(userEmoji);
    setUserEmoji(EMOJIS[(idx + 1) % EMOJIS.length]);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format code with uppercase
    const value = e.target.value.toUpperCase().slice(0, 9);
    setCode(value);
    if (error) setError('');
  };

  return (
    <div className="h-[100dvh] p-6 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-orb orb-1" style={{ background: 'rgba(20, 184, 166, 0.3)' }} />
        <div className="floating-orb orb-2" style={{ background: 'rgba(6, 182, 212, 0.2)' }} />
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
          <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-teal-500/30 animate-float relative group">
            <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Hash className="w-12 h-12 text-white drop-shadow-md z-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Unirse a Sala</h1>
          <p className="text-slate-400">Introduce el código que te han compartido.</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 bg-white/5 border-white/10 backdrop-blur-xl">
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
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl focus:ring-teal-500/50 text-base font-medium pl-4"
                  />
                </div>
              </div>

              {/* Room Code Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Código de Sala
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-teal-400 transition-colors">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <input
                    placeholder="CINE-XXXX"
                    value={code}
                    onChange={handleCodeChange}
                    className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all uppercase tracking-widest font-mono text-lg"
                  />
                  {/* Focus glow effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 rounded-xl ring-1 ring-teal-500/30" />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Join Button */}
              <Button
                fullWidth
                onClick={handleJoin}
                disabled={!name.trim() || !code.trim() || loading}
                isLoading={loading}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30"
              >
                <LogIn className="w-5 h-5 mr-2" />
                {loading ? 'Entrando...' : 'Entrar a la Sala'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Help Text */}
        <motion.p
          className="text-center text-sm text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          ¿No tienes código? Pide a un amigo que cree una sala.
        </motion.p>
      </div>
    </div>
  );
};

export default JoinRoomPage;
