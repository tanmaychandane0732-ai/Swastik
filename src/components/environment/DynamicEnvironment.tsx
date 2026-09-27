import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { EnvironmentMood, ENVIRONMENT_PALETTES, EnvironmentPalette } from '../../types/environment';

interface DynamicEnvironmentProps {
  /** Optional override for landing page active chapter */
  activeChapter?: string;
  children?: React.ReactNode;
}

export const DynamicEnvironment: React.FC<DynamicEnvironmentProps> = ({
  activeChapter,
  children,
}) => {
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';
  const { financialHealth, gameStage } = state;
  const { progress: scrollProgress } = useScrollProgress();

  const [activeMood, setActiveMood] = useState<EnvironmentMood>('home');

  // Check reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Determine active mood from game stage or landing page scroll chapter
  useEffect(() => {
    if (gameStage === 'landing') {
      if (activeChapter === 'diagnostic') setActiveMood('diagnostic');
      else if (activeChapter === 'simulator') setActiveMood('simulator');
      else if (activeChapter === 'drills') setActiveMood('drills');
      else if (activeChapter === 'whatif') setActiveMood('turbulence');
      else if (activeChapter === 'certificate' || activeChapter === 'cta') setActiveMood('certificate');
      else if (activeChapter === 'classroom') setActiveMood('classroom');
      else setActiveMood('home');
    } else if (gameStage === 'simulator') {
      setActiveMood('simulator');
    } else if (gameStage === 'diagnostic') {
      setActiveMood('diagnostic');
    } else if (gameStage === 'turbulence') {
      setActiveMood('turbulence');
    } else if (gameStage === 'scam-detective') {
      setActiveMood('scam');
    } else if (gameStage === 'classroom') {
      setActiveMood('classroom');
    } else if (gameStage === 'academy') {
      setActiveMood('academy');
    } else if (gameStage === 'leaderboard') {
      setActiveMood('leaderboard');
    } else if (gameStage === 'results') {
      setActiveMood('certificate');
    } else {
      setActiveMood('home');
    }
  }, [gameStage, activeChapter]);

  const palette: EnvironmentPalette = useMemo(() => {
    return ENVIRONMENT_PALETTES[activeMood] || ENVIRONMENT_PALETTES.home;
  }, [activeMood]);

  // Financial health reactivity
  const healthWarningOpacity = financialHealth < 40 ? 0.35 : financialHealth < 60 ? 0.15 : 0;
  const healthResilienceOpacity = financialHealth >= 75 ? 0.25 : 0;

  // Multi-layer continuous scroll parallax offsets (clamped)
  const bgMeshY = prefersReducedMotion ? 0 : scrollProgress * 180;
  const orbsParallaxY = prefersReducedMotion ? 0 : scrollProgress * -240;
  const compassParallaxY = prefersReducedMotion ? 0 : scrollProgress * -160;
  const trajectoryDashOffset = prefersReducedMotion ? 0 : -scrollProgress * 400;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* ── 1. BaseGradient (Fluid Continuous Ambient Mesh) ─────────── */}
      <motion.div
        animate={{
          background: isLight ? palette.lightBg : palette.ambientBg,
          y: bgMeshY,
        }}
        transition={{
          background: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
          y: { duration: 0.1, ease: 'linear' },
        }}
        className="absolute inset-0 w-full h-[120vh] transition-opacity duration-1000"
      />

      {/* ── 2. AtmosphericGlow (Multi-Orb Organic Light Architecture) ── */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ transform: `translate3d(0, ${orbsParallaxY}px, 0)` }}
      >
        {/* Orb 1: Primary Mood Anchor (Top Left / Follows Chapter) */}
        <motion.div
          animate={{
            backgroundColor: isLight ? palette.lightPrimary : palette.primaryColor,
            x: prefersReducedMotion ? 0 : [0, 30, 0],
            y: prefersReducedMotion ? 0 : [0, 35, 0],
            scale: prefersReducedMotion ? 1 : [1, 1.10, 1],
          }}
          transition={{
            backgroundColor: { duration: 1.2, ease: 'easeInOut' },
            x: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`absolute -top-36 -left-36 w-[560px] sm:w-[720px] h-[560px] sm:h-[720px] rounded-full blur-[130px] ${
            isLight ? 'opacity-40 mix-blend-multiply' : 'opacity-35 mix-blend-screen'
          }`}
        />

        {/* Orb 2: Secondary Harmonic Glow (Mid Right) */}
        <motion.div
          animate={{
            backgroundColor: isLight ? palette.lightSecondary : palette.secondaryColor,
            x: prefersReducedMotion ? 0 : [0, -40, 0],
            y: prefersReducedMotion ? 0 : [0, 45, 0],
            scale: prefersReducedMotion ? 1 : [1, 1.14, 1],
          }}
          transition={{
            backgroundColor: { duration: 1.2, ease: 'easeInOut' },
            x: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 22, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`absolute top-[32%] -right-44 w-[520px] sm:w-[660px] h-[520px] sm:h-[660px] rounded-full blur-[140px] ${
            isLight ? 'opacity-35 mix-blend-multiply' : 'opacity-30 mix-blend-screen'
          }`}
        />

        {/* Orb 3: Accent Action Glow (Bottom Left Center) */}
        <motion.div
          animate={{
            backgroundColor: isLight ? palette.lightAccent : palette.accentColor,
            x: prefersReducedMotion ? 0 : [0, 35, 0],
            y: prefersReducedMotion ? 0 : [0, -35, 0],
          }}
          transition={{
            backgroundColor: { duration: 1.2, ease: 'easeInOut' },
            x: { duration: 15, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 17, repeat: Infinity, ease: 'easeInOut' },
          }}
          className={`absolute bottom-[5%] left-[25%] w-[440px] sm:w-[580px] h-[440px] sm:h-[580px] rounded-full blur-[110px] ${
            isLight ? 'opacity-25 mix-blend-multiply' : 'opacity-25 mix-blend-screen'
          }`}
        />
      </div>

      {/* Dynamic Health Warning Ambient Flash (emergency state below 40% health) */}
      {healthWarningOpacity > 0 && (
        <motion.div
          animate={{
            opacity: [healthWarningOpacity * 0.6, healthWarningOpacity, healthWarningOpacity * 0.6],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.30)_0%,transparent_70%)] mix-blend-screen pointer-events-none"
        />
      )}

      {/* Dynamic Financial Resilience Emerald Glow (when savings / health is high) */}
      {healthResilienceOpacity > 0 && (
        <motion.div
          animate={{
            opacity: [healthResilienceOpacity * 0.7, healthResilienceOpacity, healthResilienceOpacity * 0.7],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.22)_0%,transparent_65%)] mix-blend-screen pointer-events-none"
        />
      )}

      {/* ── 3. LightField (SceneAI-Inspired Atmospheric Sunlight Shaft) ─ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: prefersReducedMotion ? -25 : -25 + scrollProgress * 15,
            opacity: isLight ? 0.35 : 0.45,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`absolute top-0 right-1/4 w-[320px] sm:w-[460px] h-[130vh] origin-top transform ${
            isLight
              ? 'bg-gradient-to-b from-sky-300/25 via-amber-200/15 to-transparent blur-3xl'
              : 'bg-gradient-to-b from-sky-400/18 via-[#FF6A2A]/08 to-transparent blur-3xl'
          }`}
        />
      </div>

      {/* ── 4. AbstractShapes (Aviation Compass & Artificial Horizon) ── */}
      <div
        className="absolute inset-0 overflow-hidden opacity-35 sm:opacity-45"
        style={{ transform: `translate3d(0, ${compassParallaxY}px, 0)` }}
      >
        <motion.svg
          animate={{
            rotate: prefersReducedMotion ? 0 : 360,
          }}
          transition={{
            duration: 200,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-[18%] -right-[12%] w-[850px] sm:w-[1200px] h-[850px] sm:h-[1200px]"
          viewBox="0 0 1000 1000"
          fill="none"
        >
          {/* Outer compass ring */}
          <circle
            cx="500"
            cy="500"
            r="460"
            stroke={isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)'}
            strokeWidth="1.5"
            strokeDasharray="4 8"
          />
          {/* Degree ticks */}
          <circle
            cx="500"
            cy="500"
            r="380"
            stroke={isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)'}
            strokeWidth="1"
          />
          {/* Inner telemetry ring */}
          <circle
            cx="500"
            cy="500"
            r="280"
            stroke={isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)'}
            strokeWidth="1.5"
            strokeDasharray="12 24"
          />
          {/* Cardinal headings */}
          <path
            d="M 500,20 L 500,60 M 500,940 L 500,980 M 20,500 L 60,500 M 940,500 L 980,500"
            stroke={isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.12)'}
            strokeWidth="2"
          />
        </motion.svg>
      </div>

      {/* ── 5. FinancialGraphics & FlightGraphics (Trajectory Vector) ─ */}
      <svg
        className="absolute inset-0 w-full h-full opacity-45 sm:opacity-55"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="flight-grid-pattern" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke={isLight ? 'rgba(0, 0, 0, 0.035)' : 'rgba(255, 255, 255, 0.035)'}
              strokeWidth="1"
            />
            <circle
              cx="0"
              cy="0"
              r="1"
              fill={isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.14)'}
            />
          </pattern>

          <linearGradient id="compounding-curve-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.primaryColor} stopOpacity="0" />
            <stop offset="50%" stopColor={palette.secondaryColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={palette.accentColor} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#flight-grid-pattern)" />

        {/* Compounding Flight Trajectory Path linked to scroll position */}
        <motion.path
          d="M -100,780 C 260,720 480,590 780,420 C 1080,250 1340,120 1850,30"
          fill="none"
          stroke="url(#compounding-curve-gradient)"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeDashoffset={trajectoryDashOffset}
          className="transition-all duration-300"
        />
      </svg>

      {/* ── 6. SectionAccent (Focus Glow & Radial Contrast Shield) ──── */}
      {/* Top & bottom vignettes preserve legibility of TopHUD and footer */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-700 ${
          isLight
            ? 'bg-gradient-to-b from-[#F4F1EC]/65 via-transparent to-[#F4F1EC]/75'
            : 'bg-gradient-to-b from-[#0A0C0F]/70 via-transparent to-[#0A0C0F]/80'
        }`}
      />

      {/* Radial center clarity window — guarantees foreground text readability */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(244,241,236,0.60)_100%)]'
            : 'bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(10,12,15,0.72)_100%)]'
        }`}
      />

      {children}
    </div>
  );
};
