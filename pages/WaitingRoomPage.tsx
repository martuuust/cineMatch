
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Users, Crown, CheckCircle2, Share2, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const WaitingRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { room, currentUser, startVoting } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get users from room
  const users = room?.users || [];

  useEffect(() => {
    if (!room) {
      navigate('/');
    }
  }, [room, navigate]);

  useEffect(() => {
    if (room?.status === 'voting') {
      navigate('/swipe');
    }
  }, [room?.status, navigate]);

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartVoting = () => {
    if (users.length < 2) return;
    setLoading(true);
    startVoting();
  };

  const handleShare = async () => {
    if (navigator.share && room?.code) {
      try {
        await navigator.share({
          title: 'Únete a mi sala de CineMatch',
          text: `¡Ven a votar películas! Código: ${room.code}`,
          url: window.location.origin + '/join'
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyCode();
    }
  };

  if (!room || !currentUser) return null;

  const isHost = currentUser.isHost;

  return (
    <div className="min-h-[100dvh] p-6 flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full z-10">

        {/* Room Code Section */}
        <motion.div
          className="text-center mb-8 mt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-slate-400 font-medium mb-3 uppercase tracking-widest text-xs">
            Código de Sala
          </p>

          <motion.div
            onClick={handleCopyCode}
            className="relative bg-white/5 rounded-2xl p-5 backdrop-blur-xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all group"
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-4xl font-black text-white tracking-[0.2em] font-mono room-code">
              {room.code}
            </div>
            <motion.button
              className="p-3 rounded-xl bg-white/10 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/20 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Copy className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Glow effect on copy */}
            <AnimatePresence>
              {copied && (
                <motion.div
                  className="absolute inset-0 rounded-2xl ring-2 ring-green-400/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="mt-4 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-full px-6 border-white/20 text-slate-300 hover:bg-white/10 hover:border-white/30"
            >
              <Share2 className="w-4 h-4 mr-2" /> Compartir Código
            </Button>
          </motion.div>
        </motion.div>

        {/* Users List */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Participantes
            </h2>
            <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
              {users.length}
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  className="bg-white/5 p-4 rounded-xl backdrop-blur-xl border border-white/10 flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${user.isHost
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-white">
                      {user.name}
                    </span>
                    {user.id === currentUser.id && (
                      <span className="text-slate-400 text-sm ml-2">(Tú)</span>
                    )}
                  </div>
                  {user.isHost && (
                    <Crown className="w-6 h-6 text-amber-400 drop-shadow-lg" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Waiting placeholder */}
            {users.length < 2 && (
              <motion.div
                className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 gap-3"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="text-sm">Esperando amigos...</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Footer Action */}
        <motion.div
          className="mt-8 pt-6 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isHost ? (
            <div className="space-y-4">
              <Button
                fullWidth
                size="lg"
                onClick={handleStartVoting}
                disabled={users.length < 2 || loading}
                isLoading={loading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    Comenzar Votación
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
              {users.length < 2 && (
                <p className="text-center text-xs text-slate-500">
                  Necesitas al menos 2 personas para empezar
                </p>
              )}
            </div>
          ) : (
            <Card className="text-center bg-white/5 border-white/10 backdrop-blur-xl">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                </div>
              </div>
              <p className="text-white font-medium">Esperando al anfitrión...</p>
              <p className="text-xs text-slate-400 mt-1">La votación empezará pronto</p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default WaitingRoomPage;
