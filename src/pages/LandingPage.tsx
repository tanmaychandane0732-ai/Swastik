import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, Sparkles, TrendingUp, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { Button } from '../components/ui/Button';

interface LandingPageProps {
  onStartQuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartQuest }) => {
  const { dispatch } = useGame();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-8 sm:py-16 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full text-center relative z-10 space-y-8">
        {/* Hackathon Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-neon-indigo"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Hack2Ignite Innovation Challenge • Track GD-01</span>
        </motion.div>

        {/* Hero Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            FIN<span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">QUEST</span>
          </h1>
          <p className="text-lg sm:text-2xl font-semibold text-slate-300 tracking-wide max-w-2xl mx-auto">
            Master Your Money. Outsmart Your Future.
          </p>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
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
          <div className="glass-card rounded-2xl p-4 border border-slate-700/60 hover:border-indigo-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">Level 1: Budget Arena</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Allocate your monthly salary with the 50/30/20 rule using dynamic live sliders.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-700/60 hover:border-rose-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">Level 2: Debt Dungeon</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Expose deceptive BNPL promos & calculate exponential compound interest traps.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-700/60 hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">Level 3: Scam Radar</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect suspicious investment offers, tag red flags & build index fund discipline.
            </p>
          </div>
        </motion.div>

        {/* Primary CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <Button
            variant="emerald"
            size="lg"
            className="w-full sm:w-auto text-base px-8 py-4 shadow-neon-emerald"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
            onClick={onStartQuest}
          >
            START QUEST
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            icon={<HelpCircle className="w-5 h-5 text-indigo-400" />}
            onClick={() => setShowHowItWorks(!showHowItWorks)}
          >
            {showHowItWorks ? 'HIDE OVERVIEW' : 'HOW IT WORKS'}
          </Button>
        </motion.div>

        {/* How It Works Collapsible Drawer */}
        {showHowItWorks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-2xl p-5 sm:p-6 border border-indigo-500/30 text-left max-w-2xl mx-auto space-y-4 shadow-xl"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Game Mechanics & Learning Loops
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Persistent Financial HUD:</strong> Every decision dynamically alters your Net Worth, Financial Health Meter (0-100), and Score.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Streak Multipliers:</strong> Make consecutive smart financial decisions to unlock up to a 2.0x score multiplier.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>The Mathematical "Why":</strong> Detailed feedback overlays explain compound interest curves, APR rates, and scam psychology.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Financial Persona:</strong> Conclude with a customized profile assessing your spending, saving, and risk management strengths.</span>
              </li>
            </ul>
          </motion.div>
        )}

        {/* Footer info */}
        <div className="pt-6 text-xs text-slate-500 flex items-center justify-center gap-4">
          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: 'leaderboard' })}
            className="hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <span>View Hall of Fame</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span>•</span>
          <span>100% Free & Interactive</span>
          <span>•</span>
          <span>No Real Money Required</span>
        </div>
      </div>
    </div>
  );
};
