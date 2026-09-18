import React from 'react';
import { motion } from 'framer-motion';
import { History, CheckCircle2, AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react';
import { FlightLogEntry } from '../../types/flightSimulator';
import { formatCurrency } from '../../utils/formatters';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface DecisionReplayTimelineProps {
  logs: FlightLogEntry[];
  onRewindToMonth?: (month: number) => void;
}

export const DecisionReplayTimeline: React.FC<DecisionReplayTimelineProps> = ({
  logs,
  onRewindToMonth,
}) => {
  if (!logs || logs.length === 0) return null;

  // Find the critical turbulence point
  const turbulencePoint = logs.find((l) => !l.isOptimal && (l.debtDelta > 0 || l.cashDelta < -20000));

  return (
    <GlassCard className="p-5 sm:p-6 rounded-3xl border border-[#27272A] space-y-5 select-none text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FF5E1E]/20 text-[#FF5E1E] flex items-center justify-center border border-[#FF5E1E]/40">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              Flight Recorder & Decision Timeline (Black Box)
            </h3>
            <p className="text-xs text-zinc-400">
              Audit your flight telemetry and identify your critical turning points
            </p>
          </div>
        </div>

        {turbulencePoint && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800 text-[11px] text-amber-300 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Turbulence Detected at Month {turbulencePoint.month}</span>
          </div>
        )}
      </div>

      {/* Timeline entries */}
      <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#27272A]">
        {logs.map((entry) => {
          const isTurbulent = entry.month === turbulencePoint?.month;

          return (
            <div key={entry.month} className="relative pl-9 space-y-1">
              {/* Bullet Node */}
              <div
                className={`absolute left-2.5 -translate-x-1/2 top-2.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                  isTurbulent
                    ? 'bg-red-500 border-white ring-4 ring-red-500/20'
                    : entry.isOptimal
                    ? 'bg-[#22C55E] border-[#18181D]'
                    : 'bg-amber-400 border-[#18181D]'
                }`}
              />

              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isTurbulent
                    ? 'bg-red-950/30 border-red-800/80 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    : 'bg-[#18181D] border-[#27272A]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-numeric">
                      Month {entry.month}
                    </span>
                    <span className="text-xs font-black text-white">
                      {entry.scenarioTitle}
                    </span>
                  </div>

                  <span className="text-xs font-bold font-numeric text-zinc-400">
                    Altitude: {formatCurrency(entry.netWorthResult)}
                  </span>
                </div>

                <p className="text-xs text-zinc-300">
                  <span className="text-zinc-500 font-bold">Action Taken:</span> {entry.choiceSelected}
                </p>

                {/* Impact Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-[#27272A]/60 font-numeric text-[11px]">
                  <div className="flex items-center gap-2">
                    {entry.cashDelta !== 0 && (
                      <span className={entry.cashDelta > 0 ? 'text-[#22C55E]' : 'text-red-400'}>
                        Cash: {entry.cashDelta > 0 ? `+${formatCurrency(entry.cashDelta)}` : formatCurrency(entry.cashDelta)}
                      </span>
                    )}
                    {entry.debtDelta !== 0 && (
                      <span className={entry.debtDelta > 0 ? 'text-red-400' : 'text-[#22C55E]'}>
                        Debt: {entry.debtDelta > 0 ? `+${formatCurrency(entry.debtDelta)}` : formatCurrency(entry.debtDelta)}
                      </span>
                    )}
                  </div>

                  {onRewindToMonth && (
                    <button
                      onClick={() => onRewindToMonth(entry.month)}
                      className="text-[11px] font-bold text-[#FF5E1E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rewind to this Month</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

