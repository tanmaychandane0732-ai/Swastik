import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, RotateCcw, Share2, CheckCircle2, TrendingUp, Shield, Sparkles, ArrowRight, Printer, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../contexts/GameContext';
import { generateFinancialPersona } from '../utils/personaGenerator';
import { leaderboardService } from '../services/leaderboardService';
import { formatCurrency, formatScore } from '../utils/formatters';
import { INITIAL_BADGES } from '../data/badgesData';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { CapabilityMatrixChart } from '../components/charts/CapabilityMatrixChart';
import { soundManager } from '../services/audioService';

interface ResultsPageProps {
  onOpenCertificate?: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ onOpenCertificate }) => {
  const { state, dispatch, restartQuest } = useGame();
  const { player, netWorth, financialHealth, score, levelScores, badges } = state;
  const isLight = state.settings.theme === 'light';
  const [copied, setCopied] = useState(false);

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
      setCopied(true);
      soundManager.playSuccess();
      setTimeout(() => setCopied(false), 2600);
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5E1E]/15 text-[#FF5E1E] border border-[#FF5E1E]/40 text-xs font-black shadow-brand-orange">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>QUEST COMPLETE • FINANCIAL AUDIT APPROVED</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Congratulations, {player.name || 'FinQuester'}!
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
          You navigated budgeting hurdles, evaded compound debt traps, and intercepted financial scams. Here is your comprehensive career report.
        </p>

        {/* Claim Certificate Banner Button */}
        {onOpenCertificate && (
          <div className="pt-2">
            <Button
              variant="orange"
              size="lg"
              className="shadow-brand-orange px-8 py-3.5 border border-[#FF5E1E] text-base font-black"
              icon={<Printer className="w-5 h-5 text-white" />}
              onClick={onOpenCertificate}
            >
              View & Print Official Certificate
            </Button>
          </div>
        )}
      </motion.div>

      {/* Financial Persona Card */}
      <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] shadow-xl relative overflow-hidden">
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b ${isLight ? 'border-black/08' : 'border-[#27272A]'}`}>
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF5E1E] block mb-1">
              Your Financial Archetype
            </span>
            <h2 className={`text-2xl sm:text-3xl font-black flex items-center gap-2 ${isLight ? 'text-[#17191D]' : 'text-white'}`}>
              <span>{persona.title}</span>
            </h2>
            <p className="text-xs sm:text-sm font-bold text-[#22C55E] mt-0.5">
              {persona.badge}
            </p>
          </div>

          <span className={`text-xs px-3 py-1.5 rounded-xl font-numeric font-bold ${isLight ? 'bg-black/05 border border-black/08 text-[#444]' : 'bg-[#18181D] border border-[#27272A] text-zinc-300'}`}>
            Health: {financialHealth}/100
          </span>
        </div>

        <p className={`text-sm leading-relaxed py-4 ${isLight ? 'text-[#444]' : 'text-zinc-300'}`}>
          {persona.description}
        </p>

        {/* Strengths & Growth Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className={`p-4 rounded-2xl border border-[#22C55E]/40 space-y-2 ${isLight ? 'bg-black/03' : 'bg-[#18181D]'}`}>
            <span className="font-black text-[#22C55E] flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
              Demonstrated Strengths
            </span>
            <ul className={`space-y-1.5 ${isLight ? 'text-[#444]' : 'text-zinc-300'}`}>
              {persona.strengths.map((s: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#22C55E] mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`p-4 rounded-2xl border border-[#FF5E1E]/40 space-y-2 ${isLight ? 'bg-black/03' : 'bg-[#18181D]'}`}>
            <span className="font-black text-[#FF5E1E] flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5E1E]" />
              Strategic Growth Habits
            </span>
            <ul className={`space-y-1.5 ${isLight ? 'text-[#444]' : 'text-zinc-300'}`}>
              {persona.areasForGrowth.map((g: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#FF5E1E] mt-0.5">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>

      {/* Dotted Capability Matrix Section */}
      <GlassCard className={`p-6 sm:p-8 rounded-3xl border text-center space-y-3 ${isLight ? 'border-black/10' : 'border-[#27272A]'}`}>
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 border-b pb-3 ${isLight ? 'border-black/08' : 'border-[#27272A]'}`}>
          <div className="text-left">
            <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? 'text-[#17191D]' : 'text-white'}`}>
              <TrendingUp className="w-4 h-4 text-[#FF5E1E]" />
              Financial Capability Scatter Matrix
            </h3>
            <p className={`text-xs ${isLight ? 'text-[#656A73]' : 'text-zinc-400'}`}>
              Multivariate evaluation of your capital resilience and risk defenses
            </p>
          </div>
          <span className={`font-mono text-xs px-2.5 py-1 rounded-md font-bold ${isLight ? 'bg-black/05 border border-black/08 text-[#444]' : 'bg-[#18181D] border border-[#27272A] text-zinc-300'}`}>
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
        <div className={`glass-card p-4 rounded-2xl border text-center ${isLight ? 'border-black/10' : 'border-[#27272A]'}`}>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-[#656A73]' : 'text-zinc-400'}`}>
            Total Score
          </span>
          <div className="text-xl sm:text-2xl font-black font-numeric text-[#22C55E] mt-1">
            {formatScore(score)}
          </div>
        </div>

        <div className={`glass-card p-4 rounded-2xl border text-center ${isLight ? 'border-black/10' : 'border-[#27272A]'}`}>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-[#656A73]' : 'text-zinc-400'}`}>
            Final Net Worth
          </span>
          <div className={`text-xl sm:text-2xl font-black font-numeric mt-1 ${isLight ? 'text-[#17191D]' : 'text-white'}`}>
            {formatCurrency(netWorth)}
          </div>
        </div>

        <div className={`glass-card p-4 rounded-2xl border text-center ${isLight ? 'border-black/10' : 'border-[#27272A]'}`}>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-[#656A73]' : 'text-zinc-400'}`}>
            Health Rating
          </span>
          <div className="text-xl sm:text-2xl font-black font-numeric text-[#FF5E1E] mt-1">
            {financialHealth}/100
          </div>
        </div>

        <div className={`glass-card p-4 rounded-2xl border text-center ${isLight ? 'border-black/10' : 'border-[#27272A]'}`}>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-[#656A73]' : 'text-zinc-400'}`}>
            Badges Earned
          </span>
          <div className="text-xl sm:text-2xl font-black font-numeric text-amber-400 mt-1">
            {badges.length} / {INITIAL_BADGES.length}
          </div>
        </div>
      </div>

      {/* Stage-by-Stage Breakdown */}
      <GlassCard className={`p-6 rounded-3xl border space-y-4 ${isLight ? 'border-black/10' : 'border-[#27272A]'}`}>
        <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? 'text-[#17191D]' : 'text-white'}`}>
          <TrendingUp className="w-4 h-4 text-[#FF5E1E]" />
          Quest Stage Scorecard
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-black/03 border-black/08' : 'bg-[#18181D] border-[#27272A]'}`}>
            <span className={`text-xs font-bold block ${isLight ? 'text-[#656A73]' : 'text-zinc-400'}`}>Level 1: Budget Arena</span>
            <span className="text-lg font-black font-numeric text-[#FF5E1E]">
              {levelScores.level1 || 850} pts
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-black/03 border-black/08' : 'bg-[#18181D] border-[#27272A]'}`}>
            <span className={`text-xs font-bold block ${isLight ? 'text-[#656A73]' : 'text-zinc-400'}`}>Level 2: Debt Dungeon</span>
            <span className="text-lg font-black font-numeric text-red-400">
              {levelScores.level2 || 920} pts
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-black/03 border-black/08' : 'bg-[#18181D] border-[#27272A]'}`}>
            <span className={`text-xs font-bold block ${isLight ? 'text-[#656A73]' : 'text-zinc-400'}`}>Level 3: Scam Radar</span>
            <span className="text-lg font-black font-numeric text-[#22C55E]">
              {levelScores.level3 || 1000} pts
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        {onOpenCertificate && (
          <Button
            variant="orange"
            size="lg"
            className="w-full sm:w-auto shadow-brand-orange"
            icon={<Printer className="w-5 h-5 text-white" />}
            onClick={onOpenCertificate}
          >
            Print Certificate
          </Button>
        )}

        <Button
          variant="secondary"
          size="lg"
          className="w-full sm:w-auto"
          icon={<Trophy className="w-5 h-5 text-amber-400" />}
          onClick={() => dispatch({ type: 'SET_STAGE', payload: 'leaderboard' })}
        >
          View Leaderboard
        </Button>

        <Button
          variant={copied ? 'orange' : 'secondary'}
          size="lg"
          className="w-full sm:w-auto transition-all"
          icon={copied ? <Check className="w-5 h-5 text-white" /> : <Share2 className="w-5 h-5 text-[#FF5E1E]" />}
          onClick={handleShare}
        >
          {copied ? 'Copied to Clipboard!' : 'Share Scorecard'}
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
