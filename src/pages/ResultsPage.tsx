import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, RotateCcw, Share2, CheckCircle2, TrendingUp, Shield, Sparkles, ArrowRight, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../contexts/GameContext';
import { generateFinancialPersona } from '../utils/personaGenerator';
import { leaderboardService } from '../services/leaderboardService';
import { formatCurrency, formatScore } from '../utils/formatters';
import { INITIAL_BADGES } from '../data/badgesData';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { CapabilityMatrixChart } from '../components/charts/CapabilityMatrixChart';

interface ResultsPageProps {
  onOpenCertificate?: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ onOpenCertificate }) => {
  const { state, dispatch, restartQuest } = useGame();
  const { player, netWorth, financialHealth, score, levelScores, badges } = state;

  const persona = generateFinancialPersona(state);

  // Trigger victory celebration confetti on mount & auto-record to leaderboard
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });

    leaderboardService.addEntry({
      playerName: player.name || 'FinQuester',
      score,
      netWorth,
      financialHealth,
      badgesCount: badges.length,
      completionTimeSeconds: 210,
      persona: persona.title,
      createdAt: new Date().toISOString(),
    });
  }, []);

  const handleShare = () => {
    const text = `🏆 I completed FinQuest with a score of ${score} pts, ₹${netWorth.toLocaleString()} Net Worth, and earned the title "${persona.title}"! Can you outsmart your financial future?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Scorecard summary copied to clipboard! Share it with your friends or judges.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Victory Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold shadow-neon-emerald">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>QUEST COMPLETE • FINANCIAL AUDIT APPROVED</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Congratulations, {player.name || 'FinQuester'}!
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          You navigated budgeting hurdles, evaded compound debt traps, and intercepted financial scams. Here is your comprehensive career report.
        </p>

        {/* Claim Certificate Banner Button */}
        {onOpenCertificate && (
          <div className="pt-2">
            <Button
              variant="emerald"
              size="lg"
              className="shadow-neon-emerald px-8 py-3.5 border-2 border-emerald-400/50 text-base"
              icon={<Printer className="w-5 h-5 text-amber-300" />}
              onClick={onOpenCertificate}
            >
              View & Print Official Certificate
            </Button>
          </div>
        )}
      </motion.div>

      {/* Financial Persona Card */}
      <GlassCard className="p-6 sm:p-8 rounded-3xl border border-indigo-500/40 shadow-neon-indigo relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 block mb-1">
              Your Financial Archetype
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <span>{persona.title}</span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-emerald-400 mt-0.5">
              {persona.badge}
            </p>
          </div>

          <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-numeric font-bold">
            Health: {financialHealth}/100
          </span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed py-4">
          {persona.description}
        </p>

        {/* Strengths & Growth Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Demonstrated Strengths
            </span>
            <ul className="space-y-1.5 text-slate-300">
              {persona.strengths.map((s: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 space-y-2">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Strategic Growth Habits
            </span>
            <ul className="space-y-1.5 text-slate-300">
              {persona.areasForGrowth.map((g: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Dotted Capability Matrix Section (Replicating Image 3 Aesthetic) */}
      <GlassCard className="p-6 sm:p-8 rounded-3xl border border-slate-700/70 text-center space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="text-left">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Financial Capability Scatter Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Multivariate evaluation of your capital resilience and risk defenses
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-300">
            MATRIX: FQ-618
          </span>
        </div>

        {/* The Dotted Grid Matrix */}
        <div className="py-2 flex justify-center">
          <CapabilityMatrixChart
            savingsScore={state.budget.savings > 0 ? 88 : 60}
            debtDefenseScore={state.debt.totalDebt === 0 ? 95 : 65}
            investmentScore={82}
            scamRadarScore={state.scam.detectedScams >= 2 ? 90 : 70}
            overallPct={Math.round(financialHealth)}
            statusLabel={financialHealth >= 80 ? 'Elite Capital Resilience' : 'Stable Financial Health'}
          />
        </div>
      </GlassCard>

      {/* Numerical Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-slate-700/60 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Total Score
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-numeric text-fin-emeraldGlow mt-1">
            {formatScore(score)}
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-700/60 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Final Net Worth
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-numeric text-white mt-1">
            {formatCurrency(netWorth)}
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-700/60 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Health Rating
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-numeric text-cyan-400 mt-1">
            {financialHealth}/100
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-700/60 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Badges Earned
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-numeric text-amber-400 mt-1">
            {badges.length} / {INITIAL_BADGES.length}
          </div>
        </div>
      </div>

      {/* Stage-by-Stage Breakdown */}
      <GlassCard className="p-6 rounded-3xl border border-slate-700/70 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Quest Stage Scorecard
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Level 1: Budget Arena</span>
            <span className="text-lg font-bold font-numeric text-indigo-300">
              {levelScores.level1 || 850} pts
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Level 2: Debt Dungeon</span>
            <span className="text-lg font-bold font-numeric text-rose-300">
              {levelScores.level2 || 920} pts
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block">Level 3: Scam Radar</span>
            <span className="text-lg font-bold font-numeric text-emerald-300">
              {levelScores.level3 || 1000} pts
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        {onOpenCertificate && (
          <Button
            variant="emerald"
            size="lg"
            className="w-full sm:w-auto shadow-neon-emerald"
            icon={<Printer className="w-5 h-5 text-white" />}
            onClick={onOpenCertificate}
          >
            Print Certificate
          </Button>
        )}

        <Button
          variant="indigo"
          size="lg"
          className="w-full sm:w-auto"
          icon={<Trophy className="w-5 h-5" />}
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 'leaderboard' })}
        >
          View Leaderboard
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto"
          icon={<Share2 className="w-5 h-5 text-emerald-400" />}
          onClick={handleShare}
        >
          Share Scorecard
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className="w-full sm:w-auto"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={restartQuest}
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};
