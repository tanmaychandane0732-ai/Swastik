import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Search, Info, TrendingUp, Sparkles, Flag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../contexts/GameContext';
import { SCAM_TARGETS, COMMON_RED_FLAGS } from '../../data/scamScenarios';
import { INVESTMENT_OPTIONS } from '../../data/investmentData';
import { calculateScamScore } from '../../utils/financialMath';
import { soundManager } from '../../services/audioService';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';

export const Level3ScamRadar: React.FC = () => {
  const { dispatch, showFeedback } = useGame();

  // Mode: First do Investment Allocation, then activate tactical Scam Radar!
  const [phase, setPhase] = useState<'investment' | 'radar'>('investment');

  // Investment allocations
  const [indexFundAlloc, setIndexFundAlloc] = useState(25000);
  const [liquidFundAlloc, setLiquidFundAlloc] = useState(15000);
  const [cryptoAlloc, setCryptoAlloc] = useState(0);
  const [ponziAlloc, setPonziAlloc] = useState(0);

  // Scam Radar state
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [scamAnalysisHistory, setScamAnalysisHistory] = useState<{ id: string; correct: boolean }[]>([]);

  const target = SCAM_TARGETS[currentTargetIndex];
  const isLastTarget = currentTargetIndex === SCAM_TARGETS.length - 1;

  // Investment submission handler
  const handleConfirmInvestments = () => {
    const totalInvested = indexFundAlloc + liquidFundAlloc + cryptoAlloc + ponziAlloc;
    const isDisciplined = indexFundAlloc >= 15000 && liquidFundAlloc >= 10000 && ponziAlloc === 0;

    let scoreDelta = 500;
    let netWorthDelta = 0;
    let healthDelta = 0;

    if (isDisciplined) {
      scoreDelta = 950;
      netWorthDelta = Math.round(indexFundAlloc * 0.12 + liquidFundAlloc * 0.06);
      healthDelta = +14;
    } else if (ponziAlloc > 0) {
      scoreDelta = 100;
      netWorthDelta = -ponziAlloc; // Ponzi money lost completely!
      healthDelta = -18;
    }

    dispatch({
      type: 'SUBMIT_INVESTMENTS',
      payload: {
        choices: [
          { ...INVESTMENT_OPTIONS[0], allocationAmount: indexFundAlloc },
          { ...INVESTMENT_OPTIONS[1], allocationAmount: liquidFundAlloc },
          { ...INVESTMENT_OPTIONS[2], allocationAmount: cryptoAlloc },
          { ...INVESTMENT_OPTIONS[3], allocationAmount: ponziAlloc },
        ],
        score: scoreDelta,
        netWorthChange: netWorthDelta,
        healthChange: healthDelta,
      },
    });

    showFeedback({
      title: isDisciplined ? 'Disciplined Wealth Architecture' : 'High-Risk Speculative Exposure',
      verdict: isDisciplined ? 'success' : ponziAlloc > 0 ? 'danger' : 'warning',
      headline: isDisciplined
        ? 'Diversification Success: You combined 12% compounding equity index growth with safe liquid reserves.'
        : 'Speculation Trap: Chasing guaranteed 30% monthly schemes leads to 100% loss of capital.',
      financialImpact: {
        netWorthDelta,
        healthDelta,
        scoreDelta,
      },
      whyItHappened: 'Broad market index funds hold stakes in profitable businesses, compounding with the national economy. Guaranteed high-return schemes have no genuine business model.',
      whatYouShouldLearn: 'Never allocate emergency funds to volatile assets. Keep boring index funds as your core compounding engine.',
      didYouKnow: 'Over any 10-year rolling period in modern market history, broad index funds have never delivered negative returns.',
      onContinue: () => {
        soundManager.playRadarPing();
        setPhase('radar');
      },
    });
  };

  // Flag toggle in Scam Radar
  const handleToggleFlag = (flagId: string) => {
    soundManager.playClick();
    setSelectedFlags(prev =>
      prev.includes(flagId) ? prev.filter(id => id !== flagId) : [...prev, flagId]
    );
  };

  // Radar Verdict: Mark as Scam or Legit
  const handleRadarVerdict = (playerMarkedScam: boolean) => {
    soundManager.playRadarPing();
    const evaluation = calculateScamScore(target, selectedFlags, playerMarkedScam);

    if (evaluation.isCorrect) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    dispatch({
      type: 'RECORD_SCAM_VERDICT',
      payload: {
        targetId: target.id,
        isCorrect: evaluation.isCorrect,
        detectedFlags: selectedFlags,
        scoreChange: evaluation.score,
        healthChange: evaluation.healthDelta,
        netWorthChange: evaluation.netWorthDelta,
      },
    });

    setScamAnalysisHistory(prev => [...prev, { id: target.id, correct: evaluation.isCorrect }]);

    showFeedback({
      title: evaluation.isCorrect ? 'Threat Intercepted by Radar' : 'Scam Radar Assessment Failed',
      verdict: evaluation.isCorrect ? 'success' : 'danger',
      headline: evaluation.explanation,
      financialImpact: {
        netWorthDelta: evaluation.netWorthDelta,
        healthDelta: evaluation.healthDelta,
        scoreDelta: evaluation.score,
      },
      whyItHappened: target.explanation,
      whatYouShouldLearn: target.whyDangerous,
      didYouKnow: target.tip,
      onContinue: () => {
        if (!isLastTarget) {
          setCurrentTargetIndex(prev => prev + 1);
          setSelectedFlags([]);
          soundManager.playRadarPing();
        } else {
          // Completed Level 3!
          dispatch({
            type: 'COMPLETE_LEVEL',
            payload: {
              levelNumber: 3,
              levelScore: 1000,
            },
          });
          dispatch({ type: 'SET_STAGE', payload: 'results' });
        }
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card rounded-2xl p-5 border border-[#27272A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
              Level 3 Arena
            </span>
            <span className="text-xs font-bold text-zinc-400">
              {phase === 'investment' ? 'Diversification & Index Allocation' : 'Tactical Scam Detection Radar'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Investment Strategy & Scam Radar
          </h1>
        </div>

        {/* Phase Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#18181D] border border-[#27272A] text-xs">
          <button
            onClick={() => setPhase('investment')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${
              phase === 'investment'
                ? 'bg-[#FF5E1E] text-white shadow-brand-orange'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1. Asset Allocation
          </button>
          <button
            onClick={() => {
              soundManager.playRadarPing();
              setPhase('radar');
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors font-bold flex items-center gap-1.5 ${
              phase === 'radar'
                ? 'bg-[#FF5E1E] text-white shadow-brand-orange'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>2. Scam Radar</span>
          </button>
        </div>
      </div>

      {/* PHASE 1: INVESTMENT STRATEGY */}
      {phase === 'investment' && (
        <div className="space-y-6">
          <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF5E1E]" />
                Allocate Your Investment Portfolio (Total: ₹40,000)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Choose where your hard-earned savings go. Balance risk and expected return.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Index Fund */}
              <div className="p-4 rounded-2xl bg-[#18181D] border border-[#FF5E1E]/40 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40">
                      Recommended
                    </span>
                    <h3 className="text-sm font-black text-white mt-1">
                      Broad Market Index ETF (Nifty 50)
                    </h3>
                  </div>
                  <span className="text-xs font-black text-[#22C55E] font-numeric">
                    ~12% CAGR
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Diversified across 50 premier companies with tiny 0.08% management fees.
                </p>
                <div className="flex items-center justify-between text-xs font-numeric pt-1">
                  <span className="text-zinc-400">Allocated:</span>
                  <span className="text-white font-black">{formatCurrency(indexFundAlloc)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40000}
                  step={2500}
                  value={indexFundAlloc}
                  onChange={(e) => setIndexFundAlloc(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded appearance-none cursor-pointer accent-[#FF5E1E]"
                />
              </div>

              {/* Option 2: Liquid Fund */}
              <div className="p-4 rounded-2xl bg-[#18181D] border border-cyan-500/40 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Emergency Cushion
                    </span>
                    <h3 className="text-sm font-black text-white mt-1">
                      Liquid / Overnight Sovereign Debt
                    </h3>
                  </div>
                  <span className="text-xs font-black text-cyan-400 font-numeric">
                    ~6.5% APY
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  High liquidity capital preservation in government treasury bills.
                </p>
                <div className="flex items-center justify-between text-xs font-numeric pt-1">
                  <span className="text-zinc-400">Allocated:</span>
                  <span className="text-white font-black">{formatCurrency(liquidFundAlloc)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40000}
                  step={2500}
                  value={liquidFundAlloc}
                  onChange={(e) => setLiquidFundAlloc(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Option 3: Hype Crypto */}
              <div className="p-4 rounded-2xl bg-[#18181D] border border-amber-500/30 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Extreme Volatility
                    </span>
                    <h3 className="text-sm font-black text-white mt-1">
                      Telegram Meme Coin / 100x Leverage
                    </h3>
                  </div>
                  <span className="text-xs font-black text-amber-400 font-numeric">
                    -40% Expected
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Unregulated speculative token promoted on social media without product utility.
                </p>
                <div className="flex items-center justify-between text-xs font-numeric pt-1">
                  <span className="text-zinc-400">Allocated:</span>
                  <span className="text-white font-black">{formatCurrency(cryptoAlloc)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20000}
                  step={2500}
                  value={cryptoAlloc}
                  onChange={(e) => setCryptoAlloc(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Option 4: Ponzi Arbitrage */}
              <div className="p-4 rounded-2xl bg-[#18181D] border border-red-500/30 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                      Fraud Warning
                    </span>
                    <h3 className="text-sm font-black text-white mt-1">
                      "Guaranteed 30% Monthly" Club
                    </h3>
                  </div>
                  <span className="text-xs font-black text-red-400 font-numeric">
                    -100% (Ponzi)
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Secret automated trading algorithm promising impossible returns.
                </p>
                <div className="flex items-center justify-between text-xs font-numeric pt-1">
                  <span className="text-zinc-400">Allocated:</span>
                  <span className="text-white font-black">{formatCurrency(ponziAlloc)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20000}
                  step={2500}
                  value={ponziAlloc}
                  onChange={(e) => setPonziAlloc(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded appearance-none cursor-pointer accent-red-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="orange"
                size="lg"
                className="w-full sm:w-auto"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={handleConfirmInvestments}
              >
                Confirm Portfolio & Activate Scam Radar
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* PHASE 2: TACTICAL SCAM RADAR */}
      {phase === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Scanning Visualizer (Left Column) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center glass-card rounded-3xl p-6 border border-[#27272A] text-center relative overflow-hidden">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center mb-4">
              {/* Concentric Sonar Rings in Signature Orange */}
              <div className="absolute inset-0 rounded-full border border-[#FF5E1E]/20" />
              <div className="absolute inset-8 rounded-full border border-[#FF5E1E]/30" />
              <div className="absolute inset-16 rounded-full border border-[#FF5E1E]/40" />
              <div className="absolute inset-24 rounded-full border border-[#FF5E1E]/50" />

              {/* Crosshair lines */}
              <div className="absolute w-full h-[1px] bg-[#FF5E1E]/25" />
              <div className="absolute h-full w-[1px] bg-[#FF5E1E]/25" />

              {/* Sweeping Radar Beam */}
              <div className="absolute inset-0 rounded-full origin-center animate-radar-sweep pointer-events-none">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#FF5E1E]/40 via-amber-400/20 to-transparent rounded-tl-full origin-bottom-right" />
              </div>

              {/* Center blip */}
              <div className="w-4 h-4 rounded-full bg-[#FF5E1E] shadow-brand-orange animate-pulse z-10" />

              {/* Target coordinate blip */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute top-12 right-12 w-5 h-5 rounded-full bg-red-500 shadow-lg flex items-center justify-center text-[10px] font-black text-white font-numeric"
              >
                !
              </motion.div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#FF5E1E] flex items-center justify-center gap-1.5">
                <Radar className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                RADAR ONLINE • SCANNING FREQUENCY
              </span>
              <p className="text-xs text-zinc-400">
                Target {currentTargetIndex + 1} of {SCAM_TARGETS.length}: Intercepting digital message
              </p>
            </div>
          </div>

          {/* Target Offer & Red Flag Inspector (Right Column) */}
          <div className="lg:col-span-7 glass-card rounded-3xl p-5 sm:p-7 border border-[#27272A] space-y-5">
            {/* Sender Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#18181D] text-[#FF5E1E] border border-[#27272A]">
                  {target.platform} Intercept
                </span>
                <span className="text-xs font-bold text-zinc-200">
                  {target.senderName}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-numeric">
                {target.timestamp}
              </span>
            </div>

            {/* Intercepted Message Bubble */}
            <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans shadow-inner">
              <p className="whitespace-pre-line">{target.messageText}</p>
            </div>

            {/* Red Flag Tagging Matrix */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-[#FF5E1E]" />
                  Tag Suspicious Red Flags (Click to Toggle):
                </span>
                <span className="text-[11px] text-zinc-400 font-numeric">
                  {selectedFlags.length} Selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {target.availableFlags.map((flag) => {
                  const isSelected = selectedFlags.includes(flag.id);

                  return (
                    <button
                      key={flag.id}
                      onClick={() => handleToggleFlag(flag.id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                        isSelected
                          ? 'bg-[#FF5E1E]/20 border-[#FF5E1E] text-[#FF5E1E] shadow-sm'
                          : 'bg-[#18181D] hover:bg-[#222328] border-[#27272A] text-zinc-300'
                      }`}
                    >
                      {flag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Radar Verdict CTAs */}
            <div className="pt-4 border-t border-[#27272A] space-y-2">
              <span className="text-xs font-black text-zinc-400 uppercase tracking-wider block">
                Radar Final Verdict:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="danger"
                  size="md"
                  icon={<XCircle className="w-4 h-4" />}
                  onClick={() => handleRadarVerdict(true)}
                >
                  FLAG AS FRAUDULENT SCAM
                </Button>

                <Button
                  variant="emerald"
                  size="md"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleRadarVerdict(false)}
                >
                  VERIFY AS LEGITIMATE
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
