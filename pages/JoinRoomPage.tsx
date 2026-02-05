
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
  const [selectedAvatar, setSelectedAvatar] = useState('😎'); // Default avatar, replacing userEmoji

  // Shared AVATARS list - consistent with CreateRoomPage
  const AVATARS = ['😎', '👻', '👾', '🤖', '👽', '🦊', '🐼', '🦁', '🦄', '🐯', '🐶', '🐱', '🐲', '🐙', '🐵'];

  const handleJoin = async () => {
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    setError('');

    // Combine avatar and name for display
    const displayName = `${selectedAvatar} ${name}`;
    const success = await joinRoom(code.toUpperCase(), displayName);
    if (success) {
      navigate('/waiting');
    } else {
      setError('Código inválido. Asegúrate de que es correcto.');
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format code with uppercase
    const value = e.target.value.toUpperCase().slice(0, 9);
    setCode(value);
    if (error) setError('');
  };

  return (
    <div className="h-[100dvh] p-4 flex flex-col relative overflow-hidden bg-slate-950">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-teal-600/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-cyan-600/20 blur-[100px] rounded-full pointer-events-none" />

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
        {/* Header */}
        <motion.div
          className="mb-4 text-center flex-shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-500/30 animate-float relative group">
            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Hash className="w-8 h-8 text-white drop-shadow-md z-10" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Unirse a Sala</h1>
          <p className="text-sm text-slate-400 font-medium">Introduce el código que te han compartido.</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
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
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`
                                w-14 h-14 flex items-center justify-center text-3xl rounded-2xl transition-all border-2
                                ${selectedAvatar === avatar
                          ? 'bg-teal-600 border-teal-400 shadow-lg shadow-teal-500/40 scale-110 z-10'
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
                  placeholder="Tu nombre..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-teal-500 h-11 text-base"
                />
              </div>

              {/* Room Code Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
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
                    className="w-full pl-12 pr-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all uppercase tracking-widest font-mono text-lg h-11"
                  />
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

              {/* Join Button */}
              <Button
                fullWidth
                onClick={handleJoin}
                disabled={!name.trim() || !code.trim() || loading}
                isLoading={loading}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-xl shadow-teal-500/30 text-base font-bold py-3"
              >
                {!loading && <LogIn className="w-5 h-5 mr-2" />}
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
