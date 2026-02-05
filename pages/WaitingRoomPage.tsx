
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Copy, Users, Crown, CheckCircle2, Share2, ArrowRight, Loader2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const WaitingRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { room: contextRoom, currentUser: contextUser, startVoting, isConnected, refreshRoom, isInitializing, leaveRoom } = useAppContext();
  
  // Use room/user from context, or fallback to navigation state (for immediate feedback)
  const room = contextRoom || (location.state as any)?.room;
  const currentUser = contextUser || (location.state as any)?.user;
  
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Handle back button (browser navigation) - REMOVED to prevent accidental exit on mobile
  // Mobile browsers might trigger popstate events unexpectedly or during redirects.
  // Instead, we rely on HomePage to clean up the session if the user navigates there.
  /*
  useEffect(() => {
    const handlePopState = () => {
      leaveRoom();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [leaveRoom]);
  */


  const handleLeave = () => {
    if (window.confirm('¿Seguro que quieres salir de la sala?')) {
        leaveRoom();
        navigate('/');
    }
  };

  // Poll for room updates as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      refreshRoom();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [refreshRoom]);

  // Get users from room
  const users = room?.users || [];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isInitializing && !room) {
      // Give a grace period for state updates to propagate
      // Increased to 2000ms for mobile devices where context updates might be slower
      timeout = setTimeout(() => {
        // If still no room after grace period, redirect
        console.warn('No room state found, redirecting to home');
        navigate('/');
      }, 2000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [room, navigate, isInitializing]);

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

  if (isInitializing) {
    return (
      <div className="h-[100dvh] bg-slate-950 flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Recuperando sesión...</p>
      </div>
    );
  }

  // Show error state if initialization failed but we have an error message
  if (!room && !currentUser && isConnected === false) {
     const { error } = useAppContext();
     if (error) {
         return (
             <div className="h-[100dvh] bg-slate-950 flex items-center justify-center p-6">
                 <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-sm w-full text-center">
                     <p className="text-red-400 font-medium mb-4">{error}</p>
                     <button 
                        onClick={() => window.location.reload()}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-2 rounded-xl transition-colors"
                     >
                        Reintentar
                     </button>
                     <button 
                        onClick={() => navigate('/')}
                        className="block w-full mt-4 text-slate-500 text-sm hover:text-slate-300"
                     >
                        Volver al inicio
                     </button>
                 </div>
             </div>
         );
     }
  }

  if (!room || !currentUser) return null;

  const isHost = currentUser.isHost;

  return (
    <div className="h-[100dvh] relative overflow-hidden flex flex-col">
      {/* Connection Status Warning */}
      {!isConnected && (
        <div className="absolute top-0 left-0 right-0 bg-red-500/80 text-white text-xs py-1 text-center z-50 backdrop-blur-sm">
          Desconectado del servidor... Intentando reconectar
        </div>
      )}

      {/* Exit Button */}
      <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={handleLeave} 
            className="bg-black/20 hover:bg-red-500/20 text-white/50 hover:text-red-400 p-2 rounded-full transition-colors backdrop-blur-sm border border-white/5"
            title="Salir de la sala"
          >
              <LogOut className="w-5 h-5" />
          </button>
      </div>

      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar z-10 w-full min-h-0">
        <div className="min-h-full p-6 flex flex-col max-w-md mx-auto">

          {/* Room Code Section */}
          <motion.div
            className="text-center mb-8 mt-4 shrink-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
          <p className="text-slate-400 font-medium mb-4 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-slate-700"></span>
            Código de Sala
            <span className="w-8 h-[1px] bg-slate-700"></span>
          </p>

          <motion.div
            onClick={handleCopyCode}
            className="relative bg-white/5 rounded-[2rem] p-4 sm:p-6 backdrop-blur-xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all group overflow-hidden"
            whileTap={{ scale: 0.98 }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex-1 flex justify-center min-w-0">
               <div className="text-xl sm:text-3xl font-black text-white tracking-wider sm:tracking-[0.1em] font-mono room-code relative z-10 whitespace-nowrap overflow-hidden text-ellipsis">
                  {room.code}
               </div>
            </div>

            <motion.button
              className="ml-2 sm:ml-4 p-3 sm:p-4 rounded-xl bg-white/10 text-slate-300 group-hover:text-indigo-400 group-hover:bg-indigo-500/20 transition-all relative z-10 flex-shrink-0"
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
          </motion.div>
          
          <div className="mt-4 flex justify-center">
             <button 
               onClick={handleShare}
               className="text-sm text-indigo-400 font-medium flex items-center gap-2 hover:text-indigo-300 transition-colors px-4 py-2 rounded-full hover:bg-indigo-500/10"
             >
               <Share2 className="w-4 h-4" />
               Compartir enlace
             </button>
          </div>
        </motion.div>

        {/* Users List & Actions */}
        <div className="flex-1 flex flex-col w-full">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Participantes
                <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-slate-300 border border-white/5">
                  {users.length}
                </span>
              </h2>
              {isHost && (
                <span className="text-xs text-indigo-400 font-medium animate-pulse">
                  Esperando jugadores...
                </span>
              )}
            </div>

            <div className="space-y-3 flex-1">
              <AnimatePresence>
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`
                      flex items-center p-4 border transition-all
                      ${user.id === currentUser.id 
                        ? 'bg-indigo-500/10 border-indigo-500/30' 
                        : 'bg-white/5 border-white/5'
                      }
                    `} noPadding>
                      <div className="flex items-center gap-4 w-full p-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                            ${user.id === currentUser.id 
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                              : 'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-300 border border-white/10'
                            }
                          `}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          {user.isHost && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 text-black p-1 rounded-full border-2 border-[#0f0f1a]">
                              <Crown className="w-3 h-3 fill-current" />
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f1a] animate-pulse"></div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${user.id === currentUser.id ? 'text-white' : 'text-slate-200'}`}>
                              {user.name}
                            </span>
                            {user.id === currentUser.id && (
                              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">
                                Tú
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {user.isHost ? 'Anfitrión de la sala' : 'Esperando inicio...'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          {/* Action Button */}
          <motion.div 
            className="mt-8 mb-6 shrink-0 pb-safe"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {isHost ? (
              <Button
                fullWidth
                size="lg"
                onClick={handleStartVoting}
                disabled={users.length < 1 || loading}
                isLoading={loading}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/30"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold text-lg">Comenzar Votación</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            ) : (
              <div className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                <h3 className="text-white font-bold mb-1">Esperando al anfitrión</h3>
                <p className="text-slate-400 text-sm">La partida comenzará pronto...</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default WaitingRoomPage;
