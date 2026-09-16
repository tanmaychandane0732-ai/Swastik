import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Wallet,
  CreditCard,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  FileText,
  Printer,
  ChevronRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../contexts/GameContext';
import {
  SIMULATOR_SCENARIOS,
  SimulatorPlayerState,
  SimulatorChoice,
} from '../../data/lifeSimulatorScenarios';
import { formatCurrency, formatScore } from '../../utils/formatters';
import { soundManager } from '../../services/audioService';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { TeamLogo } from '../../components/common/TeamLogo';

interface LifeSimulatorGameProps {
  onOpenCertificate?: () => void;
}

export const LifeSimulatorGame: React.FC<LifeSimulatorGameProps> = ({ onOpenCertificate }) => {
  const { state, dispatch, showFeedback } = useGame();

  // Local Life Simulator State
  const [playerState, setPlayerState] = useState<SimulatorPlayerState>({
    month: 1,
    salary: 60000,
    cash: 10000,          // initial cash baseline
    debt: 0,              // debt
    monthlyEmi: 0,        // committed EMI
    invested: 0,          // investments
    creditScore: 680,     // baseline good credit
    health: 75,
    score: 0,
    decisionsHistory: [],
  });

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Find scenario for current month
  const currentScenario = SIMULATOR_SCENARIOS.find((s) => s.month === playerState.month) || SIMULATOR_SCENARIOS[0];

  const netWorth = playerState.cash + playerState.invested - playerState.debt;

  // Credit Score Rating helper
  const getCreditRating = (score: number) => {
    if (score >= 750) return { label: 'Excellent', color: 'text-[#22C55E]' };
    if (score >= 700) return { label: 'Good', color: 'text-amber-400' };
    if (score >= 620) return { label: 'Fair', color: 'text-orange-400' };
    return { label: 'Critical Debt Risk', color: 'text-red-400' };
  };

  const creditRating = getCreditRating(playerState.creditScore);

  const handleSelectChoice = (choice: SimulatorChoice) => {
    setSelectedChoiceId(choice.id);

    const { effects } = choice;
    const isOptimal = effects.scoreDelta >= 800;

    if (isOptimal) {
      soundManager.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      soundManager.playClick();
    }

    // Compute next state
    const nextCash = Math.max(0, playerState.cash + effects.cashDelta);
    const nextDebt = Math.max(0, playerState.debt + effects.debtDelta);
    const nextEmi = Math.max(0, playerState.monthlyEmi + effects.monthlyEmiDelta);
    const nextInvested = Math.max(0, playerState.invested + effects.investedDelta);
    const nextCreditScore = Math.min(850, Math.max(300, playerState.creditScore + effects.creditScoreDelta));
    const nextHealth = Math.min(100, Math.max(10, playerState.health + effects.healthDelta));
    const nextScore = playerState.score + effects.scoreDelta;

    const updatedState: SimulatorPlayerState = {
      ...playerState,
      cash: nextCash,
      debt: nextDebt,
      monthlyEmi: nextEmi,
      invested: nextInvested,
      creditScore: nextCreditScore,
      health: nextHealth,
      score: nextScore,
      decisionsHistory: [...playerState.decisionsHistory, choice.id],
    };

    setPlayerState(updatedState);

    // Sync score & net worth with global context
    dispatch({
      type: 'RECORD_SCAM_VERDICT',
      payload: {
        targetId: choice.id,
        isCorrect: isOptimal,
        detectedFlags: [],
        scoreChange: effects.scoreDelta,
        healthChange: effects.healthDelta,
        netWorthChange: effects.cashDelta + effects.investedDelta - effects.debtDelta,
      },
    });

    // Show educational feedback
    showFeedback({
      title: `${currentScenario.title}: Decision Outcome`,
      verdict: isOptimal ? 'success' : effects.debtDelta > 0 ? 'danger' : 'warning',
      headline: choice.outcomeHeadline,
      financialImpact: {
        netWorthDelta: effects.cashDelta + effects.investedDelta - effects.debtDelta,
        healthDelta: effects.healthDelta,
        scoreDelta: effects.scoreDelta,
        debtDelta: effects.debtDelta,
      },
      whyItHappened: choice.outcomeExplanation,
      whatYouShouldLearn: choice.financialLesson,
      onContinue: () => {
        if (playerState.month < 6) {
          setPlayerState((prev) => ({
            ...prev,
            month: prev.month + 1,
            // Monthly salary influx minus committed EMI for the next month!
            cash: prev.cash + (prev.salary - 25000 - prev.monthlyEmi),
          }));
          setSelectedChoiceId(null);
        } else {
          // Completed all 6 months
          setIsCompleted(true);
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
          });
        }
      },
    });
  };

  const handleRestartSimulator = () => {
    setPlayerState({
      month: 1,
      salary: 60000,
      cash: 10000,
      debt: 0,
      monthlyEmi: 0,
      invested: 0,
      creditScore: 680,
      health: 75,
      score: 0,
      decisionsHistory: [],
    });
    setSelectedChoiceId(null);
    setIsCompleted(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 select-none">
      {/* Top Header & Team Swastik Attribution */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card rounded-2xl p-5 border border-[#27272A] shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
              Dynamic Decision Engine
            </span>
            <span className="text-xs font-bold text-zinc-400">
              6-Month Career & Cashflow Odyssey
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Life Quest: Financial Simulator
          </h1>
        </div>

        {/* Team Swastik Logo Attribution */}
        <div className="flex items-center gap-3 shrink-0">
          <TeamLogo size="sm" showText={true} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
          >
            Quest Hub
          </Button>
        </div>
      </div>

      {/* Real-Time Financial Cockpit Bar (All choices dynamically alter this!) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Cash In Hand */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <Wallet className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Liquid Cash</span>
          </div>
          <div className="text-base sm:text-lg font-black font-numeric text-white">
            {formatCurrency(playerState.cash)}
          </div>
          <span className="text-[10px] text-zinc-500 block">Emergency Reserve</span>
        </div>

        {/* Active Debt */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <CreditCard className="w-3.5 h-3.5 text-red-400" />
            <span>Total Debt</span>
          </div>
          <div className={`text-base sm:text-lg font-black font-numeric ${playerState.debt > 0 ? 'text-red-400' : 'text-[#22C55E]'}`}>
            {formatCurrency(playerState.debt)}
          </div>
          <span className="text-[10px] text-zinc-500 block">
            {playerState.monthlyEmi > 0 ? `₹${playerState.monthlyEmi.toLocaleString()}/mo EMI` : 'Debt-Free'}
          </span>
        </div>

        {/* Credit Score */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF5E1E]" />
            <span>Credit Score</span>
          </div>
          <div className="text-base sm:text-lg font-black font-numeric text-white">
            {playerState.creditScore}{' '}
            <span className="text-xs text-zinc-500 font-normal">/ 850</span>
          </div>
          <span className={`text-[10px] font-bold block ${creditRating.color}`}>
            {creditRating.label}
          </span>
        </div>

        {/* Invested Portfolio */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#FF5E1E]" />
            <span>Investments</span>
          </div>
          <div className="text-base sm:text-lg font-black font-numeric text-[#FF5E1E]">
            {formatCurrency(playerState.invested)}
          </div>
          <span className="text-[10px] text-zinc-500 block">Compounding Assets</span>
        </div>

        {/* Net Worth */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-[#27272A] col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Net Worth</span>
          </div>
          <div className="text-base sm:text-lg font-black font-numeric text-white">
            {formatCurrency(netWorth)}
          </div>
          <span className="text-[10px] text-zinc-500 block">
            Health: {playerState.health}/100
          </span>
        </div>
      </div>

      {/* Month Progress Stepper */}
      <div className="glass-card p-3.5 rounded-2xl border border-[#27272A] flex items-center justify-between gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6].map((m) => {
          const isCurrent = playerState.month === m && !isCompleted;
          const isPassed = playerState.month > m || isCompleted;

          return (
            <div
              key={m}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                isCurrent
                  ? 'bg-[#FF5E1E] text-white border-[#FF5E1E] shadow-brand-orange'
                  : isPassed
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40'
                  : 'bg-[#18181D] text-zinc-500 border-[#27272A]'
              }`}
            >
              {isPassed ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <span className="font-numeric">{m}</span>
              )}
              <span>Month {m}</span>
            </div>
          );
        })}
      </div>

      {!isCompleted ? (
        /* ACTIVE SCENARIO & DYNAMIC CHOICES */
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenario.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Scenario Narrative Card */}
            <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF5E1E]/15 text-[#FF5E1E] border border-[#FF5E1E]/40">
                  {currentScenario.subtitle}
                </span>

                <span className="text-xs font-bold text-zinc-400 font-numeric">
                  Decision Point {playerState.month} of 6
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {currentScenario.title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  {currentScenario.description}
                </p>
              </div>

              {/* Dynamic Decisions Grid (Availability depends strictly on previous choices!) */}
              <div className="pt-4 border-t border-[#27272A] space-y-3">
                <h3 className="text-sm font-black text-white">
                  Choose Your Next Move (Consequences Depend on Your Balance):
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {currentScenario.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;

                    // DYNAMIC LOCK CONDITION:
                    // Does this option require cash that the player does not have?
                    const isCashLocked = choice.requiredCash !== undefined && playerState.cash < choice.requiredCash;
                    const isDisabled = isCashLocked;

                    return (
                      <motion.button
                        key={choice.id}
                        whileHover={isDisabled ? undefined : { scale: 1.01 }}
                        whileTap={isDisabled ? undefined : { scale: 0.99 }}
                        onClick={() => !isDisabled && handleSelectChoice(choice)}
                        disabled={isDisabled}
                        className={`p-5 rounded-2xl text-left border transition-all text-left relative ${
                          isDisabled
                            ? 'bg-[#18181D]/40 border-[#27272A] opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#FF5E1E]/20 border-[#FF5E1E] shadow-brand-orange text-white cursor-pointer'
                            : 'bg-[#18181D] hover:bg-[#222328] border-[#27272A] hover:border-[#FF5E1E] text-zinc-200 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="space-y-1">
                            <span className="text-sm sm:text-base font-black text-white leading-snug block">
                              {choice.label}
                            </span>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {choice.description}
                            </p>
                          </div>

                          {isDisabled ? (
                            <div className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-950/60 border border-red-800 px-2.5 py-1 rounded-lg shrink-0">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Locked</span>
                            </div>
                          ) : (
                            <ChevronRight className="w-5 h-5 text-[#FF5E1E] shrink-0 mt-1" />
                          )}
                        </div>

                        {/* Lock Explanation Banner */}
                        {isCashLocked && (
                          <div className="mt-2 p-2 rounded-xl bg-red-950/40 border border-red-900/50 text-[11px] text-red-300 font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>
                              Requires {formatCurrency(choice.requiredCash!)} liquid cash. You only have {formatCurrency(playerState.cash)}! Your past spending choices locked this option.
                            </span>
                          </div>
                        )}

                        {/* Projected Impact Pills */}
                        {!isDisabled && (
                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#27272A]/60 text-[11px] font-bold font-numeric">
                            {choice.effects.cashDelta !== 0 && (
                              <span className={`px-2 py-0.5 rounded-md ${choice.effects.cashDelta > 0 ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-red-500/15 text-red-400'}`}>
                                {choice.effects.cashDelta > 0 ? `+${formatCurrency(choice.effects.cashDelta)}` : formatCurrency(choice.effects.cashDelta)} Cash
                              </span>
                            )}
                            {choice.effects.debtDelta !== 0 && (
                              <span className={`px-2 py-0.5 rounded-md ${choice.effects.debtDelta > 0 ? 'bg-red-500/15 text-red-400' : 'bg-[#22C55E]/15 text-[#22C55E]'}`}>
                                {choice.effects.debtDelta > 0 ? `+${formatCurrency(choice.effects.debtDelta)} Debt` : `${formatCurrency(choice.effects.debtDelta)} Debt Paid`}
                              </span>
                            )}
                            {choice.effects.monthlyEmiDelta > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400">
                                +₹{choice.effects.monthlyEmiDelta.toLocaleString()}/mo EMI
                              </span>
                            )}
                            {choice.effects.investedDelta > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-[#FF5E1E]/15 text-[#FF5E1E]">
                                +{formatCurrency(choice.effects.investedDelta)} Invested
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-md ${choice.effects.creditScoreDelta >= 0 ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-red-500/15 text-red-400'}`}>
                              {choice.effects.creditScoreDelta >= 0 ? `+${choice.effects.creditScoreDelta}` : choice.effects.creditScoreDelta} Credit Score
                            </span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      ) : (
        /* FINAL CAREER AUDIT OUTCOME CARD */
        <GlassCard className="p-6 sm:p-10 rounded-3xl border-2 border-[#FF5E1E] text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 text-xs font-black shadow-brand-orange">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>6-MONTH ODYSSEY COMPLETED • FINAL AUDIT APPROVED</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Congratulations, {state.player.name || 'FinQuester'}!
          </h2>

          <p className="text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            You navigated real-world emergencies, high-APR debt temptations, lifestyle peer pressures, and market cycles. Here is your final audit scorecard:
          </p>

          {/* Audit Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#18181D] border border-[#27272A] font-numeric text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Ending Net Worth</span>
              <span className="text-base sm:text-lg font-black text-white">{formatCurrency(netWorth)}</span>
            </div>
            <div className="border-l border-[#27272A]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Final Credit Score</span>
              <span className="text-base sm:text-lg font-black text-[#FF5E1E]">{playerState.creditScore}</span>
            </div>
            <div className="border-l border-[#27272A]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Active Debt Burden</span>
              <span className={`text-base sm:text-lg font-black ${playerState.debt === 0 ? 'text-[#22C55E]' : 'text-red-400'}`}>
                {playerState.debt === 0 ? '0 (Debt-Free)' : formatCurrency(playerState.debt)}
              </span>
            </div>
            <div className="border-l border-[#27272A]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Score</span>
              <span className="text-base sm:text-lg font-black text-[#22C55E]">{formatScore(playerState.score)} pts</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {onOpenCertificate && (
              <Button
                variant="orange"
                size="lg"
                className="w-full sm:w-auto shadow-brand-orange"
                icon={<Printer className="w-5 h-5 text-white" />}
                onClick={onOpenCertificate}
              >
                Claim Official Certificate
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={handleRestartSimulator}
            >
              Replay Simulation
            </Button>

            <Button
              variant="dark"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
            >
              Return to Hub
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
