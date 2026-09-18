import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Wind,
  Plane,
  Award,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  Smartphone,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { TeamLogo } from '../components/common/TeamLogo';

export const TrainingDeckPage: React.FC = () => {
  const { state, dispatch } = useGame();
  const { badges, netWorth, financialHealth, score } = state;

  const hasScamSpotter = badges.includes('badge_scam_spotter');
  const hasScamShield = badges.includes('badge_scam_shield');
  const hasTurbulenceSurvivor = badges.includes('badge_turbulence_survivor');
  const hasCalmPilot = badges.includes('badge_calm_pilot');
  const hasDecisionMaster = badges.includes('badge_decision_master');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#27272A] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-black text-[#FF5E1E] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FF5E1E] animate-pulse" />
              <span>FinQuest Advanced Flight Training Deck</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <span>✈️ The Aviation Training Deck</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Before solo pilots take to high altitudes, they run stress-tested simulations against cybersecurity threats and violent crosswinds. Master both specialized combat modules below.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <TeamLogo size="sm" showText={true} />
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
            >
              Dashboard
            </Button>
          </div>
        </div>

        {/* Readiness Snapshot Bar */}
        <div className="pt-4 border-t border-[#27272A] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-[#18181D] border border-[#27272A]">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Liquid Reserve
            </span>
            <span className="text-sm font-black font-numeric text-white">
              ₹{netWorth.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#18181D] border border-[#27272A]">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Cockpit Health
            </span>
            <span className="text-sm font-black font-numeric text-[#22C55E]">
              {financialHealth}% Rating
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#18181D] border border-[#27272A]">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Pilot Score
            </span>
            <span className="text-sm font-black font-numeric text-[#FF5E1E]">
              {score} pts
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#18181D] border border-[#27272A]">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">
              Badges Earned
            </span>
            <span className="text-sm font-black font-numeric text-amber-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {badges.length} Unlocked
            </span>
          </div>
        </div>
      </div>

      {/* Two Premium Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ACTIVITY 1: SCAM DETECTIVE */}
        <GlassCard
          hoverEffect={true}
          className="p-6 sm:p-8 rounded-3xl border-2 border-red-500/40 hover:border-red-500 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-numeric">
                Cybersecurity Sim
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                🚨 Scam Detective
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Step into an interactive simulated smartphone. Inspect phishing SMS, fraudulent UPI requests, fake banking portals, and high-pressure investment traps. Tap suspected phrases to reveal hidden red flags and make immediate containment decisions.
              </p>
            </div>

            {/* Badges in this mode */}
            <div className="p-3 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-red-400" />
                <span>Earnable Aviation Badges</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    hasScamSpotter
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {hasScamSpotter ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                  Scam Spotter
                </span>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    hasScamShield
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {hasScamShield ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                  Scam Shield
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#27272A] flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-400 font-medium">
              6 Forensic Scenarios • RBI & 1930 Guidelines
            </span>

            <Button
              variant="orange"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 'scam-detective' })}
              className="font-black shadow-brand-orange"
            >
              Enter Investigation
            </Button>
          </div>
        </GlassCard>

        {/* ACTIVITY 2: FINANCIAL TURBULENCE */}
        <GlassCard
          hoverEffect={true}
          className="p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 hover:border-amber-500 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                <Wind className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-numeric">
                Shock Simulator
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                🌪️ Financial Turbulence
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Take the pilot controls during sudden economic crosswinds. Experience sudden motherboard crashes, medical hospital bills, emergency rent deposit hikes, and stock market drawdowns. Make real-time tradeoffs between Cash, 24% EMI debt, peer borrowing, and delayed consumption.
              </p>
            </div>

            {/* Badges in this mode */}
            <div className="p-3 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Earnable Aviation Badges</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    hasTurbulenceSurvivor
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {hasTurbulenceSurvivor ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                  Turbulence Survivor
                </span>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    hasCalmPilot
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {hasCalmPilot ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                  Calm Pilot
                </span>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    hasDecisionMaster
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {hasDecisionMaster ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                  Decision Master
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#27272A] flex items-center justify-between gap-3">
            <span className="text-xs text-zinc-400 font-medium">
              6 Real-World Shocks • Compounding Cascades
            </span>

            <Button
              variant="orange"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 'turbulence' })}
              className="font-black shadow-brand-orange"
            >
              Launch Cockpit Sim
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Aviation Philosophy Callout */}
      <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF5E1E]">
          <Sparkles className="w-4 h-4" />
          <span>The Flight Simulator Philosophy</span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
          Young adults are commonly told to "be careful with money" through abstract textbooks and lecture slides. FinQuest places you in the pressurized cockpit, subjecting your balance sheet to genuine psychological temptations and sudden unexpected events. By making mistakes here with zero real-world rupee loss, you build reflexive muscle memory for real life.
        </p>
      </GlassCard>
    </div>
  );
};

