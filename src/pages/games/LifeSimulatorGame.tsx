import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  ChevronRight,
  Plane,
  Compass,
  GitCompare,
  History,
  HelpCircle,
  BarChart3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../contexts/GameContext';
import {
  SIMULATOR_SCENARIOS,
  SimulatorPlayerState,
  SimulatorChoice,
  SimulatorScenario,
} from '../../data/lifeSimulatorScenarios';
import { INDIAN_REALITY_SCENARIOS } from '../../data/indianRealityScenarios';
import { formatCurrency, formatScore } from '../../utils/formatters';
import { soundManager } from '../../services/audioService';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { TeamLogo } from '../../components/common/TeamLogo';
import { RiskRadar } from '../../components/flight/RiskRadar';
import { FinancialCoachModal } from '../../components/flight/FinancialCoachModal';
import { WhatIfComparator } from '../../components/flight/WhatIfComparator';
import { DecisionReplayTimeline } from '../../components/flight/DecisionReplayTimeline';
import { FinancialFlightReport } from '../../components/flight/FinancialFlightReport';
import { DecisionDNAEngine } from '../../services/decisionDnaEngine';
import { DiagnosticService } from '../../services/diagnosticService';
import { SessionApi } from '../../services/api/sessionApi';
import {
  RiskRadarMetrics,
  FlightLogEntry,
  FlightReportData,
  FlightStatus,
} from '../../types/flightSimulator';

interface LifeSimulatorGameProps {
  onOpenCertificate?: () => void;
}

export const LifeSimulatorGame: React.FC<LifeSimulatorGameProps> = ({ onOpenCertificate }) => {
  const { state, dispatch, showFeedback } = useGame();

  // Scenario Pack: Default to Indian Reality Pack for maximum hackathon relevance
  const [scenarioPack, setScenarioPack] = useState<'indian' | 'classic'>('indian');

  const scenarios: SimulatorScenario[] =
    scenarioPack === 'indian' ? INDIAN_REALITY_SCENARIOS : SIMULATOR_SCENARIOS;

  // Local Flight Simulator State
  const [playerState, setPlayerState] = useState<SimulatorPlayerState>({
    month: 1,
    salary: 60000,
    cash: 10000,          // initial cash baseline
    debt: 0,              // debt
    monthlyEmi: 0,        // committed EMI
    invested: 0,          // investments
    creditScore: 680,     // baseline good credit
    health: 75,
    score: 0,
    decisionsHistory: [],
  });

  const [flightLogs, setFlightLogs] = useState<FlightLogEntry[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [backendSessionId, setBackendSessionId] = useState<string | null>(null);

  // Initialize backend flight telemetry session
  React.useEffect(() => {
    SessionApi.createSession({
      startingCash: playerState.cash,
      startingDebt: playerState.debt,
      pilotCallsign: state.player.name,
    })
      .then((res) => {
        if (res.success && res.data?.session?.id) {
          setBackendSessionId(res.data.session.id);
        }
      })
      .catch(() => {});
  }, []);

  // Modals & Panels
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [coachChoiceTarget, setCoachChoiceTarget] = useState<SimulatorChoice | null>(null);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showBlackBox, setShowBlackBox] = useState(false);

  // Find scenario for current month
  const currentScenario = scenarios.find((s) => s.month === playerState.month) || scenarios[0];

  const netWorth = playerState.cash + playerState.invested - playerState.debt;
  const freeMonthlyCashflow = Math.max(0, playerState.salary - 25000 - playerState.monthlyEmi);

  // Credit Score Rating helper
  const getCreditRating = (score: number) => {
    if (score >= 750) return { label: 'Excellent Supercruise', color: 'text-[#22C55E]' };
    if (score >= 700) return { label: 'Good Altitude', color: 'text-amber-400' };
    if (score >= 620) return { label: 'Moderate Drag', color: 'text-orange-400' };
    return { label: 'Critical Debt Stall Risk', color: 'text-red-400' };
  };

  const creditRating = getCreditRating(playerState.creditScore);

  // Compute Live Risk Radar Metrics
  const riskMetrics: RiskRadarMetrics = {
    debtRisk: Math.min(100, Math.round((playerState.debt / Math.max(10000, playerState.salary)) * 80)),
    emergencyVulnerability:
      playerState.cash >= 40000 ? 15 : playerState.cash >= 20000 ? 35 : playerState.cash >= 10000 ? 65 : 95,
    lifestyleCreep: playerState.monthlyEmi > 10000 ? 85 : playerState.monthlyEmi > 4000 ? 50 : 20,
    volatilityExposure: playerState.invested > playerState.cash * 2 ? 65 : playerState.invested > 0 ? 25 : 45,
    scamExposure: playerState.decisionsHistory.some((id) => id.includes('scam') || id.includes('victim')) ? 85 : 15,
    creditFragility: playerState.creditScore >= 750 ? 15 : playerState.creditScore >= 680 ? 40 : playerState.creditScore >= 600 ? 70 : 95,
  };

  const handleOpenCoach = (choice: SimulatorChoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setCoachChoiceTarget(choice);
    setIsCoachModalOpen(true);
  };

  const handleSelectChoice = (choice: SimulatorChoice) => {
    setSelectedChoiceId(choice.id);

    const { effects } = choice;
    const isOptimal = effects.scoreDelta >= 800;

    if (isOptimal) {
      soundManager.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      soundManager.playClick();
    }

    // Compute next state
    const nextCash = Math.max(0, playerState.cash + effects.cashDelta);
    const nextDebt = Math.max(0, playerState.debt + effects.debtDelta);
    const nextEmi = Math.max(0, playerState.monthlyEmi + effects.monthlyEmiDelta);
    const nextInvested = Math.max(0, playerState.invested + effects.investedDelta);
    const nextCreditScore = Math.min(850, Math.max(300, playerState.creditScore + effects.creditScoreDelta));
    const nextHealth = Math.min(100, Math.max(10, playerState.health + effects.healthDelta));
    const nextScore = playerState.score + effects.scoreDelta;
    const nextNetWorth = nextCash + nextInvested - nextDebt;

    // Log this decision in flight black box
    const logEntry: FlightLogEntry = {
      month: playerState.month,
      scenarioTitle: currentScenario.title,
      choiceSelected: choice.label,
      cashDelta: effects.cashDelta,
      debtDelta: effects.debtDelta,
      netWorthResult: nextNetWorth,
      isOptimal,
      turbulenceReason: !isOptimal ? choice.outcomeHeadline : undefined,
    };

    const updatedLogs = [...flightLogs, logEntry];
    setFlightLogs(updatedLogs);

    // Asynchronously log decision with backend flight session
    if (backendSessionId) {
      SessionApi.advanceMonth(backendSessionId, {
        scenarioId: currentScenario.id,
        choiceId: choice.id,
        choiceText: choice.label,
        cashDelta: effects.cashDelta,
        debtDelta: effects.debtDelta,
        isOptimal,
        explanation: choice.outcomeExplanation,
        whyExplanation: choice.outcomeHeadline,
      }).catch(() => {});
    }

    const updatedState: SimulatorPlayerState = {
      ...playerState,
      cash: nextCash,
      debt: nextDebt,
      monthlyEmi: nextEmi,
      invested: nextInvested,
      creditScore: nextCreditScore,
      health: nextHealth,
      score: nextScore,
      decisionsHistory: [...playerState.decisionsHistory, choice.id],
    };

    setPlayerState(updatedState);

    // Sync score & net worth with global context
    dispatch({
      type: 'RECORD_SCAM_VERDICT',
      payload: {
        targetId: choice.id,
        isCorrect: isOptimal,
        detectedFlags: [],
        scoreChange: effects.scoreDelta,
        healthChange: effects.healthDelta,
        netWorthChange: effects.cashDelta + effects.investedDelta - effects.debtDelta,
      },
    });

    // Show educational feedback
    showFeedback({
      title: `${currentScenario.title}: Flight Telemetry Outcome`,
      verdict: isOptimal ? 'success' : effects.debtDelta > 0 ? 'danger' : 'warning',
      headline: choice.outcomeHeadline,
      financialImpact: {
        netWorthDelta: effects.cashDelta + effects.investedDelta - effects.debtDelta,
        healthDelta: effects.healthDelta,
        scoreDelta: effects.scoreDelta,
        debtDelta: effects.debtDelta,
      },
      whyItHappened: choice.outcomeExplanation,
      whatYouShouldLearn: choice.financialLesson,
      onContinue: () => {
        if (playerState.month < 6) {
          setPlayerState((prev) => ({
            ...prev,
            month: prev.month + 1,
            // Monthly salary influx minus committed EMI for the next month!
            cash: prev.cash + (prev.salary - 25000 - prev.monthlyEmi),
          }));
          setSelectedChoiceId(null);
        } else {
          // Completed all 6 months
          setIsCompleted(true);
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
          });
        }
      },
    });
  };

  const handleRestartSimulator = () => {
    setPlayerState({
      month: 1,
      salary: 60000,
      cash: 10000,
      debt: 0,
      monthlyEmi: 0,
      invested: 0,
      creditScore: 680,
      health: 75,
      score: 0,
      decisionsHistory: [],
    });
    setFlightLogs([]);
    setSelectedChoiceId(null);
    setIsCompleted(false);
    setShowWhatIf(false);
    setShowBlackBox(false);
  };

  const handleRewindToMonth = (targetMonth: number) => {
    // Rewind back to target month
    setPlayerState((prev) => ({
      ...prev,
      month: targetMonth,
    }));
    setFlightLogs((prev) => prev.filter((l) => l.month < targetMonth));
    setSelectedChoiceId(null);
    setIsCompleted(false);
    setShowBlackBox(false);
  };

  // Build Flight Report data upon completion
  const buildFlightReport = (): FlightReportData => {
    const decisionDNA = DecisionDNAEngine.analyze(playerState);

    let flightStatus: FlightStatus = 'smooth';
    if (playerState.debt > 30000 || playerState.creditScore < 600) {
      flightStatus = 'crash';
    } else if (playerState.debt > 0 || playerState.cash < 10000) {
      flightStatus = 'turbulent';
    }

    // Check pre-flight IQ to calculate delta
    const storedPre = localStorage.getItem('finquest_pre_iq');
    const preScore = storedPre ? parseInt(storedPre, 10) : 48;
    const postScore = Math.min(96, Math.max(55, Math.round(50 + (playerState.score / 6000) * 45)));
    const iqDelta = DiagnosticService.computeDelta(
      { totalScore: preScore, categoryScores: { budget: 45, debt: 40, scam: 45, investing: 40, insurance: 45 }, tier: 'Pre-Flight Cadet', completedAt: '' },
      { totalScore: postScore, categoryScores: { budget: 85, debt: 80, scam: 90, investing: 85, insurance: 80 }, tier: 'Licensed Financial Aviator', completedAt: '' }
    );

    return {
      flightStatus,
      captainName: state.player.name || 'Cadet',
      flightDurationMonths: 6,
      finalAltitude: netWorth,
      fuelRemaining: playerState.cash,
      airspeed: freeMonthlyCashflow,
      totalDebt: playerState.debt,
      cibilScore: playerState.creditScore,
      overallScore: playerState.score,
      decisionDNA,
      iqDelta,
      flightLogs,
      keyLessons: [
        'An emergency fund is your altitude parachute against predatory credit.',
        'High-APR debt compounding creates irreversible aerodynamic drag.',
        'Never enter your UPI PIN to receive money; authentic advisors never guarantee returns on Telegram.',
      ],
    };
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 select-none text-left">
      {/* Top Header & Team Swastik Attribution */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card rounded-3xl p-5 sm:p-6 border border-[#27272A] shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
              Aviation Flight Simulator • GD-01
            </span>
            <span className="text-xs font-bold text-zinc-400">
              High-Stakes Financial Learning • Zero Real-World Risk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-[#FF5E1E]" />
            <span>Financial Flight Simulator Cockpit</span>
          </h1>
        </div>

        {/* Action Controls & Pack Selector */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Pack Toggle */}
          <div className="flex items-center bg-[#18181D] border border-[#27272A] rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => {
                setScenarioPack('indian');
                handleRestartSimulator();
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                scenarioPack === 'indian'
                  ? 'bg-[#FF5E1E] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🇮🇳 Indian Reality
            </button>
            <button
              onClick={() => {
                setScenarioPack('classic');
                handleRestartSimulator();
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                scenarioPack === 'classic'
                  ? 'bg-[#FF5E1E] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Classic
            </button>
          </div>

          <TeamLogo size="sm" showText={false} />

          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
          >
            Quest Hub
          </Button>
        </div>
      </div>

      {/* Primary Cockpit Flight Instruments Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-numeric">
        {/* Altitude (Net Worth) */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <Plane className="w-3.5 h-3.5 text-[#FF5E1E]" />
            <span>Altitude (Net Worth)</span>
          </div>
          <div className="text-base sm:text-lg font-black text-white">
            {formatCurrency(netWorth)}
          </div>
          <span className="text-[10px] text-zinc-500 block">Cruising Elevation</span>
        </div>

        {/* Fuel Remaining (Cash) */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <Wallet className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Fuel Reserve (Cash)</span>
          </div>
          <div className="text-base sm:text-lg font-black text-[#22C55E]">
            {formatCurrency(playerState.cash)}
          </div>
          <span className="text-[10px] text-zinc-500 block">Liquid Runway Parachute</span>
        </div>

        {/* Debt Drag */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <CreditCard className="w-3.5 h-3.5 text-red-400" />
            <span>Debt Drag</span>
          </div>
          <div
            className={`text-base sm:text-lg font-black ${
              playerState.debt > 0 ? 'text-red-400' : 'text-[#22C55E]'
            }`}
          >
            {formatCurrency(playerState.debt)}
          </div>
          <span className="text-[10px] text-zinc-500 block">
            {playerState.monthlyEmi > 0 ? `₹${playerState.monthlyEmi.toLocaleString()}/mo Drag` : 'Zero Debt Drag'}
          </span>
        </div>

        {/* CIBIL Altimeter */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-[#27272A]">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF5E1E]" />
            <span>CIBIL Altimeter</span>
          </div>
          <div className="text-base sm:text-lg font-black text-white">
            {playerState.creditScore}{' '}
            <span className="text-xs text-zinc-500 font-normal">/ 850</span>
          </div>
          <span className={`text-[10px] font-bold block truncate ${creditRating.color}`}>
            {creditRating.label}
          </span>
        </div>

        {/* Airspeed (Monthly Cashflow) */}
        <div className="glass-card p-3 sm:p-4 rounded-2xl border border-[#27272A] col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Monthly Airspeed</span>
          </div>
          <div className="text-base sm:text-lg font-black text-white">
            {formatCurrency(freeMonthlyCashflow)}
          </div>
          <span className="text-[10px] text-zinc-500 block">Unencumbered Flow</span>
        </div>
      </div>

      {/* Flight Control Toolbar: Risk Radar Toggle, Black Box Toggle, What-If Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#18181D]/80 border border-[#27272A] text-xs font-bold font-numeric">
        <div className="flex items-center gap-2">
          {/* Month Stepper */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((m) => {
              const isCurrent = playerState.month === m && !isCompleted;
              const isPassed = playerState.month > m || isCompleted;

              return (
                <div
                  key={m}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition-all ${
                    isCurrent
                      ? 'bg-[#FF5E1E] text-white border-[#FF5E1E] shadow-brand-orange'
                      : isPassed
                      ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40'
                      : 'bg-[#18181D] text-zinc-500 border-[#27272A]'
                  }`}
                >
                  M{m}
                </div>
              );
            })}
          </div>
        </div>

        {/* Utility Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRadarModal(!showRadarModal)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
              showRadarModal
                ? 'bg-[#FF5E1E]/20 border-[#FF5E1E] text-white'
                : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#FF5E1E]" />
            <span>Risk Radar</span>
          </button>

          <button
            onClick={() => setShowBlackBox(!showBlackBox)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all ${
              showBlackBox
                ? 'bg-[#FF5E1E]/20 border-[#FF5E1E] text-white'
                : 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Flight Black Box</span>
          </button>
        </div>
      </div>

      {/* Conditionally Rendered Risk Radar Widget */}
      {showRadarModal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl glass-card border border-[#27272A]"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-numeric">
              Live Financial Risk Radar Telemetry
            </h3>
            <button
              onClick={() => setShowRadarModal(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Minimize
            </button>
          </div>
          <RiskRadar metrics={riskMetrics} compact={false} />
        </motion.div>
      )}

      {/* Conditionally Rendered Decision Replay Black Box */}
      {showBlackBox && (
        <DecisionReplayTimeline
          logs={flightLogs}
          onRewindToMonth={handleRewindToMonth}
        />
      )}

      {!isCompleted ? (
        /* ACTIVE SCENARIO & DYNAMIC FLIGHT CHOICES */
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScenario.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Scenario Narrative Card */}
            <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF5E1E]/15 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
                  {currentScenario.subtitle}
                </span>

                <span className="text-xs font-bold text-zinc-400 font-numeric">
                  Flight Checkpoint Month {playerState.month} of 6
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {currentScenario.title}
                </h2>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                  {currentScenario.description}
                </p>
              </div>

              {/* Dynamic Decisions Grid */}
              <div className="pt-4 border-t border-[#27272A] space-y-3">
                <h3 className="text-sm font-black text-white">
                  Select Your Flight Maneuver (Consequences Alter Future Rounds):
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {currentScenario.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;

                    // Dynamic Lock: does choice require liquid cash the user lacks?
                    const isCashLocked =
                      choice.requiredCash !== undefined && playerState.cash < choice.requiredCash;
                    const isDisabled = isCashLocked;

                    return (
                      <motion.div
                        key={choice.id}
                        whileHover={isDisabled ? undefined : { scale: 1.01 }}
                        className={`p-5 rounded-2xl border transition-all text-left relative ${
                          isDisabled
                            ? 'bg-[#18181D]/40 border-[#27272A] opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#FF5E1E]/20 border-[#FF5E1E] shadow-brand-orange text-white'
                            : 'bg-[#18181D] hover:bg-[#222328] border-[#27272A] hover:border-[#FF5E1E] text-zinc-200'
                        }`}
                      >
                        <div
                          onClick={() => !isDisabled && handleSelectChoice(choice)}
                          className={isDisabled ? '' : 'cursor-pointer'}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="space-y-1">
                              <span className="text-sm sm:text-base font-black text-white leading-snug block">
                                {choice.label}
                              </span>
                              <p className="text-xs text-zinc-400 leading-relaxed">
                                {choice.description}
                              </p>
                            </div>

                            {isDisabled ? (
                              <div className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-950/60 border border-red-800 px-2.5 py-1 rounded-lg shrink-0">
                                <Lock className="w-3.5 h-3.5" />
                                <span>Locked</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={(e) => handleOpenCoach(choice, e)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-[#FF5E1E]/20 hover:text-[#FF5E1E] border border-zinc-700 transition-colors text-zinc-400"
                                  title="Ask AI Flight Coach to explain this decision"
                                >
                                  <Compass className="w-4 h-4" />
                                </button>
                                <ChevronRight className="w-5 h-5 text-[#FF5E1E] mt-0.5" />
                              </div>
                            )}
                          </div>

                          {/* Lock Banner */}
                          {isCashLocked && (
                            <div className="mt-2 p-2 rounded-xl bg-red-950/40 border border-red-900/50 text-[11px] text-red-300 font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>
                                Requires {formatCurrency(choice.requiredCash!)} liquid cash. You only have {formatCurrency(playerState.cash)}! Your past spending choices locked this escape path.
                              </span>
                            </div>
                          )}

                          {/* Projected Impact Telemetry */}
                          {!isDisabled && (
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#27272A]/60 text-[11px] font-bold font-numeric">
                              {choice.effects.cashDelta !== 0 && (
                                <span
                                  className={`px-2 py-0.5 rounded-md ${
                                    choice.effects.cashDelta > 0
                                      ? 'bg-[#22C55E]/15 text-[#22C55E]'
                                      : 'bg-red-500/15 text-red-400'
                                  }`}
                                >
                                  {choice.effects.cashDelta > 0
                                    ? `+${formatCurrency(choice.effects.cashDelta)}`
                                    : formatCurrency(choice.effects.cashDelta)}{' '}
                                  Cash
                                </span>
                              )}
                              {choice.effects.debtDelta !== 0 && (
                                <span
                                  className={`px-2 py-0.5 rounded-md ${
                                    choice.effects.debtDelta > 0
                                      ? 'bg-red-500/15 text-red-400'
                                      : 'bg-[#22C55E]/15 text-[#22C55E]'
                                  }`}
                                >
                                  {choice.effects.debtDelta > 0
                                    ? `+${formatCurrency(choice.effects.debtDelta)} Debt`
                                    : `${formatCurrency(choice.effects.debtDelta)} Debt Cleared`}
                                </span>
                              )}
                              {choice.effects.monthlyEmiDelta > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400">
                                  +₹{choice.effects.monthlyEmiDelta.toLocaleString()}/mo Drag
                                </span>
                              )}
                              {choice.effects.investedDelta > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-[#FF5E1E]/15 text-[#FF5E1E]">
                                  +{formatCurrency(choice.effects.investedDelta)} Invested
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-md ${
                                  choice.effects.creditScoreDelta >= 0
                                    ? 'bg-[#22C55E]/15 text-[#22C55E]'
                                    : 'bg-red-500/15 text-red-400'
                                }`}
                              >
                                {choice.effects.creditScoreDelta >= 0
                                  ? `+${choice.effects.creditScoreDelta}`
                                  : choice.effects.creditScoreDelta}{' '}
                                CIBIL
                              </span>

                              <span className="text-zinc-500 text-[10px] ml-auto flex items-center gap-1">
                                <Compass className="w-3 h-3 text-[#FF5E1E]" /> Click compass for AI coach
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>

            {/* What-If Comparator for active decision */}
            <div className="pt-2">
              <WhatIfComparator
                chosenChoice={currentScenario.choices[0]}
                allChoices={currentScenario.choices}
                currentNetWorth={netWorth}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        /* SIMULATION COMPLETE: FINANCIAL FLIGHT REPORT & DEBRIEF */
        <FinancialFlightReport
          report={buildFlightReport()}
          onOpenCertificate={onOpenCertificate}
          onRestartFlight={handleRestartSimulator}
          onGoToHub={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
        />
      )}

      {/* AI Flight Coach Modal */}
      <FinancialCoachModal
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        choice={coachChoiceTarget}
        scenarioTitle={currentScenario.title}
        playerState={playerState}
      />
    </div>
  );
};
