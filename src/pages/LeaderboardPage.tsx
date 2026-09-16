import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, ArrowLeft, RotateCcw, User, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { leaderboardService } from '../services/leaderboardService';
import { LeaderboardEntry } from '../types/leaderboard';
import { formatCurrency, formatScore } from '../utils/formatters';
import { Button } from '../components/ui/Button';

export const LeaderboardPage: React.FC = () => {
  const { dispatch, restartQuest } = useGame();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'top'>('all');

  useEffect(() => {
    const list = leaderboardService.getEntries();
    setEntries(list);
  }, []);

  const displayedEntries = filter === 'top' ? entries.slice(0, 5) : entries;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-2xl p-5 border border-indigo-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Global Leaderboard & Hall of Fame
            </h1>
            <p className="text-xs text-slate-400">
              Top financial minds and wealth builders in Hack2Ignite GD-01
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
          >
            Quest Hub
          </Button>

          <Button
            variant="emerald"
            size="sm"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={restartQuest}
          >
            Replay Quest
          </Button>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="glass-card rounded-3xl border border-slate-700/70 overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-wider">
              {displayedEntries.length} Players Ranked
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-neon-indigo'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Competitors
            </button>
            <button
              onClick={() => setFilter('top')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'top'
                  ? 'bg-indigo-600 text-white shadow-neon-indigo'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Top 5
            </button>
          </div>
        </div>

        {/* Entries List */}
        <div className="divide-y divide-slate-800/80">
          {displayedEntries.map((entry, idx) => {
            const isTop3 = (entry.rank || idx + 1) <= 3;
            const rank = entry.rank || idx + 1;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  entry.isCurrentPlayer
                    ? 'bg-indigo-950/40 border-l-4 border-l-indigo-400'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Left: Rank & Player Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl font-numeric font-extrabold flex items-center justify-center shrink-0 text-sm ${
                      rank === 1
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
                        : rank === 2
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-300/50'
                        : rank === 3
                        ? 'bg-amber-700/20 text-amber-500 border border-amber-700/50'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {rank}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-white truncate">
                        {entry.playerName}
                      </span>
                      {entry.isCurrentPlayer && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 font-numeric">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-emerald-400 font-medium truncate">{entry.persona}</span>
                      <span>•</span>
                      <span>{entry.badgesCount} badges</span>
                    </div>
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="flex items-center justify-between sm:justify-end gap-5 text-right shrink-0">
                  <div className="flex flex-col text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Net Worth
                    </span>
                    <span className="text-xs sm:text-sm font-bold font-numeric text-white">
                      {formatCurrency(entry.netWorth)}
                    </span>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Score
                    </span>
                    <span className="text-sm sm:text-base font-extrabold font-numeric text-fin-emeraldGlow">
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
