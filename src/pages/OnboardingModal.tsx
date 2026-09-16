import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, User, Compass } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { Button } from '../components/ui/Button';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useGame();
  const [name, setName] = useState(state.player.name || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'FinQuester';
    dispatch({ type: 'SET_PLAYER_NAME', payload: finalName });
    dispatch({ type: 'SET_STAGE', payload: 'level1' });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/40 shadow-neon-indigo z-10 my-auto"
        >
          {/* Header Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center mb-5 shadow-neon-indigo text-white">
            <Compass className="w-6 h-6" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 mb-2 inline-block">
            Career Onboarding
          </span>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 tracking-tight">
            Welcome to FinQuest
          </h3>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6 text-xs sm:text-sm text-slate-300 space-y-1.5 font-medium leading-relaxed">
            <p className="text-indigo-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              "You've got a salary."
            </p>
            <p className="text-indigo-200 font-semibold">
              "You've got choices."
            </p>
            <p className="text-emerald-300 font-bold">
              "Every choice changes your financial future."
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Enter Your Player / Codename
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="playerName"
                  type="text"
                  maxLength={24}
                  placeholder="e.g. Alex Trader, Maya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="emerald"
              size="lg"
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Begin Level 1: Budget Arena
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
