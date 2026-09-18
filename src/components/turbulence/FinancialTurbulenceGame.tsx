import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wind,
  Plane,
  ArrowRight,
  RotateCcw,
  Award,
  Zap,
  ChevronLeft,
  Info,
  Activity,
  Gauge,
  Laptop,
  HeartPulse,
  TrendingDown,
  Wrench,
  Home,
  Briefcase,
  TrendingUp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TURBULENCE_EVENTS } from '../../data/turbulenceData';
import {
  TurbulenceEvent,
  TurbulenceChoice,
  TurbulenceFlightMetrics,
  TurbulenceDebrief,
} from '../../types/turbulence';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { TeamLogo } from '../common/TeamLogo';

interface FinancialTurbulenceGameProps {
  onBackToHub: () => void;
}

export const FinancialTurbulenceGame: React.FC<FinancialTurbulenceGameProps> = ({ onBackToHub }) => {
  const { state, dispatch } = useGame();
  const events = TURBULENCE_EVENTS;

  // Phase: 'intro' | 'warning' | 'event' | 'consequence' | 'debrief'
  const [phase, setPhase] = useState<'intro' | 'warning' | 'event' | 'consequence' | 'debrief'>('intro');
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  // Flight telemetry metrics
  const [metrics, setMetrics] = useState<TurbulenceFlightMetrics>({
    altitudeNetWorth: state.netWorth > 0 ? state.netWorth : 50000,
    fuelCash: 45000,
    debtDrag: 0,
    monthlyEmi: 0,
    resilienceScore: 80,
  });

  // Track active chain effects from previous decisions
  const [activeChainEffects, setActiveChainEffects] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<TurbulenceChoice | null>(null);

  // Debrief tracking
  const [choicesHistory, setChoicesHistory] = useState<{
    event: TurbulenceEvent;
    choice: TurbulenceChoice;
  }[]>([]);

  const currentEvent: TurbulenceEvent = events[currentEventIndex] || events[0];

  // Helper to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hardware':
        return <Laptop className="w-5 h-5 text-amber-400" />;
      case 'medical':
        return <HeartPulse className="w-5 h-5 text-red-400" />;
      case 'income':
        return <Briefcase className="w-5 h-5 text-orange-400" />;
      case 'housing':
        return <Home className="w-5 h-5 text-blue-400" />;
      case 'transit':
        return <Wrench className="w-5 h-5 text-yellow-400" />;
      case 'market':
        return <TrendingDown className="w-5 h-5 text-purple-400" />;
      default:
        return <Wind className="w-5 h-5 text-[#FF5E1E]" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'severe':
        return {
          label: 'Severe Turbulence',
          color: 'bg-red-500/20 text-red-400 border-red-500/40',
        };
      case 'moderate':
        return {
          label: 'Moderate Gusts',
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        };
      case 'calm':
      default:
        return {
          label: 'Light Crosswind',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        };
    }
  };

  // Start flight simulation
  const handleStartFlight = () => {
    soundManager.playClick();
    triggerEventWarning(0);
  };

  const triggerEventWarning = (nextIndex: number) => {
    setCurrentEventIndex(nextIndex);
    setSelectedChoice(null);
    setPhase('warning');
    soundManager.playTurbulence();

    // After 1.4s of warning alarm, enter the event decision phase
    setTimeout(() => {
      setPhase('event');
    }, 1400);
  };

  // Handle player choice selection
  const handleSelectChoice = (choice: TurbulenceChoice) => {
    soundManager.playClick();
    setSelectedChoice(choice);

    // Calculate next metrics
    const nextFuelCash = Math.max(0, metrics.fuelCash + choice.cashDelta);
    const nextDebt = metrics.debtDrag + choice.debtDelta;
    const nextMonthlyEmi = metrics.monthlyEmi + choice.monthlyEmiDelta;
    const nextAltitude = metrics.altitudeNetWorth + choice.cashDelta - choice.debtDelta;
    const nextResilience = Math.max(0, Math.min(100, metrics.resilienceScore + choice.resilienceDelta));

    setMetrics({
      altitudeNetWorth: nextAltitude,
      fuelCash: nextFuelCash,
      debtDrag: nextDebt,
      monthlyEmi: nextMonthlyEmi,
      resilienceScore: nextResilience,
    });

    if (choice.chainEffectKey && !activeChainEffects.includes(choice.chainEffectKey)) {
      setActiveChainEffects((prev) => [...prev, choice.chainEffectKey!]);
    }

    setChoicesHistory((prev) => [...prev, { event: currentEvent, choice }]);

    // Update global context
    dispatch({
      type: 'RECORD_DEBT_DECISION',
      payload: {
        scenarioId: currentEvent.id,
        choiceId: choice.id,
        title: `Turbulence: ${currentEvent.title}`,
        isOptimal: choice.id === currentEvent.whatIfAlternativeId,
        debtImpact: choice.debtDelta,
        netWorthImpact: choice.cashDelta,
        healthImpact: choice.resilienceDelta > 0 ? 5 : -10,
        scoreImpact: choice.resilienceDelta > 0 ? 100 : 25,
        explanation: choice.shortTermFeedback,
        whyExplanation: currentEvent.educationalLesson,
      },
    });

    if (choice.resilienceDelta >= 0) {
      soundManager.playSuccess();
    } else {
      soundManager.playWarning();
    }

    setPhase('consequence');
  };

  // Proceed to next event or final debrief
  const handleNextEvent = () => {
    soundManager.playClick();
    if (currentEventIndex < events.length - 1) {
      triggerEventWarning(currentEventIndex + 1);
    } else {
      // Complete flight & show debrief
      setPhase('debrief');
      dispatch({ type: 'UNLOCK_BADGE', payload: 'badge_turbulence_survivor' });

      if (metrics.resilienceScore >= 75 && metrics.debtDrag === 0) {
        dispatch({ type: 'UNLOCK_BADGE', payload: 'badge_calm_pilot' });
        dispatch({ type: 'UNLOCK_BADGE', payload: 'badge_decision_master' });
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  // Restart turbulence simulation
  const handleRestart = () => {
    soundManager.playClick();
    setMetrics({
      altitudeNetWorth: state.netWorth > 0 ? state.netWorth : 50000,
      fuelCash: 45000,
      debtDrag: 0,
      monthlyEmi: 0,
      resilienceScore: 80,
    });
    setActiveChainEffects([]);
    setChoicesHistory([]);
    setCurrentEventIndex(0);
    setSelectedChoice(null);
    setPhase('intro');
  };

  const calculateDebrief = (): TurbulenceDebrief => {
    const netWorthChange = metrics.altitudeNetWorth - (state.netWorth > 0 ? state.netWorth : 50000);
    let status: TurbulenceDebrief['status'] = 'Smooth Recovery';

    if (metrics.resilienceScore < 40 || metrics.fuelCash <= 5000) {
      status = 'Critical Flight Stall';
    } else if (metrics.resilienceScore < 70 || metrics.debtDrag > 20000) {
      status = 'Turbulent Holding Pattern';
    }

    return {
      eventsSurvived: choicesHistory.length,
      totalEvents: events.length,
      finalResilienceScore: metrics.resilienceScore,
      netWorthChange,
      debtAccumulated: metrics.debtDrag,
      status,
      keyTakeaways: [
        'A dedicated 3 to 6-month liquid emergency fund acts as an aerodynamic stabilizer, preventing sudden lifestyle stalls.',
        'High-interest consumer credit cards and EMIs convert temporary life hiccups into multi-year compounding cashflow drag.',
        'During equity market downturns, maintaining regular SIPs leverages dollar-cost averaging rather than locking in paper panic losses.',
      ],
    };
  };

  const debrief = calculateDebrief();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Flight Control Bar */}
      <div className="flex items-center justify-between gap-4 glass-card rounded-2xl p-4 border border-[#27272A]">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronLeft className="w-4 h-4" />}
            onClick={onBackToHub}
          >
            Training Deck
          </Button>

          <div className="h-6 w-px bg-[#27272A] hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E1E] animate-pulse" />
            <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>🌪️ Financial Turbulence</span>
              <span className="hidden md:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
                Cockpit Shock Sim
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TeamLogo size="sm" showText={false} />
          {phase !== 'intro' && phase !== 'debrief' && (
            <span className="text-xs font-black font-numeric text-zinc-300 bg-[#18181D] px-3 py-1.5 rounded-xl border border-[#27272A]">
              Shock {currentEventIndex + 1} / {events.length}
            </span>
          )}
        </div>
      </div>

      {/* Cockpit Telemetry HUD (Visible when flight is active) */}
      {phase !== 'intro' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Net Worth Altitude */}
          <GlassCard className="p-3.5 rounded-2xl border border-[#27272A]">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Altitude (Net Worth)</span>
              <Plane className="w-3.5 h-3.5 text-[#FF5E1E]" />
            </div>
            <div className="text-base sm:text-lg font-black font-numeric text-white">
              ₹{metrics.altitudeNetWorth.toLocaleString('en-IN')}
            </div>
          </GlassCard>

          {/* Liquid Cash Fuel */}
          <GlassCard className="p-3.5 rounded-2xl border border-[#27272A]">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Fuel (Liquid Cash)</span>
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div
              className={`text-base sm:text-lg font-black font-numeric ${
                metrics.fuelCash <= 10000 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              ₹{metrics.fuelCash.toLocaleString('en-IN')}
            </div>
          </GlassCard>

          {/* Debt Drag */}
          <GlassCard className="p-3.5 rounded-2xl border border-[#27272A]">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Debt Drag</span>
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div
              className={`text-base sm:text-lg font-black font-numeric ${
                metrics.debtDrag > 0 ? 'text-rose-400' : 'text-zinc-400'
              }`}
            >
              ₹{metrics.debtDrag.toLocaleString('en-IN')}
            </div>
          </GlassCard>

          {/* Monthly EMI Burn */}
          <GlassCard className="p-3.5 rounded-2xl border border-[#27272A]">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Monthly EMI Burn</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div
              className={`text-base sm:text-lg font-black font-numeric ${
                metrics.monthlyEmi > 0 ? 'text-amber-400' : 'text-zinc-400'
              }`}
            >
              ₹{metrics.monthlyEmi.toLocaleString('en-IN')}/mo
            </div>
          </GlassCard>

          {/* Resilience Index */}
          <GlassCard className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl border border-[#27272A]">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold">Resilience</span>
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black font-numeric text-white">
                {metrics.resilienceScore}%
              </span>
              <div className="flex-1 h-2 rounded-full bg-[#18181D] overflow-hidden border border-[#27272A]">
                <div
                  className={`h-full transition-all duration-500 ${
                    metrics.resilienceScore >= 70
                      ? 'bg-[#22C55E]'
                      : metrics.resilienceScore >= 40
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.resilienceScore}%` }}
                />
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Main Content Area by Phase */}
      <AnimatePresence mode="wait">
        {/* PHASE 1: INTRO */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <GlassCard className="p-6 sm:p-10 rounded-3xl border-2 border-[#FF5E1E]/50 shadow-brand-orange space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E1E]/20 border border-[#FF5E1E]/40 text-[#FF5E1E] text-xs font-black font-numeric">
                  <span>⚡ EMERGENCY DRILL PROTOCOL</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  Welcome to the Financial Wind Tunnel
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
                  Pilots don’t learn to handle catastrophic storms while carrying 300 passengers at 35,000 feet.
                  They log hours inside a flight simulator confronting sudden engine stalls, extreme downdrafts, and mechanical failures.
                </p>
                <blockquote className="border-l-4 border-[#FF5E1E] pl-4 py-1 text-xs sm:text-sm text-zinc-400 italic">
                  "Life will test your finances without giving you a syllabus. The only way to survive is through pre-practiced resilience."
                </blockquote>
              </div>

              {/* Rules & Mechanics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#18181D]/80 border border-[#27272A] space-y-2">
                  <div className="flex items-center gap-2 text-[#FF5E1E] font-black text-sm">
                    <Zap className="w-4 h-4" />
                    <span>Real-Life Shocks</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Motherboard crashes, hospital bills, sudden rent hikes, and stock pullbacks hit without notice.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181D]/80 border border-[#27272A] space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                    <Activity className="w-4 h-4" />
                    <span>Cascading Drag</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Choosing high-interest EMI options now binds future monthly cashflow, making future turbulence deadlier.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181D]/80 border border-[#27272A] space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>What-If Debriefs</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Compare your tactical decisions against optimal financial aerodynamics and build calm instincts.
                  </p>
                </div>
              </div>

              {/* Start CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#27272A]">
                <div className="text-xs text-zinc-400 font-medium">
                  Initial Flight Capital: <strong className="text-white font-numeric">₹45,000 Liquid Buffer</strong> • <strong className="text-white font-numeric">6 Scenarios</strong>
                </div>

                <Button
                  variant="orange"
                  size="lg"
                  icon={<Plane className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={handleStartFlight}
                  className="w-full sm:w-auto shadow-brand-orange px-8 py-4 font-black"
                >
                  Engage Flight Controls
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* PHASE 2: WARNING CINEMATIC */}
        {phase === 'warning' && (
          <motion.div
            key="warning"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[420px] p-8 text-center space-y-5 glass-card rounded-3xl border-2 border-amber-500 shadow-brand-orange relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-amber-500/10 animate-pulse pointer-events-none" />

            <motion.div
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg"
            >
              <AlertTriangle className="w-10 h-10" />
            </motion.div>

            <div className="space-y-2 relative z-10">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-numeric">
                ⚠️ ALTIMETER WARNING • SEVERE SHOCK DETECTED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {currentEvent.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
                Fasten your seatbelts. Assess financial damage and execute your containment tradeoff.
              </p>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: EVENT DECISION */}
        {phase === 'event' && (
          <motion.div
            key="event"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Event Scenario Header */}
            <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#27272A] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#18181D] border border-[#27272A] flex items-center justify-center">
                    {getCategoryIcon(currentEvent.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold text-zinc-400">
                        Incident #{currentEventIndex + 1}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          getSeverityBadge(currentEvent.severity).color
                        }`}
                      >
                        {getSeverityBadge(currentEvent.severity).label}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {currentEvent.title}
                    </h2>
                  </div>
                </div>

                {/* Shock Cost */}
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                    Shock Damage
                  </span>
                  <span className="text-2xl font-black font-numeric text-red-400">
                    ₹{currentEvent.shockCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Active Downstream Chain Reaction Warning */}
              {activeChainEffects.includes('heavy_emi_drag') && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>Cascading Chain Effect Active:</strong> Your previous EMI commitment of ₹
                    {metrics.monthlyEmi}/mo is constricting your liquidity window for this shock!
                  </span>
                </div>
              )}

              {/* Narrative Story */}
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {currentEvent.storyDescription}
              </p>
            </GlassCard>

            {/* Tradeoff Decision Matrix */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <span>Select Your Aerodynamic Containment Strategy</span>
                <span className="text-[10px] text-zinc-500 lowercase">(Choose 1 tradeoff)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentEvent.choices.map((choice) => {
                  const cannotAffordCash =
                    choice.requiredCash !== undefined && metrics.fuelCash < choice.requiredCash;

                  return (
                    <GlassCard
                      key={choice.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        cannotAffordCash
                          ? 'opacity-50 border-zinc-800'
                          : 'border-[#27272A] hover:border-[#FF5E1E]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${
                              choice.actionType === 'savings'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : choice.actionType === 'emi'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : choice.actionType === 'borrow'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                            }`}
                          >
                            {choice.actionType.toUpperCase()}
                          </span>

                          {choice.resilienceDelta > 0 ? (
                            <span className="text-xs font-black font-numeric text-emerald-400 flex items-center gap-0.5">
                              +{choice.resilienceDelta}% Resilience
                            </span>
                          ) : (
                            <span className="text-xs font-black font-numeric text-rose-400 flex items-center gap-0.5">
                              {choice.resilienceDelta}% Resilience
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-black text-white leading-snug">
                          {choice.label}
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {choice.description}
                        </p>
                      </div>

                      {/* Tradeoff Impact Badges */}
                      <div className="pt-3 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-numeric font-bold">
                          {choice.cashDelta !== 0 && (
                            <span
                              className={choice.cashDelta < 0 ? 'text-red-400' : 'text-emerald-400'}
                            >
                              Cash: {choice.cashDelta < 0 ? '-' : '+'}₹
                              {Math.abs(choice.cashDelta).toLocaleString('en-IN')}
                            </span>
                          )}
                          {choice.debtDelta > 0 && (
                            <span className="text-rose-400">
                              Debt: +₹{choice.debtDelta.toLocaleString('en-IN')}
                            </span>
                          )}
                          {choice.monthlyEmiDelta > 0 && (
                            <span className="text-amber-400">
                              EMI: +₹{choice.monthlyEmiDelta}/mo
                            </span>
                          )}
                        </div>

                        <Button
                          variant={cannotAffordCash ? 'secondary' : 'orange'}
                          size="sm"
                          disabled={cannotAffordCash}
                          onClick={() => handleSelectChoice(choice)}
                        >
                          {cannotAffordCash ? 'Insufficient Cash' : 'Execute Maneuver'}
                        </Button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 4: CONSEQUENCE & WHAT-IF COMPARISON */}
        {phase === 'consequence' && selectedChoice && (
          <motion.div
            key="consequence"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] space-y-6">
              {/* Tactical Feedback Banner */}
              <div
                className={`p-5 rounded-2xl border flex items-start gap-4 ${
                  selectedChoice.resilienceDelta >= 0
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                }`}
              >
                {selectedChoice.resilienceDelta >= 0 ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white">
                    {selectedChoice.shortTermFeedback}
                  </h3>
                  {selectedChoice.chainEffectDescription && (
                    <p className="text-xs text-zinc-300">
                      <strong>Chain Impact:</strong> {selectedChoice.chainEffectDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* What-If Flight Path Comparison */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-black tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF5E1E]" />
                  <span>Flight Path Comparison: Your Maneuver vs Recommended Recovery</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Your Action */}
                  <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      Your Maneuver Executed
                    </span>
                    <div className="text-sm font-black text-white">
                      {selectedChoice.label}
                    </div>
                    <div className="text-xs font-numeric space-y-1 text-zinc-400 pt-2 border-t border-[#27272A]">
                      <div>
                        Cash Delta:{' '}
                        <strong className={selectedChoice.cashDelta < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          ₹{selectedChoice.cashDelta.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        Debt Incurred:{' '}
                        <strong className="text-white">
                          ₹{selectedChoice.debtDelta.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        Monthly EMI Obligation:{' '}
                        <strong className="text-amber-400">
                          ₹{selectedChoice.monthlyEmiDelta}/mo
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Optimal Comparison */}
                  {(() => {
                    const recommended = currentEvent.choices.find(
                      (c) => c.id === currentEvent.whatIfAlternativeId
                    );
                    if (!recommended) return null;

                    const isSame = recommended.id === selectedChoice.id;

                    return (
                      <div
                        className={`p-4 rounded-2xl border space-y-2 ${
                          isSame
                            ? 'bg-emerald-950/20 border-emerald-500/40'
                            : 'bg-zinc-900 border-[#27272A]'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Recommended Aerodynamic Recovery</span>
                        </span>
                        <div className="text-sm font-black text-white">
                          {recommended.label}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-[#27272A]">
                          {recommended.description}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Core Financial Educational Lesson */}
              <div className="p-4 rounded-2xl bg-[#FF5E1E]/10 border border-[#FF5E1E]/30 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FF5E1E]">
                  <Info className="w-4 h-4" />
                  <span>Aviation Takeaway</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {currentEvent.educationalLesson}
                </p>
              </div>

              {/* Navigation Action */}
              <div className="pt-2 flex justify-end">
                <Button
                  variant="orange"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={handleNextEvent}
                  className="shadow-brand-orange font-black"
                >
                  {currentEventIndex < events.length - 1
                    ? 'Next Turbulence Encounter'
                    : 'Complete Flight & View Debrief'}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* PHASE 5: FINAL FLIGHT DEBRIEF */}
        {phase === 'debrief' && (
          <motion.div
            key="debrief"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="space-y-6"
          >
            <GlassCard className="p-6 sm:p-10 rounded-3xl border-2 border-[#FF5E1E] shadow-brand-orange space-y-8">
              {/* Debrief Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E1E]/20 border border-[#FF5E1E]/40 text-[#FF5E1E] text-xs font-black font-numeric">
                  <span>✈️ POST-FLIGHT DEBRIEFING</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  Mission Status: {debrief.status}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
                  You navigated {debrief.eventsSurvived} intense real-world financial shock scenarios.
                  Here is the flight recorder analysis of your financial aerodynamics.
                </p>
              </div>

              {/* Scorecard Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">
                    Final Resilience
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-numeric text-white">
                    {debrief.finalResilienceScore}%
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">
                    Remaining Fuel (Cash)
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-numeric text-emerald-400">
                    ₹{metrics.fuelCash.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">
                    Debt Accumulated
                  </span>
                  <div
                    className={`text-xl sm:text-2xl font-black font-numeric ${
                      debrief.debtAccumulated > 0 ? 'text-rose-400' : 'text-zinc-400'
                    }`}
                  >
                    ₹{debrief.debtAccumulated.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">
                    Monthly EMI Burn
                  </span>
                  <div
                    className={`text-xl sm:text-2xl font-black font-numeric ${
                      metrics.monthlyEmi > 0 ? 'text-amber-400' : 'text-zinc-400'
                    }`}
                  >
                    ₹{metrics.monthlyEmi}/mo
                  </div>
                </div>
              </div>

              {/* Badges Earned Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FF5E1E]/15 to-amber-500/15 border border-[#FF5E1E]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5E1E] text-white flex items-center justify-center font-black shadow-brand-orange">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider font-bold text-[#FF5E1E]">
                      Aviation Honors Unlocked
                    </div>
                    <div className="text-base font-black text-white">
                      Turbulence Survivor Badge Earned!
                    </div>
                    {metrics.resilienceScore >= 75 && metrics.debtDrag === 0 && (
                      <div className="text-xs font-semibold text-emerald-400">
                        + Calm Pilot & Decision Master Badges Unlocked!
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
                >
                  View Profile Badges
                </Button>
              </div>

              {/* Key Flight Principles */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Key Flight Principles to Carry into Real Life
                </h3>

                <div className="space-y-2">
                  {debrief.keyTakeaways.map((takeaway, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#18181D] border border-[#27272A] text-xs sm:text-sm text-zinc-300 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#FF5E1E]/20 text-[#FF5E1E] font-numeric font-black flex items-center justify-center shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Debrief Action Buttons */}
              <div className="pt-4 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={handleRestart}
                >
                  Re-run Turbulence Drills
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={onBackToHub}
                  >
                    Training Deck
                  </Button>

                  <Button
                    variant="orange"
                    size="md"
                    icon={<Plane className="w-4 h-4" />}
                    iconPosition="right"
                    onClick={() => dispatch({ type: 'SET_STAGE', payload: 'simulator' })}
                    className="shadow-brand-orange font-black"
                  >
                    Launch 6-Month Flight Sim
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
