import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Award,
  TrendingUp,
  ShieldCheck,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plane,
  Compass,
} from 'lucide-react';
import { FlightReportData } from '../../types/flightSimulator';
import { formatCurrency, formatScore } from '../../utils/formatters';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { TeamLogo } from '../common/TeamLogo';

interface FinancialFlightReportProps {
  report: FlightReportData;
  onOpenCertificate?: () => void;
  onRestartFlight: () => void;
  onGoToHub: () => void;
}

export const FinancialFlightReport: React.FC<FinancialFlightReportProps> = ({
  report,
  onOpenCertificate,
  onRestartFlight,
  onGoToHub,
}) => {
  const { flightStatus, decisionDNA, iqDelta } = report;

  const getStatusBadge = () => {
    switch (flightStatus) {
      case 'smooth':
        return {
          label: 'Smooth Touchdown • Flawless Cruising',
          badge: 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40',
          icon: <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />,
        };
      case 'turbulent':
        return {
          label: 'Turbulent Landing • Surviving High Drag',
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        };
      case 'crash':
        return {
          label: 'Emergency Landing • Debt Spiral Detected',
          badge: 'bg-red-500/15 text-red-400 border-red-500/40',
          icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className="space-y-6 select-none text-left">
      {/* Flight Debrief Header Card */}
      <GlassCard className="p-6 sm:p-8 rounded-3xl border-2 border-[#FF5E1E] text-center space-y-5 shadow-2xl relative overflow-hidden">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 text-xs font-black font-numeric">
            <Plane className="w-3.5 h-3.5" />
            <span>OFFICIAL FINANCIAL FLIGHT SIMULATOR DEBRIEF</span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusInfo.badge}`}>
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Captain {report.captainName || 'Cadet'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            6-Month Simulation Completed • Zero Real-World Risk Flight Debrief
          </p>
        </div>

        {/* Primary Flight Telemetry Instruments */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#18181D]/90 border border-[#27272A] font-numeric text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Final Altitude (Net Worth)
            </span>
            <span className="text-base sm:text-xl font-black text-white">
              {formatCurrency(report.finalAltitude)}
            </span>
          </div>

          <div className="border-l border-[#27272A]">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Fuel Left (Liquid Cash)
            </span>
            <span className="text-base sm:text-xl font-black text-[#22C55E]">
              {formatCurrency(report.fuelRemaining)}
            </span>
          </div>

          <div className="border-l border-[#27272A]">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Total Debt Drag
            </span>
            <span
              className={`text-base sm:text-xl font-black ${
                report.totalDebt === 0 ? 'text-[#22C55E]' : 'text-red-400'
              }`}
            >
              {report.totalDebt === 0 ? '₹0 (Clean)' : formatCurrency(report.totalDebt)}
            </span>
          </div>

          <div className="border-l border-[#27272A]">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              CIBIL Altimeter
            </span>
            <span className="text-base sm:text-xl font-black text-[#FF5E1E]">
              {report.cibilScore} / 850
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Proof of Learning: Financial IQ Delta Card */}
      {iqDelta && (
        <GlassCard className="p-6 rounded-3xl border border-[#22C55E]/40 bg-gradient-to-r from-[#22C55E]/10 via-[#18181D]/80 to-transparent space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black text-white">
                Empirical Proof of Learning: The Financial IQ Delta
              </h3>
            </div>
            <span className="text-xs font-bold text-zinc-400 font-numeric">
              Verified: {iqDelta.verifiedAt}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-numeric">
            <div className="p-3.5 rounded-2xl bg-[#18181D] border border-[#27272A]">
              <span className="text-xs text-zinc-400 font-bold block">Pre-Flight IQ</span>
              <span className="text-2xl font-black text-zinc-300">{iqDelta.preFlightIQ} / 100</span>
              <span className="text-[10px] text-zinc-500 block">Baseline Assessment</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#18181D] border border-[#27272A]">
              <span className="text-xs text-zinc-400 font-bold block">Post-Flight IQ</span>
              <span className="text-2xl font-black text-[#22C55E]">{iqDelta.postFlightIQ} / 100</span>
              <span className="text-[10px] text-zinc-500 block">Simulator Tested</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/40">
              <span className="text-xs text-[#22C55E] font-bold block">Measured Learning Gain</span>
              <span className="text-2xl font-black text-[#22C55E]">
                +{iqDelta.percentageGain}% (+{iqDelta.deltaPoints} pts)
              </span>
              <span className="text-[10px] text-[#22C55E]/80 block">
                Top Area: {iqDelta.strongestImprovementArea}
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Decision DNA Profile & Radar Card */}
      <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{decisionDNA.badgeIcon}</div>
            <div>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
                Financial Decision DNA
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {decisionDNA.archetype}
              </h3>
            </div>
          </div>

          <span className="text-xs font-bold text-zinc-400 max-w-sm text-right">
            "{decisionDNA.tagline}"
          </span>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed">
          {decisionDNA.summary}
        </p>

        {/* 5 Trait Bars */}
        <div className="space-y-3 font-numeric">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-zinc-300">Patience (Delayed Gratification)</span>
              <span className="text-[#FF5E1E]">{decisionDNA.traits.patience}%</span>
            </div>
            <div className="h-2 bg-[#18181D] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF5E1E] rounded-full transition-all"
                style={{ width: `${decisionDNA.traits.patience}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-zinc-300">Risk Intelligence (Calculated vs Speculative)</span>
              <span className="text-amber-400">{decisionDNA.traits.riskIntelligence}%</span>
            </div>
            <div className="h-2 bg-[#18181D] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${decisionDNA.traits.riskIntelligence}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-zinc-300">Debt Discipline (Predatory Credit Immunity)</span>
              <span className="text-[#22C55E]">{decisionDNA.traits.debtDiscipline}%</span>
            </div>
            <div className="h-2 bg-[#18181D] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22C55E] rounded-full transition-all"
                style={{ width: `${decisionDNA.traits.debtDiscipline}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-zinc-300">Scam Immunity (Phishing & Fraud Detection)</span>
              <span className="text-[#FF5E1E]">{decisionDNA.traits.scamImmunity}%</span>
            </div>
            <div className="h-2 bg-[#18181D] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF5E1E] rounded-full transition-all"
                style={{ width: `${decisionDNA.traits.scamImmunity}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-zinc-300">Emergency Readiness (Liquid Runway Parachute)</span>
              <span className="text-[#22C55E]">{decisionDNA.traits.emergencyReadiness}%</span>
            </div>
            <div className="h-2 bg-[#18181D] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22C55E] rounded-full transition-all"
                style={{ width: `${decisionDNA.traits.emergencyReadiness}%` }}
              />
            </div>
          </div>
        </div>

        {/* Strength & Blindspot Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#18181D] border border-[#22C55E]/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#22C55E]">
              <ShieldCheck className="w-4 h-4" />
              <span>Primary Flight Strength</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {decisionDNA.primaryStrength}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#18181D] border border-amber-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Blind Spot</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {decisionDNA.dangerBlindSpot}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Team Swastik Official Accreditation & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#18181D]/90 border border-[#27272A]">
        <div className="flex items-center gap-3">
          <TeamLogo size="sm" showText={true} />
          <span className="text-xs text-zinc-400">
            Official Hack2Ignite GD-01 Flight Simulation Certificate
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenCertificate && (
            <Button
              variant="orange"
              size="md"
              icon={<Printer className="w-4 h-4 text-white" />}
              onClick={onOpenCertificate}
              className="shadow-brand-orange"
            >
              Claim Certificate
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={onRestartFlight}
          >
            Replay Flight
          </Button>

          <Button
            variant="dark"
            size="md"
            onClick={onGoToHub}
          >
            Flight Hub
          </Button>
        </div>
      </div>
    </div>
  );
};

