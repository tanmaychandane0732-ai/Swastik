import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Flame } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { HealthMeter } from '../ui/HealthMeter';
import { TeamLogo } from '../common/TeamLogo';
import { ProfileDrawer } from './ProfileDrawer';
import { soundManager } from '../../services/audioService';

interface TopHUDProps {
  onOpenBadges?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenCertificate?: () => void;
  onOpenVideoSettings?: () => void;
  onOpenJudgeDemo?: () => void;
  onOpenDailyChallenge?: () => void;
  onOpenAuth?: (tab?: 'register' | 'login' | 'guest') => void;
}

interface NavItem {
  id: string;
  label: string;
  stage?: string;
  action?: 'judgeDemo';
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', stage: 'landing' },
  { id: 'judge-demo', label: 'Judge Demo', action: 'judgeDemo' },
  { id: 'training-deck', label: 'Training Deck', stage: 'training-deck' },
  { id: 'flight-sim', label: 'Flight Sim', stage: 'simulator' },
  { id: 'iq-test', label: 'IQ Test', stage: 'diagnostic' },
  { id: 'academy', label: 'Academy', stage: 'academy' },
  { id: 'classroom', label: 'Classroom', stage: 'classroom' },
];

/** Isolated thin scroll progress indicator */
const HUDProgressBar: React.FC = () => {
  const { progress } = useScrollProgress();
  return (
    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-black/05 overflow-hidden z-50 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-[#FF6A2A] via-[#00D2FF] to-[#22C55E] transition-all duration-75 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
      />
    </div>
  );
};

export const TopHUD: React.FC<TopHUDProps> = ({
  onOpenLeaderboard,
  onOpenCertificate,
  onOpenJudgeDemo,
  onOpenAuth,
}) => {
  const { state, dispatch } = useGame();
  const { player, netWorth, financialHealth, score, streakMultiplier, settings } = state;
  const isLight = settings.theme === 'light';

  // Only update isScrolled when crossing 20px threshold
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY > 20;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if pilot is identified
  const isIdentified = !!(player.name && player.name.trim() !== '' && player.name !== 'Cadet');

  // Close mobile navigation on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMobileMenuOpen]);

  const handleNavClick = (item: NavItem) => {
    soundManager.playNavChange();
    setIsMobileMenuOpen(false);

    if (item.action === 'judgeDemo') {
      onOpenJudgeDemo?.();
      return;
    }

    // Protect game stages if user has not entered name or logged in
    if (!isIdentified && item.stage && item.stage !== 'landing') {
      soundManager.playWarning();
      onOpenAuth?.('register');
      return;
    }

    if (item.stage) {
      dispatch({ type: 'SET_STAGE', payload: item.stage as any });
    }
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.action === 'judgeDemo') return false;
    if (item.stage === 'landing') return state.gameStage === 'landing';
    if (item.stage === 'training-deck') {
      return ['training-deck', 'scam-detective', 'turbulence'].includes(state.gameStage);
    }
    return state.gameStage === item.stage;
  };

  return (
    <>
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FF6A2A] focus:text-white focus:font-bold focus:text-xs focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main flight content
      </a>

      <header
        className={`sticky top-0 z-40 w-full glass-subtle border-b transition-all duration-300 ${
          isLight
            ? isScrolled
              ? 'bg-white/75 border-black/10 shadow-sm'
              : 'bg-white/55 border-black/06 shadow-none'
            : isScrolled
            ? 'bg-[#0F1218]/75 border-white/12 shadow-[0_8px_30px_rgba(0,0,0,0.35)]'
            : 'bg-[#0F1218]/55 border-white/08 shadow-none'
        }`}
      >
        {/* Global Thin Scroll Progress Indicator */}
        <HUDProgressBar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`flex items-center justify-between transition-all duration-200 ${isScrolled ? 'h-13' : 'h-14'}`}>
            {/* ── 1. Brand / Identity ──────────────────────────────── */}
            <div className="flex items-center gap-3.5 flex-shrink-0">
              <button
                onClick={() => {
                  soundManager.playNavChange();
                  dispatch({ type: 'SET_STAGE', payload: 'landing' });
                }}
                className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
                title="FinQuest Home"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FF6A2A] flex items-center justify-center shadow-[0_0_16px_rgba(255,106,42,0.40)] font-display font-black text-white text-sm">
                  FQ
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-sm tracking-tight text-white group-hover:text-[#FF6A2A] transition-colors">
                    FIN<span className="text-[#FF6A2A]">QUEST</span>
                  </span>
                  <span className="hidden sm:inline-block label-telemetry text-[9px] px-1.5 py-0.5 rounded bg-[#FF6A2A]/15 text-[#FF6A2A] border border-[#FF6A2A]/30">
                    GD-01
                  </span>
                </div>
              </button>

              <div className="hidden md:block w-px h-4 bg-white/10" />

              <div className="hidden md:flex items-center" title="Team Swastik">
                <TeamLogo size="sm" showText={false} />
              </div>
            </div>

            {/* ── 2. Primary Desktop Navigation (Exact 7 Clean Tabs, No Emojis) ── */}
            <nav
              className="hidden lg:flex items-center gap-1 xl:gap-1.5"
              aria-label="Primary navigation"
            >
              {PRIMARY_NAV_ITEMS.map((item) => {
                const active = isItemActive(item);
                const isJudge = item.action === 'judgeDemo';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                      active
                        ? isLight
                          ? 'text-[#FF6A2A] bg-[#FF6A2A]/10 font-semibold'
                          : 'text-[#FF6A2A] bg-[#FF6A2A]/12 font-semibold'
                        : isJudge
                        ? 'text-amber-300 hover:text-white hover:bg-amber-500/15'
                        : isLight
                        ? 'text-[#656A73] hover:text-[#17191D] hover:bg-black/04'
                        : 'text-[#A7ABB4] hover:text-[#F5F3EF] hover:bg-white/06'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span>{item.label}</span>

                    {/* Subtle active underline indicator */}
                    {active && (
                      <motion.div
                        layoutId="active-nav-glow"
                        className="absolute bottom-0 left-2.5 right-2.5 h-[2px] rounded-full bg-[#FF6A2A]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── 3. Right Utility Section & Minimal Profile Button ── */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Telemetry Capsule (Quiet, Compact) */}
              <div className="hidden 2xl:flex items-center gap-2.5 px-3 py-1 rounded-xl bg-white/04 border border-white/08">
                <div className="flex flex-col text-left">
                  <span className="label-telemetry text-[8px] text-[#A7ABB4]">NET</span>
                  <AnimatedCounter
                    value={netWorth}
                    type="currency"
                    className="font-numeric font-bold text-xs text-[#F5F3EF]"
                  />
                </div>

                <div className="w-px h-4 bg-white/10" />

                <HealthMeter score={financialHealth} compact={true} />

                <div className="w-px h-4 bg-white/10" />

                <div className="flex flex-col text-left">
                  <span className="label-telemetry text-[8px] text-[#A7ABB4]">PTS</span>
                  <AnimatedCounter
                    value={score}
                    type="score"
                    className="font-numeric font-bold text-xs text-[#FF6A2A]"
                  />
                </div>

                {streakMultiplier > 1 && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#FF6A2A]/15 text-[#FF6A2A] text-[10px] font-bold font-numeric border border-[#FF6A2A]/30">
                    <Flame className="w-2.5 h-2.5 fill-current" />
                    <span>{streakMultiplier.toFixed(1)}x</span>
                  </div>
                )}
              </div>

              {/* Pilot Status or Sign In Button */}
              {!isIdentified ? (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    onOpenAuth?.('register');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF6A2A]/15 text-[#FF6A2A] border border-[#FF6A2A]/35 hover:bg-[#FF6A2A] hover:text-white transition-all cursor-pointer shadow-sm"
                  title="Sign In or Register Cadet Account"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In / Log In</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setIsProfileOpen(true);
                  }}
                  className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isLight ? 'bg-black/04 border-black/08 text-zinc-800' : 'bg-white/06 border-white/10 text-zinc-200'
                  }`}
                  title="Active Pilot Callsign"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span className="max-w-[100px] truncate">{player.name}</span>
                </button>
              )}

              {/* Minimalist Profile Icon Button (Top Right Entrypoint) */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  soundManager.playClick();
                  setIsProfileOpen(true);
                }}
                className={`relative flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-200 cursor-pointer ${
                  isProfileOpen
                    ? 'bg-[#FF6A2A]/20 border-[#FF6A2A] shadow-[0_0_16px_rgba(255,106,42,0.35)]'
                    : isLight
                    ? 'bg-black/04 border-black/10 hover:bg-[#FF6A2A]/10 hover:border-[#FF6A2A]/40'
                    : 'bg-white/06 border-white/15 hover:bg-[#FF6A2A]/12 hover:border-[#FF6A2A]/40'
                }`}
                title="Open Profile, Settings & Resources"
                aria-label="Open profile drawer"
              >
                {player.name ? (
                  <span className="font-display font-bold text-xs text-[#FF6A2A]">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-4 h-4 text-[#A7ABB4]" />
                )}

                {/* Subtle telemetry live connection dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#0A0C0F]" />
              </motion.button>

              {/* Mobile Navigation Toggle */}
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className={`lg:hidden p-2 rounded-xl transition-colors cursor-pointer border ${
                  isLight
                    ? 'text-zinc-700 bg-black/04 border-black/08 hover:bg-black/08'
                    : 'text-[#A7ABB4] bg-white/05 border-white/10 hover:text-white hover:bg-white/10'
                }`}
                aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. Mobile Clean Navigation Dropdown (Same 7 Clean Tabs) ── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Dimmed backdrop to dismiss mobile menu on outside tap */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 top-14 bg-black/50 backdrop-blur-xs lg:hidden z-30"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu backdrop"
              />
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className={`lg:hidden border-t overflow-hidden relative z-40 ${
                  isLight ? 'border-black/08 bg-white/95' : 'border-white/08 bg-[#0A0C0F]/95'
                } backdrop-blur-xl px-4 py-3`}
              >
              <div className="grid grid-cols-2 gap-1.5">
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const active = isItemActive(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#FF6A2A]/15 text-[#FF6A2A] font-bold border border-[#FF6A2A]/30'
                          : isLight
                          ? 'text-[#656A73] hover:bg-black/04 hover:text-[#17191D]'
                          : 'text-[#A7ABB4] hover:bg-white/06 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Quick Auth / Profile Action */}
              <div className="mt-3 pt-3 border-t border-white/08 flex items-center justify-between">
                <span className="text-xs text-[#A7ABB4]">Pilot: {player.name || 'Not Signed In'}</span>
                {!isIdentified ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth?.('register');
                    }}
                    className="text-xs font-bold text-[#FF6A2A] hover:underline cursor-pointer"
                  >
                    Sign In / Log In →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsProfileOpen(true);
                    }}
                    className="text-xs font-bold text-[#FF6A2A] hover:underline cursor-pointer"
                  >
                    View Profile Drawer →
                  </button>
                )}
              </div>
            </motion.div>
          </>
          )}
        </AnimatePresence>
      </header>

      {/* ── 5. Apple-Style Right Glass Profile Drawer ─────────────── */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenLeaderboard={() => {
          onOpenLeaderboard?.();
          dispatch({ type: 'SET_STAGE', payload: 'leaderboard' });
        }}
        onOpenCertificate={() => {
          onOpenCertificate?.();
        }}
        onOpenAuth={onOpenAuth}
      />
    </>
  );
};
