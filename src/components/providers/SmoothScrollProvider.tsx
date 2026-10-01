import React, { useEffect, useRef, createContext, useContext } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  stop: () => {},
  start: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * SmoothScrollProvider — wraps the app with Lenis smooth scrolling.
 *
 * Design decisions:
 * - Deceleration of 0.085 produces a cinematic, weighted feel (heavier than default)
 * - Duration of 1.4 gives silky scroll without feeling sluggish
 * - prefers-reduced-motion disables Lenis entirely, keeping native scroll
 * - Lenis is only applied to the page root — modals and drawers use their own native overflow scroll
 *   and are isolated via allowNestedScroll: true and data-lenis-prevent attribute checking
 */
export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect accessibility preference — disable Lenis for reduced motion users
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.8,
      infinite: false,
      allowNestedScroll: true,
      prevent: (node) => {
        if (!node || (node as Node).nodeType !== 1) return false;
        const el = node as Element;
        return Boolean(
          el.hasAttribute('data-lenis-prevent') ||
          el.closest?.('[data-lenis-prevent]') ||
          el.closest?.('.lenis-prevent')
        );
      },
    });

    lenisRef.current = lenis;

    // Use requestAnimationFrame loop to drive Lenis
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const stop = () => {
    lenisRef.current?.stop();
  };

  const start = () => {
    lenisRef.current?.start();
  };

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisRef.current, stop, start }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
