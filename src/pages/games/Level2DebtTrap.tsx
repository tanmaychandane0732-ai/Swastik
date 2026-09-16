import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ArrowRight, CheckCircle2, ChevronRight, AlertOctagon, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../contexts/GameContext';
import { DEBT_SCENARIOS } from '../../data/debtScenarios';
import { DebtScenarioOption } from '../../types/scenarios';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { CompoundDebtChart } from '../../components/charts/CompoundDebtChart';
import { formatCurrency } from '../../utils/formatters';

export const Level2DebtTrap: React.FC = () => {
  const { dispatch, showFeedback } = useGame();
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const scenario = DEBT_SCENARIOS[currentScenarioIndex];
  const isLastScenario = currentScenarioIndex === DEBT_SCENARIOS.length - 1;

  const handleSelectOption = (option: DebtScenarioOption) => {
    setSelectedOptionId(option.id);
    const result = option.result;

    if (result.isOptimal) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }

    // Record decision in global state
    dispatch({
      type: 'RECORD_DEBT_DECISION',
      payload: result,
    });

    // Show educational feedback modal
    showFeedback({
      title: result.title,
      verdict: result.isOptimal ? 'success' : 'danger',
      headline: result.explanation,
      financialImpact: {
        netWorthDelta: result.netWorthImpact,
        healthDelta: result.healthImpact,
        scoreDelta: result.scoreImpact,
        debtDelta: result.debtImpact,
      },
      whyItHappened: result.whyExplanation,
      whatYouShouldLearn: result.isOptimal
        ? 'Living debt-free preserves 100% of your income for compounding investment returns.'
        : 'Consumer debt acts like reverse compounding interest: it drains your wealth while making lenders rich.',
      didYouKnow: 'At 36% APR credit card rates, paying only the minimum due triples the total amount paid on typical consumer electronics.',
      onContinue: () => {
        if (!isLastScenario) {
          setCurrentScenarioIndex(prev => prev + 1);
          setSelectedOptionId(null);
        } else {
          // Completed Level 2
          dispatch({
            type: 'COMPLETE_LEVEL',
            payload: {
              levelNumber: 2,
              levelScore: 900,
            },
          });
          dispatch({ type: 'SET_STAGE', payload: 'level3' });
        }
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Level Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card rounded-2xl p-5 border border-[#27272A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
              Level 2 Dungeon
            </span>
            <span className="text-xs font-bold text-zinc-400">
              Predatory Debt & Compound Interest Traps
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Credit & Debt Trap Dungeon
          </h1>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center gap-2 bg-[#18181D] px-3.5 py-2 rounded-xl border border-[#27272A]">
          <span className="text-xs text-zinc-400 font-bold">Scenario:</span>
          <div className="flex items-center gap-1.5 font-numeric font-black text-sm text-white">
            <span className="text-[#FF5E1E]">{currentScenarioIndex + 1}</span>
            <span className="text-zinc-600">/</span>
            <span>{DEBT_SCENARIOS.length}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Main Scenario Card */}
          <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF5E1E]/15 text-[#FF5E1E] border border-[#FF5E1E]/40 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                {scenario.badge}
              </span>
              <span className="text-sm font-bold font-numeric text-zinc-300">
                Amount: <strong className="text-white text-base font-black">{formatCurrency(scenario.principalAmount)}</strong>
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {scenario.title}
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {scenario.description}
              </p>
            </div>

            {/* Quoted Terms vs Hidden Catch Inspection Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-1">
                <span className="text-[11px] font-black text-[#FF5E1E] uppercase tracking-wider block">
                  Promoted Marketing Claim:
                </span>
                <p className="text-xs sm:text-sm text-zinc-200 font-medium">
                  {scenario.quotedTerms}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18181D] border border-red-500/40 space-y-1">
                <span className="text-[11px] font-black text-red-400 uppercase tracking-wider block flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Hidden Fine Print Trap:
                </span>
                <p className="text-xs sm:text-sm text-zinc-200 font-medium">
                  {scenario.hiddenCatch}
                </p>
              </div>
            </div>

            {/* Visual Compound Debt Curve for this scenario */}
            <div className="pt-2">
              <CompoundDebtChart
                initialPrincipal={scenario.principalAmount}
                annualRatePct={scenario.category === 'CREDIT_CARD' ? 36 : scenario.category === 'PREDATORY_LOAN' ? 38 : 28}
                minimumPayment={scenario.category === 'CREDIT_CARD' ? 1250 : scenario.category === 'PREDATORY_LOAN' ? 3500 : 2000}
              />
            </div>

            {/* Decision Choices */}
            <div className="pt-4 border-t border-[#27272A] space-y-3">
              <h3 className="text-sm font-black text-white">
                Choose Your Financial Move:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scenario.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;

                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleSelectOption(option)}
                      className={`p-5 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF5E1E]/20 border-[#FF5E1E] shadow-brand-orange text-white'
                          : 'bg-[#18181D] hover:bg-[#222328] border-[#27272A] hover:border-[#FF5E1E] text-zinc-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-sm sm:text-base font-black text-white leading-snug">
                          {option.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#FF5E1E] shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {option.tagline}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
