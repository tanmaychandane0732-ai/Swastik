import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Crown, ShieldCheck, Sparkles, Clock, Check, ArrowRight } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';

export const PremiumGateModal: React.FC = () => {
  const { isPaywallOpen, closePaywall, paywallReason, startCheckout, openPricingModal, demoTogglePlan, dailyUsage } = useSubscription();
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPaywallOpen) closePaywall();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPaywallOpen, closePaywall]);

  if (!isPaywallOpen) return null;

  const resetTimeStr = dailyUsage?.resetInfo?.formattedResetTime || 'Tomorrow at 12:00 AM IST';

  const benefits = [
    '25 Daily Flight Missions (8x expanded runway)',
    'Full AI Co-Pilot query allowance (50 queries/day)',
    'Deep Decision DNA & Risk Radar diagnostics',
    'Financial Turbulence & Emergency Scenarios',
    'Commander Gold Verified Certificate',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          onClick={closePaywall}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden z-10 glass-panel ${
            isLight
              ? 'bg-white/95 border-black/10 text-zinc-900'
              : 'bg-[#0E1117]/95 border-white/10 text-[#F5F3EF]'
          }`}
          role="dialog"
          aria-labelledby="paywall-title"
        >
          {/* Subtle Top Glow Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-[#FF6A2A] to-cyan-500" />

          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6A2A]/15 border border-[#FF6A2A]/30 flex items-center justify-center text-[#FF6A2A] shadow-[0_0_20px_rgba(255,106,42,0.25)] flex-shrink-0">
                  <Plane className="w-6 h-6 transform -rotate-45" />
                </div>
                <div>
                  <span className="label-telemetry text-[#FF6A2A] text-[10px] tracking-widest font-black uppercase">
                    FLIGHT DECK NOTICE
                  </span>
                  <h3 id="paywall-title" className="font-display font-black text-xl sm:text-2xl tracking-tight leading-tight mt-0.5">
                    Daily Allowance Complete
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  soundManager.playClick();
                  closePaywall();
                }}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? 'border-black/10 hover:bg-black/05 text-zinc-500'
                    : 'border-white/10 hover:bg-white/06 text-zinc-400 hover:text-white'
                }`}
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Explanation */}
            <p className={`mt-4 text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
              {paywallReason || "You've completed today's allotted training flights. To practice safe, realistic financial decision-making without burnout, free cadet flights reset daily."}
            </p>

            {/* Reset Time Box */}
            <div
              className={`mt-4 p-3.5 rounded-2xl border flex items-center gap-3 ${
                isLight ? 'bg-black/03 border-black/08' : 'bg-white/04 border-white/08'
              }`}
            >
              <Clock className="w-4 h-4 text-[#FF6A2A] flex-shrink-0" />
              <div className="text-xs">
                <span className="text-[10px] uppercase font-mono tracking-wider opacity-70 block">
                  FLIGHT WINDOW SCHEDULE
                </span>
                <span className="font-semibold text-sm">Next flight unlocks {resetTimeStr}</span>
              </div>
            </div>

            {/* Premium Benefits Card */}
            <div
              className={`mt-5 p-5 rounded-2xl border relative overflow-hidden ${
                isLight
                  ? 'bg-gradient-to-br from-amber-500/08 to-[#FF6A2A]/05 border-[#FF6A2A]/25'
                  : 'bg-gradient-to-br from-[#FF6A2A]/12 to-transparent border-[#FF6A2A]/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-[#FF6A2A]" />
                <span className="font-display font-black text-xs tracking-wider text-[#FF6A2A] uppercase">
                  FLIGHT COMMANDER PRIVILEGES
                </span>
              </div>

              <ul className="space-y-2 text-xs">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#FF6A2A]/20 flex items-center justify-center flex-shrink-0 text-[#FF6A2A]">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className={isLight ? 'text-zinc-700' : 'text-zinc-200'}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={async () => {
                  await startCheckout('PREMIUM');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF6A2A] to-[#FF854D] hover:from-[#FF5510] hover:to-[#FF6A2A] text-white font-display font-black text-sm tracking-wide shadow-[0_0_24px_rgba(255,106,42,0.40)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Flight Commander — ₹499/mo</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => {
                    closePaywall();
                    openPricingModal();
                  }}
                  className={`text-xs font-medium underline underline-offset-4 cursor-pointer transition-colors ${
                    isLight ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  View Plan Comparisons & Details
                </button>

                <button
                  onClick={closePaywall}
                  className={`text-xs opacity-75 hover:opacity-100 cursor-pointer ${
                    isLight ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  Maybe Later
                </button>
              </div>

              {/* Hackathon Judge Demo Shortcut */}
              <div className="mt-3 pt-3 border-t border-dashed border-white/10 text-center">
                <button
                  onClick={async () => {
                    await demoTogglePlan('PREMIUM');
                    closePaywall();
                  }}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>[Judge Demo Mode: Instant Commander Unlock]</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
