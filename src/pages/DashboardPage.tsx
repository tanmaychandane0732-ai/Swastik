import React from 'react';
import { motion } from 'framer-motion';
import { Play, Lock, CheckCircle2, Award, Zap, TrendingUp, Shield, BarChart3, RotateCcw, Smartphone, Wind, ShieldAlert, ArrowRight } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { TeamLogo } from '../components/common/TeamLogo';

export const DashboardPage: React.FC = () => {
  const { state, dispatch } = useGame();
  const { completedLevels, levelScores, player } = state;

  const levels = [
    {
      levelNumber: 1,
      title: 'Level 1: Income & Budgeting Arena',
      subtitle: 'The 50/30/20 Rule & Cashflow Mastery',
      description: 'Manage a ₹60,000 monthly salary. Distribute needs, wants, and savings using dynamic sliders while balancing the health meter.',
      icon: Zap,
      stageTarget: 'level1' as const,
      isUnlocked: true,
      isCompleted: completedLevels.includes(1),
      score: levelScores.level1,
    },
    {
      levelNumber: 2,
      title: 'Level 2: Credit & Debt Trap Dungeon',
      subtitle: 'BNPL Schemes & Compound Debt Growth',
      description: 'Encounter deceptive "No-Cost EMI" gadgets and 36% APR credit card traps. Calculate and visualize why compound debt explodes.',
      icon: TrendingUp,
      stageTarget: 'level2' as const,
      isUnlocked: true,
      isCompleted: completedLevels.includes(2),
      score: levelScores.level2,
    },
    {
      levelNumber: 3,
      title: 'Level 3: Investment Strategy & Scam Radar',
      subtitle: 'Index Funds vs Fake Promises',
      description: 'Operate the tactical Scam Detection Radar. Intercept fake crypto doublers, analyze red flags, and build index fund discipline.',
      icon: Shield,
      stageTarget: 'level3' as const,
      isUnlocked: true,
      isCompleted: completedLevels.includes(3),
      score: levelScores.level3,
    },
  ];

  const isAllCompleted = completedLevels.length >= 3;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Player Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-3xl p-6 sm:p-8 border border-[#27272A] shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#FF5E1E] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#FF5E1E] animate-pulse" />
            <span>Active Financial Career Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Ready for your next move, {player.name || 'FinQuester'}?
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Choose a level or enter the Dynamic Life Simulator. Every choice dynamically cascades through your cashflow, debt burden, and credit resilience.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <TeamLogo size="sm" showText={true} className="mr-2" />

          {isAllCompleted && (
            <Button
              variant="orange"
              size="md"
              icon={<BarChart3 className="w-4 h-4" />}
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 'results' })}
            >
              Final Results
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            icon={<Award className="w-4 h-4 text-[#FF5E1E]" />}
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'leaderboard' })}
          >
            Hall of Fame
          </Button>
        </div>
      </div>

      {/* FEATURED: Financial Flight Simulator Cockpit Banner */}
      <GlassCard className="p-6 sm:p-8 rounded-3xl border-2 border-[#FF5E1E] shadow-brand-orange relative overflow-hidden space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10 border-b border-[#27272A] pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E1E]/20 border border-[#FF5E1E]/50 text-[#FF5E1E] text-xs font-black font-numeric">
              <span>✈️ HACK2IGNITE GD-01 • FINANCIAL FLIGHT SIMULATOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              The Financial Flight Simulator
            </h2>
            <blockquote className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed italic border-l-2 border-[#FF5E1E] pl-3 py-0.5">
              "Pilots don’t fly passenger planes without thousands of hours in a flight simulator. Why do we let young adults enter the modern economy without a financial flight simulator?"
            </blockquote>
          </div>

          <Button
            variant="orange"
            size="lg"
            className="shrink-0 text-sm font-black shadow-brand-orange px-6 py-4"
            icon={<Play className="w-4 h-4" />}
            iconPosition="right"
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'simulator' })}
          >
            Launch Flight Sim
          </Button>
        </div>

        {/* Quick Launch Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Pre-Flight IQ */}
          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'diagnostic' })}
            className="p-4 rounded-2xl bg-[#18181D]/80 hover:bg-[#222328] border border-[#27272A] hover:border-[#22C55E] transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-white group-hover:text-[#22C55E] transition-colors">
                🧠 Financial IQ Test
              </span>
              <span className="text-[10px] uppercase font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/30 font-numeric">
                Pre / Post Delta
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Measure your baseline financial intelligence and verify measured learning gains.
            </p>
          </button>

          {/* FinQuest Academy */}
          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'academy' })}
            className="p-4 rounded-2xl bg-[#18181D]/80 hover:bg-[#222328] border border-[#27272A] hover:border-amber-400 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                🎓 60-Sec Academy
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30 font-numeric">
                Micro-Cards
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Aviation mental models on CIBIL scores, UPI safety, and compound interest.
            </p>
          </button>

          {/* Educator Cockpit */}
          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'classroom' })}
            className="p-4 rounded-2xl bg-[#18181D]/80 hover:bg-[#222328] border border-[#27272A] hover:border-blue-400 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-white group-hover:text-blue-400 transition-colors">
                🏫 Educator Cockpit
              </span>
              <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/30 font-numeric">
                B2B2C League
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Simulated university cohort analytics, failure traps, and resilience leaderboards.
            </p>
          </button>
        </div>
      </GlassCard>

      {/* NEW: Flight Training Deck — Specialized Interactive Activities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>🎯 Flight Training Deck</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
                2 New Combat Drills
              </span>
            </h2>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'training-deck' })}
          >
            Training Hub
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Scam Detective */}
          <GlassCard
            hoverEffect={true}
            className="p-6 rounded-3xl border border-red-500/30 hover:border-red-500/80 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-numeric">
                  Smartphone Forensic Sim
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">🚨 Scam Detective</h3>
                <p className="text-xs text-[#FF5E1E] font-semibold mt-0.5">Fake UPI • KYC Phishing • OTP Containment</p>
                <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                  Inspect suspicious messages on a realistic simulated phone. Tap text to uncover hidden red flags, trigger containment protocols, and earn Detective Ranks under RBI guidelines.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400">
                Badges: Scam Spotter & Scam Shield
              </span>
              <Button
                variant="orange"
                size="sm"
                icon={<Play className="w-3.5 h-3.5" />}
                iconPosition="right"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 'scam-detective' })}
              >
                Investigate
              </Button>
            </div>
          </GlassCard>

          {/* Card 2: Financial Turbulence */}
          <GlassCard
            hoverEffect={true}
            className="p-6 rounded-3xl border border-amber-500/30 hover:border-amber-500/80 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Wind className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-numeric">
                  Cockpit Emergency Sim
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">🌪️ Financial Turbulence</h3>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">Real-Life Shocks • Compounding Cascades</p>
                <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                  Face sudden motherboard failures, hospital bills, and market downturns. Execute tradeoffs between emergency cash buffers, 24% APR EMIs, and peer loans with What-If post-flight debriefs.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400">
                Badges: Turbulence Survivor & Calm Pilot
              </span>
              <Button
                variant="orange"
                size="sm"
                icon={<Play className="w-3.5 h-3.5" />}
                iconPosition="right"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 'turbulence' })}
              >
                Enter Storm
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Levels Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>Career Quest Modules</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#18181D] text-zinc-400 border border-[#27272A]">
              3 Playable Stages
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {levels.map((level) => {
            const Icon = level.icon;

            return (
              <GlassCard
                key={level.levelNumber}
                hoverEffect={true}
                className="flex flex-col justify-between p-6 rounded-3xl relative overflow-hidden border border-[#27272A]"
              >
                {/* Level status pill */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#18181D] border border-[#27272A] flex items-center justify-center text-[#FF5E1E] font-black shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#18181D] text-zinc-300 border border-[#27272A] font-numeric">
                      Level {level.levelNumber}
                    </span>
                  </div>

                  {level.isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-black text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/40 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : level.isUnlocked ? (
                    <span className="text-[11px] font-black text-[#FF5E1E] bg-[#FF5E1E]/15 border border-[#FF5E1E]/40 px-2.5 py-0.5 rounded-full">
                      Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 bg-[#18181D] border border-[#27272A] px-2 py-0.5 rounded-full">
                      <Lock className="w-3.5 h-3.5" />
                      Locked
                    </span>
                  )}
                </div>

                {/* Level Details */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-base font-black text-white leading-snug">
                    {level.title}
                  </h3>
                  <div className="text-xs font-bold text-[#FF5E1E]">
                    {level.subtitle}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {level.description}
                  </p>
                </div>

                {/* Score and Launch Button */}
                <div className="pt-4 border-t border-[#27272A] flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">
                      Best Score
                    </span>
                    <span className="text-sm font-black font-numeric text-[#22C55E]">
                      {level.score > 0 ? `${level.score} pts` : '—'}
                    </span>
                  </div>

                  <Button
                    variant={level.isCompleted ? 'secondary' : 'orange'}
                    size="sm"
                    icon={level.isCompleted ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    iconPosition="right"
                    onClick={() => dispatch({ type: 'SET_STAGE', payload: level.stageTarget })}
                  >
                    {level.isCompleted ? 'Replay' : 'Enter Arena'}
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
