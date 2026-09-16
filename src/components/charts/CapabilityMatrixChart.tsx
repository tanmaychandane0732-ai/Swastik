import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface CapabilityMatrixProps {
  savingsScore?: number;    // 0 to 100 (Top)
  debtDefenseScore?: number;// 0 to 100 (Left)
  investmentScore?: number; // 0 to 100 (Right)
  scamRadarScore?: number;  // 0 to 100 (Bottom)
  overallPct?: number;
  statusLabel?: string;
  className?: string;
}

export const CapabilityMatrixChart: React.FC<CapabilityMatrixProps> = ({
  savingsScore = 88,
  debtDefenseScore = 92,
  investmentScore = 80,
  scamRadarScore = 85,
  overallPct = 85,
  statusLabel = 'Resilient Capital Performance',
  className = '',
}) => {
  // Grid parameters
  const gridSize = 15; // 15x15 dots
  const width = 340;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;
  const step = 14;

  // Generate matrix dots
  const dots: { x: number; y: number; isInCluster: boolean; isCenter: boolean }[] = [];

  // Compute normalized polygon vertices based on financial scores
  // Top (Savings), Left (Debt), Right (Investment), Bottom (Scam)
  const topRadius = (savingsScore / 100) * 80;
  const leftRadius = (debtDefenseScore / 100) * 80;
  const rightRadius = (investmentScore / 100) * 80;
  const bottomRadius = (scamRadarScore / 100) * 80;

  const pTop = { x: cx, y: cy - topRadius };
  const pRight = { x: cx + rightRadius, y: cy };
  const pBottom = { x: cx, y: cy + bottomRadius };
  const pLeft = { x: cx - leftRadius, y: cy };

  // Helper point-in-polygon algorithm to highlight dots in the capability cluster
  const isInsidePoly = (px: number, py: number) => {
    // Check against 4 quadrants of the diamond
    if (px >= cx && py <= cy) {
      // Top-right
      return (px - cx) / rightRadius + (cy - py) / topRadius <= 1;
    } else if (px <= cx && py <= cy) {
      // Top-left
      return (cx - px) / leftRadius + (cy - py) / topRadius <= 1;
    } else if (px <= cx && py >= cy) {
      // Bottom-left
      return (cx - px) / leftRadius + (py - cy) / bottomRadius <= 1;
    } else {
      // Bottom-right
      return (px - cx) / rightRadius + (py - cy) / bottomRadius <= 1;
    }
  };

  const half = Math.floor(gridSize / 2);
  for (let row = -half; row <= half; row++) {
    for (let col = -half; col <= half; col++) {
      const x = cx + col * step;
      const y = cy + row * step;
      dots.push({
        x,
        y,
        isInCluster: isInsidePoly(x, y),
        isCenter: row === 0 && col === 0,
      });
    }
  }

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Floating Status Pill (Directly from reference Image 3) */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-2 z-20 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-glass backdrop-blur-md text-xs font-semibold"
      >
        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{overallPct}%</span>
        </span>
        <span className="text-slate-400 font-normal">•</span>
        <span className="text-slate-200 text-[11px] font-medium">{statusLabel}</span>
      </motion.div>

      {/* Dotted Grid SVG Matrix */}
      <div className="relative w-full max-w-[340px] h-[300px] flex items-center justify-center pt-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Subtle axis crosshairs */}
          <line
            x1={cx - 100}
            y1={cy}
            x2={cx + 100}
            y2={cy}
            stroke="#334155"
            strokeDasharray="2 2"
            strokeWidth="1"
          />
          <line
            x1={cx}
            y1={cy - 100}
            x2={cx}
            y2={cy + 100}
            stroke="#334155"
            strokeDasharray="2 2"
            strokeWidth="1"
          />

          {/* Dotted Matrix Points */}
          {dots.map((dot, idx) => (
            <circle
              key={idx}
              cx={dot.x}
              cy={dot.y}
              r={dot.isInCluster ? 2.5 : 1.2}
              className={`transition-all duration-300 ${
                dot.isCenter
                  ? 'fill-white stroke-slate-900 stroke-2'
                  : dot.isInCluster
                  ? 'fill-orange-500 shadow-sm'
                  : 'fill-slate-600/50'
              }`}
            />
          ))}

          {/* Main Focus Coordinate Blip (Image 3 solid dark dot with aura) */}
          <g transform={`translate(${cx - 30}, ${cy - 35})`}>
            <circle cx="0" cy="0" r="8" fill="rgba(249, 115, 22, 0.2)" />
            <circle cx="0" cy="0" r="4.5" className="fill-slate-900 stroke-orange-500 stroke-2" />
          </g>

          {/* Axis Labels (From Image 3: Payload Capacity, Stability, Agility, Speed) */}
          <text
            x={cx}
            y={cy - 110}
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-400 uppercase tracking-wider"
          >
            Savings Discipline
          </text>
          <text
            x={cx - 115}
            y={cy + 3}
            textAnchor="end"
            className="text-[10px] font-bold fill-slate-400 uppercase tracking-wider"
          >
            Debt Defense
          </text>
          <text
            x={cx + 115}
            y={cy + 3}
            textAnchor="start"
            className="text-[10px] font-bold fill-slate-400 uppercase tracking-wider"
          >
            Investment Growth
          </text>
          <text
            x={cx}
            y={cy + 120}
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-400 uppercase tracking-wider"
          >
            Scam Immunity
          </text>
        </svg>
      </div>
    </div>
  );
};
