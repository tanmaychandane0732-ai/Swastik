import React from 'react';
import { motion } from 'framer-motion';
import { Play, Lock, CheckCircle2, Award, Zap, TrendingUp, Shield, BarChart3, RotateCcw } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

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
      color: 'indigo',
      badge: '50/30/20 Rule',
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
      color: 'rose',
      badge: 'Compound Debt Math',
      stageTarget: 'level2' as const,
      isUnlocked: true, // allow hackathon judges to freely test any level!
      isCompleted: completedLevels.includes(2),
      score: levelScores.level2,
    },
    {
      levelNumber: 3,
      title: 'Level 3: Investment Strategy & Scam Radar',
      subtitle: 'Index Funds vs Fake Promises',
      description: 'Operate the tactical Scam Detection Radar. Intercept fake crypto doublers, analyze red flags, and build index fund discipline.',
      icon: Shield,
      color: 'emerald',
      badge: 'Scam Detection Radar',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-glass">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Financial Career</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready for your next move, {player.name || 'FinQuester'}?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Choose a level to test your decision-making. Every simulation equips you with practical mathematical models to protect and grow real wealth.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {isAllCompleted && (
            <Button
              variant="emerald"
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
            icon={<Award className="w-4 h-4 text-indigo-400" />}
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'leaderboard' })}
          >
            Hall of Fame
          </Button>
        </div>
      </div>

      {/* Levels Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Career Quest Modules</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
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
                className="flex flex-col justify-between p-6 rounded-3xl relative overflow-hidden border border-slate-700/70"
              >
                {/* Level status pill */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 font-numeric">
                      Level {level.levelNumber}
                    </span>
                  </div>

                  {level.isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : level.isUnlocked ? (
                    <span className="text-[11px] font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-full">
                      Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                      <Lock className="w-3.5 h-3.5" />
                      Locked
                    </span>
                  )}
                </div>

                {/* Level Details */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-base font-extrabold text-white leading-snug">
                    {level.title}
                  </h3>
                  <div className="text-xs font-semibold text-indigo-300">
                    {level.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {level.description}
                  </p>
                </div>

                {/* Score and Launch Button */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      Best Score
                    </span>
                    <span className="text-sm font-bold font-numeric text-fin-emeraldGlow">
                      {level.score > 0 ? `${level.score} pts` : '—'}
                    </span>
                  </div>

                  <Button
                    variant={level.isCompleted ? 'secondary' : 'indigo'}
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
