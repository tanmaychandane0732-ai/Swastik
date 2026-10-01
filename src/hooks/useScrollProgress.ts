import { useState, useEffect } from 'react';
import { useSmoothScroll } from '../components/providers/SmoothScrollProvider';

export interface ScrollProgressState {
  /** Normalized scroll progress from 0 to 1 */
  progress: number;
  /** Current scroll Y in pixels */
  scrollY: number;
  /** Scroll velocity in pixels/frame */
  velocity: number;
  /** Direction: 1 for scrolling down, -1 for scrolling up, 0 for still */
  direction: 1 | -1 | 0;
}

/**
 * useScrollProgress — Normalized 0 -> 1 scroll progress tracker.
 *
 * Performance-optimized:
 * - Batched via requestAnimationFrame to prevent React state flood.
 * - Dedupes updates with delta threshold so stationary/micro fluctuations skip re-renders.
 */
export function useScrollProgress(): ScrollProgressState {
  const { lenis } = useSmoothScroll();
  const [scrollState, setScrollState] = useState<ScrollProgressState>({
    progress: 0,
    scrollY: 0,
    velocity: 0,
    direction: 0,
  });

  useEffect(() => {
    let rafId = 0;
    let scheduled = false;
    let nextProgress = 0;
    let nextScrollY = 0;
    let nextVelocity = 0;
    let nextDirection: 1 | -1 | 0 = 0;

    const commitScroll = () => {
      scheduled = false;
      setScrollState((prev) => {
        // Skip state update if values are virtually unchanged
        if (
          Math.abs(prev.progress - nextProgress) < 0.001 &&
          Math.abs(prev.scrollY - nextScrollY) < 1 &&
          prev.direction === nextDirection
        ) {
          return prev;
        }
        return {
          progress: nextProgress,
          scrollY: nextScrollY,
          velocity: nextVelocity,
          direction: nextDirection,
        };
      });
    };

    // If Lenis is active, bind to its continuous scroll event
    if (lenis) {
      const handleLenisScroll = (e: { progress: number; scroll: number; velocity: number; direction: number }) => {
        nextProgress = Math.max(0, Math.min(1, e.progress || 0));
        nextScrollY = e.scroll || 0;
        nextVelocity = e.velocity || 0;
        nextDirection = e.direction > 0 ? 1 : e.direction < 0 ? -1 : 0;

        if (!scheduled) {
          scheduled = true;
          rafId = requestAnimationFrame(commitScroll);
        }
      };

      lenis.on('scroll', handleLenisScroll);
      return () => {
        lenis.off('scroll', handleLenisScroll);
        cancelAnimationFrame(rafId);
      };
    }

    // Fallback: window scroll listener with RAF throttling
    let lastScrollY = window.scrollY;

    const handleWindowScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      nextProgress = Math.max(0, Math.min(1, currentScrollY / maxScroll));
      nextScrollY = currentScrollY;
      nextVelocity = currentScrollY - lastScrollY;
      nextDirection = nextVelocity > 0 ? 1 : nextVelocity < 0 ? -1 : 0;
      lastScrollY = currentScrollY;

      if (!scheduled) {
        scheduled = true;
        rafId = requestAnimationFrame(commitScroll);
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll();

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      cancelAnimationFrame(rafId);
    };
  }, [lenis]);

  return scrollState;
}
