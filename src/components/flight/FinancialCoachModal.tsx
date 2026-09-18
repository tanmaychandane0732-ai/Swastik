import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Compass,
  Calculator,
  ShieldCheck,
  Lightbulb,
  MessageSquare,
  Send,
  HelpCircle,
} from 'lucide-react';
import { AICoachExplanation } from '../../types/flightSimulator';
import { SimulatorChoice, SimulatorPlayerState } from '../../data/lifeSimulatorScenarios';
import { AIScenarioService } from '../../services/aiScenarioService';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';

interface FinancialCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  choice: SimulatorChoice | null;
  scenarioTitle: string;
  playerState: SimulatorPlayerState;
}

export const FinancialCoachModal: React.FC<FinancialCoachModalProps> = ({
  isOpen,
  onClose,
  choice,
  scenarioTitle,
  playerState,
}) => {
  const [explanation, setExplanation] = useState<AICoachExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [interactiveChat, setInteractiveChat] = useState<{ sender: 'user' | 'coach'; text: string }[]>([]);

  // Load explanation when modal opens
  React.useEffect(() => {
    if (isOpen && choice) {
      setIsLoading(true);
      AIScenarioService.explainDecision(choice, scenarioTitle, playerState)
        .then((result) => {
          setExplanation(result);
          setInteractiveChat([
            {
              sender: 'coach',
              text: `Greetings, Cadet! I'm your Chief Financial Flight Instructor. Let's analyze your decision: "${choice.label}". Notice how every financial choice creates immediate aerodynamic lift or high-APR drag.`,
            },
          ]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setExplanation(null);
      setInteractiveChat([]);
    }
  }, [isOpen, choice, scenarioTitle, playerState]);

  if (!isOpen || !choice) return null;

  const handleQuickQuestion = (qText: string) => {
    setInteractiveChat((prev) => [...prev, { sender: 'user', text: qText }]);

    let reply = '';
    if (qText.includes('safer')) {
      reply = `The safest flight path always prioritizes liquid runway buffer first. If you don't have at least 3 months of emergency fuel (₹75,000+), any unexpected shock forces you into emergency debt.`;
    } else if (qText.includes('math')) {
      reply = explanation?.mathematicalTruth || `Compounding works both ways: Invested money doubles every 6 years at 12% CAGR, while credit card balances double every 2 years at 36-42% APR!`;
    } else {
      reply = explanation?.indianRegulatoryContext || `RBI strictly regulates digital lending and forbids unauthorized apps from harassing contacts. Dial 1930 immediately if you suspect UPI or cyber fraud.`;
    }

    setTimeout(() => {
      setInteractiveChat((prev) => [...prev, { sender: 'coach', text: reply }]);
    }, 400);
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const userText = customQuestion.trim();
    setCustomQuestion('');
    setInteractiveChat((prev) => [...prev, { sender: 'user', text: userText }]);

    setTimeout(() => {
      setInteractiveChat((prev) => [
        ...prev,
        {
          sender: 'coach',
          text: `Great question! In our flight simulator, sound financial navigation means: 1) Keep debt strictly under 30% of income, 2) Automate index fund investments on salary day, and 3) Always treat unverified high-yield promises as social engineering radar decoys.`,
        },
      ]);
    }, 500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <GlassCard className="p-0 rounded-3xl border border-[#27272A] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-[#27272A] flex items-center justify-between gap-3 bg-gradient-to-r from-[#FF5E1E]/15 via-transparent to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF5E1E]/20 border border-[#FF5E1E]/50 flex items-center justify-center text-xl shadow-brand-orange">
                  👨‍✈️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
                      AI Flight Coach
                    </span>
                    <span className="text-xs text-zinc-400 font-bold">FinQuest Mentorship</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Flight Debrief & Consequence Analysis
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-left">
              {isLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-[#FF5E1E] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-zinc-400 font-bold">
                    Chief Flight Instructor is analyzing telemetry and telemetry metrics...
                  </p>
                </div>
              ) : explanation ? (
                <>
                  {/* Executive Headline */}
                  <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF5E1E]">
                      <Compass className="w-4 h-4" />
                      <span>Verdict: {explanation.headline}</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {explanation.whyThisHappened}
                    </p>
                  </div>

                  {/* Mathematical Truth */}
                  <div className="p-4 rounded-2xl bg-[#18181D]/80 border border-[#27272A] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Calculator className="w-4 h-4" />
                      <span>The Mathematical Mechanics</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-numeric">
                      {explanation.mathematicalTruth}
                    </p>
                  </div>

                  {/* Indian Regulatory Context */}
                  <div className="p-4 rounded-2xl bg-[#18181D]/80 border border-[#27272A] space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#22C55E]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Indian Regulatory Reality (RBI / SEBI / Cyber 1930)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {explanation.indianRegulatoryContext}
                    </p>
                  </div>

                  {/* Actionable Advice */}
                  <div className="p-3.5 rounded-xl bg-[#FF5E1E]/10 border border-[#FF5E1E]/30 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-[#FF5E1E] shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-[#FF5E1E] leading-relaxed">
                      Instructor’s Rule: {explanation.coachAdvice}
                    </p>
                  </div>

                  {/* Interactive Q&A Pills */}
                  <div className="space-y-2 pt-2 border-t border-[#27272A]">
                    <span className="text-[11px] font-bold text-zinc-400 block">
                      Ask Instructor a Follow-up:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleQuickQuestion('What was the safer flight path?')}
                        className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold transition-all hover:border-[#FF5E1E]"
                      >
                        🛡️ What was the safer choice?
                      </button>
                      <button
                        onClick={() => handleQuickQuestion('Show real math of this choice')}
                        className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold transition-all hover:border-[#FF5E1E]"
                      >
                        📐 Show compound math
                      </button>
                      <button
                        onClick={() => handleQuickQuestion('What do Indian regulators (RBI/SEBI) say?')}
                        className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold transition-all hover:border-[#FF5E1E]"
                      >
                        🇮🇳 Indian regulations check
                      </button>
                    </div>
                  </div>

                  {/* Chat transcript */}
                  {interactiveChat.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {interactiveChat.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex gap-2 text-xs leading-relaxed ${
                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl ${
                              msg.sender === 'user'
                                ? 'bg-[#FF5E1E] text-white rounded-br-none'
                                : 'bg-[#18181D] text-zinc-200 border border-[#27272A] rounded-bl-none'
                            }`}
                          >
                            <span className="text-[10px] font-bold block opacity-70 mb-0.5">
                              {msg.sender === 'user' ? 'Cadet' : 'Flight Instructor'}
                            </span>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ask custom input */}
                  <form onSubmit={handleSendCustom} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="Ask Chief Instructor anything about this choice..."
                      className="flex-1 bg-[#18181D] border border-[#27272A] focus:border-[#FF5E1E] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                    />
                    <Button
                      type="submit"
                      variant="orange"
                      size="sm"
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      Ask
                    </Button>
                  </form>
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#27272A] flex justify-end">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Resume Flight
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

