import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown, Plane, Sparkles, Shield, HelpCircle, ArrowRight, RefreshCcw } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';

export const PricingModal: React.FC = () => {
  const { isPricingModalOpen, closePricingModal, isPremium, startCheckout, cancelSubscription, subscription, demoTogglePlan } = useSubscription();
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPricingModalOpen) closePricingModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPricingModalOpen, closePricingModal]);

  if (!isPricingModalOpen) return null;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      await startCheckout('PREMIUM');
    } finally {
      setIsProcessing(false);
    }
  };

  const freeFeatures = [
    '3 Daily Flight Simulation Missions',
    '5 AI Co-Pilot Guidance Queries / Day',
    'Budgeting Altitude (50/30/20) Simulator',
    'Debt Trap Navigation & Compound Interest Game',
    'Basic Scam Radar Detective Module',
    'Standard Pilot Graduation Certificate',
  ];

  const premiumFeatures = [
    '25 Daily Flight Simulation Missions (Expanded Runway)',
    '50 AI Co-Pilot Deep Consultations / Day',
    'Advanced Financial Turbulence & Crisis Scenarios',
    'Deep Decision DNA Behavioral Diagnostics',
    'Executive Aeronautical Flight Reports & PDF Exports',
    'Classroom Cohort Analytics & Assignments',
    'Flight Commander Gold Holographic Certificate',
    'Priority Flight Deck Execution & Zero Cooldowns',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          onClick={closePricingModal}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden z-10 my-8 glass-panel ${
            isLight
              ? 'bg-white/95 border-black/10 text-zinc-900'
              : 'bg-[#0E1117]/95 border-white/10 text-[#F5F3EF]'
          }`}
          role="dialog"
          aria-labelledby="pricing-title"
        >
          {/* Header Banner */}
          <div className="p-6 sm:p-8 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="label-telemetry text-[#FF6A2A] text-[10px] tracking-widest font-black uppercase">
                  AERONAUTICAL MEMBERSHIP TIERS
                </span>
              </div>
              <h2 id="pricing-title" className="font-display font-black text-2xl sm:text-3xl tracking-tight">
                Fly Further. Learn Deeper.
              </h2>
              <p className={`text-sm mt-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Practice complex financial dilemmas with expanded flight simulations and personalized AI coaching.
              </p>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                closePricingModal();
              }}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? 'border-black/10 hover:bg-black/05 text-zinc-500'
                  : 'border-white/10 hover:bg-white/06 text-zinc-400 hover:text-white'
              }`}
              aria-label="Close pricing modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pricing Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                isLight
                  ? 'bg-black/02 border-black/08 hover:border-black/15'
                  : 'bg-white/03 border-white/08 hover:border-white/15'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="label-telemetry text-zinc-400 text-xs font-bold uppercase">FOUNDATION</span>
                  {!isPremium && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6A2A]/15 text-[#FF6A2A] border border-[#FF6A2A]/30">
                      CURRENT TIER
                    </span>
                  )}
                </div>

                <h3 className="font-display font-black text-xl mt-2">Cadet Pilot</h3>
                <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Essential flight simulations and daily scenarios for beginners.
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display font-black text-3xl">₹0</span>
                  <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>/ lifetime free</span>
                </div>

                <div className="mt-6 space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    INCLUDED IN CADET:
                  </span>
                  {freeFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-xs">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/06">
                {!isPremium ? (
                  <div className={`w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold ${
                    isLight ? 'bg-black/05 text-zinc-600' : 'bg-white/06 text-zinc-300'
                  }`}>
                    Currently Active
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      if (window.confirm('Downgrade to Cadet Free tier? Your premium benefits will end.')) {
                        await demoTogglePlan('FREE');
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Switch to Free Cadet
                  </button>
                )}
              </div>
            </div>

            {/* Premium Plan */}
            <div
              className={`p-6 rounded-2xl border relative flex flex-col justify-between transition-all duration-300 shadow-xl ${
                isLight
                  ? 'bg-gradient-to-br from-amber-500/08 via-white to-[#FF6A2A]/06 border-[#FF6A2A]/40'
                  : 'bg-gradient-to-br from-[#FF6A2A]/15 via-[#0E1117] to-cyan-500/08 border-[#FF6A2A]/50 shadow-[0_0_30px_rgba(255,106,42,0.20)]'
              }`}
            >
              {/* Highlight Tag */}
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-[#FF6A2A] text-white text-[10px] font-display font-black uppercase tracking-wider shadow-md">
                RECOMMENDED
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#FF6A2A]">
                    <Crown className="w-4 h-4 fill-current" />
                    <span className="label-telemetry text-xs font-bold uppercase">PRO AVIATOR</span>
                  </div>
                  {isPremium && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ACTIVE MEMBERSHIP
                    </span>
                  )}
                </div>

                <h3 className="font-display font-black text-xl mt-2 flex items-center gap-2">
                  <span>Flight Commander</span>
                </h3>
                <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Unrestricted altitude, advanced financial turbulence, and AI coaching.
                </p>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-display font-black text-4xl text-[#FF6A2A]">₹499</span>
                  <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>/ month</span>
                  <span className="text-[10px] text-emerald-500 font-mono ml-1 font-bold">Auto-Renews</span>
                </div>

                <div className="mt-6 space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF6A2A] font-bold block">
                    EVERYTHING IN CADET, PLUS:
                  </span>
                  {premiumFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-xs">
                      <Sparkles className="w-4 h-4 text-[#FF6A2A] flex-shrink-0 mt-0.5" />
                      <span className={`font-medium ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/08">
                {isPremium ? (
                  <div className="space-y-2">
                    <div className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold bg-[#FF6A2A]/20 text-[#FF6A2A] border border-[#FF6A2A]/40 flex items-center justify-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      <span>Commander Membership Active</span>
                    </div>
                    {subscription?.cancelAtPeriodEnd ? (
                      <p className="text-[11px] text-amber-400 text-center">
                        Auto-renewal cancelled. Access ends {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'soon'}.
                      </p>
                    ) : (
                      <button
                        onClick={async () => {
                          if (window.confirm('Cancel auto-renewal? You will retain access until the current cycle expires.')) {
                            await cancelSubscription();
                          }
                        }}
                        className="w-full text-center text-[11px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Cancel Auto-Renewal
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    disabled={isProcessing}
                    onClick={handleUpgrade}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF6A2A] to-[#FF854D] hover:from-[#FF5510] hover:to-[#FF6A2A] text-white font-display font-black text-sm tracking-wide shadow-[0_0_24px_rgba(255,106,42,0.40)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Crown className="w-4 h-4" />
                        <span>Upgrade to Flight Commander — ₹499</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer & Demo Mode Shortcut */}
          <div className={`px-6 sm:px-8 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isLight ? 'border-black/08 text-zinc-500 bg-black/02' : 'border-white/06 text-zinc-400 bg-white/02'
          }`}>
            <div className="flex items-center gap-2 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-[#FF6A2A]" />
              <span>Encrypted via Razorpay Subscriptions · Cancel anytime without penalty.</span>
            </div>

            <button
              onClick={async () => {
                await demoTogglePlan(isPremium ? 'FREE' : 'PREMIUM');
              }}
              className="font-mono text-cyan-400 hover:text-cyan-300 transition-colors text-[11px] cursor-pointer"
            >
              [Judge Demo: Toggle {isPremium ? 'Free' : 'Premium'}]
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
