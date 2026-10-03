import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Crown, AlertTriangle, ArrowRight, RotateCcw, Clock, Sparkles, ShieldAlert } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';
import { Button } from '../ui/Button';

interface GameStageGuardProps {
  gameType: string;
  gameTitle?: string;
  children: React.ReactNode;
}

export const GameStageGuard: React.FC<GameStageGuardProps> = ({
  gameType,
  gameTitle = 'Flight Mission',
  children,
}) => {
  const { isPremium, dailyUsage, recordGameStart, openPricingModal, demoTogglePlan } = useSubscription();
  const { state, dispatch } = useGame();
  const isLight = state.settings.theme === 'light';

  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;

    const checkAuthorization = async () => {
      try {
        const allowed = await recordGameStart(gameType);
        if (isCancelled) return;

        if (allowed) {
          setStatus('allowed');
        } else {
          setStatus('denied');
          setErrorMessage(
            "Today's daily flight allowance has been reached. Upgrade to Flight Commander for expanded daily missions or return tomorrow at 12:00 AM IST."
          );
        }
      } catch {
        if (!isCancelled) {
          setStatus('allowed'); // Fail-open gracefully on network error during local development
        }
      }
    };

    checkAuthorization();

    return () => {
      isCancelled = true;
    };
  }, [gameType]);

  // If user upgraded via demo toggle or checkout while on this screen, re-evaluate
  useEffect(() => {
    if (isPremium && status === 'denied') {
      setStatus('allowed');
    }
  }, [isPremium, status]);

  if (status === 'checking') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-[#FF6A2A]/10 border border-[#FF6A2A]/30 flex items-center justify-center mb-4">
          <Plane className="w-6 h-6 text-[#FF6A2A] animate-pulse" />
        </div>
        <p className="font-display font-bold text-sm tracking-wide">
          AUTHORIZING FLIGHT CLEARANCE...
        </p>
        <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Connecting to Flight Operations Telemetry
        </p>
      </div>
    );
  }

  if (status === 'denied') {
    const gamesUsed = dailyUsage?.gamesUsed ?? 3;
    const gamesLimit = dailyUsage?.gamesLimit ?? 3;
    const resetTime = dailyUsage?.resetInfo?.formattedResetTime ?? '12:00 AM IST';

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={`w-full max-w-xl p-6 sm:p-8 rounded-3xl border shadow-2xl glass-elevated text-center relative overflow-hidden ${
            isLight
              ? 'bg-white/90 border-black/10 text-zinc-900 shadow-zinc-200'
              : 'bg-[#0E1117]/90 border-white/10 text-[#F5F3EF] shadow-black/80'
          }`}
        >
          {/* Top Decorative Amber/Red Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-[#FF6A2A]" />

          {/* Icon Badge */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mb-5 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.25)]">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <span className="label-telemetry text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-block mb-3">
            RUNWAY CLEARANCE LIMIT REACHED
          </span>

          <h2 className="font-display font-black text-xl sm:text-2xl tracking-tight mb-2">
            Daily Cadet Flight Allowance Exhausted
          </h2>

          <p className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-6 ${
            isLight ? 'text-zinc-600' : 'text-zinc-300'
          }`}>
            You have completed all <strong className="text-[#FF6A2A] font-numeric">{gamesUsed}/{gamesLimit}</strong> free flight missions for today. Your flight telemetry counter will automatically recalibrate tomorrow.
          </p>

          {/* Reset Notice Box */}
          <div className={`p-3.5 rounded-2xl border mb-6 flex items-center justify-between text-xs ${
            isLight
              ? 'bg-black/03 border-black/08 text-zinc-700'
              : 'bg-white/04 border-white/08 text-zinc-300'
          }`}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF6A2A]" />
              <span>Next Runway Reset:</span>
            </div>
            <span className="font-numeric font-bold text-[#FF6A2A]">
              Tomorrow at {resetTime}
            </span>
          </div>

          {/* Perks Preview */}
          <div className={`p-4 rounded-2xl border text-left mb-6 ${
            isLight
              ? 'bg-amber-500/06 border-amber-500/20'
              : 'bg-amber-500/08 border-amber-500/25'
          }`}>
            <div className="flex items-center gap-2 font-bold text-xs text-amber-400 mb-2">
              <Crown className="w-4 h-4 fill-current" />
              <span>FLIGHT COMMANDER PERKS</span>
            </div>
            <ul className="text-xs space-y-1.5 text-zinc-300">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>25 daily flight missions (8x expanded runway)</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>50 AI Co-Pilot consultations & deep diagnostics</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>Gold holographic pilot certificate</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="orange"
              size="lg"
              className="w-full sm:w-auto text-xs font-black shadow-brand-orange"
              icon={<Crown className="w-4 h-4 text-white fill-current" />}
              onClick={() => {
                soundManager.playClick();
                openPricingModal();
              }}
            >
              Upgrade to Commander · ₹499/mo
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-xs font-bold"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={() => {
                soundManager.playClick();
                dispatch({ type: 'SET_STAGE', payload: 'dashboard' });
              }}
            >
              Return to Flight Deck Hub
            </Button>
          </div>

          {/* Judge Evaluation Shortcut */}
          <div className="mt-5 pt-4 border-t border-white/08 flex items-center justify-between text-[11px]">
            <span className="label-telemetry text-[9px] text-[#A7ABB4]">HACKATHON EVALUATION MODE</span>
            <button
              type="button"
              onClick={async () => {
                soundManager.playClick();
                await demoTogglePlan('PREMIUM');
                setStatus('allowed');
              }}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              1-Click Judge Demo Unlock (Commander)
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Authorized to fly
  return <>{children}</>;
};
