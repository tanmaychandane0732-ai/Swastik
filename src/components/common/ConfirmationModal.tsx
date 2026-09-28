import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  icon,
  onConfirm,
  onCancel,
}) => {
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';

  useEffect(() => {
    if (isOpen) {
      if (variant === 'danger' || variant === 'warning') {
        soundManager.playWarning();
      } else {
        soundManager.playClick();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          soundManager.playClick();
          onCancel();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, variant, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case 'danger':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-sky-400" />;
      case 'warning':
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
  };

  const getAccentBorder = () => {
    switch (variant) {
      case 'danger':
        return 'border-red-500/30';
      case 'info':
        return 'border-sky-500/30';
      case 'warning':
      default:
        return 'border-amber-500/30';
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]';
      case 'info':
        return 'bg-sky-500 hover:bg-sky-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.35)]';
      case 'warning':
      default:
        return 'bg-[#FF6A2A] hover:bg-[#ff7b42] text-white shadow-[0_0_20px_rgba(255,106,42,0.35)]';
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={() => {
            soundManager.playClick();
            onCancel();
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`relative z-10 w-full max-w-md rounded-3xl p-6 sm:p-7 border ${getAccentBorder()} shadow-2xl glass-elevated ${
            isLight
              ? 'text-[#17191D]'
              : 'text-[#F5F5F2]'
          } space-y-5`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
                  variant === 'danger'
                    ? 'bg-red-500/10 border-red-500/25'
                    : variant === 'info'
                    ? 'bg-sky-500/10 border-sky-500/25'
                    : 'bg-amber-500/10 border-amber-500/25'
                }`}
              >
                {renderIcon()}
              </div>
              <div>
                <span className="label-telemetry text-[9px] text-[#A7ABB4]">COCKPIT CONFIRMATION</span>
                <h3 id="modal-title" className="font-display font-bold text-base sm:text-lg tracking-tight">
                  {title}
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                onCancel();
              }}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                isLight ? 'text-zinc-400 hover:text-zinc-700 hover:bg-black/05' : 'text-zinc-400 hover:text-white hover:bg-white/06'
              }`}
              aria-label="Cancel and close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message Body */}
          <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onCancel();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                isLight
                  ? 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  : 'border-white/10 text-zinc-300 hover:bg-white/08 hover:text-white'
              }`}
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onConfirm();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${getConfirmButtonClasses()}`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
