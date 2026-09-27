import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  Sparkles,
  Plane,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { ACADEMY_MODULES } from '../data/academyContent';
import { AcademyModule } from '../types/flightSimulator';
import { useGame } from '../contexts/GameContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { TeamLogo } from '../components/common/TeamLogo';
import { soundManager } from '../services/audioService';

export const AcademyPage: React.FC = () => {
  const { dispatch } = useGame();
  const [selectedModuleId, setSelectedModuleId] = useState<string>(ACADEMY_MODULES[0].id);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  const activeModule = ACADEMY_MODULES.find((m) => m.id === selectedModuleId) || ACADEMY_MODULES[0];

  const handleSelectModule = (mod: AcademyModule) => {
    soundManager.playClick();
    setSelectedModuleId(mod.id);
    setSelectedQuizOption(null);
    setIsQuizSubmitted(false);
  };

  const handleQuizSubmit = () => {
    if (selectedQuizOption !== null) {
      if (selectedQuizOption === activeModule.quickCheck.correctIndex) {
        soundManager.playCorrectAnswer();
      } else {
        soundManager.playIncorrectAnswer();
      }
      setIsQuizSubmitted(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 select-none text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card rounded-3xl p-6 border border-white/10 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-telemetry px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              MICRO-LEARNING HUB · 60-SEC CARDS
            </span>
            <span className="label-telemetry px-2 py-0.5 rounded-full bg-white/06 text-zinc-300 border border-white/10">
              FLIGHT ACADEMY
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
            FinQuest Flight Academy
          </h1>
          <p className="text-xs text-[#A7ABB4]">
            Rapid aviation mental models to fly through modern personal finance with zero debt stalls.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <TeamLogo size="sm" showText={true} />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              soundManager.playClick();
              dispatch({ type: 'SET_STAGE', payload: 'dashboard' });
            }}
          >
            Quest Hub
          </Button>
        </div>
      </div>

      {/* Main Academy Grid: Sidebar Modules + Active Lesson Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module Sidebar Navigator */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-zinc-400 block px-1">
            Flight School Flight Modules:
          </span>

          <div className="space-y-2">
            {ACADEMY_MODULES.map((mod) => {
              const isSelected = mod.id === activeModule.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => handleSelectModule(mod)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF5E1E]/20 border-[#FF5E1E] text-white shadow-brand-orange'
                      : 'bg-[#18181D] hover:bg-[#222328] border-[#27272A] text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-numeric">
                      {mod.wing}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1 font-numeric">
                      <Clock className="w-3 h-3" />
                      {mod.readTime}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-black text-white truncate">
                    {mod.title}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Lesson Content Area */}
        <div className="md:col-span-2 space-y-5">
          <GlassCard className="p-6 sm:p-8 rounded-3xl border border-[#27272A] shadow-xl space-y-6">
            {/* Lesson Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27272A] pb-4">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF5E1E]/20 text-[#FF5E1E] border border-[#FF5E1E]/40 font-numeric">
                Wing: {activeModule.wing}
              </span>
              <span className="text-xs text-zinc-400 font-bold flex items-center gap-1 font-numeric">
                <Clock className="w-3.5 h-3.5" />
                {activeModule.readTime} Read
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {activeModule.title}
              </h2>
            </div>

            {/* Aviation Analogy Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF5E1E]/15 via-[#18181D] to-transparent border border-[#FF5E1E]/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF5E1E]">
                <Plane className="w-4 h-4" />
                <span>The Aviation Mental Model</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed italic">
                "{activeModule.aviationAnalogy}"
              </p>
            </div>

            {/* Core Financial Concept */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider font-numeric">
                Core Financial Mechanics
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {activeModule.coreConcept}
              </p>
            </div>

            {/* Practical Action & Pro Tip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#18181D] border border-[#27272A] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#22C55E] block font-numeric">
                  Immediate Flight Action:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-bold">
                  {activeModule.practicalAction}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18181D] border border-amber-500/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-400 block font-numeric">
                  Flight Instructor Pro-Tip:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeModule.proTip}
                </p>
              </div>
            </div>

            {/* Quick Comprehension Check Quiz */}
            <div className="pt-4 border-t border-[#27272A] space-y-3">
              <span className="text-xs font-black text-white uppercase tracking-wider font-numeric flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>60-Second Checkpoint Quiz</span>
              </span>

              <p className="text-xs font-bold text-zinc-200">
                {activeModule.quickCheck.question}
              </p>

              <div className="space-y-2">
                {activeModule.quickCheck.options.map((opt, idx) => {
                  const isSelected = selectedQuizOption === idx;
                  const isCorrect = idx === activeModule.quickCheck.correctIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => !isQuizSubmitted && setSelectedQuizOption(idx)}
                      disabled={isQuizSubmitted}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all ${
                        isQuizSubmitted
                          ? isCorrect
                            ? 'bg-[#22C55E]/15 border-[#22C55E] text-white font-bold'
                            : isSelected
                            ? 'bg-red-500/15 border-red-500 text-white'
                            : 'bg-[#18181D] border-[#27272A] text-zinc-400 opacity-60'
                          : isSelected
                          ? 'bg-[#FF5E1E]/20 border-[#FF5E1E] text-white font-bold'
                          : 'bg-[#18181D] hover:bg-[#222328] border-[#27272A] text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {isQuizSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        )}
                        {isQuizSubmitted && isSelected && !isCorrect && (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!isQuizSubmitted ? (
                <Button
                  variant="orange"
                  size="sm"
                  disabled={selectedQuizOption === null}
                  onClick={handleQuizSubmit}
                >
                  Verify Answer
                </Button>
              ) : (
                <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#22C55E] font-bold">
                  ✓ {activeModule.quickCheck.takeaway}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

