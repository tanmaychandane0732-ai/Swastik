import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
  secondaryColor: string;
}

/**
 * CursorRipple — Aeronautical Click/Tap Sonar Radar Ping
 *
 * Performance-optimized:
 * - Removed mouse pointer that follows cursor all the time (no mousemove tracking, no spring physics).
 * - Sonar ripples trigger strictly on user click/tap.
 * - Completely passive until an interaction occurs (pointer-events-none, zero memory accumulation).
 * - Mobile touch and reduced-motion adaptation.
 */
export const CursorRipple: React.FC = () => {
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';

  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
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

      setRipples((prev) => [...prev.slice(-4), newRipple]);
    };

    window.addEventListener('mousedown', handlePointerDown, { passive: true });
    window.addEventListener('touchstart', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isLight]);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none"
      aria-hidden="true"
    >
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
                scale: prefersReducedMotion ? 1 : 2.5,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              onAnimationComplete={() => removeRipple(ripple.id)}
              style={{
                left: ripple.x,
                top: ripple.y,
                translateX: '-50%',
                translateY: '-50%',
                borderColor: ripple.color,
                boxShadow: `0 0 16px ${ripple.color}80, inset 0 0 10px ${ripple.color}40`,
                background: `radial-gradient(circle, ${ripple.color}25 0%, transparent 70%)`,
              }}
              className="absolute w-20 h-20 rounded-full border-2 pointer-events-none"
            />

            {/* Secondary Harmonic Echo Ring (Aviation Radar Echo) */}
            {!prefersReducedMotion && (
              <motion.div
                initial={{
                  scale: 0.1,
                  opacity: 0.7,
                }}
                animate={{
                  scale: 3.0,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.75,
                  delay: 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  left: ripple.x,
                  top: ripple.y,
                  translateX: '-50%',
                  translateY: '-50%',
                  borderColor: ripple.secondaryColor,
                  boxShadow: `0 0 14px ${ripple.secondaryColor}60`,
                }}
                className="absolute w-20 h-20 rounded-full border pointer-events-none"
              />
            )}

            {/* Core Flash Point */}
            <motion.div
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 2.0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                left: ripple.x,
                top: ripple.y,
                translateX: '-50%',
                translateY: '-50%',
                backgroundColor: ripple.color,
                boxShadow: `0 0 10px ${ripple.color}`,
              }}
              className="absolute w-2 h-2 rounded-full pointer-events-none"
            />
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};
