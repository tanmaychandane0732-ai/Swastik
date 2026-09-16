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
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-[#27272A] shadow-2xl z-10 my-auto"
        >
          {/* Header Icon */}
          <div className="w-12 h-12 rounded-2xl bg-[#FF5E1E] flex items-center justify-center mb-5 shadow-brand-orange text-black font-black">
            <Compass className="w-6 h-6" />
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-[#FF5E1E] px-2.5 py-0.5 rounded-full bg-[#FF5E1E]/15 border border-[#FF5E1E]/40 mb-2 inline-block">
            Career Onboarding
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">
            Welcome to FinQuest
          </h3>

          <div className="p-3.5 rounded-2xl bg-[#18181D] border border-[#27272A] mb-6 text-xs sm:text-sm text-zinc-300 space-y-1.5 font-medium leading-relaxed">
            <p className="text-[#FF5E1E] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              "You've got a salary."
            </p>
            <p className="text-zinc-200 font-bold">
              "You've got choices."
            </p>
            <p className="text-white font-black">
              "Every choice changes your financial future."
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-xs font-bold text-zinc-300 mb-1.5">
                Enter Your Player / Codename
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4 text-[#FF5E1E]" />
                </div>
                <input
                  id="playerName"
                  type="text"
                  maxLength={24}
                  placeholder="e.g. Alex Trader, Maya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#18181D] border border-[#27272A] text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#FF5E1E] transition-all font-bold"
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="orange"
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
