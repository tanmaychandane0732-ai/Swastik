import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowLeft, RotateCcw, Award, Sparkles, ShieldCheck } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { leaderboardService } from '../services/leaderboardService';
import { LeaderboardEntry } from '../types/leaderboard';
import { formatCurrency, formatScore } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { soundManager } from '../services/audioService';

export const LeaderboardPage: React.FC = () => {
  const { state, dispatch, restartQuest } = useGame();
  const isLight = state.settings.theme === 'light';
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'top'>('all');

  useEffect(() => {
    const list = leaderboardService.getEntries();
    setEntries(list);
  }, []);

  const displayedEntries = filter === 'top' ? entries.slice(0, 5) : entries;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* ── Standard Page Header System ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-telemetry px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              DEMO LEADERBOARD · GD-01
            </span>
            <span className="label-telemetry px-2 py-0.5 rounded-full bg-white/06 text-zinc-300 border border-white/10">
              DECISION QUALITY RANKINGS
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Flight Hall of Fame</span>
          </h1>
          <p className="text-xs text-[#A7ABB4]">
            Rankings calibrated by financial resilience, debt avoidance, and decision accuracy.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => {
              soundManager.playClick();
              dispatch({ type: 'SET_STAGE', payload: 'dashboard' });
            }}
          >
            Quest Hub
          </Button>

          <Button
            variant="emerald"
            size="sm"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => {
              soundManager.playClick();
              restartQuest();
            }}
          >
            Replay Quest
          </Button>
        </div>
      </div>

      {/* ── Leaderboard Table Container ───────────────────────────── */}
      <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-white/08 flex items-center justify-between text-xs text-[#A7ABB4]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-wider text-xs">
              {displayedEntries.length} Pilots Ranked
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundManager.playClick();
                setFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#FF6A2A] text-white shadow-[0_0_14px_rgba(255,106,42,0.30)]'
                  : 'text-[#A7ABB4] hover:text-white bg-white/04 border border-white/08'
              }`}
            >
              All Competitors
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setFilter('top');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'top'
                  ? 'bg-[#FF6A2A] text-white shadow-[0_0_14px_rgba(255,106,42,0.30)]'
                  : 'text-[#A7ABB4] hover:text-white bg-white/04 border border-white/08'
              }`}
            >
              Top 5 Pilots
            </button>
          </div>
        </div>

        {/* Entries List */}
        <div className="divide-y divide-white/06">
          {displayedEntries.map((entry, idx) => {
            const rank = entry.rank || idx + 1;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  entry.isCurrentPlayer
                    ? 'bg-[#FF6A2A]/10 border-l-4 border-l-[#FF6A2A]'
                    : isLight
                    ? 'hover:bg-black/02'
                    : 'hover:bg-white/03'
                }`}
              >
                {/* Left: Rank & Player Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl font-numeric font-extrabold flex items-center justify-center shrink-0 text-sm ${
                      rank === 1
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
                        : rank === 2
                        ? 'bg-zinc-300/20 text-zinc-200 border border-zinc-300/40'
                        : rank === 3
                        ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                        : 'bg-white/05 text-zinc-400 border border-white/08'
                    }`}
                  >
                    {rank}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm sm:text-base text-white truncate">
                        {entry.playerName}
                      </span>
                      {entry.isCurrentPlayer && (
                        <span className="label-telemetry text-[9px] px-1.5 py-0.5 rounded bg-[#FF6A2A]/20 text-[#FF6A2A] border border-[#FF6A2A]/40 font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#A7ABB4]">
                      <span className="text-[#22C55E] font-medium truncate">{entry.persona}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-[#FF6A2A]" />
                        {entry.badgesCount} badges
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="flex items-center justify-between sm:justify-end gap-6 text-right shrink-0">
                  <div className="flex flex-col text-left sm:text-right">
                    <span className="label-telemetry text-[9px] text-[#A7ABB4]">
                      NET WORTH
                    </span>
                    <span className="text-xs sm:text-sm font-bold font-numeric text-white">
                      {formatCurrency(entry.netWorth)}
                    </span>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="label-telemetry text-[9px] text-[#A7ABB4]">
                      SCORE
                    </span>
                    <span className="text-sm sm:text-base font-extrabold font-numeric text-[#FF6A2A]">
                      {formatScore(entry.score)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
