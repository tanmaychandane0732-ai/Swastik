import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Sparkles, TrendingUp, HelpCircle, ChevronRight, CheckCircle2, Play, User, Award } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { Button } from '../components/ui/Button';
import { TeamLogo } from '../components/common/TeamLogo';

interface LandingPageProps {
  onStartQuest: (name?: string) => void;
  onOpenCertificate?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartQuest, onOpenCertificate }) => {
  const { state } = useGame();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [nameInput, setNameInput] = useState(state.player.name || '');

  const handleStartPlaying = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (nameInput.trim()) {
      onStartQuest(nameInput.trim());
    } else {
      onStartQuest();
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-8 sm:py-16 overflow-hidden">
      {/* Ambient background glows in signature brand orange */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF5E1E]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#FF5E1E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full text-center relative z-10 space-y-8">
        {/* Hackathon Badge & Team Swastik Mark */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121215] border border-[#FF5E1E]/40 text-[#FF5E1E] text-xs font-black shadow-brand-orange">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hack2Ignite Innovation Challenge • Track GD-01</span>
          </div>

          <TeamLogo size="sm" showText={true} />
        </motion.div>

        {/* Hero Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
            FIN<span className="text-[#FF5E1E]">QUEST</span>
          </h1>
          <p className="text-lg sm:text-2xl font-black text-zinc-200 tracking-wide max-w-2xl mx-auto">
            Master Your Money. Outsmart Your Future.
          </p>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            The next-generation interactive financial literacy web game. Experience realistic cashflow choices, conquer predatory debt traps, and intercept digital scams with live tactile feedback.
          </p>
        </motion.div>

        {/* Core Pillars Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-3xl mx-auto text-left"
        >
          <div className="glass-card rounded-2xl p-5 border border-[#27272A] hover:border-[#FF5E1E] transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#FF5E1E]/20 text-[#FF5E1E] flex items-center justify-center mb-3 font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-white mb-1">Level 1: Budget Arena</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Allocate your monthly salary with the 50/30/20 rule using dynamic live sliders.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-[#27272A] hover:border-[#FF5E1E] transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#FF5E1E]/20 text-[#FF5E1E] flex items-center justify-center mb-3 font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-white mb-1">Level 2: Debt Dungeon</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Expose deceptive BNPL promos & calculate exponential compound interest traps.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-[#27272A] hover:border-[#FF5E1E] transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#FF5E1E]/20 text-[#FF5E1E] flex items-center justify-center mb-3 font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-white mb-1">Level 3: Scam Radar</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Inspect suspicious investment offers, tag red flags & build index fund discipline.
            </p>
          </div>
        </motion.div>

        {/* Name Entry & Start Playing Option */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-xl mx-auto space-y-4 pt-2"
        >
          {/* Interactive Start Playing Glass Box */}
          <div className="glass-card rounded-3xl p-5 sm:p-7 border-2 border-[#FF5E1E]/50 shadow-brand-orange space-y-4 text-center">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E1E]/20 text-[#FF5E1E] text-xs font-black font-numeric border border-[#FF5E1E]/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>BEGIN YOUR FINANCIAL FLIGHT</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Enter Your Name to Start Playing
              </h2>
              <p className="text-xs text-zinc-300 max-w-md mx-auto">
                Your name will be personalized across your cockpit telemetry and printed on your official Certificate of Financial Competence.
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
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your full name (e.g. Tanmay Chandane)..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#18181D]/90 border border-[#27272A] text-white text-sm font-bold placeholder-zinc-500 focus:outline-none focus:border-[#FF5E1E] focus:ring-2 focus:ring-[#FF5E1E]/30 transition-all"
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

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 border-t border-[#27272A]">
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

        {/* How It Works Collapsible Drawer */}
        {showHowItWorks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-2xl p-5 sm:p-6 border border-[#27272A] text-left max-w-2xl mx-auto space-y-4 shadow-xl"
          >
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF5E1E]" />
              Game Mechanics & Learning Loops
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span><strong>Persistent Financial HUD:</strong> Every decision dynamically alters your Net Worth, Financial Health Meter (0-100), and Score.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span><strong>Streak Multipliers:</strong> Make consecutive smart financial decisions to unlock up to a 2.0x score multiplier.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                <span><strong>A4 Printable Certificate:</strong> Finish all modules to unlock an official personalized Certificate of Financial Competence with instant name customization.</span>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
};
