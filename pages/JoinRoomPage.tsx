
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hash, User, LogIn, AlertCircle } from 'lucide-react';
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

  const handleJoin = async () => {
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    setError('');

    const success = await joinRoom(code.toUpperCase(), name);
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
    <div className="min-h-[100dvh] p-6 flex flex-col relative overflow-hidden">
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
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30 animate-float">
            <Hash className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Unirse a Sala</h1>
          <p className="text-slate-400">Introduce el código que te han compartido.</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 bg-white/5 border-white/10 backdrop-blur-xl">
            <div className="space-y-5">
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

              {/* Room Code Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Código de Sala
                </label>
                <Input
                  placeholder="ABCD-1234"
                  value={code}
                  onChange={handleCodeChange}
                  icon={<Hash className="w-5 h-5" />}
                  maxLength={9}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 font-mono tracking-wider uppercase"
                />
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-center gap-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30"
              >
                <LogIn className="w-5 h-5 mr-2" />
                {loading ? 'Uniéndose...' : 'Entrar a la Sala'}
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
