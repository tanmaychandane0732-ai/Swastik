import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
  secondaryColor: string;
}

/**
 * CursorRipple — Cinematic Aeronautical Radar Ping & Cursor Glow Effect
 *
 * Features:
 * - Expanding dual-ring sonar ripple shockwave on every mouse click and touch tap.
 * - Smooth trailing micro-halo that gently expands when hovering clickable controls.
 * - Cockpit flight radar aesthetics matching FinQuest brand orange and aviation cyan.
 * - Zero interference with interactions (pointer-events-none, strictly visual).
 * - Automatic cleanup of ripples with zero memory accumulation.
 * - Automatic mobile touch and reduced-motion adaptation.
 */
export const CursorRipple: React.FC = () => {
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isCursorVisible, setIsCursorVisible] = useState(false);

  // Smooth mouse coordinates for trailing glow
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const smoothX = useSpring(mouseX, { stiffness: 450, damping: 28 });
  const smoothY = useSpring(mouseY, { stiffness: 450, damping: 28 });

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setIsTouchDevice(isTouch);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isCursorVisible) setIsCursorVisible(true);

      // Detect if hovering clickable element for hover scale feedback
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer')
        );
        setIsHoveringClickable(isClickable);
      }
    };

    const handleMouseLeave = () => {
      setIsCursorVisible(false);
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      if (clientX === 0 && clientY === 0) return;

      const newRipple: Ripple = {
        id: Date.now() + Math.random(),
        x: clientX,
        y: clientY,
        color: isLight ? '#EA580C' : '#FF6A2A',
        secondaryColor: isLight ? '#0284C7' : '#00D2FF',
      };

      setRipples((prev) => [...prev.slice(-7), newRipple]);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handlePointerDown, { passive: true });
    window.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isCursorVisible, isLight, mouseX, mouseY]);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── Trailing Ambient Micro-Cursor (Desktop only) ── */}
      {!isTouchDevice && isCursorVisible && !prefersReducedMotion && (
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          className="fixed top-0 left-0 pointer-events-none"
        >
          {/* Subtle cursor follower halo */}
          <motion.div
            animate={{
              scale: isHoveringClickable ? 2.2 : 1,
              opacity: isHoveringClickable ? 0.75 : 0.45,
              borderColor: isHoveringClickable
                ? isLight
                  ? '#EA580C'
                  : '#FF6A2A'
                : isLight
                ? '#0284C7'
                : '#00D2FF',
            }}
            transition={{ duration: 0.2 }}
            className="w-7 h-7 rounded-full border border-current pointer-events-none"
            style={{
              boxShadow: isHoveringClickable
                ? `0 0 14px ${isLight ? 'rgba(234, 88, 12, 0.45)' : 'rgba(255, 106, 42, 0.55)'}`
                : `0 0 8px ${isLight ? 'rgba(2, 132, 199, 0.3)' : 'rgba(0, 210, 255, 0.35)'}`,
            }}
          />

          {/* Central precise dot */}
          <div
            className="w-1.5 h-1.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundColor: isLight ? '#EA580C' : '#FF6A2A',
            }}
          />
        </motion.div>
      )}

      {/* ── Expanding Sonar Radar Ripples on Click / Tap ── */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <React.Fragment key={ripple.id}>
            {/* Primary Sonar Pulse Ring */}
            <motion.div
              initial={{
                scale: 0.15,
                opacity: 0.85,
              }}
              animate={{
                scale: prefersReducedMotion ? 1 : 2.8,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.75,
                ease: [0.16, 1, 0.3, 1],
              }}
              onAnimationComplete={() => removeRipple(ripple.id)}
              style={{
                left: ripple.x,
                top: ripple.y,
                translateX: '-50%',
                translateY: '-50%',
                borderColor: ripple.color,
                boxShadow: `0 0 20px ${ripple.color}80, inset 0 0 12px ${ripple.color}40`,
                background: `radial-gradient(circle, ${ripple.color}25 0%, transparent 70%)`,
              }}
              className="absolute w-24 h-24 rounded-full border-2 pointer-events-none"
            />

            {/* Secondary Harmonic Echo Ring (Aviation Radar Echo) */}
            {!prefersReducedMotion && (
              <motion.div
                initial={{
                  scale: 0.1,
                  opacity: 0.7,
                }}
                animate={{
                  scale: 3.4,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.85,
                  delay: 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  translateX: '-50%',
                  translateY: '-50%',
                  borderColor: ripple.secondaryColor,
                  boxShadow: `0 0 16px ${ripple.secondaryColor}60`,
                }}
                className="absolute w-24 h-24 rounded-full border pointer-events-none"
              />
            )}

            {/* Core Flash Point */}
            <motion.div
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                left: ripple.x,
                top: ripple.y,
                translateX: '-50%',
                translateY: '-50%',
                backgroundColor: ripple.color,
                boxShadow: `0 0 12px ${ripple.color}`,
              }}
              className="absolute w-2.5 h-2.5 rounded-full pointer-events-none"
            />
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};
