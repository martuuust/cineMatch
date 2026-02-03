
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Sparkles, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [particles, setParticles] = useState<{ id: number; left: string; delay: string }[]>([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`
    }));
    setParticles(newParticles);
  }, []);

  const features = [
    { icon: Users, text: 'Vota con amigos' },
    { icon: Zap, text: 'Match instantáneo' },
    { icon: Sparkles, text: 'Películas top' }
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-orb orb-1" />
        <div className="floating-orb orb-2" />
        <div className="floating-orb orb-3" />
      </div>

      {/* Floating Particles */}
      <div className="particles-container">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{ left: p.left, animationDelay: p.delay }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div 
        className="z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div 
          className="relative mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-28 h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] flex items-center justify-center shadow-2xl glow-primary animate-float">
            <Film className="w-14 h-14 text-white drop-shadow-lg" />
          </div>
          {/* Decorative rings */}
          <div className="absolute inset-0 rounded-[2rem] border-2 border-white/20 scale-110 animate-pulse" />
          <div className="absolute inset-0 rounded-[2rem] border border-white/10 scale-125" />
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-5xl md:text-6xl font-bold text-center mb-3 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-white">Cine</span>
          <span className="text-gradient">Match</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p 
          className="text-slate-400 text-center max-w-xs text-lg font-light leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Deja de hacer scroll, empieza a ver.
          <br />
          <span className="text-indigo-400">Encuentra la película perfecta con amigos.</span>
        </motion.p>

        {/* Features */}
        <motion.div 
          className="flex gap-4 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              transition={{ delay: 0.1 * index }}
            >
              <feature.icon className="w-5 h-5 text-indigo-400" />
              <span className="text-xs text-slate-400 font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div 
          className="w-full max-w-sm flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            fullWidth 
            size="lg" 
            onClick={() => navigate('/create')}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-indigo-500/30 btn-glow"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Crear Sala
          </Button>
          <Button 
            fullWidth 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/join')}
            className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
          >
            <Users className="w-5 h-5 mr-2" />
            Unirse a Sala
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Footer Badge */}
      <motion.div 
        className="absolute bottom-8 text-xs text-slate-500 font-medium tracking-wide uppercase flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Zap className="w-3 h-3 text-indigo-400" />
        Encuentra tu match perfecto
      </motion.div>
    </div>
  );
};

export default HomePage;
