import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, Award, ShieldCheck, CheckCircle, Sparkles, Download } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { generateFinancialPersona } from '../../utils/personaGenerator';
import { formatCurrency, formatScore } from '../../utils/formatters';
import { Button } from '../ui/Button';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose }) => {
  const { state } = useGame();
  const { player, score, netWorth, financialHealth, levelScores, badges } = state;

  if (!isOpen) return null;

  const persona = generateFinancialPersona(state);
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const credentialId = `FQ-2026-GD01-${Math.abs(score * 31 + 404).toString(16).toUpperCase().padStart(6, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print-certificate-container">
        {/* Backdrop (hidden on print) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md no-print"
        />

        {/* Modal Certificate Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-4xl z-10 my-auto flex flex-col items-center"
        >
          {/* Top Actions Bar (No-Print) */}
          <div className="w-full flex items-center justify-between gap-3 mb-3 px-2 no-print">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Verified Hack2Ignite GD-01 Competence Credential
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="emerald"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
              >
                Print / Save PDF
              </Button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700/60 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PRINTABLE CERTIFICATE DOCUMENT */}
          <div className="printable-certificate w-full bg-slate-900 border-4 border-double border-amber-400/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-100 relative overflow-hidden select-none">
            {/* Background Guilloche / Watermark Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

            {/* Corner Filigree Borders */}
            <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber-400/80 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber-400/80 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber-400/80 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber-400/80 rounded-br-xl pointer-events-none" />

            {/* Certificate Header */}
            <div className="text-center space-y-2 relative z-10 pb-4 border-b border-slate-700/80">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-bold tracking-widest uppercase">
                Hack2Ignite Innovation Challenge • Track GD-01
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white uppercase mt-1">
                Certificate of Financial Competence
              </h2>
              <p className="text-xs sm:text-sm text-amber-400 font-medium tracking-wide">
                FinQuest Behavioral Economics & Risk Strategy Certification
              </p>
            </div>

            {/* Body Text */}
            <div className="text-center py-6 sm:py-8 space-y-4 relative z-10">
              <p className="text-xs sm:text-sm text-slate-400 font-serif italic">
                This document certifies that
              </p>

              <div className="text-2xl sm:text-4xl font-black text-white tracking-wide border-b-2 border-slate-700 pb-2 inline-block px-8">
                {player.name || 'FinQuester Alex'}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed pt-1">
                has successfully completed all rigorous financial simulations, demonstrating excellence in cashflow budgeting (50/30/20 rule), compound debt avoidance, diversified index investing, and digital scam radar interception.
              </p>

              {/* Awarded Archetype Banner */}
              <div className="inline-flex flex-col items-center p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 shadow-sm mt-2">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-400">
                  Awarded Financial Archetype
                </span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-400 mt-0.5">
                  {persona.title}
                </span>
                <span className="text-xs text-slate-300">
                  {persona.badge}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center relative z-10 mb-6 font-numeric">
              <div className="p-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Final Net Worth</span>
                <span className="text-xs sm:text-sm font-bold text-white">{formatCurrency(netWorth)}</span>
              </div>
              <div className="p-2 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Health Score</span>
                <span className="text-xs sm:text-sm font-bold text-cyan-400">{financialHealth}/100</span>
              </div>
              <div className="p-2 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Score</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400">{formatScore(score)} pts</span>
              </div>
              <div className="p-2 border-l border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Badges Earned</span>
                <span className="text-xs sm:text-sm font-bold text-amber-400">{badges.length} Unlocked</span>
              </div>
            </div>

            {/* Footer / Signatures & Seal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-700/80 relative z-10 text-xs">
              {/* Left Signature */}
              <div className="text-center sm:text-left space-y-1">
                <div className="font-serif italic text-sm text-slate-300">Tanmay Chandane</div>
                <div className="w-32 h-[1px] bg-slate-600 mx-auto sm:mx-0" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  FinQuest Lead Architect
                </span>
              </div>

              {/* Center Official Gold Seal */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 p-0.5 shadow-lg flex items-center justify-center text-slate-950 font-bold">
                <div className="w-full h-full rounded-full border-2 border-dashed border-slate-950/50 flex flex-col items-center justify-center p-1 text-center">
                  <ShieldCheck className="w-4 h-4 text-slate-900" />
                  <span className="text-[7px] font-black uppercase tracking-tighter">VERIFIED</span>
                </div>
              </div>

              {/* Right Verification Code & Date */}
              <div className="text-center sm:text-right space-y-1">
                <span className="font-mono text-[11px] text-indigo-300 font-bold block">
                  ID: {credentialId}
                </span>
                <div className="w-32 h-[1px] bg-slate-600 mx-auto sm:ml-auto sm:mr-0" />
                <span className="text-[10px] text-slate-400 block">
                  Issued: {dateStr}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
