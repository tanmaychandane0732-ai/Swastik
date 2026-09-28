import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, ShieldCheck, PieChart, PiggyBank, TrendingUp, Radar, Flame, Sparkles, Lock } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { INITIAL_BADGES } from '../../data/badgesData';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ isOpen, onClose }) => {
  const { state } = useGame();
  const unlockedIds = state.badges;

  if (!isOpen) return null;

  const iconMap: Record<string, React.ElementType> = {
    Sparkles,
    PieChart,
    PiggyBank,
    ShieldCheck,
    TrendingUp,
    Radar,
    Flame,
    Award,
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl glass-elevated rounded-3xl p-5 sm:p-7 border border-slate-700/60 shadow-2xl z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-neon-indigo">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  Achievement Showcase
                </h3>
                <p className="text-xs text-slate-400">
                  {unlockedIds.length} of {INITIAL_BADGES.length} Badges Unlocked
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badge Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 overflow-y-auto pr-1">
            {INITIAL_BADGES.map((badge) => {
              const isUnlocked = unlockedIds.includes(badge.id);
              const Icon = iconMap[badge.iconName] || Award;

              return (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'bg-slate-800/70 border-indigo-500/40 shadow-neon-indigo/30'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 border ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-800 text-slate-500 border-slate-700/40'
                      }`}
                    >
                      {isUnlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                          {badge.name}
                        </span>
                        {isUnlocked && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                            UNLOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-snug">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

