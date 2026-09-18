import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Wifi,
  Battery,
  ChevronLeft,
  Info,
  Award,
  Zap,
  Phone,
  MessageSquare,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SCAM_DETECTIVE_SCENARIOS } from '../../data/scamDetectiveData';
import {
  ScamScenario,
  ScamRedFlagClue,
  ScamDecisionOption,
  DetectiveRank,
  DetectiveReport,
} from '../../types/scamDetective';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { TeamLogo } from '../common/TeamLogo';

interface ScamDetectiveGameProps {
  onBackToHub: () => void;
}

export const ScamDetectiveGame: React.FC<ScamDetectiveGameProps> = ({ onBackToHub }) => {
  const { state, dispatch } = useGame();
  const scenarios = SCAM_DETECTIVE_SCENARIOS;

  // Game Phase: 'intro' | 'investigating' | 'decision' | 'analysis' | 'report'
  const [phase, setPhase] = useState<'intro' | 'investigating' | 'decision' | 'analysis' | 'report'>('intro');
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

  // Active scenario state
  const [foundClueIds, setFoundClueIds] = useState<string[]>([]);
  const [selectedClueFeedback, setSelectedClueFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [comboCount, setComboCount] = useState(0);
  const [scamShieldScore, setScamShieldScore] = useState(50);
  const [selectedDecision, setSelectedDecision] = useState<ScamDecisionOption | null>(null);

  // Cumulative performance tracking
  const [casesInvestigated, setCasesInvestigated] = useState(0);
  const [scamsSuccessfullyEvaded, setScamsSuccessfullyEvaded] = useState(0);
  const [totalRedFlagsFound, setTotalRedFlagsFound] = useState(0);

  const currentScenario: ScamScenario = scenarios[currentScenarioIndex] || scenarios[0];

  // Start the investigation from intro
  const handleStartGame = () => {
    soundManager.playClick();
    setPhase('investigating');
    setFoundClueIds([]);
    setSelectedClueFeedback(null);
    setComboCount(0);
  };

  // Handle clicking a suspicious phrase in the simulated message
  const handleTapClue = (clue: ScamRedFlagClue) => {
    if (foundClueIds.includes(clue.id)) return;

    if (clue.isCorrect) {
      soundManager.playRedFlag();
      setFoundClueIds((prev) => [...prev, clue.id]);
      setTotalRedFlagsFound((prev) => prev + 1);
      const nextCombo = comboCount + 1;
      setComboCount(nextCombo);

      const bonus = nextCombo >= 3 ? 15 : 10;
      setScamShieldScore((prev) => Math.min(100, prev + bonus));

      setSelectedClueFeedback({
        text: `⚠️ RED FLAG DETECTED: ${clue.explanation}`,
        isCorrect: true,
      });

      // Unlock first scam detection badge
      dispatch({ type: 'UNLOCK_BADGE', payload: 'badge_scam_spotter' });
    } else {
      soundManager.playWarning();
      setComboCount(0);
      setScamShieldScore((prev) => Math.max(10, prev - 5));
      setSelectedClueFeedback({
        text: `Normal message context: ${clue.explanation}`,
        isCorrect: false,
      });
    }
  };

  // Transition to the decision phase
  const handleProceedToDecision = () => {
    soundManager.playClick();
    setPhase('decision');
  };

  // Handle selecting an actionable response
  const handleSelectDecision = (opt: ScamDecisionOption) => {
    setSelectedDecision(opt);
    setCasesInvestigated((prev) => prev + 1);

    if (opt.isSafe) {
      soundManager.playSuccess();
      setScamsSuccessfullyEvaded((prev) => prev + 1);
      setScamShieldScore((prev) => Math.min(100, prev + 15));
      dispatch({
        type: 'RECORD_SCAM_VERDICT',
        payload: {
          targetId: currentScenario.id,
          isCorrect: true,
          detectedFlags: foundClueIds,
          scoreChange: 450,
          healthChange: +8,
          netWorthChange: 0,
        },
      });
    } else {
      soundManager.playWarning();
      setScamShieldScore((prev) => Math.max(10, prev - 20));
      dispatch({
        type: 'RECORD_SCAM_VERDICT',
        payload: {
          targetId: currentScenario.id,
          isCorrect: false,
          detectedFlags: foundClueIds,
          scoreChange: 100,
          healthChange: -12,
          netWorthChange: -2500,
        },
      });
    }

    setPhase('analysis');
  };

  // Advance to next scenario or final report
  const handleNextScenario = () => {
    soundManager.playClick();
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
      setFoundClueIds([]);
      setSelectedClueFeedback(null);
      setSelectedDecision(null);
      setPhase('investigating');
    } else {
      // Completed all cases
      const finalReport = calculateFinalReport();
      if (finalReport.accuracyPercent >= 90) {
        dispatch({ type: 'UNLOCK_BADGE', payload: 'badge_scam_shield' });
      }
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setPhase('report');
    }
  };

  const handleRestart = () => {
    setCurrentScenarioIndex(0);
    setFoundClueIds([]);
    setSelectedClueFeedback(null);
    setSelectedDecision(null);
    setComboCount(0);
    setScamShieldScore(50);
    setCasesInvestigated(0);
    setScamsSuccessfullyEvaded(0);
    setTotalRedFlagsFound(0);
    setPhase('intro');
  };

  // Compute final report metrics & rank
  const calculateFinalReport = (): DetectiveReport => {
    const accuracy = casesInvestigated > 0
      ? Math.round((scamsSuccessfullyEvaded / casesInvestigated) * 100)
      : 85;

    let rank: DetectiveRank = 'Rookie Detective';
    if (scamShieldScore >= 90 && accuracy >= 85) rank = 'Master Detective';
    else if (scamShieldScore >= 75) rank = 'Financial Guardian';
    else if (scamShieldScore >= 60) rank = 'Scam Hunter';
    else if (scamShieldScore >= 40) rank = 'Alert Investigator';

    return {
      casesInvestigated: Math.max(1, casesInvestigated),
      scamsDetected: scamsSuccessfullyEvaded,
      redFlagsFound: totalRedFlagsFound,
      totalRedFlagsAvailable: scenarios.reduce((acc, s) => acc + s.clues.filter((c) => c.isCorrect).length, 0),
      accuracyPercent: accuracy,
      scamShieldScore,
      detectiveRank: rank,
      completedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 select-none text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card rounded-3xl p-5 sm:p-6 border border-[var(--border-primary)] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-numeric">
              Cyber Forensics • Flight Training Deck
            </span>
            <span className="text-xs text-zinc-400 font-bold">
              FinQuest Tactical Lab
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>Scam Detective: Forensic Investigation</span>
          </h1>
          <p className="text-xs text-zinc-400">
            Inspect simulated digital communications, spot deceptive social engineering cues, and fortify your Scam Shield.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <TeamLogo size="sm" showText={false} />
          <Button variant="secondary" size="sm" onClick={onBackToHub}>
            Training Deck
          </Button>
        </div>
      </div>

      {/* PHASE 1: CINEMATIC INTRO */}
      {phase === 'intro' && (
        <GlassCard className="p-6 sm:p-10 rounded-3xl border-2 border-red-500/50 shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle Radar Scanner Animation */}
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mx-auto relative shadow-[0_0_30px_rgba(239,68,68,0.25)]">
            <ShieldAlert className="w-10 h-10 text-red-400 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-red-400/30 animate-ping opacity-30" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-red-400 font-numeric block">
              🚨 FINANCIAL CYBER THREAT ALERT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Your Mission: Protect Your Virtual Balance Sheet
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Scammers deploy manufactured urgency, spoofed bank SMS headers, and deceptive QR debit links. You are equipped with a forensic simulated smartphone: tap suspicious clues, make critical containment choices, and neutralize financial fraud before it breaches your accounts.
            </p>
          </div>

          {/* Quick Guidance Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] space-y-1">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Inspect Clues</span>
              </span>
              <p className="text-[11px] text-zinc-400">
                Tap highlighted or suspicious words on the smartphone screen to reveal hidden red flags.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] space-y-1">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FF5E1E]" />
                <span>2. Build Combos</span>
              </span>
              <p className="text-[11px] text-zinc-400">
                Chaining accurate red-flag detections charges your Scam Shield combo multiplier.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] space-y-1">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>3. Make Containment</span>
              </span>
              <p className="text-[11px] text-zinc-400">
                Choose the correct security procedure to protect your balance sheet.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button
              variant="orange"
              size="lg"
              className="shadow-brand-orange px-8 py-3.5 text-sm font-black"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={handleStartGame}
            >
              Start Investigation
            </Button>
          </div>
        </GlassCard>
      )}

      {/* PHASE 2 & 3: SIMULATED SMARTPHONE INVESTIGATION & DECISION */}
      {(phase === 'investigating' || phase === 'decision' || phase === 'analysis') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Forensic Dashboard & Scam Shield HUD (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Scam Shield Meter */}
            <GlassCard className="p-5 rounded-3xl border border-[var(--border-primary)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-numeric flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                  <span>Scam Shield Defense</span>
                </span>
                <span className="text-sm font-black text-white font-numeric">
                  {scamShieldScore}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-[#22C55E] rounded-full"
                  animate={{ width: `${scamShieldScore}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 font-numeric text-center text-xs">
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]">
                  <span className="text-[10px] text-zinc-400 block">Case</span>
                  <span className="font-black text-white">
                    {currentScenarioIndex + 1}/{scenarios.length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]">
                  <span className="text-[10px] text-zinc-400 block">Red Flags</span>
                  <span className="font-black text-amber-400">
                    {foundClueIds.length}/{currentScenario.clues.filter((c) => c.isCorrect).length}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]">
                  <span className="text-[10px] text-zinc-400 block">Combo</span>
                  <span className="font-black text-[#FF5E1E]">
                    {comboCount > 1 ? `x${comboCount}` : '—'}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Red Flag Feedback Card */}
            {selectedClueFeedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                  selectedClueFeedback.isCorrect
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold font-numeric">
                  {selectedClueFeedback.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Info className="w-4 h-4 text-zinc-400" />
                  )}
                  <span>Forensic Analysis Result</span>
                </div>
                <p>{selectedClueFeedback.text}</p>
              </motion.div>
            )}

            {/* Decision Prompt Block (when in decision phase) */}
            {phase === 'decision' && (
              <GlassCard className="p-5 rounded-3xl border-2 border-[#FF5E1E] space-y-4 animate-in fade-in">
                <span className="text-[11px] font-black uppercase text-[#FF5E1E] tracking-wider block font-numeric">
                  DECISION REQUIRED:
                </span>
                <h3 className="text-sm sm:text-base font-black text-white leading-snug">
                  {currentScenario.decisionPrompt}
                </h3>

                <div className="space-y-2">
                  {currentScenario.decisionOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectDecision(opt)}
                      className="w-full p-3.5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-primary)] hover:border-[#FF5E1E] text-left text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center justify-between gap-2"
                    >
                      <span>{opt.label}</span>
                      <ChevronLeft className="w-4 h-4 rotate-180 text-zinc-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Case Analysis Breakdown (when in analysis phase) */}
            {phase === 'analysis' && selectedDecision && (
              <GlassCard
                className={`p-5 rounded-3xl border-2 space-y-4 animate-in fade-in ${
                  selectedDecision.isSafe
                    ? 'border-[#22C55E] bg-[#22C55E]/5'
                    : 'border-red-500 bg-red-950/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedDecision.isSafe ? (
                    <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <h3 className="text-base font-black text-white">
                    {selectedDecision.isSafe ? 'Scam Neutralized!' : 'Security Compromise!'}
                  </h3>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-bold">
                  {selectedDecision.feedback}
                </p>

                {/* What you learned */}
                <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block font-numeric">
                    Detective Case Takeaway:
                  </span>
                  <ul className="space-y-1 list-disc list-inside text-zinc-300">
                    {currentScenario.caseAnalysis.whatYouLearned.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-zinc-400 pt-1 border-t border-[var(--border-primary)]">
                    🇮🇳 {currentScenario.caseAnalysis.realWorldPrecedent}
                  </p>
                </div>

                <Button
                  variant="orange"
                  size="md"
                  className="w-full shadow-brand-orange text-xs font-black"
                  onClick={handleNextScenario}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  {currentScenarioIndex < scenarios.length - 1 ? 'Next Investigation Case' : 'View Final Detective Report'}
                </Button>
              </GlassCard>
            )}
          </div>

          {/* Right Column: Simulated Smartphone Shell (7 Cols) */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-sm rounded-[40px] border-4 border-zinc-700/80 bg-[#0C0E12] shadow-2xl p-3.5 relative overflow-hidden text-zinc-100 font-sans">
              {/* Phone Speaker Notch & Camera Island */}
              <div className="w-28 h-4 bg-zinc-900 rounded-full mx-auto mb-2 flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                <div className="w-8 h-1 bg-zinc-800 rounded-full" />
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-zinc-400 px-3 pb-2 border-b border-zinc-800/80 font-numeric">
                <span>{currentScenario.timestamp}</span>
                <span className="font-bold tracking-wider">Airtel 5G</span>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* App Bar (WhatsApp / SMS / UPI style) */}
              <div className="flex items-center justify-between p-2.5 bg-zinc-900/90 rounded-2xl my-2 border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5E1E] to-amber-500 text-black font-black text-xs flex items-center justify-center shadow-sm">
                    {currentScenario.avatarText}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black text-white block leading-tight truncate max-w-[150px]">
                      {currentScenario.senderName}
                    </span>
                    <span className="text-[9px] text-zinc-400 block font-numeric truncate max-w-[150px]">
                      {currentScenario.senderContact}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 font-numeric">
                  {currentScenario.badgeLabel || currentScenario.channel.toUpperCase()}
                </span>
              </div>

              {/* Interactive Message Content Bubble */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 my-3 text-left space-y-3 shadow-inner min-h-[160px]">
                <span className="text-[10px] text-zinc-500 font-bold block font-numeric">
                  Received at {currentScenario.timestamp} • Encrypted Channel
                </span>

                {/* Render Message Body with Interactive Clues */}
                <p className="text-xs text-zinc-200 leading-relaxed">
                  {currentScenario.messageText}
                </p>

                {/* Interactive Clue Buttons under the message */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block font-numeric">
                    Tap Suspicious Elements to Inspect:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentScenario.clues.map((clue) => {
                      const isFound = foundClueIds.includes(clue.id);

                      return (
                        <button
                          key={clue.id}
                          onClick={() => handleTapClue(clue)}
                          className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all cursor-pointer font-bold ${
                            isFound
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                              : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700 hover:border-amber-400/60'
                          }`}
                        >
                          {isFound ? `✓ ${clue.phrase}` : `🔍 "${clue.phrase}"`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              {phase === 'investigating' && (
                <div className="pt-2">
                  <Button
                    variant="orange"
                    size="sm"
                    className="w-full text-xs font-black shadow-brand-orange"
                    onClick={handleProceedToDecision}
                  >
                    Proceed to Containment Decision →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: FINAL INVESTIGATION REPORT */}
      {phase === 'report' && (
        <GlassCard className="p-6 sm:p-10 rounded-3xl border-2 border-[#FF5E1E] text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 text-xs font-black font-numeric shadow-brand-orange">
            <Award className="w-4 h-4 text-amber-400" />
            <span>CASE CLOSED • OFFICIAL CYBERSECURITY DEBRIEF</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
              {calculateFinalReport().detectiveRank}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
              You completed all forensics cases and defended against social engineering attacks.
            </p>
          </div>

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] font-numeric text-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Cases Investigated</span>
              <span className="text-lg sm:text-xl font-black text-white">{calculateFinalReport().casesInvestigated}</span>
            </div>
            <div className="border-l border-[var(--border-primary)]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Scams Neutralized</span>
              <span className="text-lg sm:text-xl font-black text-[#22C55E]">{calculateFinalReport().scamsDetected}</span>
            </div>
            <div className="border-l border-[var(--border-primary)]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Red Flags Discovered</span>
              <span className="text-lg sm:text-xl font-black text-amber-400">{calculateFinalReport().redFlagsFound}</span>
            </div>
            <div className="border-l border-[var(--border-primary)]">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Scam Shield Score</span>
              <span className="text-lg sm:text-xl font-black text-[#FF5E1E]">{calculateFinalReport().scamShieldScore}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="orange"
              size="lg"
              className="shadow-brand-orange text-xs font-black"
              onClick={handleRestart}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Replay Investigations
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="text-xs font-black"
              onClick={onBackToHub}
            >
              Return to Training Deck
            </Button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};

