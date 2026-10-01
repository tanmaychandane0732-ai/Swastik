import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinQuestInfoPanel } from './FinQuestInfoPanel';
import { useGame } from '../../contexts/GameContext';

export const CursorBuddy: React.FC = () => {
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';
  const [isClicked, setIsClicked] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setIsInfoOpen(prev => !prev);
    setTimeout(() => setIsClicked(false), 900);
  };

  const currentEmoji = isClicked ? '✨' : '👀';

  return (
    <>
      <div
        className="fixed bottom-[calc(1.75rem+env(safe-area-inset-bottom,0px))] right-7 z-30 pointer-events-none select-none"
        aria-label="FinQuest Interactive Companion"
      >
        <motion.div
          animate={isClicked ? { scale: [1, 1.25, 0.95, 1], rotate: [0, -8, 8, 0] } : undefined}
          transition={isClicked ? { duration: 0.45, ease: 'easeOut' } : undefined}
          onClick={handleClick}
          className="pointer-events-auto cursor-pointer relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:border-white/25"
        >
          {/* Dynamic Smoked or Crystal Glass Capsule */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: isLight
                ? 'rgba(255, 255, 255, 0.70)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 40%, rgba(0, 0, 0, 0.10) 100%), rgba(15, 18, 24, 0.64)',
              backdropFilter: 'blur(16px) saturate(135%)',
              WebkitBackdropFilter: 'blur(16px) saturate(135%)',
              border: isLight
                ? '1px solid rgba(20, 24, 30, 0.12)'
                : '1px solid rgba(255, 255, 255, 0.10)',
              boxShadow: isLight
                ? '0 8px 24px rgba(20, 24, 30, 0.06)'
                : '0 12px 40px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            }}
          />

          {/* Subtle Ambient Brand Glow */}
          <div className="absolute inset-0 rounded-full opacity-0 pointer-events-none" />

          {/* Emoji */}
          <span className="relative z-10 text-xl flex items-center justify-center filter drop-shadow-sm">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentEmoji}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="inline-block"
              >
                {currentEmoji}
              </motion.span>
            </AnimatePresence>
          </span>

          {/* Subtle Tooltip on Hover */}
          <div className="absolute bottom-full mb-2.5 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-zinc-800 border-zinc-300 bg-white/95 shadow-md' : 'text-zinc-300 border-white/10 bg-[#0C0E12]/80 backdrop-blur-md shadow-lg'} border flex items-center gap-1.5`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E1E] animate-pulse" />
              <span>What is FinQuest? (Click Me)</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FinQuest Mission & Overview Glass Information Panel */}
      <FinQuestInfoPanel
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </>
  );
};
