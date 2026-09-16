import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CompoundDebtChartProps {
  initialPrincipal: number;
  annualRatePct: number;
  minimumPayment: number;
  months?: number[];
  minimumPayBalances?: number[];
  totalInterestMin?: number;
}

export const CompoundDebtChart: React.FC<CompoundDebtChartProps> = ({
  initialPrincipal = 25000,
  annualRatePct = 36,
  minimumPayment = 1250,
  months = [0, 3, 6, 9, 12, 18, 24],
  minimumPayBalances,
  totalInterestMin = 14500,
}) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'math'>('chart');

  // Fallback realistic balances if not passed
  const points = minimumPayBalances || [
    initialPrincipal,
    Math.round(initialPrincipal * 1.05),
    Math.round(initialPrincipal * 1.09),
    Math.round(initialPrincipal * 1.12),
    Math.round(initialPrincipal * 1.16),
    Math.round(initialPrincipal * 1.22),
    Math.round(initialPrincipal * 1.30),
  ];

  const maxVal = Math.max(initialPrincipal * 1.4, ...points);

  // SVG dimensions
  const width = 500;
  const height = 220;
  const padding = 45;

  const getX = (index: number) => {
    return padding + (index / (points.length - 1)) * (width - padding * 2);
  };

  const getY = (val: number) => {
    return height - padding - (val / maxVal) * (height - padding * 2);
  };

  // SVG path generation for minimum payment curve (danger red)
  const dangerPathD = points.reduce((acc, val, i) => {
    const x = getX(i);
    const y = getY(val);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // SVG path generation for Pay In Full curve (emerald green - drops to 0 at month 1)
  const fullPayPathD = `M ${getX(0)} ${getY(initialPrincipal)} L ${getX(1)} ${getY(0)} L ${getX(points.length - 1)} ${getY(0)}`;

  return (
    <div className="w-full glass-card rounded-2xl p-4 sm:p-5 border border-slate-700/60 select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Compound Debt Simulator</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-numeric">
                {annualRatePct}% APR
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Visualizing how unpaid balances compound against you over 24 months
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'chart' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Visual Curve
          </button>
          <button
            onClick={() => setActiveTab('math')}
            className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'math' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            The Math Breakdown
          </button>
        </div>
      </div>

      {activeTab === 'chart' ? (
        <div className="space-y-3">
          {/* Responsive SVG Chart */}
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 sm:h-56">
              {/* Horizontal Grid lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = height - padding - ratio * (height - padding * 2);
                const val = Math.round(ratio * maxVal);
                return (
                  <g key={i}>
                    <line
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="#334155"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-slate-500 font-numeric"
                    >
                      {formatCurrency(val)}
                    </text>
                  </g>
                );
              })}

              {/* Pay in Full (Green Curve) */}
              <motion.path
                d={fullPayPathD}
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />

              {/* Minimum Payment Trap (Red Curve) */}
              <motion.path
                d={dangerPathD}
                fill="none"
                stroke="#EF4444"
                strokeWidth="3.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />

              {/* Data points for minimum payment */}
              {points.map((val, i) => {
                const x = getX(i);
                const y = getY(val);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    className="fill-rose-500 stroke-slate-900 stroke-2"
                  />
                );
              })}

              {/* X Axis Labels */}
              {months.map((m, i) => {
                const x = getX(i);
                return (
                  <text
                    key={i}
                    x={x}
                    y={height - 15}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-400 font-numeric"
                  >
                    M{m}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Comparative Stat Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-300 block">Minimum Payment Trap</span>
                <span className="text-[11px] text-slate-300">
                  Paying ~{formatCurrency(minimumPayment)}/mo takes 5+ years. You pay{' '}
                  <strong className="text-rose-400 font-numeric font-bold">+{formatCurrency(totalInterestMin)}</strong> in interest alone!
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300 block">Paid in Full</span>
                <span className="text-[11px] text-slate-300">
                  Balance clears in 30 days. You pay{' '}
                  <strong className="text-emerald-400 font-numeric font-bold">₹0 in interest</strong> and keep maximum credit score.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-2">
          <div className="font-bold text-white text-sm">
            Why High APR Compounding Crushes Borrowers:
          </div>
          <p className="leading-relaxed">
            Credit cards and predatory apps calculate interest <span className="text-amber-400 font-semibold">daily</span>. At 36% APR, the daily periodic rate is <span className="font-mono text-indigo-300">0.0986%</span>.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-indigo-200 border border-slate-800 space-y-1">
            <div>Month 1: Balance = ₹{initialPrincipal.toLocaleString()}</div>
            <div>Monthly Interest = ₹{Math.round(initialPrincipal * (annualRatePct / 100 / 12)).toLocaleString()}</div>
            <div>Your ₹{minimumPayment.toLocaleString()} payment mostly covers interest, barely reducing principal!</div>
          </div>
          <p className="text-[11px] text-slate-400">
            Rule of 72: At 36% interest, an unpaid debt doubles in just <strong>2 years</strong> (72 / 36 = 2).
          </p>
        </div>
      )}
    </div>
  );
};
