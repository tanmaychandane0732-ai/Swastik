import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { FinQuestInfoPanel } from './FinQuestInfoPanel';
import { useGame } from '../../contexts/GameContext';

export const CursorBuddy: React.FC = () => {
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearby, setIsNearby] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Framer Motion continuous motion values (Zero React re-render overhead on cursor movement)
  const emojiX = useMotionValue(0);
  const emojiY = useMotionValue(0);
  const containerMagneticX = useMotionValue(0);
  const containerMagneticY = useMotionValue(0);
  const proximityProgress = useMotionValue(0);

  // Organic spring physics for smooth, delayed, jitter-free movement
  const smoothEmojiX = useSpring(emojiX, { stiffness: 130, damping: 15, mass: 0.6 });
  const smoothEmojiY = useSpring(emojiY, { stiffness: 130, damping: 15, mass: 0.6 });
  const smoothContainerX = useSpring(containerMagneticX, { stiffness: 190, damping: 20, mass: 0.5 });
  const smoothContainerY = useSpring(containerMagneticY, { stiffness: 190, damping: 20, mass: 0.5 });
  const smoothProximity = useSpring(proximityProgress, { stiffness: 150, damping: 18 });

  // Dynamic transforms derived from smooth spring physics
  const emojiRotate = useTransform(smoothEmojiX, [-18, 18], [-10, 10]);
  const bubbleScale = useTransform(smoothProximity, [0, 1], [1, 1.07]);
  const emojiScale = useTransform(smoothProximity, [0, 1], [1, 1.15]);

  useEffect(() => {
    // Detect mobile touch device
    const touchCheck =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsTouchDevice(touchCheck);

    if (touchCheck) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);

        // 1. Subtle cursor direction tracking (Max 14px displacement)
        // Normalized gaze vector towards cursor
        const maxGaze = 14;
        const screenDiagonal = Math.hypot(window.innerWidth, window.innerHeight);
        const gazeIntensity = Math.min(1, distance / (screenDiagonal * 0.35));

        const angle = Math.atan2(deltaY, deltaX);
        const gazeX = Math.cos(angle) * maxGaze * gazeIntensity;
        const gazeY = Math.sin(angle) * maxGaze * gazeIntensity;

        emojiX.set(gazeX);
        emojiY.set(gazeY);

        // 2. Cursor proximity detection (Within 160px)
        const proximityThreshold = 160;
        if (distance < proximityThreshold) {
          const factor = 1 - distance / proximityThreshold; // 0 to 1 as cursor approaches
          proximityProgress.set(factor);

          // Magnetic attraction of the glass container itself (Max 7px)
          const maxMagnetic = 7;
          containerMagneticX.set(Math.cos(angle) * maxMagnetic * factor);
          containerMagneticY.set(Math.sin(angle) * maxMagnetic * factor);

          if (!isNearby) setIsNearby(true);
        } else {
          proximityProgress.set(0);
          containerMagneticX.set(0);
          containerMagneticY.set(0);

          if (isNearby) setIsNearby(false);
        }
      });
    };

    const handleMouseLeave = () => {
      emojiX.set(0);
      emojiY.set(0);
      containerMagneticX.set(0);
      containerMagneticY.set(0);
      proximityProgress.set(0);
      setIsNearby(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isNearby, emojiX, emojiY, containerMagneticX, containerMagneticY, proximityProgress]);

  const handleClick = () => {
    setIsClicked(true);
    setIsInfoOpen(prev => !prev);
    setTimeout(() => setIsClicked(false), 900);
  };

  // Expression resolution:
  // Normal: 👀 (attentive eyes following your movements)
  // Nearby: 🥹 (pleased/adorable acknowledgment when cursor comes close)
  // Clicked: ✨ (delighted sparkle)
  const currentEmoji = isClicked ? '✨' : isNearby ? '🥹' : '👀';

  return (
    <>
      <div
        ref={containerRef}
        className="fixed bottom-7 right-7 z-30 pointer-events-none select-none"
        aria-label="FinQuest Interactive Companion"
      >
        <motion.div
          style={{
            x: smoothContainerX,
            y: smoothContainerY,
            scale: bubbleScale,
          }}
          animate={
            isTouchDevice
              ? { y: [0, -3, 0] }
              : isClicked
              ? { scale: [1, 1.25, 0.95, 1], rotate: [0, -8, 8, 0] }
              : undefined
          }
          transition={
            isTouchDevice
              ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              : isClicked
              ? { duration: 0.45, ease: 'easeOut' }
              : undefined
          }
          onClick={handleClick}
          className={`pointer-events-auto cursor-pointer relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            isNearby
              ? 'shadow-brand-orange border-white/30'
              : 'hover:border-white/25'
          }`}
        >
          {/* Dynamic Smoked or Crystal Glass Capsule */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: isLight
                ? isNearby
                  ? 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(255, 255, 255, 0.85)'
                : isNearby
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.03) 40%, rgba(0, 0, 0, 0.15) 100%), rgba(16, 18, 24, 0.76)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(0, 0, 0, 0.12) 100%), rgba(14, 16, 21, 0.65)',
              backdropFilter: 'blur(18px) saturate(140%)',
              WebkitBackdropFilter: 'blur(18px) saturate(140%)',
              border: isLight
                ? isNearby
                  ? '1px solid #FF5E1E'
                  : '1px solid rgba(226, 232, 240, 0.9)'
                : isNearby
                ? '1px solid rgba(255, 255, 255, 0.24)'
                : '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: isLight
                ? isNearby
                  ? '0 12px 30px rgba(0, 0, 0, 0.12), 0 0 15px rgba(255, 94, 30, 0.25)'
                  : '0 8px 24px rgba(0, 0, 0, 0.06)'
                : isNearby
                ? '0 16px 50px rgba(0, 0, 0, 0.45), 0 0 25px rgba(255, 94, 30, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.16)'
                : '0 12px 40px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
            }}
          />

          {/* Subtle Ambient Brand Glow when cursor is close */}
          <div
            className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
              isNearby ? 'opacity-100 bg-[#FF5E1E]/15 blur-sm' : 'opacity-0'
            }`}
          />

          {/* Reactive Emoji with delayed magnetic displacement */}
          <motion.span
            style={{
              x: smoothEmojiX,
              y: smoothEmojiY,
              rotate: emojiRotate,
              scale: emojiScale,
            }}
            className="relative z-10 text-xl flex items-center justify-center filter drop-shadow-sm transition-transform"
          >
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
          </motion.span>

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

