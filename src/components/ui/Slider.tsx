import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  percentage: number;
  color?: 'emerald' | 'indigo' | 'amber' | 'cyan';
  benchmarkLabel?: string;
  benchmarkPct?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 500,
  percentage,
  color = 'indigo',
  benchmarkLabel,
  benchmarkPct,
  onChange,
  disabled = false,
}) => {
  const colorMap = {
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      accent: 'accent-emerald-500',
      glow: 'shadow-neon-emerald',
    },
    indigo: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500',
      accent: 'accent-indigo-500',
      glow: 'shadow-neon-indigo',
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500',
      accent: 'accent-amber-500',
      glow: 'shadow-amber-500/40',
    },
    cyan: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500',
      accent: 'accent-cyan-500',
      glow: 'shadow-cyan-500/40',
    },
  };

  const selectedTheme = colorMap[color];

  return (
    <div className="space-y-2 select-none">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">{label}</span>
          {benchmarkLabel && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
              Target: {benchmarkLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 font-numeric">
          <span className={`font-bold text-base ${selectedTheme.text}`}>
            {formatCurrency(value)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-bold border border-slate-700/50">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="relative pt-1 pb-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${selectedTheme.accent} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-fin-bg focus:ring-indigo-500 transition-all`}
        />

        {benchmarkPct !== undefined && (
          <div
            className="absolute -top-1 w-1 h-5 bg-slate-400/60 rounded pointer-events-none transform -translate-x-1/2"
            style={{ left: `${benchmarkPct}%` }}
            title={`Benchmark ${benchmarkPct}%`}
          />
        )}
      </div>

      <div className="flex justify-between text-[11px] text-slate-500 font-numeric">
        <span>{formatCurrency(min)}</span>
        <span>Max: {formatCurrency(max)}</span>
      </div>
    </div>
  );
};
