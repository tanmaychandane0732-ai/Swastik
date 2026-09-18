import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Flame, CheckCircle2, AlertTriangle, ArrowRight, BarChart2 } from 'lucide-react';
import { DAILY_DILEMMA_TODAY } from '../../data/academyContent';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface DailyFlightChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncrementStreak?: () => void;
}

export const DailyFlightChallengeModal: React.FC<DailyFlightChallengeModalProps> = ({
  isOpen,
  onClose,
  onIncrementStreak,
}) => {
  const dilemma = DAILY_DILEMMA_TODAY;
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  if (!isOpen) return null;

  const handleChoose = (id: string) => {
    setSelectedOptionId(id);
    setHasVoted(true);
    if (onIncrementStreak) {
      onIncrementStreak();
    }
  };

  const selectedOption = dilemma.options.find((o) => o.id === selectedOptionId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-xl flex flex-col overflow-hidden text-left"
        >
          <GlassCard className="p-0 rounded-3xl border border-[#FF5E1E]/50 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#27272A] flex items-center justify-between gap-3 bg-gradient-to-r from-[#FF5E1E]/20 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 flex items-center justify-center text-xl shadow-brand-orange">
                  <Flame className="w-5 h-5 text-[#FF5E1E]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
                    Daily Flight Challenge • 60 Sec
                  </span>
                  <h3 className="text-base font-black text-white">
                    Today’s Cockpit Dilemma
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {dilemma.scenario}
              </p>

              <h4 className="text-xs font-black text-white uppercase tracking-wider font-numeric">
                {dilemma.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {dilemma.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => !hasVoted && handleChoose(opt.id)}
                      disabled={hasVoted}
                      className={`w-full p-4 rounded-2xl border text-left transition-all text-xs font-bold leading-relaxed relative ${
                        isSelected
                          ? opt.isOptimal
                            ? 'bg-[#22C55E]/15 border-[#22C55E] text-white'
                            : 'bg-red-500/15 border-red-500 text-white'
                          : hasVoted && opt.isOptimal
                          ? 'bg-[#22C55E]/10 border-[#22C55E]/60 text-zinc-200'
                          : 'bg-[#18181D] hover:bg-[#222328] border-[#27272A] text-zinc-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span>{opt.text}</span>
                        {hasVoted && (
                          <span className="text-xs font-numeric font-black text-[#FF5E1E] shrink-0">
                            {opt.communityVotePercent}% Voted
                          </span>
                        )}
                      </div>

                      {/* Result feedback bar */}
                      {hasVoted && (
                        <div className="mt-2 pt-2 border-t border-[#27272A] flex items-center gap-1.5 text-[11px] font-normal text-zinc-400">
                          {opt.isOptimal ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span>{opt.consequence}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Post-vote banner */}
              {hasVoted && (
                <div className="p-3 rounded-xl bg-[#FF5E1E]/10 border border-[#FF5E1E]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Daily Flight Streak Boosted: +1 Day!</span>
                  </div>
                  <Button variant="orange" size="sm" onClick={onClose}>
                    Claim Bonus
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

