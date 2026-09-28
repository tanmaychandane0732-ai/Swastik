import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Lightbulb, PieChart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../contexts/GameContext';
import { Slider } from '../../components/ui/Slider';
import { BudgetDonutChart } from '../../components/charts/BudgetDonutChart';
import { Button } from '../../components/ui/Button';
import { calculateBudgetScore } from '../../utils/financialMath';
import { formatCurrency } from '../../utils/formatters';
import { BUDGET_EXPENSE_EXAMPLES, BUDGET_DID_YOU_KNOW } from '../../data/budgetData';

export const Level1Budgeting: React.FC = () => {
  const { state, dispatch, showFeedback } = useGame();
  const monthlyIncome = state.budget.income || 60000;
  const isLight = state.settings.theme === 'light';

  // Initialize sliders with existing or sensible defaults (50/30/20 target)
  const [needs, setNeeds] = useState(state.budget.needs || 30000);
  const [wants, setWants] = useState(state.budget.wants || 18000);
  const [savings, setSavings] = useState(state.budget.savings || 12000);

  // Live evaluation of current slider state
  const liveResult = calculateBudgetScore(monthlyIncome, needs, wants, savings);

  const handleApplyPreset = (preset: 'optimal' | 'splurge' | 'frugal') => {
    if (preset === 'optimal') {
      setNeeds(Math.round(monthlyIncome * 0.5)); // 50%
      setWants(Math.round(monthlyIncome * 0.3)); // 30%
      setSavings(Math.round(monthlyIncome * 0.2)); // 20%
    } else if (preset === 'splurge') {
      setNeeds(Math.round(monthlyIncome * 0.45));
      setWants(Math.round(monthlyIncome * 0.45));
      setSavings(Math.round(monthlyIncome * 0.1));
    } else if (preset === 'frugal') {
      setNeeds(Math.round(monthlyIncome * 0.5));
      setWants(Math.round(monthlyIncome * 0.15));
      setSavings(Math.round(monthlyIncome * 0.35));
    }
  };

  const handleSubmit = () => {
    const evaluation = calculateBudgetScore(monthlyIncome, needs, wants, savings);

    if (evaluation.isBalanced) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    dispatch({
      type: 'SUBMIT_BUDGET',
      payload: {
        needs,
        wants,
        savings,
        score: evaluation.score,
        netWorthChange: evaluation.netWorthDelta,
        healthChange: evaluation.healthDelta,
      },
    });

    dispatch({
      type: 'COMPLETE_LEVEL',
      payload: {
        levelNumber: 1,
        levelScore: evaluation.score,
      },
    });

    // Educational feedback popup
    showFeedback({
      title: 'Level 1: Budget Allocation Result',
      verdict: evaluation.status === 'excellent' ? 'success' : evaluation.status === 'healthy' ? 'success' : evaluation.status === 'warning' ? 'warning' : 'danger',
      headline: evaluation.feedback,
      financialImpact: {
        netWorthDelta: evaluation.netWorthDelta,
        healthDelta: evaluation.healthDelta,
        scoreDelta: evaluation.score,
      },
      whyItHappened: `You allocated ${evaluation.needsPct}% to Needs, ${evaluation.wantsPct}% to Wants, and ${evaluation.savingsPct}% to Savings. The golden 50/30/20 standard protects your lifestyle while building non-negotiable wealth.`,
      whatYouShouldLearn: evaluation.savingsPct < 20
        ? 'Increasing savings to at least 20% cushions you against debt traps when unexpected expenses arise.'
        : 'Maintaining under 30% in Wants prevents lifestyle creep and ensures your cashflow works for your future.',
      didYouKnow: BUDGET_DID_YOU_KNOW[0],
      onContinue: () => {
        dispatch({ type: 'SET_STAGE', payload: 'level2' });
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card rounded-2xl p-5 border border-[#27272A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
              Level 1 Arena
            </span>
            <span className="text-xs font-bold text-zinc-400">
              The 50/30/20 Allocation Standard
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Income & Budgeting Arena
          </h1>
        </div>

        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border shrink-0 ${isLight ? 'bg-black/04 border-black/08' : 'bg-[#18181D] border-[#27272A]'}`}>
          <div className="flex flex-col">
            <span className={`text-[10px] uppercase font-bold ${isLight ? 'text-[#9EA3AD]' : 'text-zinc-400'}`}>
              Monthly Salary
            </span>
            <span className="text-lg font-black font-numeric text-[#FF5E1E]">
              {formatCurrency(monthlyIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Arena: Sliders on Left, Live Donut Chart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Sliders Column */}
        <div className={`lg:col-span-7 glass-card rounded-3xl p-5 sm:p-7 border space-y-6 ${isLight ? 'border-black/10' : 'border-[#27272A]'}`}>
          <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-black/08' : 'border-[#27272A]'}`}>
            <h2 className={`text-base font-black flex items-center gap-2 ${isLight ? 'text-[#17191D]' : 'text-white'}`}>
              <PieChart className="w-4 h-4 text-[#FF5E1E]" />
              Adjust Category Buckets
            </h2>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`text-[11px] hidden sm:inline ${isLight ? 'text-[#9EA3AD]' : 'text-zinc-400'}`}>Presets:</span>
              <button
                onClick={() => handleApplyPreset('optimal')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${isLight ? 'bg-black/04 hover:bg-black/08 text-[#444] border-black/08 hover:border-[#FF5E1E]' : 'bg-[#18181D] hover:bg-[#222328] text-zinc-200 border-[#27272A] hover:border-[#FF5E1E]'}`}
                title="50% Needs, 30% Wants, 20% Savings"
              >
                50/30/20 Ideal
              </button>
              <button
                onClick={() => handleApplyPreset('splurge')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${isLight ? 'bg-black/04 hover:bg-black/08 text-[#444] border-black/08 hover:border-[#FF5E1E]' : 'bg-[#18181D] hover:bg-[#222328] text-zinc-200 border-[#27272A] hover:border-[#FF5E1E]'}`}
                title="Heavy luxury spending"
              >
                Splurge
              </button>
            </div>
          </div>

          {/* Slider 1: Needs */}
          <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-black/03 border-black/08' : 'bg-[#18181D] border-[#27272A]'}`}>
            <Slider
              codeTag="S618"
              label="1. Essential Needs"
              value={needs}
              min={0}
              max={monthlyIncome}
              step={1000}
              percentage={liveResult.needsPct}
              color="orange"
              benchmarkLabel="50%"
              benchmarkPct={50}
              onChange={setNeeds}
            />
            <div className={`text-[11px] flex flex-wrap gap-x-3 gap-y-1 pt-1 ${isLight ? 'text-[#9EA3AD]' : 'text-zinc-400'}`}>
              <span>Rent &amp; Utilities</span>
              <span>•</span>
              <span>Groceries</span>
              <span>•</span>
              <span>Health Insurance</span>
            </div>
          </div>

          {/* Slider 2: Wants */}
          <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-black/03 border-black/08' : 'bg-[#18181D] border-[#27272A]'}`}>
            <Slider
              codeTag="S620"
              label="2. Lifestyle Wants"
              value={wants}
              min={0}
              max={monthlyIncome}
              step={1000}
              percentage={liveResult.wantsPct}
              color="amber"
              benchmarkLabel="30%"
              benchmarkPct={30}
              onChange={setWants}
            />
            <div className={`text-[11px] flex flex-wrap gap-x-3 gap-y-1 pt-1 ${isLight ? 'text-[#9EA3AD]' : 'text-zinc-400'}`}>
              <span>Dining out</span>
              <span>•</span>
              <span>Gadgets &amp; Fashion</span>
              <span>•</span>
              <span>Streaming &amp; Travel</span>
            </div>
          </div>

          {/* Slider 3: Savings */}
          <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-black/03 border-black/08' : 'bg-[#18181D] border-[#27272A]'}`}>
            <Slider
              codeTag="S621"
              label="3. Future Savings & Investments"
              value={savings}
              min={0}
              max={monthlyIncome}
              step={1000}
              percentage={liveResult.savingsPct}
              color="emerald"
              benchmarkLabel="20%"
              benchmarkPct={20}
              onChange={setSavings}
            />
            <div className={`text-[11px] flex flex-wrap gap-x-3 gap-y-1 pt-1 ${isLight ? 'text-[#9EA3AD]' : 'text-zinc-400'}`}>
              <span>Emergency Cushion (3-6 mo)</span>
              <span>•</span>
              <span>Index Fund SIP</span>
            </div>
          </div>

          {/* Live Alert Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs sm:text-sm ${
              liveResult.status === 'excellent'
                ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
                : liveResult.status === 'healthy'
                ? 'bg-[#FF5E1E]/15 border-[#FF5E1E]/40 text-[#FF5E1E]'
                : liveResult.status === 'warning'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-red-500/15 border-red-500/40 text-red-300'
            }`}
          >
            {liveResult.status === 'excellent' || liveResult.status === 'healthy' ? (
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">
              <span className="font-bold block mb-0.5">
                {liveResult.status === 'excellent' ? 'Optimal Financial Alignment' : liveResult.status === 'healthy' ? 'Balanced Allocation' : 'Budget Warning'}
              </span>
              <span>{liveResult.feedback}</span>
            </div>
          </div>
        </div>

        {/* Live Visualization Column */}
        <div className={`lg:col-span-5 flex flex-col justify-between glass-card rounded-3xl p-5 sm:p-7 border space-y-6 ${isLight ? 'border-black/10' : 'border-[#27272A]'}`}>
          <div>
            <h2 className={`text-base font-black mb-1 ${isLight ? 'text-[#17191D]' : 'text-white'}`}>
              Live Allocation Breakdown
            </h2>
            <p className={`text-xs mb-4 ${isLight ? 'text-[#656A73]' : 'text-zinc-400'}`}>
              Real-time balance against your ₹60,000 monthly cashflow
            </p>

            {/* Donut Chart */}
            <BudgetDonutChart
              needs={needs}
              wants={wants}
              savings={savings}
              income={monthlyIncome}
            />
          </div>

          {/* Educational Quick Tip */}
          <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${isLight ? 'bg-black/03 border-black/08 text-[#444]' : 'bg-[#18181D] border-[#27272A] text-zinc-300'}`}>
            <div className="flex items-center gap-1.5 font-black text-[#FF5E1E]">
              <Lightbulb className="w-4 h-4" />
              <span>Pro Rule: Pay Yourself First</span>
            </div>
            <p className={`leading-relaxed text-[11px] ${isLight ? 'text-[#656A73]' : 'text-zinc-400'}`}>
              Don't save what is left after spending. Instead, automate your 20% savings on the day your salary credits, then spend what is left!
            </p>
          </div>

          {/* Submit Allocation CTA */}
          <div className="pt-2">
            <Button
              variant="orange"
              size="lg"
              className="w-full text-sm font-black shadow-brand-orange"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={handleSubmit}
            >
              Lock In Budget &amp; Check Score
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
