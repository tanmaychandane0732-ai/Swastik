import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RiskRadarMetrics } from '../../types/flightSimulator';

interface RiskRadarProps {
  metrics: RiskRadarMetrics;
  compact?: boolean;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ metrics, compact = false }) => {
  // 6 dimensions on the radar
  const dimensions = [
    { label: 'Debt Drag', value: metrics.debtRisk, key: 'debtRisk' },
    { label: 'Liquidity Void', value: metrics.emergencyVulnerability, key: 'emergencyVulnerability' },
    { label: 'Lifestyle Creep', value: metrics.lifestyleCreep, key: 'lifestyleCreep' },
    { label: 'Volatility Risk', value: metrics.volatilityExposure, key: 'volatilityExposure' },
    { label: 'Scam Fragility', value: metrics.scamExposure, key: 'scamExposure' },
    { label: 'Credit Drag', value: metrics.creditFragility, key: 'creditFragility' },
  ];

  // Radar geometry calculations
  const size = compact ? 180 : 260;
  const center = size / 2;
  const radius = (size / 2) * 0.72;
  const angleStep = (Math.PI * 2) / dimensions.length;

  // Compute polygon points for the values
  const points = dimensions.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    // Map value (0-100) to radius
    const normalizedValue = Math.max(10, Math.min(100, d.value)) / 100;
    const r = normalizedValue * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Grid concentric rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Overall Threat Level
  const avgRisk = Math.round(
    dimensions.reduce((acc, d) => acc + d.value, 0) / dimensions.length
  );

  const getThreatBadge = (risk: number) => {
    if (risk > 65) {
      return {
        label: 'Severe Flight Turbulence',
        color: 'text-red-400 bg-red-950/40 border-red-800',
        icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
      };
    }
    if (risk > 35) {
      return {
        label: 'Moderate Aerodynamic Drag',
        color: 'text-amber-400 bg-amber-950/40 border-amber-800',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
      };
    }
    return {
      label: 'Optimal Supercruise',
      color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />,
    };
  };

  const threat = getThreatBadge(avgRisk);

  return (
    <div className={`flex flex-col items-center select-none ${compact ? 'space-y-2' : 'space-y-4'}`}>
      {/* Header Badge */}
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${threat.color}`}>
        {threat.icon}
        <span>{threat.label} ({avgRisk}% Risk Index)</span>
      </div>

      {/* SVG Radar */}
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Concentric Polygons */}
          {rings.map((ring, idx) => {
            const r = ring * radius;
            const ringPoints = dimensions.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ');

            return (
              <polygon
                key={idx}
                points={ringPoints}
                fill="none"
                stroke="#27272A"
                strokeWidth={idx === rings.length - 1 ? '1.5' : '1'}
                strokeDasharray={idx < rings.length - 1 ? '2 2' : undefined}
                className="opacity-60"
              />
            );
          })}

          {/* Radial Spokes */}
          {dimensions.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#27272A"
                strokeWidth="1"
                className="opacity-40"
              />
            );
          })}

          {/* Animated Risk Area Polygon */}
          <motion.polygon
            points={points}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            fill="rgba(255, 94, 30, 0.25)"
            stroke="#FF5E1E"
            strokeWidth="2.5"
            className="drop-shadow-[0_0_12px_rgba(255,94,30,0.5)]"
          />

          {/* Data Points */}
          {dimensions.map((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const normalizedValue = Math.max(10, Math.min(100, d.value)) / 100;
            const r = normalizedValue * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);

            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3.5"
                fill="#FF5E1E"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis Labels */}
          {!compact && dimensions.map((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 22;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);

            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#A1A1AA"
                fontSize="9"
                fontWeight="700"
                className="font-numeric uppercase tracking-wider"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Trait Pills in expanded mode */}
      {!compact && (
        <div className="grid grid-cols-3 gap-2 w-full pt-2">
          {dimensions.map((d) => (
            <div
              key={d.key}
              className="p-2 rounded-xl bg-[#18181D]/80 border border-[#27272A] text-center"
            >
              <span className="text-[10px] text-zinc-400 block font-bold truncate">
                {d.label}
              </span>
              <span
                className={`text-xs font-black font-numeric ${
                  d.value > 60 ? 'text-red-400' : d.value > 30 ? 'text-amber-400' : 'text-[#22C55E]'
                }`}
              >
                {d.value}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

