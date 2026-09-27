import React from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Wind,
  Award,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { soundManager } from '../services/audioService';

export const TrainingDeckPage: React.FC = () => {
  const { state, dispatch } = useGame();
  const { badges, netWorth, financialHealth, score, settings } = state;
  const isLight = settings.theme === 'light';

  const hasScamSpotter = badges.includes('badge_scam_spotter');
  const hasScamShield = badges.includes('badge_scam_shield');
  const hasTurbulenceSurvivor = badges.includes('badge_turbulence_survivor');
  const hasCalmPilot = badges.includes('badge_calm_pilot');
  const hasDecisionMaster = badges.includes('badge_decision_master');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* ── Standardized Page Header System ──────────────────────── */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6A2A] animate-pulse" />
              <span className="label-telemetry text-[#FF6A2A]">
                TRAINING DECK · ADVANCED COMBAT DRILLS
              </span>
              <span className="label-telemetry px-2 py-0.5 rounded-full bg-white/06 border border-white/10 text-xs">
                SIMULATION HANGAR
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
              Aviation Training Deck
            </h1>
            <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
              isLight ? 'text-[#656A73]' : 'text-[#A7ABB4]'
            }`}>
              Before solo pilots take to high altitudes, they run stress-tested simulations against cybersecurity threats and violent crosswinds. Master both specialized combat modules below.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={() => {
                soundManager.playClick();
                dispatch({ type: 'SET_STAGE', payload: 'dashboard' });
              }}
            >
              Dashboard
            </Button>
          </div>
        </div>

        {/* Readiness Telemetry Strip */}
        <div className="pt-4 border-t border-white/08 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-black/03 border-black/06' : 'bg-white/04 border-white/08'}`}>
            <span className="label-telemetry block text-[#A7ABB4]">LIQUID RESERVE</span>
            <span className="text-sm font-bold font-numeric">
              ₹{netWorth.toLocaleString('en-IN')}
            </span>
          </div>

          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-black/03 border-black/06' : 'bg-white/04 border-white/08'}`}>
            <span className="label-telemetry block text-[#A7ABB4]">COCKPIT HEALTH</span>
            <span className="text-sm font-bold font-numeric text-[#22C55E]">
              {financialHealth}% Rating
            </span>
          </div>

          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-black/03 border-black/06' : 'bg-white/04 border-white/08'}`}>
            <span className="label-telemetry block text-[#A7ABB4]">PILOT SCORE</span>
            <span className="text-sm font-bold font-numeric text-[#FF6A2A]">
              {score} pts
            </span>
          </div>

          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-black/03 border-black/06' : 'bg-white/04 border-white/08'}`}>
            <span className="label-telemetry block text-[#A7ABB4]">BADGES EARNED</span>
            <span className="text-sm font-bold font-numeric text-amber-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {badges.length} Unlocked
            </span>
          </div>
        </div>
      </div>

      {/* ── Combat Drill Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DRILL 1: SCAM DETECTIVE */}
        <GlassCard
          hoverEffect={true}
          className="p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-red-500/40 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="label-telemetry px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                CYBERSECURITY DRILL
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display text-xl sm:text-2xl font-bold group-hover:text-red-400 transition-colors">
                Scam Detective
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-[#656A73]' : 'text-[#A7ABB4]'}`}>
                Step into an interactive simulated smartphone. Inspect phishing SMS, fraudulent UPI requests, fake banking portals, and high-pressure investment traps. Tap suspected phrases to reveal hidden red flags and make immediate containment decisions.
              </p>
            </div>

            {/* Badges in this mode */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${isLight ? 'bg-black/03 border-black/06' : 'bg-white/04 border-white/08'}`}>
              <span className="label-telemetry text-[#A7ABB4] flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-red-400" />
                <span>Earnable Aviation Badges</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    hasScamSpotter
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : isLight ? 'bg-black/04 text-zinc-500 border-black/08' : 'bg-white/05 text-zinc-400 border-white/10'
                  }`}
                >
                  {hasScamSpotter ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                  Scam Spotter
                </span>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    hasScamShield
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : isLight ? 'bg-black/04 text-zinc-500 border-black/08' : 'bg-white/05 text-zinc-400 border-white/10'
                  }`}
                >
                  {hasScamShield ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                  Scam Shield
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/08 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="label-telemetry text-[#A7ABB4]">
              6 Forensic Scenarios · RBI & 1930 Guidelines
            </span>

            <Button
              variant="orange"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => {
                soundManager.playClick();
                dispatch({ type: 'SET_STAGE', payload: 'scam-detective' });
              }}
              className="font-bold shadow-[0_0_20px_rgba(255,106,42,0.35)]"
            >
              Enter Investigation
            </Button>
          </div>
        </GlassCard>

        {/* DRILL 2: FINANCIAL TURBULENCE */}
        <GlassCard
          hoverEffect={true}
          className="p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-amber-500/40 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                <Wind className="w-6 h-6" />
              </div>
              <span className="label-telemetry px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                SHOCK SIMULATOR
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-display text-xl sm:text-2xl font-bold group-hover:text-amber-400 transition-colors">
                Financial Turbulence
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-[#656A73]' : 'text-[#A7ABB4]'}`}>
                Take the pilot controls during sudden economic crosswinds. Experience motherboard crashes, hospital bills, emergency rent deposit hikes, and market drawdowns. Make real-time tradeoffs between Cash, 24% EMI debt, peer borrowing, and delayed consumption.
              </p>
            </div>

            {/* Badges in this mode */}
            <div className={`p-3.5 rounded-2xl border space-y-2 ${isLight ? 'bg-black/03 border-black/06' : 'bg-white/04 border-white/08'}`}>
              <span className="label-telemetry text-[#A7ABB4] flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Earnable Aviation Badges</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    hasTurbulenceSurvivor
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : isLight ? 'bg-black/04 text-zinc-500 border-black/08' : 'bg-white/05 text-zinc-400 border-white/10'
                  }`}
                >
                  {hasTurbulenceSurvivor ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                  Turbulence Survivor
                </span>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    hasCalmPilot
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : isLight ? 'bg-black/04 text-zinc-500 border-black/08' : 'bg-white/05 text-zinc-400 border-white/10'
                  }`}
                >
                  {hasCalmPilot ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                  Calm Pilot
                </span>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                    hasDecisionMaster
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : isLight ? 'bg-black/04 text-zinc-500 border-black/08' : 'bg-white/05 text-zinc-400 border-white/10'
                  }`}
                >
                  {hasDecisionMaster ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3" />}
                  Decision Master
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/08 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="label-telemetry text-[#A7ABB4]">
              6 Real-World Shocks · Compounding Cascades
            </span>

            <Button
              variant="orange"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => {
                soundManager.playClick();
                dispatch({ type: 'SET_STAGE', payload: 'turbulence' });
              }}
              className="font-bold shadow-[0_0_20px_rgba(255,106,42,0.35)]"
            >
              Launch Cockpit Sim
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* ── Aviation Philosophy Card ─────────────────────────────── */}
      <GlassCard className="p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF6A2A]" />
          <span className="label-telemetry text-[#FF6A2A]">THE FLIGHT SIMULATOR PHILOSOPHY</span>
        </div>
        <p className={`text-xs sm:text-sm leading-relaxed max-w-3xl ${
          isLight ? 'text-[#656A73]' : 'text-[#A7ABB4]'
        }`}>
          Young adults are commonly told to "be careful with money" through abstract textbooks and lecture slides. FinQuest places you in the pressurized cockpit, subjecting your balance sheet to genuine psychological temptations and sudden unexpected events. By making mistakes here with zero real-world rupee loss, you build reflexive muscle memory for real life.
        </p>
      </GlassCard>
    </div>
  );
};
