import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface HealthMeterProps {
  score: number; // 0 to 100
  compact?: boolean;
  showLabel?: boolean;
}

export const HealthMeter: React.FC<HealthMeterProps> = ({
  score,
  compact = false,
  showLabel = true,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));

  let statusText = 'Critical';
  let colorClass = 'text-rose-400';
  let bgClass = 'bg-rose-500';
  let glowClass = 'shadow-neon-rose';
  let Icon = AlertTriangle;

  if (clamped >= 80) {
    statusText = 'Excellent';
    colorClass = 'text-emerald-400';
    bgClass = 'bg-emerald-500';
    glowClass = 'shadow-neon-emerald';
    Icon = ShieldCheck;
  } else if (clamped >= 60) {
    statusText = 'Healthy';
    colorClass = 'text-cyan-400';
    bgClass = 'bg-cyan-500';
    glowClass = 'shadow-neon-indigo';
    Icon = Activity;
  } else if (clamped >= 40) {
    statusText = 'Attention';
    colorClass = 'text-amber-400';
    bgClass = 'bg-amber-500';
    glowClass = 'shadow-amber-500/30';
    Icon = Zap;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Circular SVG Ring */}
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <motion.path
              initial={{ strokeDasharray: '0, 100' }}
              animate={{ strokeDasharray: `${clamped}, 100` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={colorClass}
              strokeWidth="3.5"
              strokeDasharray={`${clamped}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-bold font-numeric text-white">
            {clamped}
          </span>
        </div>
        {showLabel && (
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Health</span>
            <span className={`text-xs font-bold ${colorClass}`}>{statusText}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <Icon className={`w-4 h-4 ${colorClass}`} />
          <span>Financial Health Meter</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colorClass} bg-slate-800/80 border border-slate-700/50`}>
            {statusText}
          </span>
          <span className="font-numeric font-bold text-sm text-white">
            {clamped}/100
          </span>
        </div>
      </div>

      {/* Health Bar Track */}
      <div className="relative h-2.5 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${bgClass} ${glowClass} transition-colors duration-300`}
        />
      </div>
    </div>
  );
};
