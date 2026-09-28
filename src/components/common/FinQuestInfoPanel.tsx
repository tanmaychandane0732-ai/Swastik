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
import { useSmoothScroll } from '../providers/SmoothScrollProvider';

interface FinQuestInfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinQuestInfoPanel: React.FC<FinQuestInfoPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, dispatch } = useGame();
  const isLight = state.settings.theme === 'light';
  const { stop: stopLenis, start: startLenis } = useSmoothScroll();

  // Isolate panel scrolling: Pause Lenis and lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;

    stopLenis();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      startLenis();
    };
  }, [isOpen, stopLenis, startLenis]);

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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center sm:items-end sm:justify-end p-3 sm:p-7 pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-label="What is FinQuest Information Panel"
          data-lenis-prevent="true"
        >
          {/* Subtle Ambient Dimming Backdrop (Preserves video clarity) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto cursor-pointer"
            aria-label="Close Information Panel backdrop"
          />

          {/* Premium Glass Modal Panel with Constrained Height and Flex-Col structure */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            data-lenis-prevent="true"
            className={`relative w-full max-w-[540px] h-[85dvh] max-h-[85dvh] sm:h-[80vh] sm:max-h-[80vh] flex flex-col rounded-3xl pointer-events-auto shadow-2xl z-10 my-auto sm:my-0 sm:mb-16 select-text overflow-hidden transition-colors duration-400 glass-elevated ${
              isLight ? 'text-[#17191D] border-black/10' : 'text-[#F5F5F2] border-white/12'
            }`}
          >
            {/* ── 1. Sticky Header ─────────────────────────────────── */}
            <div
              className={`p-5 sm:p-6 pb-4 border-b flex-shrink-0 flex items-start justify-between gap-4 ${
                isLight ? 'border-zinc-200 bg-white/50' : 'border-white/10 bg-black/20'
              } backdrop-blur-md z-10`}
            >
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E1E]/15 border border-[#FF5E1E]/40 text-[#FF5E1E] text-[10px] font-black tracking-widest uppercase font-numeric">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>GD-01 • THE FINANCIAL FLIGHT SIMULATOR</span>
                </div>

                <h2 className={`text-lg sm:text-xl font-black tracking-tight leading-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  Train Before Real Life Makes The Decision For You
                </h2>
                <p className={`text-xs leading-relaxed max-w-sm ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  FinQuest is an educational Financial Flight Simulator where young adults practice high-stakes financial decisions with zero real-world risk.
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 mt-1 ${
                  isLight
                    ? 'text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300'
                    : 'text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
                aria-label="Close Information Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── 2. Native Scrollable Content Container ───────────── */}
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 pt-4 space-y-6 scroll-smooth select-text"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
              }}
              tabIndex={0}
              aria-label="What is FinQuest details"
            >
              {/* Flight Simulator Pilot Metaphor Banner */}
              <div className={`p-4 rounded-2xl border-l-4 border-l-[#FF5E1E] space-y-1.5 ${isLight ? 'bg-orange-50/70 border border-orange-100' : 'bg-[#FF5E1E]/10 border border-[#FF5E1E]/20'}`}>
                <p className={`text-xs sm:text-sm font-semibold italic leading-relaxed ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>
                  "Pilots don’t fly passenger planes without thousands of hours in a flight simulator. Why do we let young adults enter the economy without a financial flight simulator?"
                </p>
                <span className="text-[10px] font-black text-[#FF5E1E] uppercase tracking-wider block font-numeric">
                  Core Mission: High-stakes learning with zero real-world financial risk
                </span>
              </div>

              {/* Section 1: What is FinQuest? */}
              <section className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#FF5E1E] flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span>What is FinQuest?</span>
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  FinQuest is an <strong className={isLight ? 'text-zinc-900' : 'text-white'}>interactive educational web game</strong> specifically built for Hack2Ignite Track GD-01 (Financial Literacy). It translates complex compounding mathematics, debt dynamics, and cashflow allocations into a hands-on simulation.
                </p>
              </section>

              {/* Section 2: Why Did We Build FinQuest? */}
              <section className={`space-y-2 p-4 rounded-2xl ${isLight ? 'bg-zinc-50 border border-zinc-200' : 'bg-white/[0.03] border border-white/[0.08]'}`}>
                <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Why Did We Build FinQuest?</span>
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  Young adults learn financial definitions theoretically, but rarely encounter high-pressure situations—like an unexpected salary cut, a 36% APR credit card trap, or a deceptive UPI QR scam—until real money is on the line.
                </p>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  FinQuest bridges this gap by creating an interactive sandbox where you can make bold decisions, witness consequence ripples, and develop protective instincts before entering the real economy.
                </p>
              </section>

              {/* Section 3: The Real-World Problem */}
              <section className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The Real-World Problem We Solve</span>
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  Predatory "No-Cost EMI" marketing, cyber scams, instant loan apps, and medical emergencies routinely trap young people in cycles of compounding debt. Isolated textbooks don't teach how a purchase today restricts emergency options six months down the line.
                </p>
              </section>

              {/* Section 4: Our Solution Loop */}
              <section className="space-y-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#22C55E] flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Our Solution: The Feedback Loop</span>
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  FinQuest operates on an authentic aviation-inspired feedback loop:
                </p>
                <div className="grid grid-cols-4 gap-1.5 text-center pt-1 font-numeric">
                  <div className={`p-2 rounded-xl ${isLight ? 'bg-zinc-100 border border-zinc-200' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
                    <span className={`text-[10px] block font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>1. Event</span>
                    <span className={`text-xs font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>Cause</span>
                  </div>
                  <div className={`p-2 rounded-xl ${isLight ? 'bg-zinc-100 border border-zinc-200' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
                    <span className={`text-[10px] block font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>2. Choice</span>
                    <span className="text-xs font-black text-[#FF5E1E]">Decision</span>
                  </div>
                  <div className={`p-2 rounded-xl ${isLight ? 'bg-zinc-100 border border-zinc-200' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
                    <span className={`text-[10px] block font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>3. Ripple</span>
                    <span className="text-xs font-black text-amber-500">Consequence</span>
                  </div>
                  <div className={`p-2 rounded-xl ${isLight ? 'bg-zinc-100 border border-zinc-200' : 'bg-white/[0.04] border border-white/[0.08]'}`}>
                    <span className={`text-[10px] block font-bold ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>4. Growth</span>
                    <span className="text-xs font-black text-[#22C55E]">Habit</span>
                  </div>
                </div>
              </section>

              {/* Section 5: What Is Inside FinQuest? (Complete Feature List) */}
              <section className="space-y-3">
                <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  <Award className="w-4 h-4 text-[#FF5E1E]" />
                  <span>What Is Inside FinQuest?</span>
                </h3>

                <div className="space-y-2">
                  <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✈️</span>
                      <h4 className={`text-xs font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        6-Month Financial Flight Simulator
                      </h4>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      Dynamic half-year career flight with salary allocations, unexpected events, and CIBIL credit score tracking.
                    </p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🚨</span>
                      <h4 className={`text-xs font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        Scam Detective Forensic Sim
                      </h4>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      Interactive simulated smartphone to uncover red flags in fake UPI, KYC phishing, and Telegram pump-and-dump schemes.
                    </p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🌪️</span>
                      <h4 className={`text-xs font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        Financial Turbulence Emergency Drills
                      </h4>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      Cockpit alarm events simulating urgent medical bills, hardware failure, and cascading cashflow crises.
                    </p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🧠</span>
                      <h4 className={`text-xs font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        Pre/Post Financial IQ & Decision DNA
                      </h4>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      Quantifiable IQ Delta learning gains, 6-axis Risk Radar, and behavioral personality archetype classification.
                    </p>
                  </div>

                  <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📜</span>
                      <h4 className={`text-xs font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        Personalized Official Certificate (A4 Printable)
                      </h4>
                    </div>
                    <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      Verified Certificate of Financial Competence with your name printed and official competence badges.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 6: What Will You Learn? (6 Compact Glass Cards) */}
              <section className="space-y-3">
                <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  <BookOpen className="w-4 h-4 text-[#FF5E1E]" />
                  <span>What Will You Learn?</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {learningPillars.map((pillar) => {
                    const Icon = pillar.icon;
                    return (
                      <div
                        key={pillar.title}
                        className={`p-3 rounded-xl border transition-all space-y-1 ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'
                            : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${pillar.color}`} />
                          <span className={`text-xs font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                            {pillar.title}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          {pillar.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 7: New to FinQuest? (3 Simple Steps) */}
              <section className="space-y-3 pt-1">
                <h3 className={`text-sm font-black uppercase tracking-wider ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  New to FinQuest? 3 Simple Steps
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-3 rounded-xl border text-center space-y-1 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                    <span className="text-xs font-black text-[#FF5E1E] font-numeric block">
                      01
                    </span>
                    <span className={`text-xs font-black block ${isLight ? 'text-zinc-900' : 'text-white'}`}>Choose</span>
                    <p className={`text-[10px] leading-tight ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Pick your move when a situation hits.
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border text-center space-y-1 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                    <span className="text-xs font-black text-[#FF5E1E] font-numeric block">
                      02
                    </span>
                    <span className={`text-xs font-black block ${isLight ? 'text-zinc-900' : 'text-white'}`}>Experience</span>
                    <p className={`text-[10px] leading-tight ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      See live balance and credit ripple effects.
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl border text-center space-y-1 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-white/[0.03] border-white/[0.08]'}`}>
                    <span className="text-xs font-black text-[#FF5E1E] font-numeric block">
                      03
                    </span>
                    <span className={`text-xs font-black block ${isLight ? 'text-zinc-900' : 'text-white'}`}>Learn</span>
                    <p className={`text-[10px] leading-tight ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
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
                    Start Your Flight Journey →
                  </Button>
                </div>
              </section>

              {/* Section 8: Built for Learning (GD-01 Problem Statement) */}
              <section className="pt-3 border-t border-white/10 text-center space-y-1.5 pb-2">
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
