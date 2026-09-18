import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, TrendingUp, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { SimulatorChoice } from '../../data/lifeSimulatorScenarios';
import { AIScenarioService } from '../../services/aiScenarioService';
import { formatCurrency } from '../../utils/formatters';
import { GlassCard } from '../ui/GlassCard';

interface WhatIfComparatorProps {
  chosenChoice: SimulatorChoice;
  allChoices: SimulatorChoice[];
  currentNetWorth: number;
}

export const WhatIfComparator: React.FC<WhatIfComparatorProps> = ({
  chosenChoice,
  allChoices,
  currentNetWorth,
}) => {
  // Find an alternative choice (default to first alternative)
  const alternatives = allChoices.filter((c) => c.id !== chosenChoice.id);
  const [selectedAltId, setSelectedAltId] = useState<string>(
    alternatives[0]?.id || ''
  );

  const alternativeChoice = alternatives.find((c) => c.id === selectedAltId) || alternatives[0];

  if (!alternativeChoice) return null;

  const projection = AIScenarioService.generateWhatIf(
    chosenChoice,
    alternativeChoice,
    currentNetWorth
  );

  return (
    <GlassCard className="p-5 sm:p-6 rounded-3xl border border-[#27272A] space-y-5 select-none text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF5E1E]/20 text-[#FF5E1E] flex items-center justify-center border border-[#FF5E1E]/40">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              The "What-If?" Compounding Comparator
            </h3>
            <p className="text-xs text-zinc-400">
              Projecting the 5-year divergence between alternative flight paths
            </p>
          </div>
        </div>

        {/* Alternative Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-bold">Compare vs:</span>
          <select
            value={selectedAltId}
            onChange={(e) => setSelectedAltId(e.target.value)}
            className="bg-[#18181D] border border-[#27272A] text-xs text-zinc-200 rounded-xl px-2.5 py-1.5 outline-none font-bold"
          >
            {alternatives.map((alt) => (
              <option key={alt.id} value={alt.id}>
                {alt.label.slice(0, 35)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side by side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Your Chosen Path */}
        <div className="p-4 rounded-2xl bg-[#18181D]/90 border border-[#FF5E1E]/50 relative space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
              Path You Took
            </span>
            <span className="text-xs font-bold text-zinc-400 truncate max-w-[180px]">
              {chosenChoice.label}
            </span>
          </div>

          <div className="space-y-2 font-numeric">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Year 1 Projected Net Worth:</span>
              <span className="font-black text-white">
                {formatCurrency(projection.currentChoiceOutcome.year1NetWorth)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Year 5 Compounded Wealth:</span>
              <span className="font-black text-lg text-[#FF5E1E]">
                {formatCurrency(projection.currentChoiceOutcome.year5NetWorth)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">5-Yr Total Interest Bleed:</span>
              <span
                className={`font-black ${
                  projection.currentChoiceOutcome.interestPaid5Years > 0 ? 'text-red-400' : 'text-[#22C55E]'
                }`}
              >
                {formatCurrency(projection.currentChoiceOutcome.interestPaid5Years)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#27272A]">
              <span className="text-zinc-400">Cashflow Stress Level:</span>
              <span
                className={`font-bold text-[11px] ${
                  projection.currentChoiceOutcome.stressLevel === 'Critical'
                    ? 'text-red-400'
                    : projection.currentChoiceOutcome.stressLevel === 'Moderate'
                    ? 'text-amber-400'
                    : 'text-[#22C55E]'
                }`}
              >
                {projection.currentChoiceOutcome.stressLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Alternative Path */}
        <div className="p-4 rounded-2xl bg-[#18181D]/50 border border-[#27272A] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-numeric">
              Alternative Flight Path
            </span>
            <span className="text-xs font-bold text-zinc-400 truncate max-w-[180px]">
              {alternativeChoice.label}
            </span>
          </div>

          <div className="space-y-2 font-numeric">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Year 1 Projected Net Worth:</span>
              <span className="font-black text-white">
                {formatCurrency(projection.alternativeChoiceOutcome.year1NetWorth)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Year 5 Compounded Wealth:</span>
              <span className="font-black text-lg text-[#22C55E]">
                {formatCurrency(projection.alternativeChoiceOutcome.year5NetWorth)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">5-Yr Total Interest Bleed:</span>
              <span
                className={`font-black ${
                  projection.alternativeChoiceOutcome.interestPaid5Years > 0 ? 'text-red-400' : 'text-[#22C55E]'
                }`}
              >
                {formatCurrency(projection.alternativeChoiceOutcome.interestPaid5Years)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#27272A]">
              <span className="text-zinc-400">Cashflow Stress Level:</span>
              <span
                className={`font-bold text-[11px] ${
                  projection.alternativeChoiceOutcome.stressLevel === 'Critical'
                    ? 'text-red-400'
                    : projection.alternativeChoiceOutcome.stressLevel === 'Moderate'
                    ? 'text-amber-400'
                    : 'text-[#22C55E]'
                }`}
              >
                {projection.alternativeChoiceOutcome.stressLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divergence Summary Box */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FF5E1E]/15 to-transparent border border-[#FF5E1E]/30 flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-xs text-zinc-200 leading-relaxed font-bold">
          {projection.divergenceSummary}
        </p>
      </div>
    </GlassCard>
  );
};

