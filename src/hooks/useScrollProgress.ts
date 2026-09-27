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
 * Utilizes Lenis smooth-scroll instance if available, with a high-performance
 * requestAnimationFrame-throttled window scroll fallback.
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
    // If Lenis is active, bind to its continuous scroll event
    if (lenis) {
      const handleLenisScroll = (e: { progress: number; scroll: number; velocity: number; direction: number }) => {
        setScrollState({
          progress: Math.max(0, Math.min(1, e.progress || 0)),
          scrollY: e.scroll || 0,
          velocity: e.velocity || 0,
          direction: e.direction > 0 ? 1 : e.direction < 0 ? -1 : 0,
        });
      };

      lenis.on('scroll', handleLenisScroll);
      return () => {
        lenis.off('scroll', handleLenisScroll);
      };
    }

    // Fallback: window scroll listener with RAF throttling
    let rafId: number;
    let lastScrollY = window.scrollY;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = Math.max(0, Math.min(1, currentScrollY / maxScroll));
      const velocity = currentScrollY - lastScrollY;
      const direction = velocity > 0 ? 1 : velocity < 0 ? -1 : 0;
      lastScrollY = currentScrollY;

      setScrollState({
        progress,
        scrollY: currentScrollY,
        velocity,
        direction,
      });
    };

    const handleWindowScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScroll);
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    // Initial measurement
    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      cancelAnimationFrame(rafId);
    };
  }, [lenis]);

  return scrollState;
}

