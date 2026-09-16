import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Award, Volume2, VolumeX, RotateCcw, Printer, Sun, Moon } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { HealthMeter } from '../ui/HealthMeter';

interface TopHUDProps {
  onOpenBadges?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenCertificate?: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  onOpenBadges,
  onOpenLeaderboard,
  onOpenCertificate,
}) => {
  const { state, dispatch } = useGame();
  const { netWorth, financialHealth, score, streak, streakMultiplier, settings, completedLevels } = state;
  const [isCleanTheme, setIsCleanTheme] = React.useState(false);

  const handleToggleTheme = () => {
    const next = !isCleanTheme;
    setIsCleanTheme(next);
    if (next) {
      document.body.classList.add('theme-clean');
    } else {
      document.body.classList.remove('theme-clean');
    }
  };

  const handleToggleSound = () => {
    dispatch({ type: 'TOGGLE_SOUND' });
  };

  const handleRestart = () => {
    if (window.confirm('Reset FinQuest progress and restart your career quest?')) {
      dispatch({ type: 'RESTART_GAME' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 shadow-glass">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Stage Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
            className="flex items-center gap-2 group text-left focus:outline-none"
            title="Return to Quest Hub"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-fin-indigo to-indigo-400 flex items-center justify-center shadow-neon-indigo font-bold text-white text-base">
              FQ
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                FINQUEST
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-900/50 text-indigo-300 border border-indigo-700/50">
                GD-01
              </span>
            </div>
          </button>
        </div>

        {/* Global Financial Metrics Bar */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-6 text-xs sm:text-sm">
          {/* Net Worth Display */}
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/90 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Net Worth
              </span>
              <AnimatedCounter
                value={netWorth}
                type="currency"
                className="text-white text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Health Meter */}
          <div className="bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800/90 shadow-sm">
            <HealthMeter score={financialHealth} compact={true} />
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/90 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Score
              </span>
              <AnimatedCounter
                value={score}
                type="score"
                className="text-fin-emeraldGlow text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Streak Multiplier */}
          <motion.div
            animate={streakMultiplier > 1 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold font-numeric ${
              streakMultiplier > 1.2
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20 shadow-sm'
                : streakMultiplier > 1.0
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/50'
            }`}
            title={`Streak: ${streak} consecutive optimal choices`}
          >
            <Flame className={`w-3.5 h-3.5 ${streakMultiplier > 1 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            <span>{streakMultiplier.toFixed(1)}x</span>
          </motion.div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenBadges && (
            <button
              onClick={onOpenBadges}
              className="p-2 rounded-xl glass-card-hover text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/50 relative"
              title="View Earned Badges"
              aria-label="View Badges"
            >
              <Award className="w-4 h-4 text-indigo-400" />
              {state.badges.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center font-numeric border border-slate-900">
                  {state.badges.length}
                </span>
              )}
            </button>
          )}

          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass-card-hover text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/50"
              title="Leaderboard Standings"
            >
              <span>Rankings</span>
            </button>
          )}

          {onOpenCertificate && (
            <button
              onClick={onOpenCertificate}
              className="px-2.5 py-1.5 rounded-xl glass-card-hover text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-500/40 shadow-sm flex items-center gap-1.5"
              title="Official Competence Certificate"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Certificate</span>
            </button>
          )}

          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-xl glass-card-hover text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/50"
            title={isCleanTheme ? 'Switch to Dark Slate Theme' : 'Switch to Clean Studio Minimalist Theme'}
            aria-label="Toggle Theme"
          >
            {isCleanTheme ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl glass-card-hover text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/50"
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            aria-label={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            onClick={handleRestart}
            className="p-2 rounded-xl glass-card-hover text-slate-400 hover:text-rose-400 bg-slate-800/40 border border-slate-800 hover:border-rose-500/40"
            title="Reset Game Progress"
            aria-label="Reset Game Progress"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

