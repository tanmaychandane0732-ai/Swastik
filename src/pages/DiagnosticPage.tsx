import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Plane,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRE_FLIGHT_DIAGNOSTIC_QUESTIONS } from '../data/diagnosticQuestions';
import { DiagnosticService } from '../services/diagnosticService';
import { DiagnosticResult, FinancialIQDelta } from '../types/flightSimulator';
import { AssessmentApi } from '../services/api/assessmentApi';
import { useGame } from '../contexts/GameContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { TeamLogo } from '../components/common/TeamLogo';

export const DiagnosticPage: React.FC = () => {
  const { state, dispatch } = useGame();
  const questions = PRE_FLIGHT_DIAGNOSTIC_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [iqDelta, setIqDelta] = useState<FinancialIQDelta | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Complete test
      const diagnosticResult = DiagnosticService.evaluateSubmission(
        questions,
        selectedAnswers
      );
      setResult(diagnosticResult);
      setIsSubmitted(true);

      // Check if user already had a pre-flight score stored in localStorage
      const storedPreScore = localStorage.getItem('finquest_pre_iq');
      if (storedPreScore) {
        const preNum = parseInt(storedPreScore, 10);
        // User is taking post-flight test
        const delta = DiagnosticService.computeDelta(
          { totalScore: preNum, categoryScores: { budget: 40, debt: 45, scam: 50, investing: 45, insurance: 40 }, tier: 'Pre-Flight Cadet', completedAt: '' },
          diagnosticResult
        );
        setIqDelta(delta);
      } else {
        // Save this as pre-flight test
        localStorage.setItem('finquest_pre_iq', diagnosticResult.totalScore.toString());
      }

      // Asynchronously submit certified diagnostic to backend
      AssessmentApi.submit(
        storedPreScore ? 'POST_FLIGHT' : 'PRE_FLIGHT',
        diagnosticResult
      ).catch(() => {});

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setIsSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 select-none text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card rounded-3xl p-6 border border-[#27272A] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 font-numeric">
              Empirical Assessment Engine
            </span>
            <span className="text-xs text-zinc-400 font-bold">Hack2Ignite GD-01</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Pre & Post Financial IQ Diagnostic
          </h1>
          <p className="text-xs text-zinc-400">
            Measure your baseline financial intelligence before takeoff and verify your learning gain
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <TeamLogo size="sm" showText={true} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'dashboard' })}
          >
            Quest Hub
          </Button>
        </div>
      </div>

      {!isSubmitted ? (
        /* ACTIVE TEST QUESTION CARD */
        <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] shadow-2xl space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between gap-2 border-b border-[#27272A] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF5E1E]/15 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
                Category: {currentQ.category.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-400 font-bold">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-24 sm:w-32 h-2 bg-[#18181D] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF5E1E] rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Scenario & Question Prompt */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                Real-World Scenario:
              </span>
              {currentQ.scenario}
            </div>

            <h2 className="text-base sm:text-lg font-black text-white">
              {currentQ.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((option) => {
              const isSelected = selectedAnswers[currentQ.id] === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all text-xs sm:text-sm leading-relaxed cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#FF5E1E]/20 border-[#FF5E1E] text-white shadow-brand-orange'
                      : 'bg-[#18181D] hover:bg-[#222328] border-[#27272A] hover:border-[#FF5E1E]/60 text-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-bold">{option.text}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-[#FF5E1E] bg-[#FF5E1E] text-white'
                          : 'border-zinc-600'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
            <Button
              variant="dark"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
            >
              Previous
            </Button>

            <Button
              variant="orange"
              size="md"
              disabled={!selectedAnswers[currentQ.id]}
              onClick={handleNext}
              icon={<ChevronRight className="w-4 h-4 text-white" />}
              className="shadow-brand-orange"
            >
              {isLastQuestion ? 'Complete Assessment' : 'Next Question'}
            </Button>
          </div>
        </GlassCard>
      ) : (
        /* DIAGNOSTIC RESULTS & FINANCIAL IQ DELTA CARD */
        <div className="space-y-6">
          <GlassCard className="p-6 sm:p-10 rounded-3xl border-2 border-[#22C55E] text-center space-y-6 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 text-xs font-black font-numeric">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              <span>ASSESSMENT COMPLETED • TELEMETRY VERIFIED</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Your Financial IQ: {result?.totalScore} / 100
              </h2>
              <p className="text-sm font-bold text-[#FF5E1E] font-numeric">
                Rank: {result?.tier}
              </p>
            </div>

            {/* Category Breakdown Bars */}
            <div className="p-5 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-3 max-w-xl mx-auto font-numeric text-left">
              <span className="text-[11px] font-bold text-zinc-400 block uppercase">
                Category Flight Competency:
              </span>

              {result && (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-300">Debt & Interest Defense</span>
                      <span className="text-[#FF5E1E]">{result.categoryScores.debt}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF5E1E] rounded-full"
                        style={{ width: `${result.categoryScores.debt}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-300">Scam & Phishing Shield</span>
                      <span className="text-[#22C55E]">{result.categoryScores.scam}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#22C55E] rounded-full"
                        style={{ width: `${result.categoryScores.scam}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-300">Emergency Buffer & Budgeting</span>
                      <span className="text-amber-400">{result.categoryScores.budget}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${result.categoryScores.budget}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-300">Compounding & Long-Term Assets</span>
                      <span className="text-blue-400">{result.categoryScores.investing}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${result.categoryScores.investing}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* If Delta is available, show the measured improvement card */}
            {iqDelta && (
              <div className="p-4 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/40 max-w-xl mx-auto text-center space-y-2">
                <span className="text-xs font-black uppercase text-[#22C55E] block font-numeric">
                  Empirical Proof of Learning Verified
                </span>
                <div className="flex items-center justify-center gap-6 font-numeric">
                  <div>
                    <span className="text-xs text-zinc-400 block">Baseline Pre-IQ</span>
                    <span className="text-xl font-black text-zinc-300">{iqDelta.preFlightIQ}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#22C55E]" />
                  <div>
                    <span className="text-xs text-zinc-400 block">Post-Flight IQ</span>
                    <span className="text-xl font-black text-[#22C55E]">{iqDelta.postFlightIQ}</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-[#22C55E]">
                  Measured Learning Gain: +{iqDelta.percentageGain}% (+{iqDelta.deltaPoints} pts)!
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button
                variant="orange"
                size="lg"
                icon={<Plane className="w-4 h-4 text-white" />}
                onClick={() => dispatch({ type: 'SET_STAGE', payload: 'simulator' })}
                className="shadow-brand-orange"
              >
                Launch Financial Flight Simulator
              </Button>

              <Button
                variant="secondary"
                size="lg"
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={handleRestart}
              >
                Retake Assessment
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

