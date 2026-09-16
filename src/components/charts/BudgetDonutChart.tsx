import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

interface BudgetDonutChartProps {
  needs: number;
  wants: number;
  savings: number;
  income: number;
}

export const BudgetDonutChart: React.FC<BudgetDonutChartProps> = ({
  needs,
  wants,
  savings,
  income,
}) => {
  const safeIncome = Math.max(1, income);
  const totalAllocated = needs + wants + savings;
  const remaining = safeIncome - totalAllocated;

  const needsPct = Math.min(100, (needs / safeIncome) * 100);
  const wantsPct = Math.min(100, (wants / safeIncome) * 100);
  const savingsPct = Math.min(100, (savings / safeIncome) * 100);

  // SVG parameters
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12

  const needsStroke = (needsPct / 100) * circumference;
  const wantsStroke = (wantsPct / 100) * circumference;
  const savingsStroke = (savingsPct / 100) * circumference;

  const needsOffset = 0;
  const wantsOffset = -needsStroke;
  const savingsOffset = -(needsStroke + wantsStroke);

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            strokeWidth="16"
            stroke="#1E293B"
            fill="none"
          />

          {/* Needs Segment */}
          {needsPct > 0 && (
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              strokeWidth="16"
              stroke="#6366F1"
              fill="none"
              strokeDasharray={`${needsStroke} ${circumference}`}
              strokeDashoffset={needsOffset}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${needsStroke} ${circumference}` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}

          {/* Wants Segment */}
          {wantsPct > 0 && (
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              strokeWidth="16"
              stroke="#F59E0B"
              fill="none"
              strokeDasharray={`${wantsStroke} ${circumference}`}
              strokeDashoffset={wantsOffset}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${wantsStroke} ${circumference}` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}

          {/* Savings Segment */}
          {savingsPct > 0 && (
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              strokeWidth="16"
              stroke="#10B981"
              fill="none"
              strokeDasharray={`${savingsStroke} ${circumference}`}
              strokeDashoffset={savingsOffset}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${savingsStroke} ${circumference}` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {remaining >= 0 ? 'Remaining' : 'Deficit'}
          </span>
          <span className={`text-sm sm:text-base font-extrabold font-numeric ${remaining >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {formatCurrency(Math.abs(remaining))}
          </span>
          <span className="text-[10px] text-slate-400 font-numeric">
            {Math.round((totalAllocated / safeIncome) * 100)}% Allocated
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-neon-indigo" />
          <span className="text-slate-300 font-medium">Needs ({Math.round(needsPct)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-amber-500/30" />
          <span className="text-slate-300 font-medium">Wants ({Math.round(wantsPct)}%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-neon-emerald" />
          <span className="text-slate-300 font-medium">Savings ({Math.round(savingsPct)}%)</span>
        </div>
      </div>
    </div>
  );
};
