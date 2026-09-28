import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../services/audioService';

export const BackToTop: React.FC = () => {
  const { progress, scrollY } = useScrollProgress();
  const { lenis } = useSmoothScroll();
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';
  const [isHovered, setIsHovered] = useState(false);

  // Appears after scrolling ~20% of the page or past 400px
  const isVisible = progress > 0.18 || scrollY > 400;

  const handleScrollToTop = () => {
    soundManager.playClick();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Circular gauge dimensions (radius 18, circumference ~113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - Math.min(1, Math.max(0, progress)) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 15 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="fixed bottom-22 right-7 z-30 pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Tooltip on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className={`absolute right-full mr-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase whitespace-nowrap pointer-events-none shadow-lg border ${
                  isLight
                    ? 'bg-white text-zinc-800 border-zinc-200'
                    : 'bg-[#12141A] text-zinc-200 border-white/10'
                }`}
              >
                <span>TOP • {Math.round(progress * 100)}%</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleScrollToTop}
            aria-label="Scroll back to top of flight deck"
            title="Return to top"
            className={`relative flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A2A] ${
              isLight
                ? 'bg-white/90 text-zinc-700 hover:text-[#FF6A2A] shadow-[0_4px_16px_rgba(0,0,0,0.12)]'
                : 'bg-[#0E1117]/85 text-zinc-300 hover:text-[#FF6A2A] shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
            } backdrop-blur-md border ${
              isLight ? 'border-black/10' : 'border-white/15'
            }`}
          >
            {/* SVG Circular Scroll Progress Gauge */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 44 44"
            >
              {/* Background track */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke={isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)'}
                strokeWidth="2.5"
              />
              {/* Active animated progress stroke */}
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="#FF6A2A"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-150 ease-out"
              />
            </svg>

            {/* Inner upward arrow icon */}
            <ArrowUp className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
