import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Award, Volume2, VolumeX, RotateCcw, Printer, Sun, Moon, Video, Sparkles } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { HealthMeter } from '../ui/HealthMeter';
import { TeamLogo } from '../common/TeamLogo';

interface TopHUDProps {
  onOpenBadges?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenCertificate?: () => void;
  onOpenVideoSettings?: () => void;
  onOpenJudgeDemo?: () => void;
  onOpenDailyChallenge?: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  onOpenBadges,
  onOpenLeaderboard,
  onOpenCertificate,
  onOpenVideoSettings,
  onOpenJudgeDemo,
  onOpenDailyChallenge,
}) => {
  const { state, dispatch } = useGame();
  const { player, netWorth, financialHealth, score, streak, streakMultiplier, settings } = state;
  const isLight = settings.theme === 'light';
  const isVideoEnabled = settings.videoBackground?.enabled;

  const handleToggleTheme = () => {
    const nextTheme = isLight ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: nextTheme });
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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#27272A] shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Online User Chip */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
            title="Return to Quest Hub"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF5E1E] flex items-center justify-center shadow-brand-orange font-black text-black text-sm sm:text-base">
              FQ
            </div>
            <div>
              <span className="font-black text-sm sm:text-base tracking-tight text-white group-hover:text-[#FF5E1E] transition-colors">
                FIN<span className="text-[#FF5E1E]">QUEST</span>
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40">
                GD-01
              </span>
            </div>
          </button>

          {/* Official Team Swastik Logo */}
          <div className="hidden sm:flex items-center pl-1 border-l border-[#27272A]" title="Team Swastik">
            <TeamLogo size="sm" showText={false} />
          </div>

          {/* Online User Avatar Chip */}
          {player.name && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#18181D] border border-[#27272A]">
              <div className="relative w-6 h-6 rounded-full bg-[#FF5E1E] text-white flex items-center justify-center text-xs font-black">
                {player.name.charAt(0).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#121215]" />
              </div>
              <span className="text-xs font-bold text-zinc-200 truncate max-w-[100px]">
                {player.name}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#22C55E] font-black flex items-center gap-1 pl-1.5 border-l border-[#27272A]" title="Telemetry Flight Connection Active">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Live
              </span>
            </div>
          )}
        </div>

        {/* Global Financial Metrics Bar */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          {/* Net Worth Display */}
          <div className="flex items-center gap-2 bg-[#18181D] px-3 py-1.5 rounded-xl border border-[#27272A] shadow-sm">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">
                Net Worth
              </span>
              <AnimatedCounter
                value={netWorth}
                type="currency"
                className="text-white text-xs sm:text-sm font-black"
              />
            </div>
          </div>

          {/* Health Meter */}
          <div className="bg-[#18181D] px-2.5 py-1.5 rounded-xl border border-[#27272A] shadow-sm">
            <HealthMeter score={financialHealth} compact={true} />
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-2 bg-[#18181D] px-3 py-1.5 rounded-xl border border-[#27272A] shadow-sm">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">
                Score
              </span>
              <AnimatedCounter
                value={score}
                type="score"
                className="text-[#FF5E1E] text-xs sm:text-sm font-black"
              />
            </div>
          </div>

          {/* Streak Multiplier */}
          <motion.div
            animate={streakMultiplier > 1 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-black font-numeric ${
              streakMultiplier > 1.2
                ? 'bg-[#FF5E1E]/20 text-[#FF5E1E] border-[#FF5E1E]/50 shadow-brand-orange'
                : streakMultiplier > 1.0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#18181D] text-zinc-400 border-[#27272A]'
            }`}
            title={`Streak: ${streak} consecutive optimal choices`}
          >
            <Flame className={`w-3.5 h-3.5 ${streakMultiplier > 1 ? 'text-[#FF5E1E] fill-[#FF5E1E]' : 'text-zinc-500'}`} />
            <span>{streakMultiplier.toFixed(1)}x</span>
          </motion.div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Live Video Background Button */}
          {onOpenVideoSettings && (
            <button
              onClick={onOpenVideoSettings}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isVideoEnabled
                  ? 'bg-[#FF5E1E]/20 text-[#FF5E1E] border-[#FF5E1E] shadow-brand-orange'
                  : 'text-zinc-400 hover:text-white bg-[#18181D] border-[#27272A] hover:border-[#FF5E1E]'
              }`}
              title="Live Video Background Settings"
              aria-label="Live Video Background"
            >
              <Video className="w-4 h-4" />
            </button>
          )}

          {onOpenBadges && (
            <button
              onClick={onOpenBadges}
              className="p-2 rounded-xl text-zinc-300 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-[#FF5E1E] relative transition-colors cursor-pointer"
              title="View Earned Badges"
              aria-label="View Badges"
            >
              <Award className="w-4 h-4 text-[#FF5E1E]" />
              {state.badges.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5E1E] text-white text-[9px] font-black flex items-center justify-center font-numeric">
                  {state.badges.length}
                </span>
              )}
            </button>
          )}

          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-[#FF5E1E] transition-colors cursor-pointer"
              title="Leaderboard Standings"
            >
              <span>Rankings</span>
            </button>
          )}

          {/* Judge Demo Button for Hack2Ignite GD-01 */}
          {onOpenJudgeDemo && (
            <button
              onClick={onOpenJudgeDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-[#FF5E1E] hover:from-amber-600 hover:to-[#E04E15] border border-amber-400/60 shadow-brand-orange transition-all cursor-pointer animate-pulse"
              title="2-Minute Tour for Hackathon Judges"
            >
              <span>⚡ Judge Demo</span>
            </button>
          )}

          {/* Aviation Navigation Tabs */}
          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'training-deck' })}
            className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              state.gameStage === 'training-deck' || state.gameStage === 'scam-detective' || state.gameStage === 'turbulence'
                ? 'bg-[#FF5E1E] text-white shadow-brand-orange'
                : 'text-zinc-300 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-[#FF5E1E]'
            }`}
            title="Aviation Training Deck (Scam Detective & Turbulence)"
          >
            <span>🎯 Training Deck</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'simulator' })}
            className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              state.gameStage === 'simulator'
                ? 'bg-[#FF5E1E] text-white shadow-brand-orange'
                : 'text-zinc-300 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-[#FF5E1E]'
            }`}
            title="Launch Financial Flight Simulator"
          >
            <span>✈️ Flight Sim</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'diagnostic' })}
            className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              state.gameStage === 'diagnostic'
                ? 'bg-[#22C55E] text-white shadow-sm'
                : 'text-zinc-300 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-[#22C55E]'
            }`}
            title="Pre & Post Financial IQ Test"
          >
            <span>🧠 IQ Test</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'academy' })}
            className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              state.gameStage === 'academy'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-zinc-300 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-amber-500'
            }`}
            title="FinQuest 60-Sec Academy"
          >
            <span>🎓 Academy</span>
          </button>

          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'classroom' })}
            className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              state.gameStage === 'classroom'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-zinc-300 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-blue-500'
            }`}
            title="Educator Cockpit & Flight League"
          >
            <span>🏫 Classroom</span>
          </button>

          {onOpenDailyChallenge && (
            <button
              onClick={onOpenDailyChallenge}
              className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/60 transition-all cursor-pointer"
              title="Daily 60-Second Cockpit Dilemma"
            >
              <span>🔥 Daily Dilemma</span>
            </button>
          )}

          {onOpenCertificate && (
            <button
              onClick={onOpenCertificate}
              className="px-2.5 py-1.5 rounded-xl text-xs font-black text-white bg-[#FF5E1E] hover:bg-[#E04E15] border border-[#FF5E1E] shadow-brand-orange flex items-center gap-1.5 transition-all cursor-pointer"
              title="Official Competence Certificate"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Certificate</span>
            </button>
          )}

          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-xl text-zinc-300 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-[#FF5E1E] transition-colors cursor-pointer"
            title={isLight ? 'Switch to Dark Obsidian Theme' : 'Switch to Studio White Theme'}
            aria-label="Toggle Theme"
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-[#FF5E1E]" />
            ) : (
              <Sun className="w-4 h-4 text-[#FF5E1E]" />
            )}
          </button>

          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl text-zinc-300 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-[#FF5E1E] transition-colors cursor-pointer"
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            aria-label={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#22C55E]" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          <button
            onClick={handleRestart}
            className="p-2 rounded-xl text-zinc-400 hover:text-red-400 bg-[#18181D] border border-[#27272A] hover:border-red-500/40 transition-colors cursor-pointer"
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
