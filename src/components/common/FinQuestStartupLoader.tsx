import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Volume2, VolumeX, ArrowRight, Sparkles } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';

interface FinQuestStartupLoaderProps {
  onComplete: () => void;
}

type LoaderState = 'loading' | 'ready' | 'exiting' | 'complete';

interface CockpitSystem {
  id: string;
  name: string;
  triggerPct: number;
}

const COCKPIT_SYSTEMS: CockpitSystem[] = [
  { id: 'engine', name: 'FINANCIAL ENGINE', triggerPct: 15 },
  { id: 'radar', name: 'RISK RADAR', triggerPct: 35 },
  { id: 'sim', name: 'SIMULATION ENGINE', triggerPct: 58 },
  { id: 'cognitive', name: 'COGNITIVE MATRIX', triggerPct: 78 },
  { id: 'telemetry', name: 'FLIGHT TELEMETRY', triggerPct: 95 },
];

export const FinQuestStartupLoader: React.FC<FinQuestStartupLoaderProps> = ({ onComplete }) => {
  const { state, dispatch } = useGame();
  const [loaderState, setLoaderState] = useState<LoaderState>('loading');
  const [progress, setProgress] = useState(1);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(!state.settings.soundEnabled);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);
  const [activeMessage, setActiveMessage] = useState('Aircraft Startup & Ignition... Initializing Financial Engine');

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasFinishedRef = useRef(false);

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sync mute state with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isAudioMuted;
    }
  }, [isAudioMuted]);

  // Handle video play & synchronized audio
  const handleVideoPlay = () => {
    if (audioRef.current && !isAudioMuted) {
      audioRef.current.volume = 0.35; // Controlled, clean engine tone
      audioRef.current.currentTime = videoRef.current?.currentTime || 0;
      audioRef.current.play().catch(() => {
        setIsAutoplayBlocked(true);
      });
    }
  };

  // Video progress tracking in lockstep with the 8-second video playback
  const handleTimeUpdate = () => {
    if (!videoRef.current || hasFinishedRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 8;
    const pct = Math.min(100, Math.max(1, Math.round((cur / dur) * 100)));
    setProgress(pct);

    // Synchronize audio if drift occurs
    if (audioRef.current && !audioRef.current.paused && !isAudioMuted) {
      if (Math.abs(audioRef.current.currentTime - cur) > 0.3) {
        audioRef.current.currentTime = cur;
      }
    }

    // Dynamic flight messages across the 8-second sequence
    if (pct < 20) {
      setActiveMessage('Aircraft Startup & Engine Ignition... Initializing Financial Engine');
    } else if (pct < 40) {
      setActiveMessage('Propeller RPM Stabilized... Calibrating Risk Radar & Buffers');
    } else if (pct < 65) {
      setActiveMessage('Taxiing to Runway... Loading Macroeconomic Scenarios');
    } else if (pct < 85) {
      setActiveMessage('Full Throttle Takeoff Roll... Synchronizing Cockpit Telemetry');
    } else if (pct < 100) {
      setActiveMessage('Airborne Climb... Arming Flight Simulation Controls');
    } else {
      setActiveMessage('Flight Systems Ready. Clear for Departure.');
    }

    // Auto-complete if video reaches end of 8-second window
    if (cur >= 8 || pct >= 100) {
      finishLoader();
    }
  };

  // Transition to main app when video ends or is skipped
  const finishLoader = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setProgress(100);
    setLoaderState('ready');

    // Fade out airplane engine audio
    if (audioRef.current) {
      try {
        const fadeInterval = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.05) {
            audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.05);
          } else {
            clearInterval(fadeInterval);
            audioRef.current?.pause();
          }
        }, 40);
      } catch {}
    }

    // Play subtle resolution chime if audio enabled
    if (!isAudioMuted) {
      soundManager.playFlightStabilized();
    }

    // Brief 350ms pause at 100% before smooth reveal
    setTimeout(() => {
      setLoaderState('exiting');
      setTimeout(() => {
        setLoaderState('complete');
        try {
          sessionStorage.setItem('finquest_startup_seen', 'true');
        } catch {}
        onComplete();
      }, 450);
    }, 350);
  };

  const handleVideoEnded = () => {
    finishLoader();
  };

  // Safety fallback: if video doesn't end within 8.5 seconds (or 1.8s for reduced motion)
  useEffect(() => {
    const timeout = prefersReducedMotion ? 1800 : 8500;
    const maxTimer = setTimeout(() => {
      finishLoader();
    }, timeout);
    return () => clearTimeout(maxTimer);
  }, [prefersReducedMotion]);

  // Keyboard shortcut to skip intro immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finishLoader();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle user click to activate sound if browser blocked initial autoplay
  const handleUserScreenClick = () => {
    if (isAutoplayBlocked && audioRef.current && !isAudioMuted) {
      audioRef.current.currentTime = videoRef.current?.currentTime || 0;
      audioRef.current.play().then(() => {
        setIsAutoplayBlocked(false);
      }).catch(() => {});
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    if (!nextMuted) {
      dispatch({ type: 'TOGGLE_SOUND' });
      if (audioRef.current) {
        audioRef.current.currentTime = videoRef.current?.currentTime || 0;
        audioRef.current.volume = 0.35;
        audioRef.current.play().catch(() => {});
      }
    } else {
      dispatch({ type: 'TOGGLE_SOUND' });
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  return (
    <AnimatePresence>
      {loaderState !== 'complete' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleUserScreenClick}
          className="fixed inset-0 z-[100] w-screen h-screen flex flex-col justify-between bg-[#0A0C0F] text-[#F5F3EF] select-none overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="FinQuest Flight Startup Sequence"
        >
          {/* ── 1. Fullscreen Airplane Video Engine (8-Second Sequence) ── */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <video
              ref={videoRef}
              src="/media/flight-start.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              onLoadedData={() => setIsVideoReady(true)}
              onPlay={handleVideoPlay}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onError={() => setIsVideoReady(false)}
              className={`w-full h-full object-cover filter brightness-[0.88] contrast-[1.08] transition-opacity duration-700 ${
                isVideoReady ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Synchronized 8-Second Airplane Sound Stream */}
            <audio
              ref={audioRef}
              src="/media/flight-start.mp3"
              preload="auto"
            />

            {/* Fallback Silhouette if video is loading/buffering */}
            {!isVideoReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0C0F]">
                <div className="w-20 h-20 rounded-full bg-[#FF6A2A]/15 border border-[#FF6A2A]/40 flex items-center justify-center text-[#FF6A2A] shadow-[0_0_40px_rgba(255,106,42,0.4)] animate-pulse">
                  <Plane className="w-10 h-10 -rotate-45" />
                </div>
                <span className="label-telemetry text-xs text-[#A7ABB4] tracking-widest mt-4">
                  INITIALIZING AIRCRAFT PROPULSION
                </span>
              </div>
            )}

            {/* Cinematic Vignette & Atmospheric Contrast */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0A0C0F] via-black/20 to-[#0A0C0F]/85" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0A0C0F]/70 via-transparent to-[#0A0C0F]/70" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,#0A0C0F_95%)]" />

            {/* Subtle Horizon Line & Flight Crosshair HUD */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-10 text-[10px] font-numeric text-[#A7ABB4]/50">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-[#22C55E]">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
                  HDG 042° · RUNWAY 09R
                </span>
                <span className="label-telemetry text-[9px] text-[#A7ABB4]">
                  BARO 29.92 INHG
                </span>
              </div>

              {/* Center Artificial Horizon & Flight Pitch Reticle */}
              <div className="flex items-center justify-center">
                <div className="w-48 h-px bg-white/20 relative flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border border-[#FF6A2A]/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A2A]" />
                  </div>
                  <div className="absolute -top-3 w-px h-6 bg-white/20" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span>V1 ROTATE · TAKEOFF</span>
                <span className="text-[#FF6A2A] font-bold">ALT +50,000 FT</span>
              </div>
            </div>
          </div>

          {/* ── 2. Top Glass Header & Telemetry ────────────────────── */}
          <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6 flex items-center justify-between">
            {/* FinQuest Branding */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF6A2A] flex items-center justify-center shadow-[0_0_24px_rgba(255,106,42,0.6)] font-display font-black text-white text-base">
                FQ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-lg sm:text-2xl tracking-tight text-white drop-shadow-md">
                    FIN<span className="text-[#FF6A2A]">QUEST</span>
                  </span>
                  <span className="label-telemetry text-[9px] px-2 py-0.5 rounded-full bg-[#FF6A2A]/20 text-[#FF6A2A] border border-[#FF6A2A]/40 font-bold">
                    GD-01
                  </span>
                </div>
                <p className="label-telemetry text-[9px] text-[#A7ABB4] tracking-widest hidden sm:block">
                  FINANCIAL FLIGHT SIMULATOR
                </p>
              </div>
            </div>

            {/* Audio & Autoplay Controls */}
            <div className="flex items-center gap-3">
              {/* Autoplay prompt if browser blocked audio */}
              {isAutoplayBlocked && !isAudioMuted && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium backdrop-blur-md"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Click anywhere for vintage engine sound</span>
                </motion.div>
              )}

              {/* Sound Toggle Button */}
              <button
                onClick={toggleSound}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card border border-white/15 hover:border-[#FF6A2A]/50 text-xs text-[#A7ABB4] hover:text-white transition-all cursor-pointer backdrop-blur-md"
                title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
                aria-label={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isAudioMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-zinc-400" />
                    <span className="hidden sm:inline label-telemetry text-[10px]">SOUND OFF</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-[#22C55E]" />
                    <span className="hidden sm:inline label-telemetry text-[10px] text-[#22C55E]">AUDIO SYNCED</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── 3. Bottom Calibration & Cockpit Telemetry HUD ─────── */}
          <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-8 pb-8 sm:pb-12 space-y-5">
            {/* Cockpit Systems Online Indicator Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-numeric">
              {COCKPIT_SYSTEMS.map((sys) => {
                const isOnline = progress >= sys.triggerPct;
                return (
                  <div
                    key={sys.id}
                    className={`px-3 py-2 rounded-2xl border flex items-center gap-2 backdrop-blur-md transition-all duration-300 ${
                      isOnline
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                        : 'bg-black/40 border-white/10 text-zinc-500'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-[#22C55E] shadow-[0_0_10px_#22C55E]' : 'bg-zinc-600'
                      }`}
                    />
                    <span className="truncate text-[10px] font-bold tracking-tight">
                      {sys.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Telemetry & Status Card */}
            <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/15 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FF6A2A] animate-pulse" />
                    <span className="label-telemetry text-[10px] text-[#FF6A2A] uppercase tracking-wider">
                      {loaderState === 'ready' ? 'TAKEOFF CLEARANCE GRANTED' : 'FLIGHT PRE-DEPARTURE CALIBRATION'}
                    </span>
                  </div>
                  <h3
                    className="font-display font-bold text-sm sm:text-base text-white truncate max-w-xl"
                    aria-live="polite"
                  >
                    {loaderState === 'ready' ? 'Flight Systems Ready. Clear for Departure.' : activeMessage}
                  </h3>
                </div>

                {/* Big Flight Calibration Number */}
                <div className="text-right flex items-baseline gap-1 shrink-0 self-end sm:self-auto">
                  <span className="font-numeric font-black text-3xl sm:text-4xl text-[#FF6A2A] drop-shadow-[0_0_20px_rgba(255,106,42,0.4)]">
                    {progress < 10 ? `0${progress}` : progress}
                  </span>
                  <span className="font-numeric font-bold text-lg text-white/70">%</span>
                </div>
              </div>

              {/* Full-Width Glowing Flight Calibration Bar */}
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6A2A] via-amber-400 to-[#FF6A2A] shadow-[0_0_16px_rgba(255,106,42,0.9)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Footer info & Fast Skip Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs">
                <p className="text-[11px] text-[#A7ABB4] text-center sm:text-left">
                  Practice high-stakes financial decisions with zero real-world rupee loss.
                </p>

                <button
                  onClick={finishLoader}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/06 hover:bg-[#FF6A2A] text-white border border-white/15 hover:border-[#FF6A2A] text-xs font-bold font-numeric transition-all cursor-pointer shadow-lg group shrink-0"
                >
                  <span>ENTER COCKPIT NOW</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
