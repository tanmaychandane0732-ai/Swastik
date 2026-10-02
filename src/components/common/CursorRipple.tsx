import React, { useState, useEffect, useCallback, useRef } from 'react';
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
 * CursorRipple — Cockpit Radar Micro-Reticle & Sonar Shockwave System
 *
 * Architecture:
 * - Zero React re-renders on mousemove: Tracking uses a single requestAnimationFrame
 *   loop and direct DOM ref matrix transformations.
 * - Cockpit Reticle: Precision aviation crosshair halo + micro-pip that trails fluidly
 *   and locks/expands over interactive buttons and links.
 * - Sonar Shockwaves: Triggered on user click/tap, expanding dual-frequency radar waves.
 * - Touch Isolation: On touch/mobile devices (pointer: coarse), the mouse reticle is
 *   completely disabled and only touch ripples activate.
 */
export const CursorRipple: React.FC = () => {
  const { state } = useGame();
  const isLight = state.settings.theme === 'light';

  const [ripples, setRipples] = useState<Ripple[]>([]);
  const haloRef = useRef<HTMLDivElement>(null);
  const pipRef = useRef<HTMLDivElement>(null);

  // Check reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Setup High-Performance RAF Pointer Reticle (Desktop Only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect touch-only devices
    const isTouchOnly = !window.matchMedia('(pointer: fine)').matches;
    if (isTouchOnly) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isVisible = false;
    let isHovering = false;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        currentX = targetX;
        currentY = targetY;
      }

      // Check if hovering over clickable or interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = Boolean(
          target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, [data-interactive="true"]')
        );
        isHovering = interactive;
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
    };

    const handleMouseEnter = () => {
      isVisible = true;
    };

    const renderLoop = () => {
      if (haloRef.current && pipRef.current) {
        if (!isVisible) {
          haloRef.current.style.opacity = '0';
          pipRef.current.style.opacity = '0';
        } else {
          // Smooth spring-like lerp interpolation
          const ease = prefersReducedMotion ? 1 : 0.22;
          currentX += (targetX - currentX) * ease;
          currentY += (targetY - currentY) * ease;

          // Direct style updates avoiding React render cycles
          haloRef.current.style.opacity = isHovering ? '0.9' : '0.45';
          haloRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(${isHovering ? 1.45 : 1})`;
          haloRef.current.style.borderColor = isHovering ? '#FF6A2A' : isLight ? '#0284C7' : '#00D2FF';

          pipRef.current.style.opacity = '0.85';
          pipRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(${isHovering ? 1.25 : 1})`;
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [isLight, prefersReducedMotion]);

  // Handle Sonar Ripple on pointerdown
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
      {/* ── Trailing Cockpit Radar Micro-Reticle (Zero-Rerender RAF) ── */}
      <div
        ref={haloRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '26px',
          height: '26px',
          marginLeft: '-13px',
          marginTop: '-13px',
          borderRadius: '50%',
          borderWidth: '1.5px',
          borderStyle: 'solid',
          borderColor: isLight ? '#0284C7' : '#00D2FF',
          boxShadow: isLight
            ? '0 0 10px rgba(2, 132, 199, 0.35)'
            : '0 0 12px rgba(0, 210, 255, 0.45)',
          opacity: 0,
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          willChange: 'transform, opacity',
          pointerEvents: 'none',
        }}
      >
        {/* Subtle Aviation Crosshair Tick Marks */}
        <span className="absolute top-[-3px] left-[11px] w-[2px] h-[3px] bg-current opacity-60" />
        <span className="absolute bottom-[-3px] left-[11px] w-[2px] h-[3px] bg-current opacity-60" />
        <span className="absolute left-[-3px] top-[11px] h-[2px] w-[3px] bg-current opacity-60" />
        <span className="absolute right-[-3px] top-[11px] h-[2px] w-[3px] bg-current opacity-60" />
      </div>

      {/* Center Precision Pip */}
      <div
        ref={pipRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '5px',
          height: '5px',
          marginLeft: '-2.5px',
          marginTop: '-2.5px',
          borderRadius: '50%',
          backgroundColor: '#FF6A2A',
          boxShadow: '0 0 8px rgba(255, 106, 42, 0.8)',
          opacity: 0,
          willChange: 'transform, opacity',
          pointerEvents: 'none',
        }}
      />

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
