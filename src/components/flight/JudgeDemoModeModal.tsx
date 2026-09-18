import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Compass,
  Zap,
  Target,
  CheckCircle2,
  ArrowRight,
  Plane,
  Brain,
  ShieldAlert,
  BarChart3,
  School,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { TeamLogo } from '../common/TeamLogo';

interface JudgeDemoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToStage: (stage: string) => void;
}

export const JudgeDemoModeModal: React.FC<JudgeDemoModeModalProps> = ({
  isOpen,
  onClose,
  onNavigateToStage,
}) => {
  const [activeTab, setActiveTab] = useState<'philosophy' | 'features' | 'tech'>('philosophy');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        >
          <GlassCard className="p-0 rounded-3xl border-2 border-[#FF5E1E] shadow-2xl flex flex-col overflow-hidden text-left">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#27272A] flex items-center justify-between gap-3 bg-gradient-to-r from-[#FF5E1E]/20 via-[#18181D] to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FF5E1E]/20 border border-[#FF5E1E]/50 flex items-center justify-center text-2xl shadow-brand-orange">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#FF5E1E] text-white font-numeric">
                      2-Minute Judge Tour
                    </span>
                    <span className="text-xs text-amber-400 font-bold">Hack2Ignite GD-01</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    FinQuest: The Financial Flight Simulator
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TeamLogo size="sm" showText={false} />
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-[#27272A] px-6 bg-[#18181D]/60 text-xs font-bold font-numeric">
              <button
                onClick={() => setActiveTab('philosophy')}
                className={`py-3 px-4 border-b-2 transition-all ${
                  activeTab === 'philosophy'
                    ? 'border-[#FF5E1E] text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                1. Aviation Philosophy (GD-01)
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`py-3 px-4 border-b-2 transition-all ${
                  activeTab === 'features'
                    ? 'border-[#FF5E1E] text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2. Live Feature Teleportation
              </button>
              <button
                onClick={() => setActiveTab('tech')}
                className={`py-3 px-4 border-b-2 transition-all ${
                  activeTab === 'tech'
                    ? 'border-[#FF5E1E] text-white'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                3. AI Engine & Institutional Impact
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[60vh]">
              {activeTab === 'philosophy' && (
                <div className="space-y-4">
                  {/* Core Pitch Quote */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FF5E1E]/10 border border-[#FF5E1E]/30 space-y-2">
                    <span className="text-[10px] font-black uppercase text-[#FF5E1E] tracking-widest block font-numeric">
                      The Problem Statement Answer
                    </span>
                    <blockquote className="text-sm sm:text-base font-bold text-white italic leading-relaxed">
                      "Pilots don’t fly passenger planes without thousands of hours in a flight simulator. Why do we let young adults enter the modern economy without a financial flight simulator?"
                    </blockquote>
                    <p className="text-xs text-zinc-300">
                      FinQuest provides <span className="text-[#FF5E1E] font-bold">high-stakes financial learning with zero real-world financial risk</span>.
                    </p>
                  </div>

                  {/* 3 Pillars for Judges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-[#FF5E1E]/20 text-[#FF5E1E] flex items-center justify-center font-black text-xs">
                        01
                      </div>
                      <h4 className="text-xs font-black text-white">Empirical Learning</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Pre & Post Financial IQ tests generate a verified <strong>Financial IQ Delta</strong> (+XX% measured gain) proving educational efficacy.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center font-black text-xs">
                        02
                      </div>
                      <h4 className="text-xs font-black text-white">Decision DNA</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Evaluates psychological traits (Patience, Scam Immunity, Debt Discipline) into actionable archetypes rather than boring quizzes.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-1">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-xs">
                        03
                      </div>
                      <h4 className="text-xs font-black text-white">Indian Reality Pack</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Tailored directly to young Indians: UPI QR scams, predatory 7-day loan apps, Telegram crypto pump traps, and Diwali BNPL binges.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-400 block">
                    Click any module below to instantly jump to that live interactive mode:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Launch Simulator */}
                    <button
                      onClick={() => {
                        onNavigateToStage('simulator');
                        onClose();
                      }}
                      className="p-4 rounded-2xl bg-[#18181D] hover:bg-[#222328] border border-[#27272A] hover:border-[#FF5E1E] transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-[#FF5E1E]" />
                          <span className="text-xs font-black text-white">Flight Simulator</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#FF5E1E] transition-colors" />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        6-Month dynamic career flight with live Risk Radar, AI Coach, and What-If engine.
                      </p>
                    </button>

                    {/* Launch IQ Diagnostic */}
                    <button
                      onClick={() => {
                        onNavigateToStage('diagnostic');
                        onClose();
                      }}
                      className="p-4 rounded-2xl bg-[#18181D] hover:bg-[#222328] border border-[#27272A] hover:border-[#22C55E] transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-[#22C55E]" />
                          <span className="text-xs font-black text-white">Financial IQ Test</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#22C55E] transition-colors" />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        7 high-impact scenario diagnostic calculating pre/post learning gains.
                      </p>
                    </button>

                    {/* Launch Academy */}
                    <button
                      onClick={() => {
                        onNavigateToStage('academy');
                        onClose();
                      }}
                      className="p-4 rounded-2xl bg-[#18181D] hover:bg-[#222328] border border-[#27272A] hover:border-amber-400 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Compass className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-black text-white">FinQuest Academy</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        60-second micro-learning cards with aviation analogies and instant quizzes.
                      </p>
                    </button>

                    {/* Launch Educator Cockpit */}
                    <button
                      onClick={() => {
                        onNavigateToStage('classroom');
                        onClose();
                      }}
                      className="p-4 rounded-2xl bg-[#18181D] hover:bg-[#222328] border border-[#27272A] hover:border-blue-400 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-blue-400" />
                          <span className="text-xs font-black text-white">Educator Cockpit</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        B2B2C cohort analytics showing average class IQ Delta and failure heatmaps.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'tech' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-[#FF5E1E]">
                      <Zap className="w-4 h-4" />
                      <span>Gemini AI Engine with Zero-Failure Local Fallback</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Powered by the official Google Gemini API via <code>aiScenarioService.ts</code>. If an API key is absent or offline, an intelligent deterministic local rule engine immediately takes over with authentic RBI, SEBI, and 1930 Cybercrime guidance—ensuring 100% judge uptime without stalls.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-[#22C55E]">
                      <BarChart3 className="w-4 h-4" />
                      <span>Institutional Scalability (B2B2C)</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      FinQuest is designed not just as a standalone consumer game, but as an institutional training tool for colleges, universities, and corporate onboarding cohorts. Teachers track real-time failure traps to target their lectures.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-[#27272A] flex flex-wrap items-center justify-between gap-3 bg-[#18181D]">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ready for live Hack2Ignite evaluation</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="orange"
                  size="sm"
                  onClick={() => {
                    onNavigateToStage('simulator');
                    onClose();
                  }}
                  icon={<Plane className="w-4 h-4 text-white" />}
                >
                  Launch Flight Sim Now
                </Button>
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Close Tour
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

