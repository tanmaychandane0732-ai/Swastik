import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, ShieldCheck, Sparkles, Edit3, Check, User } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { generateFinancialPersona } from '../../utils/personaGenerator';
import { formatCurrency, formatScore } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { TeamLogo } from '../common/TeamLogo';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useGame();
  const { player, score, netWorth, financialHealth, badges } = state;

  const [customName, setCustomName] = useState(player.name || '');
  const [isEditingInline, setIsEditingInline] = useState(false);

  useEffect(() => {
    if (player.name) {
      setCustomName(player.name);
    }
  }, [player.name, isOpen]);

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

  const handleNameChange = (newName: string) => {
    setCustomName(newName);
    dispatch({ type: 'SET_PLAYER_NAME', payload: newName });
  };

  const displayName = customName.trim() || player.name || 'FinQuest Pilot';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print-certificate-container">
        {/* Backdrop (hidden during print) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md no-print"
        />

        {/* Modal Certificate Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-4xl z-10 my-auto flex flex-col items-center"
        >
          {/* Top Actions Bar (No-Print) */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3 px-3 no-print bg-[#121215] border border-[#27272A] p-3 rounded-2xl shadow-xl">
            {/* Enter Your Name Interactive Input Option */}
            <div className="flex-1 flex items-center gap-3">
              <label htmlFor="certificateNameInput" className="text-xs font-extrabold uppercase tracking-wider text-[#FF5E1E] shrink-0 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Name on Certificate:</span>
              </label>

              <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4 text-[#FF5E1E]" />
                </div>
                <input
                  id="certificateNameInput"
                  type="text"
                  maxLength={32}
                  placeholder="Enter recipient full name..."
                  value={customName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-[#18181D] text-white placeholder-zinc-500 border border-[#27272A] focus:outline-none focus:border-[#FF5E1E] transition-all"
                />
              </div>
            </div>

            {/* Print and Close Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="orange"
                size="sm"
                className="shadow-brand-orange"
                icon={<Printer className="w-4 h-4" />}
                onClick={handlePrint}
              >
                Print / Save PDF
              </Button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white bg-[#18181D] border border-[#27272A] hover:border-[#FF5E1E] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PRINTABLE CERTIFICATE DOCUMENT */}
          <div className="printable-certificate w-full bg-[#121215] border-4 border-double border-[#FF5E1E] rounded-3xl p-6 sm:p-10 shadow-2xl text-white relative overflow-hidden select-none">
            {/* Background Guilloche Watermark Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#FF5E1E_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

            {/* Corner Industrial Brackets */}
            <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-[#FF5E1E] rounded-tl-xl pointer-events-none" />
            <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-[#FF5E1E] rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-[#FF5E1E] rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-[#FF5E1E] rounded-br-xl pointer-events-none" />

            {/* Certificate Header */}
            <div className="text-center space-y-2 relative z-10 pb-5 border-b border-[#27272A]">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF5E1E]/15 border border-[#FF5E1E]/40 text-[#FF5E1E] text-xs font-extrabold tracking-widest uppercase shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hack2Ignite Innovation Challenge • Track GD-01</span>
                </div>
                <TeamLogo size="xs" showText={true} />
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase mt-1">
                Certificate of Financial Competence
              </h2>
              <p className="text-xs sm:text-sm text-[#FF5E1E] font-bold tracking-wide">
                FinQuest Behavioral Economics, Capital Allocation & Scam Defense Protocol
              </p>
            </div>

            {/* Body Content */}
            <div className="text-center py-6 sm:py-8 space-y-4 relative z-10">
              <p className="text-xs sm:text-sm text-zinc-400 font-serif italic">
                This official credential proudly certifies that
              </p>

              {/* Recipient Name Area with Avatar & Online Dot */}
              <div className="relative inline-flex items-center justify-center gap-3 border-b-2 border-[#FF5E1E] pb-2 px-6 sm:px-12">
                <div className="relative w-9 h-9 rounded-full bg-[#FF5E1E] text-white flex items-center justify-center font-black text-sm shadow-md">
                  {displayName.charAt(0).toUpperCase()}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#121215]" />
                </div>

                <div className="text-2xl sm:text-4xl font-black text-white tracking-wide certificate-recipient-name">
                  {displayName}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed pt-1">
                has demonstrated exceptional command over personal financial dynamics, mastering the 50/30/20 cashflow allocation standard, compounding debt avoidance, disciplined broad-market index investing, and digital scam radar interception.
              </p>

              {/* Awarded Archetype Banner */}
              <div className="inline-flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-[#18181D] border border-[#FF5E1E]/40 shadow-sm mt-2">
                <span className="text-[10px] uppercase tracking-widest font-black text-[#FF5E1E]">
                  Awarded Financial Archetype
                </span>
                <span className="text-base sm:text-lg font-black text-white mt-0.5">
                  {persona.title}
                </span>
                <span className="text-xs text-zinc-400">
                  {persona.badge}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 rounded-2xl bg-[#18181D] border border-[#27272A] text-center relative z-10 mb-6 font-numeric">
              <div className="p-2">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Final Net Worth</span>
                <span className="text-xs sm:text-sm font-black text-white">{formatCurrency(netWorth)}</span>
              </div>
              <div className="p-2 border-l border-[#27272A]">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Health Score</span>
                <span className="text-xs sm:text-sm font-black text-[#FF5E1E]">{financialHealth}/100</span>
              </div>
              <div className="p-2 border-l border-[#27272A]">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Total Score</span>
                <span className="text-xs sm:text-sm font-black text-[#22C55E]">{formatScore(score)} pts</span>
              </div>
              <div className="p-2 border-l border-[#27272A]">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Badges Earned</span>
                <span className="text-xs sm:text-sm font-black text-amber-400">{badges.length} Unlocked</span>
              </div>
            </div>

            {/* Footer / Signatures & Seal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-[#27272A] relative z-10 text-xs">
              {/* Left Signature */}
              <div className="text-center sm:text-left space-y-1">
                <div className="font-serif italic text-sm text-zinc-200">Tanmay Chandane</div>
                <div className="w-32 h-[1px] bg-zinc-600 mx-auto sm:mx-0" />
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">
                  FinQuest Lead Architect
                </span>
              </div>

              {/* Center Official Gold/Orange Seal & Team Swastik Accreditation */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF5E1E] via-amber-400 to-[#FF5E1E] p-0.5 shadow-lg flex items-center justify-center text-[#0A0A0C] font-bold">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-[#0A0A0C]/50 flex flex-col items-center justify-center p-1 text-center bg-[#FF5E1E]">
                    <ShieldCheck className="w-5 h-5 text-white" />
                    <span className="text-[7px] font-black uppercase tracking-tighter text-white">VERIFIED</span>
                  </div>
                </div>

                <div className="hidden sm:block border-l border-[#27272A] pl-3 text-left">
                  <TeamLogo size="xs" showText={true} />
                </div>
              </div>

              {/* Right Verification Code & Date */}
              <div className="text-center sm:text-right space-y-1">
                <span className="font-mono text-[11px] text-[#FF6A2A] font-black block">
                  ID: {credentialId}
                </span>
                <div className="w-32 h-[1px] bg-zinc-600 mx-auto sm:ml-auto sm:mr-0" />
                <span className="text-[10px] text-zinc-400 block font-medium">
                  Issued: {dateStr}
                </span>
              </div>
            </div>

            {/* Compliance & Educational Milestones Disclaimer */}
            <p className="text-[9px] text-[#A7ABB4] text-center pt-2 border-t border-white/06">
              Official FinQuest GD-01 Learning Record · Complete simulation milestones to earn and verify · Not an accredited statutory or regulatory certification
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
