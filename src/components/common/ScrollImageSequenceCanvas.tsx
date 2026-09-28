import React, { useEffect, useRef, useCallback } from 'react';
import { useSmoothScroll } from '../providers/SmoothScrollProvider';

interface ScrollImageSequenceCanvasProps {
  isLight?: boolean;
}

const TOTAL_FRAMES = 300;
const INITIAL_PRELOAD_COUNT = 15;
const BATCH_SIZE = 10;
const BATCH_INTERVAL_MS = 60;

/**
 * ScrollImageSequenceCanvas — Cinematic Apple-Style Scroll-Linked Image Sequence
 *
 * Core Capabilities:
 * - Full-screen sticky/fixed HTML5 Canvas pinned behind the hero & landing page.
 * - 100% driven by scroll progress (0% scroll -> frame 1, 100% scroll -> end of website).
 * - Progressive frame preloading with immediate priority for frame 0 and surrounding buffer.
 * - Persistent requestAnimationFrame loop with smooth interpolation / lerp (0.085 factor).
 * - Automatic nearest-frame fallback so the canvas NEVER freezes, flashes, or gets stuck.
 * - Full Retina / DPR support (sharp up to 4K displays).
 * - Object-fit cover algorithm for zero distortion on mobile, tablet, and ultra-wide screens.
 * - Zero Layout Shift (CLS = 0) with pointer-events-none (never blocks clicks/inputs).
 * - Deep gold & dark luxury aesthetic with seamless edge vignette into #0A0C0F.
 * - Accessibility-ready: respects prefers-reduced-motion.
 */
export const ScrollImageSequenceCanvas: React.FC<ScrollImageSequenceCanvasProps> = ({
  isLight = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { lenis } = useSmoothScroll();

  // Frame caches
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadedRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
  const isPreloadingRef = useRef<boolean>(false);

  // Animation & Interpolation tracking
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const lastRenderedIndexRef = useRef<number>(-1);
  const rafIdRef = useRef<number>(0);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Frame path generator
  const getFrameSrc = useCallback((index: number) => {
    const padded = String(Math.max(0, Math.min(TOTAL_FRAMES - 1, index))).padStart(3, '0');
    return `/media/frames/frame_${padded}.webp`;
  }, []);

  // Preload a single frame
  const preloadFrame = useCallback(
    (index: number, onLoaded?: () => void) => {
      if (index < 0 || index >= TOTAL_FRAMES) return;
      if (loadedRef.current[index] && imagesRef.current[index]) {
        onLoaded?.();
        return;
      }
      if (imagesRef.current[index]) return; // currently loading

      const img = new Image();
      img.src = getFrameSrc(index);
      img.onload = () => {
        loadedRef.current[index] = true;
        imagesRef.current[index] = img;
        onLoaded?.();
      };
      img.onerror = () => {
        // Retry once after brief delay if network glitched
        setTimeout(() => {
          if (!loadedRef.current[index]) {
            const retryImg = new Image();
            retryImg.src = getFrameSrc(index);
            retryImg.onload = () => {
              loadedRef.current[index] = true;
              imagesRef.current[index] = retryImg;
              onLoaded?.();
            };
          }
        }, 1500);
      };
      imagesRef.current[index] = img;
    },
    [getFrameSrc]
  );

  // Find nearest loaded frame to prevent black frames or freezing
  const getNearestLoadedFrame = useCallback((index: number): HTMLImageElement | null => {
    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
    if (loadedRef.current[clamped] && imagesRef.current[clamped]) {
      return imagesRef.current[clamped];
    }
    // Search outwards from target
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const down = clamped - offset;
      if (down >= 0 && loadedRef.current[down] && imagesRef.current[down]) {
        return imagesRef.current[down];
      }
      const up = clamped + offset;
      if (up < TOTAL_FRAMES && loadedRef.current[up] && imagesRef.current[up]) {
        return imagesRef.current[up];
      }
    }
    return null;
  }, []);

  // Draw frame on canvas with responsive cover scaling & luxury vignette
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = getNearestLoadedFrame(frameIndex);
      if (!img) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Ensure canvas internal resolution matches device pixel ratio
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = img.naturalWidth || 800;
      const imgHeight = img.naturalHeight || 450;

      // Aspect-ratio cover math: no stretching, perfect center crop
      const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;
      const offsetX = (canvasWidth - drawWidth) / 2;
      const offsetY = (canvasHeight - drawHeight) / 2;

      // Draw active frame image
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // ── Deep Gold & Dark Luxury Vignette Overlay ─────────────────────────
      // Seamlessly feathers canvas boundary into FinQuest obsidian background
      const maxDim = Math.max(canvasWidth, canvasHeight);
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      const radialGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        maxDim * 0.2,
        centerX,
        centerY,
        maxDim * 0.72
      );

      if (isLight) {
        radialGrad.addColorStop(0, 'rgba(244, 241, 236, 0.15)');
        radialGrad.addColorStop(0.5, 'rgba(244, 241, 236, 0.45)');
        radialGrad.addColorStop(0.85, 'rgba(244, 241, 236, 0.88)');
        radialGrad.addColorStop(1, '#F4F1EC');
      } else {
        radialGrad.addColorStop(0, 'rgba(10, 12, 15, 0.22)');
        radialGrad.addColorStop(0.5, 'rgba(10, 12, 15, 0.55)');
        radialGrad.addColorStop(0.82, 'rgba(10, 12, 15, 0.88)');
        radialGrad.addColorStop(1, '#0A0C0F');
      }

      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Subtle warm gold / amber atmospheric tint (luxury aesthetic)
      const linearGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      if (isLight) {
        linearGrad.addColorStop(0, 'rgba(255, 235, 204, 0.10)');
        linearGrad.addColorStop(1, 'rgba(244, 241, 236, 0.65)');
      } else {
        linearGrad.addColorStop(0, 'rgba(255, 170, 42, 0.04)');
        linearGrad.addColorStop(0.5, 'rgba(10, 12, 15, 0.25)');
        linearGrad.addColorStop(1, 'rgba(10, 12, 15, 0.60)');
      }

      ctx.fillStyle = linearGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      lastRenderedIndexRef.current = frameIndex;
    },
    [getNearestLoadedFrame, isLight]
  );

  // Progressive background preloader
  useEffect(() => {
    if (isPreloadingRef.current) return;
    isPreloadingRef.current = true;

    // 1. Immediately preload frame 0 and first batch for instant initial paint
    for (let i = 0; i < INITIAL_PRELOAD_COUNT; i++) {
      preloadFrame(i, () => {
        if (i === 0) {
          drawFrame(0);
        }
      });
    }

    // 2. Progressively preload remaining frames in non-blocking batches
    let currentBatchStart = INITIAL_PRELOAD_COUNT;
    let timerId: ReturnType<typeof setTimeout>;

    const loadNextBatch = () => {
      if (currentBatchStart >= TOTAL_FRAMES) return;

      const batchEnd = Math.min(TOTAL_FRAMES, currentBatchStart + BATCH_SIZE);
      for (let i = currentBatchStart; i < batchEnd; i++) {
        preloadFrame(i);
      }
      currentBatchStart = batchEnd;

      if (currentBatchStart < TOTAL_FRAMES) {
        timerId = setTimeout(loadNextBatch, BATCH_INTERVAL_MS);
      }
    };

    timerId = setTimeout(loadNextBatch, 150);

    return () => {
      clearTimeout(timerId);
    };
  }, [preloadFrame, drawFrame]);

  // Recalculate scroll target continuously
  const updateScrollProgress = useCallback(() => {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

    // Map 0% scroll -> frame 1 (index 0), 100% scroll -> frame 300 (index 299)
    const newTarget = progress * (TOTAL_FRAMES - 1);
    targetFrameRef.current = newTarget;

    // Smoothly crossfade out the old green forest background when entering the final flight section
    const finalSection = document.getElementById('final-flight-section') || document.getElementById('certificate');
    if (finalSection && canvasRef.current) {
      const rect = finalSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollStart = rect.top + scrollY - windowHeight * 0.8;
      const scrollEnd = document.documentElement.scrollHeight - windowHeight;

      if (scrollY >= scrollStart) {
        const rawProgress = (scrollY - scrollStart) / Math.max(1, scrollEnd - scrollStart);
        const sectionProgress = Math.min(1, Math.max(0, rawProgress));
        // Crossfade over the first 14% of the final section
        const crossfade = Math.min(1, Math.max(0, sectionProgress / 0.14));
        canvasRef.current.style.opacity = String(Math.max(0, 1 - crossfade));
      } else {
        canvasRef.current.style.opacity = '1';
      }
    }

    // Dynamically prioritize preloading a buffer window around current target frame
    const centerIndex = Math.round(newTarget);
    for (let i = Math.max(0, centerIndex - 8); i <= Math.min(TOTAL_FRAMES - 1, centerIndex + 8); i++) {
      if (!loadedRef.current[i]) {
        preloadFrame(i);
      }
    }
  }, [preloadFrame]);

  // Persistent requestAnimationFrame Lerp Loop
  useEffect(() => {
    const lerpFactor = prefersReducedMotion ? 1 : 0.085;

    const loop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const delta = target - current;

      if (Math.abs(delta) > 0.005) {
        currentFrameRef.current += delta * lerpFactor;
        drawFrame(Math.round(currentFrameRef.current));
      } else if (Math.abs(delta) > 0) {
        currentFrameRef.current = target;
        drawFrame(Math.round(target));
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [drawFrame, prefersReducedMotion]);

  // Bind scroll listeners (both native and Lenis)
  useEffect(() => {
    // Lenis listener
    if (lenis) {
      const handleLenisScroll = (e: { progress: number; scroll: number }) => {
        const rawProgress = typeof e.progress === 'number' ? e.progress : 0;
        const progress = Math.min(1, Math.max(0, rawProgress));
        targetFrameRef.current = progress * (TOTAL_FRAMES - 1);

        // Preload around current target
        const center = Math.round(targetFrameRef.current);
        for (let i = Math.max(0, center - 8); i <= Math.min(TOTAL_FRAMES - 1, center + 8); i++) {
          if (!loadedRef.current[i]) {
            preloadFrame(i);
          }
        }
      };

      lenis.on('scroll', handleLenisScroll);
      updateScrollProgress();

      return () => {
        lenis.off('scroll', handleLenisScroll);
      };
    }

    // Native window scroll listener fallback
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, [lenis, updateScrollProgress, preloadFrame]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      updateScrollProgress();
      drawFrame(Math.round(currentFrameRef.current));
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawFrame, updateScrollProgress]);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-700"
      style={{
        backgroundColor: isLight ? '#F4F1EC' : '#0A0C0F',
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover block"
      />
    </div>
  );
};
