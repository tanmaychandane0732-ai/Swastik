import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Award,
  Trophy,
  ChevronRight,
  Shield,
  Edit2,
  Check,
  Sparkles,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { localAuth } from '../../services/localAuth';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeaderboard: () => void;
  onOpenCertificate: () => void;
  onOpenAuth?: (tab?: 'register' | 'login' | 'guest') => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  onOpenLeaderboard,
  onOpenCertificate,
  onOpenAuth,
}) => {
  const { state, dispatch } = useGame();
  const isLight = state.settings.theme === 'light';
  const { player, score, financialHealth, completedLevels, badges, settings, netWorth } = state;
  const { stop: stopLenis, start: startLenis } = useSmoothScroll();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(player.name || '');
  const [isConfirmRestartOpen, setIsConfirmRestartOpen] = useState(false);

  // Sound feedback on open
  useEffect(() => {
    if (isOpen) {
      soundManager.playDrawerOpen();
    }
  }, [isOpen]);

  // Isolate drawer scrolling: Pause Lenis and lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;

    stopLenis();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      startLenis();
    };
  }, [isOpen, stopLenis, startLenis]);

  // Keyboard accessibility — close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        soundManager.playDrawerClose();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleToggleTheme = () => {
    soundManager.playToggle();
    const nextTheme = isLight ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: nextTheme });
  };

  const handleToggleSound = () => {
    soundManager.playToggle();
    dispatch({ type: 'TOGGLE_SOUND' });
  };

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (nameInput.trim()) {
      dispatch({ type: 'SET_PLAYER_NAME', payload: nameInput.trim() });
      soundManager.playClick();
    }
    setIsEditingName(false);
  };

  const levelRank =
    completedLevels.length === 0
      ? 'Rookie Flight Cadet'
      : completedLevels.length === 1
      ? 'Junior Aviator'
      : completedLevels.length === 2
      ? 'Senior Navigator'
      : 'Flight Commander';

  const progressPct = Math.min(100, Math.round((completedLevels.length / 3) * 100));

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          data-lenis-prevent="true"
        >
          {/* Subtle darkened backdrop that keeps hero background video visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => {
              soundManager.playDrawerClose();
              onClose();
            }}
            aria-label="Close drawer backdrop"
          />

          {/* Right-Side Smoked Glass Drawer with constrained viewport */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent="true"
            className={`fixed top-0 right-0 h-[100dvh] max-h-[100dvh] w-full max-w-[380px] sm:max-w-[420px] z-50 flex flex-col glass-panel border-l overflow-hidden ${
              isLight ? 'border-black/10 text-[#17191D]' : 'border-white/10 text-[#F5F3EF]'
            } shadow-[0_0_60px_rgba(0,0,0,0.65)]`}
            aria-label="Profile panel"
          >
            {/* ── 1. Header (Sticky/Fixed Top) ────────────────────── */}
            <div
              className={`flex-shrink-0 flex items-center justify-between px-6 py-4 border-b ${
                isLight ? 'border-black/08 bg-white/40' : 'border-white/08 bg-black/20'
              } backdrop-blur-md z-10`}
            >
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm tracking-tight">
                  FIN<span className="text-[#FF6A2A]">QUEST</span>
                </span>
                <span className="label-telemetry text-[9px] px-1.5 py-0.5 rounded bg-[#FF6A2A]/15 text-[#FF6A2A] border border-[#FF6A2A]/30">
                  UTILITY
                </span>
              </div>

              <button
                onClick={() => {
                  soundManager.playDrawerClose();
                  onClose();
                }}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isLight
                    ? 'text-zinc-500 hover:text-zinc-900 hover:bg-black/05'
                    : 'text-[#A7ABB4] hover:text-white hover:bg-white/08'
                }`}
                aria-label="Close profile drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── 2. Scrollable Body Region ───────────────────────── */}
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-5 space-y-6 select-text scroll-smooth"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
              }}
              tabIndex={0}
              aria-label="Profile drawer contents"
            >
              {/* Profile Card */}
              <section>
                <p className={`label-telemetry mb-2.5 ${isLight ? 'text-[#9EA3AD]' : 'text-[#5A5E68]'}`}>
                  PILOT PROFILE
                </p>

                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isLight
                      ? 'bg-black/03 border-black/08 shadow-sm'
                      : 'bg-white/04 border-white/08 shadow-inner'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Callsign Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6A2A] to-[#E04E15] flex items-center justify-center shadow-[0_0_20px_rgba(255,106,42,0.35)] flex-shrink-0">
                      {player.name ? (
                        <span className="font-display font-black text-white text-lg">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {isEditingName ? (
                        <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            maxLength={28}
                            autoFocus
                            placeholder="Callsign..."
                            className={`w-full text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none focus:border-[#FF6A2A] ${
                              isLight ? 'bg-white border-zinc-300' : 'bg-black/40 border-white/15'
                            }`}
                          />
                          <button
                            type="submit"
                            className="p-1 rounded-lg bg-[#FF6A2A] text-white hover:bg-[#E04E15] cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="font-display font-bold text-sm truncate">
                            {player.name || 'Anonymous Pilot'}
                          </p>
                          <button
                            onClick={() => {
                              setNameInput(player.name || '');
                              setIsEditingName(true);
                            }}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              isLight
                                ? 'text-zinc-400 hover:text-zinc-700'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                            title="Edit callsign"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-[#FF6A2A] font-medium mt-0.5">{levelRank}</p>
                    </div>
                  </div>

                  {/* Flight Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-white/06 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isLight ? 'text-[#656A73]' : 'text-[#A7ABB4]'}>
                        Flight Certification Progress
                      </span>
                      <span className="label-telemetry font-bold text-[#FF6A2A]">
                        {progressPct}%
                      </span>
                    </div>

                    <div
                      className={`h-1.5 rounded-full overflow-hidden ${
                        isLight ? 'bg-black/08' : 'bg-white/08'
                      }`}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#FF6A2A] to-amber-400"
                      />
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center pt-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isLight ? 'bg-white/80' : 'bg-black/25'
                      } border border-white/05`}
                    >
                      <span className="label-telemetry text-[9px] block text-[#A7ABB4]">NET</span>
                      <span className="font-numeric font-bold text-xs">
                        ₹{(netWorth / 1000).toFixed(0)}k
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl ${
                        isLight ? 'bg-white/80' : 'bg-black/25'
                      } border border-white/05`}
                    >
                      <span className="label-telemetry text-[9px] block text-[#A7ABB4]">HEALTH</span>
                      <span
                        className={`font-numeric font-bold text-xs ${
                          financialHealth >= 70
                            ? 'text-emerald-400'
                            : financialHealth >= 40
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {financialHealth}%
                      </span>
                    </div>

                    <div
                      className={`p-2 rounded-xl ${
                        isLight ? 'bg-white/80' : 'bg-black/25'
                      } border border-white/05`}
                    >
                      <span className="label-telemetry text-[9px] block text-[#A7ABB4]">PTS</span>
                      <span className="font-numeric font-bold text-xs text-[#FF6A2A]">{score}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── 3. Controls & Preferences ──────────────────────── */}
              <section className="space-y-2">
                <p className={`label-telemetry ${isLight ? 'text-[#9EA3AD]' : 'text-[#5A5E68]'}`}>
                  PREFERENCES
                </p>

                {/* Theme Switcher */}
                <div
                  onClick={handleToggleTheme}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleToggleTheme()}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-black/02 hover:bg-black/05 border-black/06'
                      : 'bg-white/03 hover:bg-white/06 border-white/06'
                  }`}
                  aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#FF6A2A]/10 text-[#FF6A2A]">
                      {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Theme</p>
                      <p className="text-xs text-[#A7ABB4]">
                        {isLight ? 'Studio Light' : 'Obsidian Smoked Glass'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`label-telemetry px-2.5 py-1 rounded-lg border text-xs font-bold ${
                      isLight
                        ? 'bg-black/05 border-black/10 text-zinc-700'
                        : 'bg-white/06 border-white/10 text-zinc-300'
                    }`}
                  >
                    {isLight ? 'LIGHT' : 'DARK'}
                  </span>
                </div>

                {/* Audio Master Switch */}
                <div
                  onClick={handleToggleSound}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleToggleSound()}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-black/02 hover:bg-black/05 border-black/06'
                      : 'bg-white/03 hover:bg-white/06 border-white/06'
                  }`}
                  aria-label={settings.soundEnabled ? 'Mute audio' : 'Unmute audio'}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        settings.soundEnabled
                          ? 'bg-emerald-500/15 text-[#22C55E]'
                          : 'bg-zinc-500/15 text-[#A7ABB4]'
                      }`}
                    >
                      {settings.soundEnabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Audio Feedback</p>
                      <p className="text-xs text-[#A7ABB4]">
                        {settings.soundEnabled ? 'Subtle tactile synthesis' : 'All sounds muted'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`label-telemetry px-2.5 py-1 rounded-lg border text-xs font-bold ${
                      settings.soundEnabled
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-[#22C55E]'
                        : isLight
                        ? 'bg-black/05 border-black/10 text-zinc-400'
                        : 'bg-white/06 border-white/10 text-zinc-500'
                    }`}
                  >
                    {settings.soundEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </section>

              {/* ── 4. Future-Ready Learning Proof Entries ───────────── */}
              <section className="space-y-2">
                <p className={`label-telemetry ${isLight ? 'text-[#9EA3AD]' : 'text-[#5A5E68]'}`}>
                  ACHIEVEMENT & COMMUNITY
                </p>

                {/* Certification Entry */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    onOpenCertificate();
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    isLight
                      ? 'bg-black/02 hover:bg-black/05 border-black/06'
                      : 'bg-white/03 hover:bg-white/06 border-white/06'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#FF6A2A]/10 text-[#FF6A2A] group-hover:bg-[#FF6A2A] group-hover:text-white transition-colors">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Certification</p>
                        <p className="text-xs text-[#A7ABB4]">
                          Printable proof of financial competence
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A7ABB4] group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Future-Ready Learning Proof Milestone Card */}
                  <div
                    className={`mt-2.5 p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                      isLight
                        ? 'bg-amber-500/08 border-amber-500/20 text-amber-900'
                        : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>MILESTONE TRACKER</span>
                    </div>
                    Complete all 3 Core Career Drills and graduate the 6-Month Simulation to claim your verified certificate.
                  </div>
                </div>

                {/* Leaderboard Entry */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    onOpenLeaderboard();
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    isLight
                      ? 'bg-black/02 hover:bg-black/05 border-black/06'
                      : 'bg-white/03 hover:bg-white/06 border-white/06'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Leaderboard</p>
                        <p className="text-xs text-[#A7ABB4]">
                          Decision quality rankings (GD-01)
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A7ABB4] group-hover:translate-x-0.5 transition-transform" />
                  </div>

                  {/* Demo Leaderboard Micro-Preview */}
                  <div
                    className={`mt-2.5 p-2 rounded-xl border text-[10px] space-y-1 font-numeric ${
                      isLight
                        ? 'bg-black/03 border-black/06 text-zinc-700'
                        : 'bg-black/30 border-white/06 text-zinc-300'
                    }`}
                  >
                    <div className="flex justify-between text-[9px] font-bold text-[#A7ABB4] label-telemetry pb-0.5 border-b border-white/05">
                      <span>DEMO LEADERBOARD</span>
                      <span>DECISION IQ</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span>01. Ananya Sharma (Bengaluru)</span>
                      <span className="font-bold text-[#22C55E]">96%</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span>02. Rohan Mehta (Pune)</span>
                      <span className="font-bold text-[#22C55E]">91%</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#FF6A2A] font-bold">
                      <span>03. {player.name || 'You (Pilot)'}</span>
                      <span>{Math.min(99, Math.max(50, Math.round(financialHealth)))}%</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ── 5. Earned Badges ───────────────────────────────── */}
              {badges.length > 0 && (
                <section className="space-y-2">
                  <p className={`label-telemetry ${isLight ? 'text-[#9EA3AD]' : 'text-[#5A5E68]'}`}>
                    ACHIEVED BADGES ({badges.length})
                  </p>
                  <div
                    className={`p-3 rounded-2xl border flex items-center gap-3 ${
                      isLight ? 'bg-black/02 border-black/06' : 'bg-white/03 border-white/06'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-[#FF6A2A]/10 text-[#FF6A2A]">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold">
                        {badges.length} Aeronautical Achievement{badges.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-[11px] text-[#A7ABB4] truncate">
                        {badges.join(' • ')}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* ── 6. Flight Simulation Management ─────────────────── */}
              <section className="space-y-2 pt-1">
                <p className={`label-telemetry ${isLight ? 'text-[#9EA3AD]' : 'text-[#5A5E68]'}`}>
                  FLIGHT SIMULATION MANAGEMENT
                </p>
                {/* Switch Pilot / Sign Out */}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    localAuth.logout();
                    dispatch({ type: 'SET_PLAYER_NAME', payload: '' });
                    onClose();
                    onOpenAuth?.('login');
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                    isLight
                      ? 'bg-amber-500/05 hover:bg-amber-500/10 border-amber-500/15 text-amber-600'
                      : 'bg-amber-500/08 hover:bg-amber-500/15 border-amber-500/20 text-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Switch Pilot / Sign Out</p>
                      <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Log in with another account or create a callsign
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Reset Flight Progress */}
                <button
                  type="button"
                  onClick={() => setIsConfirmRestartOpen(true)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                    isLight
                      ? 'bg-red-500/05 hover:bg-red-500/10 border-red-500/15 text-red-600'
                      : 'bg-red-500/08 hover:bg-red-500/15 border-red-500/20 text-red-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-500/15 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Reset Flight Progress</p>
                      <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Calibrate new flight cadet career
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </section>
            </div>

            {/* ── 7. Drawer Footer (Sticky/Fixed Bottom with Safe-Area) ── */}
            <div
              className={`flex-shrink-0 p-4 border-t text-center pb-[calc(1rem+env(safe-area-inset-bottom,0px))] ${
                isLight ? 'border-black/08 bg-black/02' : 'border-white/08 bg-white/02'
              }`}
            >
              <p className="label-telemetry text-[9px] text-[#A7ABB4]">
                FINQUEST · GD-01 FINANCIAL FLIGHT SIMULATOR · TEAM SWASTIK
              </p>
            </div>
          </motion.aside>
        </div>
      )}

      {/* Flight Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmRestartOpen}
        title="Reset Flight Progress?"
        message="This will reset your current flight telemetry, score, net worth, and game stage back to initial flight calibration. Are you sure you want to proceed?"
        confirmLabel="Reset Flight"
        cancelLabel="Keep Flying"
        variant="danger"
        onConfirm={() => {
          soundManager.playWarning();
          dispatch({ type: 'RESTART_GAME' });
          setIsConfirmRestartOpen(false);
          onClose();
        }}
        onCancel={() => setIsConfirmRestartOpen(false)}
      />
    </AnimatePresence>
  );
};
