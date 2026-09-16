import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { soundManager } from '../../services/audioService';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  percentage: number;
  codeTag?: string; // e.g. "S618", "BNSF270668" from user reference image
  color?: 'emerald' | 'indigo' | 'amber' | 'cyan' | 'orange';
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
  step = 1000,
  percentage,
  codeTag,
  color = 'indigo',
  benchmarkLabel,
  benchmarkPct,
  onChange,
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (disabled) return;
    const next = Math.max(min, value - step);
    soundManager.playClick();
    onChange(next);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const next = Math.min(max, value + step);
    soundManager.playClick();
    onChange(next);
  };

  const colorClasses = {
    emerald: 'accent-emerald-500 text-emerald-400',
    indigo: 'accent-indigo-500 text-indigo-400',
    amber: 'accent-amber-500 text-amber-400',
    cyan: 'accent-cyan-500 text-cyan-400',
    orange: 'accent-orange-500 text-orange-400',
  };

  return (
    <div className="space-y-3 select-none">
      {/* Top Meta Bar */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          {codeTag && (
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/60 tracking-wider">
              {codeTag}
            </span>
          )}
          <span className="font-semibold text-slate-200">{label}</span>
          {benchmarkLabel && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 hidden sm:inline-block">
              Target: {benchmarkLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 font-numeric">
          <span className={`font-extrabold text-base ${colorClasses[color]}`}>
            {formatCurrency(value)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-bold border border-slate-700/50">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Stepper Slider Control (Inspired directly by user reference Image 1) */}
      <div className="flex items-center gap-3">
        {/* Minus Circular Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label="Decrease allocation"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none border border-slate-700/80 flex items-center justify-center text-slate-200 transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <Minus className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Minimalist hairline slider track */}
        <div className="relative flex-1 py-2 flex items-center">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`w-full h-1.5 bg-slate-700/80 rounded-full appearance-none cursor-pointer slider-minimalist focus:outline-none focus:ring-2 focus:ring-indigo-500 ${colorClasses[color]}`}
          />

          {/* Benchmark Notch Indicator */}
          {benchmarkPct !== undefined && (
            <div
              className="absolute w-1 h-3.5 bg-slate-400/60 rounded-full pointer-events-none transform -translate-x-1/2"
              style={{ left: `${benchmarkPct}%` }}
              title={`Target Benchmark: ${benchmarkPct}%`}
            />
          )}
        </div>

        {/* Plus Circular Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label="Increase allocation"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none border border-slate-700/80 flex items-center justify-center text-slate-200 transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Range Scale */}
      <div className="flex justify-between text-[11px] text-slate-500 font-numeric px-1">
        <span>Min: {formatCurrency(min)}</span>
        <span>Max: {formatCurrency(max)}</span>
      </div>
    </div>
  );
};
