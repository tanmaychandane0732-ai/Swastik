import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Lightbulb } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../utils/formatters';

export const FeedbackModal: React.FC = () => {
  const { feedback, hideFeedback } = useGame();
  const { isOpen, title, verdict, headline, financialImpact, whyItHappened, whatYouShouldLearn, didYouKnow } = feedback;

  if (!isOpen) return null;

  const verdictStyles = {
    success: {
      border: 'border-emerald-500/50',
      glow: 'shadow-neon-emerald',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      label: 'Optimal Decision',
    },
    warning: {
      border: 'border-amber-500/50',
      glow: 'shadow-amber-500/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      label: 'Financial Caution',
    },
    danger: {
      border: 'border-rose-500/50',
      glow: 'shadow-neon-rose',
      icon: XCircle,
      iconColor: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      label: 'Financial Danger',
    },
  };

  const currentTheme = verdictStyles[verdict];
  const Icon = currentTheme.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={hideFeedback}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`relative w-full max-w-lg glass-panel rounded-3xl p-5 sm:p-7 border ${currentTheme.border} ${currentTheme.glow} z-10 my-auto shadow-2xl`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-2xl bg-slate-900/90 border border-slate-700/60 ${currentTheme.iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1 ${currentTheme.badgeBg}`}>
                  {currentTheme.label}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {title || 'Financial Assessment'}
                </h3>
              </div>
            </div>
          </div>

          {/* Headline */}
          {headline && (
            <p className="text-slate-200 text-sm sm:text-base font-semibold mb-4 leading-snug">
              {headline}
            </p>
          )}

          {/* Financial Impact Dashboard */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/70 border border-slate-800 mb-5">
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                Net Worth
              </span>
              <span className={`text-xs sm:text-sm font-bold font-numeric ${financialImpact.netWorthDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {financialImpact.netWorthDelta >= 0 ? `+${formatCurrency(financialImpact.netWorthDelta)}` : formatCurrency(financialImpact.netWorthDelta)}
              </span>
            </div>

            <div className="flex flex-col items-center text-center border-x border-slate-800">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                Health
              </span>
              <span className={`text-xs sm:text-sm font-bold font-numeric ${financialImpact.healthDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {financialImpact.healthDelta >= 0 ? `+${financialImpact.healthDelta}` : financialImpact.healthDelta}
              </span>
            </div>

            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                Score
              </span>
              <span className={`text-xs sm:text-sm font-bold font-numeric ${financialImpact.scoreDelta >= 0 ? 'text-fin-emeraldGlow' : 'text-slate-400'}`}>
                {financialImpact.scoreDelta >= 0 ? `+${financialImpact.scoreDelta}` : financialImpact.scoreDelta}
              </span>
            </div>
          </div>

          {/* Why It Happened Section */}
          <div className="space-y-3 mb-6">
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <h4 className="text-xs uppercase font-bold tracking-wider text-indigo-300 mb-1">
                The Mathematical "Why"
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {whyItHappened}
              </p>
            </div>

            {whatYouShouldLearn && (
              <div className="p-3.5 rounded-2xl bg-slate-800/30 border border-slate-800">
                <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-1">
                  Key Takeaway
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {whatYouShouldLearn}
                </p>
              </div>
            )}

            {didYouKnow && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{didYouKnow}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Button
              variant="indigo"
              size="md"
              className="w-full sm:w-auto"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={hideFeedback}
            >
              Continue Quest
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

