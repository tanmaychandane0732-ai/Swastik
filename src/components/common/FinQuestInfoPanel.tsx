import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Shield,
  CreditCard,
  Wallet,
  Brain,
  Zap,
  Target,
  BookOpen,
  Award,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Button } from '../ui/Button';

interface FinQuestInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinQuestInfoPanel: React.FC<FinQuestInfoPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { dispatch } = useGame();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleStartSimulator = () => {
    dispatch({ type: 'SET_STAGE', payload: 'simulator' });
    onClose();
  };

  const learningPillars = [
    {
      icon: Wallet,
      title: 'Cash Flow',
      color: 'text-emerald-400',
      description: 'Understand how income allocations and living expenses impact your net financial reserve.',
    },
    {
      icon: TrendingUp,
      title: 'Debt & Interest',
      color: 'text-red-400',
      description: 'Understand how borrowing, BNPL schemes, and compounding interest restrict future flexibility.',
    },
    {
      icon: Shield,
      title: 'Financial Resilience',
      color: 'text-amber-400',
      description: 'Learn how emergency funds and prepared reserves defend against sudden real-life shocks.',
    },
    {
      icon: Sparkles,
      title: 'Investing',
      color: 'text-[#FF5E1E]',
      description: 'Understand the power of automated index investing, compounding returns, and portfolio health.',
    },
    {
      icon: CreditCard,
      title: 'Credit Health',
      color: 'text-sky-400',
      description: 'Discover how credit scores (300–850) dictate loan eligibility, interest rates, and leverage.',
    },
    {
      icon: Brain,
      title: 'Decision Consequences',
      color: 'text-purple-400',
      description: 'Experience how a single financial choice cascades into subsequent months and choices.',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-end justify-end p-3 sm:p-7 pointer-events-none">
          {/* Subtle Ambient Dimming Backdrop (Preserves video clarity) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-auto cursor-pointer"
          />

          {/* Premium Dark Smoked Glass Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="relative w-full max-w-[500px] max-h-[82vh] sm:max-h-[80vh] overflow-y-auto rounded-3xl p-6 sm:p-7 pointer-events-auto shadow-2xl z-10 my-auto sm:my-0 sm:mb-16 select-text"
            style={{
              background: 'rgba(12, 14, 18, 0.74)',
              backdropFilter: 'blur(24px) saturate(140%)',
              WebkitBackdropFilter: 'blur(24px) saturate(140%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow:
                '0 24px 80px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10 mb-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E1E]/15 border border-[#FF5E1E]/40 text-[#FF5E1E] text-[10px] font-black tracking-widest uppercase font-numeric">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>GD-01 • FINANCIAL LITERACY</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  Learn Money. Make Better Decisions.
                </h2>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-sm">
                  FinQuest is an educational financial-life simulation designed to help users understand how everyday financial decisions can affect their future.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer shrink-0 mt-1"
                aria-label="Close Information Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 text-left">
              {/* Section 1: What is FinQuest? */}
              <section className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#FF5E1E] flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>What is FinQuest?</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  FinQuest is an <strong className="text-white">interactive educational game</strong> focused on financial literacy. It translates complex economic formulas into dynamic, hands-on scenarios where users make real-time decisions and immediately see the ripple effects on cashflow, net worth, and debt.
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Instead of passive reading, you learn by doing—making financial education practical, memorable, and immediately applicable to real life.
                </p>
              </section>

              {/* Section 2: Why Did We Build FinQuest? */}
              <section className="space-y-2 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Why Did We Build FinQuest?</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Many people learn financial concepts theoretically, yet struggle to understand how those concepts behave in real-life pressure situations.
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  FinQuest bridges this critical gap. Here, you can make bold decisions, experience realistic consequences, learn from mistakes in a risk-free environment, and build instinctive financial decision-making habits.
                </p>
              </section>

              {/* Section 3: The Problem We Are Solving */}
              <section className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Real-World Problem</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Every day, individuals face choices involving salaries, predatory "No-Cost EMI" schemes, high-interest loans, crypto doubling scams, and sudden medical emergencies. Traditional education teaches isolated formulas, but rarely demonstrates how one hasty choice restricts options six months later.
                </p>
              </section>

              {/* Section 4: Our Solution */}
              <section className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#22C55E] flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Our Solution: Cause → Decision → Consequence</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  FinQuest transforms financial literacy into an interactive life simulation. Every step follows a real-world feedback loop:
                </p>
                <div className="grid grid-cols-4 gap-1 text-center pt-1 font-numeric">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <span className="text-[10px] text-zinc-400 block font-bold">1. Cause</span>
                    <span className="text-xs font-black text-white">Event</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <span className="text-[10px] text-zinc-400 block font-bold">2. Decision</span>
                    <span className="text-xs font-black text-[#FF5E1E]">Choice</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <span className="text-[10px] text-zinc-400 block font-bold">3. Impact</span>
                    <span className="text-xs font-black text-amber-400">Outcome</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <span className="text-[10px] text-zinc-400 block font-bold">4. Learning</span>
                    <span className="text-xs font-black text-[#22C55E]">Habit</span>
                  </div>
                </div>
              </section>

              {/* Section 5: Highlighted 6-Month Financial Life Simulator */}
              <div className="p-4 sm:p-5 rounded-2xl border border-[#FF5E1E]/40 bg-[#FF5E1E]/[0.06] space-y-2 relative overflow-hidden">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#FF5E1E]/20 text-[#FF5E1E] text-[10px] font-black uppercase">
                  <Award className="w-3 h-3" />
                  <span>Featured Mode: Dynamic Decision Odyssey</span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  6-Month Financial Life Simulator
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Experience a dynamic half-year career odyssey. Choices branch 100% based on your balances—taking high-interest debt locks out debt-free cash solutions during unexpected emergencies later!
                </p>
              </div>

              {/* Section 6: What Will You Learn? (6 Compact Glass Cards) */}
              <section className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#FF5E1E]" />
                  <span>What Will You Learn?</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {learningPillars.map((pillar) => {
                    const Icon = pillar.icon;
                    return (
                      <div
                        key={pillar.title}
                        className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${pillar.color}`} />
                          <span className="text-xs font-black text-white">
                            {pillar.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 7: New to FinQuest? (3 Simple Steps) */}
              <section className="space-y-3 pt-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  New to FinQuest? 3 Simple Steps
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center space-y-1">
                    <span className="text-xs font-black text-[#FF5E1E] font-numeric block">
                      01
                    </span>
                    <span className="text-xs font-black text-white block">Choose</span>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      Pick your move when a situation hits.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center space-y-1">
                    <span className="text-xs font-black text-[#FF5E1E] font-numeric block">
                      02
                    </span>
                    <span className="text-xs font-black text-white block">Experience</span>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      See live balance and credit ripple effects.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center space-y-1">
                    <span className="text-xs font-black text-[#FF5E1E] font-numeric block">
                      03
                    </span>
                    <span className="text-xs font-black text-white block">Learn</span>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      Reinforce healthy financial habits.
                    </p>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <div className="pt-2">
                  <Button
                    variant="orange"
                    size="lg"
                    className="w-full text-sm font-black shadow-brand-orange py-3.5"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                    onClick={handleStartSimulator}
                  >
                    Start Your Journey →
                  </Button>
                </div>
              </section>

              {/* Section 8: Built for Learning (GD-01 Problem Statement) */}
              <section className="pt-3 border-t border-white/10 text-center space-y-1.5 pb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block font-numeric">
                  Hack2Ignite Innovation Challenge • Track GD-01
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed italic max-w-sm mx-auto">
                  "Develop an educational game that improves awareness of science, mathematics, or financial literacy."
                </p>
                <span className="text-[10px] text-[#FF5E1E] font-bold block">
                  FinQuest is proudly designed to master the Financial Literacy objective.
                </span>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

