import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Zap,
  Sparkles,
  TrendingUp,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Play,
  User,
  Award,
  Wind,
  Smartphone,
  AlertTriangle,
  RotateCcw,
  Compass,
  Printer,
  Eye,
  Flame,
  Sliders,
  FileText,
  Layers,
  ChevronLeft,
  ChevronDown,
  BarChart3,
  Brain,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Info,
} from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { TeamLogo } from '../components/common/TeamLogo';
import { RiskRadar } from '../components/flight/RiskRadar';
import { RiskRadarMetrics } from '../types/flightSimulator';
import { ScrollReveal } from '../components/environment/ScrollReveal';
import { ExpandableFAQ } from '../components/common/ExpandableFAQ';
import { localAuth } from '../services/localAuth';
import { ScrollFlightSequence } from '../components/flight/ScrollFlightSequence';

interface LandingPageProps {
  onStartQuest: (name?: string) => void;
  onOpenCertificate?: () => void;
  onActiveChapterChange?: (chapterId: string) => void;
  onOpenAuth?: (tab?: 'register' | 'login' | 'guest') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartQuest,
  onOpenCertificate,
  onActiveChapterChange,
  onOpenAuth,
}) => {
  const { state, dispatch } = useGame();
  const isLight = state.settings.theme === 'light';
  const [nameInput, setNameInput] = useState(state.player.name || '');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Active section observer for dynamic scrolling environment
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onActiveChapterChange?.(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0,
      }
    );

    const sectionIds = ['hero', 'diagnostic', 'simulator', 'drills', 'whatif', 'certificate', 'classroom', 'cta'];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [onActiveChapterChange]);

  // Interactive Teaser States for Active Scroll Storytelling
  const [diagSelection, setDiagSelection] = useState<number | null>(null);
  const [simSelectedMonth, setSimSelectedMonth] = useState<number>(1);
  const [radarProfile, setRadarProfile] = useState<'disciplined' | 'vulnerable'>('disciplined');
  const [whatIfHorizon, setWhatIfHorizon] = useState<number>(6);

  const horizontalDeckRef = useRef<HTMLDivElement>(null);

  const handleNameChange = (val: string) => {
    setNameInput(val);
    if (val.trim()) {
      dispatch({ type: 'SET_PLAYER_NAME', payload: val.trim() });
      localAuth.startAsGuest(val.trim());
    }
  };

  const handleStartPlaying = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (nameInput.trim()) {
      localAuth.startAsGuest(nameInput.trim());
      dispatch({ type: 'SET_PLAYER_NAME', payload: nameInput.trim() });
      onStartQuest(nameInput.trim());
    } else {
      if (onOpenAuth) {
        onOpenAuth('guest');
      } else {
        onStartQuest();
      }
    }
  };

  const scrollDeck = (direction: 'left' | 'right') => {
    if (horizontalDeckRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      horizontalDeckRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Sample Interactive Diagnostic Question
  const diagOptions = [
    {
      id: 1,
      title: 'Buy ₹25,000 flagship smartphone on 3-month "No-Cost" EMI',
      tag: 'Predatory Trap',
      scoreImpact: -15,
      iqDelta: 48,
      explanation: 'No-cost EMIs often include hidden processing fees and commit 25% of your discretionary income, increasing vulnerability to month 3 shocks.',
      isOptimal: false,
    },
    {
      id: 2,
      title: 'Park ₹20,000 into a liquid emergency reserve + ₹5,000 index fund',
      tag: 'Optimal Strategy',
      scoreImpact: +25,
      iqDelta: 86,
      explanation: 'Preserves liquidity against unpredictable crosswinds and begins the exponential compounding journey with zero debt commitment.',
      isOptimal: true,
    },
    {
      id: 3,
      title: 'Join a Telegram group promising "200% return in 48 hours"',
      tag: 'Cyber Scam',
      scoreImpact: -30,
      iqDelta: 32,
      explanation: 'High-pressure promises of guaranteed outsized returns are the #1 red flag of advance-fee financial phishing fraud.',
      isOptimal: false,
    },
  ];

  // 6-Month Simulation Scenarios Teaser
  const monthlyScenarios = [
    {
      month: 1,
      title: 'Career Takeoff: ₹60,000 Salary Allocation',
      category: 'Budgeting & Runway',
      description: 'You landed your first product job in Bengaluru. Establish your 50/30/20 baseline allocation before lifestyle creep strikes.',
      netWorth: '₹50,000',
      cash: '₹18,000',
      debt: '₹0',
      creditScore: 680,
    },
    {
      month: 2,
      title: 'The Great Festive Sale: BNPL Siren Song',
      category: 'Debt Trap Detection',
      description: 'Major e-commerce festive deals urge you to take ₹45,000 electronics on zero down-payment. Will you commit your future income?',
      netWorth: '₹62,000',
      cash: '₹14,000',
      debt: '₹15,000',
      creditScore: 695,
    },
    {
      month: 3,
      title: 'Crosswind Turbulence: Sudden Medical Bill',
      category: 'Emergency Liquidity',
      description: 'An emergency dental surgery costs ₹28,000 cash upfront. Having zero emergency reserves forces a high-interest instant app loan.',
      netWorth: '₹48,000',
      cash: '₹6,000',
      debt: '₹22,000',
      creditScore: 660,
    },
    {
      month: 4,
      title: 'Cyber Threat: Suspicious UPI QR Code Alert',
      category: 'Scam Interception',
      description: 'A supposed buyer on OLX sends an "Enter PIN to Receive ₹12,000" QR code. Spot the red flag or forfeit your liquid reserves.',
      netWorth: '₹58,000',
      cash: '₹12,000',
      debt: '₹18,000',
      creditScore: 710,
    },
    {
      month: 5,
      title: 'Mid-Flight Appraisal: The 15% Salary Increment',
      category: 'Compound Growth',
      description: 'Your salary rises to ₹69,000. Do you expand lifestyle spending or accelerate debt repayment and equity index SIPs?',
      netWorth: '₹75,000',
      cash: '₹28,000',
      debt: '₹8,000',
      creditScore: 735,
    },
    {
      month: 6,
      title: 'Touchdown: 6-Month Flight Debrief & Graduation',
      category: 'Financial Resilience',
      description: 'Your flight concludes. Evaluate your Net Worth Delta, Decision DNA Archetype, and claim your verified Certificate of Competence.',
      netWorth: '₹94,000',
      cash: '₹42,000',
      debt: '₹0',
      creditScore: 765,
    },
  ];

  const currentMonthData = monthlyScenarios.find((s) => s.month === simSelectedMonth) || monthlyScenarios[0];

  // Radar Profiles for Teaser
  const disciplinedMetrics: RiskRadarMetrics = {
    debtRisk: 12,
    emergencyVulnerability: 18,
    lifestyleCreep: 25,
    volatilityExposure: 30,
    scamExposure: 10,
    creditFragility: 15,
  };

  const vulnerableMetrics: RiskRadarMetrics = {
    debtRisk: 82,
    emergencyVulnerability: 90,
    lifestyleCreep: 75,
    volatilityExposure: 65,
    scamExposure: 80,
    creditFragility: 88,
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-start items-center px-3 sm:px-6 py-6 sm:py-12 overflow-x-hidden space-y-20 sm:space-y-28">
      {/* Ambient glow orbs — ultra-sheer 1% tint to prevent blocking background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-[#FF6A2A]/[0.015] rounded-full blur-3xl pointer-events-none parallax-slow" />
      <div className="absolute top-[38%] right-8 w-72 h-72 bg-[#FF6A2A]/[0.01] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[72%] left-8 w-72 h-72 bg-[#FF6A2A]/[0.01] rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO SECTION                                                */}
      {/* ========================================================================= */}
      <ScrollReveal variant="hero">
        <section id="hero" className="max-w-5xl mx-auto w-full text-center relative z-10 space-y-7 pt-2">
        {/* Track GD-01 & Team Swastik Mark */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6A2A]/10 border border-[#FF6A2A]/35 text-[#FF6A2A] shadow-[0_0_20px_rgba(255,106,42,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="label-telemetry">Hack2Ignite Innovation Challenge • Track GD-01 (Financial Literacy)</span>
          </div>
          <TeamLogo size="sm" showText={true} />
        </motion.div>


        {/* Hero Title & Aviation Metaphor Pitch */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="heading-hero text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.98]">
            FIN<span className="text-[#FF6A2A]">QUEST</span>
          </h1>
          <p className="font-display text-xl sm:text-3xl font-bold tracking-wide max-w-3xl mx-auto text-[#FF6A2A]">
            ✈️ The Financial Flight Simulator
          </p>
          <blockquote className={`text-sm sm:text-base italic max-w-2xl mx-auto leading-relaxed border-l-2 border-[#FF6A2A] pl-4 py-1.5 ${isLight ? 'text-[#656A73] bg-white/60 rounded-r-xl' : 'text-[#A7ABB4] bg-black/25 rounded-r-xl'}`}>
            "Pilots don't fly passenger planes without thousands of hours in a flight simulator. Why do we let young adults enter the modern economy without a financial flight simulator?"
          </blockquote>
          <p className={`text-sm sm:text-base max-w-xl mx-auto leading-relaxed ${isLight ? 'text-[#656A73]' : 'text-[#A7ABB4]'}`}>
            <strong className={isLight ? 'text-[#17191D]' : 'text-[#F5F3EF]'}>High-stakes financial learning with zero real-world financial risk.</strong>{' '}
            Experience realistic cashflow choices, conquer predatory debt traps, and intercept digital scams with live tactile feedback.
          </p>
        </motion.div>


        {/* Name Input & Start Playing Action Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl mx-auto"
        >
          <div className="glass-card rounded-3xl p-5 sm:p-7 border-2 border-[#FF5E1E]/50 shadow-brand-orange space-y-4 text-center">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E1E]/20 text-[#FF5E1E] text-xs font-black font-numeric border border-[#FF5E1E]/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>PILOT CALL SIGN & ONBOARDING</span>
              </div>
              <h2 className={`font-display text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Enter Your Name to Start Playing
              </h2>
              <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                Your call sign will personalize your cockpit telemetry and be printed on your official Certificate of Financial Competence.
              </p>
            </div>

            <form onSubmit={handleStartPlaying} className="space-y-3">
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4 text-[#FF5E1E]" />
                </div>
                <input
                  type="text"
                  maxLength={32}
                  value={nameInput}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter your full name (e.g. Tanmay Chandane)..."
                  className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm font-bold placeholder-zinc-500 focus:outline-none focus:border-[#FF5E1E] focus:ring-2 focus:ring-[#FF5E1E]/30 transition-all ${
                    isLight ? 'bg-white border-zinc-300 text-zinc-900 shadow-sm' : 'bg-[#18181D]/90 border-[#27272A] text-white'
                  }`}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  type="submit"
                  variant="orange"
                  size="lg"
                  className="w-full sm:flex-1 text-base px-8 py-4 shadow-brand-orange font-black"
                  icon={<Play className="w-5 h-5 fill-current" />}
                  iconPosition="right"
                >
                  START PLAYING
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                  icon={<HelpCircle className="w-5 h-5 text-[#FF5E1E]" />}
                  onClick={() => setShowHowItWorks(!showHowItWorks)}
                >
                  {showHowItWorks ? 'HIDE' : 'HOW IT WORKS'}
                </Button>
              </div>
            </form>

            {/* Quick Pilot Auth Options: Sign In (Create Account) / Log In / Callsign */}
            <div className={`flex flex-wrap items-center justify-center gap-2 pt-1 pb-1 text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              <span className="text-[11px]">Flight Clearance:</span>
              <button
                type="button"
                onClick={() => onOpenAuth?.('register')}
                className="text-[11px] font-bold text-[#FF6A2A] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>✨ Sign In (New Account)</span>
              </button>
              <span className="text-zinc-500 text-[10px]">•</span>
              <button
                type="button"
                onClick={() => onOpenAuth?.('login')}
                className={`text-[11px] font-bold hover:underline cursor-pointer flex items-center gap-1 ${
                  isLight ? 'text-zinc-800' : 'text-zinc-200'
                }`}
              >
                <span>🔑 Log In</span>
              </button>
              <span className="text-zinc-500 text-[10px]">•</span>
              <button
                type="button"
                onClick={() => onOpenAuth?.('guest')}
                className={`text-[11px] font-medium hover:underline cursor-pointer ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}
              >
                <span>Quick Callsign</span>
              </button>
            </div>

            <div className={`flex items-center justify-between text-[11px] pt-3 border-t ${isLight ? 'border-zinc-200 text-zinc-600' : 'border-[#27272A] text-zinc-400'}`}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Printed on Official A4 Certificate</span>
              </span>

              {onOpenCertificate && (
                <button
                  type="button"
                  onClick={onOpenCertificate}
                  className="text-[#FF5E1E] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Preview Certificate →</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Collapsible How It Works Drawer */}
        {showHowItWorks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`glass-card rounded-2xl p-5 sm:p-6 border text-left max-w-2xl mx-auto space-y-4 shadow-xl ${isLight ? 'border-zinc-200' : 'border-[#27272A]'}`}
          >
            <h3 className={`text-base font-black flex items-center gap-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              <Sparkles className="w-4 h-4 text-[#FF5E1E]" />
              The Financial Flight Simulator Architecture
            </h3>
            <ul className={`space-y-2.5 text-xs sm:text-sm ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span><strong>Persistent Financial Cockpit:</strong> Real-time tracking of Net Worth, Cash Runway, Debt Drag, and CIBIL Credit Scores (300-850).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span><strong>Cause → Decision → Consequence:</strong> Taking high-interest BNPL debt locks out cash solutions when month 3 turbulence strikes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span><strong>Measured Financial IQ Delta:</strong> Complete pre-quest and post-quest diagnostics to calculate quantifiable decision gains.</span>
              </li>
            </ul>
          </motion.div>
        )}

        {/* Telemetry Indicator Strip */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-numeric">
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>₹0 Real Money at Risk</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#FF5E1E] bg-[#FF5E1E]/10 px-3 py-1 rounded-full border border-[#FF5E1E]/30">
            <span>6-Month Life Odyssey</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            <span>42% APR Compound Engine</span>
          </div>
          <div className="flex items-center gap-1.5 text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/30">
            <span>CIBIL Score Radar</span>
          </div>
        </div>

        {/* Scroll Down Prompt Indicator */}
        <div className="pt-6 flex flex-col items-center justify-center text-xs font-bold text-zinc-400">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/06 border border-white/12 backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A2A] animate-pulse" />
            <span className="text-[11px] font-numeric tracking-wider uppercase opacity-85">Scroll to explore flight</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#FF6A2A] animate-bounce" />
          </div>
        </div>
        </section>
      </ScrollReveal>

      {/* Typographic narrative moment between Hero & Diagnostic */}
      <div className="py-8 text-center select-none pointer-events-none">
        <p className={`font-display font-black text-xl sm:text-3xl md:text-4xl tracking-[0.25em] uppercase opacity-70 ${
          isLight ? 'text-zinc-400' : 'text-zinc-600'
        }`}>
          DECIDE<span className="text-[#FF6A2A]">.</span> &bull; EXPERIENCE<span className="text-[#00D2FF]">.</span> &bull; LEARN<span className="text-[#22C55E]">.</span>
        </p>
        <p className={`text-xs uppercase tracking-widest mt-2 font-numeric ${
          isLight ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          The Compound Consequence Engine
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. STEP 01 — PRE-FLIGHT FINANCIAL IQ DIAGNOSTIC PREVIEW                   */}
      {/* ========================================================================= */}
      <ScrollReveal
        variant="data"
        chapterBadge={{ number: '02', label: 'COGNITIVE READINESS', accentColor: '#38BDF8' }}
        transitionTagline="Every captain tests baseline systems before clearing the runway"
      >
        <section id="diagnostic" className="max-w-5xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 text-xs font-black font-numeric">
            <Brain className="w-3.5 h-3.5" />
            <span>STEP 01 • PRE-QUEST DIAGNOSTIC</span>
          </div>
          <h2 className={`font-display text-2xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            How Financially Ready Are You?
          </h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Every flight captain takes a pre-flight readiness exam. Try this sample dilemma to see how FinQuest measures your baseline Financial IQ.
          </p>
        </div>

        <GlassCard className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${isLight ? 'border-zinc-200' : 'border-[#27272A]'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-white/10">
            <div>
              <span className="text-xs font-black uppercase text-[#FF5E1E] tracking-wider font-numeric">
                Sample Live Dilemma
              </span>
              <h3 className={`text-base sm:text-lg font-black mt-0.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                You receive an unexpected ₹25,000 festival bonus from your employer. What is your flight plan?
              </h3>
            </div>
            <div className={`p-3 rounded-2xl text-center shrink-0 border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#18181D] border-[#27272A]'}`}>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-numeric">Baseline IQ</span>
              <span className="text-lg font-black text-[#FF5E1E] font-numeric">
                {diagSelection ? (diagOptions.find((o) => o.id === diagSelection)?.iqDelta || 58) : 58}
              </span>
              <span className="text-[10px] text-zinc-500 block">/ 100</span>
            </div>
          </div>

          {/* Interactive Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {diagOptions.map((opt) => {
              const isSelected = diagSelection === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setDiagSelection(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? opt.isOptimal
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-red-500 bg-red-500/10 shadow-md ring-2 ring-red-500/20'
                      : isLight
                      ? 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
                      : 'bg-[#18181D]/80 hover:bg-[#222328] border-[#27272A]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block font-numeric ${
                      opt.isOptimal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {opt.tag}
                    </span>
                    <p className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-zinc-200'}`}>
                      {opt.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-numeric font-bold text-zinc-400 pt-2 border-t border-white/5">
                    <span>{isSelected ? (opt.isOptimal ? '✓ Selected (Optimal)' : '⚠ Selected') : 'Tap to test'}</span>
                    <span className={opt.scoreImpact > 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {opt.scoreImpact > 0 ? `+${opt.scoreImpact}` : opt.scoreImpact} IQ
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Explanation Drawer */}
          {diagSelection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border ${
                diagOptions.find((o) => o.id === diagSelection)?.isOptimal
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/40 text-red-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  <strong>Decision Feedback: </strong>
                  {diagOptions.find((o) => o.id === diagSelection)?.explanation}
                </p>
              </div>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className={`text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Full diagnostic features 12 weighted behavioral questions measuring budgeting, debt resilience, and scam immunity.
            </span>
            <Button
              variant="orange"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 'diagnostic' })}
            >
              Launch Pre-Quest IQ Test
            </Button>
          </div>
        </GlassCard>
        </section>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* 3. STEP 02 — 6-MONTH DYNAMIC FINANCIAL FLIGHT SIMULATOR                   */}
      {/* ========================================================================= */}
      <ScrollReveal
        variant="flight"
        chapterBadge={{ number: '03', label: 'FLIGHT ODYSSEY', accentColor: '#FF6A2A' }}
        transitionTagline="Cascading cashflow calculations across a half-year career flight"
      >
        <section id="simulator" className="max-w-5xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 text-xs font-black font-numeric">
            <Compass className="w-3.5 h-3.5" />
            <span>STEP 02 • THE FLIGHT ODYSSEY</span>
          </div>
          <h2 className={`font-display text-2xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Your Financial Career Odyssey
          </h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Navigate a dynamic 6-month flight. Experience how decisions in Month 1 cascade into debt traps or emergency safety in Month 6.
          </p>
        </div>

        {/* Month Stepper Selector */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3, 4, 5, 6].map((m) => (
            <button
              key={m}
              onClick={() => setSimSelectedMonth(m)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black font-numeric transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                simSelectedMonth === m
                  ? 'bg-[#FF5E1E] text-white shadow-brand-orange scale-105'
                  : isLight
                  ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  : 'bg-[#18181D] text-zinc-400 hover:text-white border border-[#27272A]'
              }`}
            >
              <span>Month {m}</span>
              {m === 6 && <Award className="w-3 h-3 text-amber-300" />}
            </button>
          ))}
        </div>

        {/* Dynamic Scenario Simulator Card */}
        <GlassCard className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${isLight ? 'border-zinc-200' : 'border-[#27272A]'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-white/10">
            <div>
              <span className="text-xs font-black uppercase text-[#FF5E1E] tracking-wider font-numeric">
                Month {currentMonthData.month} • {currentMonthData.category}
              </span>
              <h3 className={`text-lg sm:text-xl font-black mt-0.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                {currentMonthData.title}
              </h3>
              <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                {currentMonthData.description}
              </p>
            </div>

            <Button
              variant="orange"
              size="md"
              className="shrink-0 text-xs font-black"
              icon={<Play className="w-3.5 h-3.5" />}
              iconPosition="right"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 'simulator' })}
            >
              Play Full Odyssey
            </Button>
          </div>

          {/* Telemetry Dashboard Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-numeric">
            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#18181D] border-[#27272A]'}`}>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Flight Net Worth</span>
              <span className="text-sm font-black text-white">{currentMonthData.netWorth}</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#18181D] border-[#27272A]'}`}>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Liquid Runway</span>
              <span className="text-sm font-black text-emerald-400">{currentMonthData.cash}</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#18181D] border-[#27272A]'}`}>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Committed Debt Drag</span>
              <span className={`text-sm font-black ${currentMonthData.debt === '₹0' ? 'text-zinc-400' : 'text-red-400'}`}>
                {currentMonthData.debt}
              </span>
            </div>
            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#18181D] border-[#27272A]'}`}>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">CIBIL Score</span>
              <span className="text-sm font-black text-sky-400">{currentMonthData.creditScore} (Supercruise)</span>
            </div>
          </div>
        </GlassCard>
        </section>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* 4. STEP 03 — COMBAT DRILLS (HORIZONTAL SCROLL DECK)                       */}
      {/* ========================================================================= */}
      <ScrollReveal
        variant="investigation"
        chapterBadge={{ number: '04', label: 'COMBAT DECK', accentColor: '#A855F7' }}
        transitionTagline="Forensic fraud interception, turbulence drills, and real-time Risk Radar"
      >
        <section id="drills" className="max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black font-numeric">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>STEP 03 • COMBAT DRILLS</span>
            </div>
            <h2 className={`font-display text-2xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              Flight Training Deck
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Master forensic cybersecurity against scams, survive sudden crosswind financial turbulence, and monitor real-time Risk Radar exposure.
            </p>
          </div>

          {/* Glide Arrows for Desktop / Tablet */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollDeck('left')}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLight ? 'bg-white border-zinc-300 hover:bg-zinc-100 text-zinc-800' : 'bg-[#18181D] border-[#27272A] hover:bg-[#222328] text-white'
              }`}
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollDeck('right')}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLight ? 'bg-white border-zinc-300 hover:bg-zinc-100 text-zinc-800' : 'bg-[#18181D] border-[#27272A] hover:bg-[#222328] text-white'
              }`}
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Snap Scroll Container */}
        <div
          ref={horizontalDeckRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin select-none"
        >
          {/* Card 1: Scam Detective */}
          <div className="snap-start shrink-0 w-full sm:w-[380px] md:w-[420px]">
            <GlassCard
              hoverEffect={true}
              className={`p-6 rounded-3xl border h-full flex flex-col justify-between space-y-5 transition-all duration-300 ${
                isLight
                  ? 'border-purple-200 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                  : 'border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.35)]'
              }`}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 font-numeric">
                    Forensic Sim
                  </span>
                </div>

                <div>
                  <h3 className={`text-base font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    🚨 Scam Detective
                  </h3>
                  <p className="text-xs text-[#FF5E1E] font-semibold mt-0.5">
                    Fake UPI QR • Urgent KYC Phishing • Instant Loan Traps
                  </p>
                  <p className={`text-xs leading-relaxed mt-2 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Inspect suspicious messages on a realistic smartphone simulator. Tap suspicious text to uncover red flags, trigger containment protocols, and earn your Scam Shield badge under official RBI security guidelines.
                  </p>
                </div>

                <div className={`p-3 rounded-2xl border text-xs font-numeric space-y-1 ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#18181D] border-[#27272A]'}`}>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Scam Shield Rating:</span>
                    <span className="text-emerald-400 font-bold">95/100 (Master Detective)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Red Flags Catalog:</span>
                    <span className="text-amber-400 font-bold">24+ Verified Attack Vectors</span>
                  </div>
                </div>
              </div>

              <Button
                variant="orange"
                size="sm"
                className="w-full text-xs font-black shadow-brand-orange py-3"
                icon={<Play className="w-3.5 h-3.5" />}
                iconPosition="right"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 'scam-detective' })}
              >
                Launch Forensic Investigation
              </Button>
            </GlassCard>
          </div>

          {/* Card 2: Financial Turbulence */}
          <div className="snap-start shrink-0 w-full sm:w-[380px] md:w-[420px]">
            <GlassCard
              hoverEffect={true}
              className={`p-6 rounded-3xl border h-full flex flex-col justify-between space-y-5 transition-all duration-300 ${
                isLight
                  ? 'border-amber-200 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                  : 'border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_35px_rgba(245,158,11,0.35)]'
              }`}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                    <Wind className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-numeric">
                    Cockpit Alarm
                  </span>
                </div>

                <div>
                  <h3 className={`text-base font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    🌪️ Financial Turbulence
                  </h3>
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">
                    Severe Shocks • Cascading Crosswinds • Debt Drag
                  </p>
                  <p className={`text-xs leading-relaxed mt-2 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Experience unexpected cockpit crisis warnings: emergency medical bills, hardware failure, and sudden salary drops. Test whether your cash reserve provides enough lift to avoid a debt stall.
                  </p>
                </div>

                <div className={`p-3 rounded-2xl border text-xs font-numeric space-y-1 ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#18181D] border-[#27272A]'}`}>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Survival Rate:</span>
                    <span className="text-[#FF5E1E] font-bold">84% Safe Landing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Chain Reactions:</span>
                    <span className="text-purple-400 font-bold">Cascading Multi-Month Debt</span>
                  </div>
                </div>
              </div>

              <Button
                variant="orange"
                size="sm"
                className="w-full text-xs font-black shadow-brand-orange py-3"
                icon={<Play className="w-3.5 h-3.5" />}
                iconPosition="right"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 'turbulence' })}
              >
                Enter Turbulence Sim
              </Button>
            </GlassCard>
          </div>

          {/* Card 3: Live Risk Radar */}
          <div className="snap-start shrink-0 w-full sm:w-[380px] md:w-[420px]">
            <GlassCard
              hoverEffect={true}
              className={`p-6 rounded-3xl border h-full flex flex-col justify-between space-y-5 transition-all duration-300 ${
                isLight
                  ? 'border-sky-200 hover:border-sky-400 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]'
                  : 'border-sky-500/40 hover:border-sky-400 hover:shadow-[0_0_35px_rgba(56,189,248,0.35)]'
              }`}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setRadarProfile('disciplined')}
                      className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold font-numeric ${
                        radarProfile === 'disciplined' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      Disciplined
                    </button>
                    <button
                      onClick={() => setRadarProfile('vulnerable')}
                      className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold font-numeric ${
                        radarProfile === 'vulnerable' ? 'bg-red-500 text-white' : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      Trapped
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className={`text-base font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    📡 6-Axis Risk Radar
                  </h3>
                  <p className="text-xs text-sky-400 font-semibold mt-0.5">
                    Debt Drag • Liquidity Void • Lifestyle Creep
                  </p>
                  <div className="flex justify-center py-1">
                    <RiskRadar
                      metrics={radarProfile === 'disciplined' ? disciplinedMetrics : vulnerableMetrics}
                      compact={true}
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-black py-3"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 'simulator' })}
              >
                Inspect Flight Telemetry
              </Button>
            </GlassCard>
          </div>

          {/* Card 4: Decision DNA */}
          <div className="snap-start shrink-0 w-full sm:w-[380px] md:w-[420px]">
            <GlassCard
              hoverEffect={true}
              className={`p-6 rounded-3xl border h-full flex flex-col justify-between space-y-5 transition-all duration-300 ${
                isLight
                  ? 'border-emerald-200 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                  : 'border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.35)]'
              }`}
            >
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 font-numeric">
                    Decision DNA
                  </span>
                </div>

                <div>
                  <h3 className={`text-base font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    🧬 6 Behavioral Archetypes
                  </h3>
                  <p className="text-xs text-purple-400 font-semibold mt-0.5">
                    Objective Analysis • Not a Random Quiz
                  </p>
                  <p className={`text-xs leading-relaxed mt-2 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    FinQuest analyzes your real in-game behavior across patience, debt avoidance, scam alertness, and emergency runway to classify your true pilot instinct:
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold font-numeric">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">🎯 Strategic Captain</span>
                  <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">🛡️ Parachute Holder</span>
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">⚡ Impulsive Flyer</span>
                  <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">📉 Debt Glider</span>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-black py-3"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 'simulator' })}
              >
                Discover Your DNA
              </Button>
            </GlassCard>
          </div>
        </div>
        </section>
      </ScrollReveal>

      {/* Typographic narrative moment before Consequence Engine */}
      <div className="py-8 text-center select-none pointer-events-none">
        <p className={`font-display font-black text-xl sm:text-3xl md:text-4xl tracking-[0.22em] uppercase opacity-75 ${
          isLight ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          EVERY DECISION<span className="text-[#EF4444]">.</span> CHANGES THE FLIGHT<span className="text-[#FF6A2A]">.</span>
        </p>
        <p className={`text-xs uppercase tracking-widest mt-2 font-numeric ${
          isLight ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          The Consequence & Compound Wake Engine
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 5. STEP 04 — CONSEQUENCE & WHAT-IF ENGINE                                  */}
      {/* ========================================================================= */}
      <ScrollReveal
        variant="turbulence"
        chapterBadge={{ number: '05', label: 'CONSEQUENCE ENGINE', accentColor: '#EF4444' }}
        transitionTagline="Observe the compounding aftermath of delayed gratification vs credit traps"
      >
        <section id="whatif" className="max-w-5xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black font-numeric">
            <Sliders className="w-3.5 h-3.5" />
            <span>STEP 04 • WHAT-IF COMPARATOR</span>
          </div>
          <h2 className={`font-display text-2xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Every Decision Leaves a Wake
          </h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Compare two choices over 6 months: Paying cash vs taking a predatory 36% APR credit card EMI.
          </p>
        </div>

        <GlassCard className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${isLight ? 'border-zinc-200' : 'border-[#27272A]'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Path A: Debt & EMI */}
            <div className={`p-5 rounded-2xl border space-y-3 ${isLight ? 'bg-red-50/70 border-red-200' : 'bg-red-950/20 border-red-500/30'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-red-500 font-numeric">Path A: 36% APR Credit EMI</span>
                <span className="text-xs font-bold text-red-400 font-numeric">-₹12,600 Interest</span>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                You bought a ₹30,000 gadget on monthly installments. After 6 months of compounding interest, total cash outflow reached ₹42,600. When medical turbulence struck in Month 3, committed monthly EMIs triggered cash starvation.
              </p>
              <div className="pt-2 border-t border-red-500/20 flex justify-between text-xs font-numeric font-bold">
                <span className="text-zinc-400">Month 6 Runway:</span>
                <span className="text-red-400">₹4,200 (Critical)</span>
              </div>
            </div>

            {/* Path B: Disciplined Cash Reserve */}
            <div className={`p-5 rounded-2xl border space-y-3 ${isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-500 font-numeric">Path B: Delayed Gratification</span>
                <span className="text-xs font-bold text-emerald-400 font-numeric">+₹2,400 SIP Return</span>
              </div>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                You waited 2 months, allocated ₹10,000/mo into liquid savings, and bought the item in cash. Total cost remained exactly ₹30,000. Your CIBIL score climbed into Supercruise territory and medical shocks were absorbed with zero stress.
              </p>
              <div className="pt-2 border-t border-emerald-500/20 flex justify-between text-xs font-numeric font-bold">
                <span className="text-zinc-400">Month 6 Runway:</span>
                <span className="text-emerald-400">₹38,000 (Safe)</span>
              </div>
            </div>
          </div>
        </GlassCard>
        </section>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* FINAL FLIGHT ODYSSEY & TOUCHDOWN — SCROLL-LINKED AIRCRAFT EXPERIENCE      */}
      {/* ========================================================================= */}
      <section id="final-flight-section" className="final-flight-scroll w-full relative space-y-20 sm:space-y-28 pt-8">
        {/* Cinematic Scroll-Linked Aircraft Animation (30 FPS, 240 Frames) */}
        <ScrollFlightSequence isLight={isLight} />

        {/* ========================================================================= */}
        {/* 6. STEP 05 — OFFICIAL A4 PRINTABLE CERTIFICATE PREVIEW                     */}
        {/* ========================================================================= */}
        <ScrollReveal
          variant="graduation"
        chapterBadge={{ number: '06', label: 'COMPETENCE PROOF', accentColor: '#F59E0B' }}
        transitionTagline="Permanent recognized certification backed by decision benchmarks"
      >
        <section id="certificate" className="max-w-5xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 text-xs font-black font-numeric">
            <Award className="w-3.5 h-3.5" />
            <span>STEP 05 • GRADUATION & RECOGNITION</span>
          </div>
          <h2 className={`font-display text-2xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            Official Certificate of Financial Competence
          </h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Complete your flight simulations to claim your personalized, printable A4 certificate inscribed with your call sign and competence badges.
          </p>
        </div>

        {/* Certificate Teaser Visual Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border-2 border-[#FF5E1E]/40 shadow-2xl relative overflow-hidden text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121215] border border-[#FF5E1E]/30 text-[#FF5E1E] text-xs font-black font-numeric">
            <span>OFFICIAL RECOGNITION • HACK2IGNITE TRACK GD-01</span>
          </div>

          <div className="space-y-1">
            <h3 className={`text-lg sm:text-2xl font-black ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              Certificate of Financial Flight Competence
            </h3>
            <p className="text-xs text-[#FF5E1E] font-bold uppercase tracking-widest font-numeric">
              Presented to:
            </p>
            <p className="text-2xl sm:text-4xl font-black text-[#FF5E1E] tracking-tight">
              {nameInput.trim() ? nameInput.trim() : 'Pilot Callsign'}
            </p>
            <p className={`text-xs max-w-md mx-auto leading-relaxed pt-1 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              For demonstrating exemplary mastery in salary cashflow management, credit card interest containment, and cybersecurity scam interception.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-numeric font-bold text-amber-400 flex items-center gap-1.5">
              <span>🛡️ Scam Spotter</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-numeric font-bold text-emerald-400 flex items-center gap-1.5">
              <span>💰 Budget Pilot</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-numeric font-bold text-sky-400 flex items-center gap-1.5">
              <span>📉 Debt Navigator</span>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onOpenCertificate && (
              <Button
                variant="orange"
                size="md"
                className="font-black px-6 py-3 shadow-brand-orange"
                icon={<Printer className="w-4 h-4" />}
                onClick={onOpenCertificate}
              >
                Preview & Print Certificate
              </Button>
            )}
            <Button
              variant="secondary"
              size="md"
              icon={<Play className="w-4 h-4 text-[#FF5E1E]" />}
              onClick={() => handleStartPlaying()}
            >
              Start Flight to Earn Badges
            </Button>
          </div>
        </div>
        </section>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* 7. STEP 06 — EDUCATOR COCKPIT & FLIGHT LEAGUE                             */}
      {/* ========================================================================= */}
      <ScrollReveal
        variant="radar"
        chapterBadge={{ number: '07', label: 'INSTITUTIONAL COCKPIT', accentColor: '#00D2FF' }}
        transitionTagline="Cohort intelligence and systemic failure-trap analytics for educators"
      >
        <section id="classroom" className="max-w-5xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs font-black font-numeric">
            <Layers className="w-3.5 h-3.5" />
            <span>STEP 06 • INSTITUTIONAL COCKPIT</span>
          </div>
          <h2 className={`font-display text-2xl sm:text-4xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
            FinQuest Classroom & Educator Cockpit
          </h2>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
            For high schools, universities, and coaching hubs: monitor cohort failure traps, assign custom scenario packs, and track class resilience.
          </p>
        </div>

        <GlassCard className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-5 ${isLight ? 'border-zinc-200' : 'border-[#27272A]'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#18181D] border-[#27272A]'}`}>
              <div className="text-xs font-black uppercase text-blue-400 font-numeric">Cohort Failure Traps</div>
              <h4 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>68% Fall for No-Cost EMIs</h4>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Educator dashboards highlight systemic traps across student cohorts, enabling targeted classroom interventions.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#18181D] border-[#27272A]'}`}>
              <div className="text-xs font-black uppercase text-emerald-400 font-numeric">Flight League</div>
              <h4 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Competence-Based Ranking</h4>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Students compete not on virtual wealth, but on debt discipline, scam interception speed, and emergency resilience.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#18181D] border-[#27272A]'}`}>
              <div className="text-xs font-black uppercase text-purple-400 font-numeric">B2B2C Scalability</div>
              <h4 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Plug & Play Curriculum</h4>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Aligns directly with NEP 2020 financial literacy mandates for higher secondary and undergraduate institutions.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              variant="secondary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => dispatch({ type: 'SET_STAGE', payload: 'classroom' })}
            >
              Enter Educator Cockpit
            </Button>
          </div>
        </GlassCard>
        </section>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS & PILOT BRIEFING                            */}
      {/* ========================================================================= */}
      <ScrollReveal
        variant="default"
        chapterBadge={{ number: '08', label: 'PILOT BRIEFING', accentColor: '#FF6A2A' }}
        transitionTagline="Curated guidance on simulation mechanics, curriculum design, and certification"
      >
        <section id="faq" className="max-w-4xl mx-auto w-full pt-2 pb-6">
          <ExpandableFAQ />
        </section>
      </ScrollReveal>

      {/* ========================================================================= */}
      {/* 9. FINAL TAKEOFF CALL TO ACTION                                           */}
      {/* ========================================================================= */}
      <ScrollReveal
        variant="hero"
        chapterBadge={{ number: '09', label: 'DEPARTURE CLEARANCE', accentColor: '#22C55E' }}
      >
        <section id="cta" className="max-w-4xl mx-auto w-full text-center space-y-5 pb-8">
          <div className="glass-card rounded-3xl p-8 sm:p-12 border-2 border-[#FF5E1E] shadow-brand-orange space-y-5">
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              Train Before Real Life Makes The Decision For You
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed">
              Zero real-world financial risk. Authentic Indian financial situations. Measurable Financial IQ gains. Begin your flight today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                variant="orange"
                size="lg"
                className="w-full sm:w-auto text-base font-black px-10 py-4 shadow-brand-orange"
                icon={<Play className="w-5 h-5 fill-current" />}
                iconPosition="right"
                onClick={() => handleStartPlaying()}
              >
                LAUNCH FINANCIAL FLIGHT SIMULATOR
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                icon={<Compass className="w-5 h-5 text-[#FF5E1E]" />}
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 'training-deck' })}
              >
                Explore Training Deck
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>
      </section>

      {/* ── Polished Footer Metadata Strip ── */}
      <footer className="w-full max-w-5xl mx-auto pt-4 pb-12 text-center space-y-3 border-t border-white/10 select-none">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-sm tracking-tight text-white">
              FIN<span className="text-[#FF6A2A]">QUEST</span>
            </span>
            <span className="text-[11px] text-[#A7ABB4]">· The Financial Flight Simulator</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-numeric text-[#A7ABB4]">
            <span>Last Updated: <strong className="text-zinc-200">September 2026</strong></span>
            <span>•</span>
            <span>Track: <strong className="text-[#FF6A2A]">GD-01</strong></span>
            <span>•</span>
            <span>Team: <strong className="text-zinc-200">Swastik</strong></span>
          </div>
        </div>

        <p className="text-[11px] text-[#717684] leading-relaxed max-w-2xl mx-auto">
          Built for Hack2Ignite Innovation Challenge GD-01: Financial Literacy Educational Game. Zero real money at risk. Powered by real-time consequence modeling.
        </p>
      </footer>
    </div>
  );
};
